// Lívia Prado · a bancada de esmaltes: vidros de esmalte com tampa preta sobre o tampo de granilite, ao lado de
// uma cartela de unhas postiças. Escolher uma cor traz o vidro para a frente, abre a tampa com o pincel e pinta a
// cartela. Evento "lp-cor" ao tocar num vidro; livia.cor(i) faz o mesmo pelos botões da página.
import { palco, THREE, calmo, aproxima, luz, textura } from '../assets/3d/palco.js';

export const CORES = [['Nude rosé', 0xd59e94], ['Vermelho paixão', 0xa8162a], ['Marsala', 0x5e1d2c], ['Rosa chiclete', 0xe56497], ['Coral', 0xef7656], ['Lilás', 0x9f86c4], ['Azul noite', 0x1d2a57], ['Preto ônix', 0x18181c]];
const canvas = document.getElementById('esmaltes-3d');
const p = palco(canvas, { fov: 30, pos: [0, 6, 15.5], alvo: [0, 1.2, 0.6], quadro, tom: true });
const vidros = []; // { g, tampa, pincel, liquido, x0 }
let sel = 0, foco = -1, unhas = [], giro = 0;

if (p) {
  const { cena } = p;
  luz(p, 'studio_small_09', { forca: 1.1 });
  cena.background = new THREE.Color(0xf7ece8); cena.fog = new THREE.Fog(0xf7ece8, 17, 30); // o tampo some no fundo, sem borda
  const sol = new THREE.DirectionalLight(0xfff4ee, 2.2); sol.position.set(3, 7, 5); sol.castShadow = true;
  sol.shadow.mapSize.set(2048, 2048); Object.assign(sol.shadow.camera, { left: -7, right: 7, top: 6, bottom: -4 }); sol.shadow.bias = -0.0004; cena.add(sol);
  const tampo = new THREE.Mesh(new THREE.PlaneGeometry(60, 40), new THREE.MeshStandardMaterial({ ...textura('terrazzo_tiles', 7.5, 5), color: 0xf3e3dc, roughness: 0.35 }));
  tampo.rotation.x = -Math.PI / 2; tampo.receiveShadow = true; cena.add(tampo);

  // perfil do vidro (girado): base larga, ombro arredondado, gargalo curto
  const perfil = (k) => [[0, 0], [0.42 * k, 0], [0.5 * k, 0.06], [0.52 * k, 0.9], [0.46 * k, 1.12], [0.24 * k, 1.24], [0.2 * k, 1.36], [0, 1.36]].map(([x, y]) => new THREE.Vector2(x, y));
  const geoVidro = new THREE.LatheGeometry(perfil(1), 48);
  const geoLiq = new THREE.LatheGeometry(perfil(0.9).map((v) => new THREE.Vector2(v.x, Math.min(v.y * 0.98 + 0.03, 1.02))), 48);
  const vidro = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.04, metalness: 0, transparent: true, opacity: 0.22, clearcoat: 1, envMapIntensity: 1.4, depthWrite: false });
  const preto = new THREE.MeshPhysicalMaterial({ color: 0x111113, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.1 });
  const tampaGeo = new THREE.CylinderGeometry(0.2, 0.22, 1.25, 24); tampaGeo.translate(0, 0.62, 0);
  CORES.forEach(([, c], i) => {
    const g = new THREE.Group(), x0 = (i - 3.5) * 0.92;
    g.position.set(x0, 0, i % 2 ? -0.5 : 0); g.userData.i = i;
    const liq = new THREE.Mesh(geoLiq, new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.18, clearcoat: 1 })); liq.position.y = 0.02; liq.castShadow = true;
    const vd = new THREE.Mesh(geoVidro, vidro); vd.renderOrder = 2;
    const tampa = new THREE.Group(); tampa.position.y = 1.32;
    const tp = new THREE.Mesh(tampaGeo, preto); tp.castShadow = true; tampa.add(tp);
    // pincel: haste e cerdas molhadas na cor, aparecem quando a tampa sobe
    const haste = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.9), new THREE.MeshStandardMaterial({ color: 0x222, roughness: 0.5 })); haste.position.y = -0.45;
    const cerdas = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.32, 16), new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.15, clearcoat: 1 })); cerdas.rotation.x = Math.PI; cerdas.position.y = -1.02;
    tampa.add(haste, cerdas);
    [liq, vd, tp].forEach((m) => { m.userData.i = i; });
    g.add(liq, vd, tampa); cena.add(g);
    vidros.push({ g, tampa, x0, z0: g.position.z });
  });
  // cartela de unhas: cinco unhas postiças em leque, pintadas na cor escolhida
  const unha = new THREE.Shape(); unha.moveTo(-0.22, 0); unha.lineTo(0.22, 0); unha.bezierCurveTo(0.26, 0.42, 0.2, 0.7, 0, 0.74); unha.bezierCurveTo(-0.2, 0.7, -0.26, 0.42, -0.22, 0);
  const cartela = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.05, 1.5), new THREE.MeshStandardMaterial({ color: 0xfaf7f4, roughness: 0.8 }));
  cartela.position.set(0, 0.025, 2.4); cartela.rotation.y = -0.08; cartela.receiveShadow = true; cena.add(cartela);
  for (let i = 0; i < 5; i++) {
    const m = new THREE.Mesh(new THREE.ExtrudeGeometry(unha, { depth: 0.05, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.03, bevelSegments: 4 }), new THREE.MeshPhysicalMaterial({ color: CORES[0][1], roughness: 0.12, clearcoat: 1 }));
    m.rotation.set(-Math.PI / 2, 0, (i - 2) * 0.16); m.position.set(-1.2 + i * 0.6, 0.06, 2.75 - Math.abs(i - 2) * 0.08); m.castShadow = true;
    cartela.add(m); m.position.sub(cartela.position).setY(0.06); unhas.push(m);
  }

  const alvos = vidros.map((v) => v.g);
  canvas.addEventListener('pointermove', () => { const h = p.tocar(alvos); foco = h ? h.object.userData.i : -1; canvas.style.cursor = foco > -1 ? 'pointer' : 'default'; p.redesenhar(); });
  canvas.addEventListener('click', () => { const h = p.tocar(alvos); if (h) { escolher(h.object.userData.i); dispatchEvent(new CustomEvent('lp-cor', { detail: sel })); } });
}

function escolher(i) { sel = i; if (p) p.redesenhar(); }

function quadro(t, dt) {
  if (!calmo) giro = aproxima(giro, p.ponteiro.dentro ? p.ponteiro.x * 0.18 : Math.sin(t * 0.3) * 0.06, dt, 3);
  p.camera.position.set(Math.sin(giro) * 15.5, 6, Math.cos(giro) * 15.5); p.camera.lookAt(0, 1.2, 0.6);
  const alvoCor = new THREE.Color(CORES[sel][1]);
  vidros.forEach((v, i) => {
    const on = i === sel;
    v.g.position.z = aproxima(v.g.position.z, on ? 1.1 : v.z0, dt, 5);
    v.g.position.y = aproxima(v.g.position.y, i === foco && !on ? 0.12 : 0, dt, 8);
    v.tampa.position.y = aproxima(v.tampa.position.y, on ? 2.5 : 1.32, dt, 4);
    v.tampa.rotation.z = aproxima(v.tampa.rotation.z, on ? 0.18 : 0, dt, 4);
  });
  unhas.forEach((m, k) => m.material.color.lerp(alvoCor, 1 - Math.exp(-(5 - k * 0.6) * dt)));
}

window.livia = { cor(i) { escolher(i); } };
