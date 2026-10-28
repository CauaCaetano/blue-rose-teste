// Atelier Serena · a cadeira de barbeiro de 1920, escaneada de uma cadeira real (Poly Haven, CC0).
// A rolagem do primeiro ato dá a volta na cadeira e troca os capítulos; arrastar também gira.
// serenaEstacao.orcar(min, preco) atualiza o cartão do tempo de cadeira do cardápio.
import { vitrine } from '../assets/3d/vitrine.js';

const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
const ato = document.getElementById('ato'), caps = [...document.querySelectorAll('.cap')];
const t1 = document.querySelector('.t1'), t2 = document.querySelector('.t2');
let v = null, capAtual = -1;
vitrine(document.getElementById('cadeira-3d'), { arquivo: 'BarberShopChair_01/BarberShopChair_01_1k.gltf', medida: 2, distancia: 6.2, altura: 0.5, giro: 0.5, inclinacao: 0.1, hdri: 'brown_photostudio_02', forca: 1.15, auto: false }).then((x) => { v = x; rolou(); });

// câmera em cada capítulo: [ângulo, distância, inclinação]
const PONTOS = [[0.5, 6.2, 0.1], [2.1, 4.6, 0.05], [3.6, 4.9, 0.32], [5.2, 4.4, 0.02]];
function rolou() {
  const r = ato.getBoundingClientRect(), total = ato.offsetHeight - innerHeight;
  const p = Math.min(1, Math.max(0, -r.top / total));
  ato.classList.toggle('andou', p > 0.02);
  const pos = p * (PONTOS.length - 1), i = Math.floor(pos), f = pos - i, a = PONTOS[i], b = PONTOS[Math.min(i + 1, PONTOS.length - 1)];
  if (v && !calmo) v.camera(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f);
  const c = Math.min(caps.length - 1, Math.round(pos));
  if (c !== capAtual) { capAtual = c; caps.forEach((x, k) => x.classList.toggle('on', k === c)); }
  if (!calmo) { t1.style.transform = 'translateX(' + (-p * 30) + 'vw)'; t2.style.transform = 'translateX(' + (p * 22) + 'vw)'; }
}
addEventListener('scroll', rolou, { passive: true }); addEventListener('resize', rolou); rolou();

const cartao = document.querySelector('.espelho');
const tempo = (m) => { const h = Math.floor(m / 60), r = m % 60; return h ? h + 'h' + (r ? String(r).padStart(2, '0') : '') : r + ' min'; };
window.serenaEstacao = {
  orcar(min, valor) {
    cartao.querySelector('.esp-rot').textContent = min ? 'tempo de cadeira' : 'escolha os serviços';
    cartao.querySelector('.esp-tempo').textContent = min ? tempo(min) : '—';
    cartao.querySelector('.esp-preco').textContent = valor ? 'R$ ' + valor.toLocaleString('pt-BR') : '';
    cartao.querySelector('.arco').style.strokeDasharray = Math.min(100, min / 2.4) + ' 100';
  },
};
