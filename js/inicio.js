/* Página inicial · identidade v2 (03/11/2026)
   Sem enfeite carregado depois e sem animação: só comportamento.
   - Quem chega por #perguntas encontra a primeira pergunta frequente já aberta.
   - Os botões "Pedir proposta" (data-plano) continuam com o site.js, que preenche a mensagem do formulário. */
(function () {
  var faq = document.querySelectorAll('.hn-faq details');
  if (!faq.length) return;
  var abrirPeloEndereco = function () {
    if (location.hash === '#perguntas') faq[0].open = true;
  };
  abrirPeloEndereco();
  addEventListener('hashchange', abrirPeloEndereco);
})();
