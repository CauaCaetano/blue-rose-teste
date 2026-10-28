# Gera css/paletas.css: a paleta do site muda conforme o idioma (pedido do dono em 27/10/2026).
# Pega as cores do visual atual (css/creme.css e css/areia.css) e leva cada uma para a paleta do país,
# mantendo a diferença de tom: um marinho mais claro vira o escuro do país um pouco mais claro, e assim por diante.
# Cada regra fica dentro de html[data-paleta="<idioma>"]; o js/idioma.js põe esse atributo.
# Uso: python tools/gerar_paletas.py   (rodar de novo se mudar creme.css, areia.css ou as paletas abaixo)
import os, re

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTES = ['css/creme.css', 'css/areia.css']

# papéis do visual atual: escuro (marinho), claro (creme), areia (destaque claro), taupe (detalhe)
BASE = {'escuro': '#101d32', 'claro': '#f4ebdd', 'areia': '#d8c8ae', 'taupe': '#b5a58d', 'azul': '#1d3b85'}
# paletas tiradas de relatorios/analise-videos-instagram/paletas.md
PALETAS = {
    'pt-PT': {'escuro': '#1b3346', 'claro': '#f5eee4', 'areia': '#e2b48f', 'taupe': '#b0603f', 'azul': '#2f5f86'},  # azulejo e terracota
    'es':    {'escuro': '#2a1b1e', 'claro': '#f9f3ec', 'areia': '#e2c27a', 'taupe': '#9c3b3c', 'azul': '#801c1c'},  # vinho e ouro
    'en':    {'escuro': '#021861', 'claro': '#f4f6fb', 'areia': '#c9d6f5', 'taupe': '#b8323a', 'azul': '#255dce'},  # marinho, cobalto e vermelho
    'it':    {'escuro': '#20261a', 'claro': '#f5f3ea', 'areia': '#d6c29a', 'taupe': '#9a5a3c', 'azul': '#4a543c'},  # oliva e terracota
    'fr':    {'escuro': '#2b253f', 'claro': '#f6f2fa', 'areia': '#d0c8f0', 'taupe': '#7c6bb1', 'azul': '#5a4a9a'},  # lavanda
}

def rgb(h):
    h = h.lstrip('#')
    if len(h) == 3: h = ''.join(c * 2 for c in h)
    return [int(h[i:i + 2], 16) for i in (0, 2, 4)]

def hexa(c): return '#%02x%02x%02x' % tuple(max(0, min(255, round(v))) for v in c)

def levar(c, pal):
    # papel mais próximo + a mesma diferença de tom
    papel = min(BASE, key=lambda p: sum((a - b) ** 2 for a, b in zip(c, rgb(BASE[p]))))
    d = [a - b for a, b in zip(c, rgb(BASE[papel]))]
    return [a + b for a, b in zip(rgb(pal[papel]), d)]

def recolorir(css, pal):
    css = re.sub(r'#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b', lambda m: hexa(levar(rgb(m.group(0)), pal)), css)
    def rgba(m):
        c = levar([int(m.group(i)) for i in (1, 2, 3)], pal)
        return 'rgba(%d, %d, %d, %s)' % (*[max(0, min(255, round(v))) for v in c], m.group(4))
    return re.sub(r'rgba\(\s*(\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\s*\)', rgba, css)

def prefixar(css, pre):
    """Põe o prefixo em cada seletor (também dentro de @media). :root vira o próprio html[data-paleta]."""
    out, i, n = [], 0, len(css)
    while i < n:
        j = css.find('{', i)
        if j < 0: out.append(css[i:]); break
        sel = css[i:j]
        if sel.strip().startswith('@'):
            # bloco @media / @supports: acha o fim e prefixa o conteúdo
            prof, k = 1, j + 1
            while prof and k < n:
                prof += {'{': 1, '}': -1}.get(css[k], 0); k += 1
            out.append(sel + '{' + prefixar(css[j + 1:k - 1], pre) + '}')
            i = k; continue
        k = css.find('}', j)
        partes = []
        for s in sel.split(','):
            s = s.strip()
            if not s: continue
            if s.startswith(':root') or s.startswith('html'):
                s = re.sub(r'^(:root|html)', pre, s)
            else:
                s = pre + ' ' + s
            partes.append(s)
        out.append(',\n'.join(partes) + ' ' + css[j:k + 1] + '\n')
        i = k + 1
    return ''.join(out)

def sem_comentarios(css): return re.sub(r'/\*.*?\*/', '', css, flags=re.S)

fonte = '\n'.join(sem_comentarios(open(os.path.join(RAIZ, f), encoding='utf-8').read()) for f in FONTES)
saida = ['/* Gerado por tools/gerar_paletas.py: paleta do site por idioma. Não editar à mão. */\n']
for lang, pal in PALETAS.items():
    saida.append('\n/* ===== %s ===== */\n' % lang)
    saida.append(prefixar(recolorir(fonte, pal), 'html[data-paleta="%s"]' % lang))
open(os.path.join(RAIZ, 'css', 'paletas.css'), 'w', encoding='utf-8', newline='\n').write(''.join(saida))
print('css/paletas.css', sum(len(s) for s in saida) // 1024, 'KB')
