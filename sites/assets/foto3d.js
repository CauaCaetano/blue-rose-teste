// Foto 3D dos sites de exemplo (28/10/2026): foto real + mapa de profundidade (gerado pelo Depth Anything).
// O WebGL desloca cada ponto da foto conforme a distância dele: com o mouse, o dedo ou a rolagem, a cena ganha
// volume de verdade (o que está perto anda mais que o fundo). Troca de foto com dissolução de frente para trás.
// Uso: const f = foto3d(contêiner, { foto, prof, forca }); f.trocar(foto, prof); f.foco(x, y) aponta para um ponto (0 a 1).
// Sem WebGL ou com "reduzir movimento", mostra a foto parada (<img>), e o resto do site funciona igual.
const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;

const VS = 'attribute vec2 p; varying vec2 uv; void main(){ uv = p * .5 + .5; uv.y = 1. - uv.y; gl_Position = vec4(p, 0., 1.); }';
const FS = `precision mediump float;
varying vec2 uv;
uniform sampler2D f0, p0, f1, p1;
uniform vec2 olhar, escala; uniform float forca, mistura, zoom;
vec2 desloca(sampler2D prof, vec2 c) {
  // seis passos de busca: o deslocamento usa a profundidade do lugar para onde o ponto foi (menos rasgo nas bordas)
  vec2 o = c;
  for (int i = 0; i < 6; i++) { float d = texture2D(prof, o).r; o = c + olhar * (d - .45) * forca; }
  return o;
}
void main() {
  vec2 c = (uv - .5) * escala / zoom + .5; // recorte tipo cover
  vec2 a = desloca(p0, c), b = desloca(p1, c);
  vec4 ca = texture2D(f0, a), cb = texture2D(f1, b);
  float perto = texture2D(p1, b).r;
  float limiar = 1.2 - mistura * 1.5;
  float m = smoothstep(limiar, limiar + .25, perto); // o que está perto aparece primeiro
  gl_FragColor = mix(ca, cb, m);
}`;

function carregar(url) { return new Promise((ok, erro) => { const i = new Image(); i.decoding = 'async'; i.onload = () => ok(i); i.onerror = erro; i.src = url; }); }

export function foto3d(caixa, { foto, prof, forca = 0.02, alt = '' }) {
  const img = document.createElement('img');
  img.src = foto; img.alt = alt; img.className = 'f3d-img'; img.decoding = 'async';
  caixa.classList.add('f3d'); caixa.appendChild(img);
  const api = { trocar: async (f) => { img.src = f; }, foco() {}, pronto: carregar(foto).catch(() => null) };
  if (calmo) return api;
  const tela = document.createElement('canvas'); tela.className = 'f3d-tela'; tela.setAttribute('aria-hidden', 'true');
  const gl = tela.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false });
  if (!gl) return api;
  caixa.appendChild(tela);

  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { tela.remove(); return api; }
  gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const lp = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 0, 0);
  const U = (n) => gl.getUniformLocation(pr, n);
  const tex = (unid, el) => {
    const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unid); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, el); return t;
  };
  const por = (unid, t) => { gl.activeTexture(gl.TEXTURE0 + unid); gl.bindTexture(gl.TEXTURE_2D, t); };
  ['f0', 'p0', 'f1', 'p1'].forEach((n, i) => gl.uniform1i(U(n), i));
  let par = null, cur = null, aspecto = 1.5, mistura = 1, mx = 0, my = 0, ax = 0, ay = 0, dentro = false, alvoFoco = null, visivel = true, ult = 0, rolar = 0;

  const ajustar = () => { const r = caixa.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2); tela.width = Math.round(r.width * dpr); tela.height = Math.round(r.height * dpr); gl.viewport(0, 0, tela.width, tela.height); };
  new ResizeObserver(ajustar).observe(caixa); ajustar();
  new IntersectionObserver(([e]) => { visivel = e.isIntersecting; if (visivel) pedir(); }).observe(caixa);
  caixa.addEventListener('pointermove', (e) => { const r = caixa.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width * 2 - 1; my = (e.clientY - r.top) / r.height * 2 - 1; dentro = true; alvoFoco = null; pedir(); });
  caixa.addEventListener('pointerleave', () => { dentro = false; pedir(); });
  addEventListener('deviceorientation', (e) => { if (e.gamma == null || dentro) return; mx = Math.max(-1, Math.min(1, e.gamma / 25)); my = Math.max(-1, Math.min(1, (e.beta - 45) / 25)); pedir(); }, { passive: true });
  addEventListener('scroll', () => { const r = caixa.getBoundingClientRect(); rolar = Math.max(-1, Math.min(1, (r.top + r.height / 2 - innerHeight / 2) / innerHeight)); pedir(); }, { passive: true });

  let quadro = 0;
  function pedir() { if (!quadro && visivel) quadro = requestAnimationFrame(passo); }
  function passo(t) {
    quadro = 0; const dt = Math.min(0.05, (t - (ult || t)) / 1000); ult = t;
    let tx = mx, ty = my;
    if (alvoFoco) { tx = alvoFoco[0] * 2 - 1; ty = alvoFoco[1] * 2 - 1; }
    else if (!dentro) { tx = Math.sin(t / 2600) * 0.45; ty = Math.cos(t / 3400) * 0.25 + rolar * 0.6; } // respira sozinha
    const k = 1 - Math.exp(-dt * 5); ax += (tx - ax) * k; ay += (ty - ay) * k;
    if (mistura < 1) mistura = Math.min(1, mistura + dt / 1.1);
    const ac = tela.width / Math.max(1, tela.height);
    gl.uniform2f(U('escala'), ac > aspecto ? 1 : ac / aspecto, ac > aspecto ? aspecto / ac : 1);
    gl.uniform2f(U('olhar'), -ax, -ay); gl.uniform1f(U('forca'), forca); gl.uniform1f(U('mistura'), mistura); gl.uniform1f(U('zoom'), 1 + forca * 1.6);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    pedir(); // a foto respira sempre que está na tela
  }

  async function trocar(f, p) {
    const [a, b] = await Promise.all([carregar(f), carregar(p)]);
    aspecto = a.naturalWidth / a.naturalHeight;
    const novo = [tex(2, a), tex(3, b)];
    if (!par) { par = [tex(0, a), tex(1, b)]; mistura = 1; por(2, novo[0]); por(3, novo[1]); }
    else {
      // a foto que estava na frente (unidades 2 e 3) vira a de trás (0 e 1); a nova entra na frente
      if (par !== cur) par.forEach((t) => gl.deleteTexture(t));
      par = cur; por(0, par[0]); por(1, par[1]); por(2, novo[0]); por(3, novo[1]); mistura = 0;
    }
    cur = novo; img.src = f; caixa.classList.add('f3d-viva'); pedir();
  }
  api.pronto = trocar(foto, prof).catch(() => { tela.remove(); });
  api.trocar = (f, p) => trocar(f, p).catch(() => {});
  api.foco = (x, y) => { alvoFoco = x == null ? null : [x, y]; pedir(); };
  return api;
}
