// Marina Vasconcellos · queixas por região (com a foto 3D), orçamento do laser, filtro de procedimentos e agenda.
(function () {
  'use strict';
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return [].slice.call((el || document).querySelectorAll(s)); };
  var M = window.MV, reais = function (n) { return 'R$ ' + Math.round(n).toLocaleString('pt-BR'); };

  // ---------- queixas (início) ----------
  var caixa = $('.queixas');
  if (caixa) {
    var mostrar = function (k) {
      var q = M.queixas[k]; if (!q) return;
      $$('[data-regiao]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.regiao === k)); });
      caixa.innerHTML = '<h2>' + q.nome + '</h2>' + q.itens.map(function (it) {
        if (it[1] === 'laser') return '<a class="queixa" href="laser.html"><span>' + it[0] + '</span><b>Depilação a laser</b><small>monte o pacote no corpo 3D</small></a>';
        var p = M.procs[it[1]];
        return '<a class="queixa" href="agenda.html?proc=' + it[1] + '"><span>' + it[0] + '</span><b>' + p.nome + '</b><small>' + p.det + ' · ' + reais(p.preco) + '</small></a>';
      }).join('');
      if (window.mvCorpo) window.mvCorpo.marcar([k]);
    };
    addEventListener('mv-regiao', function (e) { mostrar(e.detail); });
    document.addEventListener('click', function (e) { var b = e.target.closest('[data-regiao]'); if (b) mostrar(b.dataset.regiao); });
  }

  // ---------- laser ----------
  var areas = $('.areas-laser');
  if (areas) {
    var pacote = $('#pacote'), escolhidas = [];
    var conta = function () {
      var soma = escolhidas.reduce(function (t, k) { return t + M.laser[k].preco; }, 0);
      var total = pacote.checked ? soma * 10 * 0.75 : soma;
      $('[data-total]').textContent = reais(total);
      $('[data-total-det]').textContent = escolhidas.length ? (pacote.checked ? '10 sessões de ' + reais(soma) + ' com 25% de desconto' : 'uma sessão') + ' · ' + escolhidas.map(function (k) { return M.laser[k].nome; }).join(', ') : 'Escolha ao menos uma área';
      $$('input[type="checkbox"]', areas).forEach(function (c) { c.checked = escolhidas.indexOf(c.value) >= 0; });
      if (window.mvCorpo) window.mvCorpo.marcar(escolhidas);
      return total;
    };
    areas.addEventListener('change', function () { escolhidas = $$('input:checked', areas).map(function (c) { return c.value; }); conta(); });
    pacote.addEventListener('change', conta);
    addEventListener('mv-laser', function (e) { escolhidas = e.detail.filter(function (k) { return M.laser[k]; }); conta(); });
    var costas = false;
    $('[data-virar]').addEventListener('click', function (e) { costas = !costas; e.target.textContent = costas ? 'Ver a frente' : 'Ver as costas'; if (window.mvCorpo) window.mvCorpo.virar(costas); });
    $('[data-wa-laser]').addEventListener('click', function (e) {
      e.preventDefault();
      if (!escolhidas.length) { $('[data-total-det]').textContent = 'Escolha ao menos uma área'; return; }
      var t = conta();
      if (window.BR_WA) window.BR_WA('Olá, Marina Vasconcellos! Montei meu laser no site.\n• Áreas: ' + escolhidas.map(function (k) { return M.laser[k].nome; }).join(', ') + '\n• ' + (pacote.checked ? 'Pacote de 10 sessões' : 'Sessão avulsa') + '\n• Total: ' + reais(t));
    });
    conta();
  }

  // ---------- procedimentos ----------
  var cats = $('.cats');
  if (cats) {
    var busca = $('.busca input'), cat = '';
    var filtrar = function () {
      var q = busca.value.trim().toLowerCase(), n = 0;
      $$('.proc').forEach(function (p) { var ok = (!cat || p.dataset.cat === cat) && (!q || p.dataset.busca.indexOf(q) >= 0); p.hidden = !ok; if (ok) n++; });
      $('.vazio').hidden = n > 0;
    };
    cats.addEventListener('click', function (e) { var b = e.target.closest('[data-cat]'); if (!b) return; cat = b.dataset.cat; $$('button', cats).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); filtrar(); });
    busca.addEventListener('input', filtrar);
  }

  // ---------- agenda ----------
  var ag = $('#agenda');
  if (ag) {
    var pr = new URLSearchParams(location.search).get('proc');
    if (pr && ag.proc.querySelector('option[value="' + pr.replace(/[^a-z]/g, '') + '"]')) ag.proc.value = pr;
    var esc = { dia: '', hora: '' }, d = new Date(), n = 0, dias = $('[data-dias]', ag), horas = $('[data-horas]', ag);
    while (n < 9) {
      d.setDate(d.getDate() + 1); if (d.getDay() === 0) continue;
      var b = document.createElement('button'); b.type = 'button';
      b.dataset.dia = d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' });
      b.innerHTML = '<span>' + d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '') + '</span><b>' + d.getDate() + '</b>';
      dias.appendChild(b); n++;
    }
    ['09:00', '10:30', '13:00', '15:00', '16:30', '18:30'].forEach(function (h) { var b = document.createElement('button'); b.type = 'button'; b.dataset.hora = h; b.textContent = h; horas.appendChild(b); });
    ag.addEventListener('click', function (e) {
      var b = e.target.closest('[data-dia],[data-hora]'); if (!b) return;
      var k = b.dataset.dia ? 'dia' : 'hora';
      $$('[data-' + k + ']', ag).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      esc[k] = b.dataset[k];
    });
    ag.addEventListener('submit', function (e) {
      e.preventDefault();
      var erro = $('.erro', ag), msg = !esc.dia || !esc.hora ? 'Escolha o dia e o horário.' : !ag.nome.value.trim() ? 'Digite seu nome.' : ag.tel.value.replace(/\D/g, '').length < 10 ? 'Digite um WhatsApp com DDD.' : '';
      erro.textContent = msg; if (msg) return;
      if (window.BR_WA) window.BR_WA('Olá, Marina Vasconcellos! Quero agendar.\n• Nome: ' + ag.nome.value.trim() + '\n• Serviço: ' + ag.proc.options[ag.proc.selectedIndex].text + '\n• Dia: ' + esc.dia + ' às ' + esc.hora);
    });
  }
})();
