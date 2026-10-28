// Atlas · fotos reais de cada área da unidade-modelo.
import { foto } from '../assets/foto.js';
const f = foto(document.getElementById('unidade-3d'), { foto: 'img/unidade.webp', alt: 'Salão de treino da unidade-modelo' });
const ver = (n) => f.trocar('img/' + n + '.webp');
window.atlasUnidade = { escolher(k) { ver(k); } };
