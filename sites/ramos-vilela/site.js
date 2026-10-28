// Ramos Vilela · torre ↔ lista de andares, busca da equipe, leitor de artigos, calculadoras e agendamento.
(function () {
  'use strict';
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return [].slice.call((el || document).querySelectorAll(s)); };
  var reais = function (n) { return 'R$ ' + Math.round(n).toLocaleString('pt-BR'); };
  var calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- torre (início) ----------
  var lista = $('.andares');
  if (lista) {
    var abrir = function (i) {
      $$('.andar-painel').forEach(function (p) { p.hidden = Number(p.dataset.painel) !== i; });
      $$('button', lista).forEach(function (b) { b.setAttribute('aria-pressed', String(Number(b.dataset.andar) === i)); });
      if (window.rvTorre) window.rvTorre.abrir(i);
    };
    lista.addEventListener('mouseover', function (e) { var b = e.target.closest('[data-andar]'); if (b && window.rvTorre) window.rvTorre.marcar(Number(b.dataset.andar)); });
    lista.addEventListener('focusin', function (e) { var b = e.target.closest('[data-andar]'); if (b && window.rvTorre) window.rvTorre.marcar(Number(b.dataset.andar)); });
    lista.addEventListener('click', function (e) { var b = e.target.closest('[data-andar]'); if (b) abrir(Number(b.dataset.andar)); });
    addEventListener('rv-andar', function (e) { abrir(e.detail); });
    document.addEventListener('rv-foco', function (e) { $$('button', lista).forEach(function (b) { b.classList.toggle('foco', Number(b.dataset.andar) === e.detail); }); });
    abrir(7);
    addEventListener('rv-pronto', function () { var b = $('[aria-pressed="true"]', lista); if (b) abrir(Number(b.dataset.andar)); });
  }

  // ---------- equipe ----------
  var fe = $('#filtro-equipe');
  if (fe) {
    var filtrar = function () {
      var q = fe.q.value.trim().toLowerCase(), a = fe.area.value, c = fe.cidade.value, n = 0;
      $$('.pessoa').forEach(function (p) {
        var ok = (!q || p.dataset.busca.indexOf(q) >= 0) && (!a || p.dataset.area === a) && (!c || p.dataset.cidade === c);
        p.hidden = !ok; if (ok) n++;
      });
      $('.contagem', fe).textContent = n + (n === 1 ? ' pessoa' : ' pessoas');
      $('.vazio').hidden = n > 0;
    };
    fe.addEventListener('input', filtrar); fe.addEventListener('submit', function (e) { e.preventDefault(); });
    filtrar();
  }

  // ---------- conteúdo ----------
  var temas = $('.temas');
  if (temas) {
    temas.addEventListener('click', function (e) {
      var b = e.target.closest('[data-tema]'); if (!b) return;
      $$('button', temas).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      $$('.artigo-c[data-tema]').forEach(function (a) { a.hidden = !!b.dataset.tema && a.dataset.tema !== b.dataset.tema; });
    });
    var leitor = $('#leitor');
    var ler = function (id) {
      var a = document.getElementById(id); if (!a || !leitor.showModal) return;
      $('.leitor-meta', leitor).textContent = $('span', a).textContent;
      $('#leitor-t').textContent = $('h3', a).textContent;
      $('.leitor-txt', leitor).innerHTML = $('.artigo-txt', a).innerHTML;
      leitor.showModal();
    };
    document.addEventListener('click', function (e) { var b = e.target.closest('[data-ler]'); if (b) ler(b.dataset.ler); });
    leitor.addEventListener('click', function (e) { if (e.target === leitor) leitor.close(); });
    if (location.hash) ler(location.hash.slice(1));
  }

  // ---------- ferramentas ----------
  var cp = $('#calc-passivo'), cc = $('#calc-correcao');
  var resumoCalc = { passivo: '', correcao: '' };
  if (cp) {
    var contaP = function () {
      var f = Number(cp.func.value), s = Number(cp.sal.value), he = Number(cp.he.value), anos = Number(cp.anos.value);
      $$('output', cp).forEach(function (o, i) { o.textContent = [f + ' pessoas', reais(s), he + ' h', anos + (anos > 1 ? ' anos' : ' ano')][i]; });
      // hora = salário / 220; extra com 50%; reflexos (13º, férias, FGTS, DSR) ≈ +40%; parte das pessoas entra com ação (35%)
      var hora = s / 220, porPessoa = hora * 1.5 * he * 4.33 * 12 * anos * 1.4;
      var min = porPessoa * f * 0.25, max = porPessoa * f * 0.45;
      $('[data-passivo]', cp).textContent = reais(min) + ' a ' + reais(max);
      $('[data-passivo-det]', cp).textContent = 'Considera que 25% a 45% das pessoas entram com ação e os reflexos em 13º, férias e FGTS.';
      resumoCalc.passivo = 'Passivo estimado: ' + reais(min) + ' a ' + reais(max) + ' (' + f + ' funcionários)';
    };
    cp.addEventListener('input', contaP); contaP();
  }
  if (cc) {
    var contaC = function () {
      var v = Number(String(cc.valor.value).replace(/\./g, '').replace(',', '.')) || 0, d = cc.desde.value.split('-');
      var agora = new Date(), meses = d.length === 2 ? Math.max(0, (agora.getFullYear() - Number(d[0])) * 12 + agora.getMonth() + 1 - Number(d[1])) : 0;
      var corrigido = v * Math.pow(1.045, meses / 12), juros = corrigido * 0.01 * meses, total = corrigido + juros;
      $('[data-corrigido]', cc).textContent = v ? reais(total) : 'Informe o valor';
      $('[data-corrigido-det]', cc).textContent = v ? meses + ' meses · correção ' + reais(corrigido - v) + ' · juros ' + reais(juros) : '';
      resumoCalc.correcao = v ? 'Débito de ' + reais(v) + ' atualizado: ' + reais(total) : '';
    };
    cc.addEventListener('input', contaC); contaC();
  }
  var wc = $('[data-wa-calc]');
  if (wc) wc.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); if (window.BR_WA) window.BR_WA('Olá, Ramos Vilela! Fiz as contas no site.\n• ' + resumoCalc.passivo + (resumoCalc.correcao ? '\n• ' + resumoCalc.correcao : '')); });

  // ---------- agendamento ----------
  var ag = $('#agenda');
  if (ag) {
    var passos = $$('fieldset', ag), at = 0, erro = $('.erro', ag), prox = $('[data-prox]', ag), ant = $('[data-ant]', ag), escolha = { dia: '', hora: '' };
    var q = new URLSearchParams(location.search).get('area');
    if (q) { var r = ag.querySelector('input[name="area"][value="' + q.replace(/[^a-z]/g, '') + '"]'); if (r) r.checked = true; }
    // próximos 8 dias úteis e horários
    var dias = $('[data-dias]', ag), horas = $('[data-horas]', ag), d = new Date(), n = 0;
    while (n < 8) {
      d.setDate(d.getDate() + 1); if (d.getDay() === 0 || d.getDay() === 6) continue;
      var b = document.createElement('button'); b.type = 'button'; b.dataset.dia = d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' });
      b.innerHTML = '<span>' + d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '') + '</span><b>' + d.getDate() + '</b>';
      dias.appendChild(b); n++;
    }
    ['09:00', '10:30', '14:00', '15:30', '17:00'].forEach(function (h) { var b = document.createElement('button'); b.type = 'button'; b.dataset.hora = h; b.textContent = h; horas.appendChild(b); });
    ag.addEventListener('click', function (e) {
      var b = e.target.closest('[data-dia],[data-hora]'); if (!b) return;
      var k = b.dataset.dia ? 'dia' : 'hora';
      $$('[data-' + k + ']', ag).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      escolha[k] = b.dataset[k];
    });
    var mostrar = function (i) {
      at = i;
      passos.forEach(function (f, k) { f.hidden = k !== i; });
      $$('.agenda-passos li', ag).forEach(function (li, k) { li.classList.toggle('feito', k < i); li.classList.toggle('agora', k === i); });
      ant.hidden = i === 0; prox.textContent = i === passos.length - 1 ? 'Pré-reservar a reunião' : 'Continuar'; erro.textContent = '';
    };
    var valido = function () {
      var f = new FormData(ag);
      if (at === 0 && !f.get('area')) return 'Escolha o assunto.';
      if (at === 1 && !f.get('porte')) return 'Escolha o porte.';
      if (at === 2 && !f.get('formato')) return 'Escolha o formato.';
      if (at === 3 && (!escolha.dia || !escolha.hora)) return 'Escolha o dia e o horário.';
      if (at === 4 && !String(f.get('nome')).trim()) return 'Digite seu nome.';
      if (at === 4 && String(f.get('tel')).replace(/\D/g, '').length < 10) return 'Digite um WhatsApp com DDD.';
      return '';
    };
    prox.addEventListener('click', function () {
      var m = valido(); if (m) { erro.textContent = m; return; }
      if (at < passos.length - 1) { mostrar(at + 1); return; }
      var f = new FormData(ag), area = ag.querySelector('input[name="area"]:checked').parentNode.textContent.trim();
      if (window.BR_WA) window.BR_WA('Olá, Ramos Vilela! Quero agendar uma reunião.\n• Nome: ' + f.get('nome') + (f.get('empresa') ? '\n• Empresa: ' + f.get('empresa') : '') + '\n• Assunto: ' + area + '\n• Porte: ' + f.get('porte') + '\n• Formato: ' + f.get('formato') + '\n• Dia: ' + escolha.dia + ' às ' + escolha.hora);
    });
    ant.addEventListener('click', function () { mostrar(Math.max(0, at - 1)); });
    ag.addEventListener('change', function (e) { if (e.target.type === 'radio' && at < 3) setTimeout(function () { if (!valido()) mostrar(at + 1); }, calmo ? 0 : 220); });
    mostrar(0);
  }
})();
