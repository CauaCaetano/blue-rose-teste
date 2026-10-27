// VetNature (linha Vexorin) · sistema para clínica veterinária (demonstração: os dados ficam só neste navegador).
// Telas: Hoje, Agenda, Pacientes, Tutores, Vacinas, Internação, Estética, Exames, Estoque, Caixa e Relatórios.
// Código próprio, sem base compartilhada. Fotos de exemplo do Pexels (licença livre) em fotos/.
const CHAVE = 'vetnature-demo-v2';
const $ = (s, el = document) => el.querySelector(s);
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const reais = (n) => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const uid = () => Math.random().toString(36).slice(2, 10);
const hoje = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const maisDias = (iso, n) => { const d = new Date(`${iso}T12:00:00`); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const dataBR = (iso) => (iso ? iso.split('-').reverse().join('/') : '—');
const diasAte = (iso) => Math.round((new Date(`${iso}T12:00:00`) - new Date(`${hoje()}T12:00:00`)) / 864e5);
const diaSemana = (iso, f = 'short') => new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', { weekday: f });
const idade = (nasc) => { const m = Math.max(0, Math.round((new Date(`${hoje()}T12:00:00`) - new Date(`${nasc}T12:00:00`)) / (864e5 * 30.44))); return m < 12 ? `${m} ${m === 1 ? 'mês' : 'meses'}` : `${Math.floor(m / 12)} ${Math.floor(m / 12) === 1 ? 'ano' : 'anos'}`; };
const soDigitos = (s) => String(s || '').replace(/\D/g, '');
const telBR = (t) => String(t || '').replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
const horaAgora = () => new Date().toTimeString().slice(0, 5);
const saudacao = () => { const h = new Date().getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'; };
const primeiro = (n) => String(n || '').split(' ')[0];

// ---------------------------------------------------------------- ícones
const IC = {
  hoje: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  agenda: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17"/></svg>',
  pacientes: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="6" cy="10" r="2.2"/><circle cx="10" cy="5.8" r="2.2"/><circle cx="14" cy="5.8" r="2.2"/><circle cx="18" cy="10" r="2.2"/><path d="M12 11.5c-3 0-5.5 3.6-5.5 6.1 0 1.6 1.2 2.4 2.6 2.4 1.2 0 1.8-.6 2.9-.6s1.7.6 2.9.6c1.4 0 2.6-.8 2.6-2.4 0-2.5-2.5-6.1-5.5-6.1z"/></svg>',
  tutores: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.4 3.3-5.5 6.5-5.5s5.9 2.1 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18.5 14.8c1.7.7 2.8 2.4 3 5.2"/></svg>',
  vacinas: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="m17 3 4 4M19 5l-9.5 9.5M14 6l4 4M4 20l3.5-3.5"/><path d="M9.5 10.5 13.5 14.5 9 19 5 15z"/></svg>',
  internacao: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 18V8M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11" r="2"/></svg>',
  estetica: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.6 7.5 20 18M8.6 16.5 20 6"/></svg>',
  exames: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3M7.5 14h9"/></svg>',
  estoque: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3 4 7v10l8 4 8-4V7z"/><path d="m4 7 8 4 8-4M12 11v10"/></svg>',
  caixa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h3"/></svg>',
  relatorios: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  cao: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="6" cy="10" r="2.2"/><circle cx="10" cy="5.8" r="2.2"/><circle cx="14" cy="5.8" r="2.2"/><circle cx="18" cy="10" r="2.2"/><path d="M12 11.5c-3 0-5.5 3.6-5.5 6.1 0 1.6 1.2 2.4 2.6 2.4 1.2 0 1.8-.6 2.9-.6s1.7.6 2.9.6c1.4 0 2.6-.8 2.6-2.4 0-2.5-2.5-6.1-5.5-6.1z"/></svg>',
  gato: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 3.5 8.6 8a8.6 8.6 0 0 1 6.8 0L19 3.5l.6 7.3A7.5 7.5 0 0 1 21 15c0 3.6-4 6-9 6s-9-2.4-9-6a7.5 7.5 0 0 1 1.4-4.2z"/></svg>',
  outro: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.4-7.5-10.2A4.3 4.3 0 0 1 12 8a4.3 4.3 0 0 1 7.5 2.8C19.5 16.6 12 21 12 21z"/></svg>',
  camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
};
const SECOES = [['hoje', 'Hoje'], ['agenda', 'Agenda'], ['pacientes', 'Pacientes'], ['tutores', 'Tutores'], ['vacinas', 'Vacinas'], ['internacao', 'Internação'], ['estetica', 'Estética'], ['exames', 'Exames'], ['estoque', 'Estoque'], ['caixa', 'Caixa'], ['relatorios', 'Relatórios']];
const TIPOS = { Consulta: 160, Retorno: 0, Vacina: 0, 'Banho e tosa': 90, Cirurgia: 850, Exame: 120 };
const SERVICOS = [['Consulta clínica', 160], ['Retorno (até 15 dias)', 0], ['Consulta de emergência', 280], ['Banho', 60], ['Banho e tosa', 90], ['Tosa higiênica', 45], ['Aplicação de vacina', 25], ['Hemograma', 120], ['Bioquímico (função renal)', 140], ['Ultrassom', 220], ['Raio-x', 180], ['Castração', 850], ['Limpeza de tártaro', 480], ['Diária de internação', 180], ['Microchip', 120]];
const EXAMES = ['Hemograma completo', 'Bioquímico (ureia e creatinina)', 'Bioquímico (função hepática)', 'Urinálise', 'Parasitológico de fezes', 'Ultrassom abdominal', 'Raio-x de tórax', 'Teste rápido FIV/FeLV', 'Teste rápido de cinomose'];
const FORMAS = ['PIX', 'Dinheiro', 'Cartão de débito', 'Cartão de crédito', 'Fiado (a receber)'];
const STATUS = { aguardando: ['Agendado', 'selo-aguardando'], chegou: ['Chegou', 'selo-chegou'], atendimento: ['Em atendimento', 'selo-atendimento'], pronto: ['Atendido', 'selo-pronto'] };
const ESTETICA = [['aguardando', 'Chegou'], ['banho', 'No banho'], ['secagem', 'Secagem e tosa'], ['pronto', 'Pronto para buscar']];
const EXAME_ST = { solicitado: ['Solicitado', 'selo-aguardando'], coletado: ['Coletado', 'selo-chegou'], pronto: ['Resultado pronto', 'selo-pronto'] };

// ---------------------------------------------------------------- dados de exemplo
function exemplo() {
  const h = hoje();
  const tutores = [
    ['t1', 'Mariana Lopes', '16991230011', 'Rua das Acácias, 120'], ['t2', 'Carlos Henrique Dias', '16991230012', 'Av. Brasil, 845'], ['t3', 'Fernanda Rocha', '16991230013', 'Rua São Paulo, 33'],
    ['t4', 'João Pedro Alves', '16991230014', 'Rua Goiás, 1.020'], ['t5', 'Beatriz Nogueira', '16991230015', 'Rua XV de Novembro, 77'], ['t6', 'Ricardo Santana', '16991230016', 'Av. Independência, 400'], ['t7', 'Luana Teixeira', '16991230017', 'Rua Minas Gerais, 512'],
  ].map(([id, nome, tel, end]) => ({ id, nome, tel, end }));
  const pet = (id, tutor, nome, especie, raca, sexo, diasNasc, castrado, pesos, extra = {}) => ({ id, tutor, nome, especie, raca, sexo, nasc: maisDias(h, diasNasc), castrado, alergias: '', pelagem: '', microchip: '', obs: '', foto: `fotos/${nome.toLowerCase()}.webp`, pesos: pesos.map(([d, kg]) => ({ data: maisDias(h, d), kg })), ...extra });
  const pets = [
    pet('p1', 't1', 'Thor', 'cao', 'Golden Retriever', 'Macho', -1460 + 3, true, [[-240, 31.2], [-150, 32.0], [-60, 32.8], [-10, 33.4]], { alergias: 'Dipirona', pelagem: 'Dourada', microchip: '963 001 234 567 890' }),
    pet('p2', 't1', 'Mel', 'gato', 'SRD', 'Fêmea', -900, true, [[-200, 3.9], [-90, 4.1], [-20, 4.2]], { pelagem: 'Laranja tigrada' }),
    pet('p3', 't2', 'Bob', 'cao', 'Shih Tzu', 'Macho', -2900, false, [[-300, 7.8], [-120, 8.4], [-15, 8.9]], { pelagem: 'Creme' }),
    pet('p4', 't3', 'Luna', 'cao', 'Border Collie', 'Fêmea', -220, false, [[-120, 6.2], [-60, 10.5], [-5, 13.1]], { pelagem: 'Tricolor' }),
    pet('p5', 't4', 'Nina', 'gato', 'Persa', 'Fêmea', -1800 + 5, true, [[-180, 4.8], [-30, 4.5]], { alergias: 'Ração com frango', pelagem: 'Branca' }),
    pet('p6', 't5', 'Pipoca', 'outro', 'Coelho anão', 'Fêmea', -500, false, [[-100, 1.6], [-30, 1.7]], { pelagem: 'Caramelo' }),
    pet('p7', 't6', 'Max', 'cao', 'Pastor Alemão', 'Macho', -3300, true, [[-200, 36.0], [-60, 34.2], [-3, 33.1]], { pelagem: 'Preta e castanha', microchip: '963 001 998 112 004' }),
    pet('p8', 't7', 'Frajola', 'gato', 'SRD', 'Macho', -120, false, [[-60, 1.2], [-20, 1.9]], { pelagem: 'Preta e branca' }),
    pet('p9', 't2', 'Amora', 'cao', 'Lhasa Apso', 'Fêmea', -1100, true, [[-90, 6.0], [-30, 6.1]], { pelagem: 'Marrom' }),
  ];
  const ag = (d, hora, p, tipo, vet, status = 'aguardando') => ({ id: uid(), data: maisDias(h, d), hora, pet: p, tipo, vet, status: d < 0 ? 'pronto' : status, valor: TIPOS[tipo] ?? 0 });
  const PA = 'Dra. Paula Andrade', RM = 'Dr. Rafael Mota';
  const agenda = [
    ag(0, '08:30', 'p3', 'Consulta', PA, 'pronto'), ag(0, '09:00', 'p4', 'Vacina', RM, 'pronto'), ag(0, '09:30', 'p1', 'Retorno', PA, 'atendimento'), ag(0, '10:00', 'p8', 'Vacina', RM, 'chegou'),
    ag(0, '11:00', 'p9', 'Consulta', PA), ag(0, '14:00', 'p6', 'Consulta', RM), ag(0, '15:30', 'p2', 'Exame', PA),
    ag(1, '09:00', 'p7', 'Retorno', RM), ag(1, '10:30', 'p5', 'Consulta', PA), ag(1, '14:00', 'p4', 'Cirurgia', RM), ag(2, '08:30', 'p9', 'Vacina', PA), ag(2, '16:00', 'p1', 'Consulta', RM),
    ag(3, '09:30', 'p2', 'Retorno', PA), ag(4, '11:00', 'p3', 'Exame', RM), ag(5, '10:00', 'p8', 'Vacina', PA),
  ];
  const pr = (p, d, vet, queixa, ex, diag, presc) => ({ id: uid(), pet: p, data: maisDias(h, d), vet, queixa, exame: ex, diagnostico: diag, prescricao: presc });
  const prontuarios = [
    pr('p1', -10, PA, 'Coceira intensa nas orelhas há 5 dias.', { peso: 33.4, temp: 38.6, fc: 96, fr: 24 }, 'Otite externa bilateral.', 'Limpeza auricular 2x ao dia por 10 dias. Otológico com antifúngico: 5 gotas em cada orelha, 2x ao dia, 7 dias. Retorno em 10 dias.'),
    pr('p1', -150, RM, 'Check-up anual.', { peso: 32.0, temp: 38.5, fc: 90, fr: 22 }, 'Saudável.', 'Manter vacinas em dia. Escovação dos dentes 3x por semana.'),
    pr('p3', 0, PA, 'Tosse seca há uma semana, pior à noite.', { peso: 8.9, temp: 38.9, fc: 120, fr: 32 }, 'Traqueobronquite infecciosa (suspeita).', 'Xarope antitussígeno 2 ml 2x ao dia por 7 dias. Evitar coleira; usar peitoral. Retorno se piorar.'),
    pr('p7', -3, RM, 'Perda de peso e muita sede.', { peso: 33.1, temp: 38.4, fc: 88, fr: 22 }, 'Investigação de doença renal; exames solicitados.', 'Hemograma, bioquímico (ureia, creatinina) e urinálise. Dieta renal até o resultado.'),
    pr('p5', -30, PA, 'Vômitos esporádicos depois de comer.', { peso: 4.5, temp: 38.7, fc: 180, fr: 28 }, 'Alergia alimentar provável.', 'Trocar para ração hipoalergênica sem frango. Reavaliar em 30 dias.'),
  ];
  const vc = (p, nome, d, prox, lote) => ({ id: uid(), pet: p, nome, data: maisDias(h, d), proxima: prox == null ? null : maisDias(h, prox), lote });
  const vacinas = [
    vc('p1', 'V10 (polivalente)', -358, 7, 'V10-2391'), vc('p1', 'Antirrábica', -340, 25, 'AR-7710'), vc('p2', 'V5 felina', -370, -5, 'V5F-1180'),
    vc('p3', 'V10 (polivalente)', -200, 165, 'V10-2391'), vc('p3', 'Gripe canina', -362, 3, 'GC-5502'), vc('p4', 'V10 (1ª dose)', -21, null, 'V10-2391'), vc('p4', 'V10 (2ª dose)', 0, 21, 'V10-2402'),
    vc('p5', 'V5 felina', -330, 35, 'V5F-1180'), vc('p7', 'Antirrábica', -400, -35, 'AR-7701'), vc('p8', 'V5 felina (1ª dose)', -21, 0, 'V5F-1192'),
    vc('p9', 'Vermífugo', -88, 2, 'VRM-310'), vc('p6', 'Vermífugo', -60, 30, 'VRM-310'),
  ];
  const dose = (hora, remedio, feita = false) => ({ hora, remedio, feita });
  const internados = [
    { id: uid(), pet: 'p7', baia: 'Baia 2', motivo: 'Desidratação; investigação renal', entrada: maisDias(h, -1), doses: [dose('06:00', 'Soro fisiológico 500 ml IV', true), dose('08:00', 'Omeprazol 20 mg', true), dose('12:00', 'Soro fisiológico 500 ml IV'), dose('14:00', 'Antiemético 1 ml SC'), dose('20:00', 'Omeprazol 20 mg')] },
    { id: uid(), pet: 'p3', baia: 'Baia 4', motivo: 'Observação pós-crise de tosse', entrada: h, doses: [dose('10:00', 'Nebulização com soro 10 min', true), dose('16:00', 'Nebulização com soro 10 min'), dose('22:00', 'Xarope 2 ml')] },
  ];
  const estetica = [
    { id: uid(), data: h, hora: '08:00', pet: 'p5', servico: 'Banho e tosa', status: 'secagem', obs: 'Tosa na tesoura; laço rosa' },
    { id: uid(), data: h, hora: '09:00', pet: 'p9', servico: 'Banho', status: 'banho', obs: 'Shampoo hipoalergênico' },
    { id: uid(), data: h, hora: '10:30', pet: 'p3', servico: 'Tosa higiênica', status: 'aguardando', obs: '' },
    { id: uid(), data: h, hora: '07:30', pet: 'p2', servico: 'Banho', status: 'pronto', obs: '' },
  ];
  const ex = (p, nome, d, status, resultado = '') => ({ id: uid(), pet: p, nome, data: maisDias(h, d), status, resultado, lab: 'Laboratório VetLab' });
  const exames = [
    ex('p7', 'Hemograma completo', -3, 'pronto', 'Anemia leve (hematócrito 34%). Leucócitos normais.'), ex('p7', 'Bioquímico (ureia e creatinina)', -3, 'pronto', 'Ureia 98 mg/dL (alta); creatinina 2,4 mg/dL (alta). Compatível com doença renal estágio 2.'),
    ex('p7', 'Urinálise', -3, 'coletado'), ex('p3', 'Raio-x de tórax', 0, 'solicitado'), ex('p2', 'Hemograma completo', 0, 'solicitado'),
  ];
  const it = (nome, tipo, qtd, minimo, lote, val, preco, custo) => ({ id: uid(), nome, tipo, qtd, minimo, lote, validade: maisDias(h, val), preco, custo });
  const estoque = [
    it('Vacina V10 (polivalente)', 'Vacina', 14, 10, 'V10-2402', 210, 95, 42), it('Vacina antirrábica', 'Vacina', 6, 8, 'AR-7710', 160, 70, 28), it('Vacina V5 felina', 'Vacina', 9, 6, 'V5F-1192', 18, 110, 51),
    it('Vacina gripe canina', 'Vacina', 4, 5, 'GC-5502', 95, 120, 55), it('Vermífugo comprimido (cães até 10 kg)', 'Medicamento', 32, 15, 'VRM-310', 420, 28, 11),
    it('Antipulgas mastigável 10–20 kg', 'Medicamento', 7, 10, 'APL-882', 300, 89, 52), it('Omeprazol 20 mg (caixa)', 'Medicamento', 3, 4, 'OMP-118', 12, 19, 8), it('Xarope antitussígeno', 'Medicamento', 8, 4, 'XAR-221', 280, 38, 16),
    it('Soro fisiológico 500 ml', 'Insumo', 26, 20, 'SF-4401', 510, 9, 4), it('Ração renal 2 kg', 'Produto', 5, 3, 'RR-2209', 140, 145, 92), it('Shampoo hipoalergênico', 'Produto', 11, 4, 'SH-075', 600, 49, 21),
  ];
  // um mês de movimento para os relatórios
  const vendas = [];
  const cardapio = [['Consulta clínica', 160], ['Banho e tosa', 90], ['Banho', 60], ['Hemograma', 120], ['Vacina V10 (polivalente)', 95], ['Aplicação de vacina', 25], ['Antipulgas mastigável 10–20 kg', 89], ['Ultrassom', 220], ['Ração renal 2 kg', 145]];
  let semente = 7; const rnd = () => (semente = (semente * 9301 + 49297) % 233280) / 233280;
  for (let d = -29; d <= -1; d++) {
    if (diaSemana(maisDias(h, d)) === 'dom.') continue;
    const n = 3 + Math.floor(rnd() * 5);
    for (let k = 0; k < n; k++) {
      const itens = [cardapio[Math.floor(rnd() * cardapio.length)]]; if (rnd() > .6) itens.push(cardapio[Math.floor(rnd() * cardapio.length)]);
      vendas.push({ id: uid(), data: maisDias(h, d), hora: `${String(8 + Math.floor(rnd() * 10)).padStart(2, '0')}:${rnd() > .5 ? '30' : '00'}`, pet: pets[Math.floor(rnd() * pets.length)].id, itens: itens.map(([nome, valor]) => ({ nome, valor, qtd: 1 })), forma: FORMAS[Math.floor(rnd() * 4)], recebido: true });
    }
  }
  vendas.push({ id: uid(), data: maisDias(h, -12), hora: '15:00', pet: 'p7', itens: [{ nome: 'Ultrassom', valor: 220, qtd: 1 }, { nome: 'Bioquímico (função renal)', valor: 140, qtd: 1 }], forma: 'Fiado (a receber)', recebido: false });
  vendas.push({ id: uid(), data: maisDias(h, -5), hora: '11:00', pet: 'p6', itens: [{ nome: 'Consulta clínica', valor: 160, qtd: 1 }], forma: 'Fiado (a receber)', recebido: false });
  vendas.push({ id: uid(), data: h, hora: '08:55', pet: 'p3', itens: [{ nome: 'Consulta clínica', valor: 160, qtd: 1 }, { nome: 'Xarope antitussígeno', valor: 38, qtd: 1 }], forma: 'PIX', recebido: true });
  vendas.push({ id: uid(), data: h, hora: '09:25', pet: 'p4', itens: [{ nome: 'Vacina V10 (polivalente)', valor: 95, qtd: 1 }, { nome: 'Aplicação de vacina', valor: 25, qtd: 1 }], forma: 'Cartão de crédito', recebido: true });
  return { clinica: 'Clínica Veterinária Bem-Estar Animal', vets: [PA, RM, 'Equipe de estética'], tutores, pets, agenda, prontuarios, vacinas, internados, estetica, exames, estoque, vendas };
}
let db = (() => { try { return JSON.parse(localStorage.getItem(CHAVE)) || exemplo(); } catch { return exemplo(); } })();
const salvar = () => { try { localStorage.setItem(CHAVE, JSON.stringify(db)); } catch { avisar('O navegador ficou sem espaço para guardar a demonstração. Use "Recomeçar" ou fotos menores.'); } };

// ---------------------------------------------------------------- estado e ajudas
const est = { secao: 'hoje', sel: null, aba: 'resumo', filtroVac: '30', busca: '', dia: hoje(), tutor: null };
const pet = (id) => db.pets.find((p) => p.id === id);
const tutorDe = (p) => db.tutores.find((t) => t.id === p?.tutor);
const pesoAtual = (p) => (p.pesos.length ? p.pesos[p.pesos.length - 1].kg : null);
const avatar = (p, cls = '') => `<div class="avatar ${cls}">${p?.foto ? `<img src="${esc(p.foto)}" alt="Foto de ${esc(p.nome)}" loading="lazy">` : IC[p?.especie] || IC.outro}</div>`;
const avisar = (t) => { const el = document.createElement('div'); el.className = 'aviso'; el.textContent = t; $('#avisos').append(el); setTimeout(() => el.remove(), 3400); };
const zap = (tel, msg) => `https://wa.me/55${soDigitos(tel)}?text=${encodeURIComponent(msg)}`;
const vacPendentes = () => db.vacinas.filter((v) => v.proxima && diasAte(v.proxima) <= 7);
const total = (v) => v.itens.reduce((s, i) => s + i.valor * i.qtd, 0);
const aReceber = (tutorId) => db.vendas.filter((v) => !v.recebido && (!tutorId || tutorDe(pet(v.pet))?.id === tutorId));
const aniversariantes = () => db.pets.map((p) => { const [, m, d] = p.nasc.split('-'); let a = `${hoje().slice(0, 4)}-${m}-${d}`; if (diasAte(a) < 0) a = `${Number(hoje().slice(0, 4)) + 1}-${m}-${d}`; return { p, data: a, dias: diasAte(a) }; }).filter((x) => x.dias <= 7).sort((a, b) => a.dias - b.dias);

// ---------------------------------------------------------------- topo
function topo() {
  $('#clinica').textContent = db.clinica;
  const contas = { vacinas: vacPendentes().length, internacao: db.internados.reduce((n, i) => n + i.doses.filter((d) => !d.feita && d.hora <= horaAgora()).length, 0), estoque: db.estoque.filter((x) => x.qtd < x.minimo || diasAte(x.validade) <= 30).length, exames: db.exames.filter((e) => e.status === 'pronto' && !e.avisado).length, estetica: db.estetica.filter((e) => e.data === hoje() && e.status === 'pronto').length };
  $('#secoes').innerHTML = SECOES.map(([k, n]) => `<button type="button" data-secao="${k}" ${est.secao === k ? 'aria-current="page"' : ''}>${IC[k]}${n}${contas[k] ? `<span class="conta">${contas[k]}</span>` : ''}</button>`).join('');
}

// ---------------------------------------------------------------- HOJE
function telaHoje() {
  const h = hoje(), ag = db.agenda.filter((a) => a.data === h).sort((a, b) => a.hora.localeCompare(b.hora));
  if (!est.sel || !ag.some((a) => a.pet === est.sel)) est.sel = (ag.find((a) => a.status === 'atendimento') || ag.find((a) => a.status !== 'pronto') || ag[0])?.pet || null;
  const espera = ag.filter((a) => a.status === 'chegou').length, feitos = ag.filter((a) => a.status === 'pronto').length;
  const caixa = db.vendas.filter((v) => v.data === h && v.recebido).reduce((s, v) => s + total(v), 0);
  let turnoAnt = '';
  const fila = ag.map((a) => {
    const p = pet(a.pet), turno = a.hora < '12:00' ? 'MANHÃ' : 'TARDE', st = STATUS[a.status];
    const cab = turno !== turnoAnt ? `<p class="fila-hora">${turno}</p>` : ''; turnoAnt = turno;
    return `${cab}<button type="button" class="vez" data-sel="${p.id}" aria-pressed="${est.sel === p.id}"><time>${a.hora}</time><span class="vez-pet">${avatar(p, 'mini')}<span><b>${esc(p.nome)}</b><small>${esc(tutorDe(p)?.nome)} · <span class="tipo">${esc(a.tipo)}</span></small></span></span><span class="selo ${st[1]}">${st[0]}</span></button>`;
  }).join('');
  const aniv = aniversariantes();
  return `<div class="cab"><div><h1>${saudacao()}, equipe</h1><p>${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })} · ${ag.length} atendimentos na agenda</p></div></div>
  <div class="numeros"><div class="numero destaque"><span>Na sala de espera</span><b>${espera}</b></div><div class="numero"><span>Atendidos hoje</span><b>${feitos} de ${ag.length}</b></div><div class="numero"><span>Vacinas vencendo em 7 dias</span><b>${vacPendentes().length}</b></div><div class="numero"><span>Recebido hoje</span><b>${reais(caixa)}</b></div></div>
  ${aniv.length ? `<div class="faixa-aniv">${aniv.map(({ p, dias }) => `<div class="aniv">${avatar(p, 'mini')}<span><b>${esc(p.nome)}</b> faz ${idade(maisDias(p.nasc, -dias))} ${dias === 0 ? 'hoje' : dias === 1 ? 'amanhã' : `em ${dias} dias`}</span><a class="bt bt-peq bt-zap" target="_blank" rel="noopener" href="${zap(tutorDe(p)?.tel, `Olá, ${primeiro(tutorDe(p)?.nome)}! Toda a equipe da ${db.clinica} deseja um feliz aniversário para o(a) ${p.nome}! 🎉`)}">Parabéns</a></div>`).join('')}</div>` : ''}
  <div class="mesa"><section class="fila" aria-label="Fila do dia">${fila || '<p class="vazio">Nenhum atendimento hoje.</p>'}</section>${est.sel ? ficha(est.sel, ag.find((a) => a.pet === est.sel && a.status !== 'pronto') || ag.find((a) => a.pet === est.sel)) : ''}</div>`;
}

// ---------------------------------------------------------------- FICHA DO PET
function ficha(id, atend) {
  const p = pet(id); if (!p) return '';
  const t = tutorDe(p), int = db.internados.find((i) => i.pet === id);
  const vencidas = db.vacinas.filter((v) => v.pet === id && v.proxima && diasAte(v.proxima) < 0);
  const deve = aReceber(t?.id).reduce((s, v) => s + total(v), 0);
  const marc = [p.castrado ? '<span class="selo selo-aguardando">Castrado</span>' : '', p.alergias ? `<span class="selo selo-alerta">Alergia: ${esc(p.alergias)}</span>` : '', int ? `<span class="selo selo-atendimento">Internado · ${esc(int.baia)}</span>` : '', vencidas.length ? `<span class="selo selo-alerta">${vencidas.length} vacina${vencidas.length > 1 ? 's' : ''} vencida${vencidas.length > 1 ? 's' : ''}</span>` : '', deve ? `<span class="selo selo-chegou">Tutor deve ${reais(deve)}</span>` : ''].join('');
  const prox = atend && { aguardando: ['chegou', 'Marcar chegada'], chegou: ['atendimento', 'Iniciar atendimento'], atendimento: ['pronto', 'Finalizar e registrar'] }[atend.status];
  const abas = [['resumo', 'Resumo'], ['prontuario', 'Prontuário'], ['vacinas', 'Vacinas'], ['exames', 'Exames'], ['peso', 'Peso'], ['documentos', 'Documentos']];
  return `<section class="cartao ficha" aria-label="Ficha de ${esc(p.nome)}">
    <div class="ficha-topo"><button type="button" class="foto-pet" data-foto="${p.id}" title="Trocar a foto">${avatar(p, 'grande')}<span>${IC.camera}</span></button><div><h2>${esc(p.nome)}</h2><p>${esc(p.raca)} · ${esc(p.sexo)} · ${idade(p.nasc)} · ${pesoAtual(p) ?? '—'} kg</p><div class="marcadores">${marc}</div></div>
      <div class="acoes">${prox ? `<button class="bt bt-pri" data-avancar="${atend.id}" data-para="${prox[0]}">${prox[1]}</button>` : ''}<button class="bt" data-prontuario="${p.id}">Nova consulta</button><button class="bt" data-cobrar="${p.id}">Cobrar</button></div></div>
    <div class="abas" role="tablist">${abas.map(([k, n]) => `<button type="button" role="tab" data-aba="${k}" aria-selected="${est.aba === k}">${n}</button>`).join('')}</div>
    <div class="cartao-corpo">${({ resumo: abaResumo, prontuario: abaProntuario, vacinas: abaVacinas, exames: abaExames, peso: abaPeso, documentos: abaDocumentos })[est.aba](p, t)}</div></section>`;
}
function abaResumo(p, t) {
  const ult = db.prontuarios.filter((x) => x.pet === p.id).sort((a, b) => b.data.localeCompare(a.data))[0];
  const prox = db.vacinas.filter((v) => v.pet === p.id && v.proxima).sort((a, b) => a.proxima.localeCompare(b.proxima))[0];
  const proxAg = db.agenda.filter((a) => a.pet === p.id && a.data > hoje()).sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora))[0];
  return `<div class="dados"><div><span>Tutor</span><b><button class="link" data-ver-tutor="${t?.id}">${esc(t?.nome)}</button></b></div><div><span>WhatsApp</span><b>${esc(telBR(t?.tel))}</b></div><div><span>Espécie</span><b>${({ cao: 'Cão', gato: 'Gato' })[p.especie] || 'Outro'}</b></div>
    <div><span>Nascimento</span><b>${dataBR(p.nasc)}</b></div><div><span>Pelagem</span><b>${esc(p.pelagem || '—')}</b></div><div><span>Microchip</span><b>${esc(p.microchip || '—')}</b></div>
    <div><span>Última consulta</span><b>${ult ? dataBR(ult.data) : '—'}</b></div><div><span>Próxima vacina</span><b>${prox ? `${esc(prox.nome)} · ${dataBR(prox.proxima)}` : '—'}</b></div><div><span>Próximo horário</span><b>${proxAg ? `${dataBR(proxAg.data)} às ${proxAg.hora} · ${esc(proxAg.tipo)}` : '—'}</b></div></div>
    ${p.obs ? `<p class="nota">${esc(p.obs)}</p>` : ''}
    ${ult ? `<h3 class="sub-tit">Última anotação</h3><p style="margin:0;color:var(--texto-2)"><b style="color:var(--texto)">${esc(ult.diagnostico)}</b> ${esc(ult.prescricao)}</p>` : ''}
    <div class="acoes" style="margin-top:16px"><a class="bt bt-zap" target="_blank" rel="noopener" href="${zap(t?.tel, `Olá, ${primeiro(t?.nome)}! Aqui é da ${db.clinica}. Passando para falar sobre o(a) ${p.nome}.`)}">Mensagem ao tutor</a><button class="bt" data-editar-pet="${p.id}">Editar dados</button><button class="bt" data-agendar="${p.id}">Agendar</button><button class="bt" data-pedir-exame="${p.id}">Pedir exame</button><button class="bt" data-banho="${p.id}">Banho e tosa</button>${db.internados.some((i) => i.pet === p.id) ? '' : `<button class="bt" data-internar="${p.id}">Internar</button>`}</div>`;
}
function abaProntuario(p) {
  const l = db.prontuarios.filter((x) => x.pet === p.id).sort((a, b) => b.data.localeCompare(a.data));
  return l.length ? `<ol class="linha-tempo">${l.map((x) => `<li><time>${dataBR(x.data)}</time><div><b>${esc(x.diagnostico)}</b><p style="margin:2px 0 4px;color:var(--texto-2)">${esc(x.queixa)}</p><small style="color:var(--texto-3)">${esc(x.vet)} · ${x.exame.peso ?? '—'} kg · ${x.exame.temp ?? '—'} °C · FC ${x.exame.fc ?? '—'} · FR ${x.exame.fr ?? '—'}</small><p style="margin:6px 0 0;white-space:pre-wrap">${esc(x.prescricao)}</p><button class="bt bt-peq" style="margin-top:8px" data-receita="${x.id}">Imprimir receita</button></div></li>`).join('')}</ol>` : '<p class="vazio">Nenhuma consulta registrada ainda.</p>';
}
function abaVacinas(p, t) {
  const l = db.vacinas.filter((v) => v.pet === p.id).sort((a, b) => b.data.localeCompare(a.data));
  return `${l.length ? `<table class="tabela empilha"><thead><tr><th>Vacina</th><th>Aplicada</th><th>Lote</th><th>Próxima dose</th><th></th></tr></thead><tbody>${l.map((v) => `<tr><td><b>${esc(v.nome)}</b></td><td>${dataBR(v.data)}</td><td>${esc(v.lote)}</td><td>${v.proxima ? selVac(v) : '—'}</td><td>${v.proxima && diasAte(v.proxima) <= 30 ? `<a class="bt bt-peq bt-zap" target="_blank" rel="noopener" href="${zap(t?.tel, lembrete(v))}">Lembrar</a>` : ''}</td></tr>`).join('')}</tbody></table>` : '<p class="vazio">Sem vacinas registradas.</p>'}
    <div class="acoes" style="margin-top:14px"><button class="bt bt-pri" data-aplicar="${p.id}">Registrar vacina aplicada</button><button class="bt" data-carteira="${p.id}">Imprimir carteira de vacinação</button></div>`;
}
function abaExames(p) {
  const l = db.exames.filter((e) => e.pet === p.id).sort((a, b) => b.data.localeCompare(a.data));
  return `${l.length ? `<ul class="lista-exames">${l.map(linhaExame).join('')}</ul>` : '<p class="vazio">Nenhum exame pedido.</p>'}<div class="acoes" style="margin-top:14px"><button class="bt bt-pri" data-pedir-exame="${p.id}">Pedir exame</button></div>`;
}
function abaPeso(p) {
  if (p.pesos.length < 2) return '<p class="vazio">Registre pelo menos duas pesagens para ver a curva.</p>';
  const w = 560, hh = 130, pad = 26, kg = p.pesos.map((x) => x.kg), min = Math.min(...kg), max = Math.max(...kg), r = max - min || 1;
  const pts = p.pesos.map((x, i) => [pad + (i * (w - pad * 2)) / (p.pesos.length - 1), hh - pad - ((x.kg - min) / r) * (hh - pad * 2)]);
  const dif = kg[kg.length - 1] - kg[0];
  return `<p style="margin:0 0 8px">${dif >= 0 ? 'Ganhou' : 'Perdeu'} <b>${Math.abs(dif).toFixed(1)} kg</b> desde ${dataBR(p.pesos[0].data)}.</p>
    <svg class="peso-grafico" viewBox="0 0 ${w} ${hh}" role="img" aria-label="Curva de peso de ${esc(p.nome)}"><polyline points="${pts.map((x) => x.join(',')).join(' ')}"/>${pts.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="4"/><text x="${x}" y="${y - 9}" text-anchor="middle">${kg[i]}</text><text x="${x}" y="${hh - 4}" text-anchor="middle">${dataBR(p.pesos[i].data).slice(0, 5)}</text>`).join('')}</svg>
    <div class="acoes" style="margin-top:10px"><button class="bt" data-pesar="${p.id}">Registrar pesagem</button></div>`;
}
function abaDocumentos(p) {
  return `<div class="docs"><button class="doc" data-carteira="${p.id}"><b>Carteira de vacinação</b><small>Todas as vacinas, lotes e próximas doses</small></button>
    <button class="doc" data-termo="${p.id}:cirurgia"><b>Termo de consentimento para cirurgia</b><small>Com riscos, autorização e assinatura do tutor</small></button>
    <button class="doc" data-termo="${p.id}:anestesia"><b>Termo de anestesia e sedação</b><small>Para procedimentos com sedação</small></button>
    <button class="doc" data-termo="${p.id}:internacao"><b>Termo de internação</b><small>Responsabilidade, visitas e diárias</small></button>
    <button class="doc" data-atestado="${p.id}"><b>Atestado de saúde</b><small>Para viagem, hotel ou creche</small></button></div>`;
}
const linhaExame = (e) => { const p = pet(e.pet), st = EXAME_ST[e.status]; return `<li><div><b>${esc(e.nome)}</b><small>${esc(p?.nome)} · pedido em ${dataBR(e.data)} · ${esc(e.lab)}</small>${e.resultado ? `<p>${esc(e.resultado)}</p>` : ''}</div><div class="lado"><span class="selo ${st[1]}">${st[0]}</span>${e.status === 'solicitado' ? `<button class="bt bt-peq" data-coletar="${e.id}">Coletado</button>` : e.status === 'coletado' ? `<button class="bt bt-peq bt-pri" data-resultado="${e.id}">Lançar resultado</button>` : `<a class="bt bt-peq bt-zap" target="_blank" rel="noopener" data-avisado="${e.id}" href="${zap(tutorDe(p)?.tel, `Olá, ${primeiro(tutorDe(p)?.nome)}! O resultado do exame ${e.nome} do(a) ${p?.nome} ficou pronto. A veterinária vai te explicar no retorno; quer agendar?`)}">Avisar tutor</a>`}</div></li>`; };
const selVac = (v) => { const d = diasAte(v.proxima); return d < 0 ? `<span class="selo selo-alerta">Vencida há ${-d} dia${d === -1 ? '' : 's'}</span>` : d <= 7 ? `<span class="selo selo-chegou">${d === 0 ? 'Hoje' : `Em ${d} dia${d === 1 ? '' : 's'}`}</span>` : `<span class="selo selo-aguardando">${dataBR(v.proxima)}</span>`; };
const lembrete = (v) => { const p = pet(v.pet), t = tutorDe(p), d = diasAte(v.proxima); return `Olá, ${primeiro(t?.nome)}! Aqui é da ${db.clinica}. ${d < 0 ? `A vacina ${v.nome} do(a) ${p.nome} venceu em ${dataBR(v.proxima)}.` : `A vacina ${v.nome} do(a) ${p.nome} vence em ${dataBR(v.proxima)}.`} Quer que a gente agende a aplicação? É rapidinho.`; };

// ---------------------------------------------------------------- AGENDA (semana, por profissional)
function telaAgenda() {
  const ini = maisDias(est.dia, -((new Date(`${est.dia}T12:00:00`).getDay() + 6) % 7)); // segunda-feira
  const dias = Array.from({ length: 6 }, (_, i) => maisDias(ini, i));
  return `<div class="cab"><div><h1>Agenda</h1><p>Semana de ${dataBR(dias[0])} a ${dataBR(dias[5])}</p></div><div class="acoes"><button class="bt" data-semana="-7">‹ Semana anterior</button><button class="bt" data-semana="0">Hoje</button><button class="bt" data-semana="7">Próxima ›</button><button class="bt bt-pri" data-agendar="">+ Agendar</button></div></div>
    <div class="semana">${dias.map((d) => { const l = db.agenda.filter((a) => a.data === d).sort((a, b) => a.hora.localeCompare(b.hora)); return `<section class="dia ${d === hoje() ? 'eh-hoje' : ''}"><h2>${diaSemana(d)} <b>${d.slice(8)}</b></h2>${l.map((a) => { const p = pet(a.pet); return `<button type="button" class="hor tipo-${a.tipo.split(' ')[0].toLowerCase()}" data-abrir-pet="${p.id}"><time>${a.hora}</time><span><b>${esc(p.nome)}</b><small>${esc(a.tipo)} · ${esc(a.vet.replace('Equipe de estética', 'Estética').replace(/^(Dra?\.) (\S+).*/, '$1 $2'))}</small></span></button>`; }).join('') || '<p class="vazio">Livre</p>'}</section>`; }).join('')}</div>`;
}

// ---------------------------------------------------------------- PACIENTES
function telaPacientes() {
  const q = est.busca.trim().toLowerCase();
  const l = db.pets.filter((p) => !q || `${p.nome} ${tutorDe(p)?.nome} ${p.raca} ${p.microchip}`.toLowerCase().includes(q)).sort((a, b) => a.nome.localeCompare(b.nome));
  return `<div class="cab"><div><h1>Pacientes</h1><p>${db.pets.length} pets de ${db.tutores.length} tutores${q ? ` · procurando por “${esc(est.busca)}”` : ''}</p></div><button class="bt bt-pri" data-novo-pet>+ Novo pet</button></div>
    <div class="mesa"><div class="pets">${l.map((p) => `<button type="button" class="pet" data-sel="${p.id}" aria-pressed="${est.sel === p.id}">${avatar(p)}<div><b>${esc(p.nome)}</b><small>${esc(p.raca)} · ${idade(p.nasc)}<br>${esc(tutorDe(p)?.nome)}</small></div></button>`).join('') || '<p class="vazio">Nenhum pet encontrado.</p>'}</div>
    ${est.sel && pet(est.sel) ? ficha(est.sel) : '<div class="cartao"><p class="vazio">Escolha um pet para ver a ficha completa.</p></div>'}</div>`;
}

// ---------------------------------------------------------------- TUTORES
function telaTutores() {
  const t = db.tutores.find((x) => x.id === est.tutor);
  return `<div class="cab"><div><h1>Tutores</h1><p>${db.tutores.length} tutores · ${reais(aReceber().reduce((s, v) => s + total(v), 0))} a receber</p></div></div>
    <div class="duas"><section class="cartao"><table class="tabela empilha"><thead><tr><th>Tutor</th><th>Pets</th><th class="num">Deve</th></tr></thead><tbody>${db.tutores.slice().sort((a, b) => a.nome.localeCompare(b.nome)).map((x) => { const ps = db.pets.filter((p) => p.tutor === x.id), deve = aReceber(x.id).reduce((s, v) => s + total(v), 0); return `<tr class="clicavel ${est.tutor === x.id ? 'sel' : ''}" data-ver-tutor="${x.id}"><td><b>${esc(x.nome)}</b><br><small style="color:var(--texto-2)">${esc(telBR(x.tel))}</small></td><td><div class="mini-pets">${ps.map((p) => avatar(p, 'mini')).join('')}</div></td><td class="num">${deve ? `<b style="color:var(--atencao)">${reais(deve)}</b>` : '—'}</td></tr>`; }).join('')}</tbody></table></section>
    ${t ? fichaTutor(t) : '<div class="cartao"><p class="vazio">Escolha um tutor para ver os pets, o histórico e o que ele deve.</p></div>'}</div>`;
}
function fichaTutor(t) {
  const ps = db.pets.filter((p) => p.tutor === t.id), deve = aReceber(t.id), hist = db.vendas.filter((v) => tutorDe(pet(v.pet))?.id === t.id).sort((a, b) => (b.data + b.hora).localeCompare(a.data + a.hora)).slice(0, 8);
  return `<section class="cartao"><div class="cartao-cab"><div><h2>${esc(t.nome)}</h2><small style="color:var(--texto-2)">${esc(telBR(t.tel))} · ${esc(t.end || '')}</small></div><a class="bt bt-peq bt-zap" target="_blank" rel="noopener" href="${zap(t.tel, `Olá, ${primeiro(t.nome)}! Aqui é da ${db.clinica}.`)}">WhatsApp</a></div>
    <div class="cartao-corpo"><div class="pets">${ps.map((p) => `<button type="button" class="pet" data-abrir-pet="${p.id}">${avatar(p)}<div><b>${esc(p.nome)}</b><small>${esc(p.raca)} · ${idade(p.nasc)}</small></div></button>`).join('')}</div>
    ${deve.length ? `<h3 class="sub-tit">A receber</h3><ul class="lista-simples">${deve.map((v) => `<li><span>${dataBR(v.data)} · ${v.itens.map((i) => esc(i.nome)).join(', ')}</span><b>${reais(total(v))}</b><button class="bt bt-peq" data-receber="${v.id}">Recebi</button></li>`).join('')}</ul><a class="bt bt-peq bt-zap" target="_blank" rel="noopener" href="${zap(t.tel, `Olá, ${primeiro(t.nome)}! Tudo bem? Aqui é da ${db.clinica}. Ficou em aberto ${reais(deve.reduce((s, v) => s + total(v), 0))} dos atendimentos de ${deve.map((v) => dataBR(v.data)).join(', ')}. Pode pagar por PIX quando puder. Obrigado!`)}">Lembrar do pagamento</a>` : ''}
    <h3 class="sub-tit">Últimos atendimentos</h3>${hist.length ? `<ul class="lista-simples">${hist.map((v) => `<li><span>${dataBR(v.data)} · ${esc(pet(v.pet)?.nome)} · ${v.itens.map((i) => esc(i.nome)).join(', ')}</span><b>${reais(total(v))}</b></li>`).join('')}</ul>` : '<p class="vazio">Sem histórico.</p>'}</div></section>`;
}

// ---------------------------------------------------------------- VACINAS
function telaVacinas() {
  const lim = { 7: 7, 30: 30, 90: 90 }[est.filtroVac];
  const l = db.vacinas.filter((v) => v.proxima && (est.filtroVac === 'vencidas' ? diasAte(v.proxima) < 0 : diasAte(v.proxima) <= lim)).sort((a, b) => a.proxima.localeCompare(b.proxima));
  const filtros = [['vencidas', 'Vencidas'], ['7', 'Próximos 7 dias'], ['30', 'Próximos 30 dias'], ['90', 'Próximos 90 dias']];
  return `<div class="cab"><div><h1>Vacinas e vermífugos</h1><p>Lembre o tutor com a mensagem pronta no WhatsApp. Um toque e ele já pode agendar.</p></div>
    <div class="acoes">${filtros.map(([k, n]) => `<button class="bt ${est.filtroVac === k ? 'bt-pri' : ''}" data-filtro-vac="${k}">${n}</button>`).join('')}</div></div>
    <section class="cartao">${l.length ? `<table class="tabela empilha"><thead><tr><th>Pet</th><th>Tutor</th><th>Vacina</th><th>Próxima dose</th><th></th></tr></thead><tbody>${l.map((v) => { const p = pet(v.pet), t = tutorDe(p); return `<tr><td><span class="com-foto">${avatar(p, 'mini')}<b>${esc(p.nome)}</b></span></td><td>${esc(t?.nome)}</td><td>${esc(v.nome)}</td><td>${selVac(v)}</td><td class="num"><a class="bt bt-peq bt-zap" target="_blank" rel="noopener" href="${zap(t?.tel, lembrete(v))}">Lembrar no WhatsApp</a> <button class="bt bt-peq" data-agendar-vac="${v.id}">Agendar</button></td></tr>`; }).join('')}</tbody></table>` : '<p class="vazio">Nada para lembrar neste período.</p>'}</section>`;
}

// ---------------------------------------------------------------- INTERNAÇÃO
function telaInternacao() {
  const agora = horaAgora();
  return `<div class="cab"><div><h1>Internação</h1><p>${db.internados.length} pet${db.internados.length === 1 ? '' : 's'} internado${db.internados.length === 1 ? '' : 's'} · marque cada dose na hora em que der</p></div></div>
    ${db.internados.length ? `<div class="baias">${db.internados.map((i) => { const p = pet(i.pet), fe = i.doses.filter((d) => d.feita).length, diarias = Math.max(1, diasAte(hoje()) - diasAte(i.entrada) + 1); return `<section class="cartao"><div class="cartao-cab"><span class="com-foto">${avatar(p, 'mini')}<span><h3 class="baia">${esc(p.nome)}</h3><small style="color:var(--texto-2)">${esc(i.baia)} · desde ${dataBR(i.entrada)} · ${diarias} diária${diarias > 1 ? 's' : ''}</small></span></span><span class="selo selo-atendimento">${fe} de ${i.doses.length} doses</span></div>
      <div class="cartao-corpo"><p style="margin:0;color:var(--texto-2)">${esc(i.motivo)}</p><ul class="doses">${i.doses.map((d, k) => `<li class="${d.feita ? 'feita' : d.hora < agora ? 'atrasada' : ''}"><b>${d.hora}</b><span>${esc(d.remedio)}</span>${d.feita ? '<span class="selo selo-pronto">Feita</span>' : `<button class="bt bt-peq" data-dose="${i.id}:${k}">Dar agora</button>`}</li>`).join('')}</ul>
      <div class="acoes" style="margin-top:12px"><button class="bt bt-peq" data-nova-dose="${i.id}">+ Dose</button><button class="bt bt-peq" data-alta="${i.id}">Dar alta e cobrar</button><a class="bt bt-peq bt-zap" target="_blank" rel="noopener" href="${zap(tutorDe(p)?.tel, `Olá! Notícias do(a) ${p.nome}: está internado(a) na ${i.baia}, recebeu ${fe} de ${i.doses.length} medicações de hoje e segue em observação. Qualquer novidade avisamos.`)}">Notícias ao tutor</a></div></div></section>`; }).join('')}</div>` : '<div class="cartao"><p class="vazio">Nenhum pet internado agora.</p></div>'}`;
}

// ---------------------------------------------------------------- ESTÉTICA (banho e tosa)
function telaEstetica() {
  const l = db.estetica.filter((e) => e.data === hoje());
  return `<div class="cab"><div><h1>Banho e tosa</h1><p>${l.length} pets hoje · passe cada um para a próxima etapa; quando ficar pronto, avise o tutor</p></div><button class="bt bt-pri" data-banho="">+ Entrada</button></div>
    <div class="quadro">${ESTETICA.map(([k, n], i) => `<section class="coluna"><h2>${n} <small>${l.filter((e) => e.status === k).length}</small></h2>${l.filter((e) => e.status === k).sort((a, b) => a.hora.localeCompare(b.hora)).map((e) => { const p = pet(e.pet); return `<article class="ficha-banho">${avatar(p)}<div><b>${esc(p.nome)}</b><small>${e.hora} · ${esc(e.servico)}</small>${e.obs ? `<small class="obs">${esc(e.obs)}</small>` : ''}</div><div class="acoes">${i < ESTETICA.length - 1 ? `<button class="bt bt-peq bt-pri" data-etapa="${e.id}">${ESTETICA[i + 1][1]} ›</button>` : `<a class="bt bt-peq bt-zap" target="_blank" rel="noopener" href="${zap(tutorDe(p)?.tel, `Olá, ${primeiro(tutorDe(p)?.nome)}! O(a) ${p.nome} já está cheiroso(a) e pronto(a) para buscar aqui na ${db.clinica}. 🐾`)}">Pode buscar</a><button class="bt bt-peq" data-entregue="${e.id}">Entregue</button>`}</div></article>`; }).join('') || '<p class="vazio">—</p>'}</section>`).join('')}</div>`;
}

// ---------------------------------------------------------------- EXAMES
function telaExames() {
  const l = db.exames.slice().sort((a, b) => ['coletado', 'solicitado', 'pronto'].indexOf(a.status) - ['coletado', 'solicitado', 'pronto'].indexOf(b.status) || b.data.localeCompare(a.data));
  return `<div class="cab"><div><h1>Exames</h1><p>Do pedido ao resultado: marque a coleta, lance o laudo e avise o tutor.</p></div><button class="bt bt-pri" data-pedir-exame="">+ Pedir exame</button></div>
    <section class="cartao"><ul class="lista-exames">${l.map(linhaExame).join('') || '<p class="vazio">Nenhum exame.</p>'}</ul></section>`;
}

// ---------------------------------------------------------------- ESTOQUE
function telaEstoque() {
  const l = [...db.estoque].sort((a, b) => (alertaItem(b) ? 1 : 0) - (alertaItem(a) ? 1 : 0) || a.nome.localeCompare(b.nome));
  const valor = db.estoque.reduce((s, x) => s + x.qtd * (x.custo || 0), 0);
  return `<div class="cab"><div><h1>Estoque</h1><p>${db.estoque.length} itens · ${reais(valor)} em custo · o que está acabando ou vencendo aparece primeiro</p></div><button class="bt bt-pri" data-novo-item>+ Item</button></div>
    <section class="cartao"><table class="tabela empilha"><thead><tr><th>Item</th><th>Tipo</th><th>Lote</th><th>Validade</th><th class="num">Qtd.</th><th class="num">Custo / venda</th><th></th></tr></thead><tbody>${l.map((x) => `<tr><td><b>${esc(x.nome)}</b>${alertaItem(x) ? `<br>${alertaItem(x)}` : ''}</td><td>${esc(x.tipo)}</td><td>${esc(x.lote)}</td><td>${dataBR(x.validade)}</td><td class="num"><b>${x.qtd}</b> <small style="color:var(--texto-3)">mín. ${x.minimo}</small></td><td class="num">${reais(x.custo)} / ${reais(x.preco)}</td><td class="num"><button class="bt bt-peq" data-entrada="${x.id}">+ Entrada</button></td></tr>`).join('')}</tbody></table></section>`;
}
const alertaItem = (x) => { const d = diasAte(x.validade); return d < 0 ? '<span class="selo selo-alerta">Vencido</span>' : d <= 30 ? `<span class="selo selo-chegou">Vence em ${d} dias</span>` : x.qtd < x.minimo ? '<span class="selo selo-alerta">Abaixo do mínimo</span>' : ''; };

// ---------------------------------------------------------------- CAIXA
function telaCaixa() {
  const h = hoje(), l = db.vendas.filter((v) => v.data === h).sort((a, b) => b.hora.localeCompare(a.hora));
  const formas = {}; l.forEach((v) => { formas[v.forma] = (formas[v.forma] || 0) + total(v); });
  const pend = aReceber();
  return `<div class="cab"><div><h1>Caixa do dia</h1><p>${l.length} cobrança${l.length === 1 ? '' : 's'} hoje · ${reais(pend.reduce((s, v) => s + total(v), 0))} a receber no total</p></div><button class="bt bt-pri" data-cobrar="">+ Nova cobrança</button></div>
    <div class="duas"><section class="cartao"><div class="cartao-cab"><h2>Lançamentos de hoje</h2></div>${l.length ? `<table class="tabela empilha"><tbody>${l.map((v) => `<tr><td><b>${v.hora}</b> · ${esc(pet(v.pet)?.nome || 'Balcão')}<br><small style="color:var(--texto-2)">${v.itens.map((i) => `${esc(i.nome)}${i.qtd > 1 ? ` ×${i.qtd}` : ''}`).join(', ')}</small></td><td>${esc(v.forma)}</td><td class="num"><b>${reais(total(v))}</b></td></tr>`).join('')}</tbody></table>` : '<p class="vazio">Nada cobrado ainda hoje.</p>'}</section>
    <div style="display:grid;gap:18px"><section class="cartao"><div class="cartao-cab"><h2>Fechamento</h2></div><div class="cartao-corpo">${Object.entries(formas).map(([f, v]) => `<div class="linha-valor"><span>${esc(f)}</span><b>${reais(v)}</b></div>`).join('') || '<p class="vazio">Sem valores.</p>'}</div><div class="total"><span>Recebido hoje</span><b>${reais(l.filter((v) => v.recebido).reduce((s, v) => s + total(v), 0))}</b></div></section>
    <section class="cartao"><div class="cartao-cab"><h2>A receber (fiado)</h2></div><div class="cartao-corpo">${pend.length ? `<ul class="lista-simples">${pend.map((v) => `<li><span>${dataBR(v.data)} · ${esc(tutorDe(pet(v.pet))?.nome || 'Balcão')}</span><b>${reais(total(v))}</b><button class="bt bt-peq" data-receber="${v.id}">Recebi</button></li>`).join('')}</ul>` : '<p class="vazio">Ninguém devendo.</p>'}</div></section></div></div>`;
}

// ---------------------------------------------------------------- RELATÓRIOS
function telaRelatorios() {
  const ini = maisDias(hoje(), -29), l = db.vendas.filter((v) => v.data >= ini && v.recebido);
  const dias = Array.from({ length: 30 }, (_, i) => maisDias(ini, i)), porDia = dias.map((d) => l.filter((v) => v.data === d).reduce((s, v) => s + total(v), 0));
  const fat = porDia.reduce((s, x) => s + x, 0), max = Math.max(...porDia, 1), ticket = l.length ? fat / l.length : 0;
  const serv = {}; l.forEach((v) => v.itens.forEach((i) => { serv[i.nome] = (serv[i.nome] || 0) + i.valor * i.qtd; }));
  const top = Object.entries(serv).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const formas = {}; l.forEach((v) => { formas[v.forma] = (formas[v.forma] || 0) + total(v); });
  const vacMes = db.vacinas.filter((v) => v.data >= ini).length, consMes = db.prontuarios.filter((p) => p.data >= ini).length;
  const W = 720, H = 160;
  return `<div class="cab"><div><h1>Relatórios</h1><p>Últimos 30 dias (${dataBR(ini)} a ${dataBR(hoje())})</p></div></div>
    <div class="numeros"><div class="numero destaque"><span>Faturamento recebido</span><b>${reais(fat)}</b></div><div class="numero"><span>Atendimentos cobrados</span><b>${l.length}</b></div><div class="numero"><span>Ticket médio</span><b>${reais(ticket)}</b></div><div class="numero"><span>Vacinas · consultas</span><b>${vacMes} · ${consMes}</b></div></div>
    <section class="cartao"><div class="cartao-cab"><h2>Faturamento por dia</h2></div><div class="cartao-corpo"><svg class="barras" viewBox="0 0 ${W} ${H + 22}" role="img" aria-label="Faturamento por dia nos últimos 30 dias">${porDia.map((v, i) => { const bw = W / 30 - 4, bh = Math.max(v ? 3 : 0, (v / max) * H), x = i * (W / 30) + 2; return `<rect x="${x}" y="${H - bh}" width="${bw}" height="${bh}" rx="3"><title>${dataBR(dias[i])}: ${reais(v)}</title></rect>${i % 5 === 0 ? `<text x="${i ? x + bw / 2 : x}" y="${H + 16}" text-anchor="${i ? 'middle' : 'start'}">${dataBR(dias[i]).slice(0, 5)}</text>` : ''}`; }).join('')}</svg></div></section>
    <div class="duas" style="margin-top:18px"><section class="cartao"><div class="cartao-cab"><h2>O que mais vende</h2></div><div class="cartao-corpo">${top.map(([n, v]) => `<div class="barra-h"><span>${esc(n)}</span><i style="--p:${(v / top[0][1]) * 100}%"></i><b>${reais(v)}</b></div>`).join('')}</div></section>
    <section class="cartao"><div class="cartao-cab"><h2>Formas de pagamento</h2></div><div class="cartao-corpo">${Object.entries(formas).sort((a, b) => b[1] - a[1]).map(([f, v]) => `<div class="linha-valor"><span>${esc(f)}</span><b>${reais(v)} <small style="color:var(--texto-3)">${Math.round((v / fat) * 100)}%</small></b></div>`).join('')}</div></section></div>`;
}

// ---------------------------------------------------------------- janelas
function janela(titulo, corpo, botoes) {
  const fundo = $('#janela'), j = fundo.firstElementChild;
  j.innerHTML = `<div class="janela-cab"><h2 id="janela-t">${titulo}</h2><button type="button" class="fechar" data-fechar aria-label="Fechar">×</button></div><form class="janela-form" novalidate><div class="janela-corpo">${corpo}</div><div class="janela-pe"><button type="button" class="bt" data-fechar>Cancelar</button>${botoes}</div></form>`;
  fundo.hidden = false; j.querySelector('input:not([type=file]), select, textarea')?.focus();
  return j.querySelector('form');
}
const fecharJanela = () => { $('#janela').hidden = true; };
const opcoesPets = (sel) => db.pets.slice().sort((a, b) => a.nome.localeCompare(b.nome)).map((p) => `<option value="${p.id}" ${p.id === sel ? 'selected' : ''}>${esc(p.nome)} · ${esc(tutorDe(p)?.nome)}</option>`).join('');
const num = (v) => (String(v).trim() ? Number(String(v).replace(',', '.')) : null);

// foto: reduz no próprio navegador (480 px, JPEG) para caber no armazenamento da demonstração
function lerFoto(arquivo) {
  return new Promise((ok, erro) => {
    if (!arquivo || !arquivo.type.startsWith('image/')) return erro(new Error('Escolha uma imagem.'));
    const img = new Image(), url = URL.createObjectURL(arquivo);
    img.onload = () => { const s = Math.min(img.width, img.height), c = document.createElement('canvas'); c.width = c.height = 480; c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 480, 480); URL.revokeObjectURL(url); ok(c.toDataURL('image/jpeg', .8)); };
    img.onerror = () => erro(new Error('Não consegui abrir essa imagem.')); img.src = url;
  });
}
const campoFoto = (p) => `<div class="campo-foto largo"><div class="previa-foto">${avatar(p || {}, 'grande')}</div><div><label class="bt">${IC.camera} ${p?.foto ? 'Trocar foto' : 'Colocar foto'}<input type="file" name="foto" accept="image/*" capture="environment" hidden></label><small>Tire na hora pelo celular ou escolha da galeria.</small></div></div>`;
function ligarFoto(f, guardar) {
  f.foto.onchange = async () => { try { const d = await lerFoto(f.foto.files[0]); guardar(d); f.querySelector('.previa-foto').innerHTML = `<div class="avatar grande"><img src="${d}" alt=""></div>`; } catch (e) { avisar(e.message); } };
}

function abrirFoto(id) {
  const p = pet(id); let nova = null;
  const f = janela(`Foto de ${esc(p.nome)}`, campoFoto(p), `${p.foto ? '<button type="button" class="bt bt-perigo" data-tirar-foto>Tirar foto</button>' : ''}<button class="bt bt-pri">Salvar</button>`);
  ligarFoto(f, (d) => { nova = d; });
  f.querySelector('[data-tirar-foto]')?.addEventListener('click', () => { p.foto = ''; salvar(); fecharJanela(); desenhar(); });
  f.onsubmit = (e) => { e.preventDefault(); if (!nova) return avisar('Escolha uma foto primeiro.'); p.foto = nova; salvar(); fecharJanela(); avisar('Foto salva.'); desenhar(); };
}
function abrirProntuario(id) {
  const p = pet(id);
  const f = janela(`Consulta de ${esc(p.nome)}`, `<div class="grade-campos"><label class="campo largo">Queixa do tutor<textarea name="queixa" placeholder="O que o tutor contou"></textarea></label>
    <label class="campo">Peso (kg)<input name="peso" inputmode="decimal" value="${pesoAtual(p) ?? ''}"></label><label class="campo">Temperatura (°C)<input name="temp" inputmode="decimal" placeholder="38,5"></label>
    <label class="campo">Freq. cardíaca (bpm)<input name="fc" inputmode="numeric"></label><label class="campo">Freq. respiratória (mpm)<input name="fr" inputmode="numeric"></label>
    <label class="campo largo">Diagnóstico<input name="diag"></label><label class="campo largo">Prescrição e orientações<textarea name="presc" placeholder="Remédio, dose, horário e por quantos dias"></textarea></label>
    <label class="campo">Veterinário<select name="vet">${db.vets.filter((v) => v.startsWith('Dr')).map((v) => `<option>${esc(v)}</option>`).join('')}</select></label><label class="campo">Marcar retorno<select name="retorno"><option value="">Sem retorno</option><option value="7">Em 7 dias</option><option value="10">Em 10 dias</option><option value="15">Em 15 dias</option><option value="30">Em 30 dias</option></select></label></div>`, '<button class="bt bt-pri">Salvar consulta</button>');
  f.onsubmit = (e) => {
    e.preventDefault(); if (!f.queixa.value.trim() || !f.diag.value.trim()) return avisar('Preencha a queixa e o diagnóstico.');
    const peso = num(f.peso.value);
    db.prontuarios.push({ id: uid(), pet: id, data: hoje(), vet: f.vet.value, queixa: f.queixa.value.trim(), exame: { peso, temp: num(f.temp.value), fc: num(f.fc.value), fr: num(f.fr.value) }, diagnostico: f.diag.value.trim(), prescricao: f.presc.value.trim() });
    if (peso && peso !== pesoAtual(p)) p.pesos.push({ data: hoje(), kg: peso });
    const a = db.agenda.find((x) => x.pet === id && x.data === hoje() && x.status !== 'pronto'); if (a) a.status = 'pronto';
    if (f.retorno.value) db.agenda.push({ id: uid(), data: maisDias(hoje(), Number(f.retorno.value)), hora: a?.hora || '10:00', pet: id, tipo: 'Retorno', vet: f.vet.value, status: 'aguardando', valor: 0 });
    salvar(); fecharJanela(); est.aba = 'prontuario'; avisar(`Consulta de ${p.nome} registrada${f.retorno.value ? ` e retorno marcado para ${dataBR(maisDias(hoje(), Number(f.retorno.value)))}` : ''}.`); desenhar();
  };
}
function abrirPesar(id) {
  const p = pet(id);
  const f = janela(`Pesagem de ${esc(p.nome)}`, `<label class="campo">Peso (kg)<input name="peso" inputmode="decimal" value="${pesoAtual(p) ?? ''}"></label>`, '<button class="bt bt-pri">Salvar</button>');
  f.onsubmit = (e) => { e.preventDefault(); const kg = num(f.peso.value); if (!(kg > 0)) return avisar('Peso inválido.'); p.pesos.push({ data: hoje(), kg }); salvar(); fecharJanela(); desenhar(); };
}
function imprimir(titulo, corpo) {
  const w = window.open('', '_blank'); if (!w) return avisar('Libere as janelas do navegador para imprimir.');
  w.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${esc(titulo)}</title><style>body{font:15px/1.6 Georgia,serif;color:#1d2b27;max-width:720px;margin:36px auto;padding:0 24px}h1{font-size:22px;margin:0;color:#214e45}h2{font-size:16px;margin:22px 0 6px;color:#214e45}small{color:#555}.cab{display:flex;justify-content:space-between;border-bottom:2px solid #214e45;padding-bottom:12px;margin-bottom:18px}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:6px 8px;border-bottom:1px solid #ddd;font-size:14px}.assin{margin-top:70px;display:flex;gap:40px}.assin div{flex:1;border-top:1px solid #333;text-align:center;padding-top:6px;font-size:13px}</style></head><body>
    <div class="cab"><div><h1>${esc(db.clinica)}</h1><small>${esc(titulo)}</small></div><small>${dataBR(hoje())}</small></div>${corpo}<script>print()<\/script></body></html>`);
  w.document.close();
}
const cabPet = (p) => { const t = tutorDe(p); return `<p><b>Paciente:</b> ${esc(p.nome)} · ${({ cao: 'canino', gato: 'felino' })[p.especie] || 'outro'} · ${esc(p.raca)} · ${esc(p.sexo.toLowerCase())} · ${idade(p.nasc)} · ${pesoAtual(p) ?? '—'} kg${p.microchip ? ` · microchip ${esc(p.microchip)}` : ''}<br><b>Tutor:</b> ${esc(t?.nome)} · ${esc(telBR(t?.tel))}${t?.end ? ` · ${esc(t.end)}` : ''}</p>`; };
function imprimirReceita(idPr) {
  const x = db.prontuarios.find((r) => r.id === idPr), p = pet(x.pet);
  imprimir(`Receita · ${p.nome}`, `${cabPet(p)}<h2>Diagnóstico</h2><p>${esc(x.diagnostico)}</p><h2>Prescrição</h2><p style="white-space:pre-wrap">${esc(x.prescricao)}</p><div class="assin"><div>${esc(x.vet)}<br>Médico(a)-veterinário(a) · CRMV</div></div>`);
}
function imprimirCarteira(id) {
  const p = pet(id), l = db.vacinas.filter((v) => v.pet === id).sort((a, b) => a.data.localeCompare(b.data));
  imprimir(`Carteira de vacinação · ${p.nome}`, `${cabPet(p)}<h2>Vacinas e vermífugos</h2><table><tr><th>Vacina</th><th>Aplicada em</th><th>Lote</th><th>Próxima dose</th></tr>${l.map((v) => `<tr><td>${esc(v.nome)}</td><td>${dataBR(v.data)}</td><td>${esc(v.lote)}</td><td>${dataBR(v.proxima)}</td></tr>`).join('')}</table><div class="assin"><div>Médico(a)-veterinário(a) responsável · CRMV</div></div>`);
}
const TERMOS = {
  cirurgia: ['Termo de consentimento para cirurgia', 'Autorizo a equipe a realizar o procedimento cirúrgico indicado no meu animal. Fui informado(a) sobre o diagnóstico, o procedimento, os riscos (inclusive anestésicos, que podem levar a complicações e, em casos raros, ao óbito), os cuidados pós-operatórios e os custos estimados. Declaro que o animal está em jejum conforme orientado e que informei todas as doenças e medicamentos de que tenho conhecimento.'],
  anestesia: ['Termo de anestesia e sedação', 'Autorizo a sedação ou anestesia do meu animal para o procedimento indicado. Fui informado(a) de que todo procedimento anestésico tem riscos, que foram explicados pela equipe, e de que exames prévios podem ser recomendados para reduzi-los.'],
  internacao: ['Termo de internação', 'Autorizo a internação do meu animal para tratamento, com medicações e procedimentos indicados pela equipe. Estou ciente do valor da diária, dos horários de visita e de que serei avisado(a) sobre a evolução do quadro e antes de qualquer procedimento não previsto.'],
};
function imprimirTermo(id, tipo) {
  const p = pet(id), t = tutorDe(p), [tit, texto] = TERMOS[tipo];
  imprimir(`${tit} · ${p.nome}`, `${cabPet(p)}<h2>${tit}</h2><p>${texto}</p><p>Procedimento: ____________________________________________ Valor estimado: R$ ____________</p><div class="assin"><div>${esc(t?.nome)}<br>Tutor(a) · CPF ______________</div><div>Médico(a)-veterinário(a) · CRMV</div></div>`);
}
function imprimirAtestado(id) {
  const p = pet(id), vac = db.vacinas.filter((v) => v.pet === id && v.data >= maisDias(hoje(), -365));
  imprimir(`Atestado de saúde · ${p.nome}`, `${cabPet(p)}<h2>Atestado de saúde</h2><p>Atesto, para os devidos fins, que examinei o animal acima nesta data e que ele se encontra clinicamente saudável, sem sinais de doença infectocontagiosa ou parasitária, apto a viajar e a conviver com outros animais.</p><p>Vacinas aplicadas nos últimos 12 meses: ${vac.map((v) => `${esc(v.nome)} (${dataBR(v.data)})`).join(', ') || 'nenhuma registrada'}.</p><div class="assin"><div>Médico(a)-veterinário(a) · CRMV</div></div>`);
}
function abrirAplicarVacina(id) {
  const vacinasEst = db.estoque.filter((x) => x.tipo === 'Vacina' || /vermífugo/i.test(x.nome));
  const f = janela(`Vacina aplicada em ${esc(pet(id).nome)}`, `<div class="grade-campos"><label class="campo largo">Vacina<select name="item">${vacinasEst.map((x) => `<option value="${x.id}">${esc(x.nome)} · lote ${esc(x.lote)} · ${x.qtd} em estoque</option>`).join('')}</select></label>
    <label class="campo">Próxima dose em<select name="prox"><option value="21">21 dias (reforço)</option><option value="90">90 dias</option><option value="365" selected>1 ano</option><option value="">Não repete</option></select></label><label class="campo">Cobrar<select name="cobrar"><option value="1">Sim, lançar no caixa</option><option value="">Não</option></select></label></div>
    <p style="margin:0;color:var(--texto-2);font-size:13px">Sai 1 unidade do estoque e a próxima dose entra nos lembretes.</p>`, '<button class="bt bt-pri">Registrar</button>');
  f.onsubmit = (e) => {
    e.preventDefault(); const it = db.estoque.find((x) => x.id === f.item.value); if (!it) return;
    if (it.qtd < 1) return avisar('Essa vacina acabou no estoque. Dê entrada antes.');
    it.qtd -= 1;
    const nome = it.nome.replace(/^Vacina /, ''), chave = nome.split(' ')[0].toLowerCase();
    db.vacinas.filter((v) => v.pet === id && v.proxima && v.nome.toLowerCase().startsWith(chave)).forEach((v) => { v.proxima = null; }); // a dose pendente sai dos lembretes
    db.vacinas.push({ id: uid(), pet: id, nome, data: hoje(), proxima: f.prox.value ? maisDias(hoje(), Number(f.prox.value)) : null, lote: it.lote });
    if (f.cobrar.value) db.vendas.push({ id: uid(), data: hoje(), hora: horaAgora(), pet: id, itens: [{ nome: it.nome, valor: it.preco, qtd: 1 }, { nome: 'Aplicação de vacina', valor: 25, qtd: 1 }], forma: 'PIX', recebido: true });
    salvar(); fecharJanela(); avisar(`Vacina registrada${f.cobrar.value ? ' e lançada no caixa' : ''}.`); desenhar();
  };
}
function abrirAgendar(petSel, tipo = 'Consulta') {
  const f = janela('Agendar', `<div class="grade-campos"><label class="campo largo">Pet<select name="pet">${opcoesPets(petSel)}</select></label>
    <label class="campo">Tipo<select name="tipo">${Object.keys(TIPOS).map((t) => `<option ${t === tipo ? 'selected' : ''}>${t}</option>`).join('')}</select></label><label class="campo">Data<input name="data" type="date" value="${est.secao === 'agenda' ? est.dia : hoje()}"></label>
    <label class="campo">Horário<input name="hora" type="time" value="17:00" step="900"></label><label class="campo">Com<select name="vet">${db.vets.map((v) => `<option>${esc(v)}</option>`).join('')}</select></label></div>`, '<button class="bt bt-pri">Agendar</button>');
  f.onsubmit = (e) => {
    e.preventDefault();
    if (db.agenda.some((a) => a.data === f.data.value && a.hora === f.hora.value && a.vet === f.vet.value)) return avisar(`${f.vet.value} já tem atendimento às ${f.hora.value} nesse dia.`);
    db.agenda.push({ id: uid(), data: f.data.value, hora: f.hora.value, pet: f.pet.value, tipo: f.tipo.value, vet: f.vet.value, status: 'aguardando', valor: TIPOS[f.tipo.value] ?? 0 });
    const p = pet(f.pet.value), t = tutorDe(p);
    salvar(); fecharJanela(); desenhar();
    avisar(`Agendado: ${p.nome} · ${dataBR(f.data.value)} às ${f.hora.value}.`);
    window.open(zap(t?.tel, `Olá, ${primeiro(t?.nome)}! Confirmando: ${f.tipo.value} do(a) ${p.nome} na ${db.clinica} em ${dataBR(f.data.value)} (${diaSemana(f.data.value, 'long')}) às ${f.hora.value}. Até lá!`), '_blank', 'noopener');
  };
}
function abrirPet(id) {
  const p = id ? pet(id) : null; let foto = p?.foto || '';
  const f = janela(p ? `Editar ${esc(p.nome)}` : 'Novo pet', `<div class="grade-campos">${campoFoto(p)}<label class="campo">Nome do pet<input name="nome" value="${esc(p?.nome || '')}"></label><label class="campo">Espécie<select name="especie">${[['cao', 'Cão'], ['gato', 'Gato'], ['outro', 'Outro']].map(([v, n]) => `<option value="${v}" ${p?.especie === v ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
    <label class="campo">Raça<input name="raca" value="${esc(p?.raca || '')}" placeholder="SRD"></label><label class="campo">Sexo<select name="sexo">${['Macho', 'Fêmea'].map((s) => `<option ${p?.sexo === s ? 'selected' : ''}>${s}</option>`).join('')}</select></label>
    <label class="campo">Nascimento (aprox.)<input name="nasc" type="date" value="${p?.nasc || maisDias(hoje(), -365)}"></label><label class="campo">Pelagem<input name="pelagem" value="${esc(p?.pelagem || '')}"></label>
    <label class="campo">Microchip<input name="microchip" value="${esc(p?.microchip || '')}"></label><label class="campo">Castrado<select name="castrado"><option value="">Não</option><option value="1" ${p?.castrado ? 'selected' : ''}>Sim</option></select></label>
    ${p ? '' : `<label class="campo">Peso (kg)<input name="peso" inputmode="decimal"></label><label class="campo largo">Tutor<select name="tutor"><option value="">Tutor novo (preencha abaixo)</option>${db.tutores.map((t) => `<option value="${t.id}">${esc(t.nome)}</option>`).join('')}</select></label>
    <label class="campo">Nome do tutor novo<input name="tnome"></label><label class="campo">WhatsApp do tutor<input name="ttel" inputmode="tel" placeholder="(16) 99999-9999"></label>`}
    <label class="campo largo">Alergias<input name="alergias" value="${esc(p?.alergias || '')}" placeholder="Deixe em branco se não tiver"></label><label class="campo largo">Observações<textarea name="obs" placeholder="Temperamento, cuidados no manejo...">${esc(p?.obs || '')}</textarea></label></div>`, `<button class="bt bt-pri">${p ? 'Salvar' : 'Cadastrar'}</button>`);
  ligarFoto(f, (d) => { foto = d; });
  f.onsubmit = (e) => {
    e.preventDefault(); if (!f.nome.value.trim()) return avisar('Falta o nome do pet.');
    const dados = { nome: f.nome.value.trim(), especie: f.especie.value, raca: f.raca.value.trim() || 'SRD', sexo: f.sexo.value, nasc: f.nasc.value, pelagem: f.pelagem.value.trim(), microchip: f.microchip.value.trim(), castrado: !!f.castrado.value, alergias: f.alergias.value.trim(), obs: f.obs.value.trim(), foto };
    if (p) { Object.assign(p, dados); salvar(); fecharJanela(); avisar('Dados salvos.'); return desenhar(); }
    let tutor = f.tutor.value;
    if (!tutor) { if (!f.tnome.value.trim()) return avisar('Escolha o tutor ou preencha o nome do tutor novo.'); tutor = uid(); db.tutores.push({ id: tutor, nome: f.tnome.value.trim(), tel: soDigitos(f.ttel.value), end: '' }); }
    const id = uid(), kg = num(f.peso.value);
    db.pets.push({ id, tutor, ...dados, pesos: kg ? [{ data: hoje(), kg }] : [] });
    salvar(); fecharJanela(); est.secao = 'pacientes'; est.sel = id; est.aba = 'resumo'; avisar(`${dados.nome} cadastrado(a).`); desenhar();
  };
}
function abrirCobrar(petSel, itensIniciais = []) {
  const itens = [...itensIniciais];
  const f = janela('Cobrança', `<div class="grade-campos"><label class="campo largo">Pet<select name="pet"><option value="">Venda no balcão (sem pet)</option>${opcoesPets(petSel)}</select></label>
    <label class="campo">Serviço<select name="serv"><option value="">Escolher…</option>${SERVICOS.map(([n, v], i) => `<option value="${i}">${esc(n)} · ${reais(v)}</option>`).join('')}</select></label>
    <label class="campo">Produto do estoque<select name="prod"><option value="">Escolher…</option>${db.estoque.filter((x) => x.qtd > 0).map((x) => `<option value="${x.id}">${esc(x.nome)} · ${reais(x.preco)}</option>`).join('')}</select></label>
    <div class="largo" data-itens></div>
    <label class="campo">Desconto (R$)<input name="desc" inputmode="decimal" value="0"></label><label class="campo">Forma de pagamento<select name="forma">${FORMAS.map((x) => `<option>${x}</option>`).join('')}</select></label></div>`, '<button class="bt bt-pri">Receber</button>');
  const lista = f.querySelector('[data-itens]');
  const soma = () => itens.reduce((s, i) => s + i.valor * i.qtd, 0) - (num(f.desc.value) || 0);
  const desenhaItens = () => { lista.innerHTML = itens.length ? `<table class="tabela">${itens.map((i, k) => `<tr><td>${esc(i.nome)}</td><td class="num">${reais(i.valor)}</td><td class="num"><button type="button" class="bt bt-peq bt-perigo" data-tirar="${k}">Tirar</button></td></tr>`).join('')}<tr><td><b>Total</b></td><td class="num"><b>${reais(soma())}</b></td><td></td></tr></table>` : '<p class="vazio" style="padding:8px">Escolha os serviços e produtos acima.</p>'; };
  f.serv.onchange = () => { if (f.serv.value === '') return; const [n, v] = SERVICOS[Number(f.serv.value)]; itens.push({ nome: n, valor: v, qtd: 1 }); f.serv.value = ''; desenhaItens(); };
  f.prod.onchange = () => { const x = db.estoque.find((y) => y.id === f.prod.value); if (!x) return; itens.push({ nome: x.nome, valor: x.preco, qtd: 1, item: x.id }); f.prod.value = ''; desenhaItens(); };
  f.desc.oninput = desenhaItens;
  lista.onclick = (e) => { const b = e.target.closest('[data-tirar]'); if (b) { itens.splice(Number(b.dataset.tirar), 1); desenhaItens(); } };
  const a = !itensIniciais.length && petSel && db.agenda.find((x) => x.pet === petSel && x.data === hoje()); // o atendimento de hoje já entra na conta
  if (a && a.valor) itens.push({ nome: a.tipo === 'Consulta' ? 'Consulta clínica' : a.tipo, valor: a.valor, qtd: 1 });
  desenhaItens();
  f.onsubmit = (e) => {
    e.preventDefault(); if (!itens.length) return avisar('Escolha pelo menos um serviço ou produto.');
    const fiado = f.forma.value.startsWith('Fiado'); if (fiado && !f.pet.value) return avisar('Fiado precisa de um pet (para saber quem deve).');
    for (const i of itens) if (i.item) { const x = db.estoque.find((y) => y.id === i.item); if (x) x.qtd = Math.max(0, x.qtd - 1); }
    const desc = num(f.desc.value) || 0, lin = itens.map(({ nome, valor, qtd }) => ({ nome, valor, qtd })); if (desc > 0) lin.push({ nome: 'Desconto', valor: -desc, qtd: 1 });
    db.vendas.push({ id: uid(), data: hoje(), hora: horaAgora(), pet: f.pet.value || null, itens: lin, forma: f.forma.value, recebido: !fiado });
    salvar(); fecharJanela(); avisar(fiado ? `Anotado no fiado: ${reais(soma())}.` : `Recebido: ${reais(soma())} no ${f.forma.value}.`); desenhar();
  };
}
function abrirInternar(id) {
  const livres = ['Baia 1', 'Baia 2', 'Baia 3', 'Baia 4', 'Baia 5'].filter((b) => !db.internados.some((i) => i.baia === b));
  if (!livres.length) return avisar('Todas as baias estão ocupadas.');
  const f = janela(`Internar ${esc(pet(id).nome)}`, `<div class="grade-campos"><label class="campo">Baia<select name="baia">${livres.map((b) => `<option>${b}</option>`).join('')}</select></label>
    <label class="campo">Primeira medicação às<input name="hora" type="time" value="${horaAgora()}"></label><label class="campo largo">Motivo<input name="motivo"></label><label class="campo largo">Medicação<input name="remedio" placeholder="Ex.: Soro fisiológico 500 ml IV"></label></div>`, '<button class="bt bt-pri">Internar</button>');
  f.onsubmit = (e) => {
    e.preventDefault(); if (!f.motivo.value.trim()) return avisar('Informe o motivo.');
    db.internados.push({ id: uid(), pet: id, baia: f.baia.value, motivo: f.motivo.value.trim(), entrada: hoje(), doses: f.remedio.value.trim() ? [{ hora: f.hora.value, remedio: f.remedio.value.trim(), feita: false }] : [] });
    salvar(); fecharJanela(); est.secao = 'internacao'; avisar(`${pet(id).nome} internado(a) na ${f.baia.value}.`); desenhar();
  };
}
function abrirNovaDose(idInt) {
  const f = janela('Nova dose', '<div class="grade-campos"><label class="campo">Horário<input name="hora" type="time"></label><label class="campo">Medicação<input name="remedio"></label></div>', '<button class="bt bt-pri">Adicionar</button>');
  f.onsubmit = (e) => { e.preventDefault(); if (!f.hora.value || !f.remedio.value.trim()) return avisar('Preencha horário e medicação.'); const i = db.internados.find((x) => x.id === idInt); i.doses.push({ hora: f.hora.value, remedio: f.remedio.value.trim(), feita: false }); i.doses.sort((a, b) => a.hora.localeCompare(b.hora)); salvar(); fecharJanela(); desenhar(); };
}
function abrirBanho(petSel) {
  const f = janela('Banho e tosa', `<div class="grade-campos"><label class="campo largo">Pet<select name="pet">${opcoesPets(petSel)}</select></label><label class="campo">Serviço<select name="serv"><option>Banho</option><option>Banho e tosa</option><option>Tosa higiênica</option></select></label><label class="campo">Chegou às<input name="hora" type="time" value="${horaAgora()}"></label><label class="campo largo">Observações<input name="obs" placeholder="Tipo de tosa, shampoo, laço..."></label></div>`, '<button class="bt bt-pri">Dar entrada</button>');
  f.onsubmit = (e) => { e.preventDefault(); db.estetica.push({ id: uid(), data: hoje(), hora: f.hora.value, pet: f.pet.value, servico: f.serv.value, status: 'aguardando', obs: f.obs.value.trim() }); salvar(); fecharJanela(); est.secao = 'estetica'; desenhar(); };
}
function abrirPedirExame(petSel) {
  const f = janela('Pedir exame', `<div class="grade-campos"><label class="campo largo">Pet<select name="pet">${opcoesPets(petSel)}</select></label><label class="campo largo">Exame<select name="nome">${EXAMES.map((x) => `<option>${x}</option>`).join('')}</select></label><label class="campo largo">Laboratório<input name="lab" value="Laboratório VetLab"></label></div>`, '<button class="bt bt-pri">Pedir</button>');
  f.onsubmit = (e) => { e.preventDefault(); db.exames.push({ id: uid(), pet: f.pet.value, nome: f.nome.value, data: hoje(), status: 'solicitado', resultado: '', lab: f.lab.value.trim() || 'Laboratório' }); salvar(); fecharJanela(); avisar('Exame pedido.'); desenhar(); };
}
function abrirResultado(idEx) {
  const x = db.exames.find((e) => e.id === idEx);
  const f = janela(`Resultado · ${esc(x.nome)}`, '<label class="campo">Laudo<textarea name="res" placeholder="Valores e conclusão do laboratório"></textarea></label>', '<button class="bt bt-pri">Salvar resultado</button>');
  f.onsubmit = (e) => { e.preventDefault(); if (!f.res.value.trim()) return avisar('Escreva o resultado.'); x.resultado = f.res.value.trim(); x.status = 'pronto'; salvar(); fecharJanela(); avisar('Resultado salvo. Avise o tutor pelo WhatsApp.'); desenhar(); };
}
function abrirEntrada(idItem) {
  const x = db.estoque.find((y) => y.id === idItem);
  const f = janela(`Entrada · ${esc(x.nome)}`, `<div class="grade-campos"><label class="campo">Quantidade<input name="qtd" type="number" min="1" value="10"></label><label class="campo">Custo unitário (R$)<input name="custo" inputmode="decimal" value="${x.custo ?? ''}"></label><label class="campo">Lote<input name="lote" value="${esc(x.lote)}"></label><label class="campo">Validade<input name="val" type="date" value="${x.validade}"></label></div>`, '<button class="bt bt-pri">Dar entrada</button>');
  f.onsubmit = (e) => { e.preventDefault(); const q = Math.round(Number(f.qtd.value)); if (!(q > 0)) return avisar('Quantidade inválida.'); x.qtd += q; x.custo = num(f.custo.value) ?? x.custo; x.lote = f.lote.value.trim() || x.lote; x.validade = f.val.value || x.validade; salvar(); fecharJanela(); avisar(`+${q} ${x.nome}.`); desenhar(); };
}
function abrirNovoItem() {
  const f = janela('Novo item no estoque', `<div class="grade-campos"><label class="campo largo">Nome<input name="nome"></label><label class="campo">Tipo<select name="tipo"><option>Vacina</option><option>Medicamento</option><option>Insumo</option><option>Produto</option></select></label>
    <label class="campo">Quantidade<input name="qtd" type="number" min="0" value="0"></label><label class="campo">Mínimo<input name="min" type="number" min="0" value="5"></label><label class="campo">Custo (R$)<input name="custo" inputmode="decimal" value="0"></label><label class="campo">Preço de venda (R$)<input name="preco" inputmode="decimal" value="0"></label>
    <label class="campo">Lote<input name="lote"></label><label class="campo">Validade<input name="val" type="date" value="${maisDias(hoje(), 365)}"></label></div>`, '<button class="bt bt-pri">Salvar</button>');
  f.onsubmit = (e) => { e.preventDefault(); if (!f.nome.value.trim()) return avisar('Falta o nome.'); db.estoque.push({ id: uid(), nome: f.nome.value.trim(), tipo: f.tipo.value, qtd: Number(f.qtd.value) || 0, minimo: Number(f.min.value) || 0, lote: f.lote.value.trim() || '—', validade: f.val.value, preco: num(f.preco.value) || 0, custo: num(f.custo.value) || 0 }); salvar(); fecharJanela(); desenhar(); };
}

// ---------------------------------------------------------------- desenho e cliques
function desenhar() {
  topo();
  $('#tela').innerHTML = ({ hoje: telaHoje, agenda: telaAgenda, pacientes: telaPacientes, tutores: telaTutores, vacinas: telaVacinas, internacao: telaInternacao, estetica: telaEstetica, exames: telaExames, estoque: telaEstoque, caixa: telaCaixa, relatorios: telaRelatorios })[est.secao]();
}
const irPet = (id) => { est.secao = 'pacientes'; est.sel = id; est.aba = 'resumo'; est.busca = ''; desenhar(); scrollTo({ top: 0 }); };
document.addEventListener('click', (e) => {
  const b = e.target.closest('button, a, tr[data-ver-tutor]'); if (!b) return;
  const d = b.dataset;
  if (d.fechar !== undefined) return fecharJanela();
  if (d.secao) { est.secao = d.secao; est.aba = 'resumo'; if (d.secao !== 'pacientes') est.busca = ''; desenhar(); $('#tela').focus(); return; }
  if (d.sel) { est.sel = d.sel; est.aba = 'resumo'; return desenhar(); }
  if (d.abrirPet) return irPet(d.abrirPet);
  if (d.verTutor) { est.secao = 'tutores'; est.tutor = d.verTutor; return desenhar(); }
  if (d.aba) { est.aba = d.aba; return desenhar(); }
  if (d.foto) return abrirFoto(d.foto);
  if (d.avancar) { const a = db.agenda.find((x) => x.id === d.avancar); if (d.para === 'pronto') return abrirProntuario(a.pet); a.status = d.para; salvar(); avisar(d.para === 'chegou' ? `${pet(a.pet).nome} chegou.` : `Atendimento de ${pet(a.pet).nome} iniciado.`); return desenhar(); }
  if (d.prontuario) return abrirProntuario(d.prontuario);
  if (d.pesar) return abrirPesar(d.pesar);
  if (d.receita) return imprimirReceita(d.receita);
  if (d.carteira) return imprimirCarteira(d.carteira);
  if (d.termo) { const [id, t] = d.termo.split(':'); return imprimirTermo(id, t); }
  if (d.atestado) return imprimirAtestado(d.atestado);
  if (d.aplicar) return abrirAplicarVacina(d.aplicar);
  if (d.cobrar !== undefined) return abrirCobrar(d.cobrar || null);
  if (d.internar) return abrirInternar(d.internar);
  if (d.agendar !== undefined) return abrirAgendar(d.agendar || est.sel);
  if (d.novoAtendimento !== undefined) return abrirAgendar(est.sel);
  if (d.novoPet !== undefined) return abrirPet(null);
  if (d.editarPet) return abrirPet(d.editarPet);
  if (d.filtroVac) { est.filtroVac = d.filtroVac; return desenhar(); }
  if (d.agendarVac) { const v = db.vacinas.find((x) => x.id === d.agendarVac); return abrirAgendar(v.pet, 'Vacina'); }
  if (d.semana) { est.dia = d.semana === '0' ? hoje() : maisDias(est.dia, Number(d.semana)); return desenhar(); }
  if (d.dose) { const [i, k] = d.dose.split(':'); const int = db.internados.find((x) => x.id === i); int.doses[Number(k)].feita = true; salvar(); avisar(`Dose dada: ${int.doses[Number(k)].remedio}.`); return desenhar(); }
  if (d.novaDose) return abrirNovaDose(d.novaDose);
  if (d.alta) { const i = db.internados.find((x) => x.id === d.alta); if (!confirm(`Dar alta para ${pet(i.pet).nome}?`)) return; const diarias = Math.max(1, diasAte(hoje()) - diasAte(i.entrada) + 1); db.internados = db.internados.filter((x) => x.id !== d.alta); salvar(); desenhar(); return abrirCobrar(i.pet, [{ nome: 'Diária de internação', valor: 180, qtd: diarias }]); }
  if (d.banho !== undefined) return abrirBanho(d.banho || est.sel);
  if (d.etapa) { const x = db.estetica.find((y) => y.id === d.etapa); x.status = ESTETICA[ESTETICA.findIndex(([k]) => k === x.status) + 1][0]; salvar(); return desenhar(); }
  if (d.entregue) { const x = db.estetica.find((y) => y.id === d.entregue); db.estetica = db.estetica.filter((y) => y.id !== d.entregue); salvar(); desenhar(); return abrirCobrar(x.pet, [{ nome: x.servico, valor: (SERVICOS.find(([n]) => n === x.servico) || [0, 60])[1], qtd: 1 }]); }
  if (d.pedirExame !== undefined) return abrirPedirExame(d.pedirExame || est.sel);
  if (d.coletar) { db.exames.find((x) => x.id === d.coletar).status = 'coletado'; salvar(); return desenhar(); }
  if (d.resultado) return abrirResultado(d.resultado);
  if (d.avisado) { db.exames.find((x) => x.id === d.avisado).avisado = true; salvar(); setTimeout(desenhar, 50); return; }
  if (d.receber) { const v = db.vendas.find((x) => x.id === d.receber); v.recebido = true; v.forma = 'PIX'; v.recebidoEm = hoje(); salvar(); avisar(`Recebido: ${reais(total(v))}.`); return desenhar(); }
  if (d.entrada) return abrirEntrada(d.entrada);
  if (d.novoItem !== undefined) return abrirNovoItem();
  if (d.recomecar !== undefined) { if (!confirm('Apagar as mudanças e voltar aos dados de exemplo?')) return; db = exemplo(); salvar(); est.sel = null; est.secao = 'hoje'; est.tutor = null; return desenhar(); }
});
$('#janela').addEventListener('click', (e) => { if (e.target.id === 'janela') fecharJanela(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#janela').hidden) fecharJanela(); });
$('#busca').addEventListener('input', (e) => { est.busca = e.target.value; est.secao = 'pacientes'; const l = db.pets.filter((p) => `${p.nome} ${tutorDe(p)?.nome}`.toLowerCase().includes(est.busca.toLowerCase())); est.sel = l.length === 1 ? l[0].id : est.sel; desenhar(); });
desenhar();
