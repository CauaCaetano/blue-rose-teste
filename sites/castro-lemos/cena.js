// Castro Lemos · fotos reais de tecnologia com profundidade; o caso escolhido troca a foto.
import { foto3d } from '../assets/foto3d.js';
const f = foto3d(document.getElementById('rede-3d'), { foto: 'img/codigo.webp', prof: 'img/codigo-p.webp', alt: 'Código na tela de um notebook' });
const ver = (n) => f.trocar('img/' + n + '.webp', 'img/' + n + '-p.webp');
const FOTOS = ['codigo', 'circuito', 'teclado'];
let n = 0;
window.castroRede = { rota(chaves) { const k = FOTOS[(chaves || []).length % 3]; if (k !== FOTOS[n]) { n = FOTOS.indexOf(k); ver(k); } } };
