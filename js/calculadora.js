/* ===== Calculadora de Renda Passiva — interface =====
   Cálculo em js/simulador.js (window.Simulador). Taxas do mês em /dados/taxas.json (gerado no build). */
(function () {
  'use strict';

  const LANG = window.location.pathname.startsWith('/en') ? 'en' : 'pt';
  const EN = LANG === 'en';
  const LOC = EN ? 'en-US' : 'pt-BR';
  const MOEDA = EN ? 'USD' : 'BRL';
  const SITE = EN ? 'calcularrendapassiva.com/en' : 'calcularrendapassiva.com';
  const URL_SITE = 'https://' + SITE;
  const HOME = EN ? '/en/' : '/';
  const PAGINA_RESULTADO = EN ? '/en/results.html' : '/results.html';
  const CHAVE_FORM = 'crp_form';
  const CHAVE_RES = 'crp_resultado';

  const T = EN ? {
    personalizado: 'Custom rate',
    semTaxas: 'Could not load this month\'s rates. Enter a custom rate.',
    infoPersonalizado: 'Enter the expected annual return. Taxes (if on) use the long-term rate of 15%.',
    erros: {
      campos: 'Fill in the highlighted fields.',
      taxa: 'At this rate, after inflation and taxes, your money doesn\'t grow. Pick another investment or turn off "today\'s money".',
      inalcancavel: 'With these numbers the goal would take more than 100 years. Increase the monthly contribution or lower the goal.',
      produto: 'Choose where you will invest.',
      modo: 'Choose what you want to find out.',
    },
    ano: ['year', 'years'], mes: ['month', 'months'], e: 'and', mesCurto: '/mo',
    lead: {
      renda: p => `In ${p}, your passive income will be`,
      aporte: (r, p) => `To earn ${r}/month in ${p}, invest`,
      prazo: r => `You will reach ${r}/month of passive income in`,
      patrimonio: r => `To earn ${r}/month in passive income, you need`,
      inicialBasta: p => `Your initial amount is already enough! In ${p} it generates`,
      jaAtingido: () => 'Your current savings already generate',
    },
    sub: {
      acum: a => `with ${a} invested`,
      investidos: p => `invested in ${p}`,
      semAporte: 'with no monthly contributions',
      jaAtingido: 'you have already reached your goal',
    },
    chips: { ir: a => `Taxes deducted (${fmtPct(a)}%)`, semIr: 'Before taxes', isento: 'Tax-free', hoje: i => `Today's money (inflation ${fmtPct(i)}%/yr)`, nominal: 'Not adjusted for inflation' },
    linhas: { produto: 'Investment', taxa: 'Return used', prazo: 'Period', inicial: 'Initial amount', aporte: 'Monthly contribution', investido: 'Total invested', rendimentos: 'Earnings', acumulado: 'Final balance', renda: 'Monthly passive income' },
    taxaTxt: (m, a) => `${m}% per month (${a}% per year)`,
    liquida: 'after taxes', real: 'above inflation',
    aviso: ref => `Educational simulation using reference rates from ${ref}. This is not investment advice or a guarantee of returns: rates change over time and real results will differ.`,
    simplif: 'Simplified model: monthly compounding, contributions at the end of each month, taxes deducted from each month\'s earnings. Income = balance × monthly return (living off earnings only).',
    estimativa: p => `${p}: return is an average estimate.`,
    card: { titulo: 'Passive Income Calculator', resumo: 'SUMMARY', cta: 'Run your own simulation at', aviso: 'Educational simulation · not advice or a guarantee of returns' },
    zap: { cta: 'Run yours:' },
    grafico: ['Balance', 'Total invested'],
  } : {
    personalizado: 'Outra rentabilidade',
    semTaxas: 'Não foi possível carregar as taxas do mês. Informe a rentabilidade.',
    infoPersonalizado: 'Informe a rentabilidade esperada ao ano. Se descontar imposto, usa a alíquota de longo prazo (15%).',
    erros: {
      campos: 'Preencha os campos destacados.',
      taxa: 'Com essa rentabilidade, descontados inflação e imposto, o dinheiro não cresce. Escolha outro investimento ou desligue "valores de hoje".',
      inalcancavel: 'Com esses números a meta levaria mais de 100 anos. Aumente o aporte mensal ou reduza a meta.',
      produto: 'Escolha onde vai investir.',
      modo: 'Escolha o que quer descobrir.',
    },
    ano: ['ano', 'anos'], mes: ['mês', 'meses'], e: 'e', mesCurto: '/mês',
    lead: {
      renda: p => `Em ${p}, sua renda passiva será de`,
      aporte: (r, p) => `Para ter ${r}/mês em ${p}, invista`,
      prazo: r => `Você chega a ${r}/mês de renda passiva em`,
      patrimonio: r => `Para ter ${r}/mês de renda passiva, você precisa de`,
      inicialBasta: p => `Seu valor inicial já basta! Em ${p} ele gera`,
      jaAtingido: () => 'Seu patrimônio atual já gera',
    },
    sub: {
      acum: a => `com patrimônio de ${a}`,
      investidos: p => `investidos em ${p}`,
      semAporte: 'sem precisar de aportes',
      jaAtingido: 'você já atingiu a meta',
    },
    chips: { ir: a => `IR descontado (${fmtPct(a)}%)`, semIr: 'Sem descontar IR', isento: 'Isento de IR', hoje: i => `Valores de hoje (inflação ${fmtPct(i)}% a.a.)`, nominal: 'Sem descontar a inflação' },
    linhas: { produto: 'Investimento', taxa: 'Rentabilidade considerada', prazo: 'Prazo', inicial: 'Valor inicial', aporte: 'Aporte mensal', investido: 'Total investido', rendimentos: 'Rendimentos', acumulado: 'Patrimônio final', renda: 'Renda passiva mensal' },
    taxaTxt: (m, a) => `${m}% ao mês (${a}% ao ano)`,
    liquida: 'líquida de IR', real: 'acima da inflação',
    aviso: ref => `Simulação educativa com taxas de referência de ${ref}. Não é recomendação de investimento nem garantia de rentabilidade: as taxas mudam com o tempo e o resultado real será diferente.`,
    simplif: 'Modelo simplificado: juros compostos mensais, aporte no fim de cada mês e IR descontado do rendimento de cada mês. Renda = patrimônio × rentabilidade mensal (vivendo só do rendimento).',
    estimativa: p => `${p}: rendimento é uma estimativa média.`,
    card: { titulo: 'Calculadora de Renda Passiva', resumo: 'RESUMO DA SIMULAÇÃO', cta: 'Faça a sua simulação em', aviso: 'Simulação educativa · não é recomendação nem garantia de rentabilidade' },
    zap: { cta: 'Faça a sua:' },
    grafico: ['Patrimônio', 'Total investido'],
  };

  /* ===== Formatação ===== */
  function fmtMoeda(v, casas) {
    const c = casas != null ? casas : 2;
    return new Intl.NumberFormat(LOC, { style: 'currency', currency: MOEDA, minimumFractionDigits: c, maximumFractionDigits: c }).format(v);
  }
  const fmtHero = v => fmtMoeda(v, v >= 1000 ? 0 : 2);
  function fmtPct(v, casas) {
    const c = casas != null ? casas : 2;
    return Number(v).toLocaleString(LOC, { minimumFractionDigits: 0, maximumFractionDigits: c });
  }
  function fmtPrazo(n) {
    const a = Math.floor(n / 12), m = n % 12;
    const pa = a ? `${a} ${T.ano[a === 1 ? 0 : 1]}` : '';
    const pm = m ? `${m} ${T.mes[m === 1 ? 0 : 1]}` : '';
    return [pa, pm].filter(Boolean).join(` ${T.e} `) || `0 ${T.mes[1]}`;
  }
  function lerValor(txt) {
    const so = String(txt || '').replace(/\D/g, '');
    return so ? parseInt(so, 10) / 100 : 0;
  }

  /* ===== GA4 ===== */
  function evento(nome, params) {
    if (typeof gtag === 'function') gtag('event', nome, Object.assign({ idioma: LANG }, params));
  }
  document.addEventListener('click', function (e) {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    if (a.href.includes('play.google.com')) evento('clique_loja', { loja: 'play_store' });
    else if (a.href.includes('apps.apple.com')) evento('clique_loja', { loja: 'app_store' });
  });

  /* ===== Altura do flip card ===== */
  function syncFlipCardHeight() {
    const root = document.querySelector('.flip-card');
    const inner = root && root.querySelector('.flip-card-inner');
    const front = root && root.querySelector('.flip-card-front');
    const back = root && root.querySelector('.flip-card-back');
    if (!root || !inner || !front || !back) return;
    root.style.height = '';
    inner.style.height = '';
    root.classList.add('flip-card--measure');
    const prev = inner.style.transform;
    inner.style.transform = 'none';
    front.style.display = 'block'; back.style.display = 'none';
    const hFront = inner.getBoundingClientRect().height;
    front.style.display = 'none'; back.style.display = 'block';
    const hBack = inner.getBoundingClientRect().height;
    front.style.display = ''; back.style.display = '';
    inner.style.transform = prev;
    root.classList.remove('flip-card--measure');
    const h = Math.max(Math.ceil(Math.max(hFront, hBack)) + 4, 280);
    root.style.height = h + 'px';
    inner.style.height = h + 'px';
  }
  let resizeT;
  window.addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(syncFlipCardHeight, 150); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncFlipCardHeight);

  /* ===== Máscaras ===== */
  const SEP_MIL = EN ? ',' : '.';
  const SEP_DEC = EN ? '.' : ',';
  function mascaraMoeda(input) {
    input.addEventListener('input', function () {
      let v = this.value.replace(/\D/g, '').replace(/^0+/, '');
      if (!v) { this.value = ''; return; }
      if (v.length > 11) v = v.slice(-11);
      v = v.padStart(3, '0');
      const inteiro = v.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, SEP_MIL);
      this.value = inteiro + SEP_DEC + v.slice(-2);
    });
  }
  function mascaraPct(input) {
    input.addEventListener('input', function () {
      let v = this.value.replace(/\D/g, '').replace(/^0+/, '');
      if (!v) { this.value = ''; return; }
      if (v.length > 4) v = v.slice(-4);
      v = v.padStart(3, '0');
      this.value = parseInt(v.slice(0, -2), 10) + SEP_DEC + v.slice(-2);
    });
  }
  function mascaraInteiro(input) {
    input.addEventListener('input', function () { this.value = this.value.replace(/\D/g, '').slice(0, 2); });
  }

  /* ===== Taxas do mês ===== */
  let DADOS = null;
  const carregarDados = fetch('/dados/taxas.json', { cache: 'no-cache' })
    .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
    .then(j => { DADOS = j[LANG]; return DADOS; })
    .catch(() => null);

  function produtoAtual(form) {
    const id = form.produto.value;
    if (id === 'personalizado') {
      const anual = lerValor(form.taxaAnual.value);
      return anual > 0 ? { id, nome: T.personalizado, anual, ir: EN ? 15 : 'regressivo' } : null;
    }
    return DADOS && DADOS.produtos.find(p => p.id === id);
  }

  /* ===== Formulário (home) ===== */
  const form = document.getElementById('simForm');
  if (form) iniciarFormulario(form);

  function iniciarFormulario(form) {
    form.querySelectorAll('.js-moeda').forEach(mascaraMoeda);
    form.querySelectorAll('.js-pct').forEach(mascaraPct);
    form.querySelectorAll('.js-inteiro').forEach(mascaraInteiro);
    const erroEl = document.getElementById('calcErro');
    const info = document.getElementById('produtoInfo');
    const grupoTaxa = document.getElementById('grupoTaxa');
    const sel = form.produto;

    let salvo = {};
    try { salvo = JSON.parse(sessionStorage.getItem(CHAVE_FORM) || '{}') || {}; } catch (_) { salvo = {}; }
    ['renda', 'inicial', 'aporte', 'anos', 'taxaAnual'].forEach(id => { if (salvo[id]) form[id].value = salvo[id]; });
    if (salvo.modo) { const r = form.querySelector(`input[name="modo"][value="${salvo.modo}"]`); if (r) r.checked = true; }
    if (typeof salvo.imposto === 'boolean') form.imposto.checked = salvo.imposto;
    if (typeof salvo.inflacao === 'boolean') form.inflacao.checked = salvo.inflacao;

    function modo() { const r = form.querySelector('input[name="modo"]:checked'); return r ? r.value : ''; }

    function atualizarCampos() {
      const m = modo();
      form.querySelectorAll('[data-modos]').forEach(el => {
        el.hidden = !el.getAttribute('data-modos').split(' ').includes(m);
      });
      requestAnimationFrame(syncFlipCardHeight);
    }

    function atualizarProduto() {
      const personalizado = sel.value === 'personalizado';
      grupoTaxa.hidden = !personalizado;
      const p = !personalizado && DADOS && DADOS.produtos.find(x => x.id === sel.value);
      info.textContent = personalizado ? (DADOS ? T.infoPersonalizado : T.semTaxas) : p ? p.nota : '';
      requestAnimationFrame(syncFlipCardHeight);
    }

    carregarDados.then(d => {
      sel.innerHTML = '';
      (d ? d.produtos : []).forEach(p => sel.add(new Option(p.nome, p.id)));
      sel.add(new Option(T.personalizado, 'personalizado'));
      const ref = document.getElementById('taxasRef');
      if (ref && d) ref.textContent = d.referencia;
      if (salvo.produto && [...sel.options].some(o => o.value === salvo.produto)) sel.value = salvo.produto;
      else if (!d) sel.value = 'personalizado';
      atualizarProduto();
    });

    form.addEventListener('change', e => {
      if (e.target.name === 'modo') atualizarCampos();
      if (e.target === sel) atualizarProduto();
    });
    atualizarCampos();

    document.getElementById('btn-reset').addEventListener('click', () => {
      sessionStorage.removeItem(CHAVE_FORM);
      ['renda', 'inicial', 'aporte', 'anos', 'taxaAnual'].forEach(id => { form[id].value = ''; });
      form.querySelectorAll('.campo-erro').forEach(el => el.classList.remove('campo-erro'));
      erroEl.textContent = '';
    });

    form.addEventListener('submit', e => { e.preventDefault(); calcular(); });

    function calcular() {
      evento('clique_calcular');
      const m = modo();
      const produto = produtoAtual(form);
      const estado = {
        modo: m, produto: sel.value, taxaAnual: form.taxaAnual.value,
        renda: form.renda.value, inicial: form.inicial.value, aporte: form.aporte.value, anos: form.anos.value,
        imposto: form.imposto.checked, inflacao: form.inflacao.checked,
      };
      sessionStorage.setItem(CHAVE_FORM, JSON.stringify(estado));

      // Campos obrigatórios por modo
      form.querySelectorAll('.campo-erro').forEach(el => el.classList.remove('campo-erro'));
      const faltando = [];
      const visivel = id => !form[id].closest('[data-modos]').hidden;
      if (visivel('renda') && !lerValor(form.renda.value)) faltando.push('renda');
      if (visivel('anos') && !(parseInt(form.anos.value, 10) > 0)) faltando.push('anos');
      if (m === 'renda' || m === 'prazo') {
        if (!lerValor(form.inicial.value) && !lerValor(form.aporte.value)) faltando.push('inicial', 'aporte');
      }
      if (!produto) faltando.push(sel.value === 'personalizado' ? 'taxaAnual' : 'produto');
      if (faltando.length) {
        faltando.forEach(id => form[id].closest('.campo, .grupo').classList.add('campo-erro'));
        erroEl.textContent = T.erros.campos;
        requestAnimationFrame(syncFlipCardHeight);
        return;
      }

      const res = window.Simulador.simular({
        modo: m, produto,
        imposto: estado.imposto, inflacao: estado.inflacao,
        inflacaoAnual: DADOS ? DADOS.inflacaoAnual : (EN ? 3 : 4.5),
        inicial: lerValor(form.inicial.value), aporte: lerValor(form.aporte.value),
        renda: lerValor(form.renda.value), meses: (parseInt(form.anos.value, 10) || 0) * 12,
      });
      if (res.erro) {
        erroEl.textContent = T.erros[res.erro] || T.erros.campos;
        requestAnimationFrame(syncFlipCardHeight);
        return;
      }
      erroEl.textContent = '';

      sessionStorage.setItem(CHAVE_RES, JSON.stringify({
        lang: LANG, res, rendaDesejada: lerValor(form.renda.value),
        produto: { id: produto.id, nome: produto.nome, ir: produto.ir, estimativa: !!produto.estimativa },
        imposto: estado.imposto, inflacao: estado.inflacao,
        inflacaoAnual: DADOS ? DADOS.inflacaoAnual : null,
        referencia: DADOS ? DADOS.referencia : '',
        fontes: DADOS ? DADOS.fontes : '',
      }));
      evento('resultado_gerado', { modo: m, produto: produto.id, imposto: estado.imposto, inflacao: estado.inflacao });
      document.querySelector('.flip-card').classList.add('flip-card-flipped');
      setTimeout(() => { window.location.href = PAGINA_RESULTADO; }, 550);
    }
  }

  /* ===== Resultado ===== */
  const areaResultado = document.getElementById('resultado');
  let SIM = null;
  if (areaResultado) {
    try { SIM = JSON.parse(sessionStorage.getItem(CHAVE_RES) || 'null'); } catch (_) { SIM = null; }
    if (!SIM || !SIM.res || SIM.lang !== LANG) window.location.replace(HOME);
    else renderizarResultado(SIM);
  }

  function textos(S) {
    const r = S.res;
    const prazo = fmtPrazo(r.meses);
    const desejada = fmtMoeda(S.rendaDesejada || r.renda, 0);
    const acum = fmtMoeda(r.acumulado, 0);
    switch (r.modo) {
      case 'renda': return { lead: T.lead.renda(prazo), big: fmtHero(r.renda) + T.mesCurto, sub: T.sub.acum(acum) };
      case 'aporte':
        if (r.inicialBasta) return { lead: T.lead.inicialBasta(prazo), big: fmtHero(r.renda) + T.mesCurto, sub: T.sub.semAporte };
        return { lead: T.lead.aporte(desejada, prazo), big: fmtHero(r.aporte) + T.mesCurto, sub: T.sub.acum(acum) };
      case 'prazo':
        if (r.jaAtingido) return { lead: T.lead.jaAtingido(), big: fmtHero(r.renda) + T.mesCurto, sub: T.sub.jaAtingido };
        return { lead: T.lead.prazo(desejada), big: prazo, sub: T.sub.acum(acum) };
      default: return { lead: T.lead.patrimonio(desejada), big: fmtHero(r.acumulado), sub: T.sub.investidos(S.produto.nome) };
    }
  }

  function chips(S) {
    const r = S.res;
    const lista = [S.produto.nome];
    if (S.produto.ir === 'isento') lista.push(T.chips.isento);
    else lista.push(S.imposto ? T.chips.ir(r.taxa.aliquota) : T.chips.semIr);
    lista.push(S.inflacao && S.inflacaoAnual ? T.chips.hoje(S.inflacaoAnual) : T.chips.nominal);
    return lista;
  }

  function linhas(S) {
    const r = S.res, L = T.linhas;
    const m = fmtPct(r.taxa.usada * 100), a = fmtPct(r.taxaAnual * 100);
    const sufixo = [S.imposto && r.taxa.aliquota ? T.liquida : '', S.inflacao ? T.real : ''].filter(Boolean).join(', ');
    const out = [[L.produto, S.produto.nome], [L.taxa, T.taxaTxt(m, a) + (sufixo ? ` — ${sufixo}` : '')]];
    if (r.modo !== 'patrimonio') {
      out.push([L.prazo, fmtPrazo(r.meses)], [L.inicial, fmtMoeda(r.inicial)], [L.aporte, fmtMoeda(r.aporte)],
        [L.investido, fmtMoeda(r.investido)], [L.rendimentos, fmtMoeda(r.rendimentos)]);
    }
    out.push([L.acumulado, fmtMoeda(r.acumulado)], [L.renda, fmtMoeda(r.renda) + T.mesCurto]);
    return out;
  }

  function el(tag, cls, txt) { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  function renderizarResultado(S) {
    const t = textos(S);
    document.getElementById('resLead').textContent = t.lead;
    document.getElementById('resBig').textContent = t.big;
    document.getElementById('resSub').textContent = t.sub;
    const ch = document.getElementById('resChips');
    chips(S).forEach(c => ch.appendChild(el('li', null, c)));
    const dl = document.getElementById('resLista');
    linhas(S).forEach(([k, v]) => { const row = el('div', 'result-item'); row.appendChild(el('dt', null, k)); row.appendChild(el('dd', null, v)); dl.appendChild(row); });
    const aviso = [T.aviso(S.referencia || '—'), T.simplif, S.produto.estimativa ? T.estimativa(S.produto.nome) : ''].filter(Boolean).join(' ');
    document.getElementById('resAviso').textContent = aviso;
    const fontes = document.getElementById('resFontes');
    if (fontes && S.fontes) fontes.textContent = (EN ? 'Sources: ' : 'Fontes: ') + S.fontes;
    if (!S.res.pontos || S.res.pontos.length < 2) { const g = document.getElementById('sec-grafico'); if (g) g.hidden = true; }
    requestAnimationFrame(() => requestAnimationFrame(syncFlipCardHeight));
    renderizarGrafico(S);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => gerarCard(S)); else gerarCard(S);
  }

  document.getElementById('voltarBtn')?.addEventListener('click', e => {
    e.preventDefault();
    document.querySelector('.flip-card')?.classList.remove('flip-card-flipped');
    setTimeout(() => { window.location.href = HOME; }, 550);
  });

  /* ===== Gráfico ===== */
  function renderizarGrafico(S) {
    const canvas = document.getElementById('graficoPatrimonio');
    const pontos = S.res.pontos || [];
    if (!canvas || typeof Chart === 'undefined' || pontos.length < 2) return;
    const css = getComputedStyle(document.documentElement);
    const cor = n => css.getPropertyValue(n).trim();
    const sufAno = EN ? 'y' : 'a';
    new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: pontos.map(p => (p.m < 12 ? `${p.m}m` : `${Math.floor(p.m / 12)}${sufAno}`)),
        datasets: [
          { label: T.grafico[0], data: pontos.map(p => p.acum), borderColor: cor('--primary'), backgroundColor: 'rgba(106,47,214,0.10)', fill: true, tension: 0.35, pointRadius: 0, borderWidth: 2.5 },
          { label: T.grafico[1], data: pontos.map(p => p.invest), borderColor: cor('--text-soft'), backgroundColor: 'transparent', borderDash: [6, 4], fill: false, tension: 0.35, pointRadius: 0, borderWidth: 2 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { labels: { color: cor('--text'), font: { family: 'Inter', size: 12 }, boxWidth: 12 } },
          tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${fmtMoeda(c.raw, 0)}` } },
        },
        scales: {
          x: { ticks: { color: cor('--text-soft'), maxTicksLimit: 8, font: { size: 11 } }, grid: { color: cor('--border') } },
          y: {
            ticks: { color: cor('--text-soft'), font: { size: 11 }, callback: v => new Intl.NumberFormat(LOC, { style: 'currency', currency: MOEDA, notation: 'compact', maximumFractionDigits: 1 }).format(v) },
            grid: { color: cor('--border') },
          },
        },
      },
    });
  }

  /* ===== Card para compartilhar (1080×1350) ===== */
  function gerarCard(S) {
    const canvas = document.getElementById('cardCompartilhar');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 1080, H = 1350, PX = 80;
    canvas.width = W; canvas.height = H;
    const FONTE = 'Inter, system-ui, sans-serif';
    const t = textos(S);

    ctx.fillStyle = '#eef1f5'; ctx.fillRect(0, 0, W, H);
    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, '#6a2fd6'); grad.addColorStop(1, '#c026d3');

    // Cartão central
    const cx = 48, cy = 48, cw = W - 96, chh = H - 96;
    ctx.fillStyle = '#f9fafb';
    arredondado(ctx, cx, cy, cw, chh, 36); ctx.fill();
    ctx.strokeStyle = '#d6dce4'; ctx.lineWidth = 2; ctx.stroke();
    ctx.save(); arredondado(ctx, cx, cy, cw, chh, 36); ctx.clip();
    ctx.fillStyle = grad; ctx.fillRect(cx, cy, cw, 14); ctx.restore();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#6a2fd6'; ctx.font = `700 26px ${FONTE}`;
    ctx.fillText(T.card.titulo, W / 2, 136);

    let y = 250;
    ctx.fillStyle = '#4b5565'; ctx.font = `400 34px ${FONTE}`;
    for (const linha of quebrar(ctx, t.lead, W - PX * 2 - 40)) { ctx.fillText(linha, W / 2, y); y += 48; }
    y += 70;
    let fs = 104;
    ctx.font = `800 ${fs}px ${FONTE}`;
    while (ctx.measureText(t.big).width > W - PX * 2 - 40 && fs > 44) { fs -= 4; ctx.font = `800 ${fs}px ${FONTE}`; }
    ctx.fillStyle = grad; ctx.fillText(t.big, W / 2, y);
    y += 64;
    ctx.fillStyle = '#4b5565'; ctx.font = `400 30px ${FONTE}`;
    ctx.fillText(t.sub, W / 2, y);

    y += 80;
    ctx.strokeStyle = '#e1e6ec'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(PX + 20, y); ctx.lineTo(W - PX - 20, y); ctx.stroke();
    y += 60;
    ctx.textAlign = 'left'; ctx.fillStyle = '#7a8494'; ctx.font = `600 20px ${FONTE}`;
    ctx.fillText(T.card.resumo, PX + 20, y);
    const rows = linhas(S).filter(([k]) => k !== T.linhas.rendimentos);
    for (const [k, v] of rows.slice(0, 8)) {
      y += 54;
      ctx.textAlign = 'left'; ctx.fillStyle = '#4b5565'; ctx.font = `400 25px ${FONTE}`;
      ctx.fillText(k, PX + 20, y);
      ctx.textAlign = 'right'; ctx.fillStyle = '#1b2230'; ctx.font = `600 25px ${FONTE}`;
      const val = k === T.linhas.taxa ? v.split(' (')[0] : v;
      ctx.fillText(cortar(ctx, val, 520), W - PX - 20, y);
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#7a8494'; ctx.font = `400 21px ${FONTE}`;
    ctx.fillText(T.card.aviso + (S.referencia ? ` · ${S.referencia}` : ''), W / 2, H - 200);
    ctx.fillStyle = '#4b5565'; ctx.font = `400 28px ${FONTE}`;
    ctx.fillText(T.card.cta, W / 2, H - 140);
    ctx.fillStyle = grad; ctx.font = `700 40px ${FONTE}`;
    ctx.fillText(SITE, W / 2, H - 88);
  }

  function arredondado(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function quebrar(ctx, texto, max) {
    const palavras = texto.split(' '), out = [];
    let linha = '';
    for (const p of palavras) {
      const teste = linha ? linha + ' ' + p : p;
      if (ctx.measureText(teste).width > max && linha) { out.push(linha); linha = p; } else linha = teste;
    }
    if (linha) out.push(linha);
    return out;
  }
  function cortar(ctx, txt, max) {
    let s = txt;
    while (ctx.measureText(s).width > max && s.length > 4) s = s.slice(0, -2);
    return s === txt ? s : s + '…';
  }

  /* ===== Compartilhar ===== */
  function fraseCompartilhar(S) {
    const t = textos(S);
    return `${t.lead} ${t.big} ${t.sub}. 🎯`;
  }

  window.compartilharWhatsApp = function () {
    if (!SIM) return;
    evento('compartilhar', { metodo: 'whatsapp' });
    const corpo = linhas(SIM).map(([k, v]) => `${k}: ${v}`).join('\n');
    const msg = `${fraseCompartilhar(SIM)}\n\n${corpo}\n\n${T.card.aviso}\n${T.zap.cta} ${URL_SITE}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  };

  window.compartilharResultado = async function () {
    const canvas = document.getElementById('cardCompartilhar');
    if (!canvas || !SIM) return;
    evento('compartilhar', { metodo: 'imagem' });
    const texto = fraseCompartilhar(SIM);
    if (navigator.share) {
      try {
        const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
        const file = new File([blob], 'minha-renda-passiva.png', { type: 'image/png' });
        const dados = navigator.canShare && navigator.canShare({ files: [file] })
          ? { files: [file], text: texto, url: URL_SITE }
          : { text: `${texto}\n\n${URL_SITE}` };
        await navigator.share(dados);
        return;
      } catch (err) {
        if (err && err.name === 'AbortError') return;
      }
    }
    const link = document.createElement('a');
    link.download = 'minha-renda-passiva.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Clique no card abre em tamanho real
  const cardCanvas = document.getElementById('cardCompartilhar');
  if (cardCanvas) {
    const overlay = el('div', 'lightbox-overlay');
    const img = el('img');
    img.alt = EN ? 'Your result card' : 'Card com seu resultado';
    overlay.appendChild(img);
    document.body.appendChild(overlay);
    cardCanvas.addEventListener('click', () => { img.src = cardCanvas.toDataURL('image/png'); overlay.classList.add('active'); });
    overlay.addEventListener('click', () => overlay.classList.remove('active'));
  }

  /* ===== Voltar ao topo ===== */
  const topo = document.getElementById('backToTop');
  if (topo) {
    window.addEventListener('scroll', () => { topo.style.display = document.documentElement.scrollTop > 400 ? 'flex' : 'none'; }, { passive: true });
    topo.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  requestAnimationFrame(() => requestAnimationFrame(syncFlipCardHeight));
})();
