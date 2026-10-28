// Ramos Vilela · fotos reais de prédios e salas, uma por andar (área).
import { foto } from '../assets/foto.js';
const f = foto(document.getElementById('torre-3d'), { foto: 'img/torre.webp', alt: 'Fachada de vidro do prédio do escritório' });
const ver = (n) => f.trocar('img/' + n + '.webp');
let atual = -1;
const marcar = (i) => { if (i === atual) return; atual = i; ver('a' + i); };
window.rvTorre = { marcar, abrir: marcar };
