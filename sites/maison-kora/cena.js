// Maison Kora · fotos reais de produtos e protocolos, uma por objetivo.
import { foto } from '../assets/foto.js';
const f = foto(document.getElementById('frasco-3d'), { foto: 'img/o0.webp', alt: 'Frasco de sérum sobre mármore' });
const ver = (n) => f.trocar('img/' + n + '.webp');
window.kora = { objetivo(i) { ver('o' + ((i | 0) % 4)); } };
