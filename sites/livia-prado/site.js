// Lívia Prado · cartela de cores (fotos reais de unhas em cada cor) e orçamento com tempo de cadeira, tudo indo para o WhatsApp.
(function () {
  'use strict';
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return [].slice.call((el || document).querySelectorAll(s)); };
  var CORES = [['Nude rosé', '#d8a796'], ['Vermelho clássico', '#b0151f'], ['Bordô', '#5c1220'], ['Rosa chá', '#d79aa3'], ['Malva', '#b8a3b8'], ['Tartaruga e preto', 'linear-gradient(135deg, #111 50%, #7a4a1e 50%)'], ['Francesinha com brilho', 'linear-gradient(135deg, #eeeaf2 55%, #b9a9c9 55%)'], ['Arte colorida', 'conic-gradient(#f2c230, #e2462e, #2f6fd1, #f2c230)']];
  var ARQ = ['nude', 'vermelho', 'bordo', 'rosa', 'malva', 'tartaruga', 'francesinha', 'arte'];
  var cor = 0, caixa = $('.faixas');
  // cada faixa da cartela é a foto real de unhas feitas na cor; a escolhida se abre
  caixa.innerHTML = CORES.map(function (c, i) { return '<button type="button" class="faixa" role="radio" aria-checked="' + (i === 0) + '" aria-label="' + c[0] + '" data-cor="' + i + '" style="background-image:url(img/' + ARQ[i] + '.webp)"><i style="background:' + c[1] + '"></i><span>' + c[0] + '</span></button>'; }).join('');
  function escolher(i) {
    cor = i;
    $$('[data-cor]').forEach(function (b) { b.setAttribute('aria-checked', String(+b.dataset.cor === i)); });
    $('.cor-nome').textContent = CORES[i][0];
    $('[data-wa-cor]').setAttribute('data-wa', 'Olá, Lívia! Quero fazer as unhas na cor ' + CORES[i][0].toLowerCase() + '. Tem horário esta semana?');
  }
  caixa.addEventListener('click', function (e) { var b = e.target.closest('[data-cor]'); if (b) escolher(+b.dataset.cor); });
  caixa.addEventListener('keydown', function (e) { // setas trocam a cor, como num grupo de rádio
    var d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!d) return; e.preventDefault(); var n = (cor + d + CORES.length) % CORES.length; escolher(n); $('[data-cor="' + n + '"]').focus();
  });
  escolher(0);
  $('[data-num]').textContent = String(Date.now() % 9000 + 1000);

  var f = $('#orcamento');
  function conta() {
    var marc = $$('input:checked', f), p = 0, m = 0;
    marc.forEach(function (x) { p += +x.dataset.p; m += +x.dataset.m; });
    var h = Math.floor(m / 60), min = m % 60;
    $('.total', f).innerHTML = marc.length ? 'R$ ' + p + '<small>' + (h ? h + 'h' + (min ? String(min).padStart(2, '0') : '') : min + ' min') + ' de cadeira · cor ' + CORES[cor][0].toLowerCase() + '</small>' : '<small>Marque pelo menos um serviço.</small>';
    return { p: p, m: m, nomes: marc.map(function (x) { return $('b', x.parentNode).textContent.toLowerCase(); }) };
  }
  f.addEventListener('change', conta);
  caixa.addEventListener('click', conta);
  conta();
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var o = conta(); if (!o.nomes.length) return;
    window.BR_WA && window.BR_WA('Olá, Lívia! Quero agendar: ' + o.nomes.join(', ') + ', na cor ' + CORES[cor][0].toLowerCase() + '. Total R$ ' + o.p + ' (' + o.m + ' min). Melhor período: ' + $('#periodo').value + '.');
  });
})();
