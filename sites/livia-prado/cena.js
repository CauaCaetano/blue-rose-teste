// Lívia Prado · fotos reais de unhas feitas em cada cor, com profundidade (assets/foto3d.js).
// livia.cor(i) troca a foto; a ordem é a mesma das bolinhas de cor do site.js.
import { foto3d } from '../assets/foto3d.js';

const ARQ = ['nude', 'vermelho', 'bordo', 'rosa', 'malva', 'tartaruga', 'francesinha', 'arte'];
const unhas = foto3d(document.getElementById('foto-unhas'), { foto: 'img/nude.webp', prof: 'img/nude-p.webp', alt: 'Mão com unhas pintadas na cor escolhida' });
foto3d(document.getElementById('foto-salao'), { foto: 'img/salao.webp', prof: 'img/salao-p.webp', forca: 0.015, alt: 'Manicure atendendo uma cliente no salão' });
window.livia = { cor(i) { unhas.trocar('img/' + ARQ[i] + '.webp', 'img/' + ARQ[i] + '-p.webp'); } };
