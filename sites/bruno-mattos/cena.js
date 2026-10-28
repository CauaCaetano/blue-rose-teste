// Bruno Mattos · fotos reais de atendimento por região da coluna, com profundidade.
import { foto3d } from '../assets/foto3d.js';
const f = foto3d(document.getElementById('coluna-3d'), { foto: 'img/consulta.webp', prof: 'img/consulta-p.webp', alt: 'Fisioterapeuta tratando as costas de um paciente' });
const ver = (n) => f.trocar('img/' + n + '.webp', 'img/' + n + '-p.webp');
window.brunoColuna = { marcar(r) { ver(r); } };
