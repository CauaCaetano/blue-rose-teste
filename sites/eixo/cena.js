// Eixo · plataforma de baropodometria: uma placa preta com milhares de sensores; dentro do contorno dos pés,
// cada sensor sobe e muda de cor (azul → verde → amarelo → vermelho) conforme a pressão. O tipo de pisada muda
// o mapa; "ver o passo" anima o apoio do calcanhar até a ponta. Os números do mapa saem no evento "eixo-dados".
import { palco, THREE, calmo, aproxima, luz, textura, corDaPagina } from '../assets/3d/palco.js';

const canvas = document.getElementById('placa-3d');
const COL = 28, LIN = 64, PASSO = 0.083; // sensores por pé
const g = (x, m, s) => Math.exp(-((x - m) ** 2) / (2 * s * s));
// perfis de pisada: pesos de calcanhar, mediopé medial/lateral, cabeça do 1º e do 5º metatarso, hálux e largura do arco
const TIPOS = {
  neutra: { cal: 1, medM: 0, medL: 0.38, mt1: 0.8, mt5: 0.62, hal: 0.62, arco: 0.42, desvio: 0 },
  pronada: { cal: 1, medM: 0.55, medL: 0.3, mt1: 1.05, mt5: 0.4, hal: 0.95, arco: 0.75, desvio: -0.08 },
  supinada: { cal: 0.95, medM: 0, medL: 0.75, mt1: 0.35, mt5: 1.05, hal: 0.3, arco: 0.3, desvio: 0.1 },
  plano: { cal: 0.9, medM: 0.7, medL: 0.65, mt1: 0.8, mt5: 0.7, hal: 0.6, arco: 1, desvio: -0.03 },
  cavo: { cal: 1.2, medM: 0, medL: 0.12, mt1: 1, mt5: 0.85, hal: 0.4, arco: 0.16, desvio: 0.02 },
};
// u: 0 medial → 1 lateral; v: 0 calcanhar → 1 dedos
function dentro(u, v, t) {
  if (v < 0.015) return false;
  const c = 0.5 + 0.05 * Math.sin(v * Math.PI);
  let med, lat;
  if (v < 0.3) { const w = v < 0.17 ? 0.29 * Math.sqrt(Math.max(0, 1 - ((v - 0.17) / 0.17) ** 2)) : 0.29 + (v - 0.17) / 0.13 * 0.03; med = c - w; lat = c + w; }
  else if (v < 0.62) { lat = c + 0.32; med = c - 0.32 + (1 - t.arco) * 0.58 * Math.sin(Math.PI * (v - 0.3) / 0.32); } // o arco recorta o lado de dentro
  else { const w = 0.32 + 0.1 * Math.min(1, (v - 0.62) / 0.15); med = c - w; lat = c + w; }
  if (u < med || u > lat) return false;
  const x = (u - med) / (lat - med);
  if (v > 0.985 - 0.15 * x ** 1.6) return false; // ponta dos dedos: o dedão é o mais comprido
  if (v > 0.84 && [0.37, 0.55, 0.7, 0.84].some((b) => Math.abs(x - b) < 0.025)) return false; // vãos entre os dedos
  return true;
}
function pressao(u, v, t) {
  const um = u - t.desvio;
  return t.cal * g(v, 0.13, 0.08) * g(um, 0.5, 0.18)
    + (t.medM * g(um, 0.32, 0.1) + t.medL * g(um, 0.72, 0.1)) * g(v, 0.45, 0.1)
    + t.mt1 * g(v, 0.73, 0.06) * g(um, 0.32, 0.09) + t.mt5 * g(v, 0.71, 0.06) * g(um, 0.72, 0.09)
    + 0.55 * (t.mt1 + t.mt5) / 2 * g(v, 0.74, 0.05) * g(um, 0.52, 0.1)
    + t.hal * g(v, 0.93, 0.045) * g(um, 0.3, 0.07) + 0.3 * t.hal * g(v, 0.9, 0.04) * g(um, 0.6, 0.15);
}
const CORES = [[0, 0x2a4bd7], [0.25, 0x1fa6c9], [0.45, 0x3bbf6a], [0.65, 0xf2d43c], [0.82, 0xf08a2a], [1, 0xd92f2f]].map(([p, c]) => [p, new THREE.Color(c)]);
function rampa(p, alvo) {
  if (p <= 0.02) return alvo.set(0x2b3138);
  for (let i = 1; i < CORES.length; i++) if (p <= CORES[i][0]) return alvo.copy(CORES[i - 1][1]).lerp(CORES[i][1], (p - CORES[i - 1][0]) / (CORES[i][0] - CORES[i - 1][0]));
  return alvo.copy(CORES[CORES.length - 1][1]);
}

if (canvas) {
  const p = palco(canvas, { fov: 30, pos: [0, 11.2, 11.2], alvo: [0, 0, 0.3], quadro, tom: true });
  let tipo = 'neutra', andando = false, giro = 0, giroAlvo = 0;
  const sensores = []; // { u, v, lado, alt }
  let malha, cor = new THREE.Color(), m4 = new THREE.Matrix4();

  if (p) {
    const { cena } = p;
    luz(p, 'white_studio_03', { forca: 0.8 });
    cena.background = corDaPagina(0xe9edf1);
    const sol = new THREE.DirectionalLight(0xffffff, 2); sol.position.set(-3, 9, 5); sol.castShadow = true;
    sol.shadow.mapSize.set(2048, 2048); Object.assign(sol.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7 }); sol.shadow.bias = -0.0004; cena.add(sol);
    const chao = new THREE.Mesh(new THREE.CircleGeometry(16, 64), new THREE.MeshStandardMaterial({ color: 0xd3d8dd, roughness: 0.9 })); chao.rotation.x = -Math.PI / 2; chao.position.y = -0.36; chao.receiveShadow = true; cena.add(chao);
    // a placa: corpo de alumínio escovado, tampo de borracha preta e a faixa de LED na borda
    const corpo = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.3, 7.4), new THREE.MeshStandardMaterial({ ...textura('metal_plate', 3, 3), color: 0xaab0b6, metalness: 0.85, roughness: 0.35 }));
    corpo.position.y = -0.2; corpo.castShadow = corpo.receiveShadow = true; cena.add(corpo);
    const tampo = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.06, 6.8), new THREE.MeshStandardMaterial({ ...textura('rubber_tiles', 4, 4), color: 0x23272c, roughness: 0.85 }));
    tampo.position.y = -0.03; tampo.receiveShadow = true; cena.add(tampo);
    const led = new THREE.Mesh(new THREE.BoxGeometry(6.7, 0.02, 0.05), new THREE.MeshBasicMaterial({ color: new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--acc').trim() || '#3d4fd6') }));
    led.position.set(0, -0.12, 3.71); cena.add(led);
    addEventListener('br-cor', () => led.material.color.set(getComputedStyle(document.documentElement).getPropertyValue('--acc').trim()));

    [-1, 1].forEach((lado) => {
      for (let j = 0; j < LIN; j++) for (let i = 0; i < COL; i++) {
        const u = (i + 0.5) / COL, v = (j + 0.5) / LIN;
        sensores.push({ u, v, lado, x: lado * 1.5 + (lado < 0 ? (0.5 - u) : (u - 0.5)) * COL * PASSO * 0.95, z: (0.5 - v) * LIN * PASSO, alt: -1 });
      }
    });
    malha = new THREE.InstancedMesh(new THREE.BoxGeometry(PASSO * 0.82, 1, PASSO * 0.82), new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.05 }), sensores.length);
    malha.castShadow = true; malha.receiveShadow = true; cena.add(malha);
    calcular();
  }

  function calcular() { // mapa do tipo escolhido e números para a página
    const t = TIPOS[tipo]; let tot = 0, med = 0, tras = 0, pico = 0;
    sensores.forEach((s) => { s.base = dentro(s.u, s.v, t) ? Math.min(pressao(s.u, s.v, t), 1.25) : -1; });
    sensores.forEach((s) => { if (s.lado > 0 || s.base < 0) return; const pr = s.base; tot += pr; if (s.u < 0.5) med += pr; if (s.v < 0.5) tras += pr; pico = Math.max(pico, pr); });
    dispatchEvent(new CustomEvent('eixo-dados', { detail: { tipo, medial: Math.round(med / tot * 100), retro: Math.round(tras / tot * 100), pico: Math.round(pico * 186) } }));
  }

  function quadro(t, dt) {
    if (!calmo) giroAlvo = p.ponteiro.dentro ? p.ponteiro.x * 0.3 : Math.sin(t * 0.25) * 0.1;
    giro = aproxima(giro, giroAlvo, dt, 3);
    p.camera.position.set(Math.sin(giro) * 12, 11.2, Math.cos(giro) * 11.2); p.camera.lookAt(0, 0, 0.3);
    if (!malha) return;
    const ciclo = (t * 0.55) % 1;
    sensores.forEach((s, k) => {
      let alvo = s.base;
      if (alvo > 0 && andando && !calmo) { const f = (ciclo + (s.lado < 0 ? 0.5 : 0)) % 1; alvo = Math.min(alvo * g(s.v, f * 1.25 - 0.1, 0.22) * 1.25, 1.25); }
      s.alt = aproxima(s.alt, alvo, dt, andando ? 10 : 5);
      const h = 0.03 + Math.max(0, s.alt) * 0.95, k0 = s.alt < -0.5 ? 0 : 1; // fora do pé o sensor some
      m4.makeScale(k0, h, k0).setPosition(s.x, h / 2, s.z); malha.setMatrixAt(k, m4);
      malha.setColorAt(k, rampa(s.alt < 0 ? 0 : s.alt / 1.15, cor));
    });
    malha.instanceMatrix.needsUpdate = true; malha.instanceColor.needsUpdate = true;
    if (andando) p.redesenhar();
  }

  window.eixoPlaca = {
    tipo(k) { if (!TIPOS[k]) return; tipo = k; if (p) { calcular(); p.redesenhar(); } },
    andar(sim) { andando = sim; if (p) p.redesenhar(); },
  };
}
