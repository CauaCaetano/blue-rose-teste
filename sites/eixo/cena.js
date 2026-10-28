// Eixo · o tênis de corrida real em 3D (modelo fotorrealista da Shopify, CC BY 4.0, via Khronos) com as cores dele,
// e o mapa de pressão dos pés como sai na tela da plataforma: vista de cima, sensor por sensor, do azul ao vermelho.
// O tipo de pisada muda o mapa; "ver o passo" anima o apoio do calcanhar até a ponta. Números no evento "eixo-dados".
import { vitrine } from '../assets/3d/vitrine.js';

const caixa = document.getElementById('mapa-pes');
const NOMES = { midnight: 'Meia-noite', beach: 'Praia', street: 'Rua' };
vitrine(document.getElementById('tenis-3d'), { arquivo: 'MaterialsVariantsShoe/MaterialsVariantsShoe.glb', medida: 1.2, distancia: 2.5, altura: 0.22, giro: 1.25, inclinacao: 0.12 }).then((v) => {
  const grupo = document.querySelector('.cores-tenis'); if (!v.variantes.length) return;
  grupo.innerHTML = v.variantes.map((n, i) => '<button type="button" data-v="' + i + '" aria-pressed="' + (i === 0) + '">' + (NOMES[n] || n) + '</button>').join('');
  grupo.addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (!b) return; grupo.querySelectorAll('[data-v]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); v.variante(+b.dataset.v); });
});
const COL = 28, LIN = 64;
const g = (x, m, s) => Math.exp(-((x - m) ** 2) / (2 * s * s));
const TIPOS = {
  neutra: { cal: 1, medM: 0, medL: 0.38, mt1: 0.8, mt5: 0.62, hal: 0.62, arco: 0.42, desvio: 0 },
  pronada: { cal: 1, medM: 0.55, medL: 0.3, mt1: 1.05, mt5: 0.4, hal: 0.95, arco: 0.75, desvio: -0.08 },
  supinada: { cal: 0.95, medM: 0, medL: 0.75, mt1: 0.35, mt5: 1.05, hal: 0.3, arco: 0.3, desvio: 0.1 },
  plano: { cal: 0.9, medM: 0.7, medL: 0.65, mt1: 0.8, mt5: 0.7, hal: 0.6, arco: 1, desvio: -0.03 },
  cavo: { cal: 1.2, medM: 0, medL: 0.12, mt1: 1, mt5: 0.85, hal: 0.4, arco: 0.16, desvio: 0.02 },
};
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
const CORES = [[0, [42, 75, 215]], [0.25, [31, 166, 201]], [0.45, [59, 191, 106]], [0.65, [242, 212, 60]], [0.82, [240, 138, 42]], [1, [217, 47, 47]]];
function rampa(p) {
  for (let i = 1; i < CORES.length; i++) if (p <= CORES[i][0]) { const [a, ca] = CORES[i - 1], [b, cb] = CORES[i], k = (p - a) / (b - a); return 'rgb(' + ca.map((v, j) => Math.round(v + (cb[j] - v) * k)).join(',') + ')'; }
  return 'rgb(217,47,47)';
}
const tela = document.createElement('canvas'); tela.className = 'mapa-tela'; tela.width = 360; tela.height = 380; tela.setAttribute('aria-hidden', 'true');
caixa.appendChild(tela);
const ctx = tela.getContext('2d'), calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
let tipo = 'neutra', andando = false, base = [];
function calcular() {
  const t = TIPOS[tipo]; let tot = 0, med = 0, tras = 0, pico = 0; base = [];
  for (let j = 0; j < LIN; j++) for (let i = 0; i < COL; i++) {
    const u = (i + 0.5) / COL, v = (j + 0.5) / LIN, pr = dentro(u, v, t) ? Math.min(pressao(u, v, t), 1.25) : -1;
    base.push(pr); if (pr > 0) { tot += pr; if (u < 0.5) med += pr; if (v < 0.5) tras += pr; pico = Math.max(pico, pr); }
  }
  dispatchEvent(new CustomEvent('eixo-dados', { detail: { tipo, medial: Math.round(med / tot * 100), retro: Math.round(tras / tot * 100), pico: Math.round(pico * 186) } }));
}
function desenhar(tm) {
  ctx.clearRect(0, 0, tela.width, tela.height);
  const w = 5.2, h = 5.2, ciclo = (tm / 1000 * 0.55) % 1;
  [-1, 1].forEach((lado) => {
    const x0 = lado < 0 ? 30 : 190, y0 = 20;
    base.forEach((pr, k) => {
      if (pr <= 0) return;
      const i = k % COL, j = Math.floor(k / COL), v = (j + 0.5) / LIN;
      let p = pr;
      if (andando && !calmo) { const f = (ciclo + (lado < 0 ? 0.5 : 0)) % 1; p = Math.min(pr * g(v, f * 1.25 - 0.1, 0.22) * 1.25, 1.25); }
      ctx.fillStyle = p < 0.03 ? 'rgba(255,255,255,.12)' : rampa(p / 1.15);
      const ix = lado < 0 ? COL - 1 - i : i; // o pé esquerdo é o espelho do direito
      ctx.fillRect(x0 + ix * w, y0 + (LIN - 1 - j) * h, w - 0.8, h - 0.8);
    });
  });
  if (andando && !calmo) requestAnimationFrame(desenhar);
}
calcular(); desenhar(0);
window.eixoPlaca = {
  tipo(k) { if (!TIPOS[k]) return; tipo = k; calcular(); if (!andando) desenhar(0); },
  andar(sim) { andando = sim; requestAnimationFrame(desenhar); },
};
