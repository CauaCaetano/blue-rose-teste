// Brisa · a mala de viagem antiga, escaneada de uma mala real (Poly Haven, CC0), girando dentro do cartão de
// embarque; e a foto real do destino escolhido. brisaMaleta.lugar(k) troca a foto e vira a mala.
import { vitrine } from '../assets/3d/vitrine.js';
import { foto } from '../assets/foto.js';

const quadro = foto(document.getElementById('foto-lugar'), { foto: 'img/casa.webp', alt: 'Profissional da Brisa atendendo no destino escolhido' });
let v = null, giro = 0.5;
vitrine(document.getElementById('mala-3d'), { arquivo: 'vintage_suitcase/vintage_suitcase_1k.gltf', so: 'suitcase_02', medida: 1.4, distancia: 3.6, altura: 0.38, giro, hdri: 'studio_small_09', forca: 1.1 }).then((x) => { v = x; });
window.brisaMaleta = { lugar(k) { quadro.trocar('img/' + k + '.webp'); if (v) { giro += 1.6; v.olhar(giro); } } };
