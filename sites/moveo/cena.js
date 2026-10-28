// Moveo · fotos reais da sala e de cada tratamento, com profundidade.
import { foto3d } from '../assets/foto3d.js';
const f = foto3d(document.getElementById('sala-3d'), { foto: 'img/sala.webp', prof: 'img/sala-p.webp', alt: 'Sala de atendimento da clínica com maca' });
const ver = (n) => f.trocar('img/' + n + '.webp', 'img/' + n + '-p.webp');
window.moveoSala = { escolher(k) { ver(k); } };
