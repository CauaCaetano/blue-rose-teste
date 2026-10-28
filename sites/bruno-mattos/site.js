// Bruno Mattos · região da coluna → causas comuns e tratamento, ligado aos pontos da foto das costas.
(function () {
  'use strict';
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var R = {
    cervical: { nome: 'Pescoço', causas: ['Postura no celular e no computador', 'Hérnia de disco cervical', 'Tensão e bruxismo'], trat: 'Terapia manual, RPG e exercícios de estabilização. Em geral, 8 a 12 sessões.' },
    toracica: { nome: 'Meio das costas', causas: ['Rigidez de quem passa o dia sentado', 'Escoliose', 'Dor muscular por esforço'], trat: 'Mobilização, liberação miofascial e fortalecimento das costas. Em geral, 6 a 10 sessões.' },
    lombar: { nome: 'Lombar', causas: ['Lombalgia por sobrecarga', 'Hérnia de disco lombar', 'Ciático irritado'], trat: 'Terapia manual, ondas de choque quando indicado e exercício progressivo. Em geral, 10 a 15 sessões.' },
    sacro: { nome: 'Bacia e cóccix', causas: ['Pancada ou queda sentado', 'Disfunção sacroilíaca', 'Pós-parto'], trat: 'Mobilização da articulação, fortalecimento do quadril e ajuste da postura sentada.' },
  };
  var caixa = $('.diag'), atual = '';
  function mostrar(k) {
    var r = R[k]; if (!r) return; atual = k;
    [].forEach.call(document.querySelectorAll('[data-reg]'), function (b) { b.setAttribute('aria-pressed', String(b.dataset.reg === k)); });
    caixa.innerHTML = '<h2>' + r.nome + '</h2><p class="rot">O que costuma causar</p><ul>' + r.causas.map(function (c) { return '<li>' + c + '</li>'; }).join('') + '</ul><p class="rot">Como tratamos</p><p>' + r.trat + '</p><a class="botao" href="#" data-wa="Olá, Bruno Mattos! Tenho dor no(a) ' + r.nome.toLowerCase() + ' e quero agendar uma avaliação.">Agendar avaliação para esta dor</a>';
  }
  document.addEventListener('click', function (e) { var b = e.target.closest('[data-reg]'); if (b) mostrar(b.dataset.reg); });
  addEventListener('bm-regiao', function (e) { mostrar(e.detail); });
})();
