// Castro Lemos · diagnóstico em 4 perguntas (acende o caminho na rede 3D) e o relógio das medidas.
(function () {
  'use strict';
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return [].slice.call((el || document).querySelectorAll(s)); };

  var diag = $('#diag');
  if (diag) {
    var passos = $$('fieldset', diag), atual = 0, res = $('.diag-res', diag), voltar = $('[data-voltar]', diag);
    // caminho de cada caso na rede e o que fazer primeiro
    var CASOS = {
      pix: { rota: ['voce', 'banco', 'cartorio', 'justica'], txt: 'Você → Banco → Cartório → Justiça', h: 'Golpe no PIX: aja nas próximas horas', p: 'Peça ao seu banco a abertura do MED (Mecanismo Especial de Devolução) e registre boletim de ocorrência online. Em paralelo, avaliamos se houve falha do banco que permita ação de ressarcimento.' },
      conta: { rota: ['voce', 'plataforma', 'cartorio', 'justica'], txt: 'Você → Plataforma → Cartório → Justiça', h: 'Conta invadida ou perfil falso', p: 'Avise seus contatos, use a recuperação oficial da plataforma e guarde o link do perfil falso. Se a plataforma não resolver, cabe notificação e ação para remoção e identificação do responsável.' },
      dados: { rota: ['voce', 'empresa', 'anpd', 'justica'], txt: 'Você → Empresa → ANPD → Justiça', h: 'Vazamento de dados: a empresa responde por isso', p: 'Pela LGPD, quem vazou precisa comunicar você e a ANPD. Pedimos explicações formais, avaliamos o risco do que vazou e, se houver dano, entramos com a ação de indenização.' },
      exposicao: { rota: ['voce', 'cartorio', 'plataforma', 'justica'], txt: 'Você → Cartório → Plataforma → Justiça', h: 'Exposição: primeiro a prova, depois a remoção', p: 'É possível pedir a remoção rápida do conteúdo e indenização por danos morais. Antes de remover, preservamos a prova por ata notarial, senão ela some junto.' },
      contrato: { rota: ['voce', 'empresa', 'justica'], txt: 'Você → Empresa → Justiça', h: 'Conflito com loja, aplicativo ou contrato', p: 'Reúna contrato, conversas e comprovantes. Muitas vezes uma notificação extrajudicial bem feita resolve sem processo. Se não resolver, seguimos para a ação.' },
    };
    var EXTRA = {
      horas: 'Ainda dá tempo de pedir o bloqueio: fale com o plantão agora.',
      anos: 'Caso antigo: a maior parte das ações tem prazo de 3 a 5 anos. Vamos ver o que ainda pode ser recuperado.',
      nao: 'Sem provas ainda dá para agir: bancos, operadoras e plataformas guardam registros que podem ser pedidos na Justiça.',
      alto: 'Prejuízo alto: combinamos bloqueio urgente com investigação do caminho do dinheiro.',
    };
    var NOMES = { pix: 'Golpe no PIX', conta: 'Conta invadida ou perfil falso', dados: 'Vazamento de dados', exposicao: 'Exposição de fotos ou dados', contrato: 'Loja, app ou contrato', horas: 'nas últimas 24 horas', semana: 'nesta semana', meses: 'há alguns meses', anos: 'há mais de um ano', sim: 'sim, todas', parte: 'parte delas', nao: 'nenhuma', baixo: 'até R$ 5 mil', medio: 'R$ 5 mil a R$ 50 mil', alto: 'mais de R$ 50 mil', nenhum: 'não foi dinheiro' };

    var mostrar = function (i, semFoco) {
      atual = i;
      passos.forEach(function (f, k) { f.hidden = k !== i; });
      $$('.diag-passos i', diag).forEach(function (b, k) { b.classList.toggle('feito', k < i || i === passos.length); });
      voltar.hidden = i === 0 || i === passos.length;
      res.hidden = i !== passos.length;
      if (i < passos.length && !semFoco) { var r = $('input:checked', passos[i]) || $('input', passos[i]); r.focus({ preventScroll: true }); }
    };
    diag.addEventListener('change', function (e) {
      if (e.target.name === 'tipo' && window.castroRede) window.castroRede.rota(CASOS[e.target.value].rota);
      setTimeout(function () { if (atual < passos.length - 1) mostrar(atual + 1); else resultado(); }, 260);
    });
    voltar.addEventListener('click', function () { mostrar(Math.max(0, atual - 1)); });
    $('[data-refazer]', diag).addEventListener('click', function () { diag.reset(); mostrar(0); });

    var resultado = function () {
      var f = new FormData(diag), c = CASOS[f.get('tipo')] || CASOS.contrato;
      $('.res-rota', res).textContent = c.txt;
      $('.res-h', res).textContent = c.h;
      $('.res-p', res).textContent = c.p;
      var ul = $('.res-extra', res); ul.innerHTML = '';
      ['quando', 'provas', 'valor'].forEach(function (k) { var x = EXTRA[f.get(k)]; if (x) { var li = document.createElement('li'); li.textContent = x; ul.appendChild(li); } });
      $('[data-wa-diag]', res).setAttribute('data-wa', 'Olá, Castro Lemos! Fiz o diagnóstico no site.\n• Caso: ' + NOMES[f.get('tipo')] + '\n• Quando: ' + NOMES[f.get('quando')] + '\n• Provas: ' + NOMES[f.get('provas')] + '\n• Valor: ' + NOMES[f.get('valor')]);
      if (window.castroRede) window.castroRede.rota(c.rota);
      mostrar(passos.length);
      res.setAttribute('tabindex', '-1'); res.focus({ preventScroll: true });
    };
    mostrar(0, true);
  }

  // relógio: 0 = horas … 7 = anos; cada medida vale até um ponto da régua
  var tempo = $('#tempo');
  if (tempo) {
    var ROT = ['algumas horas', '2 dias', '2 semanas', '1 mês', '3 meses', '8 meses', '2 anos', '6 anos'];
    // até que ponto da régua cada medida ainda funciona: MED até ~2 dias, bloqueio até ~1 mês,
    // registros das plataformas até ~3 meses (guarda de 6), indenização até ~2 anos (prescreve em 3 a 5), notificação sempre
    var PRAZO = { 1: 1, 3: 3, 5: 4, 6: 6, 7: 7 };
    var pintar = function () {
      var v = Number(tempo.value);
      $('#tempo-txt').textContent = ROT[v];
      tempo.style.setProperty('--p', (v / 7 * 100) + '%');
      $$('.medidas li').forEach(function (li) {
        var ok = v <= PRAZO[li.dataset.ate];
        li.classList.toggle('vencida', !ok);
        li.setAttribute('aria-disabled', String(!ok));
      });
    };
    tempo.addEventListener('input', pintar); pintar();
  }
})();

// contato: o pedido ao plantão vira a simulação do WhatsApp
(function () {
  var f = document.getElementById('plantao'); if (!f) return;
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var erro = f.querySelector('.erro'), nome = f.nome.value.trim(), tel = f.tel.value.replace(/\D/g, '');
    if (!nome) { erro.textContent = 'Digite seu nome.'; f.nome.focus(); return; }
    if (tel.length < 10) { erro.textContent = 'Digite um WhatsApp com DDD.'; f.tel.focus(); return; }
    erro.textContent = '';
    if (window.BR_WA) window.BR_WA('Olá, Castro Lemos! Pedido pelo site.\n• Nome: ' + nome + '\n• Caso: ' + f.tipo.value + (f.txt.value.trim() ? '\n• Relato: ' + f.txt.value.trim() : ''));
  });
})();
