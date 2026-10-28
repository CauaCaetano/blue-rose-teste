// Atlas · áreas da unidade-modelo, filtro de unidades, simulador de franquia, vagas e avaliação de imóvel.
(function () {
  'use strict';
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return [].slice.call((el || document).querySelectorAll(s)); };
  var reais = function (n) { return n >= 1e6 ? 'R$ ' + (n / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' milhão' + (n >= 2e6 ? 'ões' : '') : 'R$ ' + Math.round(n).toLocaleString('pt-BR'); };

  // ---------- áreas (início) ----------
  if ($('.area-painel')) {
    var abrir = function (k) { $$('.area-painel').forEach(function (p) { p.hidden = p.dataset.painel !== k; }); $('.dica-area').hidden = true; if (window.atlasUnidade) window.atlasUnidade.escolher(k); };
    addEventListener('atlas-area', function (e) { abrir(e.detail); });
  }

  // ---------- unidades ----------
  var fu = $('.filtro-un');
  if (fu) fu.addEventListener('click', function (e) {
    var b = e.target.closest('[data-st]'); if (!b) return;
    $$('button', fu).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    $$('.un').forEach(function (u) { u.hidden = !!b.dataset.st && u.dataset.st !== b.dataset.st; });
  });

  // ---------- franquia ----------
  var sf = $('#sim-franquia');
  if (sf) {
    var resumo = '';
    var conta = function () {
      var m2 = Number(sf.m2.value), pop = Number(sf.pop.value), al = Number(sf.al.value);
      sf.m2o.value = m2 + ' m²'; sf.alo.value = al + ' alunos';
      // investimento: R$ 1.900/m² de obra e equipamento + R$ 180 mil de taxa e giro; ticket médio R$ 219 ajustado pela cidade
      var inv = m2 * 1900 + 180000, fat = al * 219 * pop, luc = fat * 0.24, meses = luc > 0 ? Math.ceil(inv / luc) : 0;
      $('[data-f="inv"]').textContent = reais(inv); $('[data-f="fat"]').textContent = reais(fat); $('[data-f="luc"]').textContent = reais(luc);
      $('[data-f="ret"]').textContent = meses + ' meses';
      resumo = '• Unidade de ' + m2 + ' m²\n• ' + al + ' alunos no 12º mês\n• Investimento: ' + reais(inv) + '\n• Retorno: ' + meses + ' meses';
    };
    sf.addEventListener('input', conta); conta();
    $('[data-wa-franquia]').addEventListener('click', function (e) { e.preventDefault(); if (window.BR_WA) window.BR_WA('Olá, Atlas! Simulei uma franquia no site.\n' + resumo); });
  }

  // ---------- vagas ----------
  var va = $('[data-va]');
  if (va) {
    var vc = $('[data-vc]'), dlg = $('#candidatura'), vaga = '';
    var filtrar = function () { $$('.vaga').forEach(function (v) { v.hidden = (va.value && v.dataset.a !== va.value) || (vc.value && v.dataset.c !== vc.value); }); };
    va.addEventListener('change', filtrar); vc.addEventListener('change', filtrar);
    document.addEventListener('click', function (e) { var b = e.target.closest('[data-vaga]'); if (!b || !dlg.showModal) return; vaga = b.dataset.vaga; $('.cand-vaga', dlg).textContent = vaga; dlg.showModal(); });
    $('[data-enviar]', dlg).addEventListener('click', function (e) {
      var f = dlg.querySelector('form'), erro = $('.erro', dlg), m = !f.nome.value.trim() ? 'Digite seu nome.' : f.tel.value.replace(/\D/g, '').length < 10 ? 'Digite um WhatsApp com DDD.' : '';
      if (m) { e.preventDefault(); erro.textContent = m; return; }
      erro.textContent = '';
      setTimeout(function () { if (window.BR_WA) window.BR_WA('Olá, Atlas! Quero me candidatar.\n• Vaga: ' + vaga + '\n• Nome: ' + f.nome.value.trim() + (f.por.value.trim() ? '\n• Por que eu: ' + f.por.value.trim() : '')); }, 100);
    });
  }

  // ---------- imóvel ----------
  var fi = $('#form-imovel');
  if (fi) {
    var avalia = function () {
      var m2 = Number(fi.m2.value.replace(/\D/g, '')), pts = (m2 >= 300 ? 2 : 0) + (m2 >= 500 ? 1 : 0) + (Number(fi.pd.value) >= 4 ? 1 : 0) + (fi.est.checked ? 1 : 0) + (fi.rua.checked ? 1 : 0);
      $('.nota-ponto').textContent = !m2 ? '' : m2 < 300 ? 'Abaixo de 300 m² fica pequeno para a unidade-modelo, mas mande assim mesmo.' : pts >= 5 ? 'Perfil excelente: este ponto tem tudo o que procuramos.' : pts >= 3 ? 'Bom perfil: vale a avaliação da equipe.' : 'Perfil possível, com ressalvas.';
      return m2;
    };
    fi.addEventListener('input', avalia); fi.addEventListener('change', avalia);
    fi.addEventListener('submit', function (e) {
      e.preventDefault(); var m2 = avalia();
      if (!fi.cidade.value.trim() || !m2) { $('.nota-ponto').textContent = 'Informe a cidade e a área.'; return; }
      if (window.BR_WA) window.BR_WA('Olá, Atlas! Tenho um imóvel para avaliação.\n• Cidade: ' + fi.cidade.value.trim() + '\n• Área: ' + m2 + ' m²\n• Pé-direito: ' + fi.pd.options[fi.pd.selectedIndex].text);
    });
  }
})();
