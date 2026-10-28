// Lívia Prado · cor escolhida (ligada à bancada 3D) e orçamento com tempo de cadeira, tudo indo para o WhatsApp.
(function () {
  'use strict';
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return [].slice.call((el || document).querySelectorAll(s)); };
  var CORES = [['Nude rosé', '#d59e94'], ['Vermelho paixão', '#a8162a'], ['Marsala', '#5e1d2c'], ['Rosa chiclete', '#e56497'], ['Coral', '#ef7656'], ['Lilás', '#9f86c4'], ['Azul noite', '#1d2a57'], ['Preto ônix', '#18181c']];
  var cor = 0, caixa = $('.cores');
  caixa.innerHTML = CORES.map(function (c, i) { return '<button type="button" role="radio" aria-checked="' + (i === 0) + '" aria-label="' + c[0] + '" data-cor="' + i + '" style="background:' + c[1] + '"></button>'; }).join('');
  function escolher(i, doBotao) {
    cor = i;
    $$('[data-cor]').forEach(function (b) { b.setAttribute('aria-checked', String(+b.dataset.cor === i)); });
    $('.cor-nome').textContent = CORES[i][0];
    $('[data-wa-cor]').setAttribute('data-wa', 'Olá, Lívia! Quero fazer as unhas na cor ' + CORES[i][0].toLowerCase() + '. Tem horário esta semana?');
    if (doBotao && window.livia) window.livia.cor(i);
  }
  caixa.addEventListener('click', function (e) { var b = e.target.closest('[data-cor]'); if (b) escolher(+b.dataset.cor, true); });
  caixa.addEventListener('keydown', function (e) { // setas trocam a cor, como num grupo de rádio
    var d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!d) return; e.preventDefault(); var n = (cor + d + CORES.length) % CORES.length; escolher(n, true); $('[data-cor="' + n + '"]').focus();
  });
  addEventListener('lp-cor', function (e) { escolher(e.detail, false); });
  escolher(0, false);

  var f = $('#orcamento');
  function conta() {
    var marc = $$('input:checked', f), p = 0, m = 0;
    marc.forEach(function (x) { p += +x.dataset.p; m += +x.dataset.m; });
    var h = Math.floor(m / 60), min = m % 60;
    $('.total', f).innerHTML = marc.length ? 'R$ ' + p + '<small>' + (h ? h + 'h' + (min ? String(min).padStart(2, '0') : '') : min + ' min') + ' de cadeira · cor ' + CORES[cor][0].toLowerCase() + '</small>' : '<small>Marque pelo menos um serviço.</small>';
    return { p: p, m: m, nomes: marc.map(function (x) { return $('b', x.parentNode).textContent.toLowerCase(); }) };
  }
  f.addEventListener('change', conta);
  addEventListener('lp-cor', conta); caixa.addEventListener('click', conta);
  conta();
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var o = conta(); if (!o.nomes.length) return;
    window.BR_WA && window.BR_WA('Olá, Lívia! Quero agendar: ' + o.nomes.join(', ') + ', na cor ' + CORES[cor][0].toLowerCase() + '. Total R$ ' + o.p + ' (' + o.m + ' min). Melhor período: ' + $('#periodo').value + '.');
  });
})();
