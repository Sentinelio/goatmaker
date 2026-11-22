function avanzaMister(f){ var D=S.dia; if(D.ultimo){ if(D.ronda>=D.rondas.length) diaCerrarMister(); else diaSiguienteJugada(); return; } entMisterElige(f); }
/* ===== TEST · antes/después: un ejercicio por clase de atributo y un sexto (0.03.060) ===== */
var __f=0,__o=0; function __ok(c,m){ if(c) __o++; else { __f++; console.log("✘ "+m); } }
function claseEj(e){ var b=null,m=-1; Object.keys(e.sube||{}).forEach(function(k){ if(e.sube[k]>m){ m=e.sube[k]; b=k; } }); return b; }
["DC","EXT","MCO","MC","MCD","LAT","DFC","POR"].forEach(function(pos){
  S=nuevoEstado("BET",pos,"B",7,"D",ROLES[pos][0].id,24); S.temporada=2; S.jornada=6; S.forma=85; S.lesion=0;
  var V=citaVentana(); citaMueve("llegada", String(V.llamada-3)); citaMueve("salida", String(V.fin+3)); empezarDia();
  var D=S.dia;
  /* la primera hora de antes es suave */
  var c0=cartasHora(D,"antes");
  __ok(c0.every(function(e){ return esSuave(e); }), pos+": la primera hora del pre es suave ("+c0.map(function(e){return e.id;}).join(",")+")");
  __ok(D.ll>=2 && D.sa>=2, pos+": el día tiene varias horas antes y después ("+D.ll+"/"+D.sa+")");
  if(D.ll>=2){ diaSesion(c0[0].id); var c1=cartasHora(D,"antes"); var cl=c1.map(claseEj).filter(function(x){return x;});
    __ok(c1.length===6, pos+": hora 'interesante' del pre: 6 cartas ("+c1.length+")");
    var esp=(pos==="POR"? ["POR","TEC","DEF","TAC","MEN","FIS"] : ["TEC","DEF","TAC","MEN","FIS"]);
    esp.forEach(function(k){ __ok(cl.indexOf(k)>=0, pos+": hay un ejercicio de "+k); });
  }
  /* la última hora del después es suave */
  var guard=0; while(S.dia.fase==="antes" && guard++<8) diaSaltar();
  while(S.dia.fase==="mister") avanzaMister(0);
  guard=0; while(S.dia.fase==="despues" && S.dia.despues.length<S.dia.sa-1 && guard++<8) diaSaltar();
  if(S.dia.fase==="despues"){ var cu=cartasHora(S.dia,"despues"); __ok(cu.every(function(e){ return esSuave(e); }), pos+": la última hora del post es suave"); }
});
console.log("CLASES_HORA: "+__o+" ok · "+__f+" fallos");
