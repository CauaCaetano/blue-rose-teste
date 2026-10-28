// Brisa · uma foto real por lugar de atendimento (casa, aeroporto, empresa, evento), com profundidade
// (assets/foto3d.js). brisaMaleta.lugar(k) troca a foto.
import { foto3d } from '../assets/foto3d.js';

const foto = foto3d(document.getElementById('foto-lugar'), { foto: 'img/casa.webp', prof: 'img/casa-p.webp', alt: 'Profissional da Brisa atendendo no lugar escolhido' });
window.brisaMaleta = { lugar(k) { foto.trocar('img/' + k + '.webp', 'img/' + k + '-p.webp'); } };
