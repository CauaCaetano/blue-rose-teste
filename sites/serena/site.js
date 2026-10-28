// Atelier Serena · orçamento por tempo de cadeira (ligado à foto 3D e ao cartão do espelho), busca na tabela, pedido do bistrô
// e reserva que só oferece horários em que cabe todo o atendimento.
(function () {
  'use strict';
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return [].slice.call((el || document).querySelectorAll(s)); };
  var S = { corte: ['Corte com lavagem', 60, 180], escova: ['Escova modelada', 45, 110], raiz: ['Coloração de raiz', 90, 260], mechas: ['Mechas e balayage', 210, 790], ritual: ['Ritual de hidratação Serena', 50, 160], mao: ['Manicure e pedicure', 80, 120], make: ['Maquiagem social', 60, 240], penteado: ['Penteado', 75, 280] };
  var EQUIPE = ['Renata Alves', 'Thiago Kim', 'Bruna Leal', 'Selma Duarte'];
  var tempo = function (m) { var h = Math.floor(m / 60), r = m % 60; return h ? h + 'h' + (r ? String(r).padStart(2, '0') : '') : r + ' min'; };
  var real = function (v) { return 'R$ ' + Math.round(v).toLocaleString('pt-BR'); };

  // início: orçamento
  var orc = $('#orcar');
  if (orc) {
    var conta = function () {
      var ids = $$('[name=s]:checked', orc).map(function (x) { return x.value; }), n = +$('[name=n]:checked', orc).value;
      var min = ids.reduce(function (a, k) { return a + S[k][1]; }, 0), valor = ids.reduce(function (a, k) { return a + S[k][2]; }, 0) * n;
      $('.soma', orc).innerHTML = ids.length ? real(valor) + '<small>' + tempo(min) + ' de cadeira' + (min > 120 ? ' · um item do bistrô por nossa conta' : '') + '</small>' : '<small>Marque ao menos um serviço.</small>';
      if (window.serenaEstacao) window.serenaEstacao.orcar(min, Math.round(valor), ultimo || ids[ids.length - 1]);
      return { ids: ids, n: n };
    };
    var ultimo = null;
    orc.addEventListener('change', function (e) { if (e.target.name === 's') ultimo = e.target.checked ? e.target.value : null; conta(); });
    var tenta = setInterval(function () { if (window.serenaEstacao) { clearInterval(tenta); conta(); } }, 200); // a cena carrega como módulo, depois deste script
    setTimeout(function () { clearInterval(tenta); }, 8000);
    conta();
    orc.addEventListener('submit', function (e) {
      e.preventDefault(); var o = conta(); if (!o.ids.length) return;
      location.href = 'agenda.html?s=' + o.ids.join(',') + (o.n > 1 ? '&p=0' : '');
    });
  }

  // serviços: busca
  var busca = $('#busca');
  if (busca) {
    var norm = function (s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
    busca.addEventListener('input', function () {
      var q = norm(busca.value.trim());
      $$('.grupo').forEach(function (g) {
        var algum = false;
        $$('li', g).forEach(function (li) { var ok = !q || norm(li.textContent).indexOf(q) > -1; li.hidden = !ok; algum = algum || ok; });
        g.hidden = !algum;
      });
    });
  }

  // bistrô: monta o pedido
  var itens = $$('[data-item]');
  if (itens.length) {
    var pedido = $('.pedido');
    var atualiza = function () {
      var esc = itens.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; });
      if (!esc.length) { pedido.innerHTML = '<p>Nada escolhido ainda.</p>'; return; }
      var total = esc.reduce(function (a, b) { return a + +b.dataset.preco; }, 0), nomes = esc.map(function (b) { return b.dataset.item; });
      pedido.innerHTML = '<p>' + nomes.join(', ') + '</p><p><b>' + real(total) + '</b>, servido na sua cadeira.</p><a class="botao" href="#" data-wa="Olá, Serena! No meu horário quero do bistrô: ' + nomes.join(', ') + '.">Deixar pedido junto da reserva</a>';
    };
    itens.forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')); atualiza(); }); });
  }

  // reserva
  var rs = $('#reserva');
  if (rs) {
    var q = new URLSearchParams(location.search);
    var ids = (q.get('s') || 'corte').split(',').filter(function (k) { return S[k]; }); if (!ids.length) ids = ['corte'];
    if (q.get('p')) { var r = $('[name=p][value="' + q.get('p') + '"]', rs); if (r) r.checked = true; }
    var min = ids.reduce(function (a, k) { return a + S[k][1]; }, 0);
    $('.resumo').innerHTML = '<b>' + ids.map(function (k) { return S[k][0]; }).join(' + ') + '</b><br>' + tempo(min) + ' de cadeira · <a href="index.html">mudar serviços</a>';
    var dias = [], d = new Date(), dia = -1, hora = '';
    while (dias.length < 12) { d.setDate(d.getDate() + 1); if (d.getDay() > 1) dias.push(new Date(d)); } // terça a sábado
    $('[data-dias]', rs).innerHTML = dias.map(function (x, i) { return '<button type="button" data-d="' + i + '" aria-pressed="false">' + x.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }) + '</button>'; }).join('');
    var horas = function () {
      hora = ''; var hx = $('[data-horas]', rs);
      if (dia < 0) { hx.innerHTML = '<span class="nota">Escolha o dia.</span>'; return; }
      // agenda da profissional em blocos de 30 min, das 9h às 21h, com 1 a 3 clientes já marcados (fixos por dia e profissional)
      var pr = +$('[name=p]:checked', rs).value, livre = [], sem = dias[dia].getDate() * 13 + pr * 5;
      for (var b = 0; b < 24; b++) livre.push(true);
      for (var c = 0; c < sem % 3 + 1; c++) { var ini = (sem * 7 + c * 11) % 21, dur = 2 + (sem + c) % 4; for (var k = ini; k < Math.min(24, ini + dur); k++) livre[k] = false; }
      var precisa = Math.ceil(min / 30), html = '';
      for (var i = 0; i + precisa <= 24; i++) {
        var cabe = true; for (var j = i; j < i + precisa; j++) cabe = cabe && livre[j];
        if (cabe) { var h = 9 + i / 2, txt = Math.floor(h) + ':' + (h % 1 ? '30' : '00'); html += '<button type="button" data-h="' + txt + '" aria-pressed="false">' + txt + '</button>'; }
      }
      hx.innerHTML = html || '<span class="nota">Neste dia não cabe ' + tempo(min) + ' seguidas. Tente outro dia ou outra profissional.</span>';
    };
    rs.addEventListener('click', function (e) {
      var b = e.target.closest('[data-d]');
      if (b) { dia = +b.dataset.d; $$('[data-d]', rs).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); horas(); return; }
      var h = e.target.closest('[data-h]');
      if (h) { hora = h.dataset.h; $$('[data-h]', rs).forEach(function (x) { x.setAttribute('aria-pressed', String(x === h)); }); }
    });
    rs.addEventListener('change', function (e) { if (e.target.name === 'p') horas(); });
    horas();
    rs.addEventListener('submit', function (e) {
      e.preventDefault();
      var erro = $('.erro', rs), nome = rs.nome.value.trim(), tel = rs.tel.value.replace(/\D/g, '');
      erro.textContent = dia < 0 ? 'Escolha o dia.' : !hora ? 'Escolha o horário de início.' : nome.length < 2 ? 'Escreva seu nome.' : tel.length < 10 ? 'Confira o WhatsApp com DDD.' : '';
      if (erro.textContent) return;
      var pro = EQUIPE[+$('[name=p]:checked', rs).value], quando = dias[dia].toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }) + ', das ' + hora;
      var fim = hora.split(':'), fm = +fim[0] * 60 + +fim[1] + min, ate = Math.floor(fm / 60) + ':' + String(fm % 60).padStart(2, '0');
      var ok = document.createElement('div'); ok.className = 'ok';
      ok.innerHTML = '<h2>Reserva feita</h2><p>' + nome.split(' ')[0] + ', sua tarde com ' + pro + ' ficou para ' + quando + ' às ' + ate + '. Confirmamos pelo WhatsApp na véspera.</p><a class="botao" href="#" data-wa="Olá, Serena! Reservei ' + ids.map(function (k) { return S[k][0].toLowerCase(); }).join(' e ') + ' com ' + pro + ', ' + quando + '.">Falar com a recepção</a>';
      rs.replaceWith(ok);
    });
  }
})();
