// Helena Sampaio · foto real de uma carta escrita à mão; ao enviar, a foto vira a da assinatura.
import { foto } from '../assets/foto.js';
const f = foto(document.getElementById('carta-3d'), { foto: 'img/carta.webp', alt: 'Carta escrita à mão com caneta-tinteiro sobre a mesa' });
const ver = (n) => f.trocar('img/' + n + '.webp');
window.helenaCarta = { escrever() {}, selar() { ver('assinatura'); }, abrir() { ver('carta'); } };
