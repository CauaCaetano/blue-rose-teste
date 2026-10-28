// Castro Lemos · a perícia: uma placa-mãe de verdade (modelo escaneado do Poly Haven) sob luz de estúdio.
// Sete pontos da placa têm nome (você, banco, plataforma, empresa, cartório, ANPD, Justiça); o diagnóstico chama
// castroRede.rota([...]) e o caminho do caso acende como uma trilha de luz. Uma lupa de verdade segue o mouse.
import { palco, THREE, calmo, aproxima, luz, modelo, encaixar } from '../assets/3d/palco.js';

const canvas = document.getElementById('rede-3d');
const modo = canvas.dataset.modo || 'inteira'; // "faixa" nas páginas internas: só a placa, girando devagar
const p = palco(canvas, { fov: 32, pos: modo === 'faixa' ? [5, 7, 9] : [0, 10.5, 11.5], alvo: [0, 0, 0], quadro, tom: true, claro: false });
const acc = () => getComputedStyle(document.documentElement).getPropertyValue('--acc').trim() || '#3df2c0';

const NOMES = { voce: 'Você', banco: 'Banco', plataforma: 'Plataforma', empresa: 'Empresa', cartorio: 'Cartório (prova)', anpd: 'ANPD', justica: 'Justiça' };
// posições sobre a placa (x, z), num tabuleiro de cerca de 7 × 7
const PONTOS = { voce: [-0.4, 1.4], banco: [2.3, -1.6], plataforma: [-2.4, -1.9], empresa: [2.0, 2.2], cartorio: [-2.3, 1.9], anpd: [0.2, -2.8], justica: [2.9, 0.4] };
let mesa, lupa, rotaMat, rota = null, marcos = {}, rotulos = {}, giro = { y: 0, alvo: 0, arr: false, ax: 0 }, altura = 0.45;

if (p) montar();

function montar() {
  const { cena } = p;
  luz(p, 'studio_kontrast_03', { forca: 1.1 });
  const chave = new THREE.DirectionalLight(0xdfe9ff, 1.6); chave.position.set(-4, 9, 4); chave.castShadow = true;
  chave.shadow.mapSize.set(2048, 2048); Object.assign(chave.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6 }); chave.shadow.bias = -0.0005; cena.add(chave);
  const recorte = new THREE.PointLight(0x3df2c0, 6, 12); recorte.position.set(3, 2, -3); cena.add(recorte);
  mesa = new THREE.Group(); cena.add(mesa);
  // chão escuro que recebe a sombra da placa
  const chao = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: 0x070d18, roughness: 0.9 }));
  chao.rotation.x = -Math.PI / 2; chao.position.y = -0.02; chao.receiveShadow = true; if (modo !== 'faixa') cena.add(chao);

  modelo('circuit_board').then((o) => {
    const g = encaixar(o, 7.2);
    // se a placa vier em pé no arquivo, deita (o maior lado fica no plano da mesa)
    const t = new THREE.Box3().setFromObject(g).getSize(new THREE.Vector3());
    if (t.y > t.z) { g.rotation.x = -Math.PI / 2; const c = new THREE.Box3().setFromObject(g); g.position.y -= c.min.y; g.position.z -= c.getCenter(new THREE.Vector3()).z; }
    altura = new THREE.Box3().setFromObject(g).max.y * 0.55;
    mesa.add(g); posicionarMarcos(); p.redesenhar();
  }).catch(() => canvas.parentElement.classList.add('sem-3d'));

  if (modo !== 'faixa') {
    modelo('magnifying_glass_01').then((o) => { lupa = encaixar(o, 2.2); lupa.rotation.set(-1.1, 0, 0.3); cena.add(lupa); p.redesenhar(); }).catch(() => {});
    const caixa = document.createElement('div'); caixa.className = 'rotulos'; canvas.parentElement.appendChild(caixa);
    Object.keys(PONTOS).forEach((k) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(k === 'voce' ? 0.13 : 0.1, 20, 20), new THREE.MeshStandardMaterial({ color: k === 'voce' ? 0xff4d5e : 0xe6edf7, emissive: k === 'voce' ? 0xff4d5e : 0x5d7ba8, emissiveIntensity: 0.7 }));
      mesa.add(m); marcos[k] = m;
      const s = document.createElement('span'); s.textContent = NOMES[k]; s.dataset.no = k; caixa.appendChild(s); rotulos[k] = s;
    });
    posicionarMarcos();
  }
  rotaMat = new THREE.MeshStandardMaterial({ color: acc(), emissive: acc(), emissiveIntensity: 1.4 });
  addEventListener('br-cor', () => { rotaMat.color.set(acc()); rotaMat.emissive.set(acc()); p.redesenhar(); });

  canvas.addEventListener('pointerdown', (e) => { giro.arr = true; giro.ax = e.clientX; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => { if (!giro.arr) return; giro.alvo = Math.max(-0.9, Math.min(0.9, giro.alvo + (e.clientX - giro.ax) * 0.005)); giro.ax = e.clientX; p.redesenhar(); });
  addEventListener('pointerup', () => { giro.arr = false; });
}

function posicionarMarcos() { Object.entries(marcos).forEach(([k, m]) => m.position.set(PONTOS[k][0], altura + 0.12, PONTOS[k][1])); }

function quadro(t, dt) {
  // na faixa, a placa fica à direita do título
  if (modo === 'faixa') { mesa.position.x = p.camera.aspect > 1.6 ? 5.5 : 2; if (!calmo) mesa.rotation.y += dt * 0.12; return; }
  if (!giro.arr && !calmo && !rota) giro.alvo = Math.sin(t * 0.2) * 0.25;
  giro.y = aproxima(giro.y, giro.alvo, dt, 5); mesa.rotation.y = giro.y;
  // lupa: segue o mouse sobre a placa (ou passeia sozinha)
  if (lupa) {
    const mx = p.ponteiro.dentro ? p.ponteiro.x * 3.4 : Math.sin(t * 0.5) * 2.2, mz = p.ponteiro.dentro ? -p.ponteiro.y * 3 : Math.cos(t * 0.37) * 1.6;
    lupa.position.x = aproxima(lupa.position.x, mx, dt, 5); lupa.position.z = aproxima(lupa.position.z, mz + 0.6, dt, 5);
    lupa.position.y = altura + 1.1 + (calmo ? 0 : Math.sin(t * 1.6) * 0.06);
  }
  if (rota) {
    rota.prog = Math.min(1, rota.prog + dt * 0.5);
    rota.linha.geometry.setDrawRange(0, Math.floor((rota.total * rota.prog) / 6) * 6);
    rota.faisca.position.copy(rota.curva.getPointAt(rota.prog));
  }
  const w = canvas.clientWidth, h = canvas.clientHeight, v = new THREE.Vector3();
  Object.entries(rotulos).forEach(([k, s]) => { marcos[k].getWorldPosition(v); v.project(p.camera); s.style.transform = `translate(${(v.x * 0.5 + 0.5) * w}px, ${(-v.y * 0.5 + 0.5) * h}px)`; });
}

window.castroRede = {
  rota(chaves) {
    if (!p || !marcos.voce) return;
    if (rota) { mesa.remove(rota.linha); mesa.remove(rota.faisca); }
    // trilha em ângulos retos, como as pistas da placa, levemente acima dela
    const pts = [];
    for (let i = 0; i < chaves.length - 1; i++) {
      const a = marcos[chaves[i]].position, b = marcos[chaves[i + 1]].position, y = altura + 0.06;
      pts.push(new THREE.Vector3(a.x, y, a.z), new THREE.Vector3(b.x, y, a.z), new THREE.Vector3(b.x, y, b.z));
    }
    const curva = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.02);
    const linha = new THREE.Mesh(new THREE.TubeGeometry(curva, 220, 0.045, 8, false), rotaMat);
    const faisca = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    mesa.add(linha); mesa.add(faisca);
    rota = { linha, faisca, curva, total: linha.geometry.index.count, prog: calmo ? 1 : 0 };
    Object.entries(rotulos).forEach(([k, s]) => s.classList.toggle('na-rota', chaves.includes(k)));
    giro.alvo = 0; p.redesenhar();
  },
};
