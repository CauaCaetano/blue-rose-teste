// Brisa · lugar do atendimento (troca a foto 3D), cobertura por bairro, plano para empresas, cronograma de
// evento e vale-presente com prévia.
(function () {
  'use strict';
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return [].slice.call((el || document).querySelectorAll(s)); };
  var real = function (v) { return 'R$ ' + Math.round(v).toLocaleString('pt-BR'); };
  var hm = function (m) { m = ((m % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };

  // início: lugar do atendimento (troca a foto 3D)
  $$('[data-lugar]').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('[data-lugar]').forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
      $$('[data-painel]').forEach(function (p) { p.hidden = p.dataset.painel !== b.dataset.lugar; });
      if (window.brisaMaleta) window.brisaMaleta.lugar(b.dataset.lugar);
    });
  });

  // cobertura: zonas por cidade (1 sem taxa, 2 e 3 com taxa); aeroportos e hotéis entram como lugares
  var CID = {
    sp: [['Pinheiros', 1], ['Vila Madalena', 1], ['Jardins', 1], ['Itaim Bibi', 1], ['Moema', 1], ['Perdizes', 1], ['Vila Mariana', 2], ['Brooklin', 2], ['Tatuapé', 2], ['Santana', 2], ['Morumbi', 2], ['Butantã', 2], ['Santo Amaro', 3], ['Penha', 3], ['Aeroporto de Congonhas', 2], ['Aeroporto de Guarulhos', 3]],
    rj: [['Ipanema', 1], ['Leblon', 1], ['Copacabana', 1], ['Botafogo', 1], ['Flamengo', 1], ['Lagoa', 1], ['Tijuca', 2], ['Barra da Tijuca', 2], ['Recreio', 3], ['Méier', 3], ['Aeroporto Santos Dumont', 1], ['Aeroporto do Galeão', 3]],
    bh: [['Savassi', 1], ['Lourdes', 1], ['Funcionários', 1], ['Sion', 1], ['Belvedere', 2], ['Buritis', 2], ['Pampulha', 2], ['Castelo', 3], ['Nova Lima', 3], ['Aeroporto da Pampulha', 2], ['Aeroporto de Confins', 3]]
  };
  var ZONA = { 1: ['#7fd1b9', 'Zona 1', 'sem taxa de deslocamento', 40], 2: ['#f0b23c', 'Zona 2', 'taxa de R$ 15', 60], 3: ['#ef7f5e', 'Zona 3', 'taxa de R$ 30', 90] };
  var cid = $('#cidade');
  if (cid) {
    var norm = function (s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
    var bairro = $('#bairro'), res = $('.cob-res');
    if (new URLSearchParams(location.search).get('l') === 'aeroporto') bairro.value = 'Aeroporto';
    var listar = function () {
      var c = CID[cid.value];
      $('#bairros').innerHTML = c.map(function (b) { return '<option value="' + b[0] + '">'; }).join('');
      $('[data-zonas]').innerHTML = [1, 2, 3].map(function (z) { return '<li style="--z:' + ZONA[z][0] + '"><b>' + ZONA[z][1] + ' · ' + ZONA[z][2] + '</b>' + c.filter(function (b) { return b[1] === z; }).map(function (b) { return b[0]; }).join(', ') + '</li>'; }).join('');
      busca();
    };
    var busca = function () {
      var q = norm(bairro.value.trim());
      if (q.length < 2) { res.innerHTML = ''; return; }
      var achou = CID[cid.value].filter(function (b) { return norm(b[0]).indexOf(q) > -1; });
      if (!achou.length) { res.innerHTML = '<div class="card" style="--z:#a9c1bd"><b>Ainda não chegamos aí.</b><p>Deixe seu contato e avisamos quando abrir.</p><a class="botao" href="#" data-wa="Olá, Brisa! Moro em ' + bairro.value.trim() + ' e quero ser avisada quando atenderem.">Quero ser avisada</a></div>'; return; }
      res.innerHTML = achou.slice(0, 3).map(function (b) {
        var z = ZONA[b[1]];
        return '<div class="card" style="--z:' + z[0] + '"><b>' + b[0] + '</b><p>' + z[1] + ', ' + z[2] + '. A profissional chega em cerca de ' + z[3] + ' minutos depois do pedido.</p><a class="botao" href="#" data-wa="Olá, Brisa! Quero um atendimento em ' + b[0] + ' (' + cid.options[cid.selectedIndex].text + ').">Pedir em ' + b[0] + '</a></div>';
      }).join('<br>');
    };
    cid.addEventListener('change', listar); bairro.addEventListener('input', busca);
    $('#cobre').addEventListener('submit', function (e) { e.preventDefault(); });
    listar();
  }

  // empresas
  var corp = $('#corp');
  if (corp) {
    var calcCorp = function () {
      var pessoas = +corp.pessoas.value, ad = +corp.adesao.value / 100, f = +$('[name=f]:checked', corp).value;
      corp.pessoas.previousElementSibling.textContent = pessoas; corp.adesao.previousElementSibling.textContent = Math.round(ad * 100) + '%';
      var s = $$('[name=s]:checked', corp), min = 0, preco = 0;
      s.forEach(function (x) { min += +x.dataset.min; preco += +x.dataset.p; });
      var part = Math.round(pessoas * ad), atend = part * f, horas = atend * min / 60;
      var desc = atend >= 200 ? 0.15 : atend >= 80 ? 0.1 : 0, mes = atend * preco * (1 - desc);
      var dias = Math.max(1, Math.ceil(horas / 8 / Math.max(1, Math.ceil(horas / 8 / (4 * f)))));
      var equipe = Math.max(1, Math.ceil(horas / (6 * 4 * f)));
      $('.corp-res').innerHTML = s.length ? '<p>Por mês</p><p class="grande">' + real(mes) + '</p><dl><dt>Por pessoa atendida</dt><dd>' + real(mes / Math.max(1, part)) + '</dd><dt>Atendimentos no mês</dt><dd>' + atend + '</dd><dt>Horas de cadeira</dt><dd>' + Math.round(horas) + 'h</dd><dt>Profissionais por visita</dt><dd>' + equipe + '</dd>' + (desc ? '<dt>Desconto por volume</dt><dd>' + desc * 100 + '%</dd>' : '') + '</dl><a class="botao" href="#" data-wa="Olá, Brisa! Quero o plano para ' + pessoas + ' pessoas, ' + ({ 1: 'mensal', 2: 'quinzenal', 4: 'semanal' })[f] + ', cerca de ' + real(mes) + ' por mês.">Pedir proposta</a>' : '<p>Escolha pelo menos um serviço.</p>';
      return dias;
    };
    corp.addEventListener('input', calcCorp); corp.addEventListener('change', calcCorp); calcCorp();
  }

  // eventos: cronograma de trás para frente
  var ev = $('#evento');
  if (ev) {
    var calcEv = function () {
      var n = +ev.pessoas.value; ev.pessoas.previousElementSibling.textContent = n;
      var por = $$('[name=s]:checked', ev).reduce(function (a, x) { return a + +x.dataset.min; }, 0);
      var hh = (ev.hora.value || '17:00').split(':'), fim = +hh[0] * 60 + +hh[1] - 30; // todo mundo pronta 30 min antes
      if (!por) { $('.cronograma').innerHTML = '<p>Escolha o que cada pessoa vai fazer.</p>'; return; }
      var equipe = Math.min(8, Math.max(1, Math.ceil(n * por / 240))); // cada profissional trabalha até 4h seguidas
      var rodadas = Math.ceil(n / equipe), inicio = fim - rodadas * por;
      var linhas = ['<li><b>' + hm(inicio - 30) + '</b> equipe chega e monta as estações</li>'];
      for (var r = 0; r < rodadas; r++) {
        var ini = inicio + r * por;
        if (r === rodadas - 1 && r > 0 && ev.tipo.value === 'casamento') linhas.push('<li><b>' + hm(ini) + '</b> última rodada, com a noiva</li>');
        else linhas.push('<li><b>' + hm(ini) + '</b> rodada ' + (r + 1) + ': ' + Math.min(equipe, n - r * equipe) + ' pessoa' + (Math.min(equipe, n - r * equipe) > 1 ? 's' : '') + '</li>');
      }
      linhas.push('<li><b>' + hm(fim) + '</b> todo mundo pronta, retoque de batom e fotos</li><li><b>' + hm(fim + 30) + '</b> cerimônia</li>');
      var preco = n * (por >= 95 ? 340 : por >= 50 ? 260 : 160) + (ev.tipo.value === 'casamento' ? 450 : 0);
      $('.cronograma').innerHTML = '<p>Equipe de ' + equipe + ' profissiona' + (equipe > 1 ? 'is' : 'l') + '</p><p class="grande">' + real(preco) + '</p><ol>' + linhas.join('') + '</ol><a class="botao" href="#" data-wa="Olá, Brisa! Evento (' + ev.tipo.value + ') com ' + n + ' pessoas, cerimônia às ' + ev.hora.value + '. Quero reservar a equipe.">Reservar a equipe</a>';
    };
    ev.addEventListener('input', calcEv); ev.addEventListener('change', calcEv); calcEv();
  }

  // vale-presente
  var vale = $('#vale');
  if (vale) {
    var cod = 'BRISA-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    var prev = function () {
      var c = $('.cartao'), v = $('[name=v]:checked', vale).value;
      c.dataset.estampa = $('[name=e]:checked', vale).value;
      $('.c-valor', c).textContent = 'R$ ' + v;
      $('.c-para', c).textContent = vale.para.value.trim() ? 'Para ' + vale.para.value.trim() : 'Para alguém especial';
      $('.c-recado', c).textContent = vale.recado.value.trim() || 'Um tempo só seu, onde você estiver.';
      $('.c-cod', c).textContent = cod + ' · válido por 6 meses';
    };
    vale.addEventListener('input', prev); vale.addEventListener('change', prev); prev();
    vale.addEventListener('submit', function (e) {
      e.preventDefault();
      window.BR_WA && window.BR_WA('Olá, Brisa! Quero comprar um vale-presente de R$ ' + $('[name=v]:checked', vale).value + (vale.para.value.trim() ? ' para ' + vale.para.value.trim() : '') + '. Código ' + cod + '.');
    });
  }
})();
