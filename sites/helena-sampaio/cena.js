// Helena Sampaio · a escrivaninha: tampo de madeira, a carta que se escreve conforme a pessoa conta o caso,
// óculos, canetas e livros de verdade (modelos escaneados do Poly Haven) e o selo de cera que desce no envio.
import { palco, THREE, calmo, aproxima, luz, modelo, textura, encaixar } from '../assets/3d/palco.js';

const canvas = document.getElementById('carta-3d');
const p = palco(canvas, { fov: 36, pos: [0, 9.2, 7.6], alvo: [0, 0, 0.2], quadro, tom: true });
const cor = () => getComputedStyle(document.documentElement).getPropertyValue('--acc').trim() || '#7c2431';

let papel, folhaTex, selo, seloMat, selando = 0, cam0;
const estado = { linhas: ['Dra. Helena,', '', 'preciso de ajuda com', 'um problema e não sei', 'por onde começar.', '', 'Aguardo seu retorno.'] };

if (p) montar();

function montar() {
  const { cena, camera } = p;
  cam0 = camera.position.clone();
  luz(p, 'brown_photostudio_02', { forca: 1.25 });
  // luz da luminária: quente, com sombra
  const sol = new THREE.DirectionalLight(0xffe3c2, 2.2); sol.position.set(-5, 9, 3); sol.castShadow = true;
  sol.shadow.mapSize.set(2048, 2048); Object.assign(sol.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8 }); sol.shadow.bias = -0.0004; sol.shadow.radius = 4;
  cena.add(sol);

  // tampo da mesa
  const mesa = new THREE.Mesh(new THREE.PlaneGeometry(22, 14), new THREE.MeshStandardMaterial({ ...textura('wood_table_001', 3, 2), roughness: 1 }));
  mesa.rotation.x = -Math.PI / 2; mesa.receiveShadow = true; cena.add(mesa);

  // envelope de papel kraft
  const kraft = new THREE.MeshStandardMaterial({ color: 0xcfb291, roughness: 0.92 });
  const env = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.03, 3.1), kraft); env.position.set(0.9, 0.015, 0.9); env.rotation.y = -0.18; env.castShadow = env.receiveShadow = true; cena.add(env);

  // a folha: textura desenhada num canvas, com leve ondulação do papel
  const tela = document.createElement('canvas'); tela.width = 1024; tela.height = 1320;
  folhaTex = new THREE.CanvasTexture(tela); folhaTex.colorSpace = THREE.SRGBColorSpace; folhaTex.anisotropy = 8; folhaTex.userData = { tela };
  const geo = new THREE.PlaneGeometry(3.4, 4.4, 30, 30), pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), y = pos.getY(i); pos.setZ(i, 0.04 * Math.sin((x / 3.4 + 0.5) * Math.PI) + 0.06 * Math.max(0, (y - 1.6)) ** 2); } // só para cima: o papel nunca entra no tampo
  geo.computeVertexNormals();
  papel = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: folhaTex, roughness: 0.85, side: THREE.DoubleSide }));
  papel.rotation.x = -Math.PI / 2; papel.rotation.z = 0.08; papel.position.set(-0.6, 0.05, 0.5);
  papel.castShadow = papel.receiveShadow = true; cena.add(papel);

  // selo de cera com o monograma
  const t2 = document.createElement('canvas'); t2.width = t2.height = 256;
  const seloTex = new THREE.CanvasTexture(t2); seloTex.colorSpace = THREE.SRGBColorSpace; seloTex.userData = { tela: t2 };
  seloMat = new THREE.MeshStandardMaterial({ color: cor(), roughness: 0.32 });
  const g = new THREE.CylinderGeometry(0.5, 0.54, 0.14, 48), pg = g.attributes.position;
  for (let i = 0; i < pg.count; i++) { const x = pg.getX(i), z = pg.getZ(i), a = Math.atan2(z, x); if (Math.hypot(x, z) > 0.3) { const k = 1 + 0.06 * Math.sin(a * 7) + 0.03 * Math.sin(a * 13); pg.setX(i, x * k); pg.setZ(i, z * k); } }
  g.computeVertexNormals();
  selo = new THREE.Mesh(g, [seloMat, new THREE.MeshStandardMaterial({ map: seloTex, roughness: 0.32 }), seloMat]);
  selo.castShadow = true; selo.position.set(0.3, 4, -0.6); selo.scale.setScalar(0.001); cena.add(selo);
  desenharSelo();

  // objetos de verdade em volta da carta
  const pos3 = (o, x, y, z, ry) => { o.position.set(x, y, z); o.rotation.y = ry; cena.add(o); };
  modelo('round_spectacles').then((o) => { pos3(encaixar(o, 1.9), 3.2, 0, 2.2, -0.5); p.redesenhar(); }).catch(() => {});
  modelo('stationery_supplies').then((o) => { pos3(encaixar(o, 2.6), 3.4, 0, -0.9, 0.3); p.redesenhar(); }).catch(() => {});
  modelo('book_encyclopedia_set_01').then((o) => { pos3(encaixar(o, 4.4), -4.4, 0, -3.0, 0.2); p.redesenhar(); }).catch(() => {});

  const pronto = () => { desenharFolha(); p.redesenhar(); };
  (document.fonts ? document.fonts.load('italic 500 60px "Cormorant Garamond"').then(pronto, pronto) : pronto());
  addEventListener('br-cor', () => { seloMat.color.set(cor()); desenharSelo(); desenharFolha(); p.redesenhar(); });
  // no celular a mesa fica mais perto
  const enquadrar = () => { const estreito = canvas.clientWidth < 520; cam0.set(0, estreito ? 14 : 11.5, estreito ? 10 : 8.6); camera.position.copy(cam0); camera.lookAt(0, 0, 0.2); p.redesenhar(); };
  new ResizeObserver(enquadrar).observe(canvas); enquadrar();
}

function desenharSelo() {
  const c = selo.material[1].map.userData.tela, x = c.getContext('2d');
  x.fillStyle = cor(); x.fillRect(0, 0, 256, 256);
  const gr = x.createRadialGradient(100, 90, 10, 128, 128, 140); gr.addColorStop(0, 'rgba(255,255,255,.25)'); gr.addColorStop(1, 'rgba(0,0,0,.25)');
  x.fillStyle = gr; x.fillRect(0, 0, 256, 256);
  x.strokeStyle = 'rgba(0,0,0,.28)'; x.lineWidth = 6; x.beginPath(); x.arc(128, 128, 92, 0, Math.PI * 2); x.stroke();
  x.fillStyle = 'rgba(0,0,0,.32)'; x.font = 'italic 600 96px "Cormorant Garamond", serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText('HS', 128, 136);
  selo.material[1].map.needsUpdate = true;
}

function desenharFolha() {
  const c = folhaTex.userData.tela, x = c.getContext('2d'), W = c.width, H = c.height;
  x.fillStyle = '#fbf6ec'; x.fillRect(0, 0, W, H);
  for (let i = 0; i < 1800; i++) { x.fillStyle = `rgba(120,90,60,${Math.random() * 0.04})`; x.fillRect(Math.random() * W, Math.random() * H, 2, 2); }
  x.strokeStyle = 'rgba(124,36,49,.14)'; x.lineWidth = 2;
  for (let y = 300; y < H - 80; y += 84) { x.beginPath(); x.moveTo(80, y); x.lineTo(W - 80, y); x.stroke(); }
  x.fillStyle = cor(); x.font = '600 34px Montserrat, sans-serif'; x.fillText('HELENA SAMPAIO · ADVOCACIA', 80, 130);
  x.fillStyle = 'rgba(34,25,15,.5)'; x.font = '500 26px Montserrat, sans-serif'; x.fillText('Ribeirão Preto · ' + new Date().toLocaleDateString('pt-BR'), 80, 180);
  x.fillStyle = '#2a1d14'; x.font = 'italic 500 62px "Cormorant Garamond", serif';
  estado.linhas.forEach((l, i) => x.fillText(l, 90, 284 + i * 84));
  folhaTex.needsUpdate = true;
}

function quadro(t, dt) {
  // a câmera acompanha o mouse de leve, como quem se inclina sobre a mesa
  const alvoX = cam0.x + (p.ponteiro.dentro ? p.ponteiro.x * 0.8 : calmo ? 0 : Math.sin(t * 0.25) * 0.3);
  const alvoZ = cam0.z + (p.ponteiro.dentro ? -p.ponteiro.y * 0.5 : 0);
  p.camera.position.x = aproxima(p.camera.position.x, alvoX, dt, 3);
  p.camera.position.z = aproxima(p.camera.position.z, alvoZ, dt, 3);
  p.camera.lookAt(0, 0, 0.2);
  if (selando) {
    selando = Math.min(1, selando + dt * 1.5);
    const k = Math.min(1, selando / 0.75);
    selo.position.y = 4 - (4 - 0.13) * (k * k);
    selo.scale.setScalar(k < 1 ? 1.4 - 0.4 * k : 1 + 0.12 * Math.sin(((selando - 0.75) / 0.25) * Math.PI));
    if (selando >= 1) selando = 0;
  }
}

window.helenaCarta = {
  escrever(linhas) { estado.linhas = linhas; if (p && folhaTex) { desenharFolha(); p.redesenhar(); } },
  selar() { if (!p) return; selando = 0.001; p.redesenhar(); },
  abrir() { if (!p) return; selando = 0; selo.scale.setScalar(0.001); selo.position.y = 4; p.redesenhar(); },
};
