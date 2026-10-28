// Castro Lemos · a rede: um globo de nós e ligações (a internet onde o problema aconteceu).
// Sete nós têm nome: você, banco, plataforma, empresa, cartório, ANPD e Justiça.
// O diagnóstico chama castroRede.rota([...]) e o caminho jurídico do caso acende na rede.
import { palco, THREE, calmo, aproxima } from '../assets/3d/palco.js';

const canvas = document.getElementById('rede-3d');
const modo = canvas.dataset.modo || 'inteira'; // "faixa" nas páginas internas: só a rede, menor e sem rótulos
const p = palco(canvas, { fov: 38, pos: [0, 0, modo === 'faixa' ? 7.2 : 9.4], quadro, claro: false });
const acc = () => getComputedStyle(document.documentElement).getPropertyValue('--acc').trim() || '#3df2c0';

const NOMES = { voce: 'Você', banco: 'Banco', plataforma: 'Plataforma', empresa: 'Empresa', cartorio: 'Cartório (prova)', anpd: 'ANPD', justica: 'Justiça' };
const ESPECIAIS = { voce: [-0.15, 0.2, 1], banco: [0.85, 0.45, 0.3], plataforma: [-0.8, 0.55, 0.1], empresa: [0.55, -0.7, 0.45], cartorio: [-0.6, -0.55, 0.55], anpd: [0.2, 0.95, -0.25], justica: [0.95, -0.15, -0.3] };
const R = 2.6;
let globo, nos = [], pontos, linhas, pacotes = [], rota = null, rotaMat, marcos = {}, rotulos = {}, giro = { y: 0, x: 0.15, vy: 0.08, arrastando: false, ax: 0, ay: 0 };

if (p) montar();

function montar() {
  const { cena } = p;
  globo = new THREE.Group(); cena.add(globo);
  // nós espalhados pela esfera (espiral de Fibonacci com um pouco de ruído)
  const N = modo === 'faixa' ? 120 : 190, pos = [];
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), a = i * 2.39996;
    const v = new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r).multiplyScalar(R * (0.96 + Math.random() * 0.08));
    nos.push(v); pos.push(v.x, v.y, v.z);
  }
  const gp = new THREE.BufferGeometry(); gp.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  pontos = new THREE.Points(gp, new THREE.PointsMaterial({ color: 0x9fb6d8, size: 0.05, transparent: true, opacity: 0.75 }));
  globo.add(pontos);
  // cada nó liga nos 3 mais próximos
  const seg = [], viz = nos.map(() => []);
  nos.forEach((a, i) => {
    nos.map((b, j) => [j, a.distanceToSquared(b)]).filter(([j]) => j !== i).sort((x, y) => x[1] - y[1]).slice(0, 3).forEach(([j]) => {
      if (i < j) { seg.push(a.x, a.y, a.z, nos[j].x, nos[j].y, nos[j].z); viz[i].push(j); viz[j].push(i); }
    });
  });
  const gl = new THREE.BufferGeometry(); gl.setAttribute('position', new THREE.Float32BufferAttribute(seg, 3));
  linhas = new THREE.LineSegments(gl, new THREE.LineBasicMaterial({ color: 0x4a6a96, transparent: true, opacity: 0.32 }));
  globo.add(linhas);
  // tráfego: pacotes andando de nó em nó
  const pm = new THREE.MeshBasicMaterial({ color: 0xcfe3ff });
  for (let k = 0; k < (modo === 'faixa' ? 14 : 26); k++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), pm);
    const de = Math.floor(Math.random() * N);
    pacotes.push({ m, de, para: viz[de][0] ?? de, t: Math.random(), v: 0.4 + Math.random() * 0.6, viz });
    globo.add(m);
  }
  // núcleo escuro para dar volume
  globo.add(new THREE.Mesh(new THREE.SphereGeometry(R * 0.93, 48, 48), new THREE.MeshBasicMaterial({ color: 0x0a1424, transparent: true, opacity: 0.55 })));

  if (modo !== 'faixa') {
    const caixa = document.createElement('div'); caixa.className = 'rotulos'; canvas.parentElement.appendChild(caixa);
    Object.entries(ESPECIAIS).forEach(([k, d]) => {
      const v = new THREE.Vector3(...d).normalize().multiplyScalar(R * 1.02);
      const m = new THREE.Mesh(new THREE.SphereGeometry(k === 'voce' ? 0.11 : 0.08, 20, 20), new THREE.MeshBasicMaterial({ color: k === 'voce' ? 0xff4d5e : 0xe6edf7 }));
      m.position.copy(v); globo.add(m); marcos[k] = m;
      const halo = new THREE.Mesh(new THREE.RingGeometry(0.14, 0.17, 32), new THREE.MeshBasicMaterial({ color: k === 'voce' ? 0xff4d5e : 0xe6edf7, transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
      halo.position.copy(v); halo.lookAt(v.clone().multiplyScalar(2)); globo.add(halo); m.userData.halo = halo;
      const s = document.createElement('span'); s.textContent = NOMES[k]; s.dataset.no = k; caixa.appendChild(s); rotulos[k] = s;
    });
  }
  rotaMat = new THREE.MeshBasicMaterial({ color: acc() });
  addEventListener('br-cor', () => { rotaMat.color.set(acc()); p.redesenhar(); });

  // arrastar para girar
  canvas.addEventListener('pointerdown', (e) => { giro.arrastando = true; giro.ax = e.clientX; giro.ay = e.clientY; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => { if (!giro.arrastando) return; giro.y += (e.clientX - giro.ax) * 0.006; giro.x = Math.max(-0.8, Math.min(0.8, giro.x + (e.clientY - giro.ay) * 0.004)); giro.ax = e.clientX; giro.ay = e.clientY; p.redesenhar(); });
  addEventListener('pointerup', () => { giro.arrastando = false; });
}

// curva entre dois marcos, por fora da esfera
function arco(a, b) {
  const meio = a.clone().add(b).multiplyScalar(0.5); const alt = R * 1.25 + a.distanceTo(b) * 0.25;
  meio.normalize().multiplyScalar(alt);
  return new THREE.QuadraticBezierCurve3(a, meio, b);
}

function quadro(t, dt) {
  if (!giro.arrastando && !calmo) giro.y += giro.vy * dt;
  globo.rotation.y = aproxima(globo.rotation.y, giro.y, dt, 8);
  globo.rotation.x = aproxima(globo.rotation.x, giro.x, dt, 8);
  // na faixa das páginas internas o globo fica à direita do título
  if (modo === 'faixa') globo.position.x = p.camera.aspect > 1.6 ? 3.4 : 1.2;
  pacotes.forEach((k) => {
    k.t += k.v * dt;
    if (k.t >= 1) { k.t = 0; k.de = k.para; const vs = k.viz[k.de]; k.para = vs.length ? vs[Math.floor(Math.random() * vs.length)] : k.de; }
    k.m.position.lerpVectors(nos[k.de], nos[k.para], k.t);
  });
  Object.values(marcos).forEach((m, i) => { const s = 1 + 0.18 * Math.sin(t * 2.2 + i); m.userData.halo.scale.setScalar(s); });
  if (rota) {
    rota.prog = Math.min(1, rota.prog + dt * 0.55);
    rota.linha.geometry.setDrawRange(0, Math.floor((rota.total * rota.prog) / 6) * 6);
    rota.faisca.position.copy(rota.curva.getPointAt(rota.prog));
  }
  // rótulos HTML acompanham os marcos (somem atrás do globo)
  const w = canvas.clientWidth, h = canvas.clientHeight, v = new THREE.Vector3(), cam = p.camera.position.clone();
  Object.entries(rotulos).forEach(([k, s]) => {
    marcos[k].getWorldPosition(v);
    const frente = v.clone().sub(new THREE.Vector3()).dot(cam.clone().sub(v)) > 0;
    v.project(p.camera);
    s.style.transform = `translate(${(v.x * 0.5 + 0.5) * w}px, ${(-v.y * 0.5 + 0.5) * h}px)`;
    s.style.opacity = frente ? 1 : 0.15;
  });
}

window.castroRede = {
  rota(chaves) {
    if (!p || !marcos.voce) return;
    if (rota) { globo.remove(rota.linha); globo.remove(rota.faisca); }
    const pts = [];
    for (let i = 0; i < chaves.length - 1; i++) pts.push(...arco(marcos[chaves[i]].position.clone(), marcos[chaves[i + 1]].position.clone()).getPoints(60));
    // tubo em vez de linha: no WebGL a linha tem sempre 1 pixel
    const curva = new THREE.CatmullRomCurve3(pts);
    const linha = new THREE.Mesh(new THREE.TubeGeometry(curva, pts.length, 0.024, 6, false), rotaMat);
    const faisca = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    globo.add(linha); globo.add(faisca);
    rota = { linha, faisca, curva, total: linha.geometry.index.count, prog: calmo ? 1 : 0 };
    Object.entries(rotulos).forEach(([k, s]) => s.classList.toggle('na-rota', chaves.includes(k)));
    // gira o globo para o caso ficar de frente
    giro.y = -Math.atan2(marcos.voce.position.x, marcos.voce.position.z);
    p.redesenhar();
  },
};
