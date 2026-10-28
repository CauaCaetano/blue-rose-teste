// Rafa Moreno · fotos reais de treino, uma por objetivo (carga do halter), com profundidade.
import { foto3d } from '../assets/foto3d.js';
const f = foto3d(document.getElementById('halter-3d'), { foto: 'img/treino.webp', prof: 'img/treino-p.webp', alt: 'Personal orientando uma aluna no treino' });
const ver = (n) => f.trocar('img/' + n + '.webp', 'img/' + n + '-p.webp');
let atual = 'treino';
window.rafaHalter = { peso(kg) { const k = kg <= 4 ? '50mais' : kg <= 8 ? 'leve' : kg <= 14 ? 'medio' : 'pesado'; if (k !== atual) { atual = k; ver(k); } } };
