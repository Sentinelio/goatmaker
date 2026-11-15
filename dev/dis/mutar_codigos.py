# Uso:  python3 dis/mutar_codigos.py            (juego, hook del servidor y panel vivos)
# Mutación de códigos y reportes: rompe a propósito una pieza cada vez (en el JUEGO, en el HOOK del servidor o en el PANEL)
# y el E2E correspondiente (PocketBase real + Chromium real) DEBE fallar con cada versión rota.
import subprocess, os, sys, tempfile, shutil
OUT = '/mnt/user-data/outputs'; TEL = OUT + '/telemetria'; PB = os.environ.get('PB', '/tmp/pbtest/pocketbase')
JUEGO = open(OUT + '/la-primera.html', encoding='utf8').read()
HOOK = open(TEL + '/pb_hooks/tele.pb.js', encoding='utf8').read()
PANEL = open(TEL + '/goatmaker-admin.html', encoding='utf8').read()
# (qué se rompe, dónde, patrón EXACTO (aparece 1 vez), reemplazo, qué test lo caza)
MUT = [
 ("JUEGO: el canje no aplica los efectos",              'J', 'E.ap(v); hechos.push(E.txt(v));', 'hechos.push(E.txt(v));', 'codigos'),
 ("JUEGO: no recorta valores absurdos del servidor",    'J', 'if(E.u){ v=Math.round(clamp(isFinite(v)? v : E.min, E.min, E.max)); }', 'if(E.u){ v=Math.round(isFinite(v)? v : E.min); }', 'codigos'),
 ("JUEGO: un regalo deja el taller abierto",            'J', 'CHEATS_ON = abre? true : prev;', 'CHEATS_ON = true;', 'codigos'),
 ("JUEGO: no manda las claves de efectos (caps)",       'J', 'TELE.post({op:"canje", code:v, caps:Object.keys(EFECTOS)})', 'TELE.post({op:"canje", code:v})', 'codigos'),
 ("JUEGO: el canje manda la partida entera",            'J', 'TELE.post({op:"canje", code:v,', 'TELE.post({op:"canje", save:S, code:v,', 'codigos'),
 ("JUEGO: no guarda tras canjear",                      'J', 'try{ guardar(); }catch(e){}\n      COD_MSG={tipo:"ok"', 'COD_MSG={tipo:"ok"', 'codigos'),
 ("JUEGO: canjea sin carrera en marcha",                'J', 'if(!S){ codMsg("mal","Necesitas una carrera en marcha para canjear un código."); return; }', '', 'codigos'),
 ("JUEGO: «ya canjeado» sale con otro texto",           'J', 'ya_usado:"Ya has canjeado ese código."', 'ya_usado:"Error."', 'codigos'),
 ("JUEGO: el reporte adjunta la partida aunque se desmarque", 'J', 'if(S && REP.save){ var pesa', 'if(S){ var pesa', 'codigos'),
 ("JUEGO: el reporte vacío se envía",                   'J', 'if(tx.length<3){', 'if(false){', 'codigos'),
 ("JUEGO: un fallo de red borra el texto del reporte",  'J', 'else if(r.sinRed){ say("mal","No hay conexión con el servidor de Goatmaker; tu texto sigue aquí.', 'else if(r.sinRed){ REP.texto=""; if($("rep-tx")) $("rep-tx").value=""; say("mal","No hay conexión con el servidor de Goatmaker; tu texto sigue aquí.', 'codigos'),
 ("JUEGO: el reporte filtra datos de carácter personal",'J', 'var res=null, ctx={ ver:VERSION,', 'var res=null, ctx={ email:"a@b.co", ver:VERSION,', 'codigos'),
 ("SERVIDOR: no gasta el uso al canjear",               'H', 'C.set("usos", usos + 1); tx.save(C);', '', 'codigos'),
 ("SERVIDOR: ignora el máximo de usos",                 'H', 'if (max && usos >= max) { motivo = "agotado"; return; }', '', 'codigos'),
 ("SERVIDOR: ignora «una vez por jugador»",             'H', 'if (C.get("una_por_jugador")) {', 'if (false) {', 'codigos'),
 ("SERVIDOR: ignora la caducidad",                      'H', 'if (hasta && ahora > hasta) { motivo = "caducado"; return; }', '', 'codigos'),
 ("SERVIDOR: ignora «desactivado»",                     'H', 'if (!C.get("activo")) { motivo = "inactivo"; return; }', '', 'codigos'),
 ("SERVIDOR: gasta el código aunque el juego no entienda el efecto", 'H', 'if (caps && efectos.some((x) => !x || caps.indexOf(String(x.k)) < 0)) { motivo = "version"; return; }', '', 'codigos'),
 ("SERVIDOR: sin freno a los intentos fallidos",        'H', 'if (mios >= 6 || todos >= 80) return e.json(429, { ok: false, err: "demasiados" });', '', 'codigos'),
# (No se incluye «quitar la transacción del canje»: con 150 canjes simultáneos de un código de 3 usos PocketBase 0.23 sigue dando exactamente 3, porque ejecuta
#  las escrituras en serie sobre SQLite. La transacción se conserva por defensa —es lo correcto si cambia el motor— pero no hay mutante observable.)
 ("SERVIDOR: sin tope de reportes por hora",            'H', 'if (n >= 6) return e.json(429, { ok: false, err: "demasiados" });', '', 'codigos'),
 ("SERVIDOR: acepta tipos de reporte inventados",       'H', 'const tipo = ["bug", "idea", "otro"].indexOf(String(b.tipo)) >= 0 ? String(b.tipo) : "otro";', 'const tipo = String(b.tipo).slice(0, 12);', 'codigos'),
 ("SERVIDOR: guarda la partida de un reporte aunque no venga", 'H', 'ctx.adjunta = false;', 'ctx.adjunta = true;', 'panel'),
 ("PANEL: regenerar no pone los usos a 0",              'P', 'var patch={usos:0,activo:true};', 'var patch={activo:true};', 'panel'),
 ("PANEL: regenerar deja el mismo código",              'P', 'patch.code=codNuevo();try{', 'patch.code=c.code;try{', 'panel'),
 ("PANEL: el catálogo no coincide con el juego",        'P', '{k:"niveles",n:"Subir de nivel",u:"niveles",def:1,min:1,max:20,', '{k:"niveles",n:"Subir de nivel",u:"niveles",def:1,min:1,max:99,', 'panel'),
 ("PANEL: «Copiar para Claude» no marca como visto",    'P', 'if(r.estado==="nuevo"){await api(', 'if(false){await api(', 'panel'),
 ("PANEL: el contador de reportes nuevos no sale",      'P', "(t[0]===\"reportes\"&&nNuevos?", "(false?", 'panel'),
 ("PANEL: el código generado lleva caracteres ambiguos",'P', 'var a="ABCDEFGHJKMNPQRSTUVWXYZ23456789",s="GM"', 'var a="ABCDEFGHJKMNPQRSTUVWXYZ0123456789OIL",s="GM"', 'panel'),
]
W = tempfile.mkdtemp(prefix='mut_cod_'); res = []
print("== CÓDIGOS Y REPORTES: el E2E debe fallar con cada versión rota ==", flush=True)
for n, donde, a, b, test in MUT:
    src = {'J': JUEGO, 'H': HOOK, 'P': PANEL}[donde]
    A = a if isinstance(a, tuple) else (a,); B = b if isinstance(b, tuple) else (b,); mut = src
    for x, y in zip(A, B):
        assert mut.count(x) == 1, "el patrón debe aparecer UNA vez (aparece %d): %s" % (mut.count(x), x)
        mut = mut.replace(x, y)
    # copia aislada de todo: el juego, el hook y el panel rotos solo viven en la carpeta temporal
    root = os.path.join(W, 'm'); shutil.rmtree(root, ignore_errors=True); os.makedirs(root)
    shutil.copytree(TEL + '/pb_migrations', root + '/pb_migrations')
    os.makedirs(root + '/pb_hooks'); open(root + '/pb_hooks/tele.pb.js', 'w', encoding='utf8').write(mut if donde == 'H' else HOOK)
    pj = root + '/juego.html'; open(pj, 'w', encoding='utf8').write(mut if donde == 'J' else JUEGO)
    pp = root + '/panel.html'; open(pp, 'w', encoding='utf8').write(mut if donde == 'P' else PANEL)
    script = OUT + '/dis/' + ('E2E_codigos.js' if test == 'codigos' else 'E2E_panel_codigos.js')
    env = dict(os.environ, GAME=pj, ADMIN=pp, TELEDIR=root, PB=PB, NODE_PATH=subprocess.run(['npm', 'root', '-g'], capture_output=True, text=True).stdout.strip())
    r = subprocess.run(['node', script], env=env, capture_output=True, text=True, cwd=W, timeout=500)
    caza = r.returncode != 0 and '✘' in r.stdout
    res.append(caza); print(("  OK  " if caza else "  ¡¡ MAL ") + n + "  →  " + ("detectada" if caza else "NO detectada"), flush=True)
print("TODAS DETECTADAS (%d)" % len(res) if all(res) else "HAY MUTACIONES QUE SOBREVIVEN", flush=True)
sys.exit(0 if all(res) else 1)
