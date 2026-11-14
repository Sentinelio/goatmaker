# Uso:  python3 dis/piramide/mutar_html.py [nucleo|interfaz|todo]     (necesita /mnt/user-data/outputs/la-primera.html y piramide.html ya construido)
# Mutaciones sobre el HTML ENTREGADO. Dos capas, cada una con su guardián:
#   · NÚCLEO (entre CORE-START y CORE-END): F87 debe morir — la calculadora tiene que seguir siendo el motor y cumplir las propiedades de lo propuesto.
#   · INTERFAZ (fuera del núcleo): F87 NO debe notarlo (no es del núcleo) pero E2E_piramide SÍ — la pantalla tiene que pintar lo que calcula el núcleo.
import subprocess, os, sys, tempfile
OUT='/mnt/user-data/outputs'
src=open(OUT+'/piramide.html',encoding='utf8').read()
ia=src.index('/*CORE-START*/'); ib=src.index('/*CORE-END*/')
NUCLEO=[
 ("techo por punto 0,28→0,30","inc=0.28","inc=0.30"),
 ("XP por nivel 10n→11n","return 30+10*n;","return 30+11*n;"),
 ("papel titular dif>=2→>=3","dif>=2? 0","dif>=3? 0"),
 ("franja ≥71→≥72","mia>=71?4","mia>=72?4"),
 ("formación: escala ×0,9 sobre el techo base","var base=68+(form||0)","var base=68+(form||0)*0.9"),
 ("término de edad «suave»: pendiente 1,1→1,2","5.5-(e-30)*1.1","5.5-(e-30)*1.2"),
 ("término de edad «plano»: 5,5→5,6",'MODO_EDAD==="plano"? 5.5','MODO_EDAD==="plano"? 5.6'),
 ("tope máximo de formación +1","form=clamp(form,fMin,fMax);","form=clamp(form,fMin,fMax+1);"),
 ("entorno: la formación por temporada se suma a la mitad","form+=(en.dForm||0);","form+=(en.dForm||0)*0.5;"),
 ("giros: el salto se suma doble","form+=(p.girosDe(a)||0);","form+=(p.girosDe(a)||0)*2;"),
 ("ritmo: no multiplica la XP","xpA=xpT*ritmo;","xpA=xpT;"),
 ("ritmo: no multiplica el entreno","multEntreno:(p.multEntreno||1)*ritmo","multEntreno:(p.multEntreno||1)"),
 ("formación de partida a la mitad","form=(p.form0||0)","form=(p.form0||0)*0.5"),
 ("modo de edad desconocido se acepta",'(m==="suave"||m==="plano")? m : "actual"','(m==="suave"||m==="plano"||m==="raro")? m : "actual"'),
]
INTERFAZ=[
 ("valor por defecto: Élite +1,0→+1,1",'elite:{n:"Élite",ritmo:1.4,dForm:1.0}','elite:{n:"Élite",ritmo:1.4,dForm:1.1}'),
 ("regla exigida hasta los 24→25","edadRegla:24","edadRegla:25"),
 ("las etapas se leen sin ordenar por edad","ST.g.tramos.slice().sort(function(p,q){ return p.de-q.de; })","ST.g.tramos.slice()"),
 ("la plasticidad no se aplica","dForm:(n.dForm>0? n.dForm*plastDe(a) : n.dForm)","dForm:n.dForm"),
 ("la formación de partida no llega a la simulación","p.form0=G.form0;","p.form0=0;"),
 ("color del 3.º de Primera mal asignado",'m>=U.top? "t2"','m>=U.top? "t1"'),
 ("la tabla del término de edad deja el núcleo cambiado","try{ return CORE.mediaAspirante(ST.pos,e,ST.nota); } finally{ CORE.setModoEdad(prev); }",'try{ return CORE.mediaAspirante(ST.pos,e,ST.nota); } finally{ CORE.setModoEdad("suave"); }'),
 ("una edad de etapa fuera de 14–38 se acepta","if(!(v>=14&&v<=38)) return; T.de=v;","T.de=v;"),
 ("«sin callejones» con B > 3.º en vez de ≥","cal=r.B.media>=U.top","cal=r.B.media>U.top"),
 ("«sin garantías» con D ≤ 3.º en vez de <","gar=r.D.media<U.top","gar=r.D.media<=U.top"),
 ("los minutos no se sincronizan con la pestaña 3",'querySelectorAll("#xpp .pill,#g-xpp .pill")','querySelectorAll("#g-xpp .pill")'),
 ("tocar el escenario no pasa a «Escenario propio»",'function marcaCustom(){ ST.g.preset="custom"; }','function marcaCustom(){ }'),
]
D=os.path.dirname(os.path.abspath(__file__)); W=tempfile.mkdtemp(prefix='mut_piramide_'); res=[]
def mutar(a,b,dentro):
    assert src.count(a)==1, "el patrón debe aparecer UNA vez (aparece %d): %s"%(src.count(a),a)
    pos=src.index(a)
    assert (ia<pos<ib)==dentro, ("debería estar dentro del núcleo: " if dentro else "debería estar fuera del núcleo: ")+a
    p=os.path.join(W,'_mut.html'); open(p,'w',encoding='utf8').write(src[:pos]+b+src[pos+len(a):]); return p
def f87(p):
    r=subprocess.run(['bash',OUT+'/dis/correr.sh',os.path.join(D,'..','F87_piramide.js'),'1'],env=dict(os.environ,CALC=p,TAIL='40'),capture_output=True,text=True,cwd=W)
    o=(r.stdout+r.stderr).strip().splitlines(); ult=next((l for l in o if l.startswith("✘") or l.startswith("✔")), o[-1] if o else "")
    return ult.startswith("✘") or any("Error" in l for l in o)
def e2e(p):
    r=subprocess.run(['node',OUT+'/dis/E2E_piramide.js'],env=dict(os.environ,CALC=p),capture_output=True,text=True,cwd=W,timeout=300)
    return r.returncode!=0 or "✘" in r.stdout
g=(sys.argv[1] if len(sys.argv)>1 else 'todo')
if g in ('nucleo','todo'):
    print("== NÚCLEO: F87 debe detectarlas",flush=True)
    for n,a,b in NUCLEO:
        m=f87(mutar(a,b,True)); res.append(m); print(("  OK  " if m else "  ¡¡ MAL ")+n+"  →  "+("detectada" if m else "NO detectada"),flush=True)
if g in ('interfaz','todo'):
    print("== INTERFAZ: F87 no las nota (no son del núcleo) y E2E_piramide sí",flush=True)
    for n,a,b in INTERFAZ:
        p=mutar(a,b,False); por87=f87(p); poe2e=e2e(p); bien=(not por87) and poe2e; res.append(bien)
        print(("  OK  " if bien else "  ¡¡ MAL ")+n+"  →  F87 "+("la notó (no debería)" if por87 else "no la nota")+" · E2E "+("la detecta" if poe2e else "NO la detecta"),flush=True)
print("TODAS COMO SE ESPERABA" if all(res) else "HAY MUTACIONES QUE NO SE COMPORTAN COMO SE ESPERABA",flush=True)
