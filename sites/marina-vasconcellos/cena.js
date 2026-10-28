// Marina Vasconcellos · fotos reais de tratamento por região do corpo, com profundidade.
import { foto3d } from '../assets/foto3d.js';
const f = foto3d(document.getElementById('corpo-3d'), { foto: 'img/rosto.webp', prof: 'img/rosto-p.webp', alt: 'Tratamento facial na clínica' });
const ver = (n) => f.trocar('img/' + n + '.webp', 'img/' + n + '-p.webp');
const FOTO = { rosto: 'rosto', pescoco: 'rosto', peito: 'pele', abdomen: 'corpo', costas: 'corpo', bracos: 'bracos', axilas: 'bracos', virilha: 'pernas', coxas: 'pernas', pernas: 'pernas' };
let atual = 'rosto';
if (document.getElementById('corpo-3d').dataset.modo === 'laser') { atual = 'pernas'; ver('pernas'); }
window.mvCorpo = { marcar(lista) { const k = FOTO[(lista || []).slice(-1)[0]]; if (k && k !== atual) { atual = k; ver(k); } }, virar() {} };
