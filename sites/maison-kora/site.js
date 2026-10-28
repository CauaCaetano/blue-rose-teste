// Maison Kora · objetivo escolhido → frasco 3D, itens do protocolo e preço; avaliação vira a simulação do WhatsApp.
(function () {
  'use strict';
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var PROT = [
    { itens: ['Ultrassom microfocado no terço inferior', 'Bioestimulador de colágeno em duas sessões', 'Home care com retinal e protetor'], preco: 'R$ 4.800', sessoes: 'plano de 4 meses' },
    { itens: ['Radiofrequência para firmeza', 'Criolipólise nas áreas escolhidas', 'Drenagem pós-procedimento'], preco: 'R$ 3.600', sessoes: 'plano de 3 meses' },
    { itens: ['Laser fracionado em três sessões', 'Peeling de manutenção', 'Protocolo de viço para usar em casa'], preco: 'R$ 2.900', sessoes: 'plano de 3 meses' },
    { itens: ['Toxina botulínica com retorno em 15 dias', 'Preenchimento pontual', 'Fios de sustentação, se indicados'], preco: 'R$ 3.900', sessoes: 'plano de 2 meses' },
  ];
  var NOMES = ['Rosto', 'Corpo', 'Pele', 'Rejuvenescer'], atual = 0;
  var grupo = $('.objetivos');
  function escolher(i) {
    atual = i;
    [].forEach.call(grupo.children, function (b, k) { b.setAttribute('aria-checked', String(k === i)); b.tabIndex = k === i ? 0 : -1; });
    $('[data-itens]').innerHTML = PROT[i].itens.map(function (x) { return '<li>' + x + '</li>'; }).join('');
    $('[data-preco]').textContent = PROT[i].preco;
    $('[data-sessoes]').textContent = PROT[i].sessoes;
    if (window.kora) window.kora.objetivo(i);
  }
  grupo.addEventListener('click', function (e) { var b = e.target.closest('[data-obj]'); if (b) escolher(Number(b.dataset.obj)); });
  // setas do teclado no grupo de opções
  grupo.addEventListener('keydown', function (e) {
    var d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (!d) return;
    e.preventDefault(); var i = (atual + d + 4) % 4; escolher(i); grupo.children[i].focus();
  });
  escolher(0);
  addEventListener('load', function () { if (window.kora) window.kora.objetivo(atual); });

  var f = $('#form-av');
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var nome = f.nome.value.trim();
    if (!nome) { $('.erro', f).textContent = 'Digite seu nome.'; f.nome.focus(); return; }
    $('.erro', f).textContent = '';
    if (window.BR_WA) window.BR_WA('Olá, Maison Kora! Quero agendar a avaliação.\n• Nome: ' + nome + '\n• Objetivo: ' + NOMES[atual] + '\n• Casa: ' + f.casa.value + '\n• Período: ' + f.periodo.value);
  });
})();
