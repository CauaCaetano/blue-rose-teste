/* Blue Rose · proposta C: troca o painel do ramo sem recarregar a página. */
(function () {
  'use strict';
  var R = '../';
  var TESTE = 'Nada é cobrado no teste · cancele quando quiser';

  var RAMOS = {
    agenda: {
      tipo: 'Veltria · para quem atende sozinha', nome: 'Veltria Agenda',
      frase: 'Confirma o horário no WhatsApp e cobra sinal no PIX.',
      preco: 'R$ 49', fig: 'cel', img: 'img/resultados/agenda.webp', w: 780, h: 800,
      alt: 'Demonstração do Veltria Agenda: confirmação de horário pronta para enviar no WhatsApp',
      demo: 'demos/sistemas/agenda-essencial/?celular=1',
      sec: { txt: 'Testar 7 dias grátis', href: 'veltria-agenda.html#versoes' }, cond: TESTE
    },
    obras: {
      tipo: 'Veltria · para empreiteiro e reformas', nome: 'Veltria Obras',
      frase: 'Gastos da obra e cobrança de cada etapa pelo WhatsApp.',
      preco: 'R$ 69', fig: 'cel', img: 'img/resultados/obras.webp', w: 780, h: 800,
      alt: 'Demonstração do Veltria Obras: aviso de etapa pronta com o valor para pagar no PIX',
      demo: 'demos/sistemas/obras-essencial/?celular=1',
      sec: { txt: 'Testar 7 dias grátis', href: 'veltria-obras.html#versoes' }, cond: TESTE
    },
    financeiro: {
      tipo: 'Veltria · para autônomo e MEI', nome: 'Veltria Financeiro',
      frase: 'Dinheiro em potes, cobrança no PIX e contas fixas em dia.',
      preco: 'R$ 59', fig: 'cel', img: 'img/resultados/financeiro.webp', w: 780, h: 1140,
      alt: 'Demonstração do Veltria Financeiro: cobrança com QR Code do PIX e envio pelo WhatsApp',
      demo: 'demos/sistemas/financeiro-essencial/?celular=1',
      sec: { txt: 'Testar 7 dias grátis', href: 'veltria-financeiro.html#versoes' }, cond: TESTE
    },
    juridico: {
      tipo: 'Veltria · para advogado autônomo', nome: 'Veltria Jurídico',
      frase: 'Prazos em dias úteis, intimações e processos no mesmo lugar.',
      preco: 'R$ 89', fig: 'cel', img: 'img/resultados/juridico.webp', w: 780, h: 1340,
      alt: 'Demonstração do Veltria Jurídico: lista de prazos contados em dias úteis',
      demo: 'demos/sistemas/juridico-essencial/?celular=1',
      sec: { txt: 'Testar 7 dias grátis', href: 'veltria-juridico.html#versoes' }, cond: TESTE
    },
    peplo: {
      tipo: 'Para loja de roupas', nome: 'Peplo',
      frase: 'Fiado com limite e estoque por tamanho e cor.',
      preco: 'R$ 59', fig: 'cel', img: 'img/resultados/peplo.webp', w: 724, h: 1239,
      alt: 'Demonstração do Peplo: venda no fiado com bloqueio automático de cliente em atraso',
      demo: 'demos/sistemas/peplo/app.html',
      sec: { txt: 'Ver o Peplo', href: 'peplo.html' }, cond: 'Sem teste grátis: a demonstração é completa · cancele quando quiser'
    },
    annona: {
      tipo: 'Para mercadinho e mercearia', nome: 'Annona',
      frase: 'Estoque e vendas com código de barras, validade e fiado.',
      preco: 'R$ 59', fig: 'cel', img: 'img/resultados/annona.webp', w: 780, h: 1320,
      alt: 'Demonstração do Annona: entradas de mercadoria lidas do XML da nota',
      demo: 'demos/sistemas/annona/app.html',
      sec: { txt: 'Ver o Annona', href: 'annona.html' }, cond: 'Sem teste grátis: a demonstração é completa · cancele quando quiser'
    },
    outro: {
      tipo: 'Sob medida · pagamento único', nome: 'Feito para o seu negócio',
      frase: 'Site, automação de WhatsApp ou sistema do zero.',
      fig: 'sites',
      lista: [['Site', 'desde R$ 690'], ['Automação de WhatsApp', 'desde R$ 890'], ['Sistema sob medida', 'desde R$ 1.600']],
      principal: { txt: 'Ver sites e automação', href: 'servicos.html' },
      sec: { txt: 'Ver os sites de exemplo', href: 'exemplos.html' },
      cond: 'Preço fechado por escrito antes de começar'
    },
    contab: {
      tipo: 'Contabilidade ou academia', nome: 'Ainda não temos sistema pronto',
      frase: 'Para esses ramos, fazemos o sistema sob medida.',
      fig: 'sob', preco: 'R$ 1.600', precoAntes: 'a partir de', precoSub: 'pagamento único',
      principal: { txt: 'Pedir um sistema sob medida', href: 'servicos.html#monte' },
      sec: { txt: 'Falar com a equipe', href: 'index.html#contato' },
      cond: 'Preço fechado por escrito antes de começar'
    }
  };

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function figura(d) {
    if (d.fig === 'cel') {
      return '<figure class="p-fig p-fig-cel"><img src="' + R + d.img + '" width="' + d.w + '" height="' + d.h + '" alt="' + esc(d.alt) + '"></figure>';
    }
    if (d.fig === 'sites') {
      return '<figure class="p-fig p-fig-sites">' +
        '<img src="' + R + 'img/home/site-vertice.webp" width="560" height="350" alt="Site de exemplo Vértice, prédio com vista para o mar">' +
        '<img src="' + R + 'img/home/site-lumi-odonto.webp" width="560" height="350" alt="Site de exemplo Lumi Odonto, clínica odontológica">' +
        '<img src="' + R + 'img/home/site-aguiar-monteiro.webp" width="560" height="350" alt="Site de exemplo Aguiar Monteiro, escritório de advocacia">' +
        '</figure>';
    }
    return '<figure class="p-fig p-fig-sob"><img src="' + R + 'img/blue-rose-logo.png" width="256" height="256" alt=""><p>Sob medida, do zero.</p></figure>';
  }

  function montar(d) {
    var h = figura(d) + '<div class="p-info">';
    h += '<p class="p-tipo">' + esc(d.tipo) + '</p>';
    h += '<h2 id="p-nome">' + esc(d.nome) + '</h2>';
    h += '<p class="p-frase">' + esc(d.frase) + '</p>';
    if (d.lista) {
      h += '<ul class="p-lista">' + d.lista.map(function (l) { return '<li><span>' + esc(l[0]) + '</span><b>' + esc(l[1]) + '</b></li>'; }).join('') + '</ul>';
    } else if (d.precoSub) {
      h += '<p class="p-preco"><span>' + esc(d.precoAntes) + '</span><b>' + esc(d.preco) + '</b><span>' + esc(d.precoSub) + '</span></p>';
    } else {
      h += '<p class="p-preco"><b>' + esc(d.preco) + '</b><span>/mês</span></p>';
    }
    h += '<div class="p-bts">';
    if (d.demo) h += '<a class="bt bt-principal" href="' + R + d.demo + '" target="_blank" rel="noopener">Abrir demonstração</a>';
    else h += '<a class="bt bt-principal" href="' + R + d.principal.href + '">' + esc(d.principal.txt) + '</a>';
    h += '<a class="bt bt-sec" href="' + R + d.sec.href + '">' + esc(d.sec.txt) + '</a></div>';
    h += '<p class="p-cond">' + esc(d.cond) + '</p></div>';
    return h;
  }

  var painel = document.querySelector('[data-painel]');
  var caixa = document.getElementById('painel');
  var botoes = [].slice.call(document.querySelectorAll('.ramo'));
  var reduz = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var atual = 'agenda', timer = null;

  function trocar(chave) {
    if (!RAMOS[chave] || chave === atual) return;
    atual = chave;
    botoes.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-ramo') === chave ? 'true' : 'false'); });
    var html = montar(RAMOS[chave]);
    clearTimeout(timer);
    if (reduz) { painel.innerHTML = html; return; }
    painel.classList.add('saindo');
    timer = setTimeout(function () {
      painel.innerHTML = html;
      requestAnimationFrame(function () { painel.classList.remove('saindo'); });
    }, 90);
  }

  botoes.forEach(function (b, i) {
    b.addEventListener('click', function () {
      trocar(b.getAttribute('data-ramo'));
      // no celular o painel fica abaixo: traz para a vista se estiver fora dela
      var r = caixa.getBoundingClientRect();
      if (r.top > window.innerHeight - 120) caixa.scrollIntoView({ behavior: reduz ? 'auto' : 'smooth', block: 'start' });
    });
    // setas movem entre os ramos
    b.addEventListener('keydown', function (e) {
      var n = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!n) return;
      e.preventDefault();
      botoes[(i + n + botoes.length) % botoes.length].focus();
    });
  });

  // carrega os prints antes, para a troca não piscar
  var pre = function () { Object.keys(RAMOS).forEach(function (k) { if (RAMOS[k].img) { var im = new Image(); im.src = R + RAMOS[k].img; } }); };
  if ('requestIdleCallback' in window) requestIdleCallback(pre); else setTimeout(pre, 800);

  // menu no celular
  var mb = document.querySelector('.menu-bt'), menu = document.getElementById('menu');
  if (mb && menu) mb.addEventListener('click', function () {
    var ab = menu.classList.toggle('aberto');
    mb.setAttribute('aria-expanded', ab ? 'true' : 'false');
    mb.textContent = ab ? 'Fechar' : 'Menu';
  });
})();
