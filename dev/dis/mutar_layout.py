# Uso:  python3 dis/mutar_layout.py [ruta/al/juego.html]      (por defecto el juego vivo, la-primera.html)
# Mutación de la maquetación: rompe a propósito el CSS que centra el inicio y el menú, y E2E_layout.js DEBE fallar con cada versión rota.
# Si una mutación sobrevive, o bien el test no vigila lo que dice o bien esa regla sobra. Las equivalentes se declaran aparte y se exige que no cambien nada medible.
import subprocess, os, sys, tempfile
OUT = '/mnt/user-data/outputs'
GAME = sys.argv[1] if len(sys.argv) > 1 else OUT + '/la-primera.html'
src = open(GAME, encoding='utf8').read()
MUT = [
 ("vuelve la columna lateral de 366 px (el fallo original)",
  "grid-template-columns:minmax(0,520px);justify-content:center;align-items:start}", "grid-template-columns:minmax(0,1fr) 366px;gap:18px;align-items:start}"),
 ("columna de 584 px en vez de 520 (no coincide con el menú)",
  "grid-template-columns:minmax(0,520px);", "grid-template-columns:minmax(0,584px);"),
 ("columna sin centrar (justify-content)",
  "grid-template-columns:minmax(0,520px);justify-content:center;", "grid-template-columns:minmax(0,520px);"),
 ("el menú vuelve a medir la mitad del viewport hasta los 1040 px",
  "left:50%;right:auto;width:100%;transform:translateX(-50%)", "left:50%;transform:translateX(-50%)"),
 ("el menú de escritorio mide 500 px",
  "#menu{max-width:520px;left:50%", "#menu{max-width:500px;left:50%"),
 ("la columna general deja de centrarse (.wrap sin margin auto)",
  ".wrap{max-width:520px;margin:0 auto;", ".wrap{max-width:520px;margin:0;"),
 ("el menú se desplaza 20 px",
  "left:50%;right:auto;width:100%;transform:translateX(-50%)", "left:50%;right:auto;width:100%;transform:translateX(-45%)"),
]
W = tempfile.mkdtemp(prefix='mut_layout_'); res = []
print("== MAQUETACIÓN: E2E_layout debe fallar con cada versión rota ==", flush=True)
for n, a, b in MUT:
    assert src.count(a) == 1, "el patrón debe aparecer UNA vez (aparece %d): %s" % (src.count(a), a)
    p = os.path.join(W, '_mut.html'); open(p, 'w', encoding='utf8').write(src.replace(a, b))
    r = subprocess.run(['node', OUT + '/dis/E2E_layout.js'], env=dict(os.environ, GAME=p), capture_output=True, text=True, cwd=W, timeout=300)
    caza = r.returncode != 0 and '✘ E2E_layout:' in r.stdout
    res.append(caza); print(("  OK  " if caza else "  ¡¡ MAL ") + n + "  →  " + ("detectada" if caza else "NO detectada"), flush=True)
print("TODAS DETECTADAS" if all(res) else "HAY MUTACIONES QUE SOBREVIVEN", flush=True)
sys.exit(0 if all(res) else 1)
