// Rafa Moreno · fotos reais de treino, uma por objetivo (carga do halter).
import { foto } from '../assets/foto.js';
const f = foto(document.getElementById('halter-3d'), { foto: 'img/treino.webp', alt: 'Personal orientando uma aluna no treino' });
const ver = (n) => f.trocar('img/' + n + '.webp');
let atual = 'treino';
window.rafaHalter = { peso(kg) { const k = kg <= 4 ? '50mais' : kg <= 8 ? 'leve' : kg <= 14 ? 'medio' : 'pesado'; if (k !== atual) { atual = k; ver(k); } } };
