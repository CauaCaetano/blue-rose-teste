# Liga o "escreveu um nome novo, vira cadastro" (js/campos-livres.js) nos sistemas da Veltria.
#  1. Marca com data-livre="<lista>" os <select> cujas opções vêm de uma lista de pessoas do db
#     (clientes, equipe, fornecedores...): ${db.<lista>.map(...)}.
#  2. Coloca no fim do app o gancho window.veltriaNovoCadastro, que cria o registro novo copiando o formato
#     dos que já existem (texto vazio, número 0, lista vazia) e devolve o código. O formulário grava como sempre.
# Uso: python tools/ligar_campos_livres.py   (pode rodar de novo: não duplica)
import glob, os, re

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PESSOAS = ['clientes', 'equipe', 'pros', 'vend', 'vendedores', 'mecanicos', 'mec', 'fornecedores', 'correspondentes',
           'comissionados', 'pessoas', 'funcionarios', 'tecnicos', 'alunos', 'pacientes', 'tutores', 'contatos']
MARCA = '/* veltria: campos livres */'
GANCHO = MARCA + '''
// Nome escrito à mão num campo de lista (js/campos-livres.js): vira cadastro novo nesta lista do db,
// no mesmo formato dos que já existem. O formulário grava como sempre.
window.veltriaNovoCadastro = (tipo, nome) => {
  const lista = db && db[tipo];
  if (!Array.isArray(lista)) return '';
  const ja = lista.find((x) => String(x.nome || '').trim().toLowerCase() === nome.trim().toLowerCase());
  if (ja) return ja.id;
  const mod = lista[0] || {}, n = {};
  Object.keys(mod).forEach((k) => { const v = mod[k]; n[k] = Array.isArray(v) ? [] : typeof v === 'number' ? 0 : typeof v === 'boolean' ? false : v && typeof v === 'object' ? {} : ''; });
  n.id = typeof mod.id === 'number' ? Math.max(0, ...lista.map((x) => Number(x.id) || 0)) + 1 : `n${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
  n.nome = nome.trim();
  lista.push(n);
  return n.id;
};
'''
alvo = re.compile(r'<select(?![^>]*data-livre)([^>]*)>(\$\{\s*db\.(' + '|'.join(PESSOAS) + r')\.(?:map|filter))')
total = 0
for d in sorted(glob.glob(os.path.join(RAIZ, 'demos', 'sistemas', '*'))):
    if os.path.basename(d) in ('base',): continue
    for f in glob.glob(os.path.join(d, '*.js')):
        s = open(f, encoding='utf-8').read()
        if not re.search(r'^\s*(let|const|var)\s+db\b', s, re.M): continue
        s2, n = alvo.subn(lambda m: '<select%s data-livre="%s">%s' % (m.group(1), m.group(3), m.group(2)), s)
        if n == 0 and MARCA not in s: continue
        if MARCA not in s2: s2 = s2.rstrip() + '\n\n' + GANCHO
        if s2 != s:
            open(f, 'w', encoding='utf-8', newline='').write(s2)
            total += n
            print(os.path.relpath(f, RAIZ), n, 'listas')
print('total', total)
