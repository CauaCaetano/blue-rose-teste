// Ramos Vilela · a torre: oito andares, um para cada área. Passar o mouse puxa o andar para fora;
// clicar abre a área (evento "rv-andar"). A lista HTML ao lado faz o mesmo, para quem usa teclado.
import { palco, THREE, calmo, aproxima } from '../assets/3d/palco.js';

const canvas = document.getElementById('torre-3d');
if (canvas) {
  // mini: a maquete no topo das páginas internas (só gira, sem andares para clicar)
  const mini = canvas.dataset.modo === 'mini';
  const p = palco(canvas, { fov: 30, pos: mini ? [10, 7, 15] : [9, 6.5, 13], alvo: [0, 3.4, 0], quadro, tom: false });
  const acc = () => getComputedStyle(document.documentElement).getPropertyValue('--acc').trim() || '#b08a4e';
  const ANDARES = 8, H = 0.82;
  const andares = [];
  let foco = -1, aberto = -1, ang = 0.6, alvoAng = 0.6, arrastando = false, ax = 0, mexeu = 0;

  if (p) {
    const { cena } = p;
    cena.add(new THREE.HemisphereLight(0xf4f1ea, 0x6b6257, 1.1));
    const sol = new THREE.DirectionalLight(0xfff1dc, 1.6); sol.position.set(-6, 12, 8); cena.add(sol);
    const contra = new THREE.DirectionalLight(0xc8d6e6, 0.7); contra.position.set(8, 4, -6); cena.add(contra);

    const torre = new THREE.Group(); cena.add(torre); p.torre = torre;
    const pedra = new THREE.MeshStandardMaterial({ color: 0xe9e4da, roughness: 0.85 });
    const grafite = new THREE.MeshStandardMaterial({ color: 0x2a2e33, roughness: 0.5, metalness: 0.3 });
    // chão com sombra suave desenhada
    const t = document.createElement('canvas'); t.width = t.height = 256; const x = t.getContext('2d');
    // a sombra usa o degradê como alphaMap (cinza: claro = mais sombra), sem cor própria no canvas
    const gr = x.createRadialGradient(128, 128, 10, 128, 128, 128); gr.addColorStop(0, '#fff'); gr.addColorStop(1, '#000'); x.fillStyle = gr; x.fillRect(0, 0, 256, 256);
    const sombra = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.MeshBasicMaterial({ color: 0x2a2520, alphaMap: new THREE.CanvasTexture(t), transparent: true, opacity: 0.3, depthWrite: false }));
    sombra.rotation.x = -Math.PI / 2; sombra.position.y = 0.01; cena.add(sombra);
    // pódio
    const podio = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.5, 3.4), pedra); podio.position.y = 0.25; torre.add(podio);
    for (let i = 0; i < ANDARES; i++) {
      const g = new THREE.Group(); g.position.y = 0.5 + i * H;
      const laje = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.12, 2.4), pedra); laje.position.y = 0.06; g.add(laje);
      const vidroMat = new THREE.MeshStandardMaterial({ color: 0xb4c4ce, roughness: 0.18, metalness: 0.35, transparent: true, opacity: 0.86 });
      const vidro = new THREE.Mesh(new THREE.BoxGeometry(3.0, H - 0.12, 2.2), vidroMat); vidro.position.y = 0.12 + (H - 0.12) / 2; g.add(vidro);
      // montantes na fachada
      for (let k = -6; k <= 6; k++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.03, H - 0.12, 0.04), grafite); m.position.set(k * 0.25, vidro.position.y, 1.11); g.add(m); }
      g.userData = { i, vidroMat, sai: 0 };
      vidro.userData.andar = i; laje.userData.andar = i;
      torre.add(g); andares.push(g);
    }
    const cobertura = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.22, 2.6), grafite); cobertura.position.y = 0.5 + ANDARES * H + 0.11; torre.add(cobertura);
    const mastro = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2), grafite); mastro.position.set(1.2, cobertura.position.y + 0.7, 0.8); torre.add(mastro);

    if (!mini) {
    canvas.addEventListener('pointermove', () => { if (arrastando) return; const h = p.tocar(andares); marcar(h ? h.object.userData.andar ?? h.object.parent.userData.i : -1, false); });
    canvas.addEventListener('pointerleave', () => marcar(aberto, false));
    canvas.addEventListener('pointerdown', (e) => { arrastando = true; ax = e.clientX; mexeu = 0; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', (e) => { if (!arrastando) return; const d = (e.clientX - ax) * 0.008; mexeu += Math.abs(d); alvoAng += d; ax = e.clientX; p.redesenhar(); });
    canvas.addEventListener('pointerup', () => {
      arrastando = false;
      if (mexeu < 0.03) { const h = p.tocar(andares); if (h) { const i = h.object.userData.andar ?? h.object.parent.userData.i; dispatchEvent(new CustomEvent('rv-andar', { detail: i })); } }
    });
    }
    addEventListener('br-cor', () => { marcar(foco, false); p.redesenhar(); });
  }

  function marcar(i, abrir) {
    foco = i; if (abrir) aberto = i;
    canvas.style.cursor = i >= 0 ? 'pointer' : 'grab';
    document.dispatchEvent(new CustomEvent('rv-foco', { detail: i }));
    if (p) p.redesenhar();
  }

  function quadro(t, dt) {
    if (!arrastando && !calmo && foco < 0) alvoAng += dt * 0.12;
    ang = aproxima(ang, alvoAng, dt, 5);
    p.torre.rotation.y = ang;
    const cor = new THREE.Color(acc()), vidro = new THREE.Color(0xb4c4ce);
    andares.forEach((g, i) => {
      const ativo = i === foco || i === aberto;
      g.userData.sai = aproxima(g.userData.sai, ativo ? 1 : 0, dt, 9);
      g.position.z = g.userData.sai * 0.9;
      g.userData.vidroMat.color.copy(vidro).lerp(cor, g.userData.sai * 0.85);
      g.userData.vidroMat.emissive = g.userData.vidroMat.emissive || new THREE.Color();
      g.userData.vidroMat.emissive.copy(cor).multiplyScalar(g.userData.sai * 0.25);
    });
  }

  window.rvTorre = { marcar: (i) => marcar(i, false), abrir: (i) => { marcar(i, true); } };
  // o site.js roda antes deste módulo: avisa que a torre está pronta para ele reaplicar o andar aberto
  dispatchEvent(new Event('rv-pronto'));
}
