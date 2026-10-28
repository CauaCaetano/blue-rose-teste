// Atelier Serena · fotos reais do salão com profundidade (assets/foto3d.js). A foto mostra o último serviço
// marcado; por cima, o cartão do espelho com o tempo de cadeira, o valor e um arco dourado que enche até 4 horas.
// serenaEstacao.orcar(min, preco, servico) atualiza tudo.
import { foto3d } from '../assets/foto3d.js';

const caixa = document.getElementById('estacao');
const foto = foto3d(caixa, { foto: 'img/estacao.webp', prof: 'img/estacao-p.webp', alt: 'Estação do salão com cadeira e espelho' });
const cartao = document.createElement('div'); cartao.className = 'espelho'; cartao.setAttribute('aria-live', 'polite');
cartao.innerHTML = '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="44"/><circle class="arco" cx="50" cy="50" r="44" pathLength="100"/></svg><p class="esp-rot"></p><p class="esp-tempo"></p><p class="esp-preco"></p>';
caixa.appendChild(cartao);
let atual = 'estacao';
const tempo = (m) => { const h = Math.floor(m / 60), r = m % 60; return h ? h + 'h' + (r ? String(r).padStart(2, '0') : '') : r + ' min'; };

window.serenaEstacao = {
  orcar(min, valor, servico) {
    cartao.querySelector('.esp-rot').textContent = min ? 'tempo de cadeira' : 'escolha os serviços';
    cartao.querySelector('.esp-tempo').textContent = min ? tempo(min) : '—';
    cartao.querySelector('.esp-preco').textContent = valor ? 'R$ ' + valor.toLocaleString('pt-BR') : '';
    cartao.querySelector('.arco').style.strokeDasharray = Math.min(100, min / 2.4) + ' 100';
    const novo = min ? servico || atual : 'estacao';
    if (novo !== atual) { atual = novo; foto.trocar('img/' + novo + '.webp', 'img/' + novo + '-p.webp'); }
  },
};
