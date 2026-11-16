import re
PROTO='/home/claude/proto/index.html'
OLD='/home/claude/goatmaker/dev/telemetria/goatmaker-admin.html'
OUT='/home/claude/goatmaker/dev/telemetria/admin-nuevo.html'
s=open(PROTO,encoding='utf-8').read()
old=open(OLD,encoding='utf-8').read().split('\n')
cat='\n'.join(old[273:285])  # var CAT=[ ... ]; (líneas 274-285)
assert old[273].startswith('var CAT=[') and old[284].strip()=='];', (old[273][:20], old[284][:20])
def rep(a,b,count=1):
    global s
    n=s.count(a)
    assert n==count, (n, a[:90])
    s=s.replace(a,b)

# 1 · arranque: sección por defecto y sin datos de ejemplo
rep('var ST={sec:"resumen"','var ST={sec:"jugadores"')
rep('var BADGE={reportes:3, errores:2};','var BADGE={};')
lines=s.split('\n')
def vacia(prefijo, nuevo):
    global lines
    idx=[i for i,l in enumerate(lines) if l.startswith(prefijo)]
    assert len(idx)==1, (prefijo, idx)
    i=idx[0]
    if lines[i].rstrip().endswith('];'):
        j=i
    else:
        j=i
        while not lines[j].rstrip().endswith('];'): j+=1
    lines=lines[:i]+[nuevo]+lines[j+1:]
vacia('var JUG=[', 'var JUG=[];')
vacia('var COD=[', 'var COD=[];')
vacia('var REP=[', 'var REP=[];')
vacia('var GRP=[', 'var GRP=[];')
s='\n'.join(lines)
# Usuarios: chips de grupo generados desde los grupos reales (los pone pbCarga). Va después de volcar «lines» a «s».
rep('["Todos","Activos hoy","Amigos","Testers","Sin grupo","Versión antigua","Bloqueados"]',
    '["Todos","Activos hoy"].concat(GRP.map(function(g){return g.n}),["Sin grupo","Versión antigua","Bloqueados"])')

# 2 · botones: solo los integrados están activos; el resto se atenúa y no responde
rep('function btn(l,f,c){ return \'<button class="b \'+(c||"")+\'" onclick="\'+on(f)+\'">\'+l+\'</button>\'; }',
    'var OK_BTN=["Copiar","Regenerar","Desactivar","Activar","Borrar","+ Código","Crear código","Copiar para Claude","Descargar","Quitar selección","← Volver a la lista","‹ Anterior","Siguiente ›","Cancelar","Borrar datos","Borrar todos sus datos","Confirmar"];\n'
    'var OK_CHIP=["Todos","Activos hoy","Versión antigua","Nuevo","Visto","Hecho","Fallo","Idea"];\n'
    'var OK_TAB=["Ficha","Códigos","Canjes"];\n'
    'function btn(l,f,c){ var no=OK_BTN.indexOf(l)<0; return \'<button class="b \'+(c||"")+(no?" off":"")+\'"\'+(no?" disabled":"")+\' onclick="\'+on(f)+\'">\'+l+\'</button>\'; }')

# 3 · pestañas: solo las integradas
rep('return \'<div class="tabs">\'+arr.map(function(t){return \'<button class="\'+(ST.tab[k]===t?"on":"")+\'" onclick="\'+on(function(){ST.tab[k]=t;go()})+\'">\'+t+\'</button>\'}).join("")+\'</div>\'; }',
    'return \'<div class="tabs">\'+arr.map(function(t){var no=OK_TAB.indexOf(t)<0;return \'<button class="\'+(ST.tab[k]===t?"on":"")+(no?" off":"")+\'"\'+(no?" disabled":"")+\' onclick="\'+on(function(){ST.tab[k]=t;go()})+\'">\'+t+\'</button>\'}).join("")+\'</div>\'; }')

# 4 · buscador: no integrado
rep('class="search" id="q"','class="search off" id="q" disabled')
# 5 · entrada: pantalla de acceso y app oculta hasta entrar
rep('<div class="app">','<div id="login" class="login"><div class="card lg"><h2>Entrar</h2><p class="mut small">Panel de Goatmaker. Se conecta sola al servidor.</p><label class="small mut">Email</label><input id="l-mail" type="email" autocomplete="username"><label class="small mut">Contraseña</label><input id="l-pass" type="password" autocomplete="current-password"><button class="b gold" id="l-go" style="width:100%;padding:10px;margin-top:8px">Entrar</button><p class="errt small" id="l-err"></p></div></div>\n<div class="app hide" id="app">')
rep('<span class="proto">PROTOTIPO · NO CONECTADO</span>','<span class="pill" id="conn"><span class="dot"></span>Sin conectar</span>')

# 6 · Usuarios: chips y versión real
rep('\'<span class="chip \'+(f===t?"on":"")+\'" style="margin-bottom:0" onclick="\'',
    '\'<span class="chip \'+(f===t?"on":"")+(OK_CHIP.indexOf(t)<0?" off":"")+\'" style="margin-bottom:0" onclick="\'')
rep('j.ver!=="4.69.0"','j.ver!==CUR_VER')
rep('j.ver==="4.69.0"?"ok":"gold"','j.ver===CUR_VER?"ok":"gold"')
rep('j.ver==="4.69.0"','j.ver===CUR_VER',count=0) if s.count('j.ver==="4.69.0"')==0 else None
# tarjetas de la ficha que no están integradas
for t in ['"Atributos"','"Actividad"']:
    rep('card('+t+',','cardOff('+t+',')
# Datos del admin: Nombre y Nota guardan en el servidor; Grupo queda deshabilitado (depende de la pantalla Grupos, sin integrar)
rep('on(function(x){J.n=x;go()})','on(function(x){pbDatoAdm(J,"label",x)})')
rep('on(function(x){J.nota=x})','on(function(x){pbDatoAdm(J,"adm_nota",x)})')
rep('<select onchange="\'+on(function(x){J.g=x;go()})+\'">','<select onchange="\'+on(function(x){pbCambiaGrupo(J,x)})+\'">')
# botones de la ficha que no están integrados ya quedan desactivados por btn()

# 7 · Códigos: acciones reales y pestaña Canjes real
rep('btn("Copiar",T("Copiado: "+c.c),"sm")+" "+btn("Editar",function(){modal(codForm(i))},"sm")',
    'btn("Copiar",function(){coAcc("copiar",c)},"sm")+" "+btn("Regenerar",function(){coAcc("regen",c)},"sm")+" "+btn(c.on?"Desactivar":"Activar",function(){coAcc("toggle",c)},"sm")+" "+btn("Borrar",function(){coAcc("borrar",c)},"sm red")')
i0=s.index('  else if(ST.tab.cd==="Canjes") b=card("Canjes"')
i1=s.index('  else b=card("Regalos enviados"')
s=s[:i0]+'  else if(ST.tab.cd==="Canjes") b=canjesTabla();\n'+s[i1:]
rep('btn("+ Código",function(){modal(codForm(null))},"gold")','btn("+ Código",function(){modal(codForm())},"gold")')

# 8 · Reportes: estado, nota y acciones reales
rep('onchange="\'+on(function(x){R.est=x;go()})+\'">','onchange="\'+on(function(x){reEst(R,x)})+\'">')
rep('<textarea rows="2" placeholder="Qué vas a hacer con esto"></textarea>',
    '<textarea rows="2" placeholder="Qué vas a hacer con esto" onchange="\'+on(function(x){reNota(R,x)})+\'">\'+esc(R.nota||"")+\'</textarea>')
rep('btn("Descargar",T("Descarga la partida"),"sm")','btn("Descargar",function(){reAcc("partida",R)},"sm")')
rep('btn("Copiar para Claude",T("Copiado con contexto y versión"),"gold")','btn("Copiar para Claude",function(){reAcc("copiar",R)},"gold")')
rep('btn("Borrar",T("Reporte borrado"),"red")','btn("Borrar",function(){reAcc("borrar",R)},"red")')

# 8b · interruptores del prototipo (no integrados): se muestran atenuados
rep('function flagsBar(){','function flagsBarOrig(){')

rep('eur(J.din)','"—"')  # dinero no es dato de telemetría

# 8c · columna de identificador de jugador (entre Jugador y Grupo)
rep("'<th>Grupo</th>","'<th>ID</th><th>Grupo</th>")
rep("""'</b> <span class="mono small mut">'+j.id.slice(0,8)+'</span>'+(j.st==="blq"?' <span class="tag bad">bloqueado</span>':'')+'</td><td>'+(j.g?""",
    """'</b>'+(j.st==="blq"?' <span class="tag bad">bloqueado</span>':'')+'</td><td class="mono small">'+esc(j.id)+'</td><td>'+(j.g?""")

# 8d · borrado de usuarios (con confirmación)
rep('btn("Borrar datos",function(){modal(confirmar("Borrar los datos de "+ns+" jugadores","BORRAR","Datos borrados"))},"sm red")',
    'btn("Borrar datos",function(){modal(pbConfirmaBorrar(Object.keys(ST.chk).filter(function(k){return ST.chk[k]})))},"sm red")')
rep('btn("Borrar todos sus datos",function(){modal(confirmar("Borrar los datos de "+jNom(J),"BORRAR","Datos borrados"))},"red")',
    'btn("Borrar todos sus datos",function(){modal(pbConfirmaBorrar([J.id]))},"red")')

# 9 · estilos de lo no integrado, login y utilidades
css='''
.off{opacity:.35;pointer-events:none;cursor:not-allowed}
.b[disabled]{opacity:.35;cursor:not-allowed}
.hide{display:none!important}
.login{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
.lg{width:min(360px,100%)}
.lg input{width:100%;margin:4px 0 10px}
.errt{color:#f87171}
'''
rep('</style>', css+'</style>')

# 10 · lógica adaptada, catálogo de efectos y arranque
adapt=open('/tmp/parche/adapt.js',encoding='utf-8').read()
rep('go();\n</script>\n</body>', '/* catálogo de efectos del panel (mismo que el juego) */\n'+cat+'\n'+adapt+'\ngo();\n</script>\n</body>')

open(OUT,'w',encoding='utf-8').write(s)
open('/home/claude/goatmaker/admin/index.html','w',encoding='utf-8').write(s)
m=re.search(r'<script>(.*)</script>',s,re.S)
open('/tmp/parche/nuevo_script.js','w',encoding='utf-8').write(m.group(1))
print('OK', len(s))
