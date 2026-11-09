/* 09/11: comercial dos sistemas na página inicial. Toca só quando está visível,
   pausa ao sair da tela e nunca toca sozinho com "reduzir movimento" ligado. */
(function () {
  var fig = document.querySelector('.hv');
  if (!fig) return;
  var video = fig.querySelector('.hv-video');
  var botao = fig.querySelector('.hv-pausa');
  if (!video || !botao) return;
  var calmo = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pausadoPeloUsuario = calmo;

  function marcar() {
    var tocando = !video.paused;
    botao.textContent = tocando ? 'Pausar' : 'Continuar';
    botao.setAttribute('aria-pressed', tocando ? 'false' : 'true');
  }
  function tocar() {
    var p = video.play();
    if (p && p.catch) p.catch(function () { marcar(); });
  }

  botao.hidden = false;
  video.addEventListener('play', marcar);
  video.addEventListener('pause', marcar);
  botao.addEventListener('click', function () {
    if (video.paused) { pausadoPeloUsuario = false; tocar(); }
    else { pausadoPeloUsuario = true; video.pause(); }
  });
  marcar();

  if (!('IntersectionObserver' in window)) {
    if (!pausadoPeloUsuario) tocar();
    return;
  }
  new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      var visivel = e.isIntersecting && e.intersectionRatio >= 0.35;
      if (visivel && !pausadoPeloUsuario) tocar();
      else if (!visivel && !video.paused) video.pause();
    });
  }, { threshold: [0, 0.35, 0.6] }).observe(video);
})();
