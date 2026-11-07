// Atualiza scripts/taxas.json com dados oficiais. Roda todo mês no GitHub Actions
// (.github/workflows/atualizar-taxas.yml) e pode rodar à mão: node scripts/atualizar-taxas.js [--dry-run]
//
// Fontes (sem cadastro nem chave):
//   Banco Central (SGS): Selic meta 432, CDI 4389, IPCA 12 meses 13522, poupança 195
//   Banco Central (Focus): IPCA esperado para os próximos 12 meses
//   Tesouro Transparente: taxa real do Tesouro IPCA+ (mediana dos vencimentos à venda)
//   U.S. Treasury: T-bill 13 semanas · BLS: CPI-U (inflação EUA em 12 meses)
// Ficam à mão (sem fonte oficial gratuita): yields de FII/ações, poupança/CD/ETF dos EUA.
//
// Trava: se um valor sair da faixa normal ou mudar demais em relação ao mês anterior,
// nada é gravado e o script sai com código 2 (o site segue com as taxas anteriores e a calculadora mostra a data delas).
// Saída 1 = falha ao buscar uma fonte obrigatória. Saída 0 = ok (gravado ou sem mudança).

const fs = require('fs');
const path = require('path');

const ARQ = path.join(__dirname, 'taxas.json');
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Faixas aceitas e variação máxima em relação ao valor anterior (pontos percentuais)
const REGRAS = {
  selic: { min: 2, max: 30, salto: 2 },
  cdi: { min: 2, max: 30, salto: 2 },
  ipca12m: { min: -3, max: 25, salto: 3 },
  poupancaMensal: { min: 0.3, max: 1.5, salto: 0.3 },
  ipcaEsperado12m: { min: -2, max: 20, salto: 3 },
  tesouroIpcaReal: { min: 2, max: 12, salto: 2 },
  'en.tbill': { min: 0, max: 15, salto: 1.5 },
  'en.inflation': { min: -3, max: 15, salto: 3 },
};

/* ===== Funções puras (testadas em tests/atualizar-taxas.test.js) ===== */

const dataBR = s => { const [d, m, a] = s.split('/'); return `${a}-${m}-${d}`; };
const num = s => parseFloat(String(s).replace(',', '.'));
const arred = (v, c = 2) => Math.round(v * 10 ** c) / 10 ** c;
const mediana = xs => { const o = [...xs].sort((a, b) => a - b); const m = Math.floor(o.length / 2); return o.length % 2 ? o[m] : (o[m - 1] + o[m]) / 2; };

// Último valor da série SGS com data até hoje (a série da Selic meta traz datas futuras)
function ultimoSGS(lista, hojeISO) {
  const validos = lista.map(x => ({ d: dataBR(x.data), v: num(x.valor) }))
    .filter(x => x.d <= hojeISO && isFinite(x.v))
    .sort((a, b) => (a.d < b.d ? -1 : 1));
  if (!validos.length) throw new Error('série sem valores');
  return validos[validos.length - 1];
}

// Mediana da taxa de compra do Tesouro IPCA+ (sem juros semestrais) na data-base mais recente
function taxaIpcaMais(csv) {
  const linhas = csv.split(/\r?\n/).slice(1).map(l => l.split(';')).filter(c => c[0] === 'Tesouro IPCA+');
  if (!linhas.length) throw new Error('Tesouro IPCA+ não encontrado no CSV');
  const ultima = linhas.map(c => dataBR(c[2])).sort().pop();
  const taxas = linhas.filter(c => dataBR(c[2]) === ultima).map(c => num(c[3])).filter(v => v > 0);
  if (!taxas.length) throw new Error('sem taxas de compra na data mais recente');
  return { v: arred(mediana(taxas)), d: ultima };
}

// T-bill 13 semanas (coupon equivalent) da linha mais recente do CSV do Treasury
function tbill13(csv) {
  const [cab, ...linhas] = csv.trim().split(/\r?\n/);
  const cols = cab.split(',').map(c => c.replace(/"/g, ''));
  const i = cols.indexOf('13 WEEKS COUPON EQUIVALENT');
  if (i < 0) throw new Error('coluna 13 WEEKS COUPON EQUIVALENT não encontrada');
  const datas = linhas.map(l => l.split(',')).filter(c => isFinite(num(c[i])))
    .map(c => { const [m, d, a] = c[0].split('/'); return { d: `${a}-${m}-${d}`, v: num(c[i]) }; })
    .sort((a, b) => (a.d < b.d ? -1 : 1));
  if (!datas.length) throw new Error('sem dados de T-bill');
  return datas[datas.length - 1];
}

// Inflação EUA em 12 meses a partir do índice CPI-U (BLS)
function cpi12m(json) {
  const dados = json.Results.series[0].data.filter(x => /^M\d\d$/.test(x.period) && x.period !== 'M13');
  const chave = x => `${x.year}${x.period}`;
  const ult = dados.reduce((a, b) => (chave(b) > chave(a) ? b : a));
  const anoAntes = dados.find(x => x.period === ult.period && +x.year === +ult.year - 1);
  if (!anoAntes) throw new Error('CPI do ano anterior não encontrado');
  return { v: arred((num(ult.value) / num(anoAntes.value) - 1) * 100, 1), d: `${ult.year}-${ult.period.slice(1)}` };
}

const pegar = (obj, chave) => chave.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);
const pôr = (obj, chave, v) => { const ks = chave.split('.'); const ult = ks.pop(); ks.reduce((o, k) => o[k], obj)[ult] = v; };

// Confere faixas e saltos. Devolve a lista de problemas (vazia = ok).
function validar(novos, antigo) {
  const problemas = [];
  for (const [chave, v] of Object.entries(novos)) {
    const r = REGRAS[chave];
    if (!r) continue;
    if (!(typeof v === 'number' && isFinite(v))) { problemas.push(`${chave}: valor inválido (${v})`); continue; }
    if (v < r.min || v > r.max) problemas.push(`${chave}: ${v} fora da faixa ${r.min}–${r.max}`);
    const ant = pegar(antigo, chave);
    if (typeof ant === 'number' && Math.abs(v - ant) > r.salto) problemas.push(`${chave}: mudou de ${ant} para ${v} (mais de ${r.salto} p.p.)`);
  }
  return problemas;
}

function referencias(hoje) {
  return { pt: `${MESES[hoje.getUTCMonth()]} de ${hoje.getUTCFullYear()}`, en: `${MONTHS[hoje.getUTCMonth()]} ${hoje.getUTCFullYear()}` };
}

/* ===== Busca ===== */

async function buscar(url, tipo = 'json', limiteMs = 60000) {
  let erro;
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(limiteMs), headers: { 'User-Agent': 'calcularrendapassiva-taxas/1.0' } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return tipo === 'json' ? await r.json() : await r.text();
    } catch (e) { erro = e; await new Promise(res => setTimeout(res, 3000 * (i + 1))); }
  }
  throw new Error(`${url.split('?')[0]}: ${erro.message}`);
}

// Série SGS num período até hoje (a Selic meta tem datas futuras; por isso não usa "últimos N")
const fmtBR = d => d.toISOString().slice(0, 10).split('-').reverse().join('/');
const sgs = (n, dias = 45) => {
  const fim = new Date();
  const ini = new Date(fim.getTime() - dias * 864e5);
  return buscar(`https://api.bcb.gov.br/dados/serie/bcdata.sgs.${n}/dados?formato=json&dataInicial=${fmtBR(ini)}&dataFinal=${fmtBR(fim)}`);
};
const FOCUS = "https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoInflacao12Meses?$top=5&$filter=Indicador%20eq%20'IPCA'%20and%20Suavizada%20eq%20'S'%20and%20baseCalculo%20eq%200&$orderby=Data%20desc&$format=json&$select=Data,Mediana";
const TESOURO = 'https://www.tesourotransparente.gov.br/ckan/dataset/df56aa42-484a-4a59-8184-7676580c81e3/resource/796d2059-14e9-44e3-80c9-2d9e30b405c1/download/PrecoTaxaTesouroDireto.csv';
const tbillURL = ano => `https://home.treasury.gov/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/${ano}/all?type=daily_treasury_bill_rates&field_tdr_date_value=${ano}&page&_format=csv`;
const BLS = 'https://api.bls.gov/publicAPI/v1/timeseries/data/CUUR0000SA0';

async function main() {
  const seco = process.argv.includes('--dry-run');
  const hoje = new Date();
  const hojeISO = hoje.toISOString().slice(0, 10);
  const antigo = JSON.parse(fs.readFileSync(ARQ, 'utf8'));
  const novos = {};
  const datas = {};
  const avisos = [];

  // Obrigatórias: sem elas, falha (saída 1)
  const [selic, cdi, ipca, poup] = await Promise.all([sgs(432), sgs(4389), sgs(13522, 400), sgs(195)]);
  ({ v: novos.selic, d: datas.selic } = ultimoSGS(selic, hojeISO));
  ({ v: novos.cdi, d: datas.cdi } = ultimoSGS(cdi, hojeISO));
  ({ v: novos.ipca12m, d: datas.ipca } = ultimoSGS(ipca, hojeISO));
  const p = ultimoSGS(poup, hojeISO); novos.poupancaMensal = arred(p.v); datas.poupanca = p.d;

  // Opcionais: se falharem, mantém o valor anterior e avisa
  const opcional = async (nome, fn) => { try { await fn(); } catch (e) { avisos.push(`${nome}: ${e.message} — valor anterior mantido`); } };
  await opcional('Focus (IPCA esperado)', async () => {
    const j = await buscar(FOCUS);
    novos.ipcaEsperado12m = arred(mediana(j.value.map(x => x.Mediana)));
    datas.focus = j.value[0].Data;
  });
  await opcional('Tesouro IPCA+', async () => { const t = taxaIpcaMais(await buscar(TESOURO, 'text', 240000)); novos.tesouroIpcaReal = t.v; datas.tesouro = t.d; });
  await opcional('T-bill (Treasury)', async () => {
    let csv = await buscar(tbillURL(hoje.getUTCFullYear()), 'text');
    if (csv.trim().split(/\r?\n/).length < 2) csv = await buscar(tbillURL(hoje.getUTCFullYear() - 1), 'text');
    const t = tbill13(csv); novos['en.tbill'] = arred(t.v); datas.tbill = t.d;
  });
  await opcional('CPI (BLS)', async () => { const c = cpi12m(await buscar(BLS)); novos['en.inflation'] = c.v; datas.cpi = c.d; });

  const problemas = validar(novos, antigo);
  const resumo = Object.entries(novos).map(([k, v]) => `${k}: ${pegar(antigo, k)} → ${v}`).join('\n');
  console.log(resumo);
  avisos.forEach(a => console.warn('AVISO', a));
  saida({ resumo, avisos: avisos.join('\n') });

  if (problemas.length) {
    console.error('TRAVA — nada foi gravado:\n' + problemas.join('\n'));
    saida({ problemas: problemas.join('\n') });
    process.exit(2);
  }

  // Grava sempre que as buscas deram certo: mesmo sem mudança de valor, a data de confirmação
  // de cada taxa é renovada (a calculadora mostra "atualizada em" ou "pode estar desatualizada").
  const ref = referencias(hoje);
  const atual = JSON.parse(JSON.stringify(antigo));
  atual.atualizadoEm = atual.atualizadoEm || {};
  atual.en.atualizadoEm = atual.en.atualizadoEm || {};
  for (const [k, v] of Object.entries(novos)) {
    pôr(atual, k, v);
    if (k.startsWith('en.')) atual.en.atualizadoEm[k.slice(3)] = hojeISO;
    else atual.atualizadoEm[k] = hojeISO;
  }
  const valoresMudaram = Object.entries(novos).some(([k, v]) => pegar(antigo, k) !== v);
  console.log(valoresMudaram ? 'Há taxas novas.' : 'Valores iguais; só as datas de confirmação foram renovadas.');
  atual.referencia = ref.pt;
  atual.dataISO = hojeISO;
  atual.fontes = `Banco Central (Selic e CDI de ${datas.selic.split('-').reverse().join('/')}, IPCA 12 meses até ${datas.ipca.slice(5, 7)}/${datas.ipca.slice(0, 4)}, poupança série 195${datas.focus ? ', expectativa Focus' : ''})${datas.tesouro ? ', Tesouro Transparente (Tesouro IPCA+)' : ''}`;
  atual.en.referencia = ref.en;
  atual.en.fontes = `U.S. Treasury (13-week bill${datas.tbill ? `, ${datas.tbill}` : ''}), BLS CPI-U${datas.cpi ? ` (${datas.cpi})` : ''}, CNBC Select and NerdWallet (savings and CD rates, reviewed manually), BLS Consumer Expenditure Survey (household spending)`;

  if (seco) { console.log('--dry-run: não gravado'); saida({ mudou: 'false' }); return; }
  fs.writeFileSync(ARQ, JSON.stringify(atual, null, 2) + '\n', 'utf8');
  console.log(`Gravado: ${ARQ} (${ref.pt})`);
  saida({ mudou: 'true', referencia: ref.pt });
}

// Escreve saídas para o GitHub Actions (quando existir)
function saida(obj) {
  const f = process.env.GITHUB_OUTPUT;
  if (!f) return;
  for (const [k, v] of Object.entries(obj)) {
    if (v == null || v === '') continue;
    const marca = `EOF_${k}_${Date.now()}`;
    fs.appendFileSync(f, `${k}<<${marca}\n${v}\n${marca}\n`);
  }
}

if (require.main === module) {
  main().catch(e => { console.error('FALHA ao buscar fonte obrigatória:', e.message); process.exit(1); });
}

module.exports = { ultimoSGS, taxaIpcaMais, tbill13, cpi12m, validar, referencias, mediana, REGRAS };
