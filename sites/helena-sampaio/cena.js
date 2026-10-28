// Helena Sampaio · foto real de uma carta escrita à mão, com profundidade; ao enviar, a foto vira a da assinatura.
import { foto3d } from '../assets/foto3d.js';
const f = foto3d(document.getElementById('carta-3d'), { foto: 'img/carta.webp', prof: 'img/carta-p.webp', alt: 'Carta escrita à mão com caneta-tinteiro sobre a mesa' });
const ver = (n) => f.trocar('img/' + n + '.webp', 'img/' + n + '-p.webp');
window.helenaCarta = { escrever() {}, selar() { ver('assinatura'); }, abrir() { ver('carta'); } };
