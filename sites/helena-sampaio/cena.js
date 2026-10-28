// Helena Sampaio · a carta: uma folha de papel que se escreve conforme a pessoa conta o caso,
// sobre um envelope, e um selo de cera com o monograma que desce quando a carta é enviada.
import { palco, THREE, calmo, aproxima } from '../assets/3d/palco.js';

const canvas = document.getElementById('carta-3d');
const p = palco(canvas, { fov: 30, pos: [0, 0.3, 13], quadro, tom: false });
const cor = () => getComputedStyle(document.documentElement).getPropertyValue('--acc').trim() || '#7c2431';

let papel, folhaTex, envelope, selo, seloMat, avulsas = [], selando = 0, selado = false;
const estado = { linhas: ['Dra. Helena,', '', 'preciso de ajuda com', 'um problema e não sei', 'por onde começar.', '', 'Aguardo seu retorno.'] };

if (p) montar();

function montar() {
  const { cena } = p;
  cena.add(new THREE.HemisphereLight(0xfffaf2, 0x8a6a50, 1.6));
  const sol = new THREE.DirectionalLight(0xfff0dc, 1.6); sol.position.set(-3, 5, 7); cena.add(sol);

  const grupo = new THREE.Group(); cena.add(grupo); p.grupo = grupo;
  const enquadrar = () => { const estreito = canvas.clientWidth < 520; grupo.position.y = estreito ? 0.1 : 0.4; p.camera.position.z = estreito ? 10.2 : 13; p.redesenhar(); };
  new ResizeObserver(enquadrar).observe(canvas); enquadrar();

  // envelope: corpo e aba em papel kraft
  const kraft = new THREE.MeshStandardMaterial({ color: 0xd9c3a5, roughness: 0.95 });
  envelope = new THREE.Group();
  const corpo = new THREE.Mesh(new THREE.BoxGeometry(4.6, 3, 0.05), kraft);
  envelope.add(corpo);
  const aba = new THREE.Shape(); aba.moveTo(-2.3, 0); aba.lineTo(2.3, 0); aba.lineTo(0, -1.7); aba.lineTo(-2.3, 0);
  const abaM = new THREE.Mesh(new THREE.ShapeGeometry(aba), new THREE.MeshStandardMaterial({ color: 0xcfb593, roughness: 0.95, side: THREE.DoubleSide }));
  abaM.position.set(0, 1.5, 0.04); abaM.rotation.x = -0.35; envelope.add(abaM);
  envelope.position.set(0.2, -0.9, -0.4); envelope.rotation.z = -0.05; envelope.scale.setScalar(0.85);
  grupo.add(envelope);

  // a folha: textura desenhada num canvas, redesenhada quando a pessoa escolhe
  const tela = document.createElement('canvas'); tela.width = 1024; tela.height = 1320;
  folhaTex = new THREE.CanvasTexture(tela); folhaTex.colorSpace = THREE.SRGBColorSpace; folhaTex.anisotropy = 8;
  folhaTex.userData = { tela };
  const geo = new THREE.PlaneGeometry(3.4, 4.4, 24, 24);
  // leve curvatura do papel
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), y = pos.getY(i); pos.setZ(i, 0.08 * Math.sin((x / 3.4) * Math.PI) + 0.04 * Math.cos(y)); }
  geo.computeVertexNormals();
  papel = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: folhaTex, emissiveMap: folhaTex, emissive: 0xffffff, emissiveIntensity: 0.28, roughness: 0.88, side: THREE.DoubleSide }));
  papel.position.set(-0.4, 0.3, 0.3); papel.rotation.z = 0.05;
  grupo.add(papel);

  // folhas soltas ao fundo, devagar
  const solta = new THREE.MeshBasicMaterial({ color: 0xfbf3e6, side: THREE.DoubleSide, transparent: true, opacity: 0.55 });
  for (let i = 0; i < 5; i++) {
    const f = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.15), solta);
    f.position.set((i % 2 ? 1 : -1) * (3.2 + i * 0.5), -2.4 + i * 1.1, -3 - i * 0.5);
    f.rotation.set(Math.random() * 0.6, Math.random() * 0.8, Math.random() * 0.6);
    f.userData.v = 0.15 + Math.random() * 0.2; f.userData.f = Math.random() * 6;
    cena.add(f); avulsas.push(f);
  }

  // selo de cera com o monograma
  const t2 = document.createElement('canvas'); t2.width = t2.height = 256;
  const seloTex = new THREE.CanvasTexture(t2); seloTex.colorSpace = THREE.SRGBColorSpace; seloTex.userData = { tela: t2 };
  seloMat = new THREE.MeshStandardMaterial({ color: cor(), roughness: 0.35, metalness: 0.05 });
  const topo = new THREE.MeshStandardMaterial({ map: seloTex, roughness: 0.35, metalness: 0.05 });
  const g = new THREE.CylinderGeometry(0.62, 0.66, 0.16, 48);
  const pg = g.attributes.position;
  for (let i = 0; i < pg.count; i++) { const x = pg.getX(i), z = pg.getZ(i), a = Math.atan2(z, x), r = Math.hypot(x, z); if (r > 0.3) { const k = 1 + 0.05 * Math.sin(a * 7) + 0.03 * Math.sin(a * 13); pg.setX(i, x * k); pg.setZ(i, z * k); } }
  g.computeVertexNormals();
  selo = new THREE.Mesh(g, [seloMat, topo, seloMat]);
  selo.rotation.x = Math.PI / 2;
  selo.position.set(0.9, -1.3, 3.5); selo.scale.setScalar(0.001);
  grupo.add(selo);
  desenharSelo();

  const pronto = () => { desenharFolha(); p.redesenhar(); };
  (document.fonts ? document.fonts.load('italic 500 60px "Cormorant Garamond"').then(pronto, pronto) : pronto());
  addEventListener('br-cor', () => { seloMat.color.set(cor()); desenharSelo(); desenharFolha(); p.redesenhar(); });
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
  // fibra do papel
  for (let i = 0; i < 1400; i++) { x.fillStyle = `rgba(120,90,60,${Math.random() * 0.035})`; x.fillRect(Math.random() * W, Math.random() * H, 2, 2); }
  x.strokeStyle = 'rgba(124,36,49,.16)'; x.lineWidth = 2;
  for (let y = 300; y < H - 80; y += 84) { x.beginPath(); x.moveTo(80, y); x.lineTo(W - 80, y); x.stroke(); }
  x.fillStyle = cor(); x.font = '600 34px Montserrat, sans-serif'; x.fillText('HELENA SAMPAIO · ADVOCACIA', 80, 130);
  x.fillStyle = 'rgba(34,25,15,.5)'; x.font = '500 26px Montserrat, sans-serif'; x.fillText('Ribeirão Preto · ' + new Date().toLocaleDateString('pt-BR'), 80, 180);
  x.fillStyle = '#2a1d14'; x.font = 'italic 500 62px "Cormorant Garamond", serif';
  estado.linhas.forEach((l, i) => x.fillText(l, 90, 284 + i * 84));
  folhaTex.needsUpdate = true;
}

function quadro(t, dt) {
  const g = p.grupo, alvoY = p.ponteiro.dentro ? p.ponteiro.x * 0.35 : Math.sin(t * 0.3) * 0.12, alvoX = p.ponteiro.dentro ? -p.ponteiro.y * 0.2 : 0;
  g.rotation.y = aproxima(g.rotation.y, alvoY, dt, 3);
  g.rotation.x = aproxima(g.rotation.x, alvoX, dt, 3);
  papel.position.y = 0.3 + (calmo ? 0 : Math.sin(t * 0.9) * 0.05);
  avulsas.forEach((f) => { f.rotation.y += f.userData.v * dt; f.position.y += Math.sin(t + f.userData.f) * 0.0015; });
  if (selando) {
    selando = Math.min(1, selando + dt * 1.6);
    const k = selando < 0.7 ? selando / 0.7 : 1;
    // desce grande e assenta com um pequeno amassado no fim
    selo.scale.setScalar(k < 1 ? 1.6 - k * 0.6 : 1 + 0.08 * Math.sin(((selando - 0.7) / 0.3) * Math.PI));
    selo.position.z = 3.5 - 3.1 * k;
    if (selando >= 1) { selando = 0; selado = true; selo.scale.setScalar(1); selo.position.z = 0.42; }
  }
}

// API para o site.js
window.helenaCarta = {
  escrever(linhas) { estado.linhas = linhas; if (p && folhaTex) { desenharFolha(); p.redesenhar(); } },
  selar() { if (!p) return; selado = false; selando = 0.001; p.redesenhar(); },
  abrir() { if (!p) return; selado = false; selando = 0; selo.scale.setScalar(0.001); selo.position.z = 3.5; p.redesenhar(); },
};
