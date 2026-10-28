// Pulso · fotos reais da academia, uma por plano, com profundidade.
import { foto3d } from '../assets/foto3d.js';
const f = foto3d(document.getElementById('planos-3d'), { foto: 'img/p0.webp', prof: 'img/p0-p.webp', alt: 'Kettlebells no chão da academia' });
const ver = (n) => f.trocar('img/' + n + '.webp', 'img/' + n + '-p.webp');
window.pulsoPlanos = { escolher(i) { ver('p' + ((i | 0) % 3)); } };
