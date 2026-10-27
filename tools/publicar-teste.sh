#!/usr/bin/env bash
# Blue Rose · SITE DE TESTE. Publica esta cópia no link de teste (GitHub Pages, branch gh-pages):
#   https://cauacaetano.github.io/blue-rose-teste/
# A cópia publicada fica fora do Google, sem o domínio bluerose-store.com e sem gravar nada no banco de verdade
# (login, contatos, métricas, pagamentos e assistente ficam desligados). Em todas as páginas aparece "Site de teste".
# O site oficial NÃO é tocado: ele só sai pelo tools/publicar.sh do repositório privado blue-rose-automacao-express.
#
# Uso: bash tools/publicar-teste.sh "o que mudou"
set -euo pipefail
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
PAG="$RAIZ/.pagina"   # pasta da branch gh-pages (fora do Git da main, ver .gitignore)
MSG="${1:-Atualiza o site de teste}"
cd "$RAIZ"

# 1) guarda o que mudou na main (o código de teste, igual ao do site)
git add -A
git diff --cached --quiet || git -c user.name="BLUE ROSE" -c user.email="177646042+CauaCaetano@users.noreply.github.com" commit -q -m "$MSG"
git push -q origin main

# 2) monta a versão protegida na gh-pages
if [ ! -d "$PAG/.git" ] && [ ! -f "$PAG/.git" ]; then
  git fetch -q origin gh-pages 2>/dev/null && git worktree add -q "$PAG" gh-pages || git worktree add -q --orphan -b gh-pages "$PAG"
fi
find "$PAG" -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +
tar -cf - --exclude='./.git' --exclude='./.pagina' --exclude='./tools' --exclude='./README.md' --exclude='./.gitignore' \
  --exclude='./google*.html' --exclude='./[0-9a-f]*.txt' --exclude='./CNAME' . | (cd "$PAG" && tar -xf -)

python - "$PAG" <<'PY'
import glob, os, re, sys
d = sys.argv[1]
aviso = '<link rel="stylesheet" href="{r}teste.css">\n</head>'
faixa = '<div class="site-de-teste" role="note">Site de teste · nada aqui vale de verdade</div>\n</body>'
for f in glob.glob(os.path.join(d, '**', '*.html'), recursive=True):
    s = open(f, encoding='utf-8').read()
    s = re.sub(r'<meta name="(google-site-verification|msvalidate\.01)"[^>]*>\n?', '', s)
    s = re.sub(r'<link rel="canonical"[^>]*>\n?', '', s)
    s = re.sub(r'<link rel="alternate" hreflang[^>]*>\n?', '', s)
    if 'name="robots"' in s: s = re.sub(r'<meta name="robots"[^>]*>', '<meta name="robots" content="noindex, nofollow">', s)
    else: s = re.sub(r'(<meta charset="[^"]*">)', r'\1\n<meta name="robots" content="noindex, nofollow">', s, count=1, flags=re.I)
    # o site oficial usa links a partir da raiz do domínio; aqui ele fica na subpasta /blue-rose-teste/
    s = re.sub(r'(href|src|action)="/(?!/)', r'\1="/blue-rose-teste/', s)
    raiz = '/blue-rose-teste/'
    if '</head>' in s and 'teste.css' not in s: s = s.replace('</head>', aviso.format(r=raiz), 1)
    if '</body>' in s and 'site-de-teste' not in s: s = s.replace('</body>', faixa, 1)
    open(f, 'w', encoding='utf-8', newline='\n').write(s)
# nada do teste grava no banco de verdade
for f in glob.glob(os.path.join(d, '**', '*.js'), recursive=True) + glob.glob(os.path.join(d, '**', '*.json'), recursive=True):
    s = open(f, encoding='utf-8', errors='ignore').read()
    if 'yihnfzwtkqdfnwziutqa.supabase.co' in s:
        open(f, 'w', encoding='utf-8', newline='\n').write(s.replace('yihnfzwtkqdfnwziutqa.supabase.co', 'banco-desligado-no-teste.invalid'))
open(os.path.join(d, 'teste.css'), 'w').write('.site-de-teste{position:fixed;left:12px;bottom:12px;z-index:2147483647;padding:6px 12px;border-radius:999px;background:#c0392b;color:#fff;font:600 12px/1.2 system-ui,sans-serif;letter-spacing:.02em;box-shadow:0 4px 14px rgba(0,0,0,.25);pointer-events:none}\n')
open(os.path.join(d, 'robots.txt'), 'w').write('User-agent: *\nDisallow: /\n')
open(os.path.join(d, '.nojekyll'), 'w').write('')
PY

cd "$PAG"
git add -A
if git diff --cached --quiet; then echo "Link de teste já estava atualizado."; else
  git -c user.name="BLUE ROSE" -c user.email="177646042+CauaCaetano@users.noreply.github.com" commit -q -m "$MSG"
  git push -q origin gh-pages
fi
echo "Site de teste: https://cauacaetano.github.io/blue-rose-teste/"
