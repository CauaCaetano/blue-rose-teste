// Bruno Mattos · fotos reais de atendimento por região da coluna.
import { foto } from '../assets/foto.js';
const f = foto(document.getElementById('coluna-3d'), { foto: 'img/consulta.webp', alt: 'Fisioterapeuta tratando as costas de um paciente' });
const ver = (n) => f.trocar('img/' + n + '.webp');
window.brunoColuna = { marcar(r) { ver(r); } };
