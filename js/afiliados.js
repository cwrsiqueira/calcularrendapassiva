/* ===== Afiliados Hotmart — fonte única dos links =====
   Preenche todo elemento [data-afiliados] da página.
   data-afiliados="secao" → card completo (home e resultados); vazio → bloco dentro do artigo.
   A ordem dos produtos segue o assunto da página (URL). */
(function () {
  const PRODUTOS = {
    curso: {
      nome: 'Liberdade Financeira Sem Mistérios',
      beneficio: 'Curso para construir sua renda passiva partindo do zero, passo a passo',
      logo: '<i class="fa-solid fa-graduation-cap" aria-hidden="true"></i>', classe: 'affiliate-logo-ebook',
      href: 'https://go.hotmart.com/W105671119E', botao: 'Quero começar',
    },
    irm: {
      nome: 'Método IRM',
      beneficio: 'Estratégias de renda usadas por grandes fortunas, com Tesouro Direto e renda fixa',
      logo: 'IRM', classe: 'affiliate-logo-irm',
      href: 'https://go.hotmart.com/F105671164L', botao: 'Quero aprender',
    },
    planilha: {
      nome: 'Simulador de Renda Passiva FII',
      beneficio: 'Planilhas para simular sua carteira de fundos imobiliários e a renda mensal',
      logo: '<i class="fa-solid fa-table" aria-hidden="true"></i>', classe: 'affiliate-logo-planilha',
      href: 'https://go.hotmart.com/P83025749U', botao: 'Quero a planilha',
    },
  };

  const caminho = location.pathname;
  const ordem = /tesouro|cdb|selic|renda-fixa|poupanca|lci|juros|taxa/.test(caminho) ? ['irm', 'curso', 'planilha']
    : /fii|fundos|imobiliari|dividendo/.test(caminho) ? ['planilha', 'curso', 'irm']
    : ['curso', 'irm', 'planilha'];

  const card = id => {
    const p = PRODUTOS[id];
    return '<div class="affiliate-card"><span class="affiliate-badge">Recomendado</span>' +
      '<div class="affiliate-logo ' + p.classe + '">' + p.logo + '</div>' +
      '<p class="affiliate-name">' + p.nome + '</p><p class="affiliate-benefit">' + p.beneficio + '</p>' +
      '<a href="' + p.href + '" target="_blank" rel="noopener sponsored" class="btn-affiliate" data-produto="' + id + '">' +
      p.botao + ' <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a></div>';
  };
  const grid = '<div class="affiliates-grid">' + ordem.map(card).join('') + '</div>' +
    '<p class="affiliate-disclaimer"><i class="fa-solid fa-circle-info" aria-hidden="true"></i> Links de afiliado — sem custo adicional para você</p>';

  document.querySelectorAll('[data-afiliados]').forEach(el => {
    el.innerHTML = el.getAttribute('data-afiliados') === 'secao'
      ? '<section id="sec-afiliados" class="card affiliates-section" aria-label="Cursos de investimento">' +
        '<div class="card-header"><div class="card-icon"><i class="fa-solid fa-graduation-cap" style="color:#eb47eb;font-size:32px;" aria-hidden="true"></i></div><span class="card-title">Aprenda a investir e viva de renda</span></div>' +
        '<p class="affiliates-subtitle">Cursos e ferramentas selecionados para te ajudar a alcançar sua renda passiva</p>' + grid + '</section>'
      : '<div class="affiliates-section"><h2>Para Ir Além: Cursos e Ferramentas Recomendados</h2>' + grid + '</div>';
  });

  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[data-produto]');
    if (a && typeof gtag === 'function') gtag('event', 'clique_afiliado', { produto: a.getAttribute('data-produto'), pagina: caminho });
  });
})();
