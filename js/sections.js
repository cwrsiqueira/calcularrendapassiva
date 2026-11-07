/* Seções montadas abaixo da calculadora.
   <script src="/js/sections.js" data-pagina="home|resultado">
   home      → acesso rápido + Footer CRP + blog
   resultado → planilha grátis + afiliados (PT) + app (PT) + Footer CRP + acesso rápido */
(function () {
  const script = document.currentScript;
  const EN = /^\/en(\/|$)/.test(location.pathname);
  const PAGINA = script.getAttribute('data-pagina') || 'home';

  const icone = (nome, extra) => '<i class="fa-solid ' + nome + (extra ? ' ' + extra : '') + '" aria-hidden="true"></i>';
  const cabecalho = (ic, titulo, tag) => '<div class="card-header"><span class="card-icon">' + icone(ic) + '</span><' + (tag || 'h2') + ' class="card-title">' + titulo + '</' + (tag || 'h2') + '></div>';

  function email() {
    const t = EN
      ? { titulo: 'Free passive income spreadsheet', sub: 'How much you need invested for $500 to $10,000/month — across savings, HYSA, JEPI, SCHD and dividend stocks. Sent to your inbox.', ph: 'your@email.com', btn: 'Get my spreadsheet', lgpd: 'We only use your email to send the spreadsheet and tips. Unsubscribe anytime.', termos: '/en/terms.html', termosTxt: 'Privacy policy' }
      : { titulo: 'Planilha grátis de renda passiva', sub: 'Quanto você precisa investir para cada meta mensal — em poupança, CDB, LCI/LCA, FII e ações. Enviada no seu e-mail.', ph: 'seu@email.com', btn: 'Quero a planilha', lgpd: 'Usamos seu e-mail só para enviar a planilha e dicas. Cancele quando quiser.', termos: '/termos-de-uso-e-politicas-de-privacidade.html', termosTxt: 'Política de privacidade' };
    return '<section id="sec-email" class="card email-section" aria-label="' + t.titulo + '">' + cabecalho('fa-table', t.titulo) +
      '<p class="card-sub">' + t.sub + '</p>' +
      '<form id="emailForm" class="email-form" novalidate>' +
        '<input type="text" name="website" id="emailWebsite" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0" />' +
        '<div class="email-row"><label class="sr-only" for="emailInput">E-mail</label><input type="email" id="emailInput" class="email-input" placeholder="' + t.ph + '" autocomplete="email" required />' +
        '<button type="submit" id="emailBtn" class="btn-primary email-btn">' + t.btn + '</button></div>' +
        '<p id="emailMsg" class="email-msg" aria-live="polite"></p>' +
        '<p class="email-lgpd">' + t.lgpd + ' <a href="' + t.termos + '" target="_blank" rel="noopener">' + t.termosTxt + '</a>.</p>' +
      '</form></section>';
  }

  function app() {
    return '<section id="sec-app" class="card" aria-label="App da Calculadora">' + cabecalho('fa-mobile-screen', 'Simule onde e quando quiser') +
      '<p class="card-sub">O app gratuito traz as simulações do site para o seu celular. Sem login. Sem cadastro.</p>' +
      '<div class="store-grid">' +
        '<a href="https://play.google.com/store/apps/details?id=com.cwrsiqueira.crp_app&pcampaignid=web_share" target="_blank" rel="noopener" class="btn-store"><i class="fa-brands fa-google-play" aria-hidden="true"></i><span><small>Disponível no</small>Google Play</span></a>' +
        '<a href="https://apps.apple.com/us/app/calculadora-renda-passiva/id6762054224" target="_blank" rel="noopener" class="btn-store"><i class="fa-brands fa-apple" aria-hidden="true"></i><span><small>Baixar na</small>App Store</span></a>' +
      '</div>' +
      '<p class="card-note">' + icone('fa-crown') + ' Versão PRO: zero anúncios + histórico ilimitado — pagamento único, sem assinatura.</p>' +
      '</section>';
  }

  function link(href, ic, titulo, desc, externo) {
    return '<li><a href="' + href + '" class="quick-link"' + (externo ? ' target="_blank" rel="noopener"' : '') + '>' +
      '<span class="quick-link-icon">' + icone(ic) + '</span>' +
      '<span class="quick-link-text"><strong>' + titulo + '</strong><small>' + desc + '</small></span>' +
      icone(externo ? 'fa-arrow-up-right-from-square' : 'fa-chevron-right', 'quick-link-arrow') + '</a></li>';
  }

  function acessos() {
    const itens = EN ? [
      link('/en/articles', 'fa-newspaper', 'All articles & simulations', 'How much $100k–$10M earns, how much to invest for each goal'),
      link('/en/articles/how-to-use-passive-income-calculator', 'fa-circle-question', 'How to use the calculator', 'Step-by-step guide'),
      link('/en/articles/fire-movement-guide', 'fa-fire', 'FIRE movement guide', 'Financial independence, retire early'),
      link('https://donate.stripe.com/aFa4gA02K0mkfiedkUcwg03', 'fa-hand-holding-heart', 'Support the site', 'Help keep this calculator free', true),
      link('/', 'fa-globe', 'Versão em português', 'Calculadora de renda passiva para o Brasil'),
    ] : [
      link('/artigos', 'fa-newspaper', 'Artigos e simulações', 'Quanto rende cada valor, quanto investir para cada meta'),
      link('/articles/como-usar-calculadora-renda-passiva', 'fa-circle-question', 'Como usar a calculadora', 'Passo a passo da simulação'),
      link('https://play.google.com/store/apps/details?id=com.cwrsiqueira.crp_app&pcampaignid=web_share', 'fa-mobile-screen', 'App para Android e iPhone', 'Grátis no Google Play e na App Store', true),
      link('https://calcularaposentadoria.com', 'fa-umbrella-beach', 'Calculadora de aposentadoria', 'Quanto juntar para se aposentar', true),
      link('https://calcularemprestimo.com', 'fa-money-bill-wave', 'Calculadora de empréstimo', 'Parcelas nas tabelas PRICE e SAC', true),
      link('https://calculadorasfinanceiras.com.br', 'fa-calculator', 'Todas as calculadoras financeiras', 'Ferramentas gratuitas em um só lugar', true),
      link('https://charconverter.com', 'fa-font', 'Conversor de caracteres', 'Remova acentos e caracteres especiais', true),
      link('https://donate.stripe.com/8x25kE16O5GEb1Y3Kkcwg04', 'fa-hand-holding-heart', 'Apoie o site', 'Ajude a manter a calculadora gratuita', true),
      link('/en/', 'fa-globe', 'English version', 'Passive income calculator for the U.S.'),
    ];
    return '<nav id="sec-acessos" class="card" aria-label="' + (EN ? 'Quick links' : 'Acesso rápido') + '">' +
      cabecalho('fa-compass', EN ? 'Quick links' : 'Acesso rápido') +
      '<ul class="quick-links">' + itens.join('') + '</ul></nav>';
  }

  function artigo(href, titulo, desc) {
    return '<li><a href="' + href + '" class="post-link"><strong>' + titulo + '</strong><small>' + desc + '</small></a></li>';
  }

  function blog() {
    const posts = EN ? [
      artigo('/en/articles/how-much-does-1-million-earn-per-month', 'How Much Does $1 Million Earn per Month?', 'Savings, CDs, T-bills, dividend ETFs and the 4% rule with current rates.'),
      artigo('/en/articles/how-much-to-invest-to-make-5k-a-month', 'How Much to Invest to Make $5,000 a Month', 'The exact amount you need and how long it takes to get there.'),
      artigo('/en/articles/best-dividend-etfs', 'Best Dividend ETFs 2026: SCHD vs VYM vs JEPI', 'Yields, expense ratios and monthly income compared.'),
      artigo('/en/articles/how-much-to-retire', 'How Much Do You Need to Retire?', 'The 4% rule, Social Security, and real-world numbers.'),
      artigo('/en/articles/how-long-to-save-1-million-investing-1000-a-month', 'How Long to Save $1 Million at $1,000 a Month', 'Timelines at 6%, 8% and 10%.'),
      artigo('/en/articles/how-to-build-passive-income', 'How to Build Passive Income from Scratch', 'From your first $100 to $5,000/month.'),
      artigo('/en/articles/401k-vs-roth-ira', '401(k) vs Roth IRA: Which Is Better?', 'Tax treatment, limits and employer match.'),
      artigo('/en/articles/what-is-passive-income', 'What is Passive Income?', 'The concept and the main ways to build it.'),
    ] : [
      artigo('/artigos/quanto-rende-500-mil-reais-por-mes', 'Quanto rende R$ 500 mil por mês?', 'Poupança, CDB, LCI/LCA, Tesouro Selic e FIIs lado a lado.'),
      artigo('/artigos/ganhar-5-mil-por-mes', 'Quanto investir para ganhar R$ 5.000/mês', 'Patrimônio necessário por tipo de investimento.'),
      artigo('/artigos/quanto-rende-1-milhao-investido', 'Quanto rende 1 milhão investido por mês?', 'Todos os cenários com as taxas do mês.'),
      artigo('/artigos/quanto-rende-100-mil-reais-por-mes', 'Quanto rende R$ 100 mil por mês?', 'Rendimento mensal em cada investimento.'),
      artigo('/artigos/quanto-investir-para-renda-de-2-mil', 'Quanto investir para R$ 2.000/mês de renda', 'Simulações com Tesouro, CDB, FIIs e ações.'),
      artigo('/artigos/como-viver-de-renda-passiva', 'Como viver de renda passiva', 'Quanto você precisa, onde investir e como chegar lá.'),
      artigo('/artigos/cdb-ou-tesouro-direto', 'CDB ou Tesouro Direto: qual rende mais?', 'Rentabilidade, segurança, liquidez e IR.'),
      artigo('/articles/o-que-e-renda-passiva', 'O que é renda passiva?', 'O conceito e as principais formas de construir.'),
    ];
    return '<section id="blog" class="card" aria-label="' + (EN ? 'Articles' : 'Artigos') + '">' +
      cabecalho('fa-newspaper', EN ? 'From the blog' : 'Do blog') +
      '<ul class="post-list">' + posts.join('') + '</ul>' +
      '<div class="card-actions"><a href="' + (EN ? '/en/articles' : '/artigos') + '" class="btn-secondary">' +
      (EN ? 'See all articles' : 'Ver todos os artigos') + ' ' + icone('fa-arrow-right') + '</a></div>' +
      '</section>';
  }

  // Footer CRP (2º bloco fixo de AdSense) — antes da última seção
  const footerAd = '<div class="ad-footer"><ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-5865817649832793" data-ad-slot="7851150331" data-ad-format="auto" data-full-width-responsive="true"></ins></div>';

  const html = PAGINA === 'resultado'
    ? email() + (EN ? '' : '<div data-afiliados="secao"></div>' + app()) + footerAd + acessos()
    : footerAd + blog();

  script.insertAdjacentHTML('afterend', html);
  (window.adsbygoogle = window.adsbygoogle || []).push({});

  // Na home, o acesso rápido fica ao lado da calculadora (coluna lateral)
  const lateral = document.getElementById('lateral');
  if (lateral && PAGINA === 'home') lateral.insertAdjacentHTML('afterbegin', acessos());
})();
