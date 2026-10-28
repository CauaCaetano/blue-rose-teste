// Atlas · a unidade-modelo: maquete em corte de um estúdio da rede, vista de cima, com pisos de verdade
// (borracha, concreto, taco e granilite). Cada área acende ao passar o mouse; clicar abre a área (evento "atlas-area").
import { palco, THREE, calmo, aproxima, luz, textura } from '../assets/3d/palco.js';

const canvas = document.getElementById('unidade-3d');
if (canvas) {
  const p = palco(canvas, { fov: 32, pos: [13.5, 16, 16], alvo: [0, 0, 0.5], quadro, tom: true });
  const acc = () => getComputedStyle(document.documentElement).getPropertyValue('--acc').trim() || '#0f5c4a';
  const AREAS = { funcional: [-3.2, -2.2, 6, 5], bike: [3.2, -2.2, 6.4, 5], mobilidade: [-3.2, 3, 6, 5.2], recepcao: [3.2, 3, 6.4, 5.2] };
  const pisos = {}, rotulos = {};
  let maquete, sel = null, foco = null, giro = 0, alvo = 0, arr = false, ax = 0, mexeu = 0;

  if (p) {
    const { cena } = p;
    luz(p, 'white_studio_03', { forca: 1 });
    cena.background = new THREE.Color(0xf4f1ea);
    const sol = new THREE.DirectionalLight(0xffffff, 2); sol.position.set(-8, 14, 6); sol.castShadow = true;
    sol.shadow.mapSize.set(2048, 2048); Object.assign(sol.shadow.camera, { left: -11, right: 11, top: 11, bottom: -11 }); sol.shadow.bias = -0.0006; cena.add(sol);
    maquete = new THREE.Group(); cena.add(maquete);
    const TEX = { funcional: ['rubber_tiles', 3], bike: ['concrete_floor_02', 2], mobilidade: ['herringbone_parquet', 2], recepcao: ['terrazzo_tiles', 2] };
    Object.entries(AREAS).forEach(([k, [x, z, w, d]]) => {
      const mat = new THREE.MeshStandardMaterial({ ...textura(TEX[k][0], TEX[k][1], TEX[k][1] * d / w) });
      const piso = new THREE.Mesh(new THREE.BoxGeometry(w, 0.2, d), mat); piso.position.set(x, 0.1, z); piso.receiveShadow = true; piso.userData.area = k;
      maquete.add(piso); pisos[k] = piso;
    });
    // paredes baixas em corte (gesso claro) só no fundo e nas divisões, para enxergar dentro
    const gesso = new THREE.MeshStandardMaterial({ color: 0xf1ede6, roughness: 0.9 });
    const parede = (x, z, w, d, h = 1.4) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), gesso); m.position.set(x, h / 2 + 0.2, z); m.castShadow = m.receiveShadow = true; maquete.add(m); };
    parede(0, -4.85, 13, 0.25, 2.2); parede(-6.45, 0.4, 0.25, 10.6, 2.2); parede(0, 0.25, 13, 0.18, 0.9); parede(0.05, -2.2, 0.18, 4.8, 0.9);
    const ferro = new THREE.MeshStandardMaterial({ color: 0x2a2c2e, metalness: 0.8, roughness: 0.4 });
    const borracha = new THREE.MeshStandardMaterial({ color: 0x161616, roughness: 0.8 });
    const madeira = new THREE.MeshStandardMaterial({ ...textura('oak_veneer_01', 1, 1) });
    const caixa = (mat, w, h, d, x, y, z, ry = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.rotation.y = ry; m.castShadow = true; maquete.add(m); return m; };
    // funcional: gaiola, caixas de salto e kettlebells
    [-5.2, -3.6].forEach((x) => { caixa(ferro, 0.12, 2, 0.12, x, 1.2, -4.2); caixa(ferro, 0.12, 2, 0.12, x, 1.2, -3.2); });
    caixa(ferro, 1.8, 0.1, 0.1, -4.4, 2.15, -4.2); caixa(ferro, 1.8, 0.1, 0.1, -4.4, 2.15, -3.2);
    [[-2, -1], [-1.2, -1], [-1.6, -1.9]].forEach(([x, z], i) => caixa(madeira, 0.8, 0.5 + i * 0.15, 0.7, x, 0.45 + i * 0.07, z, 0.2 * i));
    for (let i = 0; i < 6; i++) { const kb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 16), borracha); kb.position.set(-5 + i * 0.5, 0.42, -0.7); kb.castShadow = true; maquete.add(kb); }
    // bike: duas filas de bicicletas (quadro, banco, roda)
    for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) {
      const x = 1.2 + c * 1.35, z = -3.8 + r * 1.9;
      caixa(ferro, 0.12, 0.9, 0.9, x, 0.65, z, 0); caixa(borracha, 0.25, 0.08, 0.4, x, 1.12, z - 0.35);
      const roda = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.1, 24), ferro); roda.rotation.z = Math.PI / 2; roda.position.set(x, 0.55, z + 0.38); maquete.add(roda);
    }
    // mobilidade: tapetes e rolos
    for (let i = 0; i < 6; i++) { const t = caixa(new THREE.MeshStandardMaterial({ color: i % 2 ? 0x0f5c4a : 0xc9b98f, roughness: 0.9 }), 0.8, 0.04, 1.9, -5.3 + (i % 3) * 1.15, 0.22, 1.6 + Math.floor(i / 3) * 2.3); t.castShadow = false; }
    for (let i = 0; i < 3; i++) { const rolo = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.9, 20), new THREE.MeshStandardMaterial({ color: 0x2d3a35, roughness: 0.8 })); rolo.rotation.z = Math.PI / 2; rolo.position.set(-1.2, 0.36, 1.5 + i * 0.5); maquete.add(rolo); }
    // recepção: balcão e sofá
    caixa(madeira, 3, 1, 0.7, 3.4, 0.7, 1.4); caixa(new THREE.MeshStandardMaterial({ color: 0xe9e5dc, roughness: 0.3 }), 3.1, 0.06, 0.8, 3.4, 1.23, 1.4);
    caixa(new THREE.MeshStandardMaterial({ ...textura('leather_white', 2, 1), color: 0x9c8a6a }), 2.4, 0.5, 0.8, 3.6, 0.45, 4.6);
    // rótulos
    const lab = document.createElement('div'); lab.className = 'rotulos-3d'; canvas.parentElement.appendChild(lab);
    const NOMES = { funcional: 'Funcional', bike: 'Bike', mobilidade: 'Mobilidade', recepcao: 'Recepção e café' };
    Object.keys(AREAS).forEach((k) => { const s = document.createElement('button'); s.type = 'button'; s.textContent = NOMES[k]; s.dataset.area = k; lab.appendChild(s); rotulos[k] = s; });
    lab.addEventListener('click', (e) => { const b = e.target.closest('[data-area]'); if (b) escolher(b.dataset.area, true); });

    const alvos = Object.values(pisos);
    canvas.addEventListener('pointerdown', (e) => { arr = true; ax = e.clientX; mexeu = 0; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', (e) => {
      if (arr) { const d = (e.clientX - ax) * 0.006; mexeu += Math.abs(d); alvo = Math.max(-0.8, Math.min(0.8, alvo + d)); ax = e.clientX; p.redesenhar(); return; }
      const h = p.tocar(alvos); foco = h ? h.object.userData.area : null; canvas.style.cursor = foco ? 'pointer' : 'grab'; p.redesenhar();
    });
    canvas.addEventListener('pointerup', () => { arr = false; if (mexeu < 0.03) { const h = p.tocar(alvos); if (h) escolher(h.object.userData.area, true); } });
  }

  function escolher(k, avisar) { sel = k; if (avisar) dispatchEvent(new CustomEvent('atlas-area', { detail: k })); if (p) p.redesenhar(); }

  function quadro(t, dt) {
    if (!arr && !calmo && !sel) alvo = Math.sin(t * 0.2) * 0.3;
    giro = aproxima(giro, alvo, dt, 4); maquete.rotation.y = giro;
    const cor = new THREE.Color(acc()), w = canvas.clientWidth, h = canvas.clientHeight, v = new THREE.Vector3();
    Object.entries(pisos).forEach(([k, m]) => {
      const on = k === sel, mira = k === foco;
      m.material.emissive = m.material.emissive || new THREE.Color();
      m.material.emissive.lerp(on ? cor.clone().multiplyScalar(0.35) : mira ? cor.clone().multiplyScalar(0.15) : new THREE.Color(0), 1 - Math.exp(-8 * dt));
      m.position.y = aproxima(m.position.y, on ? 0.25 : 0.1, dt, 6);
      m.getWorldPosition(v); v.y += 0.4; v.project(p.camera);
      const r = rotulos[k]; r.style.transform = `translate(${(v.x * 0.5 + 0.5) * w}px, ${(-v.y * 0.5 + 0.5) * h}px)`; r.setAttribute('aria-pressed', String(on));
    });
  }

  window.atlasUnidade = { escolher(k) { escolher(k, false); } };
}
