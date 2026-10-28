// Silhueta · fotos reais das salas e tratamentos, uma por unidade escolhida.
import { foto } from '../assets/foto.js';
const f = foto(document.getElementById('mapa-3d'), { foto: 'img/u0.webp', alt: 'Sala de atendimento da clínica' });
const ver = (n) => f.trocar('img/' + n + '.webp');
const ids = [];
window.silMapa = { focar(id) { if (!ids.includes(id)) ids.push(id); ver('u' + (ids.indexOf(id) % 5)); } };
