/* Página inicial (03/11/2026): só enfeites que não podem pesar no primeiro carregamento.
   - Cantos pintados do topo e estampas das laterais: entram depois do load, só em tela de computador (html.hn-cantos).
   - Cantos do rodapé: baixam quando o rodapé chega perto da tela (.rodape-site.cantos-ok).
   Nenhuma animação contínua; nada roda enquanto a página está parada. */
(function () {
  var html = document.documentElement;

  // topo: depois do load e com o navegador livre, para nunca virar o elemento do LCP
  var cantosTopo = function () {
    if (!window.matchMedia || !matchMedia('(min-width: 1100px)').matches) return;
    var ir = function () { html.classList.add('hn-cantos'); };
    if ('requestIdleCallback' in window) requestIdleCallback(ir, { timeout: 3000 }); else setTimeout(ir, 1200);
  };
  if (document.readyState === 'complete') cantosTopo(); else addEventListener('load', cantosTopo);

  // a rosa acompanha a rolagem só enquanto o topo está na tela; parada, não gasta nada
  var rosa = document.querySelector('.hn-rosa');
  if (rosa && window.matchMedia && matchMedia('(min-width: 1001px) and (prefers-reduced-motion: no-preference)').matches) {
    var pedido = 0;
    var move = function () {
      pedido = 0;
      var y = Math.min(window.scrollY, 1000);
      rosa.style.transform = 'translateY(' + (y * .16).toFixed(1) + 'px) rotate(' + (y * .014).toFixed(2) + 'deg)';
    };
    addEventListener('scroll', function () {
      if (!pedido && window.scrollY < 1000) pedido = requestAnimationFrame(move);
    }, { passive: true });
  }

  // rodapé: quando estiver a até 600 px de aparecer
  var rodape = document.querySelector('.rodape-site');
  if (rodape) {
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (es) {
        if (es.some(function (e) { return e.isIntersecting; })) { rodape.classList.add('cantos-ok'); obs.disconnect(); }
      }, { rootMargin: '600px 0px' });
      obs.observe(rodape);
    } else rodape.classList.add('cantos-ok');
  }
})();
