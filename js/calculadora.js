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
    alert('Deixe apenas um campo em branco para cálculo.');
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
    alert('Valores informados levam a resultados inválidos. Verifique os dados e tente novamente.');
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
  setTimeout(() => { window.location.href = '/results.html'; }, 500);
}

function voltarFormulario(e) {
  e.preventDefault();
  document.querySelector('.flip-card')?.classList.remove('flip-card-flipped');
  setTimeout(() => { window.location.href = '/'; }, 500);
}

document.getElementById('calcularBtn')?.addEventListener('click', calcularRendaPassiva);
document.getElementById('voltarBtn')?.addEventListener('click', voltarFormulario);

/* ===== RESULTADOS ===== */
const currentPage = window.location.pathname.split('/').pop();
if (currentPage === 'results.html' && !sessionStorage.getItem('rendaPassivaResult')) {
  window.location.href = '/';
}

function setResult(id, label, value, prefix, suffix) {
  const el = document.getElementById(id);
  if (!el) return;
  const val = value && value !== 'N/A'
    ? `${prefix || ''}${value}${suffix || ''}`
    : '---';
  el.innerHTML = `<span>${label}</span><span>${val}</span>`;
}

setResult('resultPrazo', 'Prazo:', sessionStorage.getItem('prazo'));
setResult('resultValorInicial', 'Valor Inicial:', sessionStorage.getItem('valorInicialResult'), 'R$ ');
setResult('resultValorRecorrente', 'Valor Recorrente Mensal:', sessionStorage.getItem('valorRecorrenteResult'), 'R$ ');
setResult('resultValorInvestido', 'Valor Investido:', sessionStorage.getItem('valorInvestido'), 'R$ ');
setResult('resultRendimentos', 'Rendimentos:', sessionStorage.getItem('rendimentos'), 'R$ ');
setResult('resultValorAcumulado', 'Valor Acumulado:', sessionStorage.getItem('valorAcumulado'), 'R$ ');
setResult('resultTaxa', 'Taxa Mensal:', sessionStorage.getItem('taxa'), '', '%');
setResult('resultTaxaAnual', 'Taxa Anual:', sessionStorage.getItem('taxaAnual'), '', '%');
setResult('resultRendaPassiva', 'Renda Passiva Mensal:', sessionStorage.getItem('rendaPassivaResult'), 'R$ ');

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
  const W = 400, H = 400;
  canvas.width = W;
  canvas.height = H;

  // Fundo
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, '#030711');
  bgGrad.addColorStop(1, '#1d193e');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Barra superior
  const barGrad = ctx.createLinearGradient(0, 0, W, 0);
  barGrad.addColorStop(0, '#7d38f0');
  barGrad.addColorStop(1, '#e847eb');
  ctx.fillStyle = barGrad;
  ctx.fillRect(0, 0, W, 8);

  // URL do site
  ctx.fillStyle = '#64748b';
  ctx.font = '400 13px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('calcularrendapassiva.com', W / 2, 38);

  // Determina o campo calculado e valores a exibir
  const idx = parseInt(sessionStorage.getItem('campoCalculado') ?? '4');
  const infos = [
    { label: 'MEU PRAZO', value: sessionStorage.getItem('prazo') || '---', prefix: '', suffix: '' },
    { label: 'VALOR INICIAL NECESSÁRIO', value: sessionStorage.getItem('valorInicialResult') || '---', prefix: 'R$ ', suffix: '' },
    { label: 'APORTE MENSAL NECESSÁRIO', value: sessionStorage.getItem('valorRecorrenteResult') || '---', prefix: 'R$ ', suffix: '' },
    { label: 'TAXA NECESSÁRIA', value: sessionStorage.getItem('taxa') || '---', prefix: '', suffix: '% a.m.' },
    { label: 'MINHA RENDA PASSIVA', value: sessionStorage.getItem('rendaPassivaResult') || '---', prefix: 'R$ ', suffix: '/mês' },
  ];
  const info = infos[idx >= 0 && idx < 5 ? idx : 4];
  const mainValue = `${info.prefix}${info.value}${info.suffix}`;

  // Glow central
  const glowGrad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 150);
  glowGrad.addColorStop(0, 'rgba(125,56,240,0.18)');
  glowGrad.addColorStop(1, 'rgba(125,56,240,0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, W, H);

  // Label do campo calculado
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 13px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(info.label, W / 2, H / 2 - 48);

  // Valor principal (com gradiente)
  let fontSize = 46;
  ctx.font = `800 ${fontSize}px Inter, system-ui, sans-serif`;
  while (ctx.measureText(mainValue).width > W - 40 && fontSize > 22) {
    fontSize -= 2;
    ctx.font = `800 ${fontSize}px Inter, system-ui, sans-serif`;
  }
  const txtGrad = ctx.createLinearGradient(40, 0, W - 40, 0);
  txtGrad.addColorStop(0, '#c084fc');
  txtGrad.addColorStop(1, '#f0abfc');
  ctx.fillStyle = txtGrad;
  ctx.fillText(mainValue, W / 2, H / 2 + 12);

  // Linha divisória
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, H / 2 + 38);
  ctx.lineTo(W - 60, H / 2 + 38);
  ctx.stroke();

  // Tagline
  ctx.fillStyle = '#64748b';
  ctx.font = '400 13px Inter, system-ui, sans-serif';
  ctx.fillText('Calcule a sua independência financeira', W / 2, H / 2 + 68);

  // Barra inferior
  ctx.fillStyle = barGrad;
  ctx.fillRect(0, H - 8, W, 8);

  // Nome do site
  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 13px Inter, system-ui, sans-serif';
  ctx.fillText('Calculadora de Renda Passiva', W / 2, H - 20);
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

  const frases = [
    `Descobri que em *${prazo}* terei renda passiva de *R$ ${renda}/mês*! 🎯`,
    `Descobri que preciso de *R$ ${inicial}* de valor inicial para ter renda passiva de *R$ ${renda}/mês*! 🎯`,
    `Descobri que preciso aportar *R$ ${recorr}/mês* para ter renda passiva de *R$ ${renda}/mês*! 🎯`,
    `Descobri que preciso de *${taxa}% ao mês* para ter renda passiva de *R$ ${renda}/mês*! 🎯`,
    `Descobri que minha renda passiva será de *R$ ${renda}/mês* em *${prazo}*! 🎯`,
  ];

  const frase = frases[idx >= 0 && idx < 5 ? idx : 4];

  const resultados = [
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

  const msg = `${frase}\n\n${resultados}\n\nCalcule a sua: https://calcularrendapassiva.com`;
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

  const frases = [
    `Descobri que em ${prazo} terei renda passiva de R$ ${renda}/mês! 🎯`,
    `Descobri que preciso de R$ ${inicial} de valor inicial para ter renda passiva de R$ ${renda}/mês! 🎯`,
    `Descobri que preciso aportar R$ ${recorr}/mês para ter renda passiva de R$ ${renda}/mês! 🎯`,
    `Descobri que preciso de ${taxa}% ao mês para ter renda passiva de R$ ${renda}/mês! 🎯`,
    `Descobri que minha renda passiva será de R$ ${renda}/mês em ${prazo}! 🎯`,
  ];
  const texto = frases[idx >= 0 && idx < 5 ? idx : 4];
  const url = 'https://calcularrendapassiva.com';

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

/* ===== COPIAR RESULTADOS ===== */
document.getElementById('copiarBtn')?.addEventListener('click', function () {
  const linhas = [
    'Calcular Renda Passiva\nhttps://calcularrendapassiva.com\n',
    `Prazo: ${sessionStorage.getItem('prazo') || '---'}`,
    `Valor Inicial: R$ ${sessionStorage.getItem('valorInicialResult') || '---'}`,
    `Valor Recorrente: R$ ${sessionStorage.getItem('valorRecorrenteResult') || '---'}`,
    `Valor Investido: R$ ${sessionStorage.getItem('valorInvestido') || '---'}`,
    `Rendimentos: R$ ${sessionStorage.getItem('rendimentos') || '---'}`,
    `Valor Acumulado: R$ ${sessionStorage.getItem('valorAcumulado') || '---'}`,
    `Taxa Mensal: ${sessionStorage.getItem('taxa') || '---'}%`,
    `Taxa Anual: ${sessionStorage.getItem('taxaAnual') || '---'}%`,
    `Renda Passiva: R$ ${sessionStorage.getItem('rendaPassivaResult') || '---'}`,
  ];
  navigator.clipboard.writeText(linhas.join('\n'))
    .then(() => alert('Resultados copiados para a área de transferência!'))
    .catch(() => alert('Erro ao copiar. Tente novamente.'));
});

/* ===== BACK TO TOP ===== */
const backToTop = document.getElementById('backToTop');
if (backToTop) {
  window.addEventListener('scroll', () => {
    backToTop.style.display = document.documentElement.scrollTop > 300 ? 'block' : 'none';
  });
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}
