// Moveo · serviços ligados ao mosaico de fotos, região → pacote de sessões, agenda com horários livres por dia.
(function () {
  'use strict';
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return [].slice.call((el || document).querySelectorAll(s)); };
  var real = function (v) { return 'R$ ' + v.toLocaleString('pt-BR'); };

  // início: cada objeto da sala é um serviço
  var S = {
    manual: ['Terapia manual', 'Mobilização e manipulação das articulações, na maca, para dor e rigidez.', 'A maca'],
    miofascial: ['Liberação miofascial', 'Pressão nos pontos de tensão, com as mãos e com o rolo, para soltar a musculatura.', 'O rolo de espuma'],
    movimento: ['Terapia do movimento', 'Exercícios com bola, peso e equilíbrio para voltar a se mexer com confiança.', 'A bola'],
    ortopedica: ['Fisioterapia ortopédica', 'Pós-operatório, entorses, tendinites e fraturas, com faixas e carga progressiva.', 'As faixas elásticas'],
    palmilhas: ['Palmilhas ortopédicas', 'Avaliação da pisada e palmilha sob medida, pronta em 7 dias.', 'As palmilhas']
  };
  var caixa = $('.bilhete');
  function servico(k) {
    var s = S[k]; if (!s || !caixa) return;
    $$('[data-serv]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.serv === k)); });
    caixa.innerHTML = '<p class="obj">tratamento</p><h2>' + s[0] + '</h2><p>' + s[1] + '</p><a class="botao" href="#" data-wa="Olá, Moveo! Quero saber mais sobre ' + s[0].toLowerCase() + '.">Quero esse tratamento</a>';
  }
  document.addEventListener('click', function (e) { var b = e.target.closest('[data-serv]'); if (b) servico(b.dataset.serv); });
  addEventListener('moveo-servico', function (e) { servico(e.detail); });

  // onde dói: região e pacote (avaliação R$ 180, sessão R$ 140, desconto a partir de 10)
  $$('[data-r]').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('[data-r]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      $$('[data-painel]').forEach(function (p) { p.hidden = p.dataset.painel !== b.dataset.r; });
    });
  });
  $$('.pacote').forEach(function (f) {
    var r = $('input', f), o = $('output', f), pr = $('.preco', f);
    function conta() {
      var n = +r.value, desc = n >= 16 ? 0.15 : n >= 10 ? 0.1 : 0, total = Math.round(n * 140 * (1 - desc));
      o.textContent = n;
      pr.innerHTML = real(total) + '<small>' + n + ' sessões de 45 min' + (desc ? ', ' + desc * 100 + '% de desconto' : '') + ' · em até 6× de ' + real(Math.ceil(total / 6)) + '</small>';
    }
    r.addEventListener('input', conta); f.addEventListener('submit', function (e) { e.preventDefault(); }); conta();
  });

  // agenda: próximos 10 dias úteis, horários ocupados sorteados de forma fixa por dia e fisioterapeuta
  var ag = $('#agenda');
  if (ag) {
    var q = new URLSearchParams(location.search);
    if (q.get('r')) ag.r.value = q.get('r');
    if (q.get('p')) ag.p.value = q.get('p');
    var dias = [], d = new Date(), dia = '', hora = '';
    while (dias.length < 10) { d.setDate(d.getDate() + 1); if (d.getDay() && d.getDay() < 6) dias.push(new Date(d)); }
    var HORAS = ['07:00', '08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
    var cx = $('[data-dias]', ag), hx = $('[data-horas]', ag);
    cx.innerHTML = dias.map(function (x, i) { return '<button type="button" data-d="' + i + '" aria-pressed="false">' + x.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }) + '</button>'; }).join('');
    function horas() {
      hora = '';
      if (dia === '') { hx.innerHTML = '<span class="nota">Escolha o dia primeiro.</span>'; return; }
      var semente = dias[dia].getDate() * 7 + (+ag.p.value || 3);
      hx.innerHTML = HORAS.map(function (h, i) { var ocupado = (semente * (i + 3)) % 5 < 2; return '<button type="button" data-h="' + h + '" aria-pressed="false"' + (ocupado ? ' disabled' : '') + '>' + h + '</button>'; }).join('');
    }
    cx.addEventListener('click', function (e) { var b = e.target.closest('[data-d]'); if (!b) return; dia = +b.dataset.d; $$('[data-d]', cx).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); horas(); });
    hx.addEventListener('click', function (e) { var b = e.target.closest('[data-h]'); if (!b || b.disabled) return; hora = b.dataset.h; $$('[data-h]', hx).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); });
    ag.p.addEventListener('change', horas);
    horas();
    ag.addEventListener('submit', function (e) {
      e.preventDefault();
      var erro = $('.erro', ag), nome = ag.nome.value.trim(), tel = ag.tel.value.replace(/\D/g, '');
      erro.textContent = dia === '' ? 'Escolha o dia.' : !hora ? 'Escolha o horário.' : nome.length < 2 ? 'Escreva seu nome.' : tel.length < 10 ? 'Confira o WhatsApp com DDD.' : '';
      if (erro.textContent) return;
      var quando = dias[dia].toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }) + ' às ' + hora;
      var reg = ag.r.options[ag.r.selectedIndex].text, fisio = ag.p.value ? ag.p.options[ag.p.selectedIndex].text : 'quem estiver livre';
      var ok = document.createElement('div'); ok.className = 'ok';
      ok.innerHTML = '<h2>Pré-reserva feita</h2><p>' + nome.split(' ')[0] + ', sua avaliação de ' + reg.toLowerCase() + ' ficou para ' + quando + ', com ' + fisio + '. Confirmamos pelo WhatsApp em até 1 hora.</p><a class="botao" href="#" data-wa="Olá, Moveo! Fiz a pré-reserva de ' + reg.toLowerCase() + ' para ' + quando + '.">Ver a confirmação</a>';
      ag.replaceWith(ok);
    });
  }
})();
