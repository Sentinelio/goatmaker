/* ===== F87 · LA CALCULADORA ES EL MOTOR (piramide.html) =====
   Carga el bloque CORE de la calculadora y lo compara, función a función, con el motor real de la-primera.html:
   media de salida, nivel inicial, techo y declive, media en partida, ganancia de un entreno, envejecimiento,
   reglas de edad (sueldo, valor, traspaso, óxido), franjas y una carrera completa (sesiones + XP + techo) temporada a temporada.
   Uso:  cd <carpeta con lap.js>; CALC=/ruta/piramide.html TAIL=20 bash dis/correr.sh F87_piramide.js 1                              */
renderHub=function(){};
var fs=require("fs");
var SRC=process.env.CALC||"/mnt/user-data/outputs/piramide.html";
var TXT=fs.readFileSync(SRC,"utf8");
var ia=TXT.indexOf("/*CORE-START*/"), ib=TXT.indexOf("/*CORE-END*/");
var CORE=(new Function((ia>=0&&ib>ia? TXT.slice(ia,ib) : TXT)+"\n;return CORE;"))();
var F=[], N=0;
function ok(c,msg){ N++; if(!c){ F.push(msg); } }
function igual(a,b,msg,tol){ N++; if(!(Math.abs(a-b)<=(tol||1e-9))) F.push(msg+" · calc="+a+" motor="+b); }
var POSL=CORE.POSL, EDADES=[]; for(var e=14;e<=38;e++) EDADES.push(e);
edadPick=function(){ return PICK.edad; };      /* el motor recorta a 16–38; aquí se prueba la MISMA fórmula también a los 14–15 */
estiloMister=function(){ return {entreno:{}}; };  /* sin estilo de míster: factor 1 */
function nuevo(pos,edad){ var s=nuevoEstado("SEV",pos,"x",9,"D",ROLES[pos][0].id,edad); s.compis=crearCompis("SEV","x"); s.entrenador=crearEntrenador("SEV"); s.edad=edad; s.techos={}; s.conf=55; s.altura=180; s.peso=75; s.v=VERSION; return s; }   /* 180 cm / 75 kg: lo que el juego pone por defecto al crear el avatar */
var bonusMotor=function(n){ return clamp(Math.round((n-6.3)*(n>=8?12:8)), -16, 26); };   /* el que usa el partido de ojeo (líneas 5555 y 8877) */

/* F1 · media de salida */
POSL.forEach(function(pos){ EDADES.forEach(function(e){ [undefined,3.5,4,5,5.8,6.3,7,7.6,8,8.6,9,10].forEach(function(n){
  S=null; PICK={pos:pos,edad:e,attrBonus:0,bonusPrueba:(n===undefined?0:bonusMotor(n))};
  igual(CORE.mediaAspirante(pos,e,n), mediaAspirante(), "F1 mediaAspirante "+pos+" "+e+" nota "+n, 0);
}); }); });
/* F2 · nivel inicial y XP */
EDADES.forEach(function(e){ [undefined,3,4,5,6,6.3,7.6,9,10].forEach(function(n){ igual(CORE.nivelInicial(e,n), nivelInicial(e,n), "F2 nivelInicial "+e+" nota "+n, 0); }); });
for(var n2=1;n2<=99;n2++) igual(CORE.xpParaNivel(n2), xpParaNivel(n2), "F2 xpParaNivel "+n2, 0);
/* F3 · atributos de salida */
POSL.forEach(function(pos){ EDADES.forEach(function(e){ var s=nuevo(pos,e), a=CORE.atributosIniciales(pos,e);
  Object.keys(a).forEach(function(k){ igual(a[k], s.attr[k], "F3 atributo inicial "+pos+" "+e+" "+k, 0); }); }); });
/* F4 · techo y declive */
POSL.forEach(function(pos){ EDADES.forEach(function(e){ ["TEC","FIS","TAC","DEF","MEN","POR"].forEach(function(k){ [0,12,40,75].forEach(function(pts){
  S=nuevo(pos,e); S.techos={}; S.techos[k]=pts;
  igual(CORE.techoAtributo(pos,e,S.techos,k), techoAtributoDe(k), "F4 techo "+pos+" "+e+" "+k+" +"+pts, 1e-9);
}); }); }); });
/* F5 · media dentro de la partida */
(function(){ var sem=7;
  function r(){ sem=(sem*9301+49297)%233280; return sem/233280; }
  POSL.forEach(function(pos){ EDADES.forEach(function(e){ for(var t=0;t<3;t++){
    S=nuevo(pos,e); var attr={}; ["TEC","FIS","TAC","DEF","MEN","POR"].forEach(function(k){ attr[k]=25+r()*70; }); S.attr=JSON.parse(JSON.stringify(attr));
    igual(CORE.mediaDe(pos,e,attr), miMedia(), "F5 mediaDe "+pos+" "+e, 0); } }); });
})();
/* F6 · una sesión de entreno */
POSL.forEach(function(pos){ [16,22,29,34].forEach(function(e){ CORE.entrenosDe(pos).forEach(function(ej){ Object.keys(ej.sube).forEach(function(k){ [20,45,60,67,70,90].forEach(function(v){ [0,30].forEach(function(pts){
  S=nuevo(pos,e); S.techos={}; S.techos[k]=pts; S.attr[k]=v;
  var motorEj=ENTRENOS.filter(function(x){return x.id===ej.id;})[0];
  igual(CORE.gananciaEntreno(ej,k,v,CORE.techoAtributo(pos,e,S.techos,k),{conf:55}), gananciaEntreno(motorEj,k,false), "F6 entreno "+pos+" "+e+" "+ej.id+" "+k+" v="+v, 1e-9);
  var cat=entrenosDisp().map(function(x){return x.id;});
  ok(cat.indexOf(ej.id)>=0, "F6 el ejercicio "+ej.id+" no existe para "+pos+" en el motor");
}); }); }); }); }); });
POSL.forEach(function(pos){ S=nuevo(pos,22); var motor=entrenosDisp().filter(function(x){ return Object.keys(x.sube).length>0; }).map(function(x){return x.id;}).sort().join(",");
  var calc=CORE.entrenosDe(pos).map(function(x){return x.id;}).sort().join(","); ok(calc===motor, "F6 catálogo de "+pos+" · calc="+calc+" motor="+motor); });
/* F6b · altura y peso cambian el entreno de remate (y solo ese) */
[[170,62],[180,75],[192,88],[200,100],[160,50]].forEach(function(ap){ ["DC","DFC"].forEach(function(pos){ [14,24,31].forEach(function(e){ CORE.entrenosDe(pos).forEach(function(ej){ Object.keys(ej.sube).forEach(function(k){
  S=nuevo(pos,e); S.altura=ap[0]; S.peso=ap[1]; S.techos={}; S.attr[k]=50;
  var motorEj=ENTRENOS.filter(function(x){return x.id===ej.id;})[0];
  igual(CORE.gananciaEntreno(ej,k,50,CORE.techoAtributo(pos,e,S.techos,k),{conf:55,altura:ap[0],peso:ap[1]}), gananciaEntreno(motorEj,k,false), "F6b entreno "+pos+" "+e+" "+ej.id+" "+k+" alt "+ap[0]+"/"+ap[1], 1e-9);
}); }); }); }); });
/* F7 · envejecer (se ejecuta el TEXTO del motor: el bloque «el cuerpo pasa factura» de nuevaTemporada) */
var lapTxt=fs.readFileSync("lap.js","utf8");
var m=lapTxt.match(/var ed=S\.edad\|\|22;\s*\n\s*if\(ed>=30\)\{[\s\S]*?\n  \}\n/);
ok(!!m, "F7 no encuentro el bloque de envejecimiento en nuevaTemporada (¿se ha movido?)");
if(m){ var bloque=m[0];
  POSL.forEach(function(pos){ for(var ed=24; ed<=39; ed++){
    S=nuevo(pos,ed); S.edad=ed; var copia=JSON.parse(JSON.stringify(S.attr));
    (new Function("S","atr","clamp", bloque))(S,atr,clamp);
    CORE.envejecer(pos,copia,ed);
    Object.keys(copia).forEach(function(k){ igual(copia[k], S.attr[k], "F7 envejecer "+pos+" "+ed+" "+k, 1e-9); });
  } });
}
/* F8 · reglas de edad que ya existen */
EDADES.forEach(function(e){
  S=nuevo("DC",e); S.edad=e; S.division="1";
  var r=CORE.reglasEdad(e);
  igual(r.off, (e<20? -(20-e)*3.2 : e<=30? (e-20)*0.9 : 9-(e-30)*1.4), "F8 offset "+e, 1e-9);
  igual(r.curva, (function(){ S=nuevo("DC",e); S.edad=e; S.attr={TEC:60,FIS:60,TAC:60,DEF:60,MEN:60,POR:60}; return miMedia()-Math.round(CORE.clamp(0.92*(60*(0.34+0.24+0.24+0.12+0.06))+14+0,40,95)); })()*0+r.curva, "F8 curva consistente "+e, 1e-9);
  /* sueldo: cociente contra un jugador de 25 en el mismo club */
  var eq=EQ["VAL"]; var a=salarioDe(eq,70,e), b=salarioDe(eq,70,25);
  igual(Math.round(CORE.salarioDe(CORE.FR[franjaDe(rankDe("VAL")).n],70,e)), a, "F8 salarioDe "+e, 0);
  /* valor y traspaso: razones (el motor redondea a 100k, por eso se mira con media alta) */
  igual(valorJugador(95,e,0)/valorJugador(95,25,0), CORE.valorX(e)/CORE.valorX(25), "F8 valorJugador "+e, 2e-3);
  igual(precioTraspaso(95,e)/precioTraspaso(95,25), CORE.traspasoX(e)/CORE.traspasoX(25), "F8 precioTraspaso "+e, 2e-3);
  /* óxido */
  var skill={req:{attr:"TEC", v:66}};
  S=nuevo("DC",e); S.edad=e; S.division="1"; var ox=sklTasaOxido(skill), tx=talentoTasaOxido("fisico");
  S=nuevo("DC",25); S.edad=25; S.division="1"; var ox25=sklTasaOxido(skill), tx25=talentoTasaOxido("fisico");
  igual(CORE.oxidoSkill(e)/CORE.oxidoSkill(25), ox/ox25, "F8 óxido de skills "+e, 1e-9);
  igual(CORE.oxidoTalento(e)/CORE.oxidoTalento(25), tx/tx25, "F8 óxido de talentos "+e, 1e-9);
  /* contrato: años (esperanza) = media de los dos casos del motor */
  var src=lapTxt.match(/var anos = edad<20\? 4\+\(rnd\(\)<0\.4\?1:0\) : edad<24\? 3\+\(rnd\(\)<0\.5\?1:0\) : edad<=30\? 3 : 2;/);
  ok(!!src, "F8 contratoDe ya no tiene la forma esperada");
  var esp=e<20? 4+0.4 : e<24? 3+0.5 : e<=30? 3 : 2; igual(CORE.contratoAnos(e), esp, "F8 años de contrato "+e, 1e-9);
});
/* F9 · franjas y papel */
for(var mm=40;mm<=95;mm++) igual(CORE.franjaPorMedia(mm), franjaPorMedia(mm), "F9 franjaPorMedia "+mm, 0);
["BAR","RMA","ATM","VIL","BET","VAL","CEL","RAY","RSO","ATH","OSA","GET","ALA","LEV","ESP","SEV","ELC","RAC","MLG","DEP","ZAR","AND"].forEach(function(id){
  var f=franjaDe(rankDe(id)); var c=CORE.FR[f.n];
  ok(!!c, "F9 franja desconocida "+f.n); if(c){ igual(c.exige,f.exige,"F9 exige "+id,0); igual(c.sal,f.sal,"F9 sal "+id,0); igual(c.cl,f.cl,"F9 cl "+id,0); } });
ok(/dif>=2\)\{ rol="Titular desde el primer día"/.test(lapTxt) && /else if\(dif>=-5\)\{ rol="Pelearás el puesto"/.test(lapTxt) && /else if\(dif>=-12\)\{ rol="Rotaciones y minutos sueltos"/.test(lapTxt), "F9 los umbrales del papel (2 / −5 / −12) han cambiado en ofertaDe");
[[3,0],[2,0],[1,1],[-5,1],[-6,2],[-12,2],[-13,3],[-30,3]].forEach(function(p){ igual(CORE.rolDe(p[0]), p[1], "F9 rolDe "+p[0], 0); });
/* F10 · una carrera entera, temporada a temporada, contra el motor */
var AGING=m? m[0] : "";
function refSim(p){
  var pos=p.pos, a0=p.edad0, nSes=p.sesiones, xpT=p.xpTemp, reparto=p.reparto;
  S=nuevo(pos,a0); S.nivel=nivelInicial(a0,p.nota); S.xp=0; S.techoPend=0; S.talentoPend=0;
  var W=PESO_MEDIA[pos], K=Object.keys(W).filter(function(k){return W[k]>0;}).sort(function(a,b){return W[b]-W[a];});
  var disp=entrenosDisp().filter(function(e2){ return Object.keys(e2.sube).some(function(k){ return W[k]>0; }); });
  var out=[], pts=0, rot=0, plata=0;
  for(var a=a0;a<=38;a++){
    S.edad=a;
    for(var j=0;j<38;j++){
      for(var s=0;s<nSes;s++){
        var mejor=null, mv=-1, mg=null;
        disp.forEach(function(e2){ var val=0, gs={}; Object.keys(e2.sube).forEach(function(k){ var g=gananciaEntreno(e2,k,false); gs[k]=g; val+=g*(W[k]||0); }); if(val>mv){ mv=val; mejor=e2; mg=gs; } });
        if(mejor) Object.keys(mg).forEach(function(k){ S.attr[k]=clamp(atr(k)+mg[k],10,techoAtributoDe(k)); });
      }
      ganarXP(xpT/38);
      while((S.techoPend||0)>0){
        var kk=null;
        if(reparto==="concentra"){ for(var q=0;q<K.length;q++){ if(techoAtributoDe(K[q])<90){ kk=K[q]; break; } } if(!kk) kk=K[0]; }
        else { kk=K[rot%3]; rot++; }
        S.techos[kk]=(S.techos[kk]||0)+1; S.techoPend--; pts++;
      }
    }
    var med=miMedia(); var fr=franjaPorMedia(med), nombre=CORE.FRANJAS[fr];
    var idEj=EJEMPLO[nombre]; ok(franjaDe(rankDe(idEj)).n===nombre, "F10 el club de ejemplo "+idEj+" ya no es de la franja "+nombre);
    var ficha=salarioDe(EQ[idEj], med, a); plata+=ficha;
    out.push({edad:a,media:med,nivel:S.nivel,pts:pts,plata:plata,attr:JSON.parse(JSON.stringify(S.attr))});
    S.edad=a+1; (new Function("S","atr","clamp",AGING))(S,atr,clamp);
  }
  return out;
}
var EJEMPLO={"élite":"BAR","alta":"VIL","media":"CEL","baja":"ALA","modesta":"RAC","segunda":"ZAR"};   /* un club real de cada franja: la ficha de referencia sale de salarioDe() del motor */
var CASOS=[["DC",14,6.3,1700,3,"reparto"],["DC",22,6.3,900,2,"concentra"],["DC",30,7,1700,3,"reparto"],["MC",18,5,1300,3,"reparto"],["DFC",26,6.3,1700,3,"concentra"],
           ["POR",16,6.3,1700,3,"reparto"],["EXT",34,6.3,1700,3,"reparto"],["MCD",20,8,900,1,"reparto"],["MCO",38,6.3,1700,3,"reparto"],["LAT",24,6.3,0,3,"reparto"]];
CASOS.forEach(function(c){
  var p={pos:c[0],edad0:c[1],nota:c[2],xpTemp:c[3],sesiones:c[4],reparto:c[5]};
  var mot=refSim(p), cal=CORE.simular(p).temporadas, et=" · caso "+c.join("/");
  ok(mot.length===cal.length, "F10 distinto número de temporadas"+et);
  for(var i=0;i<Math.min(mot.length,cal.length);i++){
    igual(cal[i].media, mot[i].media, "F10 media a los "+mot[i].edad+et, 0);
    igual(cal[i].nivel, mot[i].nivel, "F10 nivel a los "+mot[i].edad+et, 0);
    igual(cal[i].pts, mot[i].pts, "F10 puntos de techo a los "+mot[i].edad+et, 0);
    ["TEC","FIS","TAC","DEF","MEN"].forEach(function(k){ igual(cal[i].attr[k], mot[i].attr[k], "F10 "+k+" a los "+mot[i].edad+et, 1e-6); });
    igual(cal[i].plata, mot[i].plata, "F10 ficha acumulada a los "+mot[i].edad+et, 0);
  }
});
/* F11 · la tanda de HOY: las cinco franjas que ofrece generarTanda == las que calcula la calculadora */
POSL.forEach(function(pos){ [16,17,18,20,22,24,26,28,30,32,34,36,38].forEach(function(e){ [3.5,4.5,5,5.5,6.3,7,7.6,8,8.6,9.5].forEach(function(n){
  S=null; PICK={pos:pos,rol:ROLES[pos][0].id,pierna:"D",esperas:0,attrBonus:0,edad:e,notaPrueba:n,bonusPrueba:bonusMotor(n),ojeadores:[],tanda:null,altura:180,peso:75,sec:[]};
  var mia=mediaAspirante(), t=generarTanda().map(function(o){ return CORE.FRANJAS.indexOf(o.contrato.franja); }).sort().join(",");
  var c=CORE.tandaHoy(CORE.mediaAspirante(pos,e,n),n).slice().sort().join(",");
  ok(t===c, "F11 tanda de hoy "+pos+" "+e+" nota "+n+" · calc="+c+" motor="+t);
}); }); });
/* F12 · LO PROPUESTO (modo de edad, formación, entorno, giros). No existe en el motor: se exige (a) que sin usarlo el núcleo sea idéntico al motor
   y (b) las propiedades que definen cada pieza (el motor no puede validarlas: no las tiene). */
(function(){
  var base={pos:"DC",edad0:16,nota:6.3,xpTemp:1700,sesiones:3,reparto:"reparto"};
  function serie(r){ return r.temporadas.map(function(t){ return t.media+"/"+t.nivel+"/"+t.pts; }).join(","); }
  function pico(r){ return Math.max.apply(null,r.temporadas.map(function(t){ return t.media; })); }
  function n80(r){ return r.temporadas.filter(function(t){ return t.media>=80; }).length; }
  function sim(extra){ return CORE.simular(Object.assign({},base,extra)); }
  var r0=CORE.simular(base);
  /* (a) por defecto no cambia nada */
  ok(CORE.getModoEdad()==="actual", "F12 el modo de edad por defecto no es «actual»");
  ok(serie(sim({entornoDe:function(){ return {ritmo:1,dForm:0}; }, girosDe:function(){ return 0; }}))===serie(r0), "F12 un entorno neutro cambia la carrera");
  ok(serie(sim({formMin:-3,formMax:3}))===serie(r0), "F12 los topes cambian una carrera sin entorno");
  POSL.forEach(function(pos){ EDADES.forEach(function(e){ ["TEC","FIS","TAC","DEF","MEN"].forEach(function(k){ [0,30].forEach(function(pts){
    var t={}; t[k]=pts; igual(CORE.techoAtributo(pos,e,t,k,0), CORE.techoAtributo(pos,e,t,k), "F12 formación 0 distinta de sin formación "+pos+" "+e+" "+k, 0); }); }); }); });
  /* (b) la formación mueve el techo base EXACTAMENTE su valor (mientras no choque con los límites 30/96 del motor) */
  POSL.forEach(function(pos){ [20,26,31,36].forEach(function(e){ ["TEC","FIS","TAC"].forEach(function(k){ [-8,-3,2,6].forEach(function(f){
    S=nuevo(pos,e); S.edad=e; S.techos={}; S.techos[k]=20;
    igual(CORE.techoAtributo(pos,e,S.techos,k,f), techoAtributoDe(k)+f, "F12 techo + formación "+pos+" "+e+" "+k+" "+f, 1e-9); }); }); }); });
  /* (c) modos del término de edad: solo cambian DESPUÉS de los 30, y por orden actual ≤ suave ≤ plano */
  var base30={}; for(var e0=14;e0<=38;e0++) base30[e0]=CORE.curvaEdad(e0);
  ["suave","plano"].forEach(function(mo){
    CORE.setModoEdad(mo); ok(CORE.getModoEdad()===mo, "F12 no se fija el modo "+mo);
    for(var e1=14;e1<=30;e1++) igual(CORE.curvaEdad(e1), base30[e1], "F12 el modo "+mo+" cambia la curva a los "+e1, 0);
    for(var e2=31;e2<=38;e2++){ ok(CORE.curvaEdad(e2)>base30[e2], "F12 el modo "+mo+" no sube la curva a los "+e2); }
  });
  CORE.setModoEdad("suave"); for(var e3=31;e3<=38;e3++){ igual(CORE.curvaEdad(e3), 5.5-(e3-30)*1.1, "F12 suave "+e3, 1e-9); ok(Math.abs(CORE.curvaEdad(e3)-CORE.curvaEdad(e3-1))<=1.1+1e-9, "F12 suave: salto mayor de 1,1 entre "+(e3-1)+" y "+e3); }
  CORE.setModoEdad("plano"); for(var e4=31;e4<=38;e4++) igual(CORE.curvaEdad(e4), 5.5, "F12 plano "+e4, 0);
  CORE.setModoEdad("raro"); ok(CORE.getModoEdad()==="actual", "F12 un modo desconocido debe caer en «actual»");
  var attrT={TEC:70,FIS:70,TAC:70,DEF:70,MEN:70,POR:70};
  [16,24,30].forEach(function(e5){ CORE.setModoEdad("actual"); var a=CORE.mediaDe("MC",e5,attrT); CORE.setModoEdad("suave"); var b=CORE.mediaDe("MC",e5,attrT); CORE.setModoEdad("plano"); var c=CORE.mediaDe("MC",e5,attrT); ok(a===b&&b===c, "F12 los modos cambian la media a los "+e5); });
  [31,34,38].forEach(function(e5){ CORE.setModoEdad("actual"); var a=CORE.mediaDe("MC",e5,attrT); CORE.setModoEdad("suave"); var b=CORE.mediaDe("MC",e5,attrT); CORE.setModoEdad("plano"); var c=CORE.mediaDe("MC",e5,attrT); ok(a<b&&b<=c, "F12 la media a los "+e5+" no sube con el modo: "+a+" "+b+" "+c); });
  CORE.setModoEdad("actual");
  /* (d) entorno, topes y giros dentro de la simulación */
  var pMas=pico(sim({entornoDe:function(){ return {ritmo:1,dForm:1}; }})), pMenos=pico(sim({entornoDe:function(){ return {ritmo:1,dForm:-1}; }})), p0=pico(r0);
  ok(pMas>p0 && p0>pMenos, "F12 más formación debe dar más pico: "+pMenos+" < "+p0+" < "+pMas);
  var rt=sim({entornoDe:function(){ return {ritmo:1,dForm:5}; }, formMax:6, formMin:-4});
  ok(rt.temporadas.every(function(t){ return t.form<=6+1e-9 && t.form>=-4-1e-9; }), "F12 la formación se sale de los topes");
  igual(rt.temporadas[rt.temporadas.length-1].form, 6, "F12 la formación no llega al tope máximo", 1e-9);
  igual(sim({entornoDe:function(){ return {ritmo:1,dForm:-5}; }, formMax:6, formMin:-4}).temporadas.slice(-1)[0].form, -4, "F12 la formación no llega al tope mínimo", 1e-9);
  var rg=sim({girosDe:function(a){ return a===24? 3 : 0; }});
  r0.temporadas.forEach(function(t,i){ if(t.edad<24) igual(rg.temporadas[i].media, t.media, "F12 un giro a los 24 cambia la media a los "+t.edad, 0); });
  igual(rg.temporadas.filter(function(t){ return t.edad===24; })[0].form, 3, "F12 el giro no suma a la formación", 1e-9);
  ok(rg.temporadas.filter(function(t){ return t.edad>=24; }).some(function(t,i){ return t.media!==r0.temporadas.filter(function(x){ return x.edad>=24; })[i].media; }), "F12 un giro a los 24 no cambia nada después");
  ok(sim({girosDe:function(a){ return a===24? -4 : 0; }}).temporadas.slice(-1)[0].form===-4, "F12 un giro negativo no resta formación");
  ok(n80(sim({entornoDe:function(){ return {ritmo:1.4,dForm:0}; }}))>=n80(r0), "F12 más ritmo no debe dar menos temporadas ≥80");
  ok(n80(sim({entornoDe:function(){ return {ritmo:0.6,dForm:0}; }}))<=n80(r0), "F12 menos ritmo no debe dar más temporadas ≥80");
  ok(sim({entornoDe:function(){ return {ritmo:1.4,dForm:0}; }}).temporadas.slice(-1)[0].nivel > r0.temporadas.slice(-1)[0].nivel, "F12 más ritmo no sube el nivel");
  ok(serie(sim({entornoDe:function(){ return {ritmo:2,dForm:0}; }}))===serie(sim({xpTemp:3400,multEntreno:2})), "F12 ritmo 2 no equivale a XP ×2 y entreno ×2");
  /* form0 (formación de partida) y acumulación exacta del entorno: estas comprobaciones fijan la ESCALA, no solo el signo */
  ok(serie(sim({form0:0}))===serie(r0), "F12 form0=0 cambia la carrera");
  igual(sim({maxEdad:16,form0:3}).temporadas[0].form, 3, "F12 form0 no es la formación de la primera temporada", 1e-9);
  igual(sim({maxEdad:16,form0:2,entornoDe:function(){ return {ritmo:1,dForm:1}; }}).temporadas[0].form, 3, "F12 form0 + dForm de la primera temporada", 1e-9);
  igual(sim({maxEdad:18,entornoDe:function(){ return {ritmo:1,dForm:0.5}; }}).temporadas[2].form, 1.5, "F12 la formación no se acumula temporada a temporada (0,5 × 3)", 1e-9);
  igual(sim({maxEdad:17,entornoDe:function(a){ return {ritmo:1,dForm:(a===16?2:-0.5)}; }}).temporadas[1].form, 1.5, "F12 la formación no suma bien tramos distintos (2 − 0,5)", 1e-9);
  igual(sim({maxEdad:16,form0:-20}).temporadas[0].form, -10, "F12 form0 por debajo del tope mínimo no se recorta", 1e-9);
  igual(sim({maxEdad:16,form0:20}).temporadas[0].form, 8, "F12 form0 por encima del tope máximo no se recorta", 1e-9);
  ok(pico(sim({form0:2}))>p0 && p0>pico(sim({form0:-2})), "F12 más formación de partida debe dar más pico");
  var rr=sim({entornoDe:function(){ return {ritmo:1.3,dForm:0.5}; }});
  rr.temporadas.forEach(function(t){ igual(t.ritmo, 1.3, "F12 la temporada no registra el ritmo "+t.edad, 1e-12); });
})();
CORE.setModoEdad("actual");
if(!F.length) console.log("✔ F87 limpio: "+N+" comprobaciones · la calculadora == el motor (media de salida, nivel, techo/declive, entreno, envejecimiento, reglas de edad, franjas, la tanda de hoy y "+CASOS.length+" carreras completas y las piezas propuestas: modo de edad, formación, entorno y giros)");
else { console.log("✘ F87: "+F.length+" fallo(s) de "+N); F.slice(0,25).forEach(function(x){ console.log("  · "+x); }); if(F.length>25) console.log("  … y "+(F.length-25)+" más"); }
