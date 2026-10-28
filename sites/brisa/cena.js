// Brisa · uma foto real por lugar de atendimento (casa, aeroporto, empresa, evento)
// (assets/foto.js). brisaMaleta.lugar(k) troca a foto.
import { foto } from '../assets/foto.js';

const quadro = foto(document.getElementById('foto-lugar'), { foto: 'img/casa.webp', alt: 'Profissional da Brisa atendendo no lugar escolhido' });
window.brisaMaleta = { lugar(k) { quadro.trocar('img/' + k + '.webp'); } };
