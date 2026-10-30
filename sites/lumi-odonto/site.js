// Lumi Odontologia · horário vivo (aberto/fechado agora), fio dourado que se desenha na rolagem, abertura que segue o mouse,
// tratamentos que abrem numa gaveta com simulador de parcelas, depoimentos em trilho e agendamento pelo WhatsApp.
(function () {
  'use strict';
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return [].slice.call((el || document).querySelectorAll(s)); };
  var real = function (v) { return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 }); };
  var calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // cabeçalho: transparente sobre a foto, sólido depois dela
  var topo = $('.topo'), abre = $('.abre');
  function cabecalho() { topo.classList.toggle('cheio', scrollY > abre.offsetHeight - 90); }
  addEventListener('scroll', cabecalho, { passive: true }); cabecalho();

  // fio dourado: o traço acompanha quanto da página já foi lido
  var fio = $('.fio path');
  if (fio) {
    var desenha = function () { var t = document.documentElement, p = scrollY / Math.max(1, t.scrollHeight - innerHeight); fio.style.strokeDashoffset = String(1 - Math.min(1, p * 1.05)); };
    fio.setAttribute('pathLength', '1'); addEventListener('scroll', desenha, { passive: true }); desenha();
  }

  // a foto de abertura acompanha o mouse devagar (camadas: foto atrás, texto na frente)
  var cena = $('.cena');
  if (cena && !calmo && matchMedia('(pointer: fine)').matches) {
    abre.addEventListener('mousemove', function (e) {
      var x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
      cena.style.transform = 'translate(' + (-x * 22) + 'px,' + (-y * 14) + 'px)';
      $('.abre-txt').style.transform = 'translate(' + (x * 8) + 'px,' + (y * 6) + 'px)';
    });
  }

  // horário: marca o dia de hoje e diz se está aberto agora
  var DIAS = [['Segunda', 8, 20], ['Terça', 8, 20], ['Quarta', 8, 20], ['Quinta', 8, 20], ['Sexta', 8, 20], ['Sábado', 8, 13]];
  var agora = new Date(), dia = agora.getDay(), hora = agora.getHours() + agora.getMinutes() / 60;
  $('.h-dias').innerHTML = DIAS.map(function (d, i) { return '<li' + (i + 1 === dia ? ' class="hoje"' : '') + '><b>' + d[0] + '</b>' + d[1] + 'h às ' + d[2] + 'h</li>'; }).join('');
  var hoje = DIAS[dia - 1], aberto = hoje && hora >= hoje[1] && hora < hoje[2];
  var prox = (function () { for (var k = 1; k <= 7; k++) { var dd = (dia + k) % 7; if (DIAS[dd - 1]) return DIAS[dd - 1]; } })();
  var est = $('.h-agora'); est.classList.toggle('aberto', !!aberto);
  $('span', est).textContent = aberto ? 'Aberto agora, até as ' + hoje[2] + 'h' : (hoje && hora < hoje[1] ? 'Fechado agora · abre hoje às ' + hoje[1] + 'h' : 'Fechado agora · abre ' + prox[0].toLowerCase() + ' às ' + prox[1] + 'h');

  // tratamentos: blocos que abrem numa gaveta com os detalhes e as parcelas
  var TRAT = [
    ['Implante dentário', 'implante.webp', 'Dente fixo de volta, sem dentadura.', 2490, 'g', ['Pino de titânio e coroa de porcelana', 'Planejamento com raio-x na própria clínica', 'Garantia de 5 anos', 'De 3 a 6 meses, dependendo do osso']],
    ['Lentes de contato dental', 'lentes.webp', 'Cor e formato novos, sem desgastar.', 1190, '', ['Lâminas de porcelana de 0,3 mm', 'Prova do sorriso antes de colar', 'Pronto em 3 consultas', 'Valor por dente']],
    ['Clareamento', 'clareamento.webp', 'Até 8 tons mais claro em 2 semanas.', 690, '', ['Sessão no consultório', 'Moldeira para usar em casa', 'Sem sensibilidade forte, com gel dessensibilizante']],
    ['Aparelho e alinhador', 'ortodontia.webp', 'Fixo, de safira ou transparente.', 4536, '', ['Alinhador transparente que ninguém percebe', 'Aparelho estético de safira', 'Acompanhamento mensal com a Dra. Beatriz']],
    ['Canal e urgência', 'canal.webp', 'Com dor, encaixamos no mesmo dia.', 590, '', ['Canal em 1 sessão na maioria dos casos', 'Atendimento de urgência das 8h às 20h', 'Analgésico já receitado na consulta']],
    ['Limpeza e prevenção', 'limpeza.webp', 'Profilaxia, flúor e revisão.', 180, '', ['Coberta por Amil Dental, SulAmérica Odonto e Odontoprev', 'Revisão a cada 6 meses', 'Lembrete no WhatsApp']]
  ];
  $('.bento').innerHTML = TRAT.map(function (t, i) {
    return '<button type="button" class="card ' + t[4] + '" data-t="' + i + '"><img src="img/' + t[1] + '" alt="" loading="lazy"><span class="c-in"><span class="c-tit">' + t[0] + '</span><span class="c-desc">' + t[2] + '</span><span class="c-preco">a partir de ' + real(t[3]) + ' · ver detalhes →</span></span></button>';
  }).join('');
  var gv = $('#gaveta');
  function abrir(i) {
    var t = TRAT[i], max = t[3] < 300 ? 1 : 18;
    $('.gv-corpo', gv).innerHTML = '<button type="button" class="gv-fecha" aria-label="Fechar">×</button><img src="img/' + t[1] + '" alt="' + t[0] + '"><div class="gv-txt"><p class="rotulo">Tratamento</p><h3 id="gv-t">' + t[0] + '</h3><ul>' + t[5].map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul><p>a partir de</p><p class="gv-preco">' + real(t[3]) + '</p>' +
      (max > 1 ? '<div class="gv-sim"><label>Parcelas sem juros <output>12x</output></label><input type="range" min="1" max="18" value="12" aria-label="Número de parcelas"><p class="gv-parc"></p><p style="font-size:13.5px;color:var(--tinta-2)">Valor de partida. O do seu caso sai na avaliação, por escrito. No Pix, 5% de desconto.</p></div>' : '') +
      '<a class="bt" href="#agendar" data-trat="' + t[0].split(' ')[0] + '">Avaliar meu caso grátis</a></div>';
    var r = $('input[type=range]', gv);
    function parc() { if (!r) return; var n = +r.value; $('output', gv).textContent = n + 'x'; $('.gv-parc', gv).textContent = n + 'x de ' + real(Math.ceil(t[3] / n * 100) / 100); }
    if (r) { r.addEventListener('input', parc); parc(); }
    gv.showModal();
  }
  $('.bento').addEventListener('click', function (e) { var b = e.target.closest('[data-t]'); if (b) abrir(+b.dataset.t); });
  gv.addEventListener('click', function (e) { if (e.target === gv || e.target.closest('.gv-fecha') || e.target.closest('[data-trat]')) gv.close(); });

  // depoimentos: trilho com setas e contador
  var DEP = [['Tinha vergonha de sorrir em foto. Fiz 8 lentes com a Dra. Camila e o preço da avaliação foi o preço do fim.', 'Juliana M.'], ['Cheguei com dor às 10h e saí às 11h30 sem dor. Atendimento de verdade.', 'Marcos T.'], ['Implante em 18x sem juros, tudo explicado no papel. Já indiquei para o meu pai.', 'Renata S.'],
             ['O alinhador ficou pronto antes do prazo e ninguém no trabalho percebeu.', 'Felipe A.'], ['Clareamento sem sensibilidade, coisa que nunca tinha conseguido.', 'Patrícia L.'], ['Levo minha filha desde os 6 anos. Ela pede para ir ao dentista.', 'Carolina R.']];
  var tr = $('.dp-trilho');
  tr.innerHTML = DEP.map(function (d) { return '<article><p class="est" aria-label="5 estrelas">★★★★★</p><q>' + d[0] + '</q><span>' + d[1] + '</span></article>'; }).join('');
  function conta() { var w = tr.firstElementChild.offsetWidth + 16, i = Math.round(tr.scrollLeft / w), n = Math.max(1, Math.round(tr.clientWidth / w)); $('.dp-cont').textContent = (i + 1) + '–' + Math.min(DEP.length, i + n) + ' / ' + DEP.length; }
  $('.dp-prox').addEventListener('click', function () { tr.scrollBy({ left: tr.clientWidth, behavior: 'smooth' }); });
  $('.dp-ant').addEventListener('click', function () { tr.scrollBy({ left: -tr.clientWidth, behavior: 'smooth' }); });
  tr.addEventListener('scroll', function () { requestAnimationFrame(conta); }, { passive: true }); conta();

  // agendamento: leva o tratamento escolhido e vai pelo WhatsApp
  var ag = $('#agendar');
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-trat]'); if (!b || !ag.trat) return;
    [].forEach.call(ag.trat.options, function (o) { if (o.text.indexOf(b.dataset.trat) === 0) ag.trat.value = o.value; });
    setTimeout(function () { ag.nome.focus({ preventScroll: true }); }, 450);
  });
  ag.addEventListener('submit', function (e) {
    e.preventDefault();
    var nome = ag.nome.value.trim(), tel = ag.tel.value.replace(/\D/g, ''), erro = $('.erro', ag);
    erro.textContent = nome.length < 2 ? 'Escreva o seu nome.' : tel.length < 10 ? 'Confira o WhatsApp com DDD.' : '';
    if (erro.textContent) return;
    var per = ag.querySelector('[name=per]:checked').value, trat = ag.trat.value;
    window.BR_WA && window.BR_WA('Olá, Lumi! Sou ' + nome + ' e quero agendar a avaliação grátis. Tratamento: ' + trat.toLowerCase() + '. Melhor horário: ' + per + '.');
    ag.classList.add('ok');
    ag.innerHTML = '<p class="ag-t">Pronto, ' + nome.split(' ')[0].replace(/[<>&]/g, '') + '.</p><p class="ag-sub">A sua avaliação está pré-reservada. A recepção chama no seu WhatsApp em até 15 minutos para confirmar o horário da ' + per + '.</p>';
  });

  // menu: marca a seção que está na tela
  var links = $$('.menu a');
  var obs = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) links.forEach(function (a) { a.classList.toggle('ativo', a.getAttribute('href') === '#' + en.target.id); }); }); }, { rootMargin: '-45% 0px -50% 0px' });
  ['inicio', 'urgencia', 'tratamentos', 'clinica', 'equipe', 'contato'].forEach(function (id) { var el = document.getElementById(id); if (el) obs.observe(el); });
})();
