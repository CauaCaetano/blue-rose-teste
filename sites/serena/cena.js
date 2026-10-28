// Atelier Serena · a cadeira de barbeiro antiga, escaneada de uma cadeira real (Poly Haven, CC0), girando no palco.
// serenaEstacao.orcar(min, preco) atualiza o cartão do tempo de cadeira e vira a cadeira um pouco a cada serviço.
import { vitrine } from '../assets/3d/vitrine.js';

const cartao = document.querySelector('.espelho');
const tempo = (m) => { const h = Math.floor(m / 60), r = m % 60; return h ? h + 'h' + (r ? String(r).padStart(2, '0') : '') : r + ' min'; };
let v = null, vira = 0.6, ultimo = -1;
vitrine(document.getElementById('cadeira-3d'), { arquivo: 'BarberShopChair_01/BarberShopChair_01_1k.gltf', medida: 2, distancia: 5.8, altura: 0.46, giro: 0.6, hdri: 'brown_photostudio_02', forca: 1.1 }).then((x) => { v = x; });

window.serenaEstacao = {
  orcar(min, valor) {
    cartao.querySelector('.esp-rot').textContent = min ? 'tempo de cadeira' : 'escolha os serviços';
    cartao.querySelector('.esp-tempo').textContent = min ? tempo(min) : '—';
    cartao.querySelector('.esp-preco').textContent = valor ? 'R$ ' + valor.toLocaleString('pt-BR') : '';
    cartao.querySelector('.arco').style.strokeDasharray = Math.min(100, min / 2.4) + ' 100';
    if (v && ultimo >= 0 && min !== ultimo) { vira += (min > ultimo ? 1 : -1) * 0.9; v.olhar(vira); }
    ultimo = min;
  },
};
