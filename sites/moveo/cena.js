// Moveo · a sala de atendimento: piso de taco, parede de gesso, maca de couro, rolo de liberação, bola suíça,
// faixas elásticas e uma planta de verdade (Poly Haven). Cada objeto é um serviço: passar o mouse destaca,
// clicar abre o serviço (evento "moveo-servico").
import { palco, THREE, calmo, aproxima, luz, modelo, textura, encaixar, corDaPagina } from '../assets/3d/palco.js';

const canvas = document.getElementById('sala-3d');
if (canvas) {
  const p = palco(canvas, { fov: 34, pos: [7.5, 5.2, 9], alvo: [0, 1, 0], quadro, tom: true });
  const acc = () => getComputedStyle(document.documentElement).getPropertyValue('--acc').trim() || '#e0664f';
  const objetos = {}; // servico → { g, mats }
  let foco = null, sel = null, cam = 0, camAlvo = 0;

  if (p) {
    const { cena } = p;
    luz(p, 'studio_small_09', { forca: 0.9 });
    cena.background = corDaPagina(0xf6efe7);
    const janela = new THREE.DirectionalLight(0xfff1e0, 2.4); janela.position.set(-6, 8, 5); janela.castShadow = true;
    janela.shadow.mapSize.set(2048, 2048); Object.assign(janela.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8 }); janela.shadow.bias = -0.0005; cena.add(janela);
    const piso = new THREE.Mesh(new THREE.PlaneGeometry(14, 12), new THREE.MeshStandardMaterial({ ...textura('herringbone_parquet', 4, 3.4) })); piso.rotation.x = -Math.PI / 2; piso.receiveShadow = true; cena.add(piso);
    const gesso = new THREE.MeshStandardMaterial({ color: 0xf2ebe2, roughness: 0.95 });
    const paredeF = new THREE.Mesh(new THREE.PlaneGeometry(14, 6), gesso); paredeF.position.set(0, 3, -4); paredeF.receiveShadow = true; cena.add(paredeF);
    const paredeL = new THREE.Mesh(new THREE.PlaneGeometry(12, 6), gesso); paredeL.rotation.y = Math.PI / 2; paredeL.position.set(-5, 3, 2); paredeL.receiveShadow = true; cena.add(paredeL);

    const grupo = (servico) => { const g = new THREE.Group(); g.userData.servico = servico; cena.add(g); objetos[servico] = { g, mats: [] }; return g; };
    const peca = (g, geo, mat, pos, rot) => { const m = new THREE.Mesh(geo, mat); m.position.set(...pos); if (rot) m.rotation.set(...rot); m.castShadow = m.receiveShadow = true; m.userData.servico = g.userData.servico; g.add(m); objetos[g.userData.servico].mats.push(mat); return m; };
    // maca: estofado de couro e pés de madeira → terapia manual
    const maca = grupo('manual');
    const couro = new THREE.MeshStandardMaterial({ ...textura('leather_white', 4, 1.5), color: 0x7fb0a9, roughness: 0.55 });
    const madeira = new THREE.MeshStandardMaterial({ ...textura('oak_veneer_01', 1, 1) });
    peca(maca, new THREE.BoxGeometry(4.2, 0.35, 1.5), couro, [0, 1.55, -1.6]);
    peca(maca, new THREE.BoxGeometry(1.1, 0.3, 1.45), couro, [-2.55, 1.62, -1.6], [0, 0, 0.12]);
    [[-1.8, -2.15], [1.8, -2.15], [-1.8, -1.05], [1.8, -1.05]].forEach(([x, z]) => peca(maca, new THREE.CylinderGeometry(0.07, 0.07, 1.4), madeira, [x, 0.7, z]));
    // rolo de espuma → liberação miofascial
    const rolo = grupo('miofascial');
    peca(rolo, new THREE.CylinderGeometry(0.33, 0.33, 1.6, 40), new THREE.MeshStandardMaterial({ color: 0x2f6f7a, roughness: 0.9 }), [2.6, 0.33, 1.4], [0, 0.6, Math.PI / 2]);
    // bola suíça → terapia do movimento
    const bola = grupo('movimento');
    peca(bola, new THREE.SphereGeometry(0.85, 48, 32), new THREE.MeshPhysicalMaterial({ color: 0xe0664f, roughness: 0.25, clearcoat: 0.8 }), [-1.9, 0.85, 1.2]);
    // faixas elásticas e palmilha → ortopédica e palmilhas
    const faixas = grupo('ortopedica');
    [0xf2c14e, 0x6aa36f, 0x3c6fa8].forEach((c, i) => peca(faixas, new THREE.TorusGeometry(0.42, 0.045, 12, 48), new THREE.MeshStandardMaterial({ color: c, roughness: 0.6 }), [0.4 + i * 0.25, 0.05 + i * 0.03, 2.4 - i * 0.15], [Math.PI / 2, 0, i * 0.4]));
    const palm = grupo('palmilhas');
    const sola = new THREE.Shape(); sola.moveTo(0, 0); sola.bezierCurveTo(0.35, 0, 0.42, 0.6, 0.38, 1.1); sola.bezierCurveTo(0.34, 1.6, 0.05, 1.7, -0.05, 1.5); sola.bezierCurveTo(-0.2, 1.1, -0.1, 0.5, -0.25, 0.2); sola.bezierCurveTo(-0.3, 0, -0.1, 0, 0, 0);
    [-0.35, 0.35].forEach((dx, i) => peca(palm, new THREE.ExtrudeGeometry(sola, { depth: 0.06, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 }), new THREE.MeshStandardMaterial({ color: 0x3b3b3b, roughness: 0.7 }), [-0.8 + dx, 0.05, 3.4], [-Math.PI / 2, 0, i ? -0.1 : 0.1]));
    // planta de verdade no canto
    modelo('potted_plant_02').then((o) => { const pl = encaixar(o, 3.2); pl.position.set(-4, 0, -3.2); cena.add(pl); p.redesenhar(); }).catch(() => {});

    const alvos = Object.values(objetos).map((o) => o.g);
    canvas.addEventListener('pointermove', () => { const h = p.tocar(alvos); foco = h ? h.object.userData.servico : null; canvas.style.cursor = foco ? 'pointer' : 'default'; p.redesenhar(); });
    canvas.addEventListener('click', () => { const h = p.tocar(alvos); if (h) { sel = h.object.userData.servico; dispatchEvent(new CustomEvent('moveo-servico', { detail: sel })); p.redesenhar(); } });
  }

  function quadro(t, dt) {
    if (!calmo) camAlvo = p.ponteiro.dentro ? p.ponteiro.x * 0.8 : Math.sin(t * 0.2) * 0.4;
    cam = aproxima(cam, camAlvo, dt, 3);
    p.camera.position.set(7.5 * Math.cos(0.88 + cam * 0.4) , 5.2, 9 * Math.sin(0.88 + cam * 0.4) + 3); p.camera.lookAt(0, 1, 0);
    const cor = new THREE.Color(acc());
    Object.entries(objetos).forEach(([k, o]) => {
      const on = k === sel || k === foco;
      o.mats.forEach((m) => { m.emissive.lerp(on ? cor.clone().multiplyScalar(k === sel ? 0.16 : 0.08) : new THREE.Color(0), 1 - Math.exp(-9 * dt)); });
      o.g.position.y = aproxima(o.g.position.y, k === sel ? 0.15 : 0, dt, 6);
    });
  }

  window.moveoSala = { escolher(k) { sel = k; if (p) p.redesenhar(); } };
}
