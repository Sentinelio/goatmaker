/* Mi equipo personal (0.04.003): cuerpo, mercado, planes automáticos, sintonía, migración y efecto en temporadas */
var OK=0, KO=0;
function t(c,m){ if(c){ OK++; } else { KO++; console.log("✘ "+m); } }
function base(pos,alt,peso,media){
  OVSEM=null; OVSEM_COLA=[]; NEG=null;
  S=nuevoEstado("SEV",pos||"DC","Manu",9,"D",ROLES[pos||"DC"][0].id,24);
  S.contrato={salario:2000000,anos:3,clausula:12000000,prima:25000,franja:"media",exige:65};
  ["TEC","FIS","TAC","DEF","MEN","POR"].forEach(function(k){ if(S.attr[k]!==undefined) S.attr[k]=media||60; });
  S.altura=alt||191; S.peso=peso||105; S.dinero=5000000; S.fama=60;
  S.compis=crearCompis("SEV","Manu"); S.entrenador=crearEntrenador("SEV");
  eqInit(); return S;
}
function ficha(p,nivel,estilo){
  var E=eqInit(), id=estilo||EQ_ESTILOS[p][0].id;
  E.st[p]={id:"t-"+p, p:p, n:"Test "+p, edad:40, exp:10, nivel:nivel, pot:nivel, estilo:id, sem:30, sal:eqSalario(p,nivel)};
  E.tuvo=E.tuvo||{}; E.tuvo[p]=1;
}
function candN(p,n){ for(var q=1;q<80;q++){ S.temporada=q; S.eq.mercado=null; var c=eqMercado(p).filter(function(x){return x.nivel===n;})[0]; if(c) return c; } return null; }
function equipo(nivel){ EQ_PUESTOS.forEach(function(p){ ficha(p,nivel, p==="prep"?"integral":p==="fisio"?"integral":p==="chef"?"mediterraneo":null); }); }

/* ---- 1. cuerpo ---- */
base("DC",191,105);
var d=pesoDesv();
t(Math.abs(d.ideal-85.7)<0.3,"peso ideal de un delantero de 191 cm ≈ 85,7 kg: "+d.ideal.toFixed(1));
t(d.sobre>14 && d.sobre<16,"105 kg a 191 cm: sobrepeso ≈ 15 kg sobre el rango: "+d.sobre.toFixed(1));
var mGordo=miMedia(); S.peso=Math.round(pesoIdeal()); var mIdeal=miMedia();
t(mIdeal-mGordo>=5,"el sobrepeso baja tu media en ≥5 puntos: "+mGordo+" frente a "+mIdeal);
S.peso=105;
t(mPesoOf()<0.8,"un delantero con 15 kg de más pierde ≥20% de remate/asistencia: ×"+mPesoOf().toFixed(2));
S.pos="DFC"; t(mPesoDef()>1.15,"un central pesado encaja más: ×"+mPesoDef().toFixed(2)); S.pos="DC";
t(pesoLesion()>1.25,"el sobrepeso sube el riesgo de lesión ≥25%: ×"+pesoLesion().toFixed(2));
t(pesoDesgaste()>1.4,"te cansas más: ×"+pesoDesgaste().toFixed(2));
S.peso=Math.round(pesoIdeal());
t(mPesoOf()===1 && mPesoDef()===1 && pesoLesion()===1,"en el peso ideal no hay castigo");
S.peso=105;

/* ---- 2. mercado ---- */
EQ_PUESTOS.forEach(function(p){
  var L=eqMercado(p), L2=eqMercado(p);
  t(L.length===6,p+": seis candidatos");
  t(L.some(function(c){return c.nivel<=2;}) && L.some(function(c){return c.nivel>=4;}),p+": hay barato y hay élite");
  t(L===L2 || JSON.stringify(L)===JSON.stringify(L2),p+": el mercado no cambia al volver a mirar");
  t(L.every(function(c){ return c.pot>=c.nivel && c.pot<=Math.max(c.nivel,4); }),p+": potencial coherente");
  var sal=L.map(function(c){return eqSalario(p,c.nivel);});
  t(sal.every(function(x,i){ return i===0 || x>=sal[i-1]; }),p+": más nivel, más caro");
});
var jovenes=0, joyas=0;
for(var k=0;k<40;k++){ S.temporada=k+1; S.eq.mercado=null; eqMercado("prep").forEach(function(c){ if(c.nivel===1){ jovenes++; if(c.pot>=3) joyas++; } }); }
t(joyas/jovenes>0.25 && joyas/jovenes<0.55,"entre los sin experiencia, ~35% son promesas (pot≥3): "+Math.round(joyas/jovenes*100)+"%");
S.temporada=1; S.eq.mercado=null;

/* ---- 3. contratar ---- */
base("DC",191,105);
var elite=candN("fisio",5);
var dinero0=S.dinero;
t(eqContratar("fisio",elite.id)===null && S.eq.st.fisio.nivel===5,"se ficha a un fisio élite");
t(dinero0-S.dinero===eqSalario("fisio",5),"se paga su sueldo anual al fichar");
t(!eqMercado("fisio").some(function(c){return c.id===elite.id;}),"el fichado sale del mercado");
base("DC",191,105); S.fama=30;
var el2=candN("prep",5);
t(/fama/i.test(eqContratar("prep",el2.id)||""),"un élite exige fama: "+eqContratar("prep",el2.id));
S.fama=60; S.dinero=1000;
t(/No te llega/.test(eqContratar("prep",el2.id)||""),"sin dinero no se ficha");
S.dinero=5000000;
t(eqContratar("prep","no-existe")!==null,"candidato inexistente");

/* ---- 4. fuerza y efectos crecientes con el nivel ---- */
var prev=null;
[1,2,3,4,5].forEach(function(n){
  base("DC",191,105); equipo(n);
  var F=eqFx();
  if(prev){
    t(F.regen>prev.regen && F.riesgoMenos>prev.riesgoMenos && F.mult>prev.mult,"nivel "+n+" rinde más que el anterior");
  }
  prev=F;
});
base("DC",191,80); equipo(5); var Fe=eqFx();
base("DC",191,80); equipo(1); var Fn=eqFx();
t(Fe.regen>5 && Fe.regen<9,"equipo élite: forma +"+Fe.regen.toFixed(1)+"/sem (5-9)");
t(Fn.regen<1.6,"equipo novato: forma +"+Fn.regen.toFixed(1)+"/sem (<1,6)");
t(1+Fe.mult>=1.25 && 1+Fe.mult<=1.45,"élite: Físico en entreno ×"+(1+Fe.mult).toFixed(2)+" (1,25-1,45)");
t(1+Fn.mult<1.1,"novato: Físico en entreno ×"+(1+Fn.mult).toFixed(2)+" (<1,10)");
base("DC",191,80); equipo(5); t(eqModLes()<=0.55,"élite: riesgo de lesión ×"+eqModLes().toFixed(2)+" (≤0,55)");
base("DC",191,80); equipo(1); t(eqModLes()>0.85,"novato: riesgo de lesión ×"+eqModLes().toFixed(2)+" (>0,85)");

/* ---- 5. planes: el automático acierta según el nivel ---- */
function acierto(nivel){
  base("DC",191,105); ficha("chef",nivel,"mediterraneo"); var n=0, tot=400;
  for(var j=0;j<tot;j++){ S.jornada=j%38; S.temporada=1+Math.floor(j/38); if(eqPlanElegido("chef")===eqPlanOptimo("chef")) n++; }
  return n/tot;
}
var a1=acierto(1), a3=acierto(3), a5=acierto(5);
t(a5===1,"el chef élite siempre elige el plan ideal: "+a5);
t(a1>0.3 && a1<0.6,"el chef sin experiencia acierta ~45%: "+Math.round(a1*100)+"%");
t(a1<a3 && a3<a5,"acierto creciente: "+[a1,a3,a5].map(function(x){return Math.round(x*100);}).join(" < "));
base("DC",191,105); ficha("chef",5); t(eqPlanOptimo("chef")==="definicion","con sobrepeso, el chef pone definición");
S.peso=Math.round(pesoIdeal()); t(eqPlanOptimo("chef")==="equilibrada" || eqPlanOptimo("chef")==="rendimiento","en peso ideal, ya no hace dieta: "+eqPlanOptimo("chef"));
S.lesion=2; t(eqPlanOptimo("chef")==="antiinflam" && eqPlanOptimo("prep")==="prevencion","con una lesión: antiinflamatoria y prevención");
S.lesion=0; S.peso=105;
t(eqPlanOptimo("prep")==="composicion","con sobrepeso, el preparador trabaja la composición");
/* manual: tu plan manda, y un plan malo rinde menos */
base("DC",191,105); ficha("chef",5); S.eq.plan.chef="volumen";
t(eqPlanElegido("chef")==="volumen" && eqFit("chef")===0.8,"plan manual absurdo (volumen con sobrepeso): se sigue, pero rinde un 20% menos");
S.eq.auto=false; t(eqPlanElegido("chef")!=="volumen","sin modo automático se ignora el plan elegido y se sigue el estándar");

/* ---- 6. sintonía ---- */
function sintTrasSemanas(estPrep,estFisio,n,analista){
  base("DC",191,80); ficha("prep",3,estPrep); ficha("fisio",3,estFisio); if(analista) ficha("analista",analista);
  S.eq.st.prep.sem=0; S.eq.st.fisio.sem=0;
  for(var i=0;i<n;i++) semanaEquipo();
  return S.eq.sint.pf;
}
var choque=sintTrasSemanas("explosivo","manual",30), afin=sintTrasSemanas("funcional","manual",30), neutro=sintTrasSemanas("integral","integral",30);
t(choque<afin,"carga + cuidado chocan: "+Math.round(choque)+" < "+Math.round(afin)+" (mismo tipo)");
t(choque<neutro,"carga + cuidado chocan más que neutros: "+Math.round(choque)+" < "+Math.round(neutro));
var conAn=sintTrasSemanas("explosivo","manual",30,5);
t(conAn>choque+10,"un analista élite arregla la sintonía: "+Math.round(conAn)+" frente a "+Math.round(choque));
base("DC",191,80); ficha("prep",3); ficha("fisio",3);
S.eq.sint.pf=100; var fAlta=eqFuerza("prep"); S.eq.sint.pf=0; S.eq.sint.pc=0; var fBaja=eqFuerza("prep");
t(Math.abs(fAlta/fBaja-1.25/0.85)<0.02,"la sintonía mueve la fuerza de ×0,85 a ×1,25: "+(fAlta/fBaja).toFixed(2));

/* ---- 7. el cuerpo cambia: 105 kg, 191 cm ---- */
function semanasHastaIdeal(setup,max){
  base("DC",191,105); setup();
  for(var i=1;i<=max;i++){ S.jornada=i%38; semanaEquipo(); if(pesoDesv().sobre===0) return {w:i, peso:S.peso}; }
  return {w:null, peso:S.peso};
}
var sin=semanasHastaIdeal(function(){},38), nov=semanasHastaIdeal(function(){ equipo(1); },38), eli=semanasHastaIdeal(function(){ equipo(5); },60);
console.log("peso 105 kg→ideal: sin equipo "+sin.peso+" kg tras 38 sem · novato "+nov.peso+" kg tras 38 sem · élite: "+eli.w+" sem");
t(eli.w!==null && eli.w>=10 && eli.w<=30,"con equipo élite llegas al peso ideal en 10-30 semanas: "+eli.w);
t(nov.peso<sin.peso-2 || nov.w!==null,"un equipo novato ayuda más que nada: "+nov.peso+" kg frente a "+sin.peso+" kg");
t(sin.peso<105 && sin.w===null,"sin equipo el club lo corrige, pero muy despacio (no llega en una temporada): "+sin.peso+" kg");
base("DC",191,105); var burlas=0, p0=(S.prensa||[]).length;
for(var i=0;i<38;i++){ S.jornada=i; var antes=(S.prensa||[]).length; semanaEquipo(); S.peso=105; if((S.prensa||[]).length>antes) burlas++; }
t(burlas>=3,"con 105 kg la prensa y la grada se ríen de ti (≥3 veces en 38 semanas): "+burlas);
base("DC",191,86); burlas=0;
for(var i=0;i<38;i++){ S.jornada=i; var a2=(S.prensa||[]).length; semanaEquipo(); S.peso=86; if((S.prensa||[]).length>a2) burlas++; }
t(burlas===0,"en tu peso no hay burlas: "+burlas);
/* demasiado delgado también cuesta */
base("DFC",191,70); t(pesoDesv().infra>5 && mPesoDef()>1.05,"infrapeso: un central flojo en los duelos ×"+mPesoDef().toFixed(2));

/* ---- 8. verano: sueldos, aprendizaje, ofertas, reposición ---- */
base("MC",180,75); ficha("prep",1); S.eq.st.prep.pot=4; S.eq.st.prep.sem=30;
var g={dinero:9000000}; var av=eqRenovar(g);
t(S.eq.st.prep && S.eq.st.prep.nivel>=1 && g.dinero<9000000,"el sueldo se paga en el cierre de verano");
var crecio=0, fuga=0, n2=60;
for(var q=0;q<n2;q++){
  base("MC",180,75); S.temporada=q+1; ficha("prep",1); S.eq.st.prep.pot=4; S.eq.st.prep.sem=30;
  var gg={dinero:9000000}; eqRenovar(gg);
  if(S.eq.st.prep && S.eq.st.prep.nivel>1) crecio++; if(!S.eq.st.prep || S.eq.st.prep.n!=="Test prep") fuga++;
}
t(crecio>n2*0.5,"las promesas crecen contigo (nivel +1 en la mayoría): "+crecio+"/"+n2);
var fugaElite=0, fugaNov=0;
for(var q=0;q<80;q++){
  base("MC",180,75); S.temporada=q+1; S.eq.rehire=false; ficha("fisio",5); ficha("chef",1);
  var gg2={dinero:9000000}; eqRenovar(gg2);
  if(!S.eq.st.fisio) fugaElite++; if(!S.eq.st.chef) fugaNov++;
}
t(fugaElite>fugaNov,"los élite reciben más ofertas de otros clubes: "+fugaElite+" frente a "+fugaNov);
base("MC",180,75); ficha("fisio",3); var gz={dinero:10}; eqRenovar(gz);
t(!S.eq.st.fisio,"si no llegas a pagarlo, se marcha");
base("MC",180,75); S.eq.rehire=true; ficha("fisio",4); S.temporada=7;
var rfOk=0; for(var q=0;q<200 && !rfOk;q++){ base("MC",180,75); S.temporada=q+1; S.eq.rehire=true; ficha("fisio",4); var g3={dinero:90000000}; var avv=eqRenovar(g3); if(avv.some(function(x){return /ficha por otro club/.test(x);}) && S.eq.st.fisio) rfOk=1; }
t(rfOk===1,"con reposición automática, quien se va se sustituye");

/* ---- 9. migración de los sistemas viejos ---- */
base("MC",180,75); S.vida.fisio=true; S.vida.mentor=true; S.tienda={own:{},serv:{"chef-2-1":1,"fisio-0-0":1,"estilo-0-0":1}}; S.eq=null; eqInit();
eqMigrar();
t(S.eq.st.fisio && S.eq.st.mente && S.eq.st.chef,"los servicios viejos pasan a Mi equipo");
t(S.vida.fisio===false && S.vida.mentor===false,"los flags viejos se apagan");
t(!S.tienda.serv["chef-2-1"] && !S.tienda.serv["fisio-0-0"] && S.tienda.serv["estilo-0-0"],"solo se retiran los tres servicios migrados");
t(S.eq.st.chef.nivel===4,"un chef «premium» (tier 2) pasa a nivel 4: "+S.eq.st.chef.nivel);
var snap=JSON.stringify(S.eq.st); eqMigrar(); t(JSON.stringify(S.eq.st)===snap,"la migración es idempotente");
t(!TIENDA_CATS.some(function(c){ return ["fisio","chef","mente"].indexOf(c.id)>=0; }),"el Bazar ya no vende fisio/chef/coach");

/* ---- 10. pantallas y botones ---- */
base("DC",191,105);
var h0=secStaff(); t(/Sobrepeso/.test(h0) && /Candidatos/.test(h0),"la pestaña pinta sin equipo (con el aviso de sobrepeso)");
equipo(3); S.eq.info=[]; semanaEquipo(); var h1=secStaff();
t(/Informe semanal/.test(h1) && /Sintonía/.test(h1) && /Automático/.test(h1),"con equipo: informe, sintonía y plan automático");
eqToggleAuto(); t(S.eq.auto===false,"se desactiva el modo automático"); eqToggleAuto(); t(S.eq.auto===true,"y se reactiva");
eqPlanSet("chef","antiinflam"); t(S.eq.plan.chef==="antiinflam","se fija un plan");
eqDespedir("analista"); var cand=eqMercado("analista")[0]; var _m=modal, cfg=null; modal=function(c){ cfg=c; }; eqFichar("analista",cand.id); modal=_m;
t(cfg && /Contratar/.test(cfg.okTxt) && !S.eq.st.analista,"fichar pide confirmación antes de contratar"); cfg.onOk(); t(S.eq.st.analista && S.eq.st.analista.id===cand.id,"y al confirmar se ficha");
var c2=eqMercado("analista")[0]; modal=function(c){ cfg=c; }; eqFichar("analista",c2.id); modal=_m;
t(/Sustituye a/.test(cfg.x) && /sustituir/i.test(cfg.okTxt) && S.eq.st.analista.id===cand.id,"si reemplazas a alguien, avisa de a quién despides y no cambia hasta confirmar");
/* sintonía de los cinco */
equipo(3); ["mente","analista"].forEach(function(q){ ficha(q,3); }); for(var i=0;i<4;i++) semanaEquipo();
var hh=secStaff(); t(/Psicólogo|Coach|mental/i.test(hh) && /Analista de rendimiento ↔/.test(hh) || /↔ Analista de rendimiento/.test(hh),"la sintonía enseña también al coach mental y al analista");
t(Object.keys(EQ_PARES).every(function(k){ return !eqPar(k) || typeof S.eq.sint[k]==="number"; }),"los diez pares con equipo completo tienen sintonía");
t((hh.match(/<line /g)||[]).length===10 && (hh.match(/<circle /g)||[]).length===5,"con cinco perfiles: pentágono con diez uniones: "+(hh.match(/<line /g)||[]).length);
t(/#e5534b|#8b93a1|#3fb950/.test(hh),"las uniones llevan color");
S.eq.sint.pf=10; S.eq.sint.fc=55; S.eq.sint.pc=90; var h3=secStaff();
t(/stroke="#e5534b"[^>]*><title>[^<]*Preparador[^<]*Fisio[^<]*: 10\/100/.test(h3) && /stroke="#8b93a1"[^>]*><title>[^<]*Fisio[^<]*Chef[^<]*: 55\/100/.test(h3) && /stroke="#3fb950"[^>]*><title>[^<]*Preparador[^<]*Chef[^<]*: 90\/100/.test(h3),"mala en rojo, neutral en gris, buena en verde");
t(/Lo que peor funciona/.test(h3),"avisa del cruce que peor funciona");
eqDespedir("analista"); t(!S.eq.st.analista,"y el de prescindir"); t(S.eq.tuvo.analista===0,"quien despides no se repone solo");
S.eq.dilema={j:jorAbs(), txt:"x", o:["a","b","c"]}; t(/Desacuerdo/.test(secStaff()),"el dilema se enseña"); eqDilemaElige(2); t(!S.eq.dilema,"y se resuelve");
t(/<details class="eqcand"(?! open)/.test(secStaff()),"con puesto ocupado, la lista de candidatos viene colapsada"); S.eq.st.prep=null; t(/<details class="eqcand" open/.test(secStaff()),"con el puesto vacante, abierta"); ficha("prep",3);
SUB.cuentas="staff"; t(/Mi equipo/.test(secCuentas()) && /Tu cuerpo/.test(secCuentas()),"Cuentas › Mi equipo existe");
t(SUBS.cuentas.some(function(x){return x[0]==="staff";}),"la subpestaña está registrada");
SUB.cuentas="dinero"; t(!/Prescindir/.test(secCuentas()),"Dinero ya no vende fisio ni coach");
secMedica();

/* ---- 11. temporadas: sin equipo, novato y élite ---- */
function liga(nivel, temporadas){
  var res={lesiones:0, forma:0, n:0, fis0:0, fis1:0};
  for(var rep=0;rep<3;rep++){
    base("DC",191,86,58); S.attr.FIS=58;
    if(nivel){ equipo(nivel); }
    res.fis0+=S.attr.FIS;
    for(var tt=0;tt<temporadas;tt++){
      var hl0=(S.histLes||[]).length;
      try{ temporadaCompleta(); }catch(e){ console.log("ERROR temporada",e.message); break; }
      res.lesiones+=(S.histLes||[]).length-hl0;
      res.forma+=(S.forma===undefined?70:S.forma); res.n++;
      break;
    }
    res.fis1+=S.attr.FIS;
  }
  res.fis=(res.fis1-res.fis0)/3; res.les=res.lesiones/3; res.forma=res.forma/res.n;
  return res;
}
var L0=liga(0,1), L1=liga(1,1), L5=liga(5,1);
console.log("1 temporada · sin equipo: lesiones "+L0.les.toFixed(1)+", FIS +"+L0.fis.toFixed(1)+", forma "+L0.forma.toFixed(0)+
            " | novato: "+L1.les.toFixed(1)+", +"+L1.fis.toFixed(1)+", "+L1.forma.toFixed(0)+" | élite: "+L5.les.toFixed(1)+", +"+L5.fis.toFixed(1)+", "+L5.forma.toFixed(0));
t(isFinite(L5.fis)&&isFinite(L1.fis)&&isFinite(L0.fis)&&!JSON.stringify(S.eq).match(/NaN|null,\"sal\":null/),"una temporada completa con equipo no deja NaN");

/* ---- 12. cursos cortos: 1-6 semanas, tiempo y calidad, con sustituto ---- */
function pasan(n){ for(var w=1;w<=n;w++){ S.jornada++; semanaEquipo(); } }
base("MC",180,75); ficha("fisio",2); S.eq.st.fisio.pot=4; S.dinero=9000000; S.jornada=0;
t(eqCursoApuntar("fisio",30,3,0)===null && S.eq.st.fisio.curso.sem===6,"el máximo son 6 semanas: no se puede perder a nadie 30"); S.eq.st.fisio.curso=null; S.dinero=9000000;
t(eqCursoApuntar("fisio",0,3,0)===null && S.eq.st.fisio.curso.sem===1,"y el mínimo, una"); S.eq.st.fisio.curso=null; S.dinero=9000000;
t(eqCursoCoste("fisio",3,1)<eqCursoCoste("fisio",3,3) && eqCursoCoste("fisio",3,3)<eqCursoCoste("fisio",3,5),"más calidad, más caro");
t(eqCursoCoste("fisio",1,3)<eqCursoCoste("fisio",6,3),"más tiempo, más caro");
var m2=S.eq.st.fisio; t(eqCursoProg(m2,1,3)<eqCursoProg(m2,3,3) && eqCursoProg(m2,3,3)<eqCursoProg(m2,6,3),"más tiempo, más aprendizaje");
t(eqCursoProg(m2,6,3)-eqCursoProg(m2,3,3) < eqCursoProg(m2,3,3),"con rendimientos decrecientes");
t(eqCursoProg(m2,4,2)<eqCursoProg(m2,4,4),"más calidad, más aprendizaje");
t(eqCursoProg(m2,6,5)<1,"un solo curso, por bueno que sea, no da un escalón entero: "+eqCursoProg(m2,6,5).toFixed(2));
base("MC",180,75); ficha("fisio",1); S.eq.st.fisio.pot=1; var m1=S.eq.st.fisio;
t(eqCalUtil(m1,5)===3 && Math.abs(eqCursoProg(m1,6,5)-eqCursoProg(m1,6,3))<1e-9,"un novato solo aprovecha calidad 3: pagar más no rinde");
base("MC",180,75); ficha("fisio",3); S.dinero=9000000; S.jornada=0;
var fb=eqFuerza("fisio"); var d0=S.dinero;
t(eqCursoApuntar("fisio",4,3,0)===null && d0-S.dinero===eqCursoCoste("fisio",4,3),"sin sustituto solo pagas el curso");
t(Math.abs(eqFuerza("fisio")/fb-0.4)<0.01,"sin sustituto rinde el 40%");
t(eqCursoApuntar("fisio",2,1,1)!==null,"un curso a la vez");
base("MC",180,75); ficha("fisio",3); S.dinero=9000000; S.jornada=0; fb=eqFuerza("fisio"); d0=S.dinero;
eqCursoApuntar("fisio",4,3,1); t(d0-S.dinero===eqCursoCoste("fisio",4,3)+eqSustCoste("fisio",4,1),"el interino se paga aparte");
t(Math.abs(eqFuerza("fisio")/fb-0.7)<0.01,"con interino se cubre el 70%");
base("MC",180,75); ficha("fisio",3); S.dinero=9000000; S.jornada=0; fb=eqFuerza("fisio"); eqCursoApuntar("fisio",4,3,2);
t(Math.abs(eqFuerza("fisio")/fb-0.95)<0.01,"con sustituto de confianza el 95%");
t(eqSustCoste("fisio",4,2)>eqSustCoste("fisio",4,1) && eqSustCoste("fisio",2,2)<eqSustCoste("fisio",6,2),"el de confianza cuesta más; más semanas, más coste");
var lv=S.eq.st.fisio.nivel; pasan(3); t(S.eq.st.fisio.curso && S.eq.st.fisio.nivel===lv,"antes de terminar no cambia nada");
pasan(1); t(!S.eq.st.fisio.curso && Math.abs(eqFuerza("fisio")/fb-1)<0.01,"al volver rinde al 100% otra vez");
var subidas=0; for(var q=0;q<40;q++){ base("MC",180,75); S.temporada=q+1; ficha("fisio",2); S.eq.st.fisio.pot=4; S.dinero=9e6; S.jornada=0;
  for(var c=0;c<3;c++){ eqCursoApuntar("fisio",6,4,0); pasan(6); pasan(2); } if(S.eq.st.fisio.nivel===3) subidas++; }
t(subidas>=34,"tres cursos buenos de 6 semanas (18 de 38) suben un escalón casi siempre: "+subidas+"/40");
var subs2=0; for(var q=0;q<40;q++){ base("MC",180,75); S.temporada=q+1; ficha("fisio",2); S.eq.st.fisio.pot=4; S.dinero=9e6; S.jornada=0; eqCursoApuntar("fisio",1,1,0); pasan(1); if(S.eq.st.fisio.nivel===3) subs2++; }
t(subs2===0,"un taller básico de una semana no sube un escalón");
var cur=0; for(var q=0;q<30;q++){ base("MC",180,75); S.temporada=q+1; ficha("fisio",1); S.eq.st.fisio.pot=4; S.dinero=9e7; S.jornada=0;
  for(var c=0;c<4;c++){ eqCursoApuntar("fisio",6,5,0); pasan(6); } if(S.eq.st.fisio.nivel>=2) cur++; }
t(cur>=26,"un novato con cuatro cursos máximos (24 semanas fuera en total) sube un escalón: "+cur+"/30");
base("MC",180,75); ficha("fisio",4); S.eq.st.fisio.pot=4; t(eqCursoApuntar("fisio",4,3,0)!==null,"en su techo no aprende más");
base("MC",180,75); ficha("fisio",2); S.dinero=1000; t(/No te llega/.test(eqCursoApuntar("fisio",6,5,2)||""),"sin dinero no hay curso");
base("MC",180,75); ficha("fisio",2); S.dinero=9e6; S.jornada=37; eqCursoApuntar("fisio",5,3,1); t(S.eq.st.fisio.curso.fin===jorAbs()+5,"un curso puede cruzar el verano");
var g={dinero:9e6}; eqRenovar(g); t(S.eq.st.fisio && S.eq.st.fisio.curso,"y el verano no lo cancela");
base("DC",191,105); ficha("prep",2); t(/Mandar a un curso/.test(secStaff()),"la ficha ofrece mandarlo a un curso");
var _m3=modal, cf=null; modal=function(c){ cf=c; }; S.dinero=9e6; eqCursoElige("prep"); modal=_m3;
t(cf && /Apuntar/.test(cf.okTxt) && (cf.x.match(/type="range"/g)||[]).length===3 && /max="6"/.test(cf.x),"el diálogo trae tiempo (1-6), calidad y sustituto");
S.dinero=9e6; eqCursoApuntar("prep",4,3,1); t(/En un curso/.test(secStaff()),"y la ficha muestra cuándo vuelve");
console.log("EQUIPO: "+OK+" ok · "+KO+" fallos");
