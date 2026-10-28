// Moveo · fotos reais da sala e de cada tratamento.
import { foto } from '../assets/foto.js';
const f = foto(document.getElementById('sala-3d'), { foto: 'img/sala.webp', alt: 'Sala de atendimento da clínica com maca' });
const ver = (n) => f.trocar('img/' + n + '.webp');
window.moveoSala = { escolher(k) { ver(k); } };
