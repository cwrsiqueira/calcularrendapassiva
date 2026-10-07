(function () {
  // Anúncios verticais laterais — só em telas largas o bastante para não cobrir o conteúdo
  if (!window.matchMedia('(min-width: 1100px)').matches) return;

  function adUnit(slot) {
    return '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-5865817649832793" data-ad-slot="' + slot + '" data-ad-format="auto" data-full-width-responsive="true"></ins>';
  }

  document.body.insertAdjacentHTML('beforeend',
    '<aside class="ad-rail ad-rail-left" aria-label="Publicidade">' + adUnit('2239731005') + '</aside>' +   // LE CRP
    '<aside class="ad-rail ad-rail-right" aria-label="Publicidade">' + adUnit('4865894344') + '</aside>');  // LD CRP
  (window.adsbygoogle = window.adsbygoogle || []).push({});
  (window.adsbygoogle = window.adsbygoogle || []).push({});
})();
