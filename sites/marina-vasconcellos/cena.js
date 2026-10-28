// Marina Vasconcellos · fotos reais de tratamento por região do corpo.
import { foto } from '../assets/foto.js';
const f = foto(document.getElementById('corpo-3d'), { foto: 'img/rosto.webp', alt: 'Tratamento facial na clínica' });
const ver = (n) => f.trocar('img/' + n + '.webp');
const FOTO = { rosto: 'rosto', pescoco: 'rosto', peito: 'pele', abdomen: 'corpo', costas: 'corpo', bracos: 'bracos', axilas: 'bracos', virilha: 'pernas', coxas: 'pernas', pernas: 'pernas' };
let atual = 'rosto';
if (document.getElementById('corpo-3d').dataset.modo === 'laser') { atual = 'pernas'; ver('pernas'); }
window.mvCorpo = { marcar(lista) { const k = FOTO[(lista || []).slice(-1)[0]]; if (k && k !== atual) { atual = k; ver(k); } }, virar() {} };
