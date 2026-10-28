// Ramos Vilela · fotos reais de prédios e salas, uma por andar (área), com profundidade.
import { foto3d } from '../assets/foto3d.js';
const f = foto3d(document.getElementById('torre-3d'), { foto: 'img/torre.webp', prof: 'img/torre-p.webp', alt: 'Fachada de vidro do prédio do escritório' });
const ver = (n) => f.trocar('img/' + n + '.webp', 'img/' + n + '-p.webp');
let atual = -1;
const marcar = (i) => { if (i === atual) return; atual = i; ver('a' + i); };
window.rvTorre = { marcar, abrir: marcar };
