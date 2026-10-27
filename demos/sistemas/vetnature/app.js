// VetNature (linha Vexorin) · sistema para clínica veterinária (demonstração: os dados ficam só neste navegador).
// Telas: Hoje (fila + ficha do pet), Pacientes, Vacinas, Internação, Estoque e Caixa. Código próprio, sem base compartilhada.
const CHAVE = 'vetnature-demo-v1';
const $ = (s, el = document) => el.querySelector(s);
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const reais = (n) => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const uid = () => Math.random().toString(36).slice(2, 10);
const hoje = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const maisDias = (iso, n) => { const d = new Date(`${iso}T12:00:00`); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const dataBR = (iso) => (iso ? iso.split('-').reverse().join('/') : '—');
const diasAte = (iso) => Math.round((new Date(`${iso}T12:00:00`) - new Date(`${hoje()}T12:00:00`)) / 864e5);
const idade = (nasc) => { const m = Math.max(0, Math.round((new Date(`${hoje()}T12:00:00`) - new Date(`${nasc}T12:00:00`)) / (864e5 * 30.44))); return m < 12 ? `${m} ${m === 1 ? 'mês' : 'meses'}` : `${Math.floor(m / 12)} ${Math.floor(m / 12) === 1 ? 'ano' : 'anos'}`; };
const soDigitos = (s) => String(s || '').replace(/\D/g, '');

// ---------------------------------------------------------------- ícones
const IC = {
  hoje: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17"/></svg>',
  pacientes: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="6" cy="10" r="2.2"/><circle cx="10" cy="5.8" r="2.2"/><circle cx="14" cy="5.8" r="2.2"/><circle cx="18" cy="10" r="2.2"/><path d="M12 11.5c-3 0-5.5 3.6-5.5 6.1 0 1.6 1.2 2.4 2.6 2.4 1.2 0 1.8-.6 2.9-.6s1.7.6 2.9.6c1.4 0 2.6-.8 2.6-2.4 0-2.5-2.5-6.1-5.5-6.1z"/></svg>',
  vacinas: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="m17 3 4 4M19 5l-9.5 9.5M14 6l4 4M7.5 12.5l4 4M4 20l3.5-3.5"/><path d="M9.5 10.5 13.5 14.5 9 19 5 15z"/></svg>',
  internacao: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 18V8M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11" r="2"/></svg>',
  estoque: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3 4 7v10l8 4 8-4V7z"/><path d="m4 7 8 4 8-4M12 11v10"/></svg>',
  caixa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h3"/></svg>',
  cao: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="6" cy="10" r="2.2"/><circle cx="10" cy="5.8" r="2.2"/><circle cx="14" cy="5.8" r="2.2"/><circle cx="18" cy="10" r="2.2"/><path d="M12 11.5c-3 0-5.5 3.6-5.5 6.1 0 1.6 1.2 2.4 2.6 2.4 1.2 0 1.8-.6 2.9-.6s1.7.6 2.9.6c1.4 0 2.6-.8 2.6-2.4 0-2.5-2.5-6.1-5.5-6.1z"/></svg>',
  gato: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 3.5 8.6 8a8.6 8.6 0 0 1 6.8 0L19 3.5l.6 7.3A7.5 7.5 0 0 1 21 15c0 3.6-4 6-9 6s-9-2.4-9-6a7.5 7.5 0 0 1 1.4-4.2z"/><circle cx="9" cy="14" r="1.1" fill="#fff"/><circle cx="15" cy="14" r="1.1" fill="#fff"/></svg>',
  outro: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.4-7.5-10.2A4.3 4.3 0 0 1 12 8a4.3 4.3 0 0 1 7.5 2.8C19.5 16.6 12 21 12 21z"/></svg>',
};
const SECOES = [['hoje', 'Hoje'], ['pacientes', 'Pacientes'], ['vacinas', 'Vacinas'], ['internacao', 'Internação'], ['estoque', 'Estoque'], ['caixa', 'Caixa']];
const TIPOS = { Consulta: 160, Retorno: 0, Vacina: 0, 'Banho e tosa': 90, Cirurgia: 850, Exame: 120 };
const SERVICOS = [['Consulta clínica', 160], ['Retorno (até 15 dias)', 0], ['Banho e tosa', 90], ['Aplicação de vacina', 25], ['Hemograma', 120], ['Ultrassom', 220], ['Castração', 850], ['Diária de internação', 180]];
const STATUS = { aguardando: ['Agendado', 'selo-aguardando'], chegou: ['Chegou', 'selo-chegou'], atendimento: ['Em atendimento', 'selo-atendimento'], pronto: ['Atendido', 'selo-pronto'] };

// ---------------------------------------------------------------- dados de exemplo
function exemplo() {
  const h = hoje();
  const tutores = [
    ['t1', 'Mariana Lopes', '16991230011'], ['t2', 'Carlos Henrique Dias', '16991230012'], ['t3', 'Fernanda Rocha', '16991230013'],
    ['t4', 'João Pedro Alves', '16991230014'], ['t5', 'Beatriz Nogueira', '16991230015'], ['t6', 'Ricardo Santana', '16991230016'], ['t7', 'Luana Teixeira', '16991230017'],
  ].map(([id, nome, tel]) => ({ id, nome, tel }));
  const pet = (id, tutor, nome, especie, raca, sexo, nasc, castrado, pesos, alergias = '') => ({ id, tutor, nome, especie, raca, sexo, nasc, castrado, alergias, pesos: pesos.map(([d, kg]) => ({ data: maisDias(h, d), kg })) });
  const pets = [
    pet('p1', 't1', 'Thor', 'cao', 'Golden Retriever', 'Macho', maisDias(h, -1460), true, [[-240, 31.2], [-150, 32.0], [-60, 32.8], [-10, 33.4]], 'Dipirona'),
    pet('p2', 't1', 'Mel', 'gato', 'SRD', 'Fêmea', maisDias(h, -900), true, [[-200, 3.9], [-90, 4.1], [-20, 4.2]]),
    pet('p3', 't2', 'Bob', 'cao', 'Shih Tzu', 'Macho', maisDias(h, -2900), false, [[-300, 7.8], [-120, 8.4], [-15, 8.9]]),
    pet('p4', 't3', 'Luna', 'cao', 'Border Collie', 'Fêmea', maisDias(h, -220), false, [[-120, 6.2], [-60, 10.5], [-5, 13.1]]),
    pet('p5', 't4', 'Nina', 'gato', 'Persa', 'Fêmea', maisDias(h, -1800), true, [[-180, 4.8], [-30, 4.5]], 'Ração com frango'),
    pet('p6', 't5', 'Pipoca', 'outro', 'Coelho mini lop', 'Fêmea', maisDias(h, -500), false, [[-100, 1.6], [-30, 1.7]]),
    pet('p7', 't6', 'Max', 'cao', 'Pastor Alemão', 'Macho', maisDias(h, -3300), true, [[-200, 36.0], [-60, 34.2], [-3, 33.1]]),
    pet('p8', 't7', 'Frajola', 'gato', 'SRD', 'Macho', maisDias(h, -120), false, [[-60, 1.2], [-20, 1.9]]),
    pet('p9', 't2', 'Amora', 'cao', 'Lhasa Apso', 'Fêmea', maisDias(h, -1100), true, [[-90, 6.0], [-30, 6.1]]),
  ];
  const ag = (hora, p, tipo, vet, status = 'aguardando') => ({ id: uid(), data: h, hora, pet: p, tipo, vet, status, valor: TIPOS[tipo] ?? 0 });
  const agenda = [
    ag('08:30', 'p3', 'Consulta', 'Dra. Paula Andrade', 'pronto'), ag('09:00', 'p4', 'Vacina', 'Dr. Rafael Mota', 'pronto'),
    ag('09:30', 'p1', 'Retorno', 'Dra. Paula Andrade', 'atendimento'), ag('10:00', 'p8', 'Vacina', 'Dr. Rafael Mota', 'chegou'),
    ag('10:30', 'p5', 'Banho e tosa', 'Equipe de estética'), ag('11:00', 'p9', 'Consulta', 'Dra. Paula Andrade'),
    ag('14:00', 'p6', 'Consulta', 'Dr. Rafael Mota'), ag('15:30', 'p2', 'Exame', 'Dra. Paula Andrade'), ag('16:30', 'p3', 'Banho e tosa', 'Equipe de estética'),
  ];
  const pr = (p, d, vet, queixa, ex, diag, presc) => ({ id: uid(), pet: p, data: maisDias(h, d), vet, queixa, exame: ex, diagnostico: diag, prescricao: presc });
  const prontuarios = [
    pr('p1', -10, 'Dra. Paula Andrade', 'Coceira intensa nas orelhas há 5 dias.', { peso: 33.4, temp: 38.6, fc: 96, fr: 24 }, 'Otite externa bilateral.', 'Limpeza auricular 2x ao dia por 10 dias. Otológico com antifúngico: 5 gotas em cada orelha, 2x ao dia, 7 dias. Retorno em 10 dias.'),
    pr('p3', 0, 'Dra. Paula Andrade', 'Tosse seca há uma semana, pior à noite.', { peso: 8.9, temp: 38.9, fc: 120, fr: 32 }, 'Traqueobronquite infecciosa (suspeita).', 'Xarope antitussígeno 2 ml 2x ao dia por 7 dias. Evitar coleira; usar peitoral. Retorno se piorar.'),
    pr('p7', -3, 'Dr. Rafael Mota', 'Perda de peso e muita sede.', { peso: 33.1, temp: 38.4, fc: 88, fr: 22 }, 'Investigação de doença renal; exames solicitados.', 'Hemograma, bioquímico (ureia, creatinina) e urinálise. Dieta renal até o resultado.'),
  ];
  const vc = (p, nome, d, prox, lote) => ({ id: uid(), pet: p, nome, data: maisDias(h, d), proxima: prox == null ? null : maisDias(h, prox), lote });
  const vacinas = [
    vc('p1', 'V10 (polivalente)', -358, 7, 'V10-2391'), vc('p1', 'Antirrábica', -340, 25, 'AR-7710'), vc('p2', 'V5 felina', -370, -5, 'V5F-1180'),
    vc('p3', 'V10 (polivalente)', -200, 165, 'V10-2391'), vc('p3', 'Gripe canina', -362, 3, 'GC-5502'), vc('p4', 'V10 (2ª dose)', 0, 21, 'V10-2402'),
    vc('p5', 'V5 felina', -330, 35, 'V5F-1180'), vc('p7', 'Antirrábica', -400, -35, 'AR-7701'), vc('p8', 'V5 felina (1ª dose)', -21, 0, 'V5F-1192'),
    vc('p9', 'Vermífugo', -88, 2, 'VRM-310'), vc('p6', 'Vermífugo', -60, 30, 'VRM-310'),
  ];
  const dose = (hora, remedio, feita = false) => ({ hora, remedio, feita });
  const internados = [
    { id: uid(), pet: 'p7', baia: 'Baia 2', motivo: 'Desidratação; investigação renal', entrada: maisDias(h, -1), doses: [dose('06:00', 'Soro fisiológico 500 ml IV', true), dose('08:00', 'Omeprazol 20 mg', true), dose('12:00', 'Soro fisiológico 500 ml IV'), dose('14:00', 'Antiemético 1 ml SC'), dose('20:00', 'Omeprazol 20 mg')] },
    { id: uid(), pet: 'p3', baia: 'Baia 4', motivo: 'Observação pós-crise de tosse', entrada: h, doses: [dose('10:00', 'Nebulização com soro 10 min', true), dose('16:00', 'Nebulização com soro 10 min'), dose('22:00', 'Xarope 2 ml')] },
  ];
  const it = (nome, tipo, qtd, minimo, lote, val, preco) => ({ id: uid(), nome, tipo, qtd, minimo, lote, validade: maisDias(h, val), preco });
  const estoque = [
    it('Vacina V10 (polivalente)', 'Vacina', 14, 10, 'V10-2402', 210, 95), it('Vacina antirrábica', 'Vacina', 6, 8, 'AR-7710', 160, 70), it('Vacina V5 felina', 'Vacina', 9, 6, 'V5F-1192', 18, 110),
    it('Vacina gripe canina', 'Vacina', 4, 5, 'GC-5502', 95, 120), it('Vermífugo comprimido (cães até 10 kg)', 'Medicamento', 32, 15, 'VRM-310', 420, 28),
    it('Antipulgas mastigável 10–20 kg', 'Medicamento', 7, 10, 'APL-882', 300, 89), it('Omeprazol 20 mg (caixa)', 'Medicamento', 3, 4, 'OMP-118', 12, 19),
    it('Soro fisiológico 500 ml', 'Insumo', 26, 20, 'SF-4401', 510, 9), it('Ração renal 2 kg', 'Produto', 5, 3, 'RR-2209', 140, 145), it('Shampoo hipoalergênico', 'Produto', 11, 4, 'SH-075', 600, 49),
  ];
  const vendas = [
    { id: uid(), data: h, hora: '08:55', pet: 'p3', itens: [{ nome: 'Consulta clínica', valor: 160, qtd: 1 }, { nome: 'Xarope antitussígeno', valor: 38, qtd: 1 }], forma: 'PIX' },
    { id: uid(), data: h, hora: '09:25', pet: 'p4', itens: [{ nome: 'Vacina V10 (polivalente)', valor: 95, qtd: 1 }, { nome: 'Aplicação de vacina', valor: 25, qtd: 1 }], forma: 'Cartão de crédito' },
  ];
  return { clinica: 'Clínica Veterinária Bem-Estar Animal', vets: ['Dra. Paula Andrade', 'Dr. Rafael Mota', 'Equipe de estética'], tutores, pets, agenda, prontuarios, vacinas, internados, estoque, vendas };
}
let db = (() => { try { return JSON.parse(localStorage.getItem(CHAVE)) || exemplo(); } catch { return exemplo(); } })();
const salvar = () => { try { localStorage.setItem(CHAVE, JSON.stringify(db)); } catch { /* navegador sem espaço: segue só na memória */ } };

// ---------------------------------------------------------------- estado da tela
const est = { secao: 'hoje', sel: null, aba: 'resumo', filtroVac: '30', busca: '' };
const pet = (id) => db.pets.find((p) => p.id === id);
const tutorDe = (p) => db.tutores.find((t) => t.id === p?.tutor);
const icPet = (p) => IC[p?.especie] || IC.outro;
const pesoAtual = (p) => p.pesos.length ? p.pesos[p.pesos.length - 1].kg : null;
const avisar = (t) => { const el = document.createElement('div'); el.className = 'aviso'; el.textContent = t; $('#avisos').append(el); setTimeout(() => el.remove(), 3200); };
const zap = (tel, msg) => `https://wa.me/55${soDigitos(tel)}?text=${encodeURIComponent(msg)}`;
const vacPendentes = () => db.vacinas.filter((v) => v.proxima && diasAte(v.proxima) <= 7);

// ---------------------------------------------------------------- topo
function topo() {
  $('#clinica').textContent = db.clinica;
  const contas = { vacinas: vacPendentes().length, internacao: db.internados.reduce((n, i) => n + i.doses.filter((d) => !d.feita && d.hora <= horaAgora()).length, 0), estoque: db.estoque.filter((x) => x.qtd < x.minimo || diasAte(x.validade) <= 30).length };
  $('#secoes').innerHTML = SECOES.map(([k, n]) => `<button type="button" data-secao="${k}" ${est.secao === k ? 'aria-current="page"' : ''}>${IC[k]}${n}${contas[k] ? `<span class="conta">${contas[k]}</span>` : ''}</button>`).join('');
}
const horaAgora = () => new Date().toTimeString().slice(0, 5);
const saudacao = () => { const h = new Date().getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'; };

// ---------------------------------------------------------------- HOJE
function telaHoje() {
  const h = hoje(), ag = db.agenda.filter((a) => a.data === h).sort((a, b) => a.hora.localeCompare(b.hora));
  if (!est.sel || !ag.some((a) => a.pet === est.sel)) est.sel = (ag.find((a) => a.status === 'atendimento') || ag.find((a) => a.status !== 'pronto') || ag[0])?.pet || null;
  const espera = ag.filter((a) => a.status === 'chegou').length, feitos = ag.filter((a) => a.status === 'pronto').length;
  const caixa = db.vendas.filter((v) => v.data === h).reduce((s, v) => s + total(v), 0);
  let ultimoTurno = '';
  const fila = ag.map((a) => {
    const p = pet(a.pet), turno = a.hora < '12:00' ? 'MANHÃ' : 'TARDE', st = STATUS[a.status];
    const cab = turno !== ultimoTurno ? `<p class="fila-hora">${turno}</p>` : ''; ultimoTurno = turno;
    return `${cab}<button type="button" class="vez" data-sel="${p.id}" aria-pressed="${est.sel === p.id}"><time>${a.hora}</time><span><b>${esc(p.nome)}</b><small>${esc(tutorDe(p)?.nome)} · <span class="tipo">${esc(a.tipo)}</span></small></span><span class="selo ${st[1]}">${st[0]}</span></button>`;
  }).join('');
  return `<div class="cab"><div><h1>${saudacao()}, equipe</h1><p>${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })} · ${ag.length} atendimentos na agenda</p></div></div>
  <div class="numeros"><div class="numero destaque"><span>Na sala de espera</span><b>${espera}</b></div><div class="numero"><span>Atendidos hoje</span><b>${feitos} de ${ag.length}</b></div><div class="numero"><span>Vacinas vencendo em 7 dias</span><b>${vacPendentes().length}</b></div><div class="numero"><span>Caixa do dia</span><b>${reais(caixa)}</b></div></div>
  <div class="mesa"><section class="fila" aria-label="Fila do dia">${fila || '<p class="vazio">Nenhum atendimento hoje.</p>'}</section>${est.sel ? ficha(est.sel, ag.find((a) => a.pet === est.sel && a.status !== 'pronto') || ag.find((a) => a.pet === est.sel)) : ''}</div>`;
}

// ---------------------------------------------------------------- FICHA DO PET (usada em Hoje e em Pacientes)
function ficha(id, atend) {
  const p = pet(id), t = tutorDe(p), int = db.internados.find((i) => i.pet === id);
  const vencidas = db.vacinas.filter((v) => v.pet === id && v.proxima && diasAte(v.proxima) < 0);
  const marc = [p.castrado ? '<span class="selo selo-aguardando">Castrado</span>' : '', p.alergias ? `<span class="selo selo-alerta">Alergia: ${esc(p.alergias)}</span>` : '', int ? `<span class="selo selo-atendimento">Internado · ${esc(int.baia)}</span>` : '', vencidas.length ? `<span class="selo selo-alerta">${vencidas.length} vacina${vencidas.length > 1 ? 's' : ''} vencida${vencidas.length > 1 ? 's' : ''}</span>` : ''].join('');
  const prox = atend && { aguardando: ['chegou', 'Marcar chegada'], chegou: ['atendimento', 'Iniciar atendimento'], atendimento: ['pronto', 'Finalizar e registrar'] }[atend.status];
  const abas = [['resumo', 'Resumo'], ['prontuario', 'Prontuário'], ['vacinas', 'Carteira de vacinas'], ['peso', 'Peso']];
  return `<section class="cartao" aria-label="Ficha de ${esc(p.nome)}">
    <div class="ficha-topo"><div class="avatar">${icPet(p)}</div><div><h2>${esc(p.nome)}</h2><p>${esc(p.raca)} · ${esc(p.sexo)} · ${idade(p.nasc)} · ${pesoAtual(p) ?? '—'} kg</p><div class="marcadores">${marc}</div></div>
      <div class="acoes">${prox ? `<button class="bt bt-pri" data-avancar="${atend.id}" data-para="${prox[0]}">${prox[1]}</button>` : ''}<button class="bt" data-prontuario="${p.id}">Nova consulta</button><button class="bt" data-cobrar="${p.id}">Cobrar</button></div></div>
    <div class="abas" role="tablist">${abas.map(([k, n]) => `<button type="button" role="tab" data-aba="${k}" aria-selected="${est.aba === k}">${n}</button>`).join('')}</div>
    <div class="cartao-corpo">${({ resumo: abaResumo, prontuario: abaProntuario, vacinas: abaVacinas, peso: abaPeso })[est.aba](p, t)}</div></section>`;
}
function abaResumo(p, t) {
  const ult = db.prontuarios.filter((x) => x.pet === p.id).sort((a, b) => b.data.localeCompare(a.data))[0];
  const prox = db.vacinas.filter((v) => v.pet === p.id && v.proxima).sort((a, b) => a.proxima.localeCompare(b.proxima))[0];
  return `<div class="dados"><div><span>Tutor</span><b>${esc(t?.nome)}</b></div><div><span>WhatsApp</span><b>${esc(t?.tel?.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3'))}</b></div><div><span>Espécie</span><b>${({ cao: 'Cão', gato: 'Gato' })[p.especie] || 'Outro'}</b></div>
    <div><span>Nascimento</span><b>${dataBR(p.nasc)}</b></div><div><span>Última consulta</span><b>${ult ? dataBR(ult.data) : '—'}</b></div><div><span>Próxima vacina</span><b>${prox ? `${esc(prox.nome)} · ${dataBR(prox.proxima)}` : '—'}</b></div></div>
    ${ult ? `<h3 style="margin:18px 0 6px;font:600 14px var(--sans)">Última anotação</h3><p style="margin:0;color:var(--texto-2)"><b style="color:var(--texto)">${esc(ult.diagnostico)}</b> ${esc(ult.prescricao)}</p>` : ''}
    <div class="acoes" style="margin-top:16px"><a class="bt bt-zap" target="_blank" rel="noopener" href="${zap(t?.tel, `Olá, ${t?.nome?.split(' ')[0]}! Aqui é da ${db.clinica}. Passando para falar sobre o(a) ${p.nome}.`)}">Mandar mensagem ao tutor</a>${db.internados.some((i) => i.pet === p.id) ? '' : `<button class="bt" data-internar="${p.id}">Internar</button>`}</div>`;
}
function abaProntuario(p) {
  const l = db.prontuarios.filter((x) => x.pet === p.id).sort((a, b) => b.data.localeCompare(a.data));
  return l.length ? `<ol class="linha-tempo">${l.map((x) => `<li><time>${dataBR(x.data)}</time><div><b>${esc(x.diagnostico)}</b><p style="margin:2px 0 4px;color:var(--texto-2)">${esc(x.queixa)}</p><small style="color:var(--texto-3)">${esc(x.vet)} · ${x.exame.peso ?? '—'} kg · ${x.exame.temp ?? '—'} °C · FC ${x.exame.fc ?? '—'} · FR ${x.exame.fr ?? '—'}</small><p style="margin:6px 0 0">${esc(x.prescricao)}</p><button class="bt bt-peq" style="margin-top:8px" data-receita="${x.id}">Imprimir receita</button></div></li>`).join('')}</ol>` : '<p class="vazio">Nenhuma consulta registrada ainda.</p>';
}
function abaVacinas(p, t) {
  const l = db.vacinas.filter((v) => v.pet === p.id).sort((a, b) => b.data.localeCompare(a.data));
  return `${l.length ? `<table class="tabela empilha"><thead><tr><th>Vacina</th><th>Aplicada</th><th>Lote</th><th>Próxima dose</th><th></th></tr></thead><tbody>${l.map((v) => `<tr><td><b>${esc(v.nome)}</b></td><td>${dataBR(v.data)}</td><td>${esc(v.lote)}</td><td>${v.proxima ? selVac(v) : '—'}</td><td>${v.proxima && diasAte(v.proxima) <= 30 ? `<a class="bt bt-peq bt-zap" target="_blank" rel="noopener" href="${zap(t?.tel, lembrete(v))}">Lembrar</a>` : ''}</td></tr>`).join('')}</tbody></table>` : '<p class="vazio">Sem vacinas registradas.</p>'}
    <div class="acoes" style="margin-top:14px"><button class="bt bt-pri" data-aplicar="${p.id}">Registrar vacina aplicada</button></div>`;
}
function abaPeso(p) {
  if (p.pesos.length < 2) return '<p class="vazio">Registre pelo menos duas pesagens para ver a curva.</p>';
  const w = 560, hh = 120, pad = 24, kg = p.pesos.map((x) => x.kg), min = Math.min(...kg), max = Math.max(...kg), r = max - min || 1;
  const pts = p.pesos.map((x, i) => [pad + (i * (w - pad * 2)) / (p.pesos.length - 1), hh - pad - ((x.kg - min) / r) * (hh - pad * 2)]);
  const dif = kg[kg.length - 1] - kg[0];
  return `<p style="margin:0 0 8px">${dif >= 0 ? 'Ganhou' : 'Perdeu'} <b>${Math.abs(dif).toFixed(1)} kg</b> desde ${dataBR(p.pesos[0].data)}.</p>
    <svg class="peso-grafico" viewBox="0 0 ${w} ${hh}" role="img" aria-label="Curva de peso de ${esc(p.nome)}"><polyline points="${pts.map((x) => x.join(',')).join(' ')}"/>${pts.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="4"/><text x="${x}" y="${y - 9}" text-anchor="middle">${kg[i]}</text><text x="${x}" y="${hh - 4}" text-anchor="middle">${dataBR(p.pesos[i].data).slice(0, 5)}</text>`).join('')}</svg>`;
}
const selVac = (v) => { const d = diasAte(v.proxima); return d < 0 ? `<span class="selo selo-alerta">Vencida há ${-d} dia${d === -1 ? '' : 's'}</span>` : d <= 7 ? `<span class="selo selo-chegou">${d === 0 ? 'Hoje' : `Em ${d} dia${d === 1 ? '' : 's'}`}</span>` : `<span class="selo selo-aguardando">${dataBR(v.proxima)}</span>`; };
const lembrete = (v) => { const p = pet(v.pet), t = tutorDe(p), d = diasAte(v.proxima); return `Olá, ${t?.nome.split(' ')[0]}! Aqui é da ${db.clinica}. ${d < 0 ? `A vacina ${v.nome} do(a) ${p.nome} venceu em ${dataBR(v.proxima)}.` : `A vacina ${v.nome} do(a) ${p.nome} vence em ${dataBR(v.proxima)}.`} Quer que a gente agende a aplicação? É rapidinho.`; };

// ---------------------------------------------------------------- PACIENTES
function telaPacientes() {
  const q = est.busca.trim().toLowerCase();
  const l = db.pets.filter((p) => !q || `${p.nome} ${tutorDe(p)?.nome} ${p.raca}`.toLowerCase().includes(q)).sort((a, b) => a.nome.localeCompare(b.nome));
  if (est.sel && !db.pets.some((p) => p.id === est.sel)) est.sel = null;
  return `<div class="cab"><div><h1>Pacientes</h1><p>${db.pets.length} pets de ${db.tutores.length} tutores${q ? ` · procurando por “${esc(est.busca)}”` : ''}</p></div><button class="bt bt-pri" data-novo-pet>+ Novo pet</button></div>
    <div class="mesa"><div class="pets">${l.map((p) => `<button type="button" class="pet" data-sel="${p.id}" aria-pressed="${est.sel === p.id}"><div class="avatar">${icPet(p)}</div><div><b>${esc(p.nome)}</b><small>${esc(p.raca)} · ${idade(p.nasc)}<br>${esc(tutorDe(p)?.nome)}</small></div></button>`).join('') || '<p class="vazio">Nenhum pet encontrado.</p>'}</div>
    ${est.sel ? ficha(est.sel) : '<div class="cartao"><p class="vazio">Escolha um pet para ver a ficha completa.</p></div>'}</div>`;
}

// ---------------------------------------------------------------- VACINAS
function telaVacinas() {
  const lim = { vencidas: 0, 7: 7, 30: 30, 90: 90 }[est.filtroVac];
  const l = db.vacinas.filter((v) => v.proxima && (est.filtroVac === 'vencidas' ? diasAte(v.proxima) < 0 : diasAte(v.proxima) <= lim)).sort((a, b) => a.proxima.localeCompare(b.proxima));
  const filtros = [['vencidas', 'Vencidas'], ['7', 'Próximos 7 dias'], ['30', 'Próximos 30 dias'], ['90', 'Próximos 90 dias']];
  return `<div class="cab"><div><h1>Vacinas e vermífugos</h1><p>Lembre o tutor com a mensagem pronta no WhatsApp. Um toque e ele já pode agendar.</p></div>
    <div class="acoes">${filtros.map(([k, n]) => `<button class="bt ${est.filtroVac === k ? 'bt-pri' : ''}" data-filtro-vac="${k}">${n}</button>`).join('')}</div></div>
    <section class="cartao">${l.length ? `<table class="tabela empilha"><thead><tr><th>Pet</th><th>Tutor</th><th>Vacina</th><th>Próxima dose</th><th></th></tr></thead><tbody>${l.map((v) => { const p = pet(v.pet), t = tutorDe(p); return `<tr><td><b>${esc(p.nome)}</b></td><td>${esc(t?.nome)}</td><td>${esc(v.nome)}</td><td>${selVac(v)}</td><td class="num"><a class="bt bt-peq bt-zap" target="_blank" rel="noopener" href="${zap(t?.tel, lembrete(v))}">Lembrar no WhatsApp</a> <button class="bt bt-peq" data-agendar-vac="${v.id}">Agendar</button></td></tr>`; }).join('')}</tbody></table>` : '<p class="vazio">Nada para lembrar neste período.</p>'}</section>`;
}

// ---------------------------------------------------------------- INTERNAÇÃO
function telaInternacao() {
  const agora = horaAgora();
  return `<div class="cab"><div><h1>Internação</h1><p>${db.internados.length} pet${db.internados.length === 1 ? '' : 's'} internado${db.internados.length === 1 ? '' : 's'} · marque cada dose na hora em que der</p></div></div>
    ${db.internados.length ? `<div class="baias">${db.internados.map((i) => { const p = pet(i.pet); const fe = i.doses.filter((d) => d.feita).length; return `<section class="cartao"><div class="cartao-cab"><div><h3 class="baia">${esc(p.nome)}</h3><small style="color:var(--texto-2)">${esc(i.baia)} · desde ${dataBR(i.entrada)}</small></div><span class="selo selo-atendimento">${fe} de ${i.doses.length} doses</span></div>
      <div class="cartao-corpo"><p style="margin:0;color:var(--texto-2)">${esc(i.motivo)}</p><ul class="doses">${i.doses.map((d, k) => `<li class="${d.feita ? 'feita' : d.hora < agora ? 'atrasada' : ''}"><b>${d.hora}</b><span>${esc(d.remedio)}</span>${d.feita ? '<span class="selo selo-pronto">Feita</span>' : `<button class="bt bt-peq" data-dose="${i.id}:${k}">Dar agora</button>`}</li>`).join('')}</ul>
      <div class="acoes" style="margin-top:12px"><button class="bt bt-peq" data-nova-dose="${i.id}">+ Dose</button><button class="bt bt-peq" data-alta="${i.id}">Dar alta</button><a class="bt bt-peq bt-zap" target="_blank" rel="noopener" href="${zap(tutorDe(p)?.tel, `Olá! Notícias do(a) ${p.nome}: está internado(a) na ${i.baia}, recebeu ${fe} de ${i.doses.length} medicações de hoje e segue em observação. Qualquer novidade avisamos.`)}">Notícias ao tutor</a></div></div></section>`; }).join('')}</div>` : '<div class="cartao"><p class="vazio">Nenhum pet internado agora.</p></div>'}`;
}

// ---------------------------------------------------------------- ESTOQUE
function telaEstoque() {
  const l = [...db.estoque].sort((a, b) => (alertaItem(b) ? 1 : 0) - (alertaItem(a) ? 1 : 0) || a.nome.localeCompare(b.nome));
  return `<div class="cab"><div><h1>Estoque</h1><p>Vacinas, remédios e produtos com lote e validade. O que está acabando ou vencendo aparece primeiro.</p></div><button class="bt bt-pri" data-novo-item>+ Item</button></div>
    <section class="cartao"><table class="tabela empilha"><thead><tr><th>Item</th><th>Tipo</th><th>Lote</th><th>Validade</th><th class="num">Qtd.</th><th class="num">Preço</th><th></th></tr></thead><tbody>${l.map((x) => `<tr><td><b>${esc(x.nome)}</b>${alertaItem(x) ? `<br>${alertaItem(x)}` : ''}</td><td>${esc(x.tipo)}</td><td>${esc(x.lote)}</td><td>${dataBR(x.validade)}</td><td class="num"><b>${x.qtd}</b> <small style="color:var(--texto-3)">mín. ${x.minimo}</small></td><td class="num">${reais(x.preco)}</td><td class="num"><button class="bt bt-peq" data-entrada="${x.id}">+ Entrada</button></td></tr>`).join('')}</tbody></table></section>`;
}
const alertaItem = (x) => { const d = diasAte(x.validade); return d < 0 ? '<span class="selo selo-alerta">Vencido</span>' : d <= 30 ? `<span class="selo selo-chegou">Vence em ${d} dias</span>` : x.qtd < x.minimo ? '<span class="selo selo-alerta">Abaixo do mínimo</span>' : ''; };

// ---------------------------------------------------------------- CAIXA
const total = (v) => v.itens.reduce((s, i) => s + i.valor * i.qtd, 0);
function telaCaixa() {
  const h = hoje(), l = db.vendas.filter((v) => v.data === h).sort((a, b) => b.hora.localeCompare(a.hora));
  const formas = {}; l.forEach((v) => { formas[v.forma] = (formas[v.forma] || 0) + total(v); });
  return `<div class="cab"><div><h1>Caixa do dia</h1><p>${l.length} atendimento${l.length === 1 ? '' : 's'} cobrado${l.length === 1 ? '' : 's'} hoje</p></div><button class="bt bt-pri" data-cobrar="">+ Nova cobrança</button></div>
    <div class="duas"><section class="cartao"><div class="cartao-cab"><h2>Lançamentos</h2></div>${l.length ? `<table class="tabela empilha"><tbody>${l.map((v) => `<tr><td><b>${v.hora}</b> · ${esc(pet(v.pet)?.nome || 'Balcão')}<br><small style="color:var(--texto-2)">${v.itens.map((i) => `${esc(i.nome)}${i.qtd > 1 ? ` ×${i.qtd}` : ''}`).join(', ')}</small></td><td>${esc(v.forma)}</td><td class="num"><b>${reais(total(v))}</b></td></tr>`).join('')}</tbody></table>` : '<p class="vazio">Nada cobrado ainda hoje.</p>'}</section>
    <section class="cartao"><div class="cartao-cab"><h2>Fechamento</h2></div><div class="cartao-corpo">${Object.entries(formas).map(([f, v]) => `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dashed var(--linha)"><span>${esc(f)}</span><b>${reais(v)}</b></div>`).join('') || '<p class="vazio">Sem valores.</p>'}</div><div class="total"><span>Total do dia</span><b>${reais(Object.values(formas).reduce((s, v) => s + v, 0))}</b></div></section></div>`;
}

// ---------------------------------------------------------------- janelas
function janela(titulo, corpo, botoes, aoAbrir) {
  const fundo = $('#janela'), j = fundo.firstElementChild;
  j.innerHTML = `<div class="janela-cab"><h2 id="janela-t">${titulo}</h2><button class="fechar" data-fechar aria-label="Fechar">×</button></div><form class="janela-form" novalidate><div class="janela-corpo">${corpo}</div><div class="janela-pe"><button type="button" class="bt" data-fechar>Cancelar</button>${botoes}</div></form>`;
  fundo.hidden = false; j.querySelector('input, select, textarea')?.focus();
  aoAbrir?.(j.querySelector('form'));
  return j.querySelector('form');
}
const fecharJanela = () => { $('#janela').hidden = true; };
const opcoesPets = (sel) => db.pets.slice().sort((a, b) => a.nome.localeCompare(b.nome)).map((p) => `<option value="${p.id}" ${p.id === sel ? 'selected' : ''}>${esc(p.nome)} · ${esc(tutorDe(p)?.nome)}</option>`).join('');

function abrirProntuario(id) {
  const p = pet(id);
  const f = janela(`Consulta de ${esc(p.nome)}`, `<div class="grade-campos"><label class="campo largo">Queixa do tutor<textarea name="queixa" required placeholder="O que o tutor contou"></textarea></label>
    <label class="campo">Peso (kg)<input name="peso" inputmode="decimal" value="${pesoAtual(p) ?? ''}"></label><label class="campo">Temperatura (°C)<input name="temp" inputmode="decimal" placeholder="38,5"></label>
    <label class="campo">Freq. cardíaca (bpm)<input name="fc" inputmode="numeric"></label><label class="campo">Freq. respiratória (mpm)<input name="fr" inputmode="numeric"></label>
    <label class="campo largo">Diagnóstico<input name="diag" required></label><label class="campo largo">Prescrição e orientações<textarea name="presc" placeholder="Remédio, dose, horário e por quantos dias"></textarea></label>
    <label class="campo">Veterinário<select name="vet">${db.vets.filter((v) => v.startsWith('Dr')).map((v) => `<option>${esc(v)}</option>`).join('')}</select></label></div>`, '<button class="bt bt-pri">Salvar consulta</button>');
  f.onsubmit = (e) => {
    e.preventDefault(); if (!f.queixa.value.trim() || !f.diag.value.trim()) return avisar('Preencha a queixa e o diagnóstico.');
    const num = (v) => (v.trim() ? Number(v.replace(',', '.')) : null);
    const peso = num(f.peso.value);
    db.prontuarios.push({ id: uid(), pet: id, data: hoje(), vet: f.vet.value, queixa: f.queixa.value.trim(), exame: { peso, temp: num(f.temp.value), fc: num(f.fc.value), fr: num(f.fr.value) }, diagnostico: f.diag.value.trim(), prescricao: f.presc.value.trim() });
    if (peso && peso !== pesoAtual(p)) p.pesos.push({ data: hoje(), kg: peso });
    const a = db.agenda.find((x) => x.pet === id && x.data === hoje() && x.status !== 'pronto'); if (a) a.status = 'pronto';
    salvar(); fecharJanela(); est.aba = 'prontuario'; avisar(`Consulta de ${p.nome} registrada.`); desenhar();
  };
}
function imprimirReceita(idPr) {
  const x = db.prontuarios.find((r) => r.id === idPr), p = pet(x.pet), t = tutorDe(p);
  const w = window.open('', '_blank'); if (!w) return avisar('Libere as janelas para imprimir a receita.');
  w.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Receita · ${esc(p.nome)}</title><style>body{font:15px/1.6 Georgia,serif;color:#1b2340;max-width:680px;margin:40px auto;padding:0 24px}h1{font-size:22px;margin:0}small{color:#555}.cab{display:flex;justify-content:space-between;border-bottom:2px solid #1f3e9e;padding-bottom:12px;margin-bottom:20px}.assin{margin-top:80px;border-top:1px solid #333;width:260px;text-align:center;padding-top:6px}</style></head><body>
    <div class="cab"><div><h1>${esc(db.clinica)}</h1><small>Receita veterinária</small></div><small>${dataBR(x.data)}</small></div>
    <p><b>Paciente:</b> ${esc(p.nome)} (${esc(p.raca)}, ${esc(p.sexo.toLowerCase())}, ${pesoAtual(p) ?? '—'} kg)<br><b>Tutor:</b> ${esc(t?.nome)}</p>
    <p><b>Diagnóstico:</b> ${esc(x.diagnostico)}</p><p style="white-space:pre-wrap"><b>Prescrição:</b><br>${esc(x.prescricao)}</p>
    <div class="assin">${esc(x.vet)}<br><small>Médico(a)-veterinário(a) · CRMV</small></div><script>print()<\/script></body></html>`);
  w.document.close();
}
function abrirAplicarVacina(id, nome = '') {
  const vacinasEst = db.estoque.filter((x) => x.tipo === 'Vacina' || /vermífugo/i.test(x.nome));
  const f = janela(`Vacina aplicada em ${esc(pet(id).nome)}`, `<div class="grade-campos"><label class="campo largo">Vacina<select name="item">${vacinasEst.map((x) => `<option value="${x.id}" ${x.nome.startsWith(nome) ? 'selected' : ''}>${esc(x.nome)} · lote ${esc(x.lote)} · ${x.qtd} em estoque</option>`).join('')}</select></label>
    <label class="campo">Próxima dose em<select name="prox"><option value="21">21 dias (reforço)</option><option value="90">90 dias</option><option value="365" selected>1 ano</option><option value="">Não repete</option></select></label><label class="campo">Cobrar aplicação<select name="cobrar"><option value="1">Sim, lançar no caixa</option><option value="">Não</option></select></label></div>
    <p style="margin:0;color:var(--texto-2);font-size:13px">Sai 1 unidade do estoque e a próxima dose entra nos lembretes.</p>`, '<button class="bt bt-pri">Registrar</button>');
  f.onsubmit = (e) => {
    e.preventDefault(); const it = db.estoque.find((x) => x.id === f.item.value); if (!it) return;
    if (it.qtd < 1) return avisar('Essa vacina acabou no estoque. Dê entrada antes.');
    it.qtd -= 1;
    db.vacinas.push({ id: uid(), pet: id, nome: it.nome.replace(/^Vacina /, ''), data: hoje(), proxima: f.prox.value ? maisDias(hoje(), Number(f.prox.value)) : null, lote: it.lote });
    // a dose que estava pendente para a mesma vacina sai dos lembretes
    db.vacinas.filter((v) => v.pet === id && v.proxima && diasAte(v.proxima) <= 30 && it.nome.toLowerCase().includes(v.nome.split(' ')[0].toLowerCase()) && v.data !== hoje()).forEach((v) => { v.proxima = null; });
    if (f.cobrar.value) db.vendas.push({ id: uid(), data: hoje(), hora: horaAgora(), pet: id, itens: [{ nome: it.nome, valor: it.preco, qtd: 1 }, { nome: 'Aplicação de vacina', valor: 25, qtd: 1 }], forma: 'PIX' });
    salvar(); fecharJanela(); avisar(`Vacina registrada${f.cobrar.value ? ' e lançada no caixa' : ''}.`); desenhar();
  };
}
function abrirNovoAtendimento(petSel, tipo = 'Consulta') {
  const f = janela('Novo atendimento', `<div class="grade-campos"><label class="campo largo">Pet<select name="pet">${opcoesPets(petSel)}</select></label>
    <label class="campo">Tipo<select name="tipo">${Object.keys(TIPOS).map((t) => `<option ${t === tipo ? 'selected' : ''}>${t}</option>`).join('')}</select></label><label class="campo">Data<input name="data" type="date" value="${hoje()}"></label>
    <label class="campo">Horário<input name="hora" type="time" value="17:00" step="900"></label><label class="campo">Com<select name="vet">${db.vets.map((v) => `<option>${esc(v)}</option>`).join('')}</select></label></div>`, '<button class="bt bt-pri">Agendar</button>');
  f.onsubmit = (e) => {
    e.preventDefault();
    if (db.agenda.some((a) => a.data === f.data.value && a.hora === f.hora.value && a.vet === f.vet.value)) return avisar(`${f.vet.value} já tem atendimento às ${f.hora.value}.`);
    db.agenda.push({ id: uid(), data: f.data.value, hora: f.hora.value, pet: f.pet.value, tipo: f.tipo.value, vet: f.vet.value, status: 'aguardando', valor: TIPOS[f.tipo.value] ?? 0 });
    salvar(); fecharJanela(); avisar(`Agendado: ${pet(f.pet.value).nome} · ${dataBR(f.data.value)} às ${f.hora.value}.`); desenhar();
  };
}
function abrirNovoPet() {
  const f = janela('Novo pet', `<div class="grade-campos"><label class="campo">Nome do pet<input name="nome" required></label><label class="campo">Espécie<select name="especie"><option value="cao">Cão</option><option value="gato">Gato</option><option value="outro">Outro</option></select></label>
    <label class="campo">Raça<input name="raca" placeholder="SRD"></label><label class="campo">Sexo<select name="sexo"><option>Macho</option><option>Fêmea</option></select></label>
    <label class="campo">Nascimento (aprox.)<input name="nasc" type="date" value="${maisDias(hoje(), -365)}"></label><label class="campo">Peso (kg)<input name="peso" inputmode="decimal"></label>
    <label class="campo largo">Tutor<select name="tutor"><option value="">Tutor novo (preencha abaixo)</option>${db.tutores.map((t) => `<option value="${t.id}">${esc(t.nome)}</option>`).join('')}</select></label>
    <label class="campo">Nome do tutor novo<input name="tnome"></label><label class="campo">WhatsApp do tutor<input name="ttel" inputmode="tel" placeholder="(16) 99999-9999"></label>
    <label class="campo largo">Alergias<input name="alergias" placeholder="Deixe em branco se não tiver"></label></div>`, '<button class="bt bt-pri">Cadastrar</button>');
  f.onsubmit = (e) => {
    e.preventDefault(); if (!f.nome.value.trim()) return avisar('Falta o nome do pet.');
    let tutor = f.tutor.value;
    if (!tutor) { if (!f.tnome.value.trim()) return avisar('Escolha o tutor ou preencha o nome do tutor novo.'); tutor = uid(); db.tutores.push({ id: tutor, nome: f.tnome.value.trim(), tel: soDigitos(f.ttel.value) }); }
    const id = uid(), kg = Number(f.peso.value.replace(',', '.'));
    db.pets.push({ id, tutor, nome: f.nome.value.trim(), especie: f.especie.value, raca: f.raca.value.trim() || 'SRD', sexo: f.sexo.value, nasc: f.nasc.value, castrado: false, alergias: f.alergias.value.trim(), pesos: kg ? [{ data: hoje(), kg }] : [] });
    salvar(); fecharJanela(); est.secao = 'pacientes'; est.sel = id; est.aba = 'resumo'; avisar(`${f.nome.value.trim()} cadastrado(a).`); desenhar();
  };
}
function abrirCobrar(petSel) {
  const itens = [];
  const f = janela('Cobrança', `<div class="grade-campos"><label class="campo largo">Pet<select name="pet"><option value="">Venda no balcão (sem pet)</option>${opcoesPets(petSel)}</select></label>
    <label class="campo">Serviço<select name="serv"><option value="">Escolher…</option>${SERVICOS.map(([n, v], i) => `<option value="${i}">${esc(n)} · ${reais(v)}</option>`).join('')}</select></label>
    <label class="campo">Produto do estoque<select name="prod"><option value="">Escolher…</option>${db.estoque.filter((x) => x.qtd > 0).map((x) => `<option value="${x.id}">${esc(x.nome)} · ${reais(x.preco)}</option>`).join('')}</select></label>
    <div class="largo" data-itens></div>
    <label class="campo largo">Forma de pagamento<select name="forma"><option>PIX</option><option>Dinheiro</option><option>Cartão de débito</option><option>Cartão de crédito</option></select></label></div>`, '<button class="bt bt-pri">Receber</button>');
  const lista = f.querySelector('[data-itens]');
  const desenhaItens = () => { lista.innerHTML = itens.length ? `<table class="tabela">${itens.map((i, k) => `<tr><td>${esc(i.nome)}</td><td class="num">${reais(i.valor)}</td><td class="num"><button type="button" class="bt bt-peq bt-perigo" data-tirar="${k}">Tirar</button></td></tr>`).join('')}<tr><td><b>Total</b></td><td class="num"><b>${reais(itens.reduce((s, i) => s + i.valor, 0))}</b></td><td></td></tr></table>` : '<p class="vazio" style="padding:8px">Escolha os serviços e produtos acima.</p>'; };
  f.serv.onchange = () => { if (f.serv.value === '') return; const [n, v] = SERVICOS[Number(f.serv.value)]; itens.push({ nome: n, valor: v, qtd: 1 }); f.serv.value = ''; desenhaItens(); };
  f.prod.onchange = () => { const x = db.estoque.find((y) => y.id === f.prod.value); if (!x) return; itens.push({ nome: x.nome, valor: x.preco, qtd: 1, item: x.id }); f.prod.value = ''; desenhaItens(); };
  lista.onclick = (e) => { const b = e.target.closest('[data-tirar]'); if (b) { itens.splice(Number(b.dataset.tirar), 1); desenhaItens(); } };
  // sugestão: o atendimento de hoje desse pet já entra na conta
  const a = petSel && db.agenda.find((x) => x.pet === petSel && x.data === hoje());
  if (a && a.valor) itens.push({ nome: a.tipo === 'Consulta' ? 'Consulta clínica' : a.tipo, valor: a.valor, qtd: 1 });
  desenhaItens();
  f.onsubmit = (e) => {
    e.preventDefault(); if (!itens.length) return avisar('Escolha pelo menos um serviço ou produto.');
    for (const i of itens) if (i.item) { const x = db.estoque.find((y) => y.id === i.item); if (x) x.qtd = Math.max(0, x.qtd - 1); }
    db.vendas.push({ id: uid(), data: hoje(), hora: horaAgora(), pet: f.pet.value || null, itens: itens.map(({ nome, valor, qtd }) => ({ nome, valor, qtd })), forma: f.forma.value });
    salvar(); fecharJanela(); avisar(`Recebido: ${reais(itens.reduce((s, i) => s + i.valor, 0))} no ${f.forma.value}.`); desenhar();
  };
}
function abrirInternar(id) {
  const f = janela(`Internar ${esc(pet(id).nome)}`, `<div class="grade-campos"><label class="campo">Baia<select name="baia">${['Baia 1', 'Baia 2', 'Baia 3', 'Baia 4', 'Baia 5'].filter((b) => !db.internados.some((i) => i.baia === b)).map((b) => `<option>${b}</option>`).join('')}</select></label>
    <label class="campo">Primeira medicação às<input name="hora" type="time" value="${horaAgora()}"></label><label class="campo largo">Motivo<input name="motivo" required></label><label class="campo largo">Medicação<input name="remedio" placeholder="Ex.: Soro fisiológico 500 ml IV"></label></div>`, '<button class="bt bt-pri">Internar</button>');
  f.onsubmit = (e) => {
    e.preventDefault(); if (!f.motivo.value.trim()) return avisar('Informe o motivo.');
    db.internados.push({ id: uid(), pet: id, baia: f.baia.value, motivo: f.motivo.value.trim(), entrada: hoje(), doses: f.remedio.value.trim() ? [{ hora: f.hora.value, remedio: f.remedio.value.trim(), feita: false }] : [] });
    salvar(); fecharJanela(); est.secao = 'internacao'; avisar(`${pet(id).nome} internado(a) na ${f.baia.value}.`); desenhar();
  };
}
function abrirNovaDose(idInt) {
  const f = janela('Nova dose', '<div class="grade-campos"><label class="campo">Horário<input name="hora" type="time" required></label><label class="campo">Medicação<input name="remedio" required></label></div>', '<button class="bt bt-pri">Adicionar</button>');
  f.onsubmit = (e) => { e.preventDefault(); if (!f.hora.value || !f.remedio.value.trim()) return avisar('Preencha horário e medicação.'); const i = db.internados.find((x) => x.id === idInt); i.doses.push({ hora: f.hora.value, remedio: f.remedio.value.trim(), feita: false }); i.doses.sort((a, b) => a.hora.localeCompare(b.hora)); salvar(); fecharJanela(); desenhar(); };
}
function abrirEntrada(idItem) {
  const x = db.estoque.find((y) => y.id === idItem);
  const f = janela(`Entrada · ${esc(x.nome)}`, `<div class="grade-campos"><label class="campo">Quantidade<input name="qtd" type="number" min="1" value="10"></label><label class="campo">Lote<input name="lote" value="${esc(x.lote)}"></label><label class="campo">Validade<input name="val" type="date" value="${x.validade}"></label></div>`, '<button class="bt bt-pri">Dar entrada</button>');
  f.onsubmit = (e) => { e.preventDefault(); const q = Math.round(Number(f.qtd.value)); if (!(q > 0)) return avisar('Quantidade inválida.'); x.qtd += q; x.lote = f.lote.value.trim() || x.lote; x.validade = f.val.value || x.validade; salvar(); fecharJanela(); avisar(`+${q} ${x.nome}.`); desenhar(); };
}
function abrirNovoItem() {
  const f = janela('Novo item no estoque', `<div class="grade-campos"><label class="campo largo">Nome<input name="nome" required></label><label class="campo">Tipo<select name="tipo"><option>Vacina</option><option>Medicamento</option><option>Insumo</option><option>Produto</option></select></label>
    <label class="campo">Quantidade<input name="qtd" type="number" min="0" value="0"></label><label class="campo">Mínimo<input name="min" type="number" min="0" value="5"></label><label class="campo">Preço de venda (R$)<input name="preco" inputmode="decimal" value="0"></label>
    <label class="campo">Lote<input name="lote"></label><label class="campo">Validade<input name="val" type="date" value="${maisDias(hoje(), 365)}"></label></div>`, '<button class="bt bt-pri">Salvar</button>');
  f.onsubmit = (e) => { e.preventDefault(); if (!f.nome.value.trim()) return avisar('Falta o nome.'); db.estoque.push({ id: uid(), nome: f.nome.value.trim(), tipo: f.tipo.value, qtd: Number(f.qtd.value) || 0, minimo: Number(f.min.value) || 0, lote: f.lote.value.trim() || '—', validade: f.val.value, preco: Number(f.preco.value.replace(',', '.')) || 0 }); salvar(); fecharJanela(); desenhar(); };
}

// ---------------------------------------------------------------- desenho e cliques
function desenhar() {
  topo();
  $('#tela').innerHTML = ({ hoje: telaHoje, pacientes: telaPacientes, vacinas: telaVacinas, internacao: telaInternacao, estoque: telaEstoque, caixa: telaCaixa })[est.secao]();
}
document.addEventListener('click', (e) => {
  const b = e.target.closest('button, a'); if (!b) return;
  const d = b.dataset;
  if (d.fechar !== undefined) return fecharJanela();
  if (d.secao) { est.secao = d.secao; est.aba = 'resumo'; if (d.secao !== 'pacientes') est.busca = ''; desenhar(); $('#tela').focus(); return; }
  if (d.sel) { est.sel = d.sel; est.aba = 'resumo'; return desenhar(); }
  if (d.aba) { est.aba = d.aba; return desenhar(); }
  if (d.avancar) { const a = db.agenda.find((x) => x.id === d.avancar); if (d.para === 'pronto') return abrirProntuario(a.pet); a.status = d.para; salvar(); avisar(d.para === 'chegou' ? `${pet(a.pet).nome} chegou.` : `Atendimento de ${pet(a.pet).nome} iniciado.`); return desenhar(); }
  if (d.prontuario) return abrirProntuario(d.prontuario);
  if (d.receita) return imprimirReceita(d.receita);
  if (d.aplicar) return abrirAplicarVacina(d.aplicar);
  if (d.cobrar !== undefined) return abrirCobrar(d.cobrar || null);
  if (d.internar) return abrirInternar(d.internar);
  if (d.novoAtendimento !== undefined) return abrirNovoAtendimento(est.sel);
  if (d.novoPet !== undefined) return abrirNovoPet();
  if (d.filtroVac) { est.filtroVac = d.filtroVac; return desenhar(); }
  if (d.agendarVac) { const v = db.vacinas.find((x) => x.id === d.agendarVac); return abrirNovoAtendimento(v.pet, 'Vacina'); }
  if (d.dose) { const [i, k] = d.dose.split(':'); const int = db.internados.find((x) => x.id === i); int.doses[Number(k)].feita = true; salvar(); avisar(`Dose dada: ${int.doses[Number(k)].remedio}.`); return desenhar(); }
  if (d.novaDose) return abrirNovaDose(d.novaDose);
  if (d.alta) { const i = db.internados.find((x) => x.id === d.alta); if (!confirm(`Dar alta para ${pet(i.pet).nome}?`)) return; db.internados = db.internados.filter((x) => x.id !== d.alta); salvar(); avisar(`${pet(i.pet).nome} recebeu alta.`); return desenhar(); }
  if (d.entrada) return abrirEntrada(d.entrada);
  if (d.novoItem !== undefined) return abrirNovoItem();
  if (d.recomecar !== undefined) { if (!confirm('Apagar as mudanças e voltar aos dados de exemplo?')) return; db = exemplo(); salvar(); est.sel = null; est.secao = 'hoje'; return desenhar(); }
});
$('#janela').addEventListener('click', (e) => { if (e.target.id === 'janela') fecharJanela(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#janela').hidden) fecharJanela(); });
$('#busca').addEventListener('input', (e) => { est.busca = e.target.value; est.secao = 'pacientes'; const l = db.pets.filter((p) => `${p.nome} ${tutorDe(p)?.nome}`.toLowerCase().includes(est.busca.toLowerCase())); est.sel = l.length === 1 ? l[0].id : est.sel; desenhar(); });
desenhar();
