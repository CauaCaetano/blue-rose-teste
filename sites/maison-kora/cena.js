// Maison Kora · o frasco: vidro, líquido e rótulo mudam com o objetivo escolhido (kora.objetivo(i)).
import { palco, THREE, calmo, aproxima, luz, modelo, textura, encaixar } from '../assets/3d/palco.js';

const canvas = document.getElementById('frasco-3d');
const p = palco(canvas, { fov: 30, pos: [0, 1.6, 15], alvo: [0, 0.1, 0], quadro, tom: true });
const OBJ = [
  { nome: 'Rosto', cor: 0xd99a5b, nivel: 0.72, linha: 'Lifting sem cortes · ultrassom microfocado · bioestimulador' },
  { nome: 'Corpo', cor: 0xc9867c, nivel: 0.56, linha: 'Contorno com equipe de cirurgia plástica · radiofrequência' },
  { nome: 'Pele', cor: 0xe8dcc8, nivel: 0.84, linha: 'Laser fracionado · peeling · protocolo de viço' },
  { nome: 'Rejuvenescer', cor: 0xc8a14a, nivel: 0.64, linha: 'Toxina · preenchimento · fios de sustentação' },
];
let grupo, liquido, liqMat, rotulo, rotTex, alvo = OBJ[0], nivel = 0.72, giroAlvo = 0, giro = 0, arr = false, ax = 0;
const corAtual = new THREE.Color(OBJ[0].cor);

if (p) montar();

function ambiente() {
  // ambiente de estúdio para o vidro refletir: fundo marfim e duas "janelas" de luz
  const sc = new THREE.Scene();
  sc.add(new THREE.Mesh(new THREE.SphereGeometry(20, 32, 16), new THREE.MeshBasicMaterial({ color: 0xefe7dc, side: THREE.BackSide })));
  [[-6, 4, 6, 8, 6], [7, 2, -4, 4, 10]].forEach(([x, y, z, w, h]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: 0xffffff })); m.position.set(x, y, z); m.lookAt(0, 0, 0); sc.add(m); });
  const pm = new THREE.PMREMGenerator(p.renderer);
  return pm.fromScene(sc, 0.04).texture;
}

function montar() {
  const { cena } = p;
  cena.environment = ambiente();
  // estúdio de foto de verdade (HDRI) por cima do ambiente provisório
  luz(p, 'studio_small_09', { forca: 1 });
  const chave = new THREE.DirectionalLight(0xfff4e8, 1.4); chave.position.set(-4, 7, 5); chave.castShadow = true; chave.shadow.mapSize.set(2048, 2048); Object.assign(chave.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6 }); chave.shadow.bias = -0.0005; cena.add(chave);
  // o vidro com transmissão precisa de um fundo de verdade atrás (com fundo transparente ele fica leitoso)
  cena.background = new THREE.Color(0xefe8de); // mesmo tom do fundo da vitrine
  const brilho = new THREE.DirectionalLight(0xfff4e8, 1.2); brilho.position.set(-3, 5, 4); cena.add(brilho);
  grupo = new THREE.Group(); cena.add(grupo);

  // perfil do frasco (meia-silhueta girada no eixo)
  const perfil = [[0, -1.6], [0.95, -1.6], [1.05, -1.5], [1.08, -1.2], [1.08, 0.7], [1.0, 0.95], [0.62, 1.2], [0.36, 1.32], [0.34, 1.62]].map(([x, y]) => new THREE.Vector2(x, y));
  const vidro = new THREE.Mesh(new THREE.LatheGeometry(perfil, 72), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.03, metalness: 0, transparent: true, opacity: 0.22, depthWrite: false, envMapIntensity: 2.2, clearcoat: 1, clearcoatRoughness: 0.05, side: THREE.DoubleSide }));
  vidro.renderOrder = 2; // vidro transparente por cima do líquido e do rótulo (transmissão real fica leitosa em alguns aparelhos)
  grupo.add(vidro);
  // líquido: cilindro por dentro, a altura acompanha o nível
  liqMat = new THREE.MeshPhysicalMaterial({ color: corAtual, roughness: 0.2, clearcoat: 0.6, transparent: true, opacity: 0.92, envMapIntensity: 0.8 });
  liquido = new THREE.Mesh(new THREE.CylinderGeometry(0.98, 0.98, 1, 64), liqMat);
  grupo.add(liquido);
  // tampa dourada e conta-gotas
  const ouro = new THREE.MeshStandardMaterial({ color: 0xb79a64, metalness: 1, roughness: 0.25 });
  const tampa = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.7, 64), ouro); tampa.position.y = 1.95; grupo.add(tampa);
  const bulbo = new THREE.Mesh(new THREE.SphereGeometry(0.34, 48, 24, 0, Math.PI * 2, 0, Math.PI / 1.6), new THREE.MeshStandardMaterial({ color: 0x2a2421, roughness: 0.55 })); bulbo.position.y = 2.45; grupo.add(bulbo);
  // rótulo de papel em volta do frasco
  const t = document.createElement('canvas'); t.width = 1024; t.height = 512;
  rotTex = new THREE.CanvasTexture(t); rotTex.colorSpace = THREE.SRGBColorSpace; rotTex.anisotropy = 8; rotTex.userData = { t };
  rotulo = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 1.25, 64, 1, true, -Math.PI * 0.45, Math.PI * 0.9), new THREE.MeshStandardMaterial({ map: rotTex, roughness: 0.9, transparent: true }));
  rotulo.position.y = -0.35; rotulo.rotation.y = -Math.PI / 2; grupo.add(rotulo);
  // pedestal de mármore
  // pedestal de mármore de verdade, mais largo, com os objetos da casa ao lado do frasco
  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.3, 0.4, 96), new THREE.MeshStandardMaterial({ ...textura('marble_01', 2, 0.4), roughness: 0.22 }));
  pedestal.position.y = -1.8; pedestal.receiveShadow = pedestal.castShadow = true; cena.add(pedestal);
  grupo.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  const apoia = (o, x, z, ry) => { o.position.set(x, -1.6, z); o.rotation.y = ry; cena.add(o); p.redesenhar(); };
  modelo('marble_bust_01').then((o) => apoia(encaixar(o, 3.6), -2.6, -1.2, 0.5)).catch(() => {});
  modelo('ceramic_vase_01').then((o) => apoia(encaixar(o, 1.5), 2.4, -0.9, 0)).catch(() => {});

  const desenhar = () => desenharRotulo(); (document.fonts ? document.fonts.load('400 60px Marcellus').then(desenhar, desenhar) : desenhar());
  canvas.addEventListener('pointerdown', (e) => { arr = true; ax = e.clientX; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => { if (!arr) return; giroAlvo += (e.clientX - ax) * 0.01; ax = e.clientX; p.redesenhar(); });
  addEventListener('pointerup', () => { arr = false; });
}

function desenharRotulo() {
  const c = rotTex.userData.t, x = c.getContext('2d');
  x.clearRect(0, 0, 1024, 512);
  x.fillStyle = '#f7f2ea'; x.fillRect(0, 0, 1024, 512);
  x.strokeStyle = '#1a1714'; x.lineWidth = 3; x.strokeRect(40, 40, 944, 432);
  x.fillStyle = '#1a1714'; x.textAlign = 'center';
  x.font = '400 46px Marcellus, serif'; x.fillText('MAISON KORA', 512, 130);
  x.font = '400 104px Marcellus, serif'; x.fillText(alvo.nome, 512, 270);
  x.font = '500 26px Inter, sans-serif'; x.fillStyle = '#6b5f55';
  const palavras = alvo.linha.split(' · '); x.fillText(palavras.slice(0, 2).join(' · '), 512, 340); if (palavras[2]) x.fillText(palavras[2], 512, 380);
  x.font = '500 22px Inter, sans-serif'; x.fillText('protocolo sob medida · 30 ml', 512, 440);
  rotTex.needsUpdate = true;
}

function quadro(t, dt) {
  if (!arr && !calmo) giroAlvo += dt * 0.25;
  giro = aproxima(giro, giroAlvo, dt, 5);
  grupo.rotation.y = giro;
  grupo.rotation.z = p.ponteiro.dentro ? -p.ponteiro.x * 0.06 : 0;
  grupo.position.y = calmo ? 0 : Math.sin(t * 1.2) * 0.04;
  nivel = aproxima(nivel, alvo.nivel, dt, 3);
  const h = 2.4 * nivel; liquido.scale.y = h; liquido.position.y = -1.55 + h / 2;
  corAtual.lerp(new THREE.Color(alvo.cor), 1 - Math.exp(-4 * dt)); liqMat.color.copy(corAtual);
}

window.kora = { objetivo(i) { alvo = OBJ[i] || OBJ[0]; giroAlvo += Math.PI * 2; if (rotTex) desenharRotulo(); if (p) p.redesenhar(); } };
