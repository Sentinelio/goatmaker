/* ===== TEST · decisiones sin tomar: contador de temporada y de carrera, siempre visible en Números (0.03.043) ===== */
var __f=0,__o=0; function __ok(c,m){ if(c) __o++; else { __f++; console.log("✘ "+m); } }
guardar=function(){}; irSub=function(){}; irSec=function(){}; renderHub=function(){};
S=nuevoEstado("BET","LAT","B",7,"D",ROLES.LAT[0].id,22);
S.temporada=2; S.indecTot=undefined; S.indecTemp=undefined; S.indecTempT=undefined;
/* 1 · sin ninguna, la pestaña lo dice */
SUB.jugador="stats";
var h=secJugador();
__ok(h.indexOf("Decisiones sin tomar")>=0, "la pestaña Números muestra el contador aunque no hayas jugado");
__ok(h.indexOf("has decidido siempre a tiempo")>=0, "sin indecisiones lo dice en claro");
/* 2 · cuenta por temporada y por carrera */
registrarIndecision(); registrarIndecision();
__ok(S.indecTot===2 && S.indecTemp===2, "dos indecisiones: 2 en la temporada y 2 en la carrera");
h=secJugador();
__ok(h.indexOf("Cada vez que el reloj se acaba")>=0, "con indecisiones explica lo que pasa");
/* 3 · cambia de temporada: la de temporada vuelve a cero, la de carrera sigue */
S.temporada=3; registrarIndecision();
__ok(S.indecTemp===1 && S.indecTot===3, "nueva temporada: cuenta de temporada a cero, la de carrera sigue");
console.log("INDECISION: "+__o+" ok · "+__f+" fallos");
