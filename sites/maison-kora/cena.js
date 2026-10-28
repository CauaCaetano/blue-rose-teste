// Maison Kora · fotos reais de produtos e protocolos, uma por objetivo, com profundidade.
import { foto3d } from '../assets/foto3d.js';
const f = foto3d(document.getElementById('frasco-3d'), { foto: 'img/o0.webp', prof: 'img/o0-p.webp', alt: 'Frasco de sérum sobre mármore' });
const ver = (n) => f.trocar('img/' + n + '.webp', 'img/' + n + '-p.webp');
window.kora = { objetivo(i) { ver('o' + ((i | 0) % 4)); } };
