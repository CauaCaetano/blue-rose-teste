// Rafa Moreno · o halter: sextavado de borracha, pegada cromada recartilhada e o peso gravado na cabeça,
// sobre piso de borracha de academia, com uma academia de verdade (foto 360°, Poly Haven) desfocada ao fundo.
// rafaHalter.peso(kg) troca o tamanho das cabeças e o número gravado.
import { palco, THREE, calmo, aproxima, luz, textura } from '../assets/3d/palco.js';

const canvas = document.getElementById('halter-3d');
const p = palco(canvas, { fov: 34, pos: [0, 3, 10], alvo: [0, 0.7, 0], quadro, tom: true, claro: false });
const acc = () => getComputedStyle(document.documentElement).getPropertyValue('--acc').trim() || '#c6f432';
let halter, cabecas = [], tampaTex, kgAlvo = 12, kg = 12, giro = 0, alvoGiro = 0.5, arr = false, ax = 0;

if (p) montar();

function montar() {
  const { cena } = p;
  // a academia de verdade entra nos reflexos do cromo; o fundo fica escuro (a foto inteira estoura em branco no tema preto)
  luz(p, 'crossfit_gym', { forca: 0.8 });
  cena.background = new THREE.Color(0x0b0b0b); cena.fog = new THREE.Fog(0x0b0b0b, 9, 18);
  const chave = new THREE.DirectionalLight(0xffffff, 2); chave.position.set(-3, 7, 4); chave.castShadow = true;
  chave.shadow.mapSize.set(2048, 2048); Object.assign(chave.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5 }); chave.shadow.bias = -0.0005; cena.add(chave);
  const recorte = new THREE.SpotLight(acc(), 30, 14, 0.5, 0.6); recorte.position.set(4, 5, -3); recorte.target.position.set(0, 0.5, 0); cena.add(recorte, recorte.target);

  // piso de borracha (textura real)
  const piso = new THREE.Mesh(new THREE.CircleGeometry(9, 64), new THREE.MeshStandardMaterial({ ...textura('rubber_tiles', 3, 3), color: 0x5a5a5a }));
  piso.rotation.x = -Math.PI / 2; piso.receiveShadow = true; cena.add(piso);

  halter = new THREE.Group(); cena.add(halter);
  const cromo = new THREE.MeshStandardMaterial({ ...textura('metal_plate', 6, 1), color: 0xdadde0, metalness: 1, roughness: 0.28 });
  const borracha = new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.82 });
  // tampa da cabeça com o peso gravado (desenhada em canvas)
  const t = document.createElement('canvas'); t.width = t.height = 512;
  tampaTex = new THREE.CanvasTexture(t); tampaTex.colorSpace = THREE.SRGBColorSpace; tampaTex.userData = { t };
  const tampa = new THREE.MeshStandardMaterial({ map: tampaTex, roughness: 0.8 });
  const pegada = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 2.1, 32), cromo); pegada.rotation.z = Math.PI / 2; pegada.castShadow = true; halter.add(pegada);
  [-1, 1].forEach((l) => {
    const colar = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.16, 32), cromo); colar.rotation.z = Math.PI / 2; colar.position.x = l * 1.0; colar.castShadow = true; halter.add(colar);
    // cabeça sextavada: lados de borracha, faces com a tampa gravada
    const cab = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.8, 6), [borracha, tampa, tampa]);
    cab.rotation.z = l * Math.PI / 2; cab.rotation.y = Math.PI / 6; cab.castShadow = true;
    halter.add(cab); cabecas.push({ m: cab, l });
  });
  desenharTampa();
  canvas.addEventListener('pointerdown', (e) => { arr = true; ax = e.clientX; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => { if (!arr) return; alvoGiro += (e.clientX - ax) * 0.01; ax = e.clientX; p.redesenhar(); });
  addEventListener('pointerup', () => { arr = false; });
  addEventListener('br-cor', () => { recorte.color.set(acc()); desenharTampa(); p.redesenhar(); });
}

function desenharTampa() {
  const c = tampaTex.userData.t, x = c.getContext('2d');
  x.fillStyle = '#121212'; x.fillRect(0, 0, 512, 512);
  x.fillStyle = acc(); x.font = '700 150px "Barlow Condensed", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(Math.round(kgAlvo), 256, 230);
  x.font = '600 64px "Barlow Condensed", sans-serif'; x.fillStyle = '#e8e8e8'; x.fillText('KG', 256, 345);
  tampaTex.needsUpdate = true;
}

function quadro(t, dt) {
  if (!arr && !calmo) alvoGiro += dt * 0.18;
  giro = aproxima(giro, alvoGiro, dt, 5);
  halter.rotation.y = giro;
  kg = aproxima(kg, kgAlvo, dt, 5);
  // cabeça maior quanto mais peso (2 a 32 kg)
  const k = 0.62 + (kg / 32) * 0.55, h = 0.55 + (kg / 32) * 0.55;
  cabecas.forEach(({ m, l }) => { m.scale.set(k, h, k); m.position.x = l * (1.08 + h * 0.4); });
  halter.position.y = 0.72 * k + (calmo ? 0 : Math.max(0, Math.sin(t * 1.1)) * 0.04);
  // no computador o texto ocupa a direita: o halter fica à esquerda
  halter.position.x = p.camera.aspect > 1.2 ? -1.9 : 0;
}

window.rafaHalter = { peso(v) { kgAlvo = v; if (tampaTex) desenharTampa(); if (p) p.redesenhar(); } };
