/* ===== TEST · cita del míster (barra con dos sliders) y avisos fuera del partido — v4.69.1 =====
   Uso: dis/correr.sh T_CITA_AVISOS.js   (carga el juego en Node con el arnés)
   CITA: la cita se pinta con dos sliders; mover uno cambia el otro intervalo; confirmar cobra forma/míster,
         marca la jornada y no se puede confirmar dos veces.
   AVISOS: con un partido abierto, un aviso se espera; al cerrar el partido sale; con la semana en curso se espera;
         una mesa de negociación pedida fuera de menú también se espera. */
var __f=0, __o=0;
function __ok(c,m){ if(c) __o++; else { __f++; console.log("✘ "+m); } }
(function(){
  S=nuevoEstado("BET","EXT","B",7,"D",ROLES.EXT[0].id,22);
  S.contrato=S.contrato||{salario:900000,anos:3,exige:60};
  S.lesion=0; S.jornada=5; S.puntualSem=undefined; S.forma=80; S.mister=50; S.puntualBonus=0;
  var V=citaVentana();
  CITA_UI={jor:-1,ll:0,sa:0};
  var h=citaMisterHTML();
  __ok(h.indexOf('id="cita-ll"')>0 && h.indexOf('id="cita-sa"')>0, "la cita pinta los dos sliders");
  __ok(h.indexOf('onclick="elegirPuntualidad')<0, "ya no quedan botones de la cita antigua");
  citaMueve("llegada", String(V.llamada-2));
  __ok(CITA_UI.ll===2, "el slider de llegada fija 2 h antes (ll="+CITA_UI.ll+")");
  citaMueve("salida", String(V.fin+1.5));
  __ok(CITA_UI.sa===1.5, "el slider de salida fija 1,5 h después (sa="+CITA_UI.sa+")");
  citaMueve("llegada", String(V.llamada+3));   /* fuera de rango: se clava en la hora de la llamada */
  __ok(CITA_UI.ll===0, "llegar después de la llamada se clava en 0 (ll="+CITA_UI.ll+")");
  citaMueve("llegada", String(V.llamada-2));
  var c=citaCuenta(2,1.5,V.doble), f0=S.forma;
  elegirCita();
  __ok(S.puntualSem===S.jornada, "confirmar marca la jornada");
  __ok(S.forma===clamp(f0-c.coste+c.act,20,100), "confirmar cobra la forma ("+f0+" → "+S.forma+", coste "+c.coste+", ejercicios "+c.act+")");
  __ok(S.puntualBonus===c.ded, "bonus de puntualidad = "+c.ded);
  var f1=S.forma; elegirCita();
  __ok(S.forma===f1, "no se puede confirmar dos veces en la misma jornada");
  __ok(citaMisterHTML()==="", "con la cita hecha, la tarjeta desaparece");
  /* ejercicios: el gimnasio antes y el hielo después cambian la forma según las horas */
  S.jornada=6; S.puntualSem=undefined; S.forma=80; S.mister=50; S.puntualBonus=0; CITA_UI={jor:-1,ll:0,sa:0,aL:"nada",aS:"nada"};
  var V2=citaVentana();
  citaMueve("llegada", String(V2.llamada-2)); citaElige("L","gym");
  citaMueve("salida", String(V2.fin+1)); citaElige("S","hielo");
  var h2=citaMisterHTML();
  __ok(h2.indexOf("Gimnasio de fuerza")>0 && h2.indexOf('id="cita-s1"')>0 && h2.indexOf('id="cita-s3"')>0, "la cita ofrece ejercicios antes y después y pinta tres tramos");
  __ok(CITA_UI.aL==="gym" && CITA_UI.aS==="hielo", "los ejercicios elegidos se guardan");
  var c2=citaCuenta(2,1,V2.doble,"gym","hielo");
  __ok(c2.act===Math.round(-3*2)+Math.round(3*1), "el gimnasio (2 h) resta y el hielo (1 h) suma: act="+c2.act);
  elegirCita();
  __ok(S.forma===clamp(80-c2.coste+c2.act,20,100), "la forma incluye los ejercicios (forma="+S.forma+")");
})();
(function(){
  /* avisos: partido abierto → espera; cerrado → sale */
  OVSEM=null; OVSEM_COLA=[]; SEMANA_CORRE=false; NEG=null;
  M={cerrado:false, prueba:false};
  ovSemana({t:"aviso A", x:"x", ops:[{l:"ok", fx:function(){}}]});
  __ok(OVSEM===null && OVSEM_COLA.length===1, "un aviso durante el partido se espera");
  M.cerrado=true; drenarOvsem();
  __ok(OVSEM && OVSEM.t==="aviso A" && OVSEM_COLA.length===0, "al cerrar el partido el aviso sale");
  elegirSemana(0);
  OVSEM=null;
  /* semana en curso: cola, luego se vacía con run */
  M=null; SEMANA_CORRE=true; var ran=0;
  alMenu(function(){ ran++; });
  ovSemana({t:"aviso B", x:"x", ops:[{l:"ok", fx:function(){}}]});
  __ok(ran===0 && OVSEM===null && OVSEM_COLA.length===2, "con la semana en curso, mesa y aviso esperan");
  SEMANA_CORRE=false; drenarOvsem();
  __ok(ran===1 && OVSEM && OVSEM.t==="aviso B", "al terminar la semana corre la mesa y después el aviso");
  OVSEM=null; OVSEM_COLA=[]; NEG=null;
  /* una negociación abierta también retiene los avisos */
  NEG={modo:"oferta"}; ovSemana({t:"aviso C", x:"x", ops:[{l:"ok", fx:function(){}}]});
  __ok(OVSEM===null && OVSEM_COLA.length===1, "con una mesa abierta el aviso espera");
  NEG=null; drenarOvsem();
  __ok(OVSEM && OVSEM.t==="aviso C", "al cerrar la mesa el aviso sale");
  OVSEM=null; OVSEM_COLA=[]; M=null;
})();
console.log("CITA_AVISOS: "+__o+" ok · "+__f+" fallos");
if(__f) throw new Error("fallos: "+__f);
