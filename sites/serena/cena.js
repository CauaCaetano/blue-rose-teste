// Atelier Serena · a estação: cadeira de salão, espelho de moldura dourada e planta (modelos reais da Poly Haven)
// sobre piso de taco, com luz de café. O espelho mostra o tempo de cadeira e o valor do orçamento; no chão, um arco
// dourado em volta da cadeira cresce conforme as horas marcadas. serenaEstacao.orcar(min, preco) atualiza tudo.
import { palco, THREE, calmo, aproxima, luz, modelo, textura, encaixar } from '../assets/3d/palco.js';

const canvas = document.getElementById('estacao-3d');
const p = palco(canvas, { fov: 32, pos: [3.2, 3.2, 8.4], alvo: [0, 2, -0.6], quadro, tom: true });
const acc = () => getComputedStyle(document.documentElement).getPropertyValue('--acc').trim() || '#b39257';
let cadeira = null, arco = null, letreiro = null, tela, giro = 0, minutos = 0, minAlvo = 0, preco = 0, ang = 0, angAlvo = 0;

if (p) {
  const { cena } = p;
  luz(p, 'comfy_cafe', { forca: 0.55 });
  cena.background = new THREE.Color(0x171512);
  cena.fog = new THREE.Fog(0x171512, 12, 22);
  const foco = new THREE.SpotLight(0xffe2b8, 60, 14, 0.6, 0.5, 1.4); foco.position.set(1.5, 7.5, 3); foco.target.position.set(0, 1, 0);
  foco.castShadow = true; foco.shadow.mapSize.set(2048, 2048); foco.shadow.bias = -0.0004; cena.add(foco, foco.target);
  const preenche = new THREE.DirectionalLight(0xc9d4ff, 0.35); preenche.position.set(-5, 4, 4); cena.add(preenche);
  const piso = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ ...textura('herringbone_parquet', 9, 9), color: 0x8a7462 }));
  piso.rotation.x = -Math.PI / 2; piso.receiveShadow = true; cena.add(piso);
  const parede = new THREE.Mesh(new THREE.PlaneGeometry(30, 12), new THREE.MeshStandardMaterial({ color: 0x2b2a24, roughness: 0.95 })); parede.position.set(0, 6, -2.4); parede.receiveShadow = true; cena.add(parede);
  // bancada de madeira com tampo claro
  const bancada = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.12, 0.9), new THREE.MeshStandardMaterial({ ...textura('oak_veneer_01', 2, 0.5) }));
  bancada.position.set(0, 1.7, -1.95); bancada.castShadow = bancada.receiveShadow = true; cena.add(bancada);
  [-1.6, 1.6].forEach((x) => { const pe = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.7, 0.8), new THREE.MeshStandardMaterial({ color: 0xb39257, metalness: 1, roughness: 0.3 })); pe.position.set(x, 0.85, -1.95); pe.castShadow = true; cena.add(pe); });
  // arco do tempo: trilha apagada + parte acesa (0 a 4 horas = volta inteira)
  const trilha = new THREE.Mesh(new THREE.RingGeometry(1.75, 1.82, 96), new THREE.MeshBasicMaterial({ color: 0x3a342a, transparent: true, opacity: 0.8 }));
  trilha.rotation.x = -Math.PI / 2; trilha.position.y = 0.012; cena.add(trilha);
  arco = new THREE.Mesh(new THREE.RingGeometry(1.72, 1.85, 96, 1, 0, 0.001), new THREE.MeshBasicMaterial({ color: new THREE.Color(acc()), side: THREE.DoubleSide }));
  arco.rotation.x = -Math.PI / 2; arco.rotation.z = Math.PI / 2; arco.position.y = 0.014; cena.add(arco);
  addEventListener('br-cor', () => { arco.material.color.set(acc()); desenharLetreiro(); });

  modelo('BarberShopChair_01').then((o) => { cadeira = encaixar(o, 3); cena.add(cadeira); p.redesenhar(); }).catch(() => {});
  modelo('ornate_mirror_01').then((o) => {
    const e = encaixar(o, 2.7); e.position.set(0, 2.05, -2.38); cena.add(e);
    // o orçamento escrito no espelho, como um recado de batom
    tela = document.createElement('canvas'); tela.width = 512; tela.height = 512;
    letreiro = new THREE.Mesh(new THREE.PlaneGeometry(1.55, 1.55), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(tela), transparent: true, depthWrite: false }));
    letreiro.position.set(0, 3.4, -2.28); cena.add(letreiro); desenharLetreiro(); p.redesenhar();
  }).catch(() => {});
  modelo('potted_plant_02').then((o) => { const pl = encaixar(o, 2.2); pl.position.set(-2.7, 0, -1.6); cena.add(pl); p.redesenhar(); }).catch(() => {});
  if (document.fonts) document.fonts.ready.then(desenharLetreiro);
}

function desenharLetreiro() {
  if (!tela) return;
  const c = tela.getContext('2d'); c.clearRect(0, 0, 512, 512);
  const h = Math.floor(minAlvo / 60), m = minAlvo % 60;
  c.textAlign = 'center'; c.fillStyle = acc();
  c.font = '500 44px "Cormorant Garamond", serif'; c.fillText(minAlvo ? 'tempo de cadeira' : 'escolha os serviços', 256, 190);
  c.font = '600 120px "Cormorant Garamond", serif'; c.fillText(minAlvo ? (h ? h + 'h' + (m ? String(m).padStart(2, '0') : '') : m + ' min') : '—', 256, 310);
  if (preco) { c.font = '500 52px "Cormorant Garamond", serif'; c.fillText('R$ ' + preco.toLocaleString('pt-BR'), 256, 390); }
  letreiro.material.map.needsUpdate = true; if (p) p.redesenhar();
}

function quadro(t, dt) {
  if (!calmo) giro = aproxima(giro, p.ponteiro.dentro ? p.ponteiro.x * 0.3 : Math.sin(t * 0.2) * 0.12, dt, 3);
  p.camera.position.set(3.2 * Math.cos(giro) + 8.4 * Math.sin(giro), 3.2, 8.4 * Math.cos(giro) - 3.2 * Math.sin(giro)); p.camera.lookAt(0, 2, -0.6);
  minutos = aproxima(minutos, minAlvo, dt, 4);
  arco.geometry.dispose(); arco.geometry = new THREE.RingGeometry(1.72, 1.85, 96, 1, 0, Math.max(0.001, Math.min(1, minutos / 240)) * Math.PI * 2);
  ang = aproxima(ang, angAlvo, dt, 3); if (cadeira) cadeira.rotation.y = ang;
}

window.serenaEstacao = {
  orcar(min, valor) { if (min !== minAlvo) angAlvo += (min > minAlvo ? 1 : -1) * Math.PI / 6; minAlvo = min; preco = valor; desenharLetreiro(); if (p) p.redesenhar(); },
};
