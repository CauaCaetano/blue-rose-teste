// Pulso · fotos reais da academia, uma por plano.
import { foto } from '../assets/foto.js';
const f = foto(document.getElementById('planos-3d'), { foto: 'img/p0.webp', alt: 'Kettlebells no chão da academia' });
const ver = (n) => f.trocar('img/' + n + '.webp');
window.pulsoPlanos = { escolher(i) { ver('p' + ((i | 0) % 3)); } };
