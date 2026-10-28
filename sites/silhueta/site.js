// Silhueta · localizador (cidade, CEP ou GPS) ligado à foto 3D, filtros, comparador, simulador de pacote e agenda por unidade.
(function () {
  'use strict';
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return [].slice.call((el || document).querySelectorAll(s)); };
  var reais = function (n) { return 'R$ ' + Math.round(n).toLocaleString('pt-BR'); };
  var sem = function (s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };

  // ---------- unidades e localizador (início) ----------
  var lista = $('.unidades');
  if (lista) {
    var escolher = function (id, rolar) {
      $$('[data-unidade]', lista).forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.unidade === id)); });
      $$('.un-painel').forEach(function (p) { p.hidden = p.dataset.painel !== id; });
      if (window.silMapa) window.silMapa.focar(id);
      if (rolar) { var p = $('.un-painel[data-painel="' + id + '"]'); if (p) p.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
    };
    lista.addEventListener('click', function (e) { var b = e.target.closest('[data-unidade]'); if (b) escolher(b.dataset.unidade); });
    addEventListener('sil-unidade', function (e) { escolher(e.detail, true); });
    var unidades = $$('[data-unidade]', lista).map(function (b) { return { id: b.dataset.unidade, nome: b.dataset.nome, lat: Number(b.dataset.lat), lon: Number(b.dataset.lon), cep: b.dataset.cep }; });
    var dist = function (a, b, c, d) { var r = Math.PI / 180, x = Math.sin((c - a) * r / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin((d - b) * r / 2) ** 2; return 12742 * Math.asin(Math.sqrt(x)); };
    var msg = $('.loc-msg'), f = $('#localizador');
    var achou = function (u, extra) { escolher(u.id, true); msg.textContent = 'Mais perto: ' + u.nome + (extra ? ' · ' + extra : '') + '.'; };
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = f.onde.value.trim(), cep = q.replace(/\D/g, '');
      if (cep.length >= 2) {
        var dois = Number(cep.slice(0, 2));
        var u = unidades.filter(function (x) { return x.cep.split('-').length === 2 ? dois >= Number(x.cep.split('-')[0]) && dois <= Number(x.cep.split('-')[1]) : Number(x.cep) === dois; })[0];
        if (u) return achou(u, 'pelo CEP');
        msg.textContent = 'Ainda não temos unidade nessa região. Fale com a gente pelo WhatsApp.'; return;
      }
      var u2 = unidades.filter(function (x) { return sem(x.nome).indexOf(sem(q)) >= 0; })[0];
      if (q && u2) return achou(u2);
      msg.textContent = q ? 'Não achamos "' + q + '". Tente o CEP ou use sua localização.' : 'Digite a cidade ou o CEP.';
    });
    $('[data-gps]').addEventListener('click', function () {
      if (!navigator.geolocation) { msg.textContent = 'Seu navegador não informa a localização.'; return; }
      msg.textContent = 'Procurando…';
      navigator.geolocation.getCurrentPosition(function (pos) {
        var c = pos.coords, melhor = unidades.map(function (u) { return [u, dist(c.latitude, c.longitude, u.lat, u.lon)]; }).sort(function (a, b) { return a[1] - b[1]; })[0];
        achou(melhor[0], Math.round(melhor[1]) + ' km de você');
      }, function () { msg.textContent = 'Sem permissão para a localização. Use a cidade ou o CEP.'; }, { timeout: 8000 });
    });
    escolher('savassi');
  }

  // ---------- tratamentos ----------
  var cats = $('.cats');
  if (cats) {
    var cat = '', novos = $('[data-novos]');
    var filtrar = function () { $$('.trat').forEach(function (t) { t.hidden = (cat && t.dataset.cat !== cat) || (novos.checked && !t.hasAttribute('data-novo')); }); };
    cats.addEventListener('click', function (e) { var b = e.target.closest('[data-cat]'); if (!b) return; cat = b.dataset.cat; $$('button', cats).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); filtrar(); });
    novos.addEventListener('change', filtrar);
    var h = sem(location.hash.slice(1)); if (h) { var alvo = $$('button', cats).filter(function (b) { return sem(b.dataset.cat) === h; })[0]; if (alvo) alvo.click(); }
  }

  // ---------- comparador ----------
  var cd = $('#comp-dados');
  if (cd) {
    var D = JSON.parse(cd.textContent);
    var pinta = function () {
      [0, 1].forEach(function (c) {
        var k = $('[data-tec="' + c + '"]').value, l = D[k];
        $('[data-nome="' + c + '"]').textContent = l[0];
        $$('[data-c="' + c + '"]').forEach(function (td) { td.textContent = l[Number(td.dataset.i) + 1]; });
      });
    };
    $$('[data-tec]').forEach(function (s) { s.addEventListener('change', pinta); }); pinta();
  }

  // ---------- pacote ----------
  var sim = $('#simulador');
  if (sim) {
    var T = JSON.parse($('#trat-dados').textContent), q = new URLSearchParams(location.search).get('t');
    if (q && T[q]) sim.t.value = q;
    var resumo = '';
    var conta = function () {
      var t = T[sim.t.value], n = Number(sim.sess.value), base = t[1] * n;
      // desconto progressivo: 4+ sessões 10%, 8+ 20%, 12 sessões 25%; primeiro pacote soma 5 pontos (teto de 30%)
      var d = n >= 12 ? 0.25 : n >= 8 ? 0.2 : n >= 4 ? 0.1 : 0; if (sim.primeiro.checked && n >= 4) d = Math.min(0.3, d + 0.05);
      var total = base * (1 - d);
      sim.nsess.value = n + (n > 1 ? ' sessões' : ' sessão');
      $('[data-r-trat]').textContent = t[0];
      $('[data-r-normal]').textContent = reais(base);
      $('[data-r-desc]').textContent = d ? Math.round(d * 100) + '% · −' + reais(base - total) : 'sem desconto (a partir de 4 sessões)';
      $('[data-r-sessao]').textContent = reais(total / n);
      $('[data-r-total]').textContent = reais(total);
      $('[data-r-parc]').textContent = 'ou 10× de ' + reais(total / 10) + ' sem juros';
      resumo = '• Tratamento: ' + t[0] + '\n• Sessões: ' + n + '\n• Total: ' + reais(total) + (d ? ' (' + Math.round(d * 100) + '% de desconto)' : '');
    };
    sim.addEventListener('input', conta); conta();
    $('[data-wa-pacote]').addEventListener('click', function (e) { e.preventDefault(); if (window.BR_WA) window.BR_WA('Olá, Silhueta! Simulei um pacote no site.\n' + resumo); });
  }

  // ---------- agendar ----------
  var ag = $('#agendar');
  if (ag) {
    var qs = new URLSearchParams(location.search);
    ['u', 't'].forEach(function (k) { var v = (qs.get(k) || '').replace(/[^a-z-]/g, ''); if (v && ag[k].querySelector('option[value="' + v + '"]')) ag[k].value = v; });
    var esc = { dia: '', hora: '' }, dias = $('[data-dias]', ag), horas = $('[data-horas]', ag), d = new Date(), n = 0, chaveDia = [];
    while (n < 8) {
      d.setDate(d.getDate() + 1); if (d.getDay() === 0) continue;
      var b = document.createElement('button'); b.type = 'button'; b.dataset.dia = d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' }); b.dataset.n = n;
      b.innerHTML = '<span>' + d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '') + '</span><b>' + d.getDate() + '</b>';
      dias.appendChild(b); n++;
    }
    // horários livres variam por unidade e por dia (sorteio fixo: a mesma escolha mostra sempre os mesmos horários)
    var semente = function (s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
    var mostrarHoras = function () {
      horas.innerHTML = ''; esc.hora = '';
      var dia = $('[data-dia][aria-pressed="true"]', ag); if (!dia) { horas.innerHTML = '<small>Escolha o dia.</small>'; return; }
      var h = semente(ag.u.value + dia.dataset.n);
      ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'].forEach(function (x, i) {
        if ((h >> i) & 1) { var bt = document.createElement('button'); bt.type = 'button'; bt.dataset.hora = x; bt.textContent = x; horas.appendChild(bt); }
      });
      if (!horas.children.length) horas.innerHTML = '<small>Sem horários livres neste dia. Escolha outro.</small>';
    };
    ag.addEventListener('click', function (e) {
      var b = e.target.closest('[data-dia],[data-hora]'); if (!b) return;
      var k = b.dataset.dia ? 'dia' : 'hora';
      $$('[data-' + k + ']', ag).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      esc[k] = b.dataset[k]; if (k === 'dia') mostrarHoras();
    });
    ag.u.addEventListener('change', mostrarHoras);
    mostrarHoras();
    ag.addEventListener('submit', function (e) {
      e.preventDefault();
      var erro = $('.erro', ag), m = !esc.dia || !esc.hora ? 'Escolha o dia e o horário.' : !ag.nome.value.trim() ? 'Digite seu nome.' : ag.tel.value.replace(/\D/g, '').length < 10 ? 'Digite um WhatsApp com DDD.' : '';
      erro.textContent = m; if (m) return;
      if (window.BR_WA) window.BR_WA('Olá, Silhueta! Quero agendar.\n• Nome: ' + ag.nome.value.trim() + '\n• Unidade: ' + ag.u.options[ag.u.selectedIndex].text + '\n• Serviço: ' + ag.t.options[ag.t.selectedIndex].text + '\n• Dia: ' + esc.dia + ' às ' + esc.hora);
    });
  }
})();
