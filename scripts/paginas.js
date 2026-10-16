// Gera as páginas programáticas (quanto rende X / renda de X / quanto tempo),
// o hub /artigos e o bloco gerado do sitemap.xml a partir de scripts/taxas.json.
// Uso: npm run paginas  (rodar de novo sempre que atualizar as taxas)

const fs = require('fs');
const path = require('path');
const { SITE, renderArticle } = require('./template');

const ROOT = path.resolve(__dirname, '..');
const T = require('./taxas.json');

// ---------- formatação ----------
const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const brl = v => 'R$ ' + (Math.abs(v) < 100 ? nf2.format(v) : nf0.format(Math.round(v)));
const pct = (v, d = 2) => (v * 100).toFixed(d).replace('.', ',') + '%';

function rotulo(v) {
  if (v >= 1e6) {
    const m = v / 1e6;
    if (m === 1) return '1 milhão';
    if (m === 1.5) return '1,5 milhão';
    return String(m).replace('.', ',') + ' milhões';
  }
  return nf0.format(v / 1000) + ' mil';
}
function prazo(meses) {
  if (!isFinite(meses)) return 'mais de 60 anos';
  const total = Math.ceil(meses);
  const a = Math.floor(total / 12), m = total % 12;
  const pa = a ? `${a} ano${a > 1 ? 's' : ''}` : '';
  const pm = m ? `${m} ${m > 1 ? 'meses' : 'mês'}` : '';
  return [pa, pm].filter(Boolean).join(' e ') || 'menos de 1 mês';
}

// ---------- taxas ----------
const mensal = anual => Math.pow(1 + anual, 1 / 12) - 1;
const ipcaM = mensal(T.ipca12m / 100);
const ir = T.irLongoPrazo / 100;

const INV = [
  { id: 'poupanca', nome: 'Poupança', anual: Math.pow(1 + T.poupancaMensal / 100, 12) - 1, m: T.poupancaMensal / 100, ir: 0 },
  { id: 'cdb', nome: 'CDB 100% do CDI', anual: T.cdi / 100, m: mensal(T.cdi / 100), ir },
  { id: 'tesouro', nome: 'Tesouro Selic', anual: T.selic / 100, m: mensal(T.selic / 100), ir },
  { id: 'lci', nome: `LCI/LCA ${T.lciPercentCdi}% do CDI`, anual: T.cdi / 100 * T.lciPercentCdi / 100, m: mensal(T.cdi / 100 * T.lciPercentCdi / 100), ir: 0 },
  { id: 'fii', nome: 'Fundos Imobiliários (FIIs)', anual: T.fiiDividendYield / 100, m: T.fiiDividendYield / 100 / 12, ir: 0, estimativa: true },
  { id: 'acoes', nome: 'Ações de dividendos', anual: T.acoesDividendYield / 100, m: T.acoesDividendYield / 100 / 12, ir: 0, estimativa: true },
].map(i => ({ ...i, liq: i.m * (1 - i.ir) }));
const byId = Object.fromEntries(INV.map(i => [i.id, i]));

// Taxa real (acima da inflação) do CDB líquido — base dos cenários de acumulação
const realCdb = (1 + byId.cdb.liq) / (1 + ipcaM) - 1;
const realConserv = mensal(0.04);
const anualDe = m => Math.pow(1 + m, 12) - 1;

const mesesPara = (alvo, aporte, r) => Math.log(1 + alvo * r / aporte) / Math.log(1 + r);
const aportePara = (alvo, meses, r) => alvo * r / (Math.pow(1 + r, meses) - 1);

const notaTaxas = `<p><small>Taxas de referência (${T.referencia}): Selic ${pct(T.selic / 100)} a.a., CDI ${pct(T.cdi / 100)} a.a., poupança ${pct(T.poupancaMensal / 100)} a.m., IPCA 12 meses ${pct(T.ipca12m / 100)}. CDB e Tesouro com IR de ${T.irLongoPrazo}% (aplicações acima de 2 anos). FIIs e ações usam dividend yield médio estimado — não é garantia de rendimento. Fontes: ${T.fontes}.</small></p>`;

const callout = texto => `            <div class="article-callout">
              <span><strong>${texto}</strong></span>
              <a href="/">Usar a Calculadora <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>
            </div>`;

const tabela = (cab, linhas) => `            <div class="table-wrapper">
              <table>
                <thead>
                  <tr>${cab.map(c => `<th>${c}</th>`).join('')}</tr>
                </thead>
                <tbody>
${linhas.map(l => `                  <tr>${l.map(c => `<td>${c}</td>`).join('')}</tr>`).join('\n')}
                </tbody>
              </table>
            </div>`;

const metaLinha = min => `Tempo de leitura: ${min} min &middot; Atualizado em ${T.referencia}`;

// ---------- definição das séries ----------
// Páginas escritas à mão que já existem — entram nos links, mas não são geradas
const RENDE_MANUAIS = {
  50000: 'artigos/quanto-rende-50-mil-reais-por-mes',
  100000: 'artigos/quanto-rende-100-mil-reais-por-mes',
  200000: 'artigos/quanto-rende-200-mil-reais-por-mes',
  500000: 'artigos/quanto-rende-500-mil-reais-por-mes',
  1000000: 'artigos/quanto-rende-1-milhao-investido',
};
const RENDE_GERADAS = [10e3, 20e3, 30e3, 40e3, 60e3, 70e3, 80e3, 150e3, 250e3, 300e3, 400e3, 600e3, 750e3, 800e3, 1.5e6, 2e6, 3e6, 5e6, 10e6];
const slugRende = v => RENDE_MANUAIS[v] || (v < 1e6
  ? `artigos/quanto-rende-${v / 1000}-mil-reais-por-mes`
  : v === 1.5e6 ? 'artigos/quanto-rende-1-milhao-e-meio-por-mes' : `artigos/quanto-rende-${v / 1e6}-milhoes-por-mes`);

const RENDA_MANUAIS = { 2000: 'artigos/quanto-investir-para-renda-de-2-mil', 5000: 'artigos/ganhar-5-mil-por-mes' };
const RENDA_GERADAS = [1e3, 3e3, 4e3, 6e3, 7e3, 8e3, 10e3, 12e3, 15e3, 20e3, 25e3, 30e3, 40e3, 50e3, 100e3];
const slugRenda = v => RENDA_MANUAIS[v] || `artigos/quanto-investir-para-renda-de-${v / 1000}-mil`;

const TEMPO = [[200, 1e3], [300, 2e3], [500, 2e3], [500, 3e3], [1000, 2e3], [1000, 3e3], [1000, 5e3], [1500, 5e3], [2000, 5e3], [2000, 10e3], [3000, 5e3], [3000, 10e3], [5000, 10e3], [5000, 20e3], [10000, 20e3]];
const slugTempo = (a, b) => `artigos/quanto-tempo-investindo-${a}-para-renda-de-${b / 1000}-mil`;

const todosRende = [...Object.keys(RENDE_MANUAIS).map(Number), ...RENDE_GERADAS].sort((a, b) => a - b);
const todosRenda = [...Object.keys(RENDA_MANUAIS).map(Number), ...RENDA_GERADAS].sort((a, b) => a - b);

function vizinhos(lista, v, n = 2) {
  const i = lista.indexOf(v);
  return lista.slice(Math.max(0, i - n), i).concat(lista.slice(i + 1, i + 1 + n));
}

const GUIAS = {
  viver: { href: '/artigos/como-viver-de-renda-passiva', title: 'Como viver de renda passiva no Brasil' },
  regra4: { href: '/artigos/regra-dos-4-por-cento-na-renda-passiva', title: 'A regra dos 4% na renda passiva' },
  cdbTesouro: { href: '/artigos/cdb-ou-tesouro-direto', title: 'CDB ou Tesouro Direto: qual rende mais?' },
  fiis: { href: '/artigos/fiis-vs-dividendos', title: 'FIIs ou ações de dividendos?' },
  juros: { href: '/artigos/como-calcular-juros-compostos', title: 'Como calcular juros compostos' },
  aporte1000: { href: '/artigos/investir-1000-por-mes', title: 'Quanto rende investir R$ 1.000 por mês' },
};

// ---------- página: quanto rende X por mês ----------
function paginaRende(v) {
  const L = rotulo(v);
  const linhas = INV.map(i => [i.nome + (i.estimativa ? '*' : ''), pct(i.anual) + ' a.a.', brl(v * i.m), brl(v * i.liq)]);
  const liqs = INV.map(i => v * i.liq);
  const min = Math.min(...liqs), max = Math.max(...liqs);
  const melhorFixa = [byId.cdb, byId.tesouro, byId.lci, byId.poupanca].sort((a, b) => b.liq - a.liq)[0];
  const realMes = v * realCdb;
  const viver = byId.lci.liq * v;
  const avaliacao = viver < 1500
    ? `ainda não é suficiente para viver só de renda, mas já funciona como um <strong>complemento de renda</strong> — e, mais importante, como base para continuar acumulando`
    : viver < 5000
      ? `já cobre o <strong>custo de vida básico</strong> de muitas famílias, principalmente fora das capitais — é uma independência financeira parcial ou total, dependendo do seu padrão de vida`
      : `representa uma <strong>independência financeira confortável</strong> para a maioria dos brasileiros, com margem para reinvestir parte dos rendimentos e proteger o patrimônio da inflação`;

  const aportes = [500, 1000, 2000, 5000].filter(a => a * 12 < v * 2 || a === 5000);
  const tempoLinhas = aportes.map(a => [brl(a) + '/mês', prazo(mesesPara(v, a, realCdb)), prazo(mesesPara(v, a, realConserv))]);

  const faq = [
    { q: `Quanto rende R$ ${L} na poupança por mês?`, a: `Com a poupança rendendo ${pct(T.poupancaMensal / 100)} ao mês, R$ ${L} rendem cerca de ${brl(v * byId.poupanca.m)} por mês, isentos de Imposto de Renda.` },
    { q: `Quanto rende R$ ${L} no CDB por mês?`, a: `Em um CDB que paga 100% do CDI (${pct(T.cdi / 100)} a.a.), R$ ${L} rendem ${brl(v * byId.cdb.m)} brutos por mês, ou cerca de ${brl(v * byId.cdb.liq)} líquidos após IR de ${T.irLongoPrazo}%.` },
    { q: `Qual o melhor investimento para R$ ${L} render mais por mês?`, a: `Na renda fixa, a ${melhorFixa.nome} entrega o maior rendimento líquido hoje: ${brl(v * melhorFixa.liq)}/mês. Na renda variável, FIIs pagariam cerca de ${brl(v * byId.fii.liq)}/mês estimados, ${byId.fii.liq > melhorFixa.liq ? 'mais que a renda fixa' : 'menos que a renda fixa com a Selic alta'}, e com oscilação de preço e de dividendos — em troca, têm potencial de valorização quando os juros caem.` },
    { q: `Dá para viver de renda com R$ ${L}?`, a: `Depende do seu custo de vida. Com rendimento líquido entre ${brl(min)} e ${brl(max)} por mês, R$ ${L} ${viver < 1500 ? 'funcionam melhor como complemento de renda' : viver < 5000 ? 'podem cobrir um custo de vida básico' : 'permitem viver de renda com conforto'}. Para manter o poder de compra, o ideal é gastar só o rendimento acima da inflação: cerca de ${brl(realMes)}/mês.` },
  ];

  const rel = vizinhos(todosRende, v, 3).map(x => ({ href: '/' + slugRende(x), title: `Quanto rende R$ ${rotulo(x)} por mês` }));
  rel.push(GUIAS.cdbTesouro, GUIAS.viver);

  const body = `            <p>Quer saber <strong>quanto rende R$ ${L} por mês</strong>? Com as taxas de ${T.referencia}, R$ ${L} investidos geram entre <strong>${brl(min)} e ${brl(max)} por mês</strong> líquidos, dependendo do investimento. Veja a simulação completa abaixo — e use a calculadora para testar com seus próprios números.</p>

            <h2>Resumo: Quanto Rende R$ ${L} por Mês</h2>
${tabela(['Investimento', 'Taxa', 'Bruto/mês', 'Líquido/mês'], linhas)}
            ${notaTaxas}

${callout(`Simule quanto R$ ${L} rendem com o seu prazo e seus aportes.`)}

            <h2>R$ ${L} na Poupança</h2>
            <p>A poupança é isenta de IR e rende ${pct(T.poupancaMensal / 100)} ao mês com a Selic acima de 8,5% a.a. (0,5% + TR):</p>
            <p><code>R$ ${nf0.format(v)} × ${pct(T.poupancaMensal / 100)} = ${brl(v * byId.poupanca.m)}/mês</code></p>
            <p>É o menor rendimento da lista. A mesma quantia em uma LCI/LCA, também isenta, renderia ${brl(v * byId.lci.liq - v * byId.poupanca.m)} a mais todo mês.</p>

            <h2>R$ ${L} no CDB ou Tesouro Selic</h2>
            <p>Com o CDI em ${pct(T.cdi / 100)} ao ano, um CDB 100% do CDI rende cerca de <strong>${brl(v * byId.cdb.m)} brutos por mês</strong>. Descontando o IR de ${T.irLongoPrazo}% (aplicações acima de 2 anos), sobram <strong>${brl(v * byId.cdb.liq)} líquidos</strong>.</p>
            <p>O Tesouro Selic rende praticamente o mesmo (${brl(v * byId.tesouro.liq)} líquidos/mês), com a garantia do Tesouro Nacional e liquidez diária. CDBs que pagam acima de 100% do CDI podem render mais — veja o <a href="/artigos/cdb-ou-tesouro-direto">comparativo CDB ou Tesouro Direto</a>.</p>

            <h2>R$ ${L} em LCI/LCA</h2>
            <p>As LCIs e LCAs são isentas de IR para pessoa física. Pagando ${T.lciPercentCdi}% do CDI:</p>
            <p><code>R$ ${nf0.format(v)} × ${pct(byId.lci.m, 3)} = ${brl(v * byId.lci.liq)}/mês líquidos</code></p>
            <p>${byId.lci.liq > byId.cdb.liq ? 'Por causa da isenção, a LCI/LCA rende mais que o CDB 100% do CDI depois do imposto.' : 'Mesmo com a isenção, o CDB 100% do CDI ainda rende um pouco mais depois do imposto nesse cenário.'} Fique atento à carência mínima (normalmente 9 a 12 meses).</p>

            <h2>R$ ${L} em Fundos Imobiliários</h2>
            <p>Com um dividend yield médio de ${pct(T.fiiDividendYield / 100, 0)} ao ano, R$ ${L} em FIIs pagariam cerca de <strong>${brl(v * byId.fii.liq)} por mês</strong> em rendimentos isentos de IR. A vantagem é a renda mensal; a desvantagem é que as cotas oscilam e os dividendos não são garantidos. Compare em <a href="/artigos/fiis-vs-dividendos">FIIs vs ações de dividendos</a>.</p>

            <h2>Quanto Sobra Descontando a Inflação</h2>
            <p>Com a inflação em ${pct(T.ipca12m / 100)} em 12 meses, parte do rendimento só repõe o poder de compra do seu dinheiro. Para não ver o patrimônio encolher em termos reais, o valor que você pode gastar todo mês é cerca de <strong>${brl(realMes)}</strong> (rendimento real do CDB líquido, ${pct(anualDe(realCdb))} a.a. acima do IPCA). O resto deve ser reinvestido.</p>

            <h2>Dá para Viver com R$ ${L} Investidos?</h2>
            <p>Uma renda de ${brl(min)} a ${brl(max)} por mês ${avaliacao}. Veja o <a href="/artigos/como-viver-de-renda-passiva">guia de como viver de renda passiva</a> e a <a href="/artigos/regra-dos-4-por-cento-na-renda-passiva">regra dos 4%</a> para definir sua meta.</p>

            <h2>Quanto Tempo para Juntar R$ ${L}</h2>
            <p>Quanto tempo leva para acumular R$ ${L} investindo todo mês (valores em poder de compra de hoje):</p>
${tabela(['Aporte', 'CDB líquido (' + pct(anualDe(realCdb), 1) + ' real)', 'Conservador (4% real)'], tempoLinhas)}`;

  return {
    slug: slugRende(v),
    title: `Quanto Rende R$ ${L} por Mês? Poupança, CDB, LCI e FII [${T.referencia.split(' ').pop()}]`,
    description: `R$ ${L} rendem entre ${brl(min)} e ${brl(max)} por mês. Simulação atualizada (${T.referencia}) na poupança, CDB, Tesouro Selic, LCI/LCA e FIIs — com e sem IR.`,
    h1: `Quanto Rende R$ ${L} por Mês?`,
    breadcrumb: `Quanto Rende ${L} por Mês`,
    meta: metaLinha(6),
    body, faq, related: rel,
    cta: `Descubra quanto tempo falta para você chegar a R$ ${L}.`,
    grupo: 'rende', valor: v,
  };
}

// ---------- página: quanto investir para renda de X ----------
function paginaRenda(v) {
  const L = rotulo(v);
  const linhas = INV.map(i => [i.nome + (i.estimativa ? '*' : ''), brl(v / i.liq)]);
  const necess = INV.map(i => v / i.liq);
  const menor = Math.min(...necess), maior = Math.max(...necess);
  const pReal = v / realCdb;
  const p4 = v * 12 / 0.04;
  const prazos = [10, 15, 20, 25, 30];
  const aporteLinhas = prazos.map(a => [`${a} anos`, brl(aportePara(pReal, a * 12, realCdb)), brl(aportePara(p4, a * 12, realConserv))]);

  const faq = [
    { q: `Quanto preciso investir para ter R$ ${L} por mês?`, a: `Com as taxas de ${T.referencia}, você precisa de ${brl(v / byId.lci.liq)} em LCI/LCA, ${brl(v / byId.cdb.liq)} em CDB 100% do CDI ou ${brl(v / byId.poupanca.liq)} na poupança. Para manter o poder de compra no longo prazo, o recomendado é ${brl(pReal)} ou mais.` },
    { q: `Quanto investir por mês para ter renda de R$ ${L}?`, a: `Em 20 anos, investindo com rendimento real de ${pct(anualDe(realCdb), 1)} ao ano, o aporte necessário é de cerca de ${brl(aportePara(pReal, 240, realCdb))} por mês. Em 30 anos, cai para ${brl(aportePara(pReal, 360, realCdb))}.` },
    { q: `Pela regra dos 4%, quanto preciso para R$ ${L} por mês?`, a: `Pela regra dos 4%, o patrimônio necessário é R$ ${nf0.format(v)} × 12 ÷ 0,04 = ${brl(p4)}. É a meta mais conservadora, pensada para durar décadas mesmo em cenários ruins.` },
  ];

  const rel = vizinhos(todosRenda, v, 3).map(x => ({ href: '/' + slugRenda(x), title: `Quanto investir para ter renda de R$ ${rotulo(x)} por mês` }));
  rel.push(GUIAS.regra4, GUIAS.viver);

  const body = `            <p>Para ter <strong>R$ ${L} por mês de renda passiva</strong>, você precisa de um patrimônio entre <strong>${brl(menor)} e ${brl(maior)}</strong>, dependendo de onde investir. Abaixo está a conta para cada investimento, a meta que preserva o poder de compra e quanto aportar por mês para chegar lá.</p>

            <h2>Patrimônio Necessário para R$ ${L}/mês</h2>
${tabela(['Investimento', 'Patrimônio necessário'], linhas)}
            ${notaTaxas}

${callout(`Calcule em quanto tempo VOCÊ chega a R$ ${L} por mês.`)}

            <h2>Como a Conta é Feita</h2>
            <p>O patrimônio necessário é a renda desejada dividida pela taxa mensal líquida do investimento:</p>
            <p><code>Patrimônio = R$ ${nf0.format(v)} ÷ taxa mensal líquida</code></p>
            <p>Na LCI/LCA (${pct(byId.lci.liq, 3)} ao mês, isenta de IR): <code>R$ ${nf0.format(v)} ÷ ${pct(byId.lci.liq, 3)} = ${brl(v / byId.lci.liq)}</code>. Já na poupança, que rende menos, a meta sobe para ${brl(v / byId.poupanca.liq)}.</p>

            <h2>A Meta que Protege da Inflação</h2>
            <p>Viver de todo o rendimento nominal tem um problema: a inflação (${pct(T.ipca12m / 100)} em 12 meses) corrói o patrimônio, e em 10 ou 20 anos os R$ ${L} compram bem menos. Para gastar R$ ${L} por mês <strong>e manter o poder de compra</strong>, use só o rendimento real (${pct(anualDe(realCdb), 1)} a.a. acima do IPCA no CDB líquido):</p>
            <p><code>R$ ${nf0.format(v)} ÷ ${pct(realCdb, 3)} = ${brl(pReal)}</code></p>
            <p>Na versão mais conservadora, a <a href="/artigos/regra-dos-4-por-cento-na-renda-passiva">regra dos 4%</a>, a meta seria <strong>${brl(p4)}</strong>.</p>

            <h2>Quanto Investir por Mês para Chegar Lá</h2>
            <p>Aporte mensal necessário, em valores de hoje, conforme o prazo:</p>
${tabela(['Prazo', `Meta ${brl(pReal)} (${pct(anualDe(realCdb), 1)} real)`, `Regra dos 4% (4% real)`], aporteLinhas)}
            <p>Quanto antes você começa, menor o esforço mensal — é o efeito dos <a href="/artigos/como-calcular-juros-compostos">juros compostos</a>.</p>

            <h2>Onde Investir para Gerar R$ ${L} por Mês</h2>
            <ul>
              <li><strong>Reserva e liquidez:</strong> Tesouro Selic ou CDB com liquidez diária — ${brl(v / byId.tesouro.liq)} geram R$ ${L}/mês líquidos.</li>
              <li><strong>Renda fixa isenta:</strong> LCI/LCA — a menor meta da renda fixa (${brl(v / byId.lci.liq)}).</li>
              <li><strong>Renda mensal isenta:</strong> FIIs — cerca de ${brl(v / byId.fii.liq)} com dividend yield de ${pct(T.fiiDividendYield / 100, 0)} a.a., com mais risco.</li>
            </ul>
            <p>Uma carteira diversificada entre essas classes reduz o risco sem aumentar muito a meta.</p>`;

  return {
    slug: slugRenda(v),
    title: `Quanto Investir para Ter Renda de R$ ${L} por Mês? [${T.referencia.split(' ').pop()}]`,
    description: `Para ter R$ ${L}/mês de renda passiva você precisa de ${brl(menor)} a ${brl(maior)}. Veja a conta na poupança, CDB, LCI/LCA e FIIs e quanto aportar por mês.`,
    h1: `Quanto Investir para Ter Renda de R$ ${L} por Mês`,
    breadcrumb: `Renda de ${L} por Mês`,
    meta: metaLinha(6),
    body, faq, related: rel,
    cta: `Simule quanto tempo falta para sua renda de R$ ${L}.`,
    grupo: 'renda', valor: v,
  };
}

// ---------- página: quanto tempo investindo A para renda de B ----------
function paginaTempo([a, b]) {
  const A = nf0.format(a), B = rotulo(b);
  const pReal = b / realCdb;
  const pConserv = b * 12 / 0.04;
  const n = mesesPara(pReal, a, realCdb);
  const variacoes = [a, Math.round(a * 1.5), a * 2, a * 3].map(x => [brl(x) + '/mês', prazo(mesesPara(pReal, x, realCdb)), prazo(mesesPara(pConserv, x, realConserv))]);
  const totalAportado = a * Math.ceil(n);

  const faq = [
    { q: `Quanto tempo investindo R$ ${A} por mês para ter R$ ${B} de renda?`, a: `Cerca de ${prazo(n)}, investindo em renda fixa com rendimento real de ${pct(anualDe(realCdb), 1)} ao ano até acumular ${brl(pReal)} (valores de hoje).` },
    { q: `Como chegar mais rápido à renda de R$ ${B}?`, a: `Aumentando o aporte. Com ${brl(a * 2)} por mês, o prazo cai para ${prazo(mesesPara(pReal, a * 2, realCdb))}. Reinvestir todos os rendimentos e aumentar o aporte a cada aumento de salário também acelera muito.` },
    { q: `Quanto vou ter investido do próprio bolso?`, a: `Cerca de ${brl(totalAportado)} em aportes. O restante, ${brl(Math.max(0, pReal - totalAportado))}, vem dos juros compostos.` },
  ];

  const rel = TEMPO.filter(([x, y]) => (x !== a || y !== b) && (x === a || y === b)).slice(0, 4)
    .map(([x, y]) => ({ href: '/' + slugTempo(x, y), title: `Quanto tempo investindo R$ ${nf0.format(x)}/mês para renda de R$ ${rotulo(y)}` }));
  rel.push({ href: '/' + slugRenda(b), title: `Quanto investir para ter renda de R$ ${B} por mês` }, GUIAS.juros);

  const body = `            <p>Investindo <strong>R$ ${A} por mês</strong>, você leva cerca de <strong>${prazo(n)}</strong> para ter uma renda passiva de <strong>R$ ${B} por mês</strong> — já descontada a inflação, ou seja, R$ ${B} com o poder de compra de hoje. Veja a conta e como encurtar esse prazo.</p>

            <h2>A Meta: Quanto Acumular para R$ ${B}/mês</h2>
            <p>Para gastar R$ ${B} todo mês sem corroer o patrimônio, a renda precisa vir só do rendimento <strong>acima da inflação</strong>. Com o CDB 100% do CDI líquido de IR rendendo ${pct(anualDe(realCdb), 1)} a.a. acima do IPCA (${T.referencia}):</p>
            <p><code>Meta = R$ ${nf0.format(b)} ÷ ${pct(realCdb, 3)} ao mês = ${brl(pReal)}</code></p>
            ${notaTaxas}

${callout('Simule com o seu aporte, seu prazo e sua taxa.')}

            <h2>Quanto Tempo Leva com R$ ${A} por Mês</h2>
            <p>Aplicando R$ ${A} todo mês e reinvestindo os rendimentos, o patrimônio chega a ${brl(pReal)} em <strong>${prazo(n)}</strong>. Desse total, ${brl(totalAportado)} saem do seu bolso e ${brl(Math.max(0, pReal - totalAportado))} vêm dos <a href="/artigos/como-calcular-juros-compostos">juros compostos</a>.</p>

            <h2>E se Eu Investir Mais por Mês?</h2>
${tabela(['Aporte', `Meta ${brl(pReal)} (${pct(anualDe(realCdb), 1)} real)`, `Regra dos 4%: ${brl(pConserv)}`], variacoes)}
            <p>A coluna da <a href="/artigos/regra-dos-4-por-cento-na-renda-passiva">regra dos 4%</a> é o cenário conservador: meta maior e rendimento real menor, pensado para quem quer segurança máxima.</p>

            <h2>Como Acelerar</h2>
            <ul>
              <li><strong>Aumente o aporte a cada reajuste de salário</strong> — mesmo 10% a mais por ano corta anos do prazo.</li>
              <li><strong>Prefira investimentos isentos</strong> como LCI/LCA e FIIs quando renderem mais que o CDB líquido.</li>
              <li><strong>Não resgate os rendimentos</strong> durante a fase de acumulação.</li>
              <li><strong>Revise a meta todo ano</strong> — com a calculadora, leva menos de um minuto.</li>
            </ul>`;

  return {
    slug: slugTempo(a, b),
    title: `Quanto Tempo Investindo R$ ${A} por Mês para Ter Renda de R$ ${B}?`,
    description: `Investindo R$ ${A}/mês você chega a R$ ${B} de renda passiva em cerca de ${prazo(n)}. Veja a conta com inflação, IR e como chegar mais rápido.`,
    h1: `Quanto Tempo Investindo R$ ${A}/Mês para Ter Renda de R$ ${B}`,
    breadcrumb: `R$ ${A}/mês para Renda de ${B}`,
    meta: metaLinha(5),
    body, faq, related: rel,
    cta: `Simule seu próprio plano até a renda de R$ ${B}.`,
    grupo: 'tempo', valor: b * 1e6 + a,
  };
}

// ---------- página: quanto rende X na poupança ----------
// Consultas do Search Console (out/2026): "quanto rende 500 mil na poupança", "200 mil na poupança rende quanto por mês"…
const POUPANCA = [100e3, 200e3, 300e3, 500e3, 1e6];
const slugPoup = v => `artigos/quanto-rende-${v >= 1e6 ? '1-milhao' : v / 1000 + '-mil'}-na-poupanca`;

function paginaPoupanca(v) {
  const L = rotulo(v);
  const p = byId.poupanca, lci = byId.lci, cdb = byId.cdb;
  const mes = v * p.m;
  const perdaAno = v * (Math.pow(1 + lci.liq, 12) - Math.pow(1 + p.m, 12));
  const meses = [1, 6, 12, 24, 60];
  const linhas = meses.map(n => [n === 1 ? '1 mês' : n < 12 ? `${n} meses` : `${n / 12} ano${n > 12 ? 's' : ''}`,
    brl(v * (Math.pow(1 + p.m, n) - 1)), brl(v * (Math.pow(1 + lci.liq, n) - 1)), brl(v * (Math.pow(1 + cdb.liq, n) - 1))]);
  const realPoup = (1 + p.m) / (1 + ipcaM) - 1;

  const faq = [
    { q: `Quanto rende R$ ${L} na poupança por mês?`, a: `Com a poupança rendendo ${pct(p.m)} ao mês (${T.referencia}), R$ ${L} rendem cerca de ${brl(mes)} por mês, isentos de Imposto de Renda.` },
    { q: `Quanto rende R$ ${L} na poupança por ano?`, a: `Em 12 meses, com os rendimentos reinvestidos, R$ ${L} rendem cerca de ${brl(v * (Math.pow(1 + p.m, 12) - 1))} na poupança.` },
    { q: `Vale a pena deixar R$ ${L} na poupança?`, a: `Para reserva de emergência, a poupança funciona, mas rende menos que as alternativas seguras. Uma LCI/LCA de ${T.lciPercentCdi}% do CDI, também isenta de IR, renderia cerca de ${brl(perdaAno)} a mais em um ano, e o Tesouro Selic tem liquidez diária com rendimento maior.` },
    { q: `A poupança perde para a inflação?`, a: `Com o IPCA em ${pct(T.ipca12m / 100)} em 12 meses, o ganho real da poupança é de cerca de ${pct(anualDe(realPoup))} ao ano — ${realPoup > 0 ? 'positivo, mas pequeno' : 'negativo, ou seja, o dinheiro perde poder de compra'}.` },
  ];

  const rel = POUPANCA.filter(x => x !== v).slice(0, 3).map(x => ({ href: '/' + slugPoup(x), title: `Quanto rende R$ ${rotulo(x)} na poupança` }));
  rel.push({ href: '/' + slugRende(v), title: `Quanto rende R$ ${L} por mês em todos os investimentos` });
  if (ONDE.includes(v)) rel.push({ href: '/' + slugOnde(v), title: `Onde investir R$ ${L}` });
  rel.push(GUIAS.cdbTesouro);

  const body = `            <p><strong>R$ ${L} na poupança rendem cerca de ${brl(mes)} por mês</strong> com as taxas de ${T.referencia} — isentos de Imposto de Renda. Em um ano, com os rendimentos reinvestidos, são ${brl(v * (Math.pow(1 + p.m, 12) - 1))}. Veja a conta, a comparação com LCI/LCA e CDB e quanto você deixa na mesa mantendo o dinheiro parado na poupança.</p>

            <h2>A Conta: R$ ${L} × ${pct(p.m)} ao Mês</h2>
            <p>Com a Selic em ${pct(T.selic / 100)} (acima de 8,5% a.a.), a poupança rende 0,5% ao mês + TR, o que hoje dá cerca de ${pct(p.m)} ao mês:</p>
            <p><code>R$ ${nf0.format(v)} × ${pct(p.m)} = ${brl(mes)}/mês</code></p>
            ${notaTaxas}

${callout(`Simule R$ ${L} com aportes mensais e veja o resultado em anos.`)}

            <h2>Poupança x LCI/LCA x CDB com R$ ${L}</h2>
            <p>Rendimento acumulado (líquido de IR) com os juros reinvestidos:</p>
${tabela(['Prazo', 'Poupança', `LCI/LCA ${T.lciPercentCdi}% CDI`, 'CDB 100% CDI'], linhas)}
            <p>Só no primeiro ano, trocar a poupança por uma LCI/LCA renderia cerca de <strong>${brl(perdaAno)} a mais</strong> — com a mesma isenção de IR e a mesma garantia do FGC${v > 250000 ? ' (até R$ 250 mil por instituição: com R$ ' + L + ', divida entre bancos diferentes)' : ''}.</p>

            <h2>Quando a Poupança Ainda Faz Sentido</h2>
            <ul>
              <li><strong>Dinheiro que você pode precisar a qualquer momento</strong> — mas o Tesouro Selic e CDBs com liquidez diária rendem mais e também podem ser resgatados no mesmo dia.</li>
              <li><strong>Valores pequenos</strong> — para quantias como R$ ${L}, a diferença para outras opções já é grande demais para ignorar.</li>
              <li><strong>Aniversário mensal</strong> — atenção: na poupança, quem resgata antes do aniversário perde o rendimento do mês.</li>
            </ul>

            <h2>R$ ${L} na Poupança Dá para Viver de Renda?</h2>
            <p>${brl(mes)} por mês ${mes < 1500 ? 'funcionam como complemento de renda, não como renda principal' : mes < 5000 ? 'podem cobrir um custo de vida básico' : 'já garantem uma boa renda mensal'}. Mas, descontada a inflação (${pct(T.ipca12m / 100)}), o ganho real é de só ${brl(v * Math.max(0, realPoup))} por mês — gastar tudo o que a poupança rende faz o patrimônio encolher ano a ano. Veja o <a href="/artigos/como-viver-de-renda-passiva">guia para viver de renda passiva</a>.</p>`;

  return {
    slug: slugPoup(v),
    title: `Quanto Rende R$ ${L} na Poupança por Mês? [${T.referencia.split(' ').pop()}]`,
    description: `R$ ${L} na poupança rendem cerca de ${brl(mes)} por mês (${T.referencia}). Veja o rendimento em 1, 6 e 12 meses e quanto você ganharia a mais em LCI/LCA e CDB.`,
    h1: `Quanto Rende R$ ${L} na Poupança por Mês?`,
    breadcrumb: `${L} na Poupança`,
    meta: metaLinha(5),
    body, faq, related: rel,
    cta: `Compare a poupança com outras opções para os seus R$ ${L}.`,
  };
}

// ---------- página: onde investir X ----------
// Consultas: "onde investir 200 mil", "investir 200 mil", "investimento de 200 mil", "como investir 200 mil"
const ONDE = [100e3, 200e3, 500e3, 1e6];
const slugOnde = v => `artigos/onde-investir-${v >= 1e6 ? '1-milhao' : v / 1000 + '-mil'}`;

function paginaOnde(v) {
  const L = rotulo(v);
  const reserva = Math.min(v * 0.2, 60000);
  const carteiras = [
    { nome: 'Conservadora', aloc: [['Tesouro Selic / CDB liquidez diária', 0.3, byId.tesouro], [`LCI/LCA ${T.lciPercentCdi}% CDI`, 0.4, byId.lci], ['CDB 100% CDI (2+ anos)', 0.3, byId.cdb]] },
    { nome: 'Moderada', aloc: [['Tesouro Selic / CDB liquidez diária', 0.2, byId.tesouro], [`LCI/LCA ${T.lciPercentCdi}% CDI`, 0.4, byId.lci], ['Fundos Imobiliários (FIIs)', 0.25, byId.fii], ['Ações de dividendos', 0.15, byId.acoes]] },
    { nome: 'Renda mensal', aloc: [['Tesouro Selic / CDB liquidez diária', 0.15, byId.tesouro], [`LCI/LCA ${T.lciPercentCdi}% CDI`, 0.35, byId.lci], ['Fundos Imobiliários (FIIs)', 0.5, byId.fii]] },
  ];
  const resumo = carteiras.map(c => {
    const renda = c.aloc.reduce((s, [, peso, inv]) => s + v * peso * inv.liq, 0);
    return [c.nome, c.aloc.map(([n, peso]) => `${Math.round(peso * 100)}% ${n}`).join('<br>'), brl(renda)];
  });
  const opcoes = [byId.tesouro, byId.cdb, byId.lci, byId.poupanca, byId.fii, byId.acoes]
    .map(i => [i.nome + (i.estimativa ? '*' : ''), pct(i.anual) + ' a.a.', brl(v * i.liq)]);

  const faq = [
    { q: `Onde investir R$ ${L} com segurança?`, a: `Tesouro Selic (garantia do Tesouro Nacional), CDBs e LCI/LCA de bancos sólidos (garantia do FGC até R$ 250 mil por CPF e instituição). Com as taxas de ${T.referencia}, uma LCI/LCA de ${T.lciPercentCdi}% do CDI renderia cerca de ${brl(v * byId.lci.liq)} por mês, isentos de IR.` },
    { q: `Quanto rende R$ ${L} investidos?`, a: `Entre ${brl(v * byId.poupanca.m)} (poupança) e ${brl(v * Math.max(byId.lci.liq, byId.cdb.liq))} por mês líquidos na renda fixa. Veja a <a href="/${slugRende(v)}">simulação completa de quanto rende R$ ${L}</a>.` },
    { q: `Devo deixar R$ ${L} na poupança?`, a: `Não é a melhor opção: a poupança rende ${brl(v * byId.poupanca.m)} por mês, enquanto a LCI/LCA, também isenta, renderia ${brl(v * byId.lci.liq)}.` },
    ...(v > 250000 ? [{ q: `Como fica a garantia do FGC com R$ ${L}?`, a: `O FGC cobre até R$ 250 mil por CPF em cada instituição (limite global de R$ 1 milhão a cada 4 anos). Com R$ ${L}, distribua CDBs e LCI/LCA entre ${Math.ceil(v / 250000)} ou mais bancos, ou use o Tesouro Direto, que não depende do FGC.` }] : []),
  ];

  const rel = ONDE.filter(x => x !== v).slice(0, 3).map(x => ({ href: '/' + slugOnde(x), title: `Onde investir R$ ${rotulo(x)}` }));
  rel.push({ href: '/' + slugRende(v), title: `Quanto rende R$ ${L} por mês` });
  if (POUPANCA.includes(v)) rel.push({ href: '/' + slugPoup(v), title: `Quanto rende R$ ${L} na poupança` });
  rel.push(GUIAS.fiis, GUIAS.cdbTesouro);

  const body = `            <p>Tem <strong>R$ ${L} para investir</strong> e não sabe por onde começar? Com a Selic em ${pct(T.selic / 100)} (${T.referencia}), dá para colocar esse dinheiro para render com segurança e gerar <strong>de ${brl(v * byId.poupanca.m)} a ${brl(v * Math.max(byId.lci.liq, byId.cdb.liq))} por mês</strong> só na renda fixa. Veja as opções, três carteiras de exemplo e os cuidados antes de aplicar.</p>
            <p><small>Conteúdo educativo, não é recomendação de investimento. Avalie seu perfil e seus objetivos — se precisar, procure um profissional certificado.</small></p>

            <h2>1. Antes de Tudo: a Reserva de Emergência</h2>
            <p>Separe de 6 a 12 meses do seu custo de vida em um investimento com <strong>liquidez diária</strong> — Tesouro Selic ou CDB que pague pelo menos 100% do CDI. Para a maioria das pessoas, algo como ${brl(reserva)} dos R$ ${L}. Esse dinheiro não é para render mais: é para você nunca precisar resgatar o resto na hora errada.</p>

            <h2>2. Quanto Rende R$ ${L} em Cada Opção</h2>
${tabela(['Investimento', 'Taxa', 'Líquido/mês'], opcoes)}
            ${notaTaxas}

${callout(`Simule R$ ${L} com o seu prazo e veja quanto acumula.`)}

            <h2>3. Três Carteiras de Exemplo para R$ ${L}</h2>
${tabela(['Perfil', 'Distribuição', 'Renda estimada/mês'], resumo)}
            <p>A carteira <strong>conservadora</strong> fica só na renda fixa e protege o capital. A <strong>moderada</strong> adiciona FIIs e ações de dividendos para buscar valorização no longo prazo. A de <strong>renda mensal</strong> prioriza FIIs, que pagam rendimentos todo mês isentos de IR — com mais oscilação.</p>

            <h2>4. Cuidados Importantes</h2>
            <ul>
              <li><strong>FGC:</strong> cobre até R$ 250 mil por CPF em cada instituição.${v > 250000 ? ` Com R$ ${L}, divida entre pelo menos ${Math.ceil(v / 250000)} bancos.` : ''}</li>
              <li><strong>Imposto de Renda:</strong> CDB e Tesouro pagam de 22,5% a 15% de IR (menor quanto mais tempo); LCI, LCA, poupança e rendimentos de FIIs são isentos para pessoa física.</li>
              <li><strong>Carência:</strong> LCI/LCA costumam ter carência de 9 a 12 meses — não use para a reserva.</li>
              <li><strong>Desconfie de promessas:</strong> rendimento garantido muito acima do CDI é sinal de risco alto ou golpe.</li>
            </ul>

            <h2>5. E se o Objetivo é Viver de Renda?</h2>
            <p>Para não corroer o patrimônio, gaste só o rendimento acima da inflação: com R$ ${L}, cerca de <strong>${brl(v * realCdb)} por mês</strong>. Veja <a href="/artigos/como-viver-de-renda-passiva">como viver de renda passiva</a> e a <a href="/artigos/regra-dos-4-por-cento-na-renda-passiva">regra dos 4%</a>.</p>`;

  return {
    slug: slugOnde(v),
    title: `Onde Investir R$ ${L}? Opções Seguras e Quanto Rende [${T.referencia.split(' ').pop()}]`,
    description: `Onde investir R$ ${L} em ${T.referencia.split(' ').pop()}: reserva de emergência, Tesouro, CDB, LCI/LCA e FIIs, três carteiras de exemplo e quanto cada uma rende por mês.`,
    h1: `Onde Investir R$ ${L}?`,
    breadcrumb: `Onde Investir ${L}`,
    meta: metaLinha(7),
    body, faq, related: rel,
    cta: `Simule quanto seus R$ ${L} podem render.`,
  };
}

// ---------- página: calculadora de independência financeira ----------
// Consultas: "calculadora independencia financeira", "calculadora liberdade financeira", "calculadora viver de renda"
function paginaIndependencia() {
  const custos = [3e3, 5e3, 8e3, 10e3, 15e3, 20e3];
  const linhas = custos.map(c => [brl(c), brl(c / realCdb), brl(c * 12 / 0.04)]);
  const aportes = [1000, 2000, 3000, 5000].map(a => [brl(a) + '/mês', prazo(mesesPara(5000 / realCdb, a, realCdb)), prazo(mesesPara(5000 * 12 / 0.04, a, realConserv))]);

  const faq = [
    { q: 'Como calcular a independência financeira?', a: `Divida o custo de vida mensal pelo rendimento real mensal dos seus investimentos. Com o CDB líquido rendendo ${pct(anualDe(realCdb), 1)} ao ano acima da inflação (${T.referencia}), quem gasta R$ 5.000 por mês precisa de ${brl(5000 / realCdb)}. Pela regra dos 4%, mais conservadora, ${brl(5000 * 12 / 0.04)}.` },
    { q: 'Qual a diferença entre independência e liberdade financeira?', a: 'Na prática, são a mesma coisa: ter patrimônio suficiente para que a renda dos investimentos pague o seu custo de vida, sem depender do salário.' },
    { q: 'Quanto tempo leva para ficar independente financeiramente?', a: `Depende do aporte. Para viver com R$ 5.000 por mês, investindo R$ 2.000 mensais, são cerca de ${prazo(mesesPara(5000 / realCdb, 2000, realCdb))}; com R$ 5.000 mensais, ${prazo(mesesPara(5000 / realCdb, 5000, realCdb))}.` },
  ];

  const body = `            <p>A <strong>independência financeira</strong> chega quando a renda dos seus investimentos paga o seu custo de vida. O número é simples de calcular — e a <a href="/">Calculadora Renda Passiva</a> faz a conta completa, com aportes, prazo e taxa. Abaixo, a fórmula, uma tabela pronta por custo de vida e quanto tempo leva para chegar lá.</p>

            <h2>A Fórmula da Independência Financeira</h2>
            <p><code>Patrimônio necessário = custo de vida mensal ÷ rendimento real mensal</code></p>
            <p>O "real" é importante: é o rendimento <strong>acima da inflação</strong>. Assim você gasta a renda sem que o patrimônio perca poder de compra. Com o CDB 100% do CDI líquido de IR, o rendimento real hoje é de ${pct(anualDe(realCdb), 1)} ao ano (${pct(realCdb, 3)} ao mês).</p>
            ${notaTaxas}

${callout('Faça a sua conta com seus aportes e seu prazo.')}

            <h2>Quanto Preciso para Viver de Renda</h2>
${tabela(['Custo de vida/mês', `Meta (${pct(anualDe(realCdb), 1)} real)`, 'Regra dos 4%'], linhas)}
            <p>A coluna da <a href="/artigos/regra-dos-4-por-cento-na-renda-passiva">regra dos 4%</a> é a meta conservadora, que considera juros reais mais baixos no futuro.</p>

            <h2>Quanto Tempo para Viver com R$ 5.000 por Mês</h2>
${tabela(['Aporte', `Meta ${brl(5000 / realCdb)}`, `Regra dos 4%: ${brl(5000 * 12 / 0.04)}`], aportes)}

            <h2>Como Usar a Calculadora</h2>
            <ol>
              <li>Em <strong>Renda Passiva Mensal</strong>, coloque o custo de vida que você quer cobrir.</li>
              <li>Preencha o <strong>valor inicial</strong> (o que já tem investido) e o <strong>aporte mensal</strong>.</li>
              <li>Informe a <strong>taxa</strong> — para pensar em valores de hoje, use a taxa real (${pct(anualDe(realCdb), 1)} a.a.).</li>
              <li>Deixe o <strong>prazo</strong> em branco: a calculadora mostra em quanto tempo você chega lá.</li>
            </ol>
            <p>Veja também <a href="/articles/entendendo-os-resultados">como interpretar os resultados</a> e o <a href="/artigos/como-viver-de-renda-passiva">guia para viver de renda passiva</a>.</p>`;

  return {
    slug: 'artigos/calculadora-independencia-financeira',
    title: 'Calculadora de Independência Financeira: Quanto Preciso para Viver de Renda?',
    description: `Calcule quanto precisa para a independência financeira: fórmula, tabela por custo de vida (${T.referencia}) e quanto tempo leva com seus aportes. Calculadora grátis.`,
    h1: 'Calculadora de Independência Financeira',
    breadcrumb: 'Calculadora de Independência Financeira',
    meta: metaLinha(6),
    body, faq,
    related: [GUIAS.viver, GUIAS.regra4, { href: '/' + slugRenda(5000), title: 'Quanto investir para ter renda de R$ 5 mil por mês' }, GUIAS.juros],
    cta: 'Calcule agora quanto falta para a sua independência financeira.',
  };
}

// ---------- geração ----------
const paginas = [
  ...RENDE_GERADAS.map(paginaRende),
  ...RENDA_GERADAS.map(paginaRenda),
  ...TEMPO.map(paginaTempo),
  ...POUPANCA.map(paginaPoupanca),
  ...ONDE.map(paginaOnde),
  paginaIndependencia(),
];

for (const p of paginas) {
  const html = renderArticle({ ...p, datePublished: T.dataISO, dateModified: T.dataISO });
  fs.writeFileSync(path.join(ROOT, p.slug + '.html'), html);
}
console.log(`✓ ${paginas.length} páginas programáticas`);

// ---------- hub /artigos ----------
function tituloDe(file) {
  const html = fs.readFileSync(file, 'utf8');
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  return m ? m[1].replace(/<[^>]+>/g, '').trim() : path.basename(file, '.html');
}
const artigos = [];
for (const dir of ['artigos', 'articles']) {
  for (const f of fs.readdirSync(path.join(ROOT, dir))) {
    if (!f.endsWith('.html') || f === 'index.html') continue;
    artigos.push({ href: `/${dir}/${f.replace(/\.html$/, '')}`, title: tituloDe(path.join(ROOT, dir, f)) });
  }
}
const grupos = [
  { nome: 'Quanto rende por mês', teste: h => /quanto-rende-/.test(h) },
  { nome: 'Quanto investir para ter renda mensal', teste: h => /quanto-investir-para-renda|ganhar-5-mil/.test(h) },
  { nome: 'Quanto tempo para chegar à renda', teste: h => /quanto-tempo-investindo/.test(h) },
];
const usados = new Set();
const ordenaNum = (x, y) => (parseFloat((x.title.match(/[\d.,]+/) || ['0'])[0].replace(/\./g, '').replace(',', '.')) * (/milh/i.test(x.title) ? 1e6 : 1)) -
  (parseFloat((y.title.match(/[\d.,]+/) || ['0'])[0].replace(/\./g, '').replace(',', '.')) * (/milh/i.test(y.title) ? 1e6 : 1));
let secoes = '';
for (const g of grupos) {
  const itens = artigos.filter(a => g.teste(a.href)).sort(ordenaNum);
  itens.forEach(i => usados.add(i.href));
  secoes += `\n            <h2>${g.nome}</h2>\n            <ul>\n${itens.map(i => `              <li><a href="${i.href}">${i.title}</a></li>`).join('\n')}\n            </ul>\n`;
}
const guias = artigos.filter(a => !usados.has(a.href)).sort((x, y) => x.title.localeCompare(y.title, 'pt-BR'));
secoes = `\n            <h2>Guias de renda passiva e investimentos</h2>\n            <ul>\n${guias.map(i => `              <li><a href="${i.href}">${i.title}</a></li>`).join('\n')}\n            </ul>\n` + secoes;

const hub = renderArticle({
  slug: 'artigos',
  title: 'Artigos sobre Renda Passiva, Investimentos e Independência Financeira',
  description: 'Todos os artigos e simulações da Calculadora Renda Passiva: quanto rende cada valor por mês, quanto investir para cada renda e quanto tempo leva para chegar lá.',
  h1: 'Artigos e Simulações de Renda Passiva',
  breadcrumb: 'Artigos',
  meta: `${artigos.length} artigos &middot; Atualizado em ${T.referencia}`,
  datePublished: '2026-10-15', dateModified: T.dataISO,
  body: `            <p>Simulações atualizadas com as taxas de ${T.referencia} e guias para você planejar sua independência financeira. Escolha um tema abaixo ou vá direto para a <a href="/">calculadora de renda passiva</a>.</p>\n${secoes}`,
  cta: 'Simule sua renda passiva com seus próprios números.',
});
fs.writeFileSync(path.join(ROOT, 'artigos', 'index.html'), hub);
console.log(`✓ hub /artigos (${artigos.length} artigos)`);

// ---------- páginas EN ----------
const en = require('./paginas-en').gerarEn(ROOT);
console.log(`✓ ${en.total} páginas EN + hub /en/articles (${en.hub} artigos)`);

// ---------- sitemap: bloco gerado ----------
const smPath = path.join(ROOT, 'sitemap.xml');
let sm = fs.readFileSync(smPath, 'utf8');
const INI = '  <!-- GERADO:INICIO (scripts/paginas.js) -->', FIM = '  <!-- GERADO:FIM -->';
sm = sm.replace(new RegExp('\\s*' + INI.trim().replace(/[()]/g, '\\$&') + '[\\s\\S]*?' + FIM.trim() + '\\s*'), '\n');
const manuais = new Set([...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]));
const artigosEn = fs.readdirSync(path.join(ROOT, 'en', 'articles')).filter(f => f.endsWith('.html') && f !== 'index.html').map(f => '/en/articles/' + f.replace(/\.html$/, ''));
const novos = ['/artigos', ...artigos.map(a => a.href), '/en/articles', ...artigosEn].map(h => SITE + h).filter(u => !manuais.has(u));
const bloco = INI + '\n' + novos.map(u => `  <url>\n    <loc>${u}</loc>\n    <lastmod>${T.dataISO}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`).join('\n') + '\n' + FIM + '\n';
sm = sm.replace(/\s*<\/urlset>\s*$/, '\n\n' + bloco + '\n</urlset>\n');
fs.writeFileSync(smPath, sm);
console.log(`✓ sitemap.xml (+${novos.length} URLs no bloco gerado)`);
