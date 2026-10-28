// Lívia Prado · fotos reais de unhas feitas em cada cor.
// livia.cor(i) troca a foto; a ordem é a mesma das bolinhas de cor do site.js.
import { foto } from '../assets/foto.js';

const ARQ = ['nude', 'vermelho', 'bordo', 'rosa', 'malva', 'tartaruga', 'francesinha', 'arte'];
const unhas = foto(document.getElementById('foto-unhas'), { foto: 'img/nude.webp', alt: 'Mão com unhas pintadas na cor escolhida' });
foto(document.getElementById('foto-salao'), { foto: 'img/salao.webp', alt: 'Manicure atendendo uma cliente no salão' });
window.livia = { cor(i) { unhas.trocar('img/' + ARQ[i] + '.webp'); } };
