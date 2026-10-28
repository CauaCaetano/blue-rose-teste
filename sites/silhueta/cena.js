// Silhueta · fotos reais das salas e tratamentos, uma por unidade escolhida, com profundidade.
import { foto3d } from '../assets/foto3d.js';
const f = foto3d(document.getElementById('mapa-3d'), { foto: 'img/u0.webp', prof: 'img/u0-p.webp', alt: 'Sala de atendimento da clínica' });
const ver = (n) => f.trocar('img/' + n + '.webp', 'img/' + n + '-p.webp');
const ids = [];
window.silMapa = { focar(id) { if (!ids.includes(id)) ids.push(id); ver('u' + (ids.indexOf(id) % 5)); } };
