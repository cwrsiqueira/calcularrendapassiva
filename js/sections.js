(function () {
  const EN = /^\/en(\/|$)/.test(location.pathname);

  function iconThumb(icon, color) {
    return '<div class="article-icon-thumb" style="color:' + color + '" aria-hidden="true"><i class="fa-solid ' + icon + '"></i></div>';
  }

  function articleCard(href, icon, color, title, desc) {
    return '<article><a href="' + href + '" class="article-card">' +
      iconThumb(icon, color) +
      '<div class="article-body"><strong>' + title + '</strong><small>' + desc + '</small></div>' +
      '</a></article>';
  }

  function emailPT() {
    return '<section id="sec-email" class="card email-section" aria-label="Planilha gratuita">' +
      '<div class="card-header"><div class="card-icon"><i class="fa-solid fa-table" style="color:#eb47eb;font-size:32px;" aria-hidden="true"></i></div><span class="card-title">Planilha grátis de renda passiva</span></div>' +
      '<p class="email-subtitle">Quanto você precisa investir para cada meta mensal — em poupança, CDB, LCI/LCA, FII e ações. Enviado no seu email.</p>' +
      '<form id="emailForm" class="email-form" novalidate><div class="email-row"><input type="email" id="emailInput" class="email-input" placeholder="seu@email.com" autocomplete="email" required /><button type="submit" id="emailBtn" class="btn-primary email-btn">Quero a planilha</button></div><p id="emailMsg" class="email-msg" aria-live="polite"></p></form>' +
      '</section>';
  }

  function emailEN() {
    return '<section id="sec-email" class="card email-section" aria-label="Free spreadsheet">' +
      '<div class="card-header"><div class="card-icon"><i class="fa-solid fa-table" style="color:#eb47eb;font-size:32px;" aria-hidden="true"></i></div><span class="card-title">Free passive income spreadsheet</span></div>' +
      '<p class="email-subtitle">How much you need invested for $500 to $10,000/month — across savings, HYSA, JEPI, SCHD and dividend stocks. Sent to your inbox.</p>' +
      '<form id="emailForm" class="email-form" novalidate><div class="email-row"><input type="email" id="emailInput" class="email-input" placeholder="your@email.com" autocomplete="email" required /><button type="submit" id="emailBtn" class="btn-primary email-btn">Get my spreadsheet</button></div><p id="emailMsg" class="email-msg" aria-live="polite"></p></form>' +
      '</section>';
  }

  function appPT() {
    return '<section id="sec-app" class="card" aria-label="App da Calculadora">' +
      '<div class="card-header"><div class="card-icon"><i class="fa-solid fa-mobile-screen" style="color:#eb47eb;font-size:32px;" aria-hidden="true"></i></div><span class="card-title">Simule onde e quando quiser</span></div>' +
      '<p class="email-subtitle">O app gratuito traz todas as simulações do site para o seu celular. Sem login. Sem cadastro.</p>' +
      '<div class="support-grid">' +
        '<div><a href="https://play.google.com/store/apps/details?id=com.cwrsiqueira.crp_app&pcampaignid=web_share" target="_blank" rel="noopener" class="btn-dark"><i class="fa-brands fa-google-play btn-dark-icon" aria-hidden="true"></i><span>Google Play</span></a><p class="support-note">Android — gratuito</p></div>' +
        '<div><a href="https://apps.apple.com/us/app/calculadora-renda-passiva/id6762054224" target="_blank" rel="noopener" class="btn-dark"><i class="fa-brands fa-apple btn-dark-icon" aria-hidden="true"></i><span>App Store</span></a><p class="support-note">iPhone — gratuito</p></div>' +
      '</div>' +
      '<p class="affiliate-disclaimer"><i class="fa-solid fa-crown" aria-hidden="true"></i> Versão PRO disponível: zero anúncios + histórico ilimitado — pagamento único, sem assinatura</p>' +
      '</section>';
  }

  function apoioPT() {
    return '<section id="sec-apoio" class="card" aria-label="Apoie o site">' +
      '<div class="card-header"><div class="card-icon"><i class="fa-solid fa-coins" style="color:#eb47eb;font-size:32px;" aria-hidden="true"></i></div><span class="card-title">Ajude a manter o site</span></div>' +
      '<div class="support-grid">' +
        '<div><a href="https://donate.stripe.com/8x25kE16O5GEb1Y3Kkcwg04" target="_blank" rel="noopener" class="btn-dark"><i class="fa-solid fa-hand-holding-dollar btn-dark-icon" aria-hidden="true"></i><span>Doação</span></a><p class="support-note">Sua contribuição ajuda a manter o site gratuito.</p></div>' +
      '</div></section>';
  }

  function apoioEN() {
    return '<section id="sec-apoio" class="card" aria-label="Support the site">' +
      '<div class="card-header"><div class="card-icon"><i class="fa-solid fa-coins" style="color:#eb47eb;font-size:32px;" aria-hidden="true"></i></div><span class="card-title">Help keep this site running</span></div>' +
      '<div class="support-grid"><div><a href="https://donate.stripe.com/aFa4gA02K0mkfiedkUcwg03" target="_blank" rel="noopener" class="btn-dark"><i class="fa-solid fa-hand-holding-dollar btn-dark-icon" aria-hidden="true"></i><span>Donate</span></a><p class="support-note">Your contribution helps keep this site free.</p></div></div>' +
      '</section>';
  }

  function toolsPT() {
    return '<section id="sec-ferramentas" class="card" aria-label="Outras ferramentas">' +
      '<div class="card-header"><div class="card-icon"><i class="fa-solid fa-screwdriver-wrench" style="color:#eb47eb;font-size:32px;" aria-hidden="true"></i></div><span class="card-title">Outras ferramentas</span></div>' +
      '<div class="tools-grid">' +
        '<a href="https://charconverter.com" target="_blank" rel="noopener" class="tool-card"><i class="fa-solid fa-font tool-card-icon" aria-hidden="true"></i><div><strong>Conversor de Caracteres</strong><small>Converta textos, remova acentos e caracteres especiais.</small></div></a>' +
        '<a href="https://calcularemprestimo.com" target="_blank" rel="noopener" class="tool-card"><i class="fa-solid fa-money-bill-wave tool-card-icon" aria-hidden="true"></i><div><strong>Calculadora de Empréstimo</strong><small>Calcule parcelas, prazo ou taxa nas tabelas PRICE ou SAC.</small></div></a>' +
        '<a href="https://calcularaposentadoria.com" target="_blank" rel="noopener" class="tool-card"><i class="fa-solid fa-umbrella-beach tool-card-icon" aria-hidden="true"></i><div><strong>Calculadora de Aposentadoria</strong><small>Planeje sua aposentadoria estimando o valor necessário.</small></div></a>' +
        '<a href="https://calculadorasfinanceiras.com.br" target="_blank" rel="noopener" class="tool-card"><i class="fa-solid fa-calculator tool-card-icon" aria-hidden="true"></i><div><strong>Calculadoras Financeiras</strong><small>Todas as nossas ferramentas gratuitas em um só lugar.</small></div></a>' +
      '</div></section>';
  }

  function articlesPT() {
    return '<section class="card" id="blog" aria-label="Artigos">' +
      '<div class="card-header"><div class="card-icon"><i class="fa-solid fa-newspaper" style="color:#eb47eb;font-size:32px;" aria-hidden="true"></i></div><span class="card-title">Artigos</span></div>' +
      '<article><a href="/artigos/quanto-rende-500-mil-reais-por-mes" class="article-featured">' +
        '<div class="article-featured-banner" aria-hidden="true"><i class="fa-solid fa-coins"></i></div>' +
        '<strong>Quanto Rende R$ 500 Mil por Mês?</strong>' +
        '<small>Simulação completa em poupança, CDB, LCI/LCA, Tesouro Selic e FIIs. Veja qual opção rende mais em 2026.</small>' +
      '</a></article>' +
      articleCard('/artigos/ganhar-5-mil-por-mes',               'fa-bullseye',       '#7d38f0', 'Quanto Investir para Ganhar R$ 5.000/mês',          'Patrimônio necessário por tipo de investimento — com prazo e aportes mensais.') +
      articleCard('/artigos/quanto-rende-200-mil-reais-por-mes', 'fa-coins',          '#10b981', 'Quanto Rende R$ 200 Mil por Mês?',                  'Simulação completa em poupança, CDB, LCI/LCA e FIIs — valores reais de 2026.') +
      articleCard('/artigos/quanto-rende-1-milhao-investido',    'fa-coins',          '#f59e0b', 'Quanto Rende 1 Milhão Investido por Mês?',           'Com R$ 1 milhão você pode gerar até R$ 10.688/mês. Veja todos os cenários.') +
      articleCard('/artigos/quanto-rende-100-mil-reais-por-mes', 'fa-coins',          '#10b981', 'Quanto Rende R$ 100 Mil por Mês?',                  'Rendimento mensal em poupança, CDB, LCI/LCA e FIIs — atualizado para 2026.') +
      articleCard('/artigos/quanto-rende-50-mil-reais-por-mes',  'fa-coins',          '#10b981', 'Quanto Rende R$ 50 Mil por Mês?',                   'Simulação completa e o próximo passo para quem está construindo patrimônio.') +
      articleCard('/artigos/quanto-investir-para-renda-de-2-mil','fa-bullseye',       '#7d38f0', 'Quanto Investir para R$ 2.000/mês de Renda Passiva','Simulações com Tesouro, CDB, FIIs e ações para alcançar R$ 2.000 mensais.') +
      articleCard('/articles/como-usar-calculadora-renda-passiva','fa-circle-question','#3b82f6', 'Como Usar a Calculadora de Renda Passiva',          'Aprenda como preencher os campos e simule sua independência financeira.') +
      articleCard('/articles/o-que-e-renda-passiva',             'fa-book-open',      '#f59e0b', 'O que é Renda Passiva?',                            'Entenda o conceito e as principais formas de gerar renda passiva automaticamente.') +
      articleCard('/articles/entendendo-os-resultados',          'fa-chart-bar',      '#e847eb', 'Entendendo os Resultados',                          'Interprete patrimônio acumulado, rendimentos e o impacto de cada variável.') +
      '</section>';
  }

  function articlesEN() {
    return '<section class="card" id="blog" aria-label="Articles">' +
      '<div class="card-header"><div class="card-icon"><i class="fa-solid fa-newspaper" style="color:#eb47eb;font-size:32px;" aria-hidden="true"></i></div><span class="card-title">Articles</span></div>' +
      '<article><a href="/en/articles/best-dividend-etfs" class="article-featured">' +
        '<div class="article-featured-banner" aria-hidden="true"><i class="fa-solid fa-chart-line"></i></div>' +
        '<strong>Best Dividend ETFs 2026: SCHD vs VYM vs JEPI</strong>' +
        '<small>Current yields, expense ratios and which ETF actually delivers consistent monthly passive income.</small>' +
      '</a></article>' +
      articleCard('/en/articles/how-much-to-retire',                    'fa-umbrella-beach', '#f59e0b', 'How Much Do You Need to Retire?',               'The 4% rule, Social Security, and real-world retirement numbers for every income level.') +
      articleCard('/en/articles/401k-vs-roth-ira',                      'fa-scale-balanced', '#3b82f6', '401(k) vs Roth IRA: Which Is Better?',          'Tax treatment, contribution limits, and employer matching compared.') +
      articleCard('/en/articles/how-to-build-passive-income',           'fa-seedling',       '#10b981', 'How to Build Passive Income from Scratch',       'Step-by-step from your first $100 invested to $5,000/month in recurring income.') +
      articleCard('/en/articles/sp500-historical-returns',              'fa-chart-bar',      '#7d38f0', 'S&amp;P 500 Historical Returns Explained',       '100 years of data and why time in the market beats timing the market.') +
      articleCard('/en/articles/what-is-passive-income',                'fa-book-open',      '#f59e0b', 'What is Passive Income?',                        'The concept and main ways to generate an automatic income stream.') +
      articleCard('/en/articles/how-to-use-passive-income-calculator',  'fa-circle-question','#3b82f6', 'How to Use the Passive Income Calculator',       'Step-by-step guide to simulating your path to financial independence.') +
      '</section>';
  }

  const AD_CLIENT = 'ca-pub-5865817649832793';

  function pushAd() {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }

  // Footer CRP — antes da última seção (Artigos)
  const footerAd = '<div class="ad-footer"><ins class="adsbygoogle" style="display:inline-block;width:328px;height:90px" data-ad-client="' + AD_CLIENT + '" data-ad-slot="7851150331"></ins></div>';

  const html = EN
    ? emailEN() + apoioEN() + footerAd + articlesEN()
    : emailPT() + appPT() + apoioPT() + toolsPT() + footerAd + articlesPT();

  document.currentScript.insertAdjacentHTML('afterend', html);
  pushAd();
})();
