// Atlas · fotos reais de cada área da unidade-modelo, com profundidade.
import { foto3d } from '../assets/foto3d.js';
const f = foto3d(document.getElementById('unidade-3d'), { foto: 'img/unidade.webp', prof: 'img/unidade-p.webp', alt: 'Salão de treino da unidade-modelo' });
const ver = (n) => f.trocar('img/' + n + '.webp', 'img/' + n + '-p.webp');
window.atlasUnidade = { escolher(k) { ver(k); } };
