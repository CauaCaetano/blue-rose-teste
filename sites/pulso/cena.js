// Pulso · os planos em ferro: três kettlebells de ferro fundido (8, 16 e 24 kg) sobre pista emborrachada de verdade.
// O plano escolhido sobe e ganha a faixa laranja (pulsoPlanos.escolher(i)); clicar num kettlebell escolhe o plano.
import { palco, THREE, calmo, aproxima, luz, textura } from '../assets/3d/palco.js';

const canvas = document.getElementById('planos-3d');
if (canvas) {
  const p = palco(canvas, { fov: 30, pos: [0, 4.2, 11], alvo: [0, 1, 0], quadro, tom: true });
  const acc = () => getComputedStyle(document.documentElement).getPropertyValue('--acc').trim() || '#ff5a1f';
  const pesos = [];
  let sel = 1, foco = -1;

  if (p) {
    const { cena } = p;
    luz(p, 'crossfit_gym', { forca: 1 });
    cena.background = new THREE.Color(0xf1efec); cena.fog = new THREE.Fog(0xf1efec, 12, 24);
    const chave = new THREE.DirectionalLight(0xffffff, 2.2); chave.position.set(-4, 9, 6); chave.castShadow = true;
    chave.shadow.mapSize.set(2048, 2048); Object.assign(chave.shadow.camera, { left: -7, right: 7, top: 6, bottom: -6 }); chave.shadow.bias = -0.0005; cena.add(chave);
    const pista = new THREE.Mesh(new THREE.PlaneGeometry(40, 30), new THREE.MeshStandardMaterial({ ...textura('rubberized_track', 8, 6) }));
    pista.rotation.x = -Math.PI / 2; pista.receiveShadow = true; cena.add(pista);
    // kettlebell: corpo torneado, base achatada, alça em arco
    const perfil = [[0, 0], [0.55, 0], [0.8, 0.12], [0.98, 0.45], [1.0, 0.8], [0.9, 1.2], [0.62, 1.48], [0.3, 1.6], [0, 1.62]].map(([x, y]) => new THREE.Vector2(x, y));
    [8, 16, 24].forEach((kg, i) => {
      const k = 0.78 + i * 0.16, g = new THREE.Group();
      const ferro = new THREE.MeshStandardMaterial({ ...textura('metal_plate', 2, 2), color: 0x3a3a3c, metalness: 0.75, roughness: 0.6 });
      const corpo = new THREE.Mesh(new THREE.LatheGeometry(perfil, 64), ferro); corpo.castShadow = true; g.add(corpo);
      const alca = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.11, 20, 64, Math.PI * 1.15), ferro);
      alca.rotation.z = -Math.PI * 0.075; alca.position.y = 1.62; alca.castShadow = true; g.add(alca);
      [-1, 1].forEach((l) => { const pe = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.4, 16), ferro); pe.position.set(l * 0.6, 1.55, 0); g.add(pe); });
      // faixa do plano (pintada) com o peso
      const t = document.createElement('canvas'); t.width = 1024; t.height = 128; const x = t.getContext('2d');
      const tex = new THREE.CanvasTexture(t); tex.colorSpace = THREE.SRGBColorSpace;
      const faixaMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, metalness: 0.2 });
      const faixa = new THREE.Mesh(new THREE.CylinderGeometry(1.005, 1.005, 0.32, 64, 1, true), faixaMat); faixa.position.y = 0.72; g.add(faixa);
      g.scale.setScalar(k); g.position.x = (i - 1) * 3.1;
      g.userData = { i, kg, x, tex, faixaMat, sobe: 0, giro: 0 };
      corpo.userData.i = alca.userData.i = faixa.userData.i = i;
      cena.add(g); pesos.push(g);
    });
    pintarFaixas();
    canvas.addEventListener('pointermove', () => { const h = p.tocar(pesos); foco = h ? h.object.userData.i ?? -1 : -1; canvas.style.cursor = foco >= 0 ? 'pointer' : 'default'; p.redesenhar(); });
    canvas.addEventListener('click', () => { const h = p.tocar(pesos); if (h && h.object.userData.i !== undefined) dispatchEvent(new CustomEvent('pulso-plano', { detail: h.object.userData.i })); });
    addEventListener('br-cor', () => { pintarFaixas(); p.redesenhar(); });
  }

  function pintarFaixas() {
    pesos.forEach((g) => {
      const { x, tex, kg, i } = g.userData, on = i === sel;
      x.fillStyle = on ? acc() : '#1b1b1b'; x.fillRect(0, 0, 1024, 128);
      x.fillStyle = on ? '#111' : '#d8d8d8'; x.font = '800 84px "Archivo", sans-serif'; x.textBaseline = 'middle';
      for (let k = 0; k < 4; k++) x.fillText(kg + ' KG', 30 + k * 256, 68);
      tex.needsUpdate = true;
    });
  }

  function quadro(t, dt) {
    pesos.forEach((g) => {
      const on = g.userData.i === sel, mira = g.userData.i === foco;
      g.userData.sobe = aproxima(g.userData.sobe, on ? 1 : mira ? 0.35 : 0, dt, 6);
      g.position.y = g.userData.sobe * 0.9 + (on && !calmo ? Math.sin(t * 2) * 0.05 : 0);
      g.rotation.y += (on && !calmo ? 0.5 : 0.08) * dt;
    });
  }

  window.pulsoPlanos = { escolher(i) { sel = i; pintarFaixas(); if (p) p.redesenhar(); } };
}
