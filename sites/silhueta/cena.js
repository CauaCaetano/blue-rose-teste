// Silhueta · o mapa: Minas Gerais e São Paulo em relevo, com as 9 clínicas acesas.
// Passar o mouse mostra o nome; clicar escolhe a unidade (evento "sil-unidade"). silMapa.focar(id) vem do localizador.
import { palco, THREE, calmo, aproxima, luz, textura } from '../assets/3d/palco.js';

const canvas = document.getElementById('mapa-3d');
if (canvas) {
  const p = palco(canvas, { fov: 32, pos: [0, -11, 12.5], alvo: [0, -0.4, 0], quadro, tom: true });
  const acc = () => getComputedStyle(document.documentElement).getPropertyValue('--acc').trim() || '#d6246e';
  // contornos simplificados (longitude, latitude)
  const MG = [[-51.0, -19.4], [-50.2, -18.9], [-49.2, -18.4], [-48.0, -18.1], [-47.4, -16.6], [-46.4, -15.3], [-45.2, -14.3], [-44.3, -14.6], [-42.9, -15.2], [-41.3, -15.8], [-40.2, -16.6], [-40.6, -17.6], [-41.1, -18.6], [-41.8, -20.1], [-42.2, -21.3], [-42.8, -22.0], [-44.2, -22.7], [-44.9, -22.4], [-45.8, -22.5], [-46.4, -22.1], [-46.6, -21.3], [-47.2, -20.9], [-47.4, -20.1], [-48.9, -20.0], [-50.0, -19.9]];
  const SP = [[-53.1, -22.67], [-51.9, -22.0], [-51.0, -20.3], [-50.0, -19.9], [-48.9, -20.0], [-47.4, -20.1], [-47.2, -20.9], [-46.6, -21.3], [-46.4, -22.1], [-45.8, -22.5], [-44.9, -22.4], [-44.2, -22.7], [-44.8, -23.4], [-46.4, -24.0], [-47.9, -25.1], [-48.4, -25.2], [-48.6, -24.6], [-49.3, -24.3], [-49.6, -23.0], [-50.4, -22.9], [-51.5, -22.6]];
  const C = [-46.6, -19.7], K = 0.62; // centro e escala do mapa
  const xy = ([lo, la]) => new THREE.Vector2((lo - C[0]) * K, (la - C[1]) * K);
  const pinos = {}, rotulos = {};
  let sel = null, foco = null, giro = 0, alvo = 0, arr = false, ax = 0, mexeu = 0, grupo;

  if (p) {
    const { cena } = p;
    // maquete de mármore com pinos de latão, sob luz de estúdio de verdade
    luz(p, 'white_studio_03', { forca: 1 });
    const sol = new THREE.DirectionalLight(0xffffff, 1.8); sol.position.set(-4, -6, 10); sol.castShadow = true; sol.shadow.mapSize.set(2048, 2048); Object.assign(sol.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8 }); sol.shadow.bias = -0.0005; cena.add(sol);
    const tampo = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: 0.18 })); tampo.position.z = -0.01; tampo.receiveShadow = true; cena.add(tampo);
    grupo = new THREE.Group(); cena.add(grupo);
    const estado = (pts, cor, alt) => {
      const sh = new THREE.Shape(pts.map(xy));
      const geo = new THREE.ExtrudeGeometry(sh, { depth: alt, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 3 });
      const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ ...textura('marble_01', 0.12, 0.12), color: cor, roughness: 0.25 })); m.castShadow = m.receiveShadow = true;
      grupo.add(m);
      const borda = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts.map((q) => { const v = xy(q); return new THREE.Vector3(v.x, v.y, alt + 0.07); })), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 }));
      grupo.add(borda);
    };
    estado(MG, 0xffffff, 0.35);
    estado(SP, 0xf3e3e8, 0.28);
    // as unidades vêm do HTML (data-lon, data-lat), para o localizador e o mapa usarem a mesma lista
    const caixa = document.createElement('div'); caixa.className = 'rotulos-mapa'; canvas.parentElement.appendChild(caixa);
    document.querySelectorAll('[data-unidade]').forEach((el) => {
      const id = el.dataset.unidade, v = xy([Number(el.dataset.lon), Number(el.dataset.lat)]);
      const alt = el.dataset.uf === 'MG' ? 0.42 : 0.35;
      const pino = new THREE.Group(); pino.position.set(v.x, v.y, alt);
      const haste = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.7, 12), new THREE.MeshStandardMaterial({ color: 0xc9a35a, metalness: 1, roughness: 0.25 })); haste.castShadow = true;
      haste.rotation.x = Math.PI / 2; haste.position.z = 0.35; pino.add(haste);
      const cab = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 16), new THREE.MeshStandardMaterial({ color: acc(), emissive: acc(), emissiveIntensity: 0.25, roughness: 0.3 }));
      cab.position.z = 0.75; pino.add(cab);
      const anel = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.24, 32), new THREE.MeshBasicMaterial({ color: acc(), transparent: true, opacity: 0.5 }));
      anel.position.z = 0.02; pino.add(anel);
      pino.userData = { id, cab, anel }; cab.userData.id = id; haste.userData.id = id;
      grupo.add(pino); pinos[id] = pino;
      const s = document.createElement('span'); s.textContent = el.dataset.nome; caixa.appendChild(s); rotulos[id] = s;
    });
    const alvos = () => Object.values(pinos).map((q) => q.userData.cab);
    canvas.addEventListener('pointerdown', (e) => { arr = true; ax = e.clientX; mexeu = 0; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', (e) => {
      if (arr) { const d = (e.clientX - ax) * 0.006; mexeu += Math.abs(d); alvo = Math.max(-0.7, Math.min(0.7, alvo + d)); ax = e.clientX; p.redesenhar(); return; }
      const h = p.tocar(alvos()); foco = h ? h.object.userData.id : null; canvas.style.cursor = foco ? 'pointer' : 'grab'; p.redesenhar();
    });
    canvas.addEventListener('pointerup', () => { arr = false; if (mexeu > 0.03) return; const h = p.tocar(alvos()); if (h) escolher(h.object.userData.id, true); });
    addEventListener('br-cor', () => { Object.values(pinos).forEach((q) => { q.userData.cab.material.color.set(acc()); q.userData.cab.material.emissive.set(acc()); q.userData.anel.material.color.set(acc()); }); p.redesenhar(); });
  }

  function escolher(id, avisar) { sel = id; if (avisar) dispatchEvent(new CustomEvent('sil-unidade', { detail: id })); if (p) p.redesenhar(); }

  function quadro(t, dt) {
    if (!arr && !calmo && !sel) alvo = Math.sin(t * 0.25) * 0.25;
    giro = aproxima(giro, alvo, dt, 4);
    grupo.rotation.z = giro;
    const w = canvas.clientWidth, h = canvas.clientHeight, v = new THREE.Vector3();
    Object.entries(pinos).forEach(([id, q], i) => {
      const ativo = id === sel, mira = id === foco;
      const s = aproxima(q.userData.cab.scale.x, ativo ? 1.6 : mira ? 1.3 : 1, dt, 10); q.userData.cab.scale.setScalar(s);
      q.userData.anel.scale.setScalar(1 + (calmo ? 0 : ((t * 0.8 + i * 0.13) % 1) * (ativo ? 2.2 : 1.2)));
      q.userData.anel.material.opacity = calmo ? 0.4 : 0.55 * (1 - ((t * 0.8 + i * 0.13) % 1));
      q.userData.cab.getWorldPosition(v); v.project(p.camera);
      const r = rotulos[id]; r.style.transform = `translate(${(v.x * 0.5 + 0.5) * w}px, ${(-v.y * 0.5 + 0.5) * h}px)`;
      r.classList.toggle('ativo', ativo); r.classList.toggle('mira', mira);
    });
  }

  window.silMapa = { focar(id) { escolher(id, false); } };
}
