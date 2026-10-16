// Template de artigo PT — mesma estrutura dos artigos em artigos/*.html
// Usado por scripts/paginas.js (páginas programáticas) e pela importação dos artigos do Lovable.

const SITE = 'https://calcularrendapassiva.com';
const CSS_VERSION = '2026101501';
const AD_CLIENT = 'ca-pub-5865817649832793';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function jsonLd(obj) {
  return '  <script type="application/ld+json">\n  ' + JSON.stringify(obj, null, 2).replace(/\n/g, '\n  ') + '\n  </script>\n';
}

/**
 * @param {object} a
 * @param {string} a.slug            caminho sem barra inicial, ex.: "artigos/cdb-ou-tesouro-direto"
 * @param {string} a.title           <title>
 * @param {string} a.description     meta description
 * @param {string} a.h1
 * @param {string} a.breadcrumb      nome curto para o BreadcrumbList
 * @param {string} a.meta            linha abaixo do H1 (tempo de leitura, data)
 * @param {string} a.datePublished   YYYY-MM-DD
 * @param {string} a.dateModified    YYYY-MM-DD
 * @param {string} a.body            HTML do corpo (sem o anúncio do topo)
 * @param {Array}  [a.faq]           [{q, a}] — gera FAQPage
 * @param {Array}  [a.related]       [{href, title}] — bloco "Leia também"
 * @param {string} [a.cta]           texto do CTA final
 */
function renderArticle(a) {
  const url = `${SITE}/${a.slug}`;
  let ld = jsonLd({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.description,
    datePublished: a.datePublished,
    dateModified: a.dateModified,
    author: { '@type': 'Person', name: 'Carlos Wagner' },
    publisher: { '@type': 'Organization', name: 'Calculadora Renda Passiva', url: SITE },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  });
  ld += jsonLd({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Artigos', item: `${SITE}/artigos` },
      ...(a.slug === 'artigos' ? [] : [{ '@type': 'ListItem', position: 3, name: a.breadcrumb, item: url }]),
    ],
  });
  if (a.faq && a.faq.length) {
    ld += jsonLd({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: a.faq.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/<[^>]+>/g, '') },
      })),
    });
  }

  const faqHtml = a.faq && a.faq.length
    ? '\n            <h2>Perguntas Frequentes</h2>\n' + a.faq.map(f => `            <h3>${f.q}</h3>\n            <p>${f.a}</p>`).join('\n') + '\n'
    : '';

  const relatedHtml = a.related && a.related.length
    ? `
            <h2>Leia Também</h2>
            <ul>
${a.related.map(r => `              <li><a href="${r.href}">${r.title}</a></li>`).join('\n')}
            </ul>
`
    : '';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(a.title)}</title>
  <meta name="description" content="${esc(a.description)}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${url}" />
  <link rel="alternate" hreflang="pt-BR" href="${url}" />
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <meta name="theme-color" content="#7d38f0" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${esc(a.title)}" />
  <meta property="og:description" content="${esc(a.description)}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:locale" content="pt_BR" />
${ld}  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-V1JD0D4KM1"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-V1JD0D4KM1');</script>
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT}" crossorigin="anonymous"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
  <link rel="stylesheet" href="/css/style.css?v=${CSS_VERSION}" />
</head>
<body>

  <div class="wrapper">
    <main class="content">
      <div class="calculadora-container">
        <script src="/js/header-card.js"></script>
        <article class="card">
          <a href="/" class="article-back"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Voltar para a Calculadora</a>

          <h1 class="article-title">${a.h1}</h1>
          <p class="article-meta">${a.meta}</p>

          <div class="article-content">
            <!-- CRP top -->
            <div class="ad-top"><ins class="adsbygoogle" style="display:block" data-ad-client="${AD_CLIENT}" data-ad-slot="8539778688" data-ad-format="horizontal" data-full-width-responsive="true"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script></div>

${a.body}
${faqHtml}${relatedHtml}          </div>

          <!-- Footer CRP -->
          <div class="ad-footer">
            <ins class="adsbygoogle" style="display:block" data-ad-client="${AD_CLIENT}" data-ad-slot="7851150331" data-ad-format="auto" data-full-width-responsive="true"></ins>
            <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
          </div>

          <div class="article-cta">
            <p><i class="fa-solid fa-calculator" aria-hidden="true"></i> ${a.cta || 'Simule sua renda passiva com seus próprios números.'}</p>
            <a href="/" class="btn-article">Usar a Calculadora Grátis <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>
          </div>
        </article>
      </div>
      <script src="/js/ads.js"></script>
    </main>

    <footer>
      <p>&copy; 2026 Calcular Renda Passiva. Todos os direitos reservados.</p>
      <a href="/termos-de-uso-e-politicas-de-privacidade" target="_blank">Termos de Uso e Políticas de Privacidade</a>
      <p style="margin-top:0.25rem;">Desenvolvido com ❤️ por <a href="https://carlosdev.com.br" target="_blank" rel="noopener">Carlos Dev</a></p>
      <div class="social-icons">
        <a href="https://www.youtube.com/@carlosjornadadev" target="_blank" rel="noopener" aria-label="YouTube"><i class="fab fa-youtube" aria-hidden="true"></i></a>
        <a href="https://github.com/cwrsiqueira" target="_blank" rel="noopener" aria-label="GitHub"><i class="fab fa-github" aria-hidden="true"></i></a>
        <a href="https://www.linkedin.com/in/carloswagner1975/" target="_blank" rel="noopener" aria-label="LinkedIn"><i class="fab fa-linkedin" aria-hidden="true"></i></a>
      </div>
    </footer>
  </div>

  <script>window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments);};</script>
  <script defer src="/_vercel/insights/script.js"></script>
</body>
</html>
`;
}

module.exports = { SITE, renderArticle, esc };
