/* ===== ARNÉS · post.js — el piloto automático: toca los botones como lo haría una persona =====
   Va DESPUÉS del script del juego y ANTES del test: cat stub.js lap.js post.js TEST.js > run.js
   Reconstruido en v4.66.0 tras perder el original (el contenedor de /tmp no sobrevivió).          */
var PTA_H=0, PLES_H=0;   /* tarjeta y lesión propias por tramo: a 0 salvo que un test las pida (determinismo) */
(function(){ var _s=simTramo; simTramo=function(){ if(M){ M.pTA=(typeof PTA_H!=="undefined"?PTA_H:0); M.pLES=(typeof PLES_H!=="undefined"?PLES_H:0); } _s(); }; })();

/* PEND: la situación que está esperando respuesta (la pone mostrarSituacion; la consume quien decide) */
var PEND=null;
(function(){ var _m=mostrarSituacion; mostrarSituacion=function(sit,fase){ _m(sit,fase); PEND=sit; }; })();
(function(){ var _e=elegirOpcion; elegirOpcion=function(i){ PEND=null; return _e.apply(this,arguments); }; })();

var __cierres=0;
(function(){ var _c=cerrarJornada; cerrarJornada=function(){ __cierres++; return _c.apply(this,arguments); }; })();

/* opciones que una persona podría pulsar ahora mismo (condición cumplida, skill propia si la exige) */
function opcionesValidas(sit){
  var v=[]; (sit.o||[]).forEach(function(o,i){
    if(o.cond && !o.cond(M)) return;
    if(o.skill && !tieneSkill(o.skill)) return;
    v.push(i);
  });
  return v;
}
function opcionValida(sit){ var v=opcionesValidas(sit); return v.length? v[Math.floor(Math.random()*v.length)] : 0; }

/* lo que haría el navegador pasado un rato: se acaban las decisiones de semana pendientes */
function resolverOvsem(elige){
  var g=0;
  while(g++<80){
    if(!OVSEM) drenarOvsem();
    if(!OVSEM) break;
    var n=(OVSEM.ops||[]).length||1;
    elegirSemana(elige? elige(OVSEM) : Math.floor(Math.random()*n));
  }
}

/* juega UNA jornada de principio a fin: decide(sit)→índice (−1 = dejar que expire el reloj) */
function jugarJornada(j, decide){
  decide=decide||opcionValida;
  var cierres0=__cierres, hist0=S.hist.length;
  M=null; PEND=null; S.avisoSaltado=true;
  iniciarJornada();
  var g=0;
  while(g++<8000){
    if(!M) break;
    if(PEND){
      var sit=PEND; PEND=null; var i=decide(sit);
      if(i===-1){ pararReloj(); decisionExpirada(); continue; }
      if(typeof i!=="number" || !sit.o[i]) i=opcionValida(sit);
      elegirOpcion(i);
      continue;
    }
    if(AUTOFN){ var f=AUTOFN; AUTOFN=null; clearTimeout(AUTOT); AUTOT=null; f(); continue; }
    if(M.fase==="cierre"){ cerrarJornada(); continue; }
    avanzarPartido();
  }
  if(g>=8000) throw new Error("jugarJornada("+j+"): el partido no termina (fase="+(M&&M.fase)+", tramo="+(M&&M.tramo)+")");
  if(__cierres===cierres0 && S.hist.length>hist0) cerrarSinTi();   /* jornada desde la grada o sin minutos: el botón «Continuar» */
  resolverOvsem();
}
function temporadaCompleta(decide){ var g=0; while(S && S.jornada<38 && g++<60) jugarJornada(S.jornada, decide); }

PISTAS_ON=false; MERCADO_ON=false; TIENDA_ON=false; PARTIDA_ABIERTA=true;
