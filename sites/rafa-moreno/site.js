// Rafa Moreno · objetivo → plano e peso do halter 3D; calculadora de IMC.
(function () {
  'use strict';
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var PLANOS = [
    { nome: 'Emagrecer', kg: 8, freq: '4 vezes por semana', foco: 'força com circuito e cardio intervalado', carga: 'halter de 8 kg', res: 'cintura menor em 6 semanas' },
    { nome: 'Ganhar massa', kg: 24, freq: '5 vezes por semana', foco: 'hipertrofia com progressão de carga', carga: 'halter de 24 kg', res: 'ganho de força em 4 semanas' },
    { nome: 'Condicionamento', kg: 14, freq: '3 vezes por semana', foco: 'potência, corrida e mobilidade', carga: 'halter de 14 kg', res: 'fôlego novo em 3 semanas' },
    { nome: 'Saúde depois dos 50', kg: 4, freq: '3 vezes por semana', foco: 'força, equilíbrio e articulações', carga: 'halter de 4 kg', res: 'menos dor em 4 semanas' },
  ];
  var atual = 0;
  function mostrar(i) {
    atual = i; var pl = PLANOS[i];
    ['freq', 'foco', 'carga', 'res'].forEach(function (k) { $('[data-p="' + k + '"]').textContent = pl[k]; });
    if (window.rafaHalter) window.rafaHalter.peso(pl.kg);
  }
  document.querySelector('.objetivos').addEventListener('change', function (e) { mostrar(Number(e.target.value)); });
  mostrar(0);
  addEventListener('load', function () { if (window.rafaHalter) window.rafaHalter.peso(PLANOS[atual].kg); });
  $('[data-wa-plano]').addEventListener('click', function (e) {
    e.preventDefault(); var pl = PLANOS[atual];
    if (window.BR_WA) window.BR_WA('Olá, Rafa Moreno! Escolhi um plano no site.\n• Objetivo: ' + pl.nome + '\n• Frequência: ' + pl.freq);
  });

  var f = $('#imc-calc');
  function imc() {
    var peso = Number(String(f.peso.value).replace(',', '.')), alt = Number(f.alt.value) / 100;
    if (!(peso > 0) || !(alt > 0.5)) { f.res.textContent = 'Informe peso e altura.'; return; }
    var v = peso / (alt * alt), faixa = v < 18.5 ? 'abaixo do peso' : v < 25 ? 'peso adequado' : v < 30 ? 'sobrepeso' : 'obesidade';
    f.res.innerHTML = '<b>' + v.toFixed(1).replace('.', ',') + '</b> ' + faixa;
  }
  f.addEventListener('input', imc); imc();
})();
