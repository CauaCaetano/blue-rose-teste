# Gera paletas.css de cada sistema: as cores mudam conforme o idioma (pedido do dono em 28/10/2026),
# como já acontece no site (tools/gerar_paletas.py). Cada sistema tem a paleta dele, então aqui não há
# cores fixas de partida: o gerador lê o CSS do sistema e leva cada cor para o tom do país, sem mexer
# na claridade (o contraste e a leitura continuam os mesmos):
#   - cinzas e brancos quentes ou frios ganham o tom de fundo (claros) ou o escuro do país (escuros);
#   - a cor mais usada do sistema vira o destaque do país, a segunda vira o segundo destaque, e o resto o tom de areia;
#   - cores de aviso (ok, erro, atraso, verde, vermelho, âmbar...) não mudam: elas dizem alguma coisa.
# Só entram as declarações com cor, dentro de html[data-paleta="<idioma>"]; o js/idioma.js põe o atributo e
# carrega o paletas.css ao lado do CSS do sistema (estilo.css, tema.css ou base/nexo.css).
# Uso: python tools/gerar_paletas_sistemas.py   (rodar de novo se mudar o CSS de um sistema)
import colorsys, glob, os, re

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SIS = os.path.join(RAIZ, 'demos', 'sistemas')
# as mesmas paletas do site (relatorios/analise-videos-instagram/paletas.md)
PALETAS = {
    'pt-PT': {'escuro': '#1b3346', 'claro': '#f5eee4', 'areia': '#e2b48f', 'taupe': '#b0603f', 'azul': '#2f5f86'},
    'es':    {'escuro': '#2a1b1e', 'claro': '#f9f3ec', 'areia': '#e2c27a', 'taupe': '#9c3b3c', 'azul': '#801c1c'},
    'en':    {'escuro': '#021861', 'claro': '#f4f6fb', 'areia': '#c9d6f5', 'taupe': '#b8323a', 'azul': '#255dce'},
    'it':    {'escuro': '#20261a', 'claro': '#f5f3ea', 'areia': '#d6c29a', 'taupe': '#9a5a3c', 'azul': '#4a543c'},
    'fr':    {'escuro': '#2b253f', 'claro': '#f6f2fa', 'areia': '#d0c8f0', 'taupe': '#7c6bb1', 'azul': '#5a4a9a'},
}
AVISO = re.compile(r'(^|-)(ok|erro|err|ruim|neg|pos|at|urgente|urg|perigo|aviso|alerta|sucesso|danger|success|warn|vermelho|verm|ambar|amarelo|verde|bom|mau|atraso|atrasado|vence|vencido|pago|alta|baixa|ganho|ganha|perda|perdido|quente|morno|frio|risco|critico)(-|$|\d)', re.I)
COR = re.compile(r'#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b|rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)')
CROMA = 0.18  # saturação a partir da qual a cor conta como cor (abaixo é cinza tingido)

def rgb_de(t):
    if t.startswith('#'):
        h = t[1:]
        if len(h) == 3: h = ''.join(c * 2 for c in h)
        return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)), None
    n = re.findall(r'[\d.]+', t)
    return tuple(int(x) for x in n[:3]), (n[3] if len(n) > 3 else None)

def hls(c): return colorsys.rgb_to_hls(*(v / 255 for v in c))

def sem_comentarios(css): return re.sub(r'/\*.*?\*/', '', css, flags=re.S)

def cores_de_aviso(css):
    """valores das variáveis com nome de aviso: essas cores ficam como estão em qualquer lugar do CSS"""
    fixas = set()
    for nome, valor in re.findall(r'--([\w-]+)\s*:\s*([^;}]+)', css):
        if AVISO.search(nome):
            for m in COR.findall(valor): fixas.add(rgb_de(m)[0])
    return fixas

def grupos_de_tom(css, fixas):
    """agrupa as cores (não de aviso) por tom; o grupo mais usado é o destaque do sistema"""
    peso = {}
    for m in COR.findall(css):
        c = rgb_de(m)[0]
        if c in fixas: continue
        h, l, s = hls(c)
        if s < CROMA or l < 0.15 or l > 0.85: continue  # fundos bem claros e textos bem escuros seguem o claro e o escuro do país
        peso[c] = peso.get(c, 0) + 1
    grupos = []  # [tom médio, peso, cores]
    for c, p in sorted(peso.items(), key=lambda x: -x[1]):
        h = hls(c)[0] * 360
        for g in grupos:
            if min(abs(h - g[0]), 360 - abs(h - g[0])) < 35: g[1] += p; g[2].add(c); break
        else: grupos.append([h, p, {c}])
    grupos.sort(key=lambda g: -g[1])
    return grupos

def recolorir(css, pal, fixas, grupos):
    alvo = {k: hls(rgb_de(v)[0]) for k, v in pal.items()}
    # cada grupo (do mais usado ao menos) pega o papel livre mais parecido em claridade e tom:
    # o azul-escuro do sistema vira o escuro ou o destaque do país, não o vermelho
    papel_do_grupo, livres = {}, ['azul', 'taupe', 'escuro', 'areia']
    for g in grupos:
        gl = sum(hls(c)[1] for c in g[2]) / len(g[2])
        def nota(p):
            dh = abs(g[0] - alvo[p][0] * 360); dh = min(dh, 360 - dh)
            return abs(gl - alvo[p][1]) + 0.35 * dh / 180
        papel = min(livres, key=nota) if livres else 'areia'
        if livres: livres.remove(papel)
        for c in g[2]: papel_do_grupo[c] = papel
    def nova(m):
        c, a = rgb_de(m.group(0))
        if c in fixas: return m.group(0)
        h, l, s = hls(c)
        if c in papel_do_grupo:
            th, tl, ts = alvo[papel_do_grupo[c]]
            h2, s2 = th, (s + ts) / 2
        elif s < CROMA or l < 0.15 or l > 0.85:
            # cinza tingido, fundo bem claro ou texto bem escuro: o tom do claro ou do escuro do país,
            # sem passar da saturação dele (um bege forte não vira rosa)
            th, tl, ts = alvo['claro' if l >= 0.5 else 'escuro']
            h2, s2 = (th, min(s, max(ts, 0.2))) if s > 0.02 else (h, s)
        else:
            return m.group(0)  # cor muito escura/clara que não entrou em grupo: fica
        r, g_, b = (round(v * 255) for v in colorsys.hls_to_rgb(h2, l, s2))
        if a is not None or m.group(0).startswith('rgb'):
            return 'rgba(%d, %d, %d, %s)' % (r, g_, b, a if a is not None else '1')
        return '#%02x%02x%02x' % (r, g_, b)
    return COR.sub(nova, css)

def blocos(css):
    """divide o CSS em [(seletor, corpo)], com @media e @supports por dentro; @keyframes e @font-face ficam de fora"""
    out, i, n = [], 0, len(css)
    while i < n:
        j = css.find('{', i)
        if j < 0: break
        sel = css[i:j].strip()
        prof, k = 1, j + 1
        while prof and k < n:
            prof += {'{': 1, '}': -1}.get(css[k], 0); k += 1
        corpo = css[j + 1:k - 1]
        if sel.startswith('@media') or sel.startswith('@supports'):
            out.append((sel, blocos(corpo)))
        elif not sel.startswith('@'):
            out.append((sel, corpo))
        i = k
    return out

def montar(bls, pre):
    saida = []
    for sel, corpo in bls:
        if isinstance(corpo, list):
            dentro = montar(corpo, pre)
            if dentro: saida.append('%s {\n%s}\n' % (sel, dentro))
            continue
        decl = [d.strip() for d in corpo.split(';') if COR.search(d) and ':' in d]
        if not decl: continue
        partes = []
        for s in sel.split(','):
            s = s.strip()
            if not s: continue
            partes.append(re.sub(r'^(:root|html)', pre, s) if re.match(r'^(:root|html)\b', s) else pre + ' ' + s)
        saida.append('%s { %s; }\n' % (',\n'.join(partes), '; '.join(decl)))
    return ''.join(saida)

def gerar(fontes, destino):
    css = '\n'.join(sem_comentarios(open(f, encoding='utf-8').read()) for f in fontes)
    fixas = cores_de_aviso(css)
    grupos = grupos_de_tom(css, fixas)
    bls = blocos(css)
    saida = ['/* Gerado por tools/gerar_paletas_sistemas.py a partir de %s: cores por idioma. Não editar à mão. */\n'
             % ', '.join(os.path.relpath(f, RAIZ).replace('\\', '/') for f in fontes)]
    for lang, pal in PALETAS.items():
        saida.append(montar(blocos(recolorir(css, pal, fixas, grupos)), 'html[data-paleta="%s"]' % lang))
    open(destino, 'w', encoding='utf-8', newline='\n').write(''.join(saida))
    return sum(len(s) for s in saida) // 1024, len(grupos), len(fixas)

for d in sorted(glob.glob(os.path.join(SIS, '*'))):
    fontes = [f for f in (os.path.join(d, 'estilo.css'), os.path.join(d, 'tema.css')) if os.path.exists(f)]
    if not fontes: continue
    kb, ng, nf = gerar(fontes, os.path.join(d, 'paletas.css'))
    print('%-22s %3d KB  %d grupos de cor  %d cores de aviso' % (os.path.basename(d), kb, ng, nf))
kb, ng, nf = gerar([os.path.join(SIS, 'base', 'nexo.css')], os.path.join(SIS, 'base', 'paletas.css'))
print('%-22s %3d KB  %d grupos de cor  %d cores de aviso' % ('base (nexo)', kb, ng, nf))
