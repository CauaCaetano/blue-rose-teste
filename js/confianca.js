/* Blocos de confiança da Blue Rose (P5, 08/11/2026).
   Uso: <div data-confianca="teste"></div>  ou vários juntos: <div data-confianca="teste pagamento cancelamento"></div>
   Chaves: teste | pagamento | cancelamento | exportacao | quem-somos
   + <script src="js/confianca.js?v=1" defer></script> (ajuste o caminho em subpastas).
   O CSS (css/pg-seguranca.css, classes .cft-*) é carregado sozinho se a página não tiver.
   Todos os textos foram conferidos no código (nexo-pagamentos, camada.js, conta-pagina.js) e no Supabase em 08/11/2026.
   Não acrescente afirmação sem conferir: veja relatorios/site-teste-avaliacao/p5-blocos.md. */
(function () {
  var eu = document.currentScript && document.currentScript.src;
  var raiz = eu ? new URL('../', eu).href : '/';
  var pg = raiz + 'seguranca.html';

  var B = {
    teste: {
      t: 'Teste grátis de 7 dias',
      l: ['Cartão cadastrado no Mercado Pago; nada é cobrado nos 7 dias.', 'Se não cancelar, a assinatura começa no 8º dia.', 'Vale uma vez por conta, e-mail, conta do Mercado Pago e cartão.'],
      a: '#teste', m: 'Como funciona o teste'
    },
    pagamento: {
      t: 'Pagamento pelo Mercado Pago',
      l: ['Cartão de crédito (cobrança automática) ou Pix (sem cobrança automática).', 'O número do cartão é digitado no Mercado Pago e não passa pela Blue Rose.', 'O sistema só libera com o pagamento aprovado.'],
      a: '#pagamentos', m: 'Detalhes do pagamento'
    },
    cancelamento: {
      t: 'Sem fidelidade',
      l: ['Cancele em Minha conta, sem multa.', 'O acesso continua até o fim do período já pago.', 'Os dados ficam guardados por 90 dias e depois são apagados.'],
      a: '#cancelamento', m: 'Como cancelar'
    },
    exportacao: {
      t: 'Os dados são seus',
      l: ['Exportar tudo para o Excel (.xlsx), de dentro do sistema.', 'Uma aba para cada lista: clientes, agenda, lançamentos e o resto.', 'Importa planilhas do Excel ou CSV para começar.'],
      a: '#exportacao', m: 'Como exportar'
    },
    'quem-somos': {
      t: 'Quem está por trás',
      l: ['Blue Rose Express. Responsável e encarregado de dados: Cauã Caetano.', 'Banco de dados no Supabase, na região de São Paulo.', 'Atendimento de segunda a sexta, das 8h às 18h.'],
      a: '#empresa', m: 'Segurança e dados'
    }
  };

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function montar(el) {
    if (el.getAttribute('data-confianca-pronto')) return;
    var chaves = (el.getAttribute('data-confianca') || '').split(/[\s,]+/).filter(function (k) { return B[k]; });
    if (!chaves.length) return;
    var naPropria = /seguranca\.html$/.test(location.pathname);
    var nivel = Number(el.getAttribute('data-confianca-nivel')) || 3; // nível do título dos cartões (h3 por padrão)
    nivel = Math.min(6, Math.max(2, nivel));
    el.classList.add('cft');
    el.innerHTML = chaves.map(function (k) {
      var b = B[k], href = (naPropria ? '' : pg) + b.a;
      return '<div class="cft-cartao"><h' + nivel + '>' + esc(b.t) + '</h' + nivel + '><ul>' +
        b.l.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' +
        '<a class="cft-mais" href="' + esc(href) + '">' + esc(b.m) + '</a></div>';
    }).join('');
    el.setAttribute('data-confianca-pronto', '1');
  }

  function iniciar() {
    var els = document.querySelectorAll('[data-confianca]');
    if (!els.length) return;
    var temCss = [].some.call(document.querySelectorAll('link[rel="stylesheet"]'), function (l) { return /pg-seguranca\.css/.test(l.getAttribute('href') || ''); });
    if (!temCss) {
      var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = raiz + 'css/pg-seguranca.css?v=1';
      document.head.appendChild(l);
    }
    [].forEach.call(els, montar);
  }
  window.brConfianca = { montar: iniciar };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
