// Eixo · pisada (liga os botões ao mapa de pressão), triagem da dor, linha do tempo dos programas, convênios e agenda semanal.
(function () {
  'use strict';
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return [].slice.call((el || document).querySelectorAll(s)); };
  var real = function (v) { return 'R$ ' + Math.round(v).toLocaleString('pt-BR'); };

  // pisada
  var LEITURA = {
    neutra: 'O peso entra pelo calcanhar, passa pela borda de fora e sai pelo dedão. É o padrão que protege joelho e quadril.',
    pronada: 'O pé desaba para dentro: o arco encosta no chão e o dedão leva o peso. Costuma vir com dor na parte de dentro do joelho e canelite.',
    supinada: 'O peso fica na borda de fora e quase não passa pelo dedão. Combina com entorse de tornozelo e dor na lateral da coxa.',
    plano: 'A sola inteira toca a placa e o mediopé carrega peso. Fortalecer os músculos do arco e usar palmilha alivia.',
    cavo: 'Arco alto: quase nada toca no meio do pé e o calcanhar e a frente levam o choque. Comum em fascite plantar e esporão.'
  };
  $$('[data-tipo]').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('[data-tipo]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      if (window.eixoPlaca) window.eixoPlaca.tipo(b.dataset.tipo);
      $('.leitura').textContent = LEITURA[b.dataset.tipo];
    });
  });
  var andar = $('.andar');
  if (andar) {
    $('.leitura').textContent = LEITURA.neutra;
    andar.addEventListener('click', function () {
      var on = andar.getAttribute('aria-pressed') !== 'true';
      andar.setAttribute('aria-pressed', String(on)); andar.textContent = on ? 'Parar o passo' : 'Ver o passo';
      if (window.eixoPlaca) window.eixoPlaca.andar(on);
    });
  }
  addEventListener('eixo-dados', function (e) {
    var d = e.detail;
    $('[data-n=medial]').textContent = d.medial + '%';
    $('[data-n=retro]').textContent = d.retro + '%';
    $('[data-n=pico]').textContent = d.pico + ' kPa';
  });

  // triagem
  var tri = $('#triagem');
  if (tri) {
    var NIVEL = ['sem dor', 'dor leve', 'dor leve', 'dor leve', 'dor moderada', 'dor moderada', 'dor moderada', 'dor forte', 'dor forte', 'dor muito forte', 'a pior dor possível'];
    var PROG = { joelho: 'lca', lombar: 'lombalgia', tornozelo: 'fascite', quadril: 'corredor', cervical: 'lombalgia', ombro: '' };
    tri.eva.addEventListener('input', function () { $('#eva-txt').textContent = tri.eva.value + ' · ' + NIVEL[+tri.eva.value]; });
    tri.addEventListener('submit', function (e) {
      e.preventDefault();
      var reg = tri.reg.value, tempo = tri.tempo.value, eva = +tri.eva.value, alertas = $$('[name=alerta]:checked', tri).length, erro = $('.erro', tri);
      erro.textContent = !reg ? 'Escolha onde dói.' : !tempo ? 'Diga há quanto tempo dói.' : '';
      if (erro.textContent) return;
      var nomeReg = $('[name=reg]:checked + span', tri).textContent, r = $('.resultado'), html;
      if (alertas) {
        html = ['#b3261e', 'Procure um pronto-socorro hoje', 'O que você marcou pode indicar algo que precisa de exame médico antes da fisioterapia. Depois da liberação do médico, cuidamos da reabilitação.', '', ''];
      } else if (eva >= 7 || (tempo === 'dias' && eva >= 5)) {
        html = ['#d1701c', 'Vale começar esta semana', 'Dor ' + (eva >= 7 ? 'forte' : 'recente e moderada') + ' no(a) ' + nomeReg.toLowerCase() + ' responde melhor quando tratada cedo. Marque uma avaliação; temos horários em até 2 dias.', 'avaliacao', 'Agendar avaliação'];
      } else if (tempo === 'meses') {
        html = ['#3d4fd6', 'Dor crônica: avaliação completa', 'Dor há mais de 3 meses quase sempre tem causa no jeito de se mexer. A avaliação junta testes de força' + (reg === 'joelho' || reg === 'tornozelo' || reg === 'quadril' ? ' e a análise da pisada' : '') + ' para achar a origem.', reg === 'joelho' || reg === 'tornozelo' || reg === 'quadril' ? 'pisada' : 'avaliacao', 'Agendar avaliação completa'];
      } else {
        html = ['#2f9e5b', 'Dá para começar com calma', 'Dor leve a moderada no(a) ' + nomeReg.toLowerCase() + '. Movimento leve ajuda; evite repouso total. Se não melhorar em 2 semanas, venha fazer a avaliação.', 'avaliacao', 'Agendar mesmo assim'];
      }
      r.style.setProperty('--nivel', html[0]);
      r.innerHTML = '<p class="nivel">' + html[1] + '</p><p>' + html[2] + '</p>' + (PROG[reg] && !alertas ? '<p>Programa que combina: <a href="programas.html#' + PROG[reg] + '">ver semana a semana</a>.</p>' : '') + (html[3] ? '<a class="botao" href="agendar.html?s=' + html[3] + '">' + html[4] + '</a>' : '');
      r.hidden = false; r.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  // programas
  function abrirProg(k) {
    $$('[data-prog]').forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.prog === k)); });
    $$('[data-p]').forEach(function (a) { a.hidden = a.dataset.p !== k; });
  }
  $$('[data-prog]').forEach(function (b) { b.addEventListener('click', function () { abrirProg(b.dataset.prog); }); });
  $$('.prog').forEach(function (a) {
    var r = $('input', a), o = $('output', a), txt = $('.fase-txt', a);
    function semana() {
      var s = +r.value; o.textContent = s;
      $$('.fase', a).forEach(function (f) {
        var agora = s >= +f.dataset.de && s <= +f.dataset.ate; f.classList.toggle('agora', agora);
        if (agora) txt.innerHTML = '<h2>' + f.dataset.nome + '</h2><p>' + f.dataset.txt + '</p><p class="rot">Semanas ' + f.dataset.de + ' a ' + f.dataset.ate + ' · 2 a 3 sessões por semana</p>';
      });
    }
    r.addEventListener('input', semana); semana();
  });
  if ($('[data-prog]') && location.hash && $('[data-p="' + location.hash.slice(1) + '"]')) abrirProg(location.hash.slice(1));

  // convênios
  var busca = $('#plano');
  if (busca) {
    var norm = function (s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
    busca.addEventListener('input', function () {
      var q = norm(busca.value.trim()), n = 0;
      $$('#planos li').forEach(function (li) { var ok = !q || norm(li.dataset.nome).indexOf(q) > -1; li.hidden = !ok; if (ok) n++; });
      $('.nada').hidden = n > 0;
    });
    var sess = $('#sess'), pct = $('#pct');
    function conta() {
      var gasto = +sess.value * 150, volta = gasto * +pct.value;
      $('.conta').innerHTML = sess.value + ' sessões: você paga ' + real(gasto) + ' e recebe de volta <b>' + real(volta) + '</b>. Custo final ' + real(gasto - volta) + '.';
    }
    sess.addEventListener('input', conta); pct.addEventListener('change', conta); conta();
  }

  // agenda semanal: segunda a sábado, das 7h às 19h; horários ocupados fixos por dia, unidade e serviço
  var ag = $('#agendar');
  if (ag) {
    var q = new URLSearchParams(location.search);
    if (q.get('s')) ag.s.value = q.get('s');
    var HORAS = ['07:00', '08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
    var sem = 0, escolha = null, grade = $('[data-grade]', ag);
    function segunda(n) { var d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + n * 7); return d; }
    function montar() {
      var ini = segunda(sem), hoje = new Date(), u = ag.u.value, s = ag.s.value, dias = [];
      for (var i = 0; i < 6; i++) { var d = new Date(ini); d.setDate(ini.getDate() + i); dias.push(d); }
      $('[data-titulo]', ag).textContent = dias[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) + ' a ' + dias[5].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
      $('[data-sem="-1"]', ag).disabled = sem === 0;
      $('[data-sem="1"]', ag).disabled = sem === 3;
      var h = '<span></span>' + dias.map(function (d) { return '<span class="cab">' + d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '') + '<br>' + d.getDate() + '</span>'; }).join('');
      HORAS.forEach(function (hr, j) {
        h += '<span class="hora">' + hr + '</span>';
        dias.forEach(function (d, i) {
          var quando = new Date(d); quando.setHours(+hr.slice(0, 2));
          var semente = d.getDate() * 31 + j * 7 + (u === 'sul' ? 3 : 0) + s.length;
          var livre = quando > hoje && !(i === 5 && j > 4) && semente % 5 > 1;
          var id = d.toISOString().slice(0, 10) + ' ' + hr;
          h += '<button type="button" data-q="' + id + '" aria-pressed="' + (escolha === id) + '"' + (livre ? '' : ' disabled') + ' aria-label="' + d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric' }) + ' às ' + hr + (livre ? '' : ', ocupado') + '">' + hr.slice(0, 2) + 'h</button>';
        });
      });
      grade.innerHTML = h;
    }
    ag.addEventListener('click', function (e) {
      var b = e.target.closest('[data-sem]'); if (b) { sem += +b.dataset.sem; montar(); return; }
      var c = e.target.closest('[data-q]'); if (c && !c.disabled) { escolha = c.dataset.q; $$('[data-q]', grade).forEach(function (x) { x.setAttribute('aria-pressed', String(x === c)); }); }
    });
    ag.addEventListener('change', function (e) { if (e.target.name === 'u' || e.target.name === 's') { escolha = null; montar(); } });
    montar();
    ag.addEventListener('submit', function (e) {
      e.preventDefault();
      var erro = $('.erro', ag), nome = ag.nome.value.trim(), tel = ag.tel.value.replace(/\D/g, '');
      erro.textContent = !escolha ? 'Escolha um horário livre na grade.' : nome.length < 2 ? 'Escreva seu nome.' : tel.length < 10 ? 'Confira o WhatsApp com DDD.' : '';
      if (erro.textContent) return;
      var p = escolha.split(' '), d = new Date(p[0] + 'T12:00:00'), serv = ag.s.options[ag.s.selectedIndex].text.split(' · ')[0];
      var unid = $('[name=u]:checked + span b', ag).textContent;
      var quando = d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }) + ' às ' + p[1];
      var ok = document.createElement('div'); ok.className = 'ok';
      ok.innerHTML = '<h2>Horário pré-reservado</h2><p>' + nome.split(' ')[0] + ', sua ' + serv.toLowerCase() + ' ficou para ' + quando + ', na unidade ' + unid + '. Venha de roupa leve' + (ag.s.value === 'pisada' ? ' e traga o tênis que você mais usa' : '') + '.</p><a class="botao" href="#" data-wa="Olá, Eixo! Pré-reservei ' + serv.toLowerCase() + ' para ' + quando + ' na unidade ' + unid + '.">Confirmar pelo WhatsApp</a>';
      ag.replaceWith(ok);
    });
  }
})();
