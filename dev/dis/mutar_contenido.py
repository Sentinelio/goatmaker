#!/usr/bin/env python3
"""Mutación del módulo de contenido editable (v4.69.0): cada mutante rompe UNA regla del validador/aplicador/sincronización
y E2E_contenido.js tiene que fallar. (Mutante retirado: el `catch` de contAplicarCache es defensa ante una excepción inesperada que ningún paquete JSON puede provocar: equivalente.) Uso: GAME=/tmp/lp_empty.html python3 mutar_contenido.py   (NODE_PATH con playwright)"""
import os, subprocess, sys, tempfile
SRC = os.environ.get('GAME', '/tmp/lp_empty.html'); src = open(SRC).read()
E2E = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'E2E_contenido.js')
M = [
 ('reloj: sin factor global', 'return Math.round(ms*RELOJ.factor);', 'return ms;'),
 ('reloj: sin multiplicador fuera de juego', 'ms=Math.round(ms*RELOJ.fuera);', 'ms=ms;'),
 ('reloj: tiempo fijo en décimas', 'fijo*1000', 'fijo*100'),
 ('reloj: sin término por letra', 'texto.length*RELOJ.letra', '0'),
 ('rango: solo mira el mínimo', 'if(v<r[0] || v>r[1]){ rech.push(ruta+": "+v+" fuera de', 'if(v<r[0]){ rech.push(ruta+": "+v+" fuera de'),
 ('reloj: acepta máximo < mínimo', 'if(nr.max<nr.min){', 'if(false){'),
 ('entrenos: ignora off', 'if(p.off===true) c.off=true; if(p.off===false) delete c.off;\n    if(p.n!==undefined){ var n=txt(p.n,R.txt.n,ruta+".n"); if(n!==null) c.n=n; }\n    if(p.d', 'if(p.off===false) delete c.off;\n    if(p.n!==undefined){ var n=txt(p.n,R.txt.n,ruta+".n"); if(n!==null) c.n=n; }\n    if(p.d'),
 ('entrenosDisp: no filtra off', 'return !e.off && (!e.pos', 'return (!e.pos'),
 ('talento: off no bloquea', 'return !node.off && (S.nivel||1)', 'return (S.nivel||1)'),
 ('talentos: sin detección de ciclos', 'enPila[id]=1; var x=ids[id]', 'enPila[id]=0; var x=ids[id]'),
 ('talentos: 5 por fila', 'filas[f]>3', 'filas[f]>5'),
 ('ids: cualquier id vale', 'function idOk(id){ return /^[a-z0-9][a-z0-9_-]{1,29}$/.test(id); }', 'function idOk(id){ return true; }'),
 ('tienda: modelos sin comprobar niveles', 'fila.length<base[t].length ||', 'false ||'),
 ('situación off no excluye', 's.cond=function(){ return false; };', 's.cond=function(){ return true; };'),
 ('situaciones nuevas sin prefijo ct-', '/^ct-[a-z0-9][a-z0-9_-]{0,26}$/.test(p.id)', '/^[a-z0-9][a-z0-9_-]{0,26}$/.test(p.id)'),
 ('situaciones nuevas: hasta 40 opciones', 'p.o.length>4', 'p.o.length>40'),
 ('posiciones: cualquier valor', 'R.pos.indexOf(p)<0', 'R.pos.indexOf(p)<-5'),
 ('talentos: confirma la rama aunque falle', 'if(bien) T.nodes.length=0', 'if(true) T.nodes.length=0'),
 ('sync: same pisa el paquete', 'r.j.ok && !r.j.same &&', 'r.j.ok &&'),
 ('sync: no guarda la copia', 'else { contGuardarCache(r.j.n,r.j.pack); if(!tarde)', 'else { if(!tarde)'),
 ('sync: aplica aunque llegue tarde', 'if(!tarde){ contAplicar(r.j.pack);', 'if(true){ contAplicar(r.j.pack);'),
 ('sync: sin paquete no vuelve a fábrica', 'if(!r.j.pack){ contGuardarCache(0,null);', 'if(!r.j.pack){ '),
 ('restaurar: no reinicia la tienda', 'tiendaItems._c=null; _SIT_MAPA=null; CONT.rech=[]; CONT.aplicado=false;', '_SIT_MAPA=null; CONT.rech=[]; CONT.aplicado=false;'),
 ('talentos: los requisitos no se comprueban', 'if(!ids[q] || q===x.id){', 'if(false){'),
 ('sync: ignora telemetría apagada', 'if(localStorage.getItem(NS+"tele-off")==="1"){ res(); return; }', 'if(false){ res(); return; }'),
 ('exportar: sin los rangos', 'orden:TALENTO_ORDEN.slice(), rangos:CONT_R}', 'orden:TALENTO_ORDEN.slice(), rangos:{}}'),
]
ok = 0; vivos = []
for nombre, a, b in M:
    if src.count(a) != 1: print('!! ancla no única (%d): %s' % (src.count(a), nombre)); sys.exit(2)
    f = tempfile.NamedTemporaryFile('w', suffix='.html', delete=False); f.write(src.replace(a, b)); f.close()
    env = dict(os.environ, GAME=f.name)
    try: r = subprocess.run(['node', E2E], env=env, capture_output=True, text=True, timeout=200); muerto = r.returncode != 0
    except subprocess.TimeoutExpired: muerto = True
    os.unlink(f.name); ok += muerto
    print(('MUERTO ' if muerto else 'VIVO   ') + nombre, flush=True)
    if not muerto: vivos.append(nombre)
print('%d/%d mutantes detectados' % (ok, len(M))); print('VIVOS: ' + ', '.join(vivos) if vivos else 'ninguno vivo')
sys.exit(0 if not vivos else 1)
