/* ===== INTERNACIONALIZAÇÃO ===== */
const LANG = window.location.pathname.startsWith('/en') ? 'en' : 'pt';
const L = LANG === 'en' ? {
  prazo: 'Period:', vi: 'Initial Amount:', vr: 'Monthly Contribution:',
  invest: 'Total Invested:', rend: 'Returns:', acum: 'Accumulated Value:',
  taxa: 'Monthly Rate:', taxaA: 'Annual Rate:', renda: 'Monthly Passive Income:',
  alertOneBlank: 'Leave exactly one field blank for calculation.',
  alertInvalid: 'Invalid values entered. Please check and try again.',
  resultPage: '/en/results.html', homePage: '/en/',
} : {
  prazo: 'Prazo:', vi: 'Valor Inicial:', vr: 'Valor Recorrente Mensal:',
  invest: 'Valor Investido:', rend: 'Rendimentos:', acum: 'Valor Acumulado:',
  taxa: 'Taxa Mensal:', taxaA: 'Taxa Anual:', renda: 'Renda Passiva Mensal:',
  alertOneBlank: 'Deixe apenas um campo em branco para cálculo.',
  alertInvalid: 'Valores informados levam a resultados inválidos. Verifique os dados e tente novamente.',
  resultPage: '/results.html', homePage: '/',
};

/* ===== MÁSCARAS (vanilla JS) ===== */

function applyMoneyMask(input) {
  input.addEventListener('input', function () {
    let val = this.value.replace(/\D/g, '');
    if (!val) { this.value = ''; return; }
    if (val.length > 11) val = val.slice(-11);
    const num = parseInt(val, 10);
    const cents = num % 100;
    const reais = Math.floor(num / 100);
    this.value = reais.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + cents.toString().padStart(2, '0');
  });
}

function applyPercentMask(input) {
  input.addEventListener('input', function () {
    let val = this.value.replace(/\D/g, '');
    if (!val) { this.value = ''; return; }
    if (val.length > 4) val = val.slice(-4);
    const num = parseInt(val, 10);
    this.value = Math.floor(num / 100).toString() + ',' + (num % 100).toString().padStart(2, '0');
  });
}

document.querySelectorAll('.value').forEach(applyMoneyMask);
document.querySelectorAll('.percent').forEach(applyPercentMask);

/* ===== CONVERSÃO DE PRAZO ===== */
const periodoAnualEl = document.querySelector('#periodoAnual');
const periodoEl = document.querySelector('#periodo');

periodoAnualEl?.addEventListener('input', function () {
  periodoEl.value = this.value === '' ? '' : Math.floor(this.value * 12);
});

periodoEl?.addEventListener('input', function () {
  if (this.value === '') {
    periodoAnualEl.value = '';
    periodoAnualEl.removeAttribute('disabled');
  } else {
    periodoAnualEl.setAttribute('disabled', true);
    periodoAnualEl.value = Math.floor(this.value / 12);
  }
});

/* ===== CONVERSÃO DE TAXA (juros compostos) ===== */
const txAnualEl = document.querySelector('#txPeriodoAnual');
const txMensalEl = document.querySelector('#txPeriodo');

txAnualEl?.addEventListener('input', function () {
  if (this.value === '') { txMensalEl.value = ''; return; }
  const anual = parseFloat(this.value.replace(',', '.'));
  txMensalEl.value = ((Math.pow(1 + anual / 100, 1 / 12) - 1) * 100).toFixed(2).replace('.', ',');
});

txMensalEl?.addEventListener('input', function () {
  if (this.value === '') { txAnualEl.value = ''; return; }
  const mensal = parseFloat(this.value.replace(',', '.'));
  txAnualEl.value = ((Math.pow(1 + mensal / 100, 12) - 1) * 100).toFixed(2).replace('.', ',');
});

/* ===== SESSION STORAGE — RESTAURAR CAMPOS ===== */
['periodo', 'periodoAnual', 'txPeriodo', 'txPeriodoAnual', 'valorInicial', 'valorRecorrente', 'rendaPassiva']
  .forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = sessionStorage.getItem(id) ?? '';
  });

document.querySelector('#btn-reset')?.addEventListener('click', function () {
  sessionStorage.clear();
  document.querySelector('#rendaForm')?.reset();
});

/* ===== HELPERS ===== */
function formatarValor(valor, sistema = true) {
  if (sistema) return valor.replace(/\./g, '').replace(',', '.');
  return valor.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function calcularAnosEMeses(n) {
  const anos = Math.floor(n / 12), meses = n % 12;
  if (LANG === 'en') {
    const a = anos === 1 ? '1 year' : `${anos} years`;
    const m = meses === 1 ? '1 month' : `${meses} months`;
    if (anos === 0) return m;
    if (meses === 0) return `${n} months (or ${a})`;
    return `${n} months (or ${a} and ${m})`;
  }
  const a = anos === 1 ? '1 ano' : `${anos} anos`;
  const m = meses === 1 ? '1 mês' : `${meses} meses`;
  if (anos === 0) return m;
  if (meses === 0) return `${n} meses (ou ${a})`;
  return `${n} meses (ou ${a} e ${m})`;
}

/* ===== GERAÇÃO DE DADOS DO GRÁFICO ===== */
function gerarDadosGrafico(vi, aporte, taxa, n) {
  if (n <= 0) return [];
  const step = n > 120 ? Math.ceil(n / 60) : n > 24 ? 3 : 1;
  const pontos = [];
  for (let m = 0; m <= n; m += step) {
    const acum = taxa > 0
      ? vi * Math.pow(1 + taxa / 100, m) + aporte * ((Math.pow(1 + taxa / 100, m) - 1) / (taxa / 100))
      : vi + aporte * m;
    pontos.push({ m, acum: Math.max(0, acum), invest: vi + aporte * m });
  }
  if (pontos[pontos.length - 1].m !== n) {
    const acum = taxa > 0
      ? vi * Math.pow(1 + taxa / 100, n) + aporte * ((Math.pow(1 + taxa / 100, n) - 1) / (taxa / 100))
      : vi + aporte * n;
    pontos.push({ m: n, acum: Math.max(0, acum), invest: vi + aporte * n });
  }
  return pontos;
}

/* ===== CÁLCULO PRINCIPAL ===== */
function calcularRendaPassiva() {
  const periodo = document.getElementById('periodo').value;
  const txPeriodo = document.getElementById('txPeriodo').value;
  const txPeriodoAnual = document.getElementById('txPeriodoAnual').value;
  const valorInicial = document.getElementById('valorInicial').value;
  const valorRecorrente = document.getElementById('valorRecorrente').value;
  const rendaPassiva = document.getElementById('rendaPassiva').value;

  sessionStorage.setItem('periodo', periodo);
  sessionStorage.setItem('periodoAnual', document.getElementById('periodoAnual').value);
  sessionStorage.setItem('txPeriodo', txPeriodo);
  sessionStorage.setItem('txPeriodoAnual', txPeriodoAnual);
  sessionStorage.setItem('valorInicial', valorInicial);
  sessionStorage.setItem('valorRecorrente', valorRecorrente);
  sessionStorage.setItem('rendaPassiva', rendaPassiva);

  const camposParaCalculo = [periodo, valorInicial, valorRecorrente, txPeriodo, rendaPassiva];
  let totalVazios = 0;
  let campoEmBranco = -1;
  camposParaCalculo.forEach((item, index) => {
    if (item === '') { totalVazios++; campoEmBranco = index; }
  });

  if (totalVazios !== 1) {
    alert(L.alertOneBlank);
    return;
  }

  // Salva qual campo foi calculado para destaque nos resultados
  sessionStorage.setItem('campoCalculado', campoEmBranco);

  let prazo = periodo ? parseInt(periodo) : 0;
  let taxa = txPeriodo ? parseFloat(formatarValor(txPeriodo)) : 0;
  let taxaAnual = txPeriodoAnual ? parseFloat(formatarValor(txPeriodoAnual)) : 0;
  let inicial = valorInicial ? parseFloat(formatarValor(valorInicial)) : 0;
  let recorrente = valorRecorrente ? parseFloat(formatarValor(valorRecorrente)) : 0;
  let renda = rendaPassiva ? parseFloat(formatarValor(rendaPassiva)) : 0;
  let investido, rendimentos, acumulado;

  switch (campoEmBranco) {
    case 0: {
      let vlrAtual = inicial;
      const montante = renda / (taxa / 100);
      let loop = 0;
      while (vlrAtual * (1 + taxa / 100) + recorrente < montante) {
        vlrAtual = vlrAtual * (1 + taxa / 100) + recorrente;
        loop++;
      }
      prazo = loop;
      investido = inicial + recorrente * prazo;
      rendimentos = vlrAtual - investido;
      acumulado = vlrAtual;
      renda = acumulado * (taxa / 100);
      break;
    }
    case 1: {
      const montante = renda / (taxa / 100);
      const taxaAtu = Math.pow(1 + taxa / 100, prazo);
      inicial = (montante - recorrente * ((taxaAtu - 1) / (taxa / 100))) / taxaAtu;
      investido = inicial + recorrente * prazo;
      rendimentos = montante - investido;
      acumulado = montante;
      renda = acumulado * (taxa / 100);
      break;
    }
    case 2: {
      const montante = renda / (taxa / 100);
      const inicialAtu = inicial * Math.pow(1 + taxa / 100, prazo);
      const taxaAtu = (Math.pow(1 + taxa / 100, prazo) - 1) / (taxa / 100);
      recorrente = parseFloat(((montante - inicialAtu) / taxaAtu).toFixed(2));
      investido = inicial + recorrente * prazo;
      rendimentos = montante - investido;
      acumulado = montante;
      renda = acumulado * (taxa / 100);
      break;
    }
    case 3: {
      let t = 0.01;
      let montAtu = 0;
      let taxaAtu2 = 0;
      while (true) {
        const mont = inicial * Math.pow(1 + t / 100, prazo)
          + recorrente * ((Math.pow(1 + t / 100, prazo) - 1) / (t / 100));
        if (mont * (t / 100) >= renda) break;
        montAtu = mont;
        taxaAtu2 = t;
        t += 0.01;
      }
      taxaAnual = (Math.pow(1 + taxaAtu2 / 100, 12) - 1) * 100;
      taxa = taxaAtu2;
      investido = inicial + recorrente * prazo;
      rendimentos = montAtu - investido;
      acumulado = montAtu;
      renda = acumulado * (taxa / 100);
      break;
    }
    case 4: {
      let rentAtual = inicial * (1 + taxa / 100) + recorrente;
      for (let i = 1; i < prazo; i++) {
        rentAtual = rentAtual * (1 + taxa / 100) + recorrente;
      }
      investido = inicial + recorrente * prazo;
      rendimentos = rentAtual - investido;
      acumulado = rentAtual;
      renda = acumulado * (taxa / 100);
      break;
    }
  }

  if ([investido, rendimentos, acumulado, renda].some(v => v === Infinity || isNaN(v))) {
    alert(L.alertInvalid);
    return;
  }

  sessionStorage.setItem('chartData', JSON.stringify(gerarDadosGrafico(inicial, recorrente, taxa, prazo)));
  sessionStorage.setItem('prazo', prazo ? calcularAnosEMeses(prazo) : 'N/A');
  sessionStorage.setItem('valorInicialResult', inicial ? formatarValor(inicial, false) : 'N/A');
  sessionStorage.setItem('valorRecorrenteResult', recorrente ? formatarValor(recorrente, false) : 'N/A');
  sessionStorage.setItem('valorInvestido', investido ? formatarValor(investido, false) : 'N/A');
  sessionStorage.setItem('rendimentos', rendimentos ? formatarValor(rendimentos, false) : 'N/A');
  sessionStorage.setItem('taxa', taxa ? formatarValor(taxa, false) : 'N/A');
  sessionStorage.setItem('taxaAnual', taxaAnual ? formatarValor(taxaAnual, false) : 'N/A');
  sessionStorage.setItem('rendaPassivaResult', renda ? formatarValor(renda, false) : 'N/A');
  sessionStorage.setItem('valorAcumulado', acumulado ? formatarValor(acumulado, false) : 'N/A');

  document.querySelector('.flip-card')?.classList.add('flip-card-flipped');
  setTimeout(() => { window.location.href = L.resultPage; }, 500);
}

function voltarFormulario(e) {
  e.preventDefault();
  document.querySelector('.flip-card')?.classList.remove('flip-card-flipped');
  setTimeout(() => { window.location.href = L.homePage; }, 500);
}

document.getElementById('calcularBtn')?.addEventListener('click', calcularRendaPassiva);
document.getElementById('voltarBtn')?.addEventListener('click', voltarFormulario);

/* ===== RESULTADOS ===== */
const currentPage = window.location.pathname.split('/').pop();
if (currentPage === 'results.html' && !sessionStorage.getItem('rendaPassivaResult')) {
  window.location.href = L.homePage;
}

function setResult(id, label, value, prefix, suffix) {
  const el = document.getElementById(id);
  if (!el) return;
  const val = value && value !== 'N/A'
    ? `${prefix || ''}${value}${suffix || ''}`
    : '---';
  el.innerHTML = `<span>${label}</span><span>${val}</span>`;
}

setResult('resultPrazo', L.prazo, sessionStorage.getItem('prazo'));
setResult('resultValorInicial', L.vi, sessionStorage.getItem('valorInicialResult'), 'R$ ');
setResult('resultValorRecorrente', L.vr, sessionStorage.getItem('valorRecorrenteResult'), 'R$ ');
setResult('resultValorInvestido', L.invest, sessionStorage.getItem('valorInvestido'), 'R$ ');
setResult('resultRendimentos', L.rend, sessionStorage.getItem('rendimentos'), 'R$ ');
setResult('resultValorAcumulado', L.acum, sessionStorage.getItem('valorAcumulado'), 'R$ ');
setResult('resultTaxa', L.taxa, sessionStorage.getItem('taxa'), '', '%');
setResult('resultTaxaAnual', L.taxaA, sessionStorage.getItem('taxaAnual'), '', '%');
setResult('resultRendaPassiva', L.renda, sessionStorage.getItem('rendaPassivaResult'), 'R$ ');

// Destaca o campo que foi calculado
const campoMap = ['resultPrazo', 'resultValorInicial', 'resultValorRecorrente', 'resultTaxa', 'resultRendaPassiva'];
const campoCalculado = parseInt(sessionStorage.getItem('campoCalculado') ?? '-1');
if (campoCalculado >= 0 && campoCalculado < campoMap.length) {
  document.getElementById(campoMap[campoCalculado])?.classList.add('result-highlight');
}

/* ===== GRÁFICO ===== */
function renderizarGrafico() {
  const raw = sessionStorage.getItem('chartData');
  const canvas = document.getElementById('graficoPatrimonio');
  if (!raw || !canvas || typeof Chart === 'undefined') return;
  const pontos = JSON.parse(raw);
  if (pontos.length < 2) return;

  const labels = pontos.map(p => {
    const anos = Math.floor(p.m / 12);
    return anos === 0 ? `${p.m}m` : `${anos}a`;
  });

  new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Patrimônio Acumulado',
          data: pontos.map(p => p.acum),
          borderColor: '#e847eb',
          backgroundColor: 'rgba(232,71,235,0.12)',
          fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2,
        },
        {
          label: 'Total Investido',
          data: pontos.map(p => p.invest),
          borderColor: '#7d38f0',
          backgroundColor: 'rgba(125,56,240,0.06)',
          fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { color: '#f8fafc', font: { family: 'Inter', size: 12 }, boxWidth: 12 } },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: R$ ${ctx.raw.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          },
          backgroundColor: '#1d193e', titleColor: '#f8fafc', bodyColor: '#94a3b8',
          borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1,
        }
      },
      scales: {
        x: { ticks: { color: '#94a3b8', maxTicksLimit: 8, font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: {
          ticks: {
            color: '#94a3b8', font: { size: 11 },
            callback: v => v >= 1e6 ? `R$ ${(v/1e6).toFixed(1)}M` : v >= 1000 ? `R$ ${(v/1000).toFixed(0)}k` : `R$ ${v.toFixed(0)}`
          },
          grid: { color: 'rgba(255,255,255,0.05)' }
        }
      }
    }
  });
}

renderizarGrafico();

/* ===== CARD COMPARTILHÁVEL ===== */
function gerarCard() {
  const canvas = document.getElementById('cardCompartilhar');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 1080, H = 1350;
  canvas.width = W;
  canvas.height = H;
  const PX = 72;

  // Fundo
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#030711');
  bgGrad.addColorStop(1, '#130d2e');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Glow superior
  const g1 = ctx.createRadialGradient(W/2, 300, 0, W/2, 300, 420);
  g1.addColorStop(0, 'rgba(125,56,240,0.18)');
  g1.addColorStop(1, 'rgba(125,56,240,0)');
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, W, H);

  // Glow inferior
  const g2 = ctx.createRadialGradient(W/2, H-200, 0, W/2, H-200, 380);
  g2.addColorStop(0, 'rgba(232,71,235,0.12)');
  g2.addColorStop(1, 'rgba(232,71,235,0)');
  ctx.fillStyle = g2;
  ctx.fillRect(0, H-580, W, H);

  // Gradiente principal (barras + URL)
  const mainGrad = ctx.createLinearGradient(0, 0, W, 0);
  mainGrad.addColorStop(0, '#7d38f0');
  mainGrad.addColorStop(1, '#e847eb');

  // Barra topo
  ctx.fillStyle = mainGrad;
  ctx.fillRect(0, 0, W, 14);

  // Branding
  ctx.textAlign = 'center';
  ctx.fillStyle = '#7d38f0';
  ctx.font = '700 22px Inter, system-ui, sans-serif';
  ctx.fillText(LANG === 'en' ? 'Passive Income Calculator' : 'Calculadora de Renda Passiva', W/2, 62);

  // Helper divisor
  function div(y) {
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PX, y); ctx.lineTo(W-PX, y); ctx.stroke();
  }
  div(92);

  // Dados do resultado
  const idx    = parseInt(sessionStorage.getItem('campoCalculado') ?? '4');
  const prazo  = sessionStorage.getItem('prazo') || '---';
  const renda  = sessionStorage.getItem('rendaPassivaResult') || '---';
  const inic   = sessionStorage.getItem('valorInicialResult') || '---';
  const recorr = sessionStorage.getItem('valorRecorrenteResult') || '---';
  const taxa   = sessionStorage.getItem('taxa') || '---';
  const taxaA  = sessionStorage.getItem('taxaAnual') || '---';
  const acum   = sessionStorage.getItem('valorAcumulado') || '---';
  const invest = sessionStorage.getItem('valorInvestido') || '---';
  const rendim = sessionStorage.getItem('rendimentos') || '---';

  // Headlines personalizados por campo calculado
  const defs = LANG === 'en' ? [
    { pre: ['I will reach my', 'financial independence in'],             big: prazo,             post: [] },
    { pre: ['I only need'],                                              big: `R$ ${inic}`,      post: ['as initial investment to live off passive income'] },
    { pre: ['Investing only'],                                           big: `R$ ${recorr}/mo`, post: ['I will already have passive income!'] },
    { pre: ['With only'],                                                big: `${taxa}% p.m.`,   post: ['monthly return I reach', 'my financial independence!'] },
    { pre: ['My monthly passive income will be'],                        big: `R$ ${renda}/mo`,  post: [] },
  ] : [
    { pre: ['Vou alcançar minha', 'independência financeira em'],        big: prazo,             post: [] },
    { pre: ['Preciso de apenas'],                                         big: `R$ ${inic}`,      post: ['de valor inicial para viver de renda passiva'] },
    { pre: ['Investindo apenas'],                                         big: `R$ ${recorr}/mês`, post: ['já terei renda passiva!'] },
    { pre: ['Com apenas'],                                                big: `${taxa}% a.m.`,   post: ['de retorno mensal alcanço', 'minha independência financeira!'] },
    { pre: ['Minha renda passiva será de'],                              big: `R$ ${renda}/mês`, post: [] },
  ];
  const def = defs[idx >= 0 && idx < 5 ? idx : 4];

  // Gradiente do valor principal
  const txtGrad = ctx.createLinearGradient(PX, 0, W-PX, 0);
  txtGrad.addColorStop(0, '#c084fc');
  txtGrad.addColorStop(1, '#f0abfc');

  let y = 148;

  // Linhas de pré-headline
  ctx.textAlign = 'center';
  ctx.fillStyle = '#94a3b8';
  ctx.font = '400 28px Inter, system-ui, sans-serif';
  for (const line of def.pre) { ctx.fillText(line, W/2, y); y += 44; }
  y += 60;

  // Valor principal grande
  let fs = 86;
  ctx.font = `800 ${fs}px Inter, system-ui, sans-serif`;
  while (ctx.measureText(def.big).width > W - PX*2 && fs > 38) {
    fs -= 2;
    ctx.font = `800 ${fs}px Inter, system-ui, sans-serif`;
  }
  ctx.fillStyle = txtGrad;
  ctx.fillText(def.big, W/2, y);
  y += 48;

  // Linhas de pós-headline
  if (def.post.length) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '400 26px Inter, system-ui, sans-serif';
    for (const line of def.post) { ctx.fillText(line, W/2, y); y += 40; }
  }

  y += 56; div(y); y += 46;

  // Label da tabela
  ctx.fillStyle = '#475569';
  ctx.font = '600 17px Inter, system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(LANG === 'en' ? 'CALCULATION SUMMARY' : 'RESUMO DO CÁLCULO', PX, y);
  y += 18;

  // Tabela de resultados (9 linhas)
  const rows = LANG === 'en' ? [
    ['Period',              prazo],
    ['Initial Amount',      `R$ ${inic}`],
    ['Monthly Contribution',`R$ ${recorr}`],
    ['Total Invested',      `R$ ${invest}`],
    ['Returns',             `R$ ${rendim}`],
    ['Accumulated Value',   `R$ ${acum}`],
    ['Monthly Rate',        `${taxa}% p.m.`],
    ['Annual Rate',         `${taxaA}% p.a.`],
    ['Passive Income',      `R$ ${renda}/mo`],
  ] : [
    ['Prazo',           prazo],
    ['Valor Inicial',   `R$ ${inic}`],
    ['Aporte Mensal',   `R$ ${recorr}`],
    ['Total Investido', `R$ ${invest}`],
    ['Rendimentos',     `R$ ${rendim}`],
    ['Valor Acumulado', `R$ ${acum}`],
    ['Taxa Mensal',     `${taxa}% a.m.`],
    ['Taxa Anual',      `${taxaA}% a.a.`],
    ['Renda Passiva',   `R$ ${renda}/mês`],
  ];
  for (const [label, val] of rows) {
    y += 62;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '400 21px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(label, PX, y);
    ctx.fillStyle = '#f8fafc';
    ctx.font = '600 21px Inter, system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(val, W-PX, y);
  }

  y += 56; div(y); y += 64;

  // CTA
  ctx.textAlign = 'center';
  ctx.fillStyle = '#94a3b8';
  ctx.font = '400 26px Inter, system-ui, sans-serif';
  ctx.fillText(LANG === 'en' ? 'Calculate yours too at:' : 'Calcule você também em:', W/2, y);
  y += 62;
  ctx.font = '700 38px Inter, system-ui, sans-serif';
  ctx.fillStyle = mainGrad;
  ctx.fillText(LANG === 'en' ? 'calculatepassiveincome.com' : 'calcularrendapassiva.com', W/2, y);
  y += 52;
  ctx.fillStyle = '#475569';
  ctx.font = '400 19px Inter, system-ui, sans-serif';
  ctx.fillText(LANG === 'en' ? 'Calculate your financial independence · Free' : 'Calcule sua independência financeira · Grátis', W/2, y);

  // Barra base
  ctx.fillStyle = mainGrad;
  ctx.fillRect(0, H-14, W, 14);
}

function compartilharWhatsApp() {
  const idx       = parseInt(sessionStorage.getItem('campoCalculado') ?? '4');
  const prazo     = sessionStorage.getItem('prazo') || '---';
  const renda     = sessionStorage.getItem('rendaPassivaResult') || '---';
  const inicial   = sessionStorage.getItem('valorInicialResult') || '---';
  const recorr    = sessionStorage.getItem('valorRecorrenteResult') || '---';
  const taxa      = sessionStorage.getItem('taxa') || '---';
  const taxaAnual = sessionStorage.getItem('taxaAnual') || '---';
  const investido = sessionStorage.getItem('valorInvestido') || '---';
  const rendim    = sessionStorage.getItem('rendimentos') || '---';
  const acumulado = sessionStorage.getItem('valorAcumulado') || '---';

  const frases = LANG === 'en' ? [
    `I found out that in *${prazo}* I'll have *R$ ${renda}/month* in passive income! 🎯`,
    `I only need *R$ ${inicial}* as initial investment to have *R$ ${renda}/month* in passive income! 🎯`,
    `Investing *R$ ${recorr}/month* I'll have *R$ ${renda}/month* in passive income! 🎯`,
    `With *${taxa}% monthly return* I'll reach *R$ ${renda}/month* in passive income! 🎯`,
    `My monthly passive income will be *R$ ${renda}* in *${prazo}*! 🎯`,
  ] : [
    `Descobri que em *${prazo}* terei renda passiva de *R$ ${renda}/mês*! 🎯`,
    `Descobri que preciso de *R$ ${inicial}* de valor inicial para ter renda passiva de *R$ ${renda}/mês*! 🎯`,
    `Descobri que preciso aportar *R$ ${recorr}/mês* para ter renda passiva de *R$ ${renda}/mês*! 🎯`,
    `Descobri que preciso de *${taxa}% ao mês* para ter renda passiva de *R$ ${renda}/mês*! 🎯`,
    `Descobri que minha renda passiva será de *R$ ${renda}/mês* em *${prazo}*! 🎯`,
  ];

  const frase = frases[idx >= 0 && idx < 5 ? idx : 4];

  const resultados = LANG === 'en' ? [
    `Period: ${prazo}`,
    `Initial Amount: R$ ${inicial}`,
    `Monthly Contribution: R$ ${recorr}`,
    `Total Invested: R$ ${investido}`,
    `Returns: R$ ${rendim}`,
    `Accumulated Value: R$ ${acumulado}`,
    `Monthly Rate: ${taxa}%`,
    `Annual Rate: ${taxaAnual}%`,
    `Passive Income: R$ ${renda}/mo`,
  ].join('\n') : [
    `Prazo: ${prazo}`,
    `Valor Inicial: R$ ${inicial}`,
    `Valor Recorrente: R$ ${recorr}`,
    `Valor Investido: R$ ${investido}`,
    `Rendimentos: R$ ${rendim}`,
    `Valor Acumulado: R$ ${acumulado}`,
    `Taxa Mensal: ${taxa}%`,
    `Taxa Anual: ${taxaAnual}%`,
    `Renda Passiva: R$ ${renda}`,
  ].join('\n');

  const ctaWa = LANG === 'en' ? 'Calculate yours: https://calculatepassiveincome.com' : 'Calcule a sua: https://calcularrendapassiva.com';
  const msg = `${frase}\n\n${resultados}\n\n${ctaWa}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
}


async function compartilharResultado() {
  const canvas = document.getElementById('cardCompartilhar');
  if (!canvas) return;

  const idx     = parseInt(sessionStorage.getItem('campoCalculado') ?? '4');
  const prazo   = sessionStorage.getItem('prazo') || '---';
  const renda   = sessionStorage.getItem('rendaPassivaResult') || '---';
  const inicial = sessionStorage.getItem('valorInicialResult') || '---';
  const recorr  = sessionStorage.getItem('valorRecorrenteResult') || '---';
  const taxa    = sessionStorage.getItem('taxa') || '---';

  const frases = LANG === 'en' ? [
    `In ${prazo} I'll have R$ ${renda}/month in passive income! 🎯`,
    `I only need R$ ${inicial} as initial investment to have R$ ${renda}/month in passive income! 🎯`,
    `Investing R$ ${recorr}/month I'll have R$ ${renda}/month in passive income! 🎯`,
    `With ${taxa}% monthly return I'll reach R$ ${renda}/month in passive income! 🎯`,
    `My monthly passive income will be R$ ${renda}! 🎯`,
  ] : [
    `Descobri que em ${prazo} terei renda passiva de R$ ${renda}/mês! 🎯`,
    `Descobri que preciso de R$ ${inicial} de valor inicial para ter renda passiva de R$ ${renda}/mês! 🎯`,
    `Descobri que preciso aportar R$ ${recorr}/mês para ter renda passiva de R$ ${renda}/mês! 🎯`,
    `Descobri que preciso de ${taxa}% ao mês para ter renda passiva de R$ ${renda}/mês! 🎯`,
    `Descobri que minha renda passiva será de R$ ${renda}/mês em ${prazo}! 🎯`,
  ];
  const texto = frases[idx >= 0 && idx < 5 ? idx : 4];
  const url = LANG === 'en' ? 'https://calculatepassiveincome.com' : 'https://calcularrendapassiva.com';

  if (navigator.share) {
    try {
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const file = new File([blob], 'minha-renda-passiva.png', { type: 'image/png' });
      const shareData = (navigator.canShare && navigator.canShare({ files: [file] }))
        ? { files: [file], text: texto, url }
        : { text: `${texto}\n\nCalcule a sua: ${url}` };
      await navigator.share(shareData);
      return;
    } catch (err) {
      if (err.name === 'AbortError') return;
      // Falhou com arquivo, tenta sem
      try {
        await navigator.share({ text: `${texto}\n\nCalcule a sua: ${url}` });
        return;
      } catch (_) { /* fallback para download */ }
    }
  }

  // Fallback: download da imagem
  const link = document.createElement('a');
  link.download = 'minha-renda-passiva.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// Gera o card após as fontes carregarem para garantir renderização correta
if (document.getElementById('cardCompartilhar')) {
  document.fonts.ready.then(gerarCard);
}


/* ===== BACK TO TOP ===== */
const backToTop = document.getElementById('backToTop');
if (backToTop) {
  window.addEventListener('scroll', () => {
    backToTop.style.display = document.documentElement.scrollTop > 300 ? 'block' : 'none';
  });
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}
