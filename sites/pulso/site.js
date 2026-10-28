// Pulso · planos ligados à foto 3D, busca de unidades, grade de aulas e simulador de matrícula.
(function () {
  'use strict';
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return [].slice.call((el || document).querySelectorAll(s)); };
  var reais = function (n) { return 'R$ ' + (Math.round(n * 100) / 100).toLocaleString('pt-BR', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }); };
  var sem = function (s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };

  // ---------- planos (início) ----------
  var planos = $('.planos');
  if (planos) {
    var NOMES = ['Pulso Smart', 'Pulso Fit', 'Pulso Black'], ir = $('[data-ir-matricula]');
    var escolher = function (i) {
      var r = $('input[value="' + i + '"]', planos); if (r) r.checked = true;
      ir.textContent = 'Quero o ' + NOMES[i]; ir.href = 'matricula.html?plano=' + i;
      if (window.pulsoPlanos) window.pulsoPlanos.escolher(i);
    };
    planos.addEventListener('change', function (e) { escolher(Number(e.target.value)); });
    addEventListener('pulso-plano', function (e) { escolher(e.detail); });
    addEventListener('load', function () { escolher(Number($('input:checked', planos).value)); });
  }

  // ---------- unidades ----------
  var busca = $('#busca');
  if (busca) {
    var uf = '';
    var filtrar = function () {
      var q = sem(busca.q.value.trim()), n = 0;
      $$('.un').forEach(function (u) { var ok = (!uf || u.dataset.uf === uf) && (!q || sem(u.dataset.busca).indexOf(q) >= 0); u.hidden = !ok; if (ok) n++; });
      $('.contagem').textContent = n ? n + (n > 1 ? ' unidades' : ' unidade') : 'Nenhuma unidade com esse nome. Tente a cidade.';
    };
    busca.addEventListener('input', filtrar); busca.addEventListener('submit', function (e) { e.preventDefault(); });
    $('.ufs').addEventListener('click', function (e) { var b = e.target.closest('[data-uf]'); if (!b) return; uf = b.dataset.uf; $$('.ufs button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); filtrar(); });
    filtrar();
  }

  // ---------- aulas ----------
  var dias = $('.dias');
  if (dias && $('.grade')) {
    var dia = dias.querySelector('[aria-pressed="true"]').dataset.dia, modal = $('[data-modal]');
    var mostrar = function () { $$('.aula').forEach(function (a) { a.hidden = a.dataset.dia !== dia || (modal.value && a.dataset.modal !== modal.value); }); };
    dias.addEventListener('click', function (e) { var b = e.target.closest('[data-dia]'); if (!b) return; dia = b.dataset.dia; $$('button', dias).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); mostrar(); });
    modal.addEventListener('change', mostrar); mostrar();
  }

  // ---------- matrícula ----------
  var m = $('#matricula');
  if (m) {
    var P = JSON.parse($('#planos-dados').textContent), qs = new URLSearchParams(location.search);
    if (qs.has('plano') && P[Number(qs.get('plano'))]) m.plano.value = qs.get('plano');
    if (qs.has('u') && m.u.options[Number(qs.get('u'))]) m.u.value = qs.get('u');
    var resumo = '';
    var conta = function () {
      var pl = P[Number(m.plano.value)], anual = m.pg.value === 'anual', cupom = m.cupom.value.trim().toUpperCase() === 'PULSO10';
      var mensal = pl[1] * (cupom ? 0.9 : 1), total = anual ? mensal * 10 : mensal;
      $('[data-r="plano"]').textContent = pl[0];
      $('[data-r="u"]').textContent = m.u.options[m.u.selectedIndex].text;
      $('[data-r="desc"]').textContent = [anual ? '2 meses grátis' : '', cupom ? 'cupom 10%' : ''].filter(Boolean).join(' + ') || '—';
      $('[data-r="total"]').textContent = reais(total);
      $('[data-r="det"]').textContent = anual ? 'por 12 meses, à vista (' + reais(total / 12) + ' por mês)' : 'por mês, no cartão';
      resumo = '• Plano: ' + pl[0] + '\n• Unidade: ' + m.u.options[m.u.selectedIndex].text + '\n• Total: ' + reais(total) + (anual ? ' (anual)' : ' por mês');
    };
    m.addEventListener('input', conta); m.addEventListener('change', conta); conta();
    m.addEventListener('submit', function (e) {
      e.preventDefault();
      var erro = $('.erro', m), msg = !m.nome.value.trim() ? 'Digite seu nome.' : m.tel.value.replace(/\D/g, '').length < 10 ? 'Digite um WhatsApp com DDD.' : '';
      erro.textContent = msg; if (msg) return;
      if (window.BR_WA) window.BR_WA('Olá, Pulso! Quero me matricular.\n• Nome: ' + m.nome.value.trim() + '\n' + resumo);
    });
  }
})();
