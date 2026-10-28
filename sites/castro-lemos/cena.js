// Castro Lemos · fotos reais de tecnologia; o caso escolhido troca a foto.
import { foto } from '../assets/foto.js';
const f = foto(document.getElementById('rede-3d'), { foto: 'img/codigo.webp', alt: 'Código na tela de um notebook' });
const ver = (n) => f.trocar('img/' + n + '.webp');
const FOTOS = ['codigo', 'circuito', 'teclado'];
let n = 0;
window.castroRede = { rota(chaves) { const k = FOTOS[(chaves || []).length % 3]; if (k !== FOTOS[n]) { n = FOTOS.indexOf(k); ver(k); } } };
