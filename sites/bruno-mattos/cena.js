// Bruno Mattos · a coluna: modelo anatômico de consultório (vértebras de osso, discos azulados, suporte de metal
// sobre base de madeira), com as curvas da coluna. Tocar numa região (cervical, torácica, lombar, sacro) acende
// as vértebras dela (evento "bm-regiao"); brunoColuna.marcar(regiao) faz o mesmo pelos botões da página.
import { palco, THREE, calmo, aproxima, luz, textura, corDaPagina } from '../assets/3d/palco.js';

const canvas = document.getElementById('coluna-3d');
const p = palco(canvas, { fov: 30, pos: [7.5, 1.5, 15.5], alvo: [0, -0.2, 0], quadro, tom: true });
const acc = () => getComputedStyle(document.documentElement).getPropertyValue('--acc').trim() || '#1f6f8b';
const pecas = []; // { m, regiao }
let coluna, sel = null, foco = null, giro = -0.5, alvo = -0.5, arr = false, ax = 0, mexeu = 0;

if (p) montar();

function montar() {
  const { cena } = p;
  luz(p, 'studio_small_09', { forca: 1 });
  cena.background = corDaPagina(0xeef2f3);
  const chave = new THREE.DirectionalLight(0xffffff, 2); chave.position.set(-4, 8, 6); chave.castShadow = true;
  chave.shadow.mapSize.set(2048, 2048); Object.assign(chave.shadow.camera, { left: -6, right: 6, top: 7, bottom: -6 }); chave.shadow.bias = -0.0005; cena.add(chave);
  // resina cor de osso, como os modelos anatômicos de consultório
  const osso = () => new THREE.MeshPhysicalMaterial({ color: 0xeee2c9, roughness: 0.45, clearcoat: 0.35, clearcoatRoughness: 0.4, sheen: 0.3 });
  const disco = new THREE.MeshPhysicalMaterial({ color: 0x8fb6c9, roughness: 0.35, transmission: 0, clearcoat: 0.6 });
  coluna = new THREE.Group(); cena.add(coluna);
  // 24 vértebras: 7 cervicais, 12 torácicas, 5 lombares; a coluna faz um S suave
  const regioes = [...Array(7).fill('cervical'), ...Array(12).fill('toracica'), ...Array(5).fill('lombar')];
  let y = 4.2;
  regioes.forEach((reg, i) => {
    const t = i / 23, r = reg === 'cervical' ? 0.24 : reg === 'toracica' ? 0.3 + t * 0.12 : 0.46;
    const h = reg === 'cervical' ? 0.16 : reg === 'toracica' ? 0.2 : 0.27;
    const z = 0.35 * Math.sin(t * Math.PI * 2.2 - 0.6); // curvas: lordose, cifose, lordose
    const v = new THREE.Group(); v.position.set(0, y, z);
    const mat = osso();
    const corpo = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.05, h, 28), mat); corpo.castShadow = true; v.add(corpo);
    const espinho = new THREE.Mesh(new THREE.BoxGeometry(0.09, h * 0.7, r * 1.4), mat); espinho.position.set(0, -h * 0.25, -r * 1.25); espinho.rotation.x = 0.5; espinho.castShadow = true; v.add(espinho);
    [-1, 1].forEach((l) => { const tr = new THREE.Mesh(new THREE.BoxGeometry(r * 1.1, h * 0.45, 0.1), mat); tr.position.set(l * r * 1.05, 0, -r * 0.55); tr.rotation.y = l * 0.35; v.add(tr); });
    [corpo, espinho].forEach((m) => { m.userData.regiao = reg; });
    coluna.add(v); pecas.push({ m: mat, regiao: reg, alvos: [corpo, espinho] });
    if (i < 23) { const d = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.95, r * 0.95, 0.07, 28), disco); d.position.set(0, y - h / 2 - 0.04, z); coluna.add(d); }
    y -= h + 0.09;
  });
  // sacro e cóccix
  const sacroMat = osso();
  const sacro = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.1, 28), sacroMat); sacro.rotation.x = Math.PI + 0.35; sacro.position.set(0, y - 0.45, -0.15); sacro.castShadow = true; sacro.userData.regiao = 'sacro';
  coluna.add(sacro); pecas.push({ m: sacroMat, regiao: 'sacro', alvos: [sacro] });
  // suporte: haste de metal e base de madeira
  const metal = new THREE.MeshStandardMaterial({ color: 0xb8bcc0, metalness: 1, roughness: 0.25 });
  const haste = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 6.4), metal); haste.position.set(0, 0.9, -0.95); coluna.add(haste);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.7, 0.25, 64), new THREE.MeshStandardMaterial({ ...textura('oak_veneer_01', 2, 2) }));
  base.position.y = y - 1.2; base.receiveShadow = base.castShadow = true; coluna.add(base);
  coluna.position.y = -0.4;

  const alvos = pecas.flatMap((x) => x.alvos);
  canvas.addEventListener('pointerdown', (e) => { arr = true; ax = e.clientX; mexeu = 0; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => {
    if (arr) { const d = (e.clientX - ax) * 0.01; mexeu += Math.abs(d); alvo += d; ax = e.clientX; p.redesenhar(); return; }
    const h = p.tocar(alvos); foco = h ? h.object.userData.regiao : null; canvas.style.cursor = foco ? 'pointer' : 'grab'; p.redesenhar();
  });
  canvas.addEventListener('pointerup', () => { arr = false; if (mexeu < 0.04) { const h = p.tocar(alvos); if (h) { sel = h.object.userData.regiao; dispatchEvent(new CustomEvent('bm-regiao', { detail: sel })); p.redesenhar(); } } });
}

function quadro(t, dt) {
  if (!arr && !calmo && !sel) alvo = -0.5 + Math.sin(t * 0.3) * 0.6;
  giro = aproxima(giro, alvo, dt, 4); coluna.rotation.y = giro;
  const cor = new THREE.Color(acc());
  pecas.forEach(({ m, regiao }) => {
    const on = regiao === sel, mira = regiao === foco;
    // a resina clara ganha a cor da clínica na região escolhida (o brilho sozinho some no branco)
    const alvoCor = on ? new THREE.Color(0xeee2c9).lerp(cor, 0.7) : mira ? new THREE.Color(0xeee2c9).lerp(cor, 0.3) : new THREE.Color(0xeee2c9);
    m.color.lerp(alvoCor, 1 - Math.exp(-9 * dt));
  });
}

window.brunoColuna = { marcar(r) { sel = r; alvo = r === 'cervical' ? 0.3 : -0.5; if (p) p.redesenhar(); } };
