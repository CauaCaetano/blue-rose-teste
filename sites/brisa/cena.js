// Brisa · a maleta: frasqueira de couro caramelo com cantos de metal e forro de algodão, aberta sobre a mesa.
// O que vai dentro muda conforme o lugar do atendimento (casa, aeroporto, empresa, evento): os itens saem e entram
// com uma mola. brisaMaleta.lugar(k) troca; tocar num item manda o evento "brisa-item" com o nome dele.
import { palco, THREE, calmo, aproxima, luz, textura } from '../assets/3d/palco.js';

const canvas = document.getElementById('maleta-3d');
const p = palco(canvas, { fov: 30, pos: [0, 11.5, 7.4], alvo: [0, 0.3, 0.3], quadro, tom: true });
const itens = []; // { g, lugares, nome, s }
let lugar = 'casa', tampa, giro = 0, abre = 0;

const L = 3.6, P = 2.2, A = 0.95; // largura, profundidade e altura da maleta
if (p) {
  const { cena } = p;
  luz(p, 'brown_photostudio_02', { forca: 0.9 });
  cena.background = new THREE.Color(0x0e2a2f);
  cena.fog = new THREE.Fog(0x0e2a2f, 16, 28);
  const sol = new THREE.DirectionalLight(0xfff0d6, 2.4); sol.position.set(-4, 9, 5); sol.castShadow = true;
  sol.shadow.mapSize.set(2048, 2048); Object.assign(sol.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6 }); sol.shadow.bias = -0.0004; cena.add(sol);
  const mesa = new THREE.Mesh(new THREE.PlaneGeometry(40, 30), new THREE.MeshStandardMaterial({ ...textura('oak_veneer_01', 5, 4), color: 0xb5a28c }));
  mesa.rotation.x = -Math.PI / 2; mesa.receiveShadow = true; cena.add(mesa);

  const couro = new THREE.MeshStandardMaterial({ ...textura('leather_white', 2, 1.4), color: 0x8a5530, roughness: 0.55 });
  const forro = new THREE.MeshStandardMaterial({ normalMap: textura('waffle_pique_cotton', 3, 2).normalMap, color: 0x2f6168, roughness: 1 });
  const metal = new THREE.MeshStandardMaterial({ color: 0xd8c08a, metalness: 1, roughness: 0.28 });
  const caixa = (w, h, d, mat, x, y, z, pai) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; (pai || cena).add(m); return m; };
  // corpo: fundo e quatro paredes de couro, forro por dentro
  const e = 0.08;
  caixa(L, e, P, couro, 0, e / 2, 0);
  caixa(L, A, e, couro, 0, A / 2, P / 2 - e / 2); caixa(L, A, e, couro, 0, A / 2, -P / 2 + e / 2);
  caixa(e, A, P, couro, L / 2 - e / 2, A / 2, 0); caixa(e, A, P, couro, -L / 2 + e / 2, A / 2, 0);
  caixa(L - 2 * e, 0.02, P - 2 * e, forro, 0, e + 0.01, 0);
  caixa(0.04, A * 0.55, P - 2 * e, forro, -0.55, A * 0.28 + e, 0); // divisória
  // cantoneiras e fecho de metal
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => caixa(0.16, 0.16, 0.16, metal, sx * (L / 2 - 0.05), 0.08, sz * (P / 2 - 0.05)));
  caixa(0.34, 0.2, 0.06, metal, 0, A - 0.16, P / 2 + 0.02);
  // tampa presa na borda de trás, com espelho por dentro
  tampa = new THREE.Group(); tampa.position.set(0, A, -P / 2); cena.add(tampa);
  caixa(L, e, P, couro, 0, e / 2, P / 2, tampa);
  const espelho = new THREE.Mesh(new THREE.PlaneGeometry(L - 0.5, P - 0.5), new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.04 }));
  espelho.rotation.x = Math.PI / 2; espelho.position.set(0, -0.005, P / 2); tampa.add(espelho);
  // alça
  const alca = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.06, 12, 32, Math.PI), couro); alca.position.set(0, 0.06, P / 2); alca.rotation.x = -Math.PI / 2; alca.castShadow = true; tampa.add(alca);

  // itens: [nome, lugares, montar(grupo)]
  const mat = (c, r = 0.35, m = 0) => new THREE.MeshPhysicalMaterial({ color: c, roughness: r, metalness: m, clearcoat: r < 0.3 ? 1 : 0 });
  const peca = (g, geo, m, x, y, z, rx = 0, rz = 0) => { const k = new THREE.Mesh(geo, m); k.position.set(x, y, z); k.rotation.set(rx, 0, rz); k.castShadow = true; g.add(k); return k; };
  const novo = (nome, lugares, x, z, montar) => { const g = new THREE.Group(); g.position.set(x, e + 0.02, z); g.userData.nome = nome; montar(g); g.traverse((o) => { o.userData.nome = nome; }); cena.add(g); itens.push({ g, lugares, nome, s: 0 }); };
  const esmalte = (c) => (g) => { peca(g, new THREE.CylinderGeometry(0.15, 0.16, 0.36, 24), mat(c, 0.15), 0, 0.18, 0); peca(g, new THREE.CylinderGeometry(0.07, 0.07, 0.3, 16), mat(0x111111, 0.2), 0, 0.51, 0); };
  const batom = (c) => (g) => { peca(g, new THREE.CylinderGeometry(0.1, 0.1, 0.5, 24), mat(0xd6b46a, 0.25, 1), 0, 0.25, 0); peca(g, new THREE.CylinderGeometry(0.075, 0.075, 0.22, 24), mat(c, 0.3), 0, 0.6, 0); };
  const pincel = (c) => (g) => { peca(g, new THREE.CylinderGeometry(0.04, 0.05, 0.7, 12), mat(0x1c1c1c, 0.3), 0, 0.12, 0, 0, Math.PI / 2); peca(g, new THREE.CylinderGeometry(0.06, 0.05, 0.18, 12), mat(0xc0c0c0, 0.2, 1), 0.43, 0.12, 0, 0, Math.PI / 2); peca(g, new THREE.ConeGeometry(0.12, 0.26, 16), mat(c, 0.9), 0.64, 0.12, 0, 0, -Math.PI / 2); };
  novo('Esmaltes', ['casa', 'empresa'], -1.2, -0.45, (g) => { [0xb3203a, 0xd99a8e, 0x1f2a55].forEach((c, i) => { const s = new THREE.Group(); s.position.x = (i - 1) * 0.36; esmalte(c)(s); g.add(s); }); });
  novo('Lixas e alicate', ['casa'], -1.15, 0.45, (g) => { peca(g, new THREE.BoxGeometry(0.9, 0.03, 0.12), mat(0xe8d7c4, 0.9), 0, 0.03, -0.1); peca(g, new THREE.BoxGeometry(0.9, 0.03, 0.12), mat(0x333333, 0.9), 0, 0.06, 0.1, 0, 0.05); peca(g, new THREE.TorusGeometry(0.12, 0.025, 8, 20), mat(0xcfcfcf, 0.2, 1), 0.2, 0.05, 0.25, Math.PI / 2); });
  novo('Toalhinhas', ['casa', 'evento'], 0.6, 0.45, (g) => { [0, 1, 2].forEach((i) => peca(g, new THREE.CylinderGeometry(0.17, 0.17, 0.55, 20), new THREE.MeshStandardMaterial({ ...textura('waffle_pique_cotton', 1, 1), color: [0xffffff, 0xe9d8c6, 0xf3c9b8][i] }), (i - 1) * 0.38, 0.17, 0, Math.PI / 2, 0)); });
  novo('Pó compacto', ['aeroporto', 'evento'], 0.3, -0.5, (g) => { peca(g, new THREE.CylinderGeometry(0.32, 0.32, 0.1, 32), mat(0x1a1a1a, 0.25), 0, 0.05, 0); peca(g, new THREE.CylinderGeometry(0.26, 0.26, 0.02, 32), mat(0xe2b79c, 0.8), 0, 0.105, 0); });
  novo('Batons', ['aeroporto', 'evento', 'empresa'], 1.25, -0.5, (g) => { [0xa31d36, 0xc76a6a].forEach((c, i) => { const s = new THREE.Group(); s.position.x = (i - 0.5) * 0.3; batom(c)(s); g.add(s); }); });
  novo('Passaporte e minis', ['aeroporto'], -1.2, 0.1, (g) => { peca(g, new THREE.BoxGeometry(0.62, 0.05, 0.88), mat(0x1d2c55, 0.6), 0, 0.03, 0); peca(g, new THREE.CylinderGeometry(0.07, 0.07, 0.01, 20), mat(0xd6b46a, 0.3, 1), 0, 0.06, -0.15); [0, 1].forEach((i) => peca(g, new THREE.CylinderGeometry(0.1, 0.1, 0.32, 16), mat(0xf4f1ea, 0.4), 0.55, 0.16, (i - 0.5) * 0.3)); });
  novo('Creme de mãos', ['empresa', 'aeroporto'], 0.6, 0.48, (g) => { const tubo = peca(g, new THREE.CylinderGeometry(0.13, 0.13, 0.95, 20), mat(0xf6efe4, 0.5), 0, 0.13, 0, 0, Math.PI / 2); tubo.scale.z = 0.7; peca(g, new THREE.CylinderGeometry(0.09, 0.09, 0.14, 16), mat(0xd6b46a, 0.3, 1), 0.54, 0.13, 0, 0, Math.PI / 2); });
  novo('Pincéis', ['evento'], -1.3, 0.3, (g) => { [0xe9c9a8, 0x8b6a4f, 0xf2e2d0].forEach((c, i) => { const s = new THREE.Group(); s.position.set(0, 0, (i - 1) * 0.26); pincel(c)(s); g.add(s); }); });
  novo('Paleta de sombras', ['evento'], -1.1, -0.55, (g) => { peca(g, new THREE.BoxGeometry(0.9, 0.06, 0.5), mat(0x161616, 0.3), 0, 0.03, 0); [0xd9b08c, 0xa86f4c, 0x6b3e2e, 0xe7c7b0, 0xb08a7a, 0x3c2a26].forEach((c, i) => peca(g, new THREE.CylinderGeometry(0.1, 0.1, 0.02, 20), mat(c, 0.9), -0.28 + (i % 3) * 0.28, 0.07, -0.1 + Math.floor(i / 3) * 0.2)); });
  novo('Kit expresso', ['empresa'], -1.15, 0.45, (g) => { peca(g, new THREE.BoxGeometry(0.85, 0.22, 0.5), new THREE.MeshStandardMaterial({ ...textura('leather_white', 1, 1), color: 0x0e2a2f }), 0, 0.11, 0); peca(g, new THREE.BoxGeometry(0.5, 0.02, 0.06), mat(0xd6b46a, 0.3, 1), 0, 0.23, 0.2); });

  const alvos = itens.map((i) => i.g);
  canvas.addEventListener('click', () => { const h = p.tocar(alvos); if (h && h.object.userData.nome) dispatchEvent(new CustomEvent('brisa-item', { detail: h.object.userData.nome })); });
  canvas.addEventListener('pointermove', () => { const h = p.tocar(alvos); canvas.style.cursor = h && itens.some((i) => i.nome === h.object.userData.nome && i.lugares.includes(lugar)) ? 'pointer' : 'default'; });
}

function quadro(t, dt) {
  if (!calmo) giro = aproxima(giro, p.ponteiro.dentro ? p.ponteiro.x * 0.35 : Math.sin(t * 0.2) * 0.15, dt, 3);
  p.camera.position.set(Math.sin(giro) * 7.4, 11.5, Math.cos(giro) * 7.4); p.camera.lookAt(0, 0.3, 0.3);
  abre = aproxima(abre, 1, dt, 2); tampa.rotation.x = -abre * 1.95;
  itens.forEach((it, k) => {
    const alvo = it.lugares.includes(lugar) ? 1 : 0;
    it.s = calmo ? alvo : aproxima(it.s, alvo, dt, 7 - (k % 3));
    const s = Math.max(0.0001, it.s); it.g.scale.setScalar(s); it.g.visible = it.s > 0.01;
    it.g.position.y = 0.1 + (1 - it.s) * 0.8;
  });
}

window.brisaMaleta = { lugar(k) { lugar = k; if (p) p.redesenhar(); } };
