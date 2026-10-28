// Veltria Agenda Essencial · app de celular de quem atende com hora marcada (beleza, barbearia, consultório, aulas,
// pet, serviços em casa...). O tipo de negócio troca a lista de serviços; o resto é igual para todos.
// O dia de trabalho num relógio (8h às 20h, uma volta), horários com sinal por PIX, confirmação no WhatsApp,
// link para a cliente marcar sozinha, lista de espera para encaixe, fichas com retorno sugerido, caixa,
// assistente, painel do dono, configurações e assinatura. Dados de exemplo neste aparelho (?novo recomeça).

const CHAVE = 'veltria-agenda-essencial-v2';
const din = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const t = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const sa = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const uid = () => `g${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
const hh = (h) => `${Math.floor(h)}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}`;
const data = (o) => { const d = new Date(); d.setDate(d.getDate() + o); return d; };
const nomeDia = (o) => (o === 0 ? 'hoje' : o === 1 ? 'amanhã' : o === -1 ? 'ontem' : data(o).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' }));
// link de agendamento da bio: o da empresa no modo conta (conta-nuvem.js expõe veltriaConta), o de exemplo na demonstração
const LINK = `https://bluerose-store.com/agendar/?e=${window.veltriaConta ? window.veltriaConta.espaco : 'demo'}`;
const zap = (tel, m) => `https://wa.me/55${String(tel).replace(/\D/g, '')}?text=${encodeURIComponent(m)}`;
const $ = (s) => document.querySelector(s);

// tipos de negócio: cada um preenche os 6 serviços (nome, minutos, preço, cor, dias para voltar)
const COR = ['#c69c9a', '#8c99b0', '#9a6d6b', '#323d5c', '#4f7d68', '#c9a46a'];
const mod = (nome, l) => ({ nome, servicos: l.map(([n, min, preco, ret], i) => ({ id: 's' + (i + 1), nome: n, min, preco, cor: COR[i], retorno: ret })) });
const MODELOS = {
  geral: mod('Atendimento geral', [['Atendimento 30 min', 30, 80, 30], ['Atendimento 1 hora', 60, 140, 30], ['Avaliação', 45, 120, 60], ['Sessão longa', 120, 260, 30], ['Retorno', 40, 90, 21], ['Visita em domicílio', 60, 160, 30]]),
  beleza: mod('Salão e unhas', [['Manicure', 45, 35, 10], ['Pedicure', 50, 40, 15], ['Mão e pé', 90, 70, 12], ['Alongamento em gel', 120, 160, 21], ['Manutenção do gel', 90, 110, 21], ['Spa dos pés', 60, 75, 30]]),
  barbearia: mod('Barbearia', [['Corte', 30, 45, 20], ['Barba', 30, 35, 15], ['Corte e barba', 50, 70, 20], ['Pigmentação', 40, 50, 30], ['Sobrancelha', 15, 20, 20], ['Platinado', 120, 180, 40]]),
  saude: mod('Consultório e terapias', [['Consulta', 50, 200, 30], ['Retorno', 30, 120, 30], ['Avaliação inicial', 60, 250, 90], ['Sessão de terapia', 50, 180, 7], ['Atendimento online', 50, 160, 7], ['Pacote 4 sessões', 50, 600, 30]]),
  aulas: mod('Aulas e personal', [['Aula individual', 60, 90, 7], ['Aula dupla', 60, 140, 7], ['Aula experimental', 30, 0, 7], ['Treino personal', 60, 110, 3], ['Avaliação física', 45, 120, 90], ['Aula online', 50, 70, 7]]),
  pet: mod('Pet', [['Banho pequeno porte', 60, 55, 15], ['Banho e tosa', 90, 95, 30], ['Tosa higiênica', 40, 45, 30], ['Banho grande porte', 90, 90, 15], ['Hidratação', 30, 40, 30], ['Consulta veterinária', 30, 150, 180]]),
  casa: mod('Serviços em casa', [['Visita técnica', 60, 90, 180], ['Instalação', 120, 220, 365], ['Manutenção', 90, 160, 180], ['Limpeza', 240, 280, 30], ['Orçamento no local', 40, 0, 365], ['Diária', 480, 350, 30]])
};
function inicial() {
  const servicos = MODELOS.geral.servicos.map((x) => ({ ...x }));
  const clientes = [['Carla Menezes', '31988870011', -12, 's3', 0], ['Bruno Rocha', '31988870012', -21, 's5', 0, 180], ['Fernanda Lima', '31988870013', -9, 's1', 1], ['Juliano Prado', '31988870014', -30, 's4', 0], ['Patrícia Souza', '31988870015', -15, 's2', 2], ['Renata Alves', '31988870016', -26, 's5', 0], ['Sueli Martins', '31988870017', -40, 's6', 0, 90], ['Tainá Ribeiro', '31988870018', -6, 's1', 0], ['Vanessa Costa', '31988870019', -18, 's3', 0], ['Diego Freitas', '31988870023', -24, 's1', 0], ['Kelly Antunes', '31988870024', -19, 's3', 1], ['Rose Matos', '31988870025', -35, 's5', 0], ['Aline Prates', '31988870026', -4, 's1', 0]]
    .map(([nome, tel, ultima, serv, faltas, valor]) => ({ id: uid(), nome, tel, ultima, serv, faltas, valor: valor || null }));
  const c = (n) => clientes.find((x) => x.nome.startsWith(n));
  // horários "picados" de propósito (8:40, 10:20, 15:50...): a agenda aceita qualquer minuto
  const ags = [[0, 8 + 40 / 60, 'Carla', 's3', 'feito', 120], [0, 10 + 20 / 60, 'Bruno', 's5', 'confirmado'], [0, 12, 'Tainá', 's1', 'confirmado'], [0, 14, 'Juliano', 's4', 'marcado', 0, 50], [0, 15 + 50 / 60, 'Patrícia', 's2', 'marcado'], [0, 17.5, 'Vanessa', 's3', 'confirmado'], [1, 9, 'Renata', 's5', 'confirmado'], [1, 11 + 10 / 60, 'Fernanda', 's1', 'marcado'], [1, 15, 'Sueli', 's6', 'marcado', 0, 25], [2, 10, 'Carla', 's1', 'marcado'], [2, 13.5, 'Juliano', 's5', 'marcado'], [3, 9.5, 'Bruno', 's3', 'marcado'], [4, 14, 'Tainá', 's4', 'marcado', 0, 50], [-1, 9, 'Fernanda', 's3', 'faltou'], [-1, 13, 'Renata', 's1', 'feito', 80], [-1, 15, 'Sueli', 's2', 'feito', 90]]
    .map(([dia, ini, cli, serv, st, pago = 0, sinal = 0]) => { const k = c(cli); return { id: uid(), dia, ini, cli: k.id, serv, st, pago, valor: k.valor, sinal: sinal ? { valor: sinal, pago: sinal === 25 } : null }; });
  return { studio: 'Espaço Lia Santos', pro: 'Lia Santos', ramo: 'atendimento com hora marcada', tipo: 'geral', passo: 15, pix: '31988870000', abre: 8, fecha: 20, sinalPct: 30, sinalAcima: 100, servicos, clientes, ags, espera: [{ id: uid(), nome: 'Marina Duarte', tel: '31988870020', quer: 'Mão e pé', quando: 'qualquer tarde' }, { id: uid(), nome: 'Lúcia Faria', tel: '31988870021', quer: 'Manicure', quando: 'sábado de manhã' }], pedidos: [{ id: uid(), nome: 'Gabriela Nunes', tel: '31988870022', serv: 'gel', dia: 2, ini: 15.5 }], plano: 'basico', ajudantes: [{ nome: 'Camila (ajudante)', ve: { agenda: true, valores: false, clientes: true } }], assinatura: { valor: 49, status: 'ativa', renova: true, proxima: 9, pagos: [-21, -51, -81] }, conversa: [] };
}
let db = (() => { if (new URLSearchParams(location.search).has('novo')) localStorage.removeItem(CHAVE); try { return JSON.parse(localStorage.getItem(CHAVE)) || inicial(); } catch { return inicial(); } })();
window.veltriaDados = () => db; // modo conta: começar do zero e resumo para a IA
const grava = () => { try { localStorage.setItem(CHAVE, JSON.stringify(db)); } catch { toast('Sem espaço no celular.'); } };
const serv = (id) => db.servicos.find((s) => s.id === id) || db.servicos[0];
const cli = (id) => db.clientes.find((c) => c.id === id) || { nome: '—', tel: '' };
const doDia = (d) => db.ags.filter((a) => a.dia === d && a.st !== 'cancelado').sort((a, b) => a.ini - b.ini);
const fim = (a) => a.ini + serv(a.serv).min / 60;
const preco = (a) => (a.valor != null && a.valor !== '' ? Number(a.valor) : serv(a.serv).preco); // valor combinado vale mais que o da tabela
const ST = { marcado: ['marcado', ''], confirmado: ['confirmou', 'ok'], feito: ['atendida', 'ok'], faltou: ['faltou', 'ru'] };
const estAss = () => { const a = db.assinatura; return a.status === 'vencida' ? 'vencida: pague para continuar' : a.renova ? `ativa · próxima em ${a.proxima} dias` : `cancelada · usa por mais ${a.proxima} dias`; };
let dia = 0, rasc = { serv: 's1', cli: '', dia: 0, ini: null, sinal: false, valor: '' };

function toast(m) { const a = document.createElement('div'); a.className = 'toast'; a.textContent = m; $('#toasts').append(a); setTimeout(() => a.remove(), 3200); }
function folha(html, liga) {
  const v = document.createElement('div'); v.className = 'veu'; v.innerHTML = `<div class="folha" role="dialog" aria-modal="true">${html}</div>`;
  const antes = document.activeElement; document.body.append(v);
  const fecha = () => { v.remove(); antes?.focus?.(); };
  v.addEventListener('click', (e) => { if (e.target === v || e.target.closest('[data-fecha]')) fecha(); });
  v.addEventListener('keydown', (e) => { if (e.key === 'Escape') fecha(); });
  setTimeout(() => (v.querySelector('input, select') || v.querySelector('button'))?.focus(), 40);
  liga?.(v.querySelector('.folha'), fecha);
}
// horários livres do dia para um serviço, no intervalo escolhido em Configurações; dá para digitar qualquer minuto
const ocupado = (d, h, min, menos) => doDia(d).find((a) => a !== menos && h < fim(a) && h + min / 60 > a.ini);
function livres(d, min) { const l = [], p = (db.passo || 30) / 60; for (let h = db.abre; h + min / 60 <= db.fecha + 1e-6; h = Math.round((h + p) * 60) / 60) { if (!doDia(d).some((a) => h < fim(a) && h + min / 60 > a.ini)) l.push(h); } return l; }

// ------------------------------------------------------------------ o relógio
const ang = (h) => ((h % 12) / 12) * 2 * Math.PI - Math.PI / 2;
const pt = (r, a) => [160 + r * Math.cos(a), 160 + r * Math.sin(a)].map((n) => n.toFixed(2));
function fatia(h1, h2, r1, r2) { const a1 = ang(h1), a2 = ang(h2 - 0.001), g = h2 - h1 > 6 ? 1 : 0; const [x1, y1] = pt(r2, a1), [x2, y2] = pt(r2, a2), [x3, y3] = pt(r1, a2), [x4, y4] = pt(r1, a1); return `M${x1} ${y1}A${r2} ${r2} 0 ${g} 1 ${x2} ${y2}L${x3} ${y3}A${r1} ${r1} 0 ${g} 0 ${x4} ${y4}Z`; }
function relogio(d) {
  const l = doDia(d), agora = new Date(), hA = agora.getHours() + agora.getMinutes() / 60, prox = l.find((a) => d > 0 || (d === 0 && a.ini >= hA - 0.25 && a.st !== 'feito')) || null, prev = l.reduce((s, a) => s + preco(a), 0);
  const marcas = Array.from({ length: 12 }, (_, i) => { const h = db.abre + i, [x, y] = pt(146, ang(h)), [a1, b1] = pt(100, ang(h)), [a2, b2] = pt(106, ang(h)); return `<line x1="${a1}" y1="${b1}" x2="${a2}" y2="${b2}" stroke="#d6c5b8" stroke-width="2"/><text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-family="Outfit" font-size="12" fill="#8a8d99">${h}h</text>`; }).join('');
  const arcos = l.map((a) => `<path class="arco" data-ag="${a.id}" d="${fatia(a.ini, fim(a), 108, 136)}" fill="${serv(a.serv).cor}" opacity="${a.st === 'faltou' ? 0.3 : a.st === 'feito' ? 0.55 : 1}" stroke="#f5eee7" stroke-width="2"><title>${hh(a.ini)} ${t(cli(a.cli).nome)} · ${t(serv(a.serv).nome)}</title></path>`).join('');
  const ponteiro = d === 0 && hA >= db.abre && hA <= db.fecha ? (() => { const [x, y] = pt(140, ang(hA)), [x0, y0] = pt(98, ang(hA)); return `<line x1="${x0}" y1="${y0}" x2="${x}" y2="${y}" stroke="#242d46" stroke-width="3" stroke-linecap="round"/><circle cx="${x0}" cy="${y0}" r="4" fill="#242d46"/>`; })() : '';
  return `<div class="relogio"><svg viewBox="0 0 320 320" role="img" aria-label="Relógio do dia com ${l.length} atendimentos"><circle cx="160" cy="160" r="152" fill="#fbf7f3" stroke="#e6dbd1"/><circle cx="160" cy="160" r="122" fill="none" stroke="#ece2d8" stroke-width="28"/>${marcas}${arcos}${ponteiro}</svg>
    <div class="centro">${prox ? `<small>próxima</small><b>${hh(prox.ini)}</b><span>${t(cli(prox.cli).nome.split(' ')[0])} · ${t(serv(prox.serv).nome)}</span>` : l.length ? '<small>dia encerrado</small><b>✓</b>' : '<small>dia livre</small><b>—</b>'}<span style="margin-top:4px">${l.length} horário(s) · ${din(prev)}</span></div></div>`;
}

// ------------------------------------------------------------------ telas
const T = {
  dia() {
    const l = doDia(dia), usados = [...new Set(l.map((a) => a.serv))];
    return `<div class="dias" role="group" aria-label="Escolher o dia">${Array.from({ length: 8 }, (_, i) => i - 1).map((o) => `<button type="button" data-dia="${o}" aria-pressed="${o === dia}"><small>${data(o).toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</small><b>${data(o).getDate()}</b>${doDia(o).length ? '<i></i>' : ''}</button>`).join('')}</div>
      ${relogio(dia)}<div class="legenda-c">${usados.map((s) => `<span style="--c:${serv(s).cor}">${t(serv(s).nome)}</span>`).join('')}</div>
      <h2>${nomeDia(dia)[0].toUpperCase() + nomeDia(dia).slice(1)}</h2><div class="cartao">${l.map((a) => { const c = cli(a.cli), s = serv(a.serv); return `<div class="hora" data-ag="${a.id}" role="button" tabindex="0" style="position:relative"><span class="h">${hh(a.ini)}</span><span><b>${t(c.nome)}</b><small>${t(s.nome)} · ${s.min} min · ${din(preco(a))}${a.sinal ? ` · sinal ${din(a.sinal.valor)} ${a.sinal.pago ? 'pago' : 'pendente'}` : ''}</small></span><span class="selo ${ST[a.st][1]}">${ST[a.st][0]}</span></div>`; }).join('') || '<p class="livre">Nenhum horário. Toque no + para marcar.</p>'}</div>
      ${dia >= 0 && db.espera.length ? `<div class="cartao"><b>${db.espera.length} cliente(s) na lista de espera</b><p class="mini" style="margin:2px 0 8px">Se alguém desmarcar, ofereça o horário para elas.</p><a class="bt pq" href="#espera">Ver a lista</a></div>` : ''}`;
  },
  novo() {
    const s = serv(rasc.serv), h = livres(rasc.dia, s.min), k = db.clientes.find((x) => sa(x.nome) === sa(rasc.cli)), val = rasc.valor !== '' ? Number(rasc.valor) : k?.valor ?? s.preco, pede = val >= db.sinalAcima;
    const digitado = rasc.ini !== null && !h.some((x) => Math.abs(x - rasc.ini) < 1e-6), choque = rasc.ini !== null && ocupado(rasc.dia, rasc.ini, s.min);
    return `<h1>Novo horário</h1><p class="sub">Escolha o serviço, o dia e um horário livre, ou digite o horário exato.</p>
      <div class="servicos">${db.servicos.map((x) => `<button type="button" data-serv="${x.id}" aria-pressed="${x.id === rasc.serv}" style="--c:${x.cor}"><span><b>${t(x.nome)}</b><small>${x.min} min</small></span><span>${din(x.preco)}</span></button>`).join('')}</div>
      <label class="campo">Cliente<input id="cli-n" list="lista-cli" value="${t(rasc.cli)}" placeholder="Nome do cliente"><datalist id="lista-cli">${db.clientes.map((c) => `<option value="${t(c.nome)}">`).join('')}</datalist></label>
      <div class="chips">${[0, 1, 2, 3, 4, 5].map((o) => `<button type="button" data-ndia="${o}" aria-pressed="${o === rasc.dia}">${nomeDia(o).split(',')[0]}</button>`).join('')}</div>
      <div class="horarios">${h.map((x) => `<button type="button" data-hr="${x}" aria-pressed="${Math.abs(x - (rasc.ini ?? -1)) < 1e-6}">${hh(x)}</button>`).join('') || '<p class="livre">Sem horário livre neste dia para esse serviço.</p>'}</div>
      <label class="campo">Outro horário (qualquer minuto, ex.: 9:10 ou 14:45)<input id="hr-livre" type="time" step="60" value="${digitado ? `${String(Math.floor(rasc.ini)).padStart(2, '0')}:${String(Math.round((rasc.ini % 1) * 60)).padStart(2, '0')}` : ''}"></label>
      ${choque ? `<p class="mini" style="color:var(--verm);margin:-6px 0 10px">Esse horário encosta no de ${t(cli(choque.cli).nome.split(' ')[0])} (${hh(choque.ini)} às ${hh(fim(choque))}). Dá para marcar assim mesmo, se for um encaixe.</p>` : ''}
      <label class="campo">Valor deste atendimento (opcional)<input id="valor-n" type="number" inputmode="decimal" min="0" step="0.01" value="${t(rasc.valor)}" placeholder="${k?.valor != null ? `${din(k.valor)} (combinado com ${t(k.nome.split(' ')[0])})` : `${din(s.preco)} (preço do serviço)`}"></label>
      <label class="troca"><span>Pedir sinal de ${din(val * db.sinalPct / 100)} no PIX<br><small class="mini">${pede ? 'Recomendado: serviço acima de ' + din(db.sinalAcima) : 'Opcional'}</small></span><input type="checkbox" id="sinal" ${rasc.sinal || pede ? 'checked' : ''}></label>
      <button type="button" class="bt cheio largo" data-acao="marcar" ${rasc.ini === null ? 'disabled' : ''}>Marcar ${rasc.ini === null ? '' : `${nomeDia(rasc.dia).split(',')[0]} às ${hh(rasc.ini)}`}</button>`;
  },
  clientes() {
    const l = db.clientes.map((c) => ({ ...c, s: serv(c.serv), atraso: -c.ultima - serv(c.serv).retorno, marcada: db.ags.some((a) => a.cli === c.id && a.dia >= 0 && a.st !== 'cancelado') })).sort((a, b) => (b.atraso > 0 && !b.marcada) - (a.atraso > 0 && !a.marcada) || b.atraso - a.atraso);
    const chamar = l.filter((c) => c.ultima && c.atraso >= 0 && !c.marcada);
    return `<h1>Clientes</h1><p class="sub">${chamar.length} cliente(s) já passaram do tempo de voltar e não têm horário marcado.</p><button type="button" class="bt cheio largo" data-acao="add-cliente" style="margin-bottom:12px">+ Adicionar cliente</button>
      ${l.map((c) => `<div class="cartao"><div style="display:flex;justify-content:space-between;gap:10px"><div><b>${t(c.nome)}</b><small class="mini" style="display:block">${c.ultima ? `${t(c.s.nome)} há ${-c.ultima} dias · volta a cada ${c.s.retorno} dias` : 'cliente novo'}${c.valor != null ? ` · paga ${din(c.valor)}` : ''}${c.faltas ? ` · ${c.faltas} falta(s)` : ''}</small></div>${c.marcada ? '<span class="selo ok">tem horário</span>' : !c.ultima ? '<span class="selo">novo</span>' : c.atraso >= 0 ? '<span class="selo rs">hora de chamar</span>' : `<span class="selo">em ${-c.atraso} dias</span>`}</div>
        ${c.ultima && !c.marcada && c.atraso >= 0 ? `<div class="linha"><a class="bt pq rose" target="_blank" rel="noopener" href="${zap(c.tel, `Oi, ${c.nome.split(' ')[0]}! Aqui é a ${db.pro.split(' ')[0]}. Já faz ${-c.ultima} dias da sua ${c.s.nome.toLowerCase()}: bora marcar? Escolha o horário aqui: ${LINK}`)}">Chamar no WhatsApp</a></div>` : ''}</div>`).join('')}`;
  },
  link() {
    return `<h1>Seu link de agendamento</h1><p class="sub">Coloque na bio do Instagram ou no Google. O cliente escolhe serviço e horário; você só aprova.</p>
      <div class="linha" style="margin-bottom:14px"><button type="button" class="bt cheio" data-acao="copiar">Copiar link</button><a class="bt" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(`Marque seu horário comigo por aqui: ${LINK}`)}">Mandar no WhatsApp</a></div>
      ${db.pedidos.length ? `<h2>Pedidos que chegaram</h2>${db.pedidos.map((p) => `<div class="cartao"><b>${t(p.nome)}</b><small class="mini" style="display:block">${t(serv(p.serv).nome)} · ${nomeDia(p.dia)} às ${hh(p.ini)}</small><div class="linha"><button type="button" class="bt pq cheio" data-acao="aceitar" data-p="${p.id}">Aceitar</button><button type="button" class="bt pq" data-acao="recusar" data-p="${p.id}">Sugerir outro horário</button></div></div>`).join('')}` : ''}
      <h2>O que o cliente vê</h2><div class="vitrine"><header><b>${t(db.studio)}</b><small>${t(db.pro)} · ${t(db.ramo)}</small></header><div class="corpo">${db.servicos.slice(0, 4).map((s) => `<div class="hora" style="cursor:default"><span class="h" style="font-size:.9rem">${s.min}′</span><span><b>${t(s.nome)}</b><small>${livres(1, s.min).slice(0, 3).map(hh).join(' · ')} amanhã</small></span><span>${din(s.preco)}</span></div>`).join('')}<p class="mini">Serviço acima de ${din(db.sinalAcima)} pede sinal de ${db.sinalPct}% no PIX para garantir o horário.</p></div></div>`;
  },
  espera() {
    return `<a href="#dia">← Dia</a><h1>Lista de espera</h1><p class="sub">Quem quer um encaixe. Quando alguém desmarca, mande o horário para elas.</p>${db.espera.map((e) => `<div class="cartao"><b>${t(e.nome)}</b><small class="mini" style="display:block">${t(e.quer)} · ${t(e.quando)}</small><div class="linha"><a class="bt pq rose" target="_blank" rel="noopener" href="${zap(e.tel, `Oi, ${e.nome.split(' ')[0]}! Abriu um horário para ${e.quer.toLowerCase()}. Quer? Responde aqui que eu reservo.`)}">Oferecer horário</a><button type="button" class="bt pq" data-acao="tira-espera" data-e="${e.id}">Já marcou</button></div></div>`).join('') || '<p class="livre">Ninguém esperando.</p>'}<button type="button" class="bt largo" data-acao="add-espera">+ Pôr na lista</button>`;
  },
  caixa() {
    const sem = db.ags.filter((a) => a.dia <= 0 && a.dia > -7), rec = sem.reduce((s, a) => s + a.pago + (a.sinal?.pago ? a.sinal.valor : 0), 0), faltas = sem.filter((a) => a.st === 'faltou'), perdido = faltas.reduce((s, a) => s + preco(a), 0), prev = db.ags.filter((a) => a.dia >= 0 && a.st !== 'feito' && a.st !== 'faltou').reduce((s, a) => s + preco(a), 0);
    return `<a href="#mais">← Mais</a><h1>Caixa</h1><p class="sub">Últimos 7 dias e o que já está marcado.</p>
      <div class="cartao"><small class="mini">Recebido (7 dias)</small><p style="font:400 2rem var(--serif);margin:2px 0">${din(rec)}</p><small class="mini">Marcado pela frente: ${din(prev)}</small></div>
      <div class="cartao"><b>Faltas</b><p class="mini" style="margin:2px 0 0">${faltas.length} falta(s) custaram ${din(perdido)}. O sinal no PIX evita isso: ligue em Configurações.</p></div>
      <h2>Atendimentos</h2><div class="cartao">${sem.filter((a) => a.st === 'feito').map((a) => `<div class="hora" style="cursor:default"><span class="h">${data(a.dia).getDate()}/${data(a.dia).getMonth() + 1}</span><span>${t(cli(a.cli).nome)}<small>${t(serv(a.serv).nome)}</small></span><span>${din(a.pago)}</span></div>`).join('') || '<p class="livre">Nada ainda.</p>'}</div>`;
  },
  mais() {
    const l = [['ia', 'Assistente', 'pergunte da sua agenda e dos clientes'], ['caixa', 'Caixa', 'quanto entrou e o que as faltas custaram'], ['espera', 'Lista de espera', `${db.espera.length} esperando encaixe`], ['assinatura', 'Minha assinatura', estAss()], ['dono', 'Painel do dono', 'ajudante e o que ela vê'], ['config', 'Configurações', 'tipo de negócio, horário, serviços, sinal, PIX']];
    return `<h1>Mais</h1><div class="lista-mais">${l.map(([k, n, s]) => `<a href="#${k}"><span><b>${n}</b><small>${t(s)}</small></span><span aria-hidden="true">›</span></a>`).join('')}</div>`;
  },
  ia() {
    const conv = db.conversa.length ? db.conversa : [{ ia: 1, t: `Oi, ${db.pro.split(' ')[0]}! Eu vejo sua agenda e seus clientes. Pergunte do seu jeito. Na versão contratada são 20 perguntas grátis por dia.` }];
    return `<a href="#mais">← Mais</a><div class="ia-cab"><div class="ia-boneco" id="ia-boneco" aria-hidden="true"></div><div><h1 style="margin:0">Assistente</h1><p class="sub" style="margin:2px 0 0">Vê sua agenda, os clientes e o caixa.</p></div></div><div class="conversa">${conv.map((m) => `<div class="fala ${m.ia ? 'ia' : 'eu'}">${t(m.t)}</div>`).join('')}</div>
      <div class="chips">${['Tenho buraco na agenda amanhã?', 'Quem eu devo chamar?', 'Quanto vou fazer esta semana?', 'Escreva o lembrete de amanhã'].map((s) => `<button type="button" data-sug="${t(s)}">${t(s)}</button>`).join('')}</div>
      <form class="form-ia" id="f-ia"><input id="q-ia" placeholder="Pergunte" aria-label="Pergunta"><button class="bt cheio">Enviar</button></form>`;
  },
  assinatura() {
    const a = db.assinatura;
    const topo = a.status === 'vencida' ? `<div class="cartao" style="border-color:var(--verm)"><b style="color:var(--verm)">Assinatura vencida</b><p class="mini" style="margin:4px 0 0">O pagamento de ${din(a.valor)} não foi aprovado. Sua agenda e as clientes estão guardadas.</p></div>`
      : a.renova ? `<div class="cartao"><b>Ativa</b><p class="mini" style="margin:4px 0 0">Plano Assinatura · ${din(a.valor)} por mês · próxima cobrança em ${a.proxima} dias.</p></div>`
        : `<div class="cartao" style="border-color:var(--rose)"><b>Cancelada</b><p class="mini" style="margin:4px 0 0">Você usa tudo por mais ${a.proxima} dias. Depois disso nada mais é cobrado.</p></div>`;
    return `<a href="#mais">← Mais</a><h1>Minha assinatura</h1><p class="sub">A mesma da sua conta no site. Sem fidelidade.</p>${topo}
      <div class="linha">${a.status === 'vencida' ? '<button type="button" class="bt cheio" data-acao="pagar">Pagar aqui no app</button><a class="bt" target="_blank" rel="noopener" href="https://bluerose-store.com/conta.html">Renovar no site</a>' : a.renova ? '<button type="button" class="bt" data-acao="cancelar">Cancelar assinatura</button>' : '<button type="button" class="bt cheio" data-acao="reativar">Reativar</button>'}</div>
      <h2>Pagamentos</h2><div class="cartao">${a.pagos.map((d) => `<div class="hora" style="cursor:default"><span class="h">✓</span><span>Mensalidade<small>${data(d).toLocaleDateString('pt-BR')}</small></span><span>${din(a.valor)}</span></div>`).join('')}</div>`;
  },
  dono() {
    return `<a href="#mais">← Mais</a><h1>Painel do dono</h1><p class="sub">Quem te ajuda entra com o próprio celular e só vê o que você deixar.</p>
      ${db.ajudantes.map((p, i) => `<div class="cartao"><b>${t(p.nome)}</b>${[['agenda', 'Ver e marcar horários'], ['clientes', 'Ver as clientes'], ['valores', 'Ver valores e caixa']].map(([k, n]) => `<label class="troca">${n}<input type="checkbox" data-ve="${i}.${k}" ${p.ve[k] ? 'checked' : ''}></label>`).join('')}</div>`).join('')}
      <button type="button" class="bt largo" data-acao="ajudante">+ Convidar ajudante</button>
      <h2>Plano</h2><div class="chips"><button type="button" data-plano="basico" aria-pressed="${db.plano === 'basico'}">Assinatura · R$ 49/mês</button></div><p class="mini">Equipe sem limite, histórico de quem fez o quê e até 10 empresas. Anual com 20% a menos.</p>`;
  },
  config() {
    return `<a href="#mais">← Mais</a><h1>Configurações</h1><h2>Tipo de negócio</h2><p class="mini" style="margin-top:-6px">Troca os serviços de exemplo. Você ajusta nomes, tempos e preços logo abaixo.</p><div class="chips">${Object.entries(MODELOS).map(([k, m]) => `<button type="button" data-tipo="${k}" aria-pressed="${(db.tipo || 'geral') === k}">${m.nome}</button>`).join('')}</div>${[['studio', 'Nome do espaço'], ['pro', 'Seu nome'], ['ramo', 'O que você faz'], ['pix', 'Chave PIX do sinal']].map(([k, n]) => `<label class="campo">${n}<input data-cfg="${k}" value="${t(db[k])}"></label>`).join('')}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><label class="campo">Começo às<input data-cfg="abre" type="number" value="${db.abre}"></label><label class="campo">Termino às<input data-cfg="fecha" type="number" value="${db.fecha}"></label><label class="campo">Sinal (%)<input data-cfg="sinalPct" type="number" value="${db.sinalPct}"></label><label class="campo">Pedir sinal acima de (R$)<input data-cfg="sinalAcima" type="number" value="${db.sinalAcima}"></label><label class="campo" style="grid-column:1/-1">Horários sugeridos de quanto em quanto<select data-cfg="passo">${[10, 15, 20, 30, 60].map((m) => `<option value="${m}" ${(db.passo || 30) === m ? 'selected' : ''}>${m} minutos</option>`).join('')}</select></label></div>
      <h2>Serviços</h2><div class="cartao">${db.servicos.map((s, i) => `<div class="serv-ed"><span class="h" style="color:${s.cor}">●</span><input data-sv="${i}.nome" value="${t(s.nome)}" aria-label="Nome do serviço"><label>min<input data-sv="${i}.min" type="number" min="5" step="5" value="${s.min}"></label><label>R$<input data-sv="${i}.preco" type="number" min="0" step="0.01" value="${s.preco}"></label></div>`).join('')}</div><button type="button" class="bt largo" data-acao="add-serv">+ Adicionar serviço</button><p class="mini">Funciona sem internet: o que você marcar sobe quando a conexão voltar.</p>`;
  },
};

function responde(p) {
  const x = sa(p);
  if (/buraco|livre|vago|amanha/.test(x)) { const l = livres(1, 60); return l.length ? `Amanhã você tem horário livre às ${l.filter((_, i) => i % 2 === 0).slice(0, 5).map(hh).join(', ')}. Quer que eu ofereça para a lista de espera (${db.espera.map((e) => e.nome.split(' ')[0]).join(', ')})?` : 'Amanhã está cheio.'; }
  if (/chamar|sumid|volt/.test(x)) { const l = db.clientes.filter((c) => -c.ultima >= serv(c.serv).retorno && !db.ags.some((a) => a.cli === c.id && a.dia >= 0)); return l.length ? `Chame: ${l.map((c) => `${c.nome.split(' ')[0]} (${-c.ultima} dias)`).join(', ')}. Estão em Clientes com a mensagem pronta.` : 'Todas as clientes estão em dia.'; }
  if (/semana|quanto|fatur|ganh/.test(x)) { const v = db.ags.filter((a) => a.dia >= 0 && a.dia < 7 && a.st !== 'faltou').reduce((s, a) => s + preco(a), 0); return `Marcado para os próximos 7 dias: ${din(v)}. Se preencher os buracos de amanhã, dá mais uns ${din(140)}.`; }
  if (/lembrete|escrev|mensag/.test(x)) return `Mensagem pronta:\n\n"Oi! Passando para confirmar seu horário amanhã comigo. Responde SIM para confirmar ou me avisa se precisar trocar. Beijo, ${db.pro.split(' ')[0]}"`;
  return `Hoje são ${doDia(0).length} horários, ${din(doDia(0).reduce((s, a) => s + preco(a), 0))} previstos.`;
}

// ------------------------------------------------------------------ navegação, trava e pagamento
function mostra() {
  const r = location.hash.slice(1) || 'dia', tela = $('#tela');
  tela.innerHTML = (T[r] || T.dia)();
  const aba = { espera: 'dia', ia: 'mais', caixa: 'mais', assinatura: 'mais', dono: 'mais', config: 'mais' }[r] ?? r;
  document.querySelectorAll('.pilula a').forEach((l) => { if (l.dataset.aba === aba) l.setAttribute('aria-current', 'page'); else l.removeAttribute('aria-current'); });
  $('#nome-studio').textContent = db.studio; $('#nome-pro').textContent = `${db.pro} · ${db.ramo}`; $('#iniciais').textContent = db.pro.split(' ').map((p) => p[0]).slice(0, 2).join('');
  if (!db.assinatura.renova && db.assinatura.status !== 'vencida' && r !== 'assinatura') tela.insertAdjacentHTML('afterbegin', `<p class="cartao" style="margin-top:12px;padding:8px 12px;background:#f1dfdd">Assinatura cancelada: você usa por mais ${db.assinatura.proxima} dias. <a href="#assinatura">Reativar</a></p>`);
  trava(r);
  if (r === 'ia') { const el = $('#ia-boneco'); if (el) import('../base/assistente-ia.js?v=2').then((m) => { const b = m.personagemIA(el, db.conversa.length ? 'parado' : 'ola'); if (!db.conversa.length) b.estado('ola', 2600); else if (/Pensando/.test(db.conversa[db.conversa.length - 1].t)) b.estado('pensando'); else b.estado('explicando', 4000); }).catch(() => el.remove()); }
  document.title = `${{ dia: 'Dia', novo: 'Novo horário', clientes: 'Clientes', link: 'Link', espera: 'Lista de espera', caixa: 'Caixa', mais: 'Mais', ia: 'Assistente', assinatura: 'Minha assinatura', dono: 'Painel do dono', config: 'Configurações' }[r] || 'Dia'} · Veltria Agenda Essencial`;
}
addEventListener('hashchange', () => { mostra(); $('#tela').focus({ preventScroll: true }); scrollTo(0, 0); });
function trava(r) {
  document.querySelector('.trava')?.remove();
  if (db.assinatura.status !== 'vencida' || r === 'assinatura') return;
  const v = document.createElement('div'); v.className = 'veu trava';
  v.innerHTML = `<div class="folha" role="alertdialog" aria-modal="true" aria-labelledby="tr-t"><h2 id="tr-t">Sua assinatura venceu</h2><p class="sub">O pagamento não foi aprovado. Sua agenda, as clientes e os sinais estão guardados: renove para continuar.</p><div style="display:grid;gap:8px"><button type="button" class="bt cheio largo" data-acao="pagar">Pagar aqui no app</button><a class="bt largo" target="_blank" rel="noopener" href="https://bluerose-store.com/conta.html">Renovar no site</a><a class="bt largo" href="#assinatura" style="border-style:dashed">Ver minha assinatura</a></div></div>`;
  document.body.append(v);
}
function abreHorario(id) {
  const a = db.ags.find((x) => x.id === id), c = cli(a.cli), s = serv(a.serv);
  const v = preco(a);
  folha(`<h2>${hh(a.ini)} · ${t(c.nome)}</h2><p class="sub">${t(s.nome)} · ${s.min} min · ${din(v)}${a.valor != null ? ' (combinado)' : ''} · ${nomeDia(a.dia)}</p>${a.sinal ? `<p class="cartao" style="padding:8px 12px">Sinal de ${din(a.sinal.valor)}: <b>${a.sinal.pago ? 'pago' : 'esperando o PIX'}</b>${a.sinal.pago ? '' : ' <button type="button" class="bt pq" data-sinal-ok>Caiu</button>'}</p>` : ''}
    <div style="display:grid;gap:8px">${a.st === 'feito' || a.st === 'faltou' ? '' : `<a class="bt rose largo" target="_blank" rel="noopener" href="${zap(c.tel, `Oi, ${c.nome.split(' ')[0]}! Confirmando ${s.nome.toLowerCase()} ${nomeDia(a.dia)} às ${hh(a.ini)}. Responde SIM para confirmar.${a.sinal && !a.sinal.pago ? ` Sinal de ${din(a.sinal.valor)} no PIX ${db.pix}.` : ''}`)}" data-confirmou>Confirmar no WhatsApp</a>
    <button type="button" class="bt cheio largo" data-receber>Atendido: receber ${din(v - (a.sinal?.pago ? a.sinal.valor : 0))}</button><div class="linha" style="margin:0"><button type="button" class="bt pq" data-faltou>Faltou</button><button type="button" class="bt pq" data-desmarcar>Desmarcar</button></div>`}<button type="button" class="bt largo" data-fecha style="border-style:dashed">Fechar</button></div>`, (f, fecha) => {
    const ok = (fn, msg) => () => { fn(); grava(); fecha(); mostra(); if (msg) toast(msg); };
    f.querySelector('[data-sinal-ok]')?.addEventListener('click', ok(() => { a.sinal.pago = true; }, 'Sinal recebido. Horário garantido.'));
    f.querySelector('[data-confirmou]')?.addEventListener('click', () => { a.st = 'confirmado'; grava(); setTimeout(() => { fecha(); mostra(); }, 200); });
    f.querySelector('[data-receber]')?.addEventListener('click', () => { f.innerHTML = `<h2>Como ${t(c.nome.split(' ')[0])} pagou?</h2><div style="display:grid;gap:8px">${['PIX', 'Dinheiro', 'Cartão'].map((m) => `<button type="button" class="bt largo" data-forma="${m}">${m}</button>`).join('')}</div>`; f.querySelectorAll('[data-forma]').forEach((b) => b.addEventListener('click', ok(() => { a.st = 'feito'; a.pago = v - (a.sinal?.pago ? a.sinal.valor : 0); c.ultima = a.dia; c.serv = a.serv; }, `${din(v)} recebido. Próximo retorno em ${s.retorno} dias.`))); });
    f.querySelector('[data-faltou]')?.addEventListener('click', ok(() => { a.st = 'faltou'; c.faltas = (c.faltas || 0) + 1; }, c.faltas >= 1 ? `${c.nome.split(' ')[0]} já faltou antes: peça sinal na próxima.` : 'Falta registrada.'));
    f.querySelector('[data-desmarcar]')?.addEventListener('click', ok(() => { a.st = 'cancelado'; }, db.espera.length ? `Horário livre. ${db.espera.length} cliente(s) na lista de espera: ofereça em Mais > Lista de espera.` : 'Horário desmarcado.'));
  });
}
const ACOES = {
  marcar: () => {
    const nome = $('#cli-n').value.trim(); if (!nome) { toast('Escreva o nome do cliente.'); $('#cli-n').focus(); return; }
    let c = db.clientes.find((x) => sa(x.nome) === sa(nome)); if (!c) { c = { id: uid(), nome, tel: '', ultima: 0, serv: rasc.serv, faltas: 0, valor: null }; db.clientes.push(c); }
    const vd = $('#valor-n').value, valor = vd !== '' ? Number(vd) : c.valor ?? null;
    const s = serv(rasc.serv), sinal = $('#sinal').checked ? { valor: Math.round((valor ?? s.preco) * db.sinalPct / 100), pago: false } : null;
    db.ags.push({ id: uid(), dia: rasc.dia, ini: rasc.ini, cli: c.id, serv: rasc.serv, st: 'marcado', pago: 0, valor, sinal });
    const msg = `Marcado: ${s.nome.toLowerCase()} ${nomeDia(rasc.dia).split(',')[0]} às ${hh(rasc.ini)}${sinal ? `. Sinal de ${din(sinal.valor)} pedido no PIX` : ''}.`;
    dia = rasc.dia; rasc = { serv: rasc.serv, cli: '', dia: rasc.dia, ini: null, sinal: false, valor: '' }; grava(); location.hash = '#dia'; toast(msg);
  },
  'add-cliente': () => folha(`<h2>Adicionar cliente</h2><form><label class="campo">Nome<input name="n" required autocomplete="off"></label><label class="campo">WhatsApp<input name="t" inputmode="tel"></label><label class="campo">Quanto vai pagar (opcional)<input name="v" type="number" inputmode="decimal" min="0" step="0.01" placeholder="Deixe vazio para usar o preço do serviço"></label><label class="campo">Serviço de costume<select name="s">${db.servicos.map((x) => `<option value="${x.id}">${t(x.nome)} · ${din(x.preco)}</option>`).join('')}</select></label><label class="campo">Anotação (opcional)<input name="o" placeholder="Ex.: prefere de manhã"></label><button class="bt cheio largo">Salvar cliente</button></form>`, (f, fecha) => f.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault(); const x = new FormData(e.target), nome = String(x.get('n')).trim(); if (!nome) return;
    if (db.clientes.some((c) => sa(c.nome) === sa(nome))) { toast('Já existe um cliente com esse nome.'); return; }
    const v = String(x.get('v') || '').trim();
    db.clientes.push({ id: uid(), nome, tel: String(x.get('t') || ''), ultima: 0, serv: x.get('s'), faltas: 0, valor: v === '' ? null : Number(v), obs: String(x.get('o') || '') });
    grava(); fecha(); mostra(); toast(v === '' ? `${nome.split(' ')[0]} adicionado.` : `${nome.split(' ')[0]} adicionado, pagando ${din(Number(v))}.`);
  })),
  'add-serv': () => { const i = db.servicos.length; db.servicos.push({ id: 's' + Date.now().toString(36), nome: 'Novo serviço', min: 60, preco: 0, cor: COR[i % COR.length], retorno: 30 }); grava(); mostra(); setTimeout(() => document.querySelector(`[data-sv="${i}.nome"]`)?.select(), 30); },
  copiar: () => { navigator.clipboard?.writeText(LINK).catch(() => {}); toast('Link copiado. Cole na bio do Instagram.'); },
  aceitar: (d) => { const p = db.pedidos.find((x) => x.id === d.p); let c = db.clientes.find((x) => x.nome === p.nome); if (!c) { c = { id: uid(), nome: p.nome, tel: p.tel, ultima: 0, serv: p.serv, faltas: 0 }; db.clientes.push(c); } db.ags.push({ id: uid(), dia: p.dia, ini: p.ini, cli: c.id, serv: p.serv, st: 'confirmado', pago: 0, sinal: serv(p.serv).preco >= db.sinalAcima ? { valor: Math.round(serv(p.serv).preco * db.sinalPct / 100), pago: true } : null }); db.pedidos = db.pedidos.filter((x) => x !== p); grava(); mostra(); toast(`${p.nome.split(' ')[0]} marcada. Abrindo o WhatsApp para mandar a confirmação.`); window.open(zap(p.tel, `Oi, ${p.nome.split(' ')[0]}! Seu horário de ${serv(p.serv).nome} está confirmado para ${nomeDia(p.dia)} às ${hh(p.ini)}. Qualquer coisa, é só chamar por aqui. ${db.studio}`), '_blank', 'noopener'); },
  recusar: (d) => { const p = db.pedidos.find((x) => x.id === d.p); window.open(zap(p.tel, `Oi, ${p.nome.split(' ')[0]}! Esse horário não vai dar. Tenho ${livres(p.dia, serv(p.serv).min).slice(0, 3).map(hh).join(', ')}. Algum serve?`), '_blank', 'noopener'); },
  'tira-espera': (d) => { db.espera = db.espera.filter((e) => e.id !== d.e); grava(); mostra(); },
  'add-espera': () => folha('<h2>Lista de espera</h2><form><label class="campo">Nome<input name="n" required></label><label class="campo">WhatsApp<input name="t" inputmode="tel"></label><label class="campo">Quer<input name="q" placeholder="Mão e pé"></label><label class="campo">Quando pode<input name="w" placeholder="qualquer tarde"></label><button class="bt cheio largo">Pôr na lista</button></form>', (f, fecha) => f.querySelector('form').addEventListener('submit', (e) => { e.preventDefault(); const x = new FormData(e.target); db.espera.push({ id: uid(), nome: x.get('n'), tel: x.get('t'), quer: x.get('q') || 'qualquer serviço', quando: x.get('w') || 'qualquer horário' }); grava(); fecha(); mostra(); })),
  ajudante: () => folha('<h2>Convidar ajudante</h2><form><label class="campo">Nome<input name="n" required></label><button class="bt cheio largo">Mandar convite</button></form>', (f, fecha) => f.querySelector('form').addEventListener('submit', (e) => { e.preventDefault(); db.ajudantes.push({ nome: new FormData(e.target).get('n'), ve: { agenda: true, valores: false, clientes: true } }); grava(); fecha(); mostra(); toast('Convite enviado.'); })),
  pagar: () => folha(`<h2>Pagar ${din(db.assinatura.valor)}</h2><p class="sub">Escolha como pagar. Libera na hora.</p><div class="chips"><button type="button" aria-pressed="true">PIX</button><button type="button" aria-pressed="false">Cartão</button></div><div class="cartao"><p class="mini">PIX copia e cola (demonstração):</p><code style="word-break:break-all;font-size:.78rem">00020126580014BR.GOV.BCB.PIX0136bluerose-demo520400005303986540${db.assinatura.valor}.005802BR</code></div><button type="button" class="bt cheio largo" data-pago>Simular pagamento aprovado</button>`, (f, fecha) => f.querySelector('[data-pago]').addEventListener('click', () => { const a = db.assinatura; a.status = 'ativa'; a.renova = true; a.pagos.unshift(0); a.proxima = 30; grava(); fecha(); mostra(); toast('Pagamento aprovado. Tudo liberado.'); })),
  cancelar: () => { if (confirm(`Cancelar? Você usa por mais ${db.assinatura.proxima} dias e nada mais é cobrado.`)) { db.assinatura.renova = false; grava(); mostra(); } },
  reativar: () => { db.assinatura.renova = true; grava(); mostra(); toast('Assinatura reativada.'); },
};

document.addEventListener('click', (e) => {
  const el = e.target;
  const ir = el.closest('[data-ir]'); if (ir) { location.hash = `#${ir.dataset.ir}`; return; }
  const ag = el.closest('[data-ag]'); if (ag && !el.closest('.folha')) { abreHorario(ag.dataset.ag); return; }
  const d = el.closest('[data-dia]'); if (d) { dia = Number(d.dataset.dia); mostra(); return; }
  const sv = el.closest('[data-serv]'); if (sv) { rasc.valor = $('#valor-n')?.value ?? rasc.valor; rasc.cli = $('#cli-n')?.value || rasc.cli; rasc.serv = sv.dataset.serv; rasc.ini = null; mostra(); return; }
  const nd = el.closest('[data-ndia]'); if (nd) { rasc.valor = $('#valor-n')?.value ?? rasc.valor; rasc.cli = $('#cli-n')?.value || rasc.cli; rasc.dia = Number(nd.dataset.ndia); rasc.ini = null; mostra(); return; }
  const hr = el.closest('[data-hr]'); if (hr) { rasc.valor = $('#valor-n')?.value ?? rasc.valor; rasc.cli = $('#cli-n')?.value || rasc.cli; rasc.sinal = $('#sinal')?.checked; rasc.ini = Number(hr.dataset.hr); mostra(); return; }
  const sg = el.closest('[data-sug]'); if (sg) { $('#q-ia').value = sg.dataset.sug; $('#f-ia').requestSubmit(); return; }
  const tp = el.closest('[data-tipo]'); if (tp) { const m = MODELOS[tp.dataset.tipo]; db.tipo = tp.dataset.tipo; db.servicos = m.servicos.map((x) => ({ ...x })); if (db.ramo === 'atendimento com hora marcada' || Object.values(MODELOS).some((x) => x.nome.toLowerCase() === db.ramo)) db.ramo = m.nome.toLowerCase(); grava(); mostra(); toast(`Serviços de ${m.nome.toLowerCase()} carregados. Ajuste os preços abaixo.`); return; }
  const pl = el.closest('[data-plano]'); if (pl) { db.plano = pl.dataset.plano; db.assinatura.valor = db.plano === 'pro' ? 109 : 49; grava(); mostra(); return; }
  const ac = el.closest('[data-acao]'); if (ac && ACOES[ac.dataset.acao]) ACOES[ac.dataset.acao](ac.dataset);
});
document.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.dataset?.ag && e.target.classList.contains('hora')) { e.preventDefault(); abreHorario(e.target.dataset.ag); } });
document.addEventListener('submit', (e) => {
  if (e.target.id !== 'f-ia') return; e.preventDefault();
  const p = $('#q-ia').value.trim(); if (p.length < 3) return;
  const resp = { ia: 1, t: window.veltriaIA ? 'Pensando…' : responde(p) }; db.conversa.push({ t: p }, resp); db.conversa = db.conversa.slice(-12); grava(); mostra(); if (window.veltriaIA) window.veltriaIA(p).then((t) => { resp.t = t; grava(); mostra(); }); scrollTo(0, document.body.scrollHeight);
});
document.addEventListener('change', (e) => {
  const el = e.target;
  if (el.dataset.cfg) { db[el.dataset.cfg] = ['abre', 'fecha', 'sinalPct', 'sinalAcima', 'passo'].includes(el.dataset.cfg) ? Number(el.value) : el.value; grava(); mostra(); toast('Salvo.'); }
  if (el.dataset.sv) { const [i, k] = el.dataset.sv.split('.'), v = k === 'nome' ? el.value.trim() || db.servicos[i].nome : Math.max(0, Number(el.value) || 0); db.servicos[i][k] = k === 'min' ? Math.max(5, v) : v; grava(); toast('Serviço salvo.'); }
  if (el.id === 'hr-livre' && el.value) { const [h, m] = el.value.split(':').map(Number); rasc.cli = $('#cli-n')?.value || rasc.cli; rasc.valor = $('#valor-n')?.value ?? rasc.valor; rasc.ini = h + m / 60; mostra(); }
  if (el.id === 'valor-n') { rasc.valor = el.value; rasc.cli = $('#cli-n')?.value || rasc.cli; mostra(); }
  if (el.dataset.ve) { const [i, k] = el.dataset.ve.split('.'); db.ajudantes[i].ve[k] = el.checked; grava(); }
});
addEventListener('message', (e) => {
  if (e.origin !== location.origin || !e.data?.simular) return; const a = db.assinatura;
  if (e.data.simular === 'cancelar') { a.renova = false; a.status = 'ativa'; }
  if (e.data.simular === 'recusado') { a.status = 'vencida'; a.renova = true; }
  if (e.data.simular === 'normal') { db.assinatura = inicial().assinatura; db.plano = 'basico'; }
  grava(); mostra();
});
$('#recomecar').addEventListener('click', () => { localStorage.removeItem(CHAVE); db = inicial(); dia = 0; location.hash = '#dia'; mostra(); toast('Demonstração recomeçada.'); });
if (window !== window.top) document.documentElement.classList.add('no-celular');
if ('serviceWorker' in navigator && window === window.top) navigator.serviceWorker.register('sw.js').catch(() => {});
mostra();
