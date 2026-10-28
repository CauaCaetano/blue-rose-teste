// Helena Sampaio · a carta que se escreve, a conta da pensão e as fichas que levam para a carta.
(function () {
  'use strict';
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var form = $('#bilhete'), escolha = { area: '', quando: '' }, nota = $('.bilhete-nota', form);
  var calcTexto = '';

  function linhas() {
    var nome = form.nome.value.trim();
    var l = ['Dra. Helena,', ''];
    l.push('preciso de ajuda com');
    var a = escolha.area || 'um problema';
    // quebra a área em duas linhas quando é longa
    var partes = a.split(' (');
    l.push(partes[0] + (partes[1] ? '' : '.'));
    if (partes[1]) l.push('(' + partes[1] + '.');
    l.push(escolha.quando || 'Ainda não sei dizer quando.');
    if (calcTexto) l.push(calcTexto);
    l.push('', nome ? 'Obrigada(o), ' + nome + '.' : 'Aguardo seu retorno.');
    return l;
  }
  function atualizar() { if (window.helenaCarta) window.helenaCarta.escrever(linhas()); }

  form.addEventListener('click', function (e) {
    var b = e.target.closest('.chips button'); if (!b) return;
    var grupo = b.parentNode, campo = grupo.dataset.campo;
    [].forEach.call(grupo.children, function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    escolha[campo] = b.dataset.v; nota.textContent = '';
    if (window.helenaCarta) window.helenaCarta.abrir();
    atualizar();
  });
  form.nome.addEventListener('input', atualizar);
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!escolha.area) { nota.textContent = 'Escolha sobre o que é o seu caso.'; return; }
    if (window.helenaCarta) window.helenaCarta.selar();
    var nome = form.nome.value.trim();
    var msg = 'Olá, Dra. Helena Sampaio! Escrevi pelo site.\n• Nome: ' + (nome || 'não informado') + '\n• Assunto: ' + escolha.area + '\n• Quando: ' + (escolha.quando || 'não informado') + (calcTexto ? '\n• ' + calcTexto : '');
    nota.textContent = 'Carta selada.';
    setTimeout(function () { if (window.BR_WA) window.BR_WA(msg); }, 900);
  });

  // fichas e calculadora levam o assunto para a carta
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-escolher]'); if (!b) return;
    var alvo = [].filter.call(form.querySelectorAll('[data-campo="area"] button'), function (x) { return x.dataset.v === b.dataset.escolher; })[0];
    if (alvo) alvo.click();
    $('#carta').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
    setTimeout(function () { form.nome.focus({ preventScroll: true }); }, 500);
  });

  // pensão: 15% a 30% para 1 filho, faixa sobe com mais filhos (teto de 50%)
  var calc = $('#calc-pensao'), filhos = 1;
  var reais = function (n) { return 'R$ ' + Math.round(n).toLocaleString('pt-BR'); };
  function conta() {
    var renda = Number(String(calc.renda.value).replace(/\./g, '').replace(',', '.')) || 0;
    var min = Math.min(0.15 + (filhos - 1) * 0.07, 0.4), max = Math.min(0.3 + (filhos - 1) * 0.08, 0.5);
    $('[data-faixa]', calc).textContent = renda > 0 ? reais(renda * min) + ' a ' + reais(renda * max) : 'Informe a renda';
    $('[data-pct]', calc).textContent = Math.round(min * 100) + '% a ' + Math.round(max * 100) + '% da renda, para ' + filhos + (filhos > 1 ? ' filhos' : ' filho');
    calc.filhos.value = filhos;
    calcTexto = renda > 0 ? 'Simulei uma pensão de ' + reais(renda * min) + ' a ' + reais(renda * max) + '.' : '';
  }
  calc.addEventListener('input', conta);
  calc.addEventListener('click', function (e) { var b = e.target.closest('[data-filhos]'); if (!b) return; filhos = Math.max(1, Math.min(6, filhos + Number(b.dataset.filhos))); conta(); });
  conta();
  calcTexto = '';
  $('.link-carta', calc).addEventListener('click', function () { conta(); atualizar(); });
})();
