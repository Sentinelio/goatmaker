/* ===== TEST · tu día en la ciudad deportiva (0.03.012: por fases) =====
   Uso: HTML=/ruta/index.html dis/correr.sh T_DIA.js
   Antes y después del entreno: máx. 2 sesiones tuyas por lado (cada hora = una sesión).
   Entreno del míster: 3 ejercicios (4 con doble sesión) con tres maneras de afrontarlos; nota 3–10.
   La nota mueve míster y confianza y entra en la convocatoria (una tirada por semana). */
var __f=0, __o=0;
function __ok(c,m){ if(c) __o++; else { __f++; console.log("✘ "+m); } }
function nuevo(pos){
  S=nuevoEstado("BET",pos,"B",7,"D",ROLES[pos][0].id,22);
  S.contrato=S.contrato||{salario:900000,anos:3,exige:60};
  S.lesion=0; S.sancion=0; S.jornada=5; S.forma=90; S.mister=55; S.conf=55; S.dia=null; S.conv=null; S.convU=null; S.entMister=null;
  CITA_UI={jor:-1,ll:0,sa:0,eL:[],eS:[]};
}
(function(){
  nuevo("LAT");
  var V=citaVentana();
  __ok(citaPos(V.ini,V)===0 && Math.abs(citaPos(V.fin2,V)-100)<1e-9, "la barra va de "+V.ini+" a "+V.fin2);
  var h=citaMisterHTML();
  __ok(h.indexOf("Empezar el día")>0 && h.indexOf("diaSesion(")<0, "la pantalla de la cita solo tiene la barra: las sesiones no salen hasta empezar");
  citaMueve("llegada", String(V.llamada-5)); citaMueve("salida", String(V.fin+1));
  __ok(CITA_UI.ll===2 && CITA_UI.sa===1, "máximo 2 h antes; 1 h después (ll="+CITA_UI.ll+", sa="+CITA_UI.sa+")");
  var cv=convocatoria();
  __ok(cv.prov===true && /provisional/.test(cv.txt), "antes del entreno la convocatoria es provisional ("+cv.txt+")");
  var def0=atr("DEF"), u0;
  empezarDia();
  __ok(S.dia && S.dia.fase==="antes", "empieza por las sesiones de antes");
  __ok(entMisterHTML().indexOf("diaSesion(\'duelos\')")>0 && /sesión 1 de 2/.test(entMisterHTML()), "pantalla de antes: elegir la sesión 1 de 2");
  entMisterElige(0); __ok(S.dia.ronda===0, "no se puede saltar al míster sin hacer lo de antes");
  diaSesion("duelos");
  __ok(S.dia.antes.length===1 && atr("DEF")>def0, "Duelos hecho y DEF sube ("+def0.toFixed(2)+"→"+atr("DEF").toFixed(2)+")");
  diaSaltar();
  __ok(S.dia.fase==="mister" && S.dia.antes[1].libre, "dejar la segunda hora libre pasa al míster");
  __ok(S.dia.rondas.length===(V.doble?4:3), "el míster propone "+S.dia.rondas.length+" ejercicios");
  __ok(entMisterHTML().indexOf("entMisterElige(0)")>0, "se ven las tres maneras de afrontar el ejercicio");
  u0=S.convU.u;
  while(S.dia.fase==="mister") entMisterElige(0);
  __ok(S.dia.fase==="despues" && S.dia.nota>=3 && S.dia.nota<=10, "tras el míster (nota "+S.dia.nota+") toca después");
  __ok(!entMisterHecho(), "el día no está hecho hasta acabar lo de después");
  var f0=S.forma; diaSesion("recupera");
  __ok(S.dia.fase==="fin" && S.forma>f0, "Recuperación después del entreno sube la forma y termina el día");
  __ok(entMisterHecho() && S.entMister.nota===S.dia.nota, "el entreno queda hecho y guardado");
  var cv2=convocatoria();
  __ok(!cv2.prov && S.convU.u===u0, "tras el día se confirma la convocatoria con la misma tirada ("+cv2.txt+")");
  __ok(pendientesSemana().every(function(p){ return !/míster/.test(p.t); }), "ya no sale como pendiente");
  var f=S.forma; empezarDia(); diaSesion("tecnica"); __ok(S.forma===f, "no se puede empezar el día dos veces ni sumar sesiones");
  __ok(entMisterHTML().indexOf("Nota del entreno")>0, "la tarjeta final resume el día");
  /* 4ª sesión = extra */
  nuevo("LAT"); var V2=citaVentana(); citaMueve("llegada", String(V2.llamada-2)); citaMueve("salida", String(V2.fin+2)); empezarDia();
  diaSesion("tecnica"); diaSesion("mental"); while(S.dia.fase==="mister") entMisterElige(0); diaSesion("tactica"); diaSesion("tecnica");
  __ok(S.dia.despues.length===2 && S.dia.despues[1].extra===true && S.dia.despues[0].extra===false, "la cuarta sesión del día cuenta como extra");
})();
(function(){
  /* jugar seguro con atributo alto da mejor nota que arriesgar con atributo bajo (de media) */
  var notas=function(dif, a){ var t=0; for(var i=0;i<300;i++){ nuevo("MC"); S.attr[a]=a==="TEC"?72:45; empezarDia();
      while(S.dia.fase==="mister"){ var dr=drillPorId(S.dia.rondas[S.dia.ronda]); var j=0; dr.ops.forEach(function(o,k){ if(o.dif===dif) j=k; }); entMisterElige(j); } t+=S.dia.nota; } return t/300; };
  var seg=notas(0,"TEC"), arr=notas(2,"TEC");
  console.log("  nota media MC (TEC 72): segura "+seg.toFixed(2)+" · arriesgada "+arr.toFixed(2));
  __ok(seg>=5.5 && seg<=7.5, "jugar seguro da una nota normal ("+seg.toFixed(2)+")");
})();
(function(){
  /* saltar al campo sin entrenar: se resuelve solo y castiga */
  nuevo("DC"); var m0=S.mister;
  cerrarEntrenoPendiente();
  __ok(S.entMister && S.entMister.auto && S.entMister.nota===4 && S.mister===m0-3, "sin entreno: nota 4 y míster −3");
  /* a medias: se cierra con nota ≤ 4,5 */
  nuevo("DC"); empezarDia(); entMisterElige(0); cerrarEntrenoPendiente();
  __ok(S.dia.fase==="fin" && S.dia.nota<=4.5, "dejarlo a medias se cierra con nota "+S.dia.nota);
  /* lesionado: no hay día */
  nuevo("DC"); S.lesion=2; empezarDia(); __ok(!S.dia, "lesionado no empieza el día");
  /* portero: ejercicios de portero; delantero: nunca los de portero */
  nuevo("POR"); __ok(drillsDisp().some(function(d){return d.cat==="porteria";}), "el portero tiene ejercicios de portería");
  nuevo("DC");  __ok(!drillsDisp().some(function(d){return d.cat==="porteria";}), "el delantero no hace los del portero");
})();
(function(){
  /* la semana personal ya no tiene «Entrenamiento extra»; trae charlas y prensa */
  nuevo("MC"); S.vidaMenu=null; var ops=vidaMenu().ops.map(function(o){return o.id;});
  __ok(ops.indexOf("trabajo")<0 && ops.indexOf("vestuario")>=0 && ops.indexOf("despacho")>=0 && ops.indexOf("prensa")>=0, "semana personal: "+ops.join(", "));
})();
console.log("DIA: "+__o+" ok · "+__f+" fallos");
