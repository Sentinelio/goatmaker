/* ===== TEST · pestaña Contrato en Despachos: resumen de lo firmado (0.03.039) ===== */
var __f=0,__o=0; function __ok(c,m){ if(c) __o++; else { __f++; console.log("✘ "+m); } }
guardar=function(){}; irSub=function(){}; irSec=function(){}; renderHub=function(){};
S=nuevoEstado("BET","LAT","B",7,"D",ROLES.LAT[0].id,22);
S.temporada=2; S.yo={g:3,a:1,pj:10,p:0};
/* 1 · la pestaña existe y va primera */
__ok(SUBS.mercado[0][0]==="contrato", "la pestaña Contrato va la primera, antes de Mover los hilos");
/* 2 · contrato con primas y objetivo */
S.contrato={salario:1200000,anos:3,clausula:2600000,firmadoT:2,exige:64,primaFichaje:540000,primaGol:36000,primaPartido:24000,obj:{k:"g",n:10,t:"goles",pago:300000}};
S.libre=null; SUB.mercado="contrato";
var h=secMercado();
__ok(h.indexOf("Lo firmado con")>=0, "muestra el encabezado del resumen");
__ok(h.indexOf("1.200.000")>=0 || h.indexOf("1,2")>=0 || h.indexOf("1.200")>=0 || h.indexOf("1200")>=0, "muestra el salario");
__ok(h.indexOf("Prima de fichaje")>=0 && h.indexOf("Por gol")>=0 && h.indexOf("Por partido")>=0, "muestra las primas");
__ok(h.indexOf("Llevas 3 de 10 goles")>=0, "muestra el progreso del objetivo");
/* 3 · sin primas */
S.contrato={salario:500000,anos:1,clausula:1000000,firmadoT:2,exige:50};
h=secMercado();
__ok(h.indexOf("no tiene primas")>=0, "sin primas, lo dice");
/* 4 · libre y sin contrato */
S.contrato={salario:500000,anos:0,clausula:1000000,firmadoT:2,exige:50}; S.libre=true;
h=secMercado();
__ok(h.indexOf("Estás libre")>=0, "libre: lo indica");
S.contrato=null; S.libre=null;
h=secMercado();
__ok(h.indexOf("No tienes contrato firmado")>=0, "sin contrato: lo indica sin fallar");
SUB.mercado="hilos";
console.log("CONTRATO: "+__o+" ok · "+__f+" fallos");
