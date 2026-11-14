# Uso:  python3 dis/mutar_telemetria.py [ruta/al/juego.html]      (por defecto el juego vivo)
# Mutación de la telemetría: rompe a propósito una pieza cada vez y E2E_telemetria.js (PocketBase real + Chromium real) DEBE fallar con cada versión rota.
import subprocess, os, sys, tempfile
OUT = '/mnt/user-data/outputs'
GAME = sys.argv[1] if len(sys.argv) > 1 else OUT + '/la-primera.html'
src = open(GAME, encoding='utf8').read()
MUT = [
 ("no se vigila el guardado (no hay partidos, club, lesión…)", 'envolver("guardar",null,function(){ TELE.alGuardar(); });', '/* envolver guardar quitado */'),
 ("el interruptor lap1-tele-off no apaga", 'if(lsGet(NS+"tele-off")==="1") return "";', ''),
 ("desactivada igualmente encola eventos", 'function ev(tipo,d){\n    if(!url()) return;', 'function ev(tipo,d){'),
 ("una clave mala (403) no calla la telemetría", 'if(status===403) dead=true;', ''),
 ("un 5xx tira el lote (pérdida de datos)", 'if(status>=400 && status<500){', 'if(status>=400){'),
 ("la cola no sobrevive a recargar", "function guardaCola(){ if(!url()) return; lsSet(KQ, JSON.stringify(q.slice(-400))); }", "function guardaCola(){ }"),
 ("la partida completa se reenvía sin esperar 3 minutos", "(fin || ahora-snapAt>180000)", "true"),
 ("el contexto filtra un email", "var c={ ver:VERSION, start_t:T0,", "var c={ ver:VERSION, email:'a@b.co', start_t:T0,"),
 ("las decisiones no se registran", 'function(c){ if(c) TELE.ev("decision",c); }', 'function(c){ }'),
 ("los errores no se registran", 'try{ TELE.err(msg,src,line,col,e); }catch(x){}', ''),
 ("el tiempo activo no se cuenta", "act+=15;", "act+=0;"),
 ("manda también a un servidor ajeno (analítica externa)", "fetch(u+\"/tele\",{method:\"POST\"", "fetch(\"https://example.com/x\").catch(function(){}); fetch(u+\"/tele\",{method:\"POST\""),
]
W = tempfile.mkdtemp(prefix='mut_tele_'); res = []
print("== TELEMETRÍA: E2E_telemetria debe fallar con cada versión rota ==", flush=True)
for n, a, b in MUT:
    assert src.count(a) == 1, "el patrón debe aparecer UNA vez (aparece %d): %s" % (src.count(a), a)
    p = os.path.join(W, '_mut.html'); open(p, 'w', encoding='utf8').write(src.replace(a, b))
    r = subprocess.run(['node', OUT + '/dis/E2E_telemetria.js'], env=dict(os.environ, GAME=p), capture_output=True, text=True, cwd=W, timeout=400)
    caza = r.returncode != 0 and '✘ E2E_telemetria' in r.stdout
    res.append(caza); print(("  OK  " if caza else "  ¡¡ MAL ") + n + "  →  " + ("detectada" if caza else "NO detectada"), flush=True)
print("TODAS DETECTADAS" if all(res) else "HAY MUTACIONES QUE SOBREVIVEN", flush=True)
sys.exit(0 if all(res) else 1)
