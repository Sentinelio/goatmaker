/* ===== TEST · calentamiento antes, recuperación después y aviso del preparador por carga (0.03.031) ===== */
var __f=0, __o=0;
function __ok(c,m){ if(c) __o++; else { __f++; console.log("✘ "+m); } }
function nuevo(pos){
  S=nuevoEstado("BET",pos,"B",7,"D",ROLES[pos][0].id,22);
  S.contrato=S.contrato||{salario:900000,anos:3,exige:60};
  S.lesion=0; S.sancion=0; S.jornada=5; S.forma=90; S.mister=55; S.conf=55; S.dia=null; S.conv=null; S.convU=null; S.entMister=null;
  CITA_UI={jor:-1,ll:0,sa:0,eL:[],eS:[]};
  var V=citaVentana(); citaMueve("llegada", String(V.llamada-2)); citaMueve("salida", String(V.fin+2));
}
(function(){
  var n=function(h,re){ return (h.match(re)||[]).length; };
  nuevo("DC"); S.forma=80; empezarDia();
  var h=entMisterHTML();
  __ok(n(h,/diaSesion\('pre-/g)>=4, "antes: al menos 4 sesiones de calentamiento ("+n(h,/diaSesion\('pre-/g)+")");
  __ok(h.indexOf("Parar: dejar")<0 && h.indexOf("recuperar")<0, "con forma buena no hay aviso de carga");
  S.dia.fase="despues"; S.dia.cartas=null;
  h=entMisterHTML();
  /* con 2 horas después: la primera es interesante y la última recuperación (0.03.035) */
  __ok(S.dia.sa===2 && horaModo(S.dia,"despues")==="interesante", "después con 2 h: la primera hora es interesante");
  __ok(n(h,/diaSesion\('pre-/g)===0 && n(h,/diaSesion\('post-/g)===0, "después con 2 h: la primera hora no mezcla calentamiento ni recuperación");
  S.dia.despues.push({n:"Hueco libre", sub:"sin sesión", libre:true}); S.dia.cartas=null; h=entMisterHTML();
  __ok(horaModo(S.dia,"despues")==="recuperar" && n(h,/diaSesion\('post-/g)>=4 && n(h,/diaSesion\('pre-/g)===0, "después con 2 h: la última hora es recuperación ("+n(h,/diaSesion\('post-/g)+")");
  /* carga alta: el preparador manda recuperar */
  nuevo("DC"); S.forma=45; empezarDia();
  h=entMisterHTML();
  __ok(h.indexOf("Hoy toca recuperar")>0 && h.indexOf("diaSesion('post-estira')")>0, "forma 45: el preparador sugiere recuperar con estiramientos");
  __ok(h.indexOf('class="ejer rec" onclick="diaSesion(\'post-estira\')"')>0 && h.indexOf("diaSesion('tecnica')")<0, "forma 45: lo destacado como recomendado es la recuperación del aviso, y no sale entreno");
  /* una recuperación nunca lesiona, aunque sea la cuarta sesión y con mucha carga */
  nuevo("DC"); S.forma=30; S.rachaExtra=5; var lesFuera=0;
  for(var k=0;k<400;k++){ S.lesion=0; aplicarEntreno(ejIdx("post-piscina"), true); if(S.lesion>0) lesFuera++; }
  __ok(lesFuera===0, "la piscina como cuarta sesión no lesiona nunca ("+lesFuera+" lesiones en 400)");
  /* llegas pronto: el preparador manda calentar y ponerte a tono */
  nuevo("DC"); S.forma=80; empezarDia(); var hp=entMisterHTML();
  __ok(hp.indexOf("llegado pronto")>0 && hp.indexOf('class="ejer rec" onclick="diaSesion(\'pre-trote\')"')>0, "llegar pronto: se recomienda calentar y aparece destacado");
  nuevo("DC"); S.forma=80; var Vj=citaVentana(); citaMueve("llegada", String(Vj.llamada)); empezarDia(); var hj=entMisterHTML();
  __ok(hj.indexOf("llegado pronto")<0 && S.dia.ll===0, "llegar justo a la hora: no hay aviso de calentamiento");
  /* demasiada carga: parar */
  nuevo("DC"); S.forma=30; empezarDia();
  h=entMisterHTML();
  __ok(h.indexOf("para: deja esta hora libre")>0 && h.indexOf("Parar: dejar esta hora libre")>0, "forma 30: el preparador manda parar");
  /* el resultado de cada decisión se ve solo hasta pasar a la siguiente */
  nuevo("DC"); S.forma=80; empezarDia(); diaSesion("tecnica"); diaSesion("mental");
  if(S.dia.fase==="mister"){ entMisterElige(0); h=entMisterHTML();
    __ok(h.indexOf("Siguiente jugada")>0 && h.indexOf("entMisterElige(")<0, "tras decidir solo se ve el resultado y el botón de siguiente");
    diaSiguienteJugada(); __ok(S.dia.ultimo===null && entMisterHTML().indexOf("entMisterElige(")>0, "al pasar, aparece la siguiente jugada");
  }
  /* antes con 2 horas: la primera calienta y la segunda son ejercicios interesantes (0.03.035) */
  nuevo("DC"); S.forma=80; var V2=citaVentana(); citaMueve("llegada", String(V2.llamada-2)); empezarDia();
  var a1=entMisterHTML();
  __ok(horaModo(S.dia,"antes")==="calentar" && a1.indexOf("llegado pronto")>0 && n(a1,/diaSesion\('pre-/g)>=4, "antes con 2 h: la primera hora calienta");
  diaSaltar(); var a2=entMisterHTML();
  __ok(horaModo(S.dia,"antes")==="interesante" && a2.indexOf("llegado pronto")<0 && n(a2,/diaSesion\('pre-/g)===0 && n(a2,/diaSesion\('/g)>=4, "antes con 2 h: la segunda hora son ejercicios interesantes");
  console.log("CARGA: "+__o+" ok · "+__f+" fallos");
})();
