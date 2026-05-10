(function () {
  const path = window.location.pathname;
  const isEn = path.startsWith('/en');

  // Bilingual pairs: current path → alternate language URL
  const PAIRS = {
    '/':    '/en/',
    '/en/': '/',
    '/articles/o-que-e-renda-passiva.html':          '/en/articles/what-is-passive-income.html',
    '/articles/como-usar-calculadora-renda-passiva.html': '/en/articles/how-to-use-passive-income-calculator.html',
    '/en/articles/what-is-passive-income.html':          '/articles/o-que-e-renda-passiva.html',
    '/en/articles/how-to-use-passive-income-calculator.html': '/articles/como-usar-calculadora-renda-passiva.html',
  };

  const title    = isEn ? 'Passive Income Calculator'      : 'Calculadora de Renda Passiva';
  const subtitle = isEn
    ? 'Discover how much to invest to live off passive income.'
    : 'Descubra quanto investir para viver de renda.';

  const altUrl = PAIRS[path] || null;

  let langHtml = '';
  if (altUrl) {
    langHtml = isEn
      ? `<div class="lang-switch"><i class="fa-solid fa-globe" aria-hidden="true"></i><a href="${altUrl}" class="lang-link">PT</a><span class="lang-sep">|</span><span class="lang-active">EN</span></div>`
      : `<div class="lang-switch"><i class="fa-solid fa-globe" aria-hidden="true"></i><span class="lang-active">PT</span><span class="lang-sep">|</span><a href="${altUrl}" class="lang-link">EN</a></div>`;
  }

  const card = document.createElement('div');
  card.className = 'card header-card';
  card.innerHTML =
    '<div class="header-card-brand">' +
      '<i class="fa-solid fa-calculator header-card-icon" aria-hidden="true"></i>' +
      '<div>' +
        '<span class="header-card-title">' + title + '</span>' +
        '<span class="header-card-subtitle">' + subtitle + '</span>' +
      '</div>' +
    '</div>' +
    langHtml;

  const script = document.currentScript;
  script.parentElement.insertBefore(card, script);
})();

// Google AdSense vignette fix — runs on all pages via this shared script.
// When AdSense injects a vignette it adds #google_vignette to the URL.
// If the ad renders without a close button (blank white overlay), we auto-hide it;
// if auto-hide fails we surface our own dismiss button so the user isn't stuck.
(function () {
  var isEn = window.location.pathname.startsWith('/en');
  var label = isEn ? '✕ Close ad' : '✕ Fechar anúncio';
  var btn = null;

  function hideOverlay() {
    // Try to find and hide a full-viewport iframe (vignette container)
    var iframes = document.querySelectorAll('iframe');
    for (var i = 0; i < iframes.length; i++) {
      var f = iframes[i];
      var r = f.getBoundingClientRect();
      if (r.width >= window.innerWidth * 0.85 && r.height >= window.innerHeight * 0.85) {
        f.style.display = 'none';
        if (f.parentElement) f.parentElement.style.display = 'none';
        return true;
      }
    }
    // Fallback: fixed/absolute top-level element covering the viewport
    var els = document.querySelectorAll('body > *');
    for (var j = 0; j < els.length; j++) {
      var el = els[j];
      var s = window.getComputedStyle(el);
      var r2 = el.getBoundingClientRect();
      if ((s.position === 'fixed' || s.position === 'absolute') &&
          r2.width >= window.innerWidth * 0.85 &&
          r2.height >= window.innerHeight * 0.7) {
        el.style.display = 'none';
        return true;
      }
    }
    return false;
  }

  function removeBtn() {
    if (btn) { btn.remove(); btn = null; }
  }

  function showBtn() {
    if (btn) return;
    btn = document.createElement('button');
    btn.textContent = label;
    btn.setAttribute('aria-label', label);
    btn.style.cssText =
      'position:fixed;top:12px;right:12px;z-index:2147483647;' +
      'background:#111;color:#fff;border:none;padding:10px 18px;' +
      'border-radius:8px;font:600 14px/1 sans-serif;cursor:pointer;' +
      'box-shadow:0 2px 12px rgba(0,0,0,.6);';
    btn.onclick = function () {
      hideOverlay();
      history.replaceState(null, '', location.pathname + location.search);
      removeBtn();
    };
    document.body.appendChild(btn);
  }

  function checkVignette() {
    if (location.hash !== '#google_vignette') { removeBtn(); return; }
    setTimeout(function () {
      history.replaceState(null, '', location.pathname + location.search);
      if (!hideOverlay()) showBtn();
    }, 600);
  }

  window.addEventListener('hashchange', checkVignette);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkVignette);
  } else {
    checkVignette();
  }
})();
