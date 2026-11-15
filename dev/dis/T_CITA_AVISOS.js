/* ===== TEST · cita del míster (barra del día con dos controles) y avisos fuera del partido — v4.69.3 =====
   Uso: HTML=/ruta/index.html dis/correr.sh T_CITA_AVISOS.js
   CITA: la barra tiene 35 % llegada · 30 % entreno · 35 % salida; cada hora da un ejercicio (máx. 4 por lado);
         al acortar la hora se quitan los ejercicios sobrantes; confirmar cobra forma/míster/fama una vez.
   AVISOS: con un partido abierto, un aviso se espera; al cerrar sale; con la semana en curso o una mesa abierta, también espera. */
var __f=0, __o=0;
function __ok(c,m){ if(c) __o++; else { __f++; console.log("✘ "+m); } }
(function(){
  S=nuevoEstado("BET","EXT","B",7,"D",ROLES.EXT[0].id,22);
  S.contrato=S.contrato||{salario:900000,anos:3,exige:60};
  S.lesion=0; S.jornada=5; S.puntualSem=undefined; S.forma=80; S.mister=50; S.puntualBonus=0;
  var V=citaVentana();
  CITA_UI={jor:-1,ll:0,sa:0,eL:[],eS:[]};
  /* geometría: 35 · 30 · 35 */
  __ok(citaPos(V.ini,V)===0 && Math.abs(citaPos(V.llamada,V)-35)<1e-9 && Math.abs(citaPos(V.fin,V)-65)<1e-9 && Math.abs(citaPos(V.fin2,V)-100)<1e-9, "la barra reparte 35 · 30 · 35");
  var h=citaMisterHTML();
  __ok(h.indexOf('id="cita-bar"')>0 && h.indexOf('id="cita-ll"')>0 && h.indexOf('id="cita-sa"')>0, "los dos controles están dentro de la barra");
  __ok(h.indexOf("elegirPuntualidad")<0 && h.indexOf("cita-s1")<0, "ya no quedan los restos de la versión anterior");
  /* horas y ejercicios: 1 ejercicio por hora */
  citaMueve("llegada", String(V.llamada-2));
  __ok(CITA_UI.ll===2, "llegada 2 h antes (ll="+CITA_UI.ll+")");
  citaToggle("L","gym"); citaToggle("L","video"); citaToggle("L","charla");
  __ok(CITA_UI.eL.length===2, "con 2 h solo caben 2 ejercicios antes (eL="+CITA_UI.eL.length+")");
  citaMueve("llegada", String(V.llamada-1));
  __ok(CITA_UI.eL.length===1, "al acortar a 1 h se quita el sobrante (eL="+CITA_UI.eL.length+")");
  citaMueve("llegada", String(V.llamada-2)); citaToggle("L","charla");
  citaMueve("salida", String(V.fin+4));
  __ok(CITA_UI.sa===4, "salida 4 h después (sa="+CITA_UI.sa+")");
  citaToggle("S","hielo"); citaToggle("S","remates"); citaToggle("S","mister"); citaToggle("S","prensa");
  __ok(CITA_UI.eS.length===4, "4 h después admiten 4 ejercicios (eS="+CITA_UI.eS.length+")");
  citaToggle("S","hielo");
  __ok(CITA_UI.eS.length===3, "quitar uno libera un hueco");
  citaMueve("salida", String(V.fin+1));
  __ok(CITA_UI.eS.length===1, "al acortar a 1 h quedan 1 ejercicio");
  citaMueve("salida", String(V.fin+3)); citaToggle("S","mister");
  var h2=citaMisterHTML();
  __ok(h2.indexOf("Charla con los compañeros")>0 && h2.indexOf("Charla con el míster")>0, "las listas muestran los ejercicios de cada lado");
  var c=citaCuenta(CITA_UI.ll, CITA_UI.sa, V.doble, CITA_UI.eL, CITA_UI.eS), f0=S.forma;
  elegirCita();
  __ok(S.puntualSem===S.jornada, "confirmar marca la jornada");
  __ok(S.forma===clamp(f0-c.coste+c.act,20,100), "confirmar cobra la forma incluidos los ejercicios (forma="+S.forma+", coste "+c.coste+", ejercicios "+c.act+")");
  __ok(S.puntualBonus===c.ded, "bonus de puntualidad = "+c.ded);
  var f1=S.forma; elegirCita();
  __ok(S.forma===f1, "no se puede confirmar dos veces en la misma jornada");
  __ok(citaMisterHTML()==="", "con la cita hecha, la tarjeta desaparece");
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
  /* semana en curso: la mesa y el aviso esperan; luego sale la mesa y después el aviso */
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
