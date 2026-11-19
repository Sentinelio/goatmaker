/* ===== TEST · tu día en la ciudad deportiva (0.03.010) =====
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
  __ok(h.indexOf("Empezar el día")>0 && h.indexOf("citaToggle('L','duelos')")>0, "la tarjeta tiene el botón del día y las sesiones con Antes/Después");
  __ok(h.indexOf("libres de 3")<0, "ya no hay «sesiones libres de 3»");
  /* elegir sesiones: cada una abre su hora; tope 2 por lado */
  citaToggle("L","duelos"); citaToggle("L","tecnica"); citaToggle("L","mental");
  __ok(CITA_UI.eL.length===2 && CITA_UI.ll===2, "antes: 2 sesiones y 2 h como mucho (eL="+CITA_UI.eL.length+", ll="+CITA_UI.ll+")");
  citaToggle("S","recupera");
  __ok(CITA_UI.sa===1, "después: una sesión abre una hora");
  citaMueve("llegada", String(V.llamada-1));
  __ok(CITA_UI.ll===1 && CITA_UI.eL.length===1, "acortar la llegada quita la sesión sobrante");
  citaToggle("L","tecnica");
  var c=citaCuenta(CITA_UI.ll, CITA_UI.sa, CITA_UI.eL, CITA_UI.eS);
  __ok(c.act===ejPorId("duelos").forma+ejPorId("tecnica").forma+ejPorId("recupera").forma, "la forma del día es la suma de tus sesiones ("+c.act+")");
  /* convocatoria provisional antes del entreno */
  var cv=convocatoria();
  __ok(cv.prov===true && /provisional/.test(cv.txt), "antes del entreno la convocatoria es provisional ("+cv.txt+")");
  var def0=atr("DEF"), mis0=S.mister;
  empezarDia();
  __ok(S.dia && S.dia.fase==="mister" && S.dia.antes.length===2, "al empezar se hacen las 2 sesiones de antes");
  __ok(atr("DEF")>def0, "Duelos ha subido DEF ("+def0.toFixed(2)+"→"+atr("DEF").toFixed(2)+")");
  __ok(S.dia.rondas.length===(V.doble?4:3), "el míster propone "+S.dia.rondas.length+" ejercicios");
  __ok(entMisterHTML().indexOf("entMisterElige(0)")>0, "se ven las tres maneras de afrontar el ejercicio");
  var u=S.convU.u;
  while(S.dia.fase==="mister") entMisterElige(0);
  __ok(S.dia.fase==="fin" && S.dia.despues.length===1, "al terminar el míster se hace la sesión de después");
  __ok(S.dia.nota>=3 && S.dia.nota<=10, "nota del entreno "+S.dia.nota);
  __ok(entMisterHecho() && S.entMister.nota===S.dia.nota, "el entreno queda hecho y guardado");
  var cv2=convocatoria();
  __ok(!cv2.prov && S.convU.u===u, "tras el entreno se confirma la convocatoria con la misma tirada ("+cv2.txt+")");
  __ok(pendientesSemana().every(function(p){ return !/míster/.test(p.t); }), "ya no sale como pendiente");
  var f=S.forma; empezarDia(); __ok(S.forma===f, "no se puede empezar el día dos veces");
  __ok(entMisterHTML().indexOf("Nota del entreno")>0, "la tarjeta final resume el día");
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
