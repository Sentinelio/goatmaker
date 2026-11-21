/* ===== TEST · ocho niveles de agente: mesas, umbral sin agente, cambio, búsqueda y marcas (0.03.037) ===== */
var __f=0,__o=0; function __ok(c,m){ if(c) __o++; else { __f++; console.log("✘ "+m); } }
guardar=function(){}; irSub=function(){}; irSec=function(){}; renderHub=function(){};
var __ov=null; ovSemana=function(c){ __ov=c; };
var __rnd=rnd; function fijarRnd(v){ rnd=function(){ return v; }; }
S=nuevoEstado("BET","LAT","B",7,"D",ROLES.LAT[0].id,22);
S.temporada=2; S.contrato={salario:1e6,anos:2,clausula:1e7,exige:60}; S.fama=90; S.dinero=1e7; S.agente=null;
PICK={pos:"LAT",rol:ROLES.LAT[0].id,pierna:"D",esperas:0,attrBonus:0,edad:24,notaPrueba:7,bonusPrueba:0,ojeadores:[],tanda:null,altura:180,peso:75,sec:[]};
/* 1 · mesas por nivel de agente */
NIVELES_AG.forEach(function(L){
  S.agente={n:"Prueba",estilo:"cercano",pct:0.05,nivel:L.n,desde:0};
  __ok(mesasMercado(60).mesas===L.mesas, "nivel "+L.n+": "+L.mesas+" mesas");
});
S.agente.estilo="tiburon"; S.agente.nivel=1;
__ok(mesasMercado(60).mesas===2, "tiburón: una mesa más");
S.agente.nivel=8; S.agente.estilo="tiburon";
__ok(mesasMercado(60).mesas===5, "tiburón de nivel 8 se queda en cinco mesas");
/* 2 · sin agente: una mesa por debajo, y con media baja ninguna */
S.agente=null;
__ok(mesasMercado(60).mesas===1 && mesasMercado(60).desp===-1, "sin agente: una mesa, una franja por debajo");
__ok(mesasMercado(55).mesas===0, "sin agente y media baja: ninguna mesa");
/* 3 · el motor da el número de mesas del nivel (con agente de nivel 8) */
S.agente={n:"Prueba",estilo:"cercano",pct:0.1,nivel:8,desde:0};
fijarRnd(0.5); var t8=generarTanda(); rnd=__rnd;
__ok(t8.length===5, "motor: nivel 8 da 5 ofertas ("+t8.length+")");
S.agente=null; fijarRnd(0.5); var tSin=generarTanda(); rnd=__rnd;
__ok(tSin.length<=1, "motor: sin agente da como mucho una oferta ("+tSin.length+")");
/* 4 · nivel de carrera: sube con la fama */
S.fama=0; __ok(nivelCarrera()===1, "sin fama, nivel de carrera 1");
S.fama=90; __ok(nivelCarrera()>=2, "con fama alta, nivel de carrera sube");
/* 5 · marcas permitidas por nivel */
S.agente={n:"Prueba",estilo:"cercano",pct:0.06,nivel:1,desde:0};
__ok(catsAgente().indexOf("coches")<0 && catsAgente().indexOf("bebida")>=0, "nivel 1: sin automóvil, con bebida");
S.agente.nivel=7; __ok(catsAgente()===null, "nivel 7: todas las marcas");
/* 6 · cambio de agente: siempre decides tú, y la rescisión depende de la distancia */
S.agente={n:"Actual",estilo:"cercano",pct:0.06,nivel:1,desde:0};
fijarRnd(0); __ov=null; propuestaAgente(); rnd=__rnd;
__ok(S.propAg && __ov && __ov.ops.length===2, "un agente superior llama y la decisión es tuya (dos opciones)");
var nivC=nivelCarrera(), cuota=Math.round(S.contrato.salario*S.agente.pct/38);
__ok(S.propAg.coste===(nivC-1>=2? 0 : 4*cuota), "rescisión: "+S.propAg.coste+" con nivel carrera "+nivC);
S.propAg.coste=0; var pn=S.propAg.nivel; aceptarPropAg();
__ok(S.agente.nivel===pn, "aceptar cambia de agente al nivel propuesto");
__ok(S.propAg===null, "al cambiar se limpia la propuesta");
/* 7 · buscar patrocinio: una vez por semana */
S.agente={n:"Prueba",estilo:"cercano",pct:0.06,nivel:4,desde:0}; S.patroOferta=null; S.buscoSem=null;
fijarRnd(0.99); buscarPatro(); rnd=__rnd;
__ok(S.buscoSem===jorAbs(), "buscar patrocinio queda marcado para esta semana");
S.avisoMercado=null; buscarPatro();
__ok(/Ya has buscado/.test(S.avisoMercado||""), "segunda búsqueda de la semana no hace nada");
console.log("AGENTES: "+__o+" ok · "+__f+" fallos");
