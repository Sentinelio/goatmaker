/* ===== TEST · sin equipo: con contrato terminado, el club juega la liga sin ti desde la jornada 1 (0.03.044) ===== */
var __f=0,__o=0; function __ok(c,m){ if(c) __o++; else { __f++; console.log("✘ "+m); } }
guardar=function(){}; irSub=function(){}; irSec=function(){}; renderHub=function(){};
cerrarOvsemDom=function(){}; regSemana=function(){}; alMenu=function(){}; ovSemana=function(){};
mercadoSemanal=function(){}; semanaTienda=function(){}; cerrarEntrenoPendiente=function(){};
pendientesSemana=function(){ return []; };
S=nuevoEstado("BET","LAT","B",7,"D",ROLES.LAT[0].id,22);
S.temporada=3; S.mister=60; S.jornada=1; S.lesion=0; S.sancion=0;
S.contrato={salario:1e6,anos:0,clausula:1e7,exige:60,firmadoT:2};
S.libre=true; S.libreFin=true; S.ofertasVerano=null;
var __jugo=0, __sin=0;
var __jst=jornadaSinTi;
jornadaSinTi=function(){ __jugo++; return __jst(); };
var __hist0=S.hist.length, __jor0=S.jornada;
iniciarJornada();
__ok(__jugo===1, "sin contrato, la jornada 1 se juega sin ti");
var h=S.hist[S.hist.length-1];
__ok(h && h.sinTi==="sin equipo" && !h.yo, "el historial marca la jornada como «sin equipo» y no te pone en el campo");
__ok(S.jornada===__jor0+1, "la liga avanza una jornada");
__ok(S.libre===true && S.libreFin===true, "seguir sin equipo tras la jornada");
console.log("SIN_EQUIPO: "+__o+" ok · "+__f+" fallos");
