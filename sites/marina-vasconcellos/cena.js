// Marina Vasconcellos · o manequim: um corpo estilizado de argila, com regiões que se tocam.
// data-modo="queixa": um toque escolhe a região (evento "mv-regiao").
// data-modo="laser": cada toque liga ou desliga uma área de depilação (evento "mv-laser"); as costas aparecem girando.
import { palco, THREE, calmo, aproxima, luz, textura } from '../assets/3d/palco.js';

const canvas = document.getElementById('corpo-3d');
if (canvas) {
  const modo = canvas.dataset.modo || 'queixa';
  const p = palco(canvas, { fov: 30, pos: [0, 0.6, 18.5], alvo: [0, -0.1, 0], quadro, tom: true });
  const acc = () => getComputedStyle(document.documentElement).getPropertyValue('--acc').trim() || '#7d9a8c';
  const regioes = []; // malhas que respondem ao toque
  const ativas = new Set();
  let foco = null, giro = 0, giroAlvo = 0, arr = false, ax = 0, mexeu = 0;

  if (p) {
    const { cena } = p;
    luz(p, 'studio_small_09', { forca: 1 });
    const chave = new THREE.DirectionalLight(0xffffff, 1.6); chave.position.set(-4, 7, 6); chave.castShadow = true; chave.shadow.mapSize.set(2048, 2048); Object.assign(chave.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6 }); chave.shadow.bias = -0.0005; cena.add(chave);
    const recorte = new THREE.DirectionalLight(0xdce8ff, 0.8); recorte.position.set(5, 3, -5); cena.add(recorte);
    const corpo = new THREE.Group(); cena.add(corpo); p.corpo = corpo;
    // manequim de artista de verdade: segmentos de madeira clara envernizada (textura real), cada um com o próprio material
    const madeira = textura('oak_veneer_01', 1, 1);
    const argila = () => new THREE.MeshStandardMaterial({ ...madeira, color: 0xffffff, roughness: 0.55 });
    const parte = (geo, pos, chave, rot, escala) => {
      const m = new THREE.Mesh(geo, argila()); m.position.set(...pos);
      if (rot) m.rotation.set(...rot); if (escala) m.scale.set(...escala);
      m.userData.chave = chave; m.castShadow = m.receiveShadow = true; corpo.add(m); regioes.push(m); return m;
    };
    const cap = (r, h) => new THREE.CapsuleGeometry(r, h, 8, 24);
    parte(new THREE.SphereGeometry(0.62, 40, 32), [0, 3.55, 0], 'rosto', null, [0.86, 1.06, 0.9]);
    parte(cap(0.22, 0.35), [0, 2.85, 0], 'pescoco');
    parte(cap(0.78, 1.0), [0, 1.75, 0], 'tronco', null, [1.05, 1, 0.62]);
    parte(cap(0.72, 0.3), [0, 0.62, 0], 'virilha', null, [1.1, 1, 0.66]);
    [-1, 1].forEach((l) => {
      parte(cap(0.19, 1.1), [l * 1.2, 1.75, 0], 'bracos', [0, 0, l * 0.18]);
      parte(cap(0.16, 1.0), [l * 1.45, 0.55, 0.05], 'bracos', [0, 0, l * 0.1]);
      parte(new THREE.SphereGeometry(0.17, 20, 16), [l * 0.95, 2.35, 0.05], 'axilas');
      parte(cap(0.3, 1.25), [l * 0.42, -0.65, 0], 'coxas', [0, 0, l * -0.03]);
      parte(cap(0.22, 1.25), [l * 0.46, -2.35, 0], 'pernas');
    });
    // base
    // juntas esféricas (ombros, cotovelos, quadris, joelhos) e o suporte de metal, como num manequim de ateliê
    const junta = new THREE.MeshStandardMaterial({ ...madeira, color: 0xe8dccd, roughness: 0.5 });
    [[0.98, 2.42], [1.32, 1.12], [0.42, 0.05], [0.46, -1.5]].forEach(([x, y]) => [-1, 1].forEach((l) => { const j = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 16), junta); j.position.set(l * x, y, 0); j.castShadow = true; corpo.add(j); }));
    const metal = new THREE.MeshStandardMaterial({ color: 0x9a9a98, metalness: 1, roughness: 0.25 });
    const haste = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.4), metal); haste.position.set(0, -3.4, -0.55); cena.add(haste);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.6, 0.22, 64), new THREE.MeshStandardMaterial({ ...textura('plywood', 2, 2), roughness: 0.5 }));
    base.position.y = -4.1; base.receiveShadow = true; cena.add(base);

    canvas.addEventListener('pointerdown', (e) => { arr = true; ax = e.clientX; mexeu = 0; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', (e) => {
      if (arr) { const d = (e.clientX - ax) * 0.01; mexeu += Math.abs(d); giroAlvo += d; ax = e.clientX; p.redesenhar(); return; }
      const h = p.tocar(regioes); foco = h ? chaveDe(h) : null; canvas.style.cursor = foco ? 'pointer' : 'grab'; p.redesenhar();
    });
    canvas.addEventListener('pointerleave', () => { foco = null; p.redesenhar(); });
    canvas.addEventListener('pointerup', () => {
      arr = false;
      if (mexeu > 0.05) return;
      const h = p.tocar(regioes); if (!h) return;
      const k = chaveDe(h);
      if (modo === 'laser') { alternar(k); } else { escolher(k); }
    });
  }

  // tronco visto de trás vira "costas" (no modo laser, as costas são uma área própria)
  function chaveDe(h) {
    let k = h.object.userData.chave;
    if (k === 'tronco') {
      const n = h.face.normal.clone().transformDirection(h.object.matrixWorld);
      const frente = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), p.corpo.rotation.y);
      if (n.dot(frente) < -0.2) k = 'costas';
      else k = h.point.y < 1.55 ? 'abdomen' : 'peito';
    }
    if (k === 'pescoco') k = 'rosto';
    return k;
  }
  function escolher(k) { ativas.clear(); ativas.add(k); dispatchEvent(new CustomEvent('mv-regiao', { detail: k })); p.redesenhar(); }
  function alternar(k) { ativas.has(k) ? ativas.delete(k) : ativas.add(k); dispatchEvent(new CustomEvent('mv-laser', { detail: [...ativas] })); p.redesenhar(); }

  function quadro(t, dt) {
    if (!arr && !calmo && modo === 'queixa' && !foco) giroAlvo = Math.sin(t * 0.4) * 0.35;
    giro = aproxima(giro, giroAlvo, dt, 5);
    p.corpo.rotation.y = giro;
    const cor = new THREE.Color(acc()), base = new THREE.Color(0xffffff), quente = new THREE.Color(0xffd9c4);
    regioes.forEach((m) => {
      let k = m.userData.chave; if (k === 'pescoco') k = 'rosto';
      const on = ativas.has(k) || (k === 'tronco' && (ativas.has('abdomen') || ativas.has('peito') || ativas.has('costas')));
      const alvo = on ? cor : (foco && (foco === k || (k === 'tronco' && ['abdomen', 'peito', 'costas'].includes(foco))) ? quente : base);
      // a madeira não muda de cor: a área marcada acende por dentro, na cor da clínica
      const brilho = on ? cor : (alvo === quente ? quente : null);
      m.material.emissive.lerp(brilho ? brilho.clone().multiplyScalar(on ? 0.55 : 0.25) : new THREE.Color(0), 1 - Math.exp(-10 * dt));
    });
  }

  window.mvCorpo = {
    marcar(lista) { ativas.clear(); lista.forEach((k) => ativas.add(k)); if (p) p.redesenhar(); },
    virar(costas) { giroAlvo = costas ? Math.PI : 0; if (p) p.redesenhar(); },
  };
}
