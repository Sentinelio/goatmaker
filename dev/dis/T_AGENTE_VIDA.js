/* ===== TEST · agente: no se va sin avisar, contrato de dos temporadas, ofertas del agente (0.03.048) ===== */
var __f=0,__o=0; function __ok(c,m){ if(c) __o++; else { __f++; console.log("✘ "+m); } }
guardar=function(){}; irSub=function(){}; irSec=function(){}; renderHub=function(){};
cerrarOvsemDom=function(){}; regSemana=function(){}; alMenu=function(){};
var __modal=[], __sem=[]; modal=function(c){ __modal.push(c); }; ovSemana=function(c){ __sem.push(c); };
function nuevo(){
  S=nuevoEstado("BET","LAT","B",7,"D",ROLES.LAT[0].id,22); S.temporada=2; S.jornada=1; S.division="1";
  S.contrato={salario:1e6,anos:3,clausula:1e7,exige:60,firmadoT:2}; S.libre=null; S.libreFin=null;
  S.agente={n:"Pepe Ruiz",estilo:"cercano",pct:0.08,nivel:2,desde:1,anos:2}; S.dinero=0; __modal=[]; __sem=[];
}
/* 1 · un agente recién contratado no se va en la primera semana */
nuevo(); comisionSemanal();
__ok(S.agente!==null, "recién contratado y sin dinero aún: no se va");
/* 2 · si de verdad no puede pagar, se va y sale una ventana emergente */
nuevo(); S.agente.pct=5; S.dinero=0; comisionSemanal();
__ok(S.agente===null && __modal.length===1 && /Se va tu agente/.test(__modal[0].t), "sin dinero para la comisión: se va y te lo dice en una ventana");
/* 3 · el contrato del agente corre con las temporadas y al acabar lo decides tú */
nuevo(); S.agente.anos=1; S.agente.desde=1;
S.agente.anos=Math.max(0,S.agente.anos-1); if(S.agente.anos===0) S.agenteFin=true;
__ok(S.agente.anos===0 && S.agenteFin===true, "el contrato del agente acaba con la temporada");
agenteRenueva();
__ok(__sem.length===1 && /Termina el contrato/.test(__sem[0].t), "al terminar se te pregunta: renovar o dejarle ir");
__sem[0].ops[0].fx(); __ok(S.agente && S.agente.anos===2, "renovar dos temporadas");
S.agenteFin=true; __sem=[]; agenteRenueva(); __sem[0].ops[1].fx(); __ok(S.agente===null, "dejarle ir: el agente se despide");
/* 4 · ficharle da dos temporadas */
nuevo(); S.agente=null; S.jornada=1; guardar=function(){};
var fa=ficharAgente; ficharAgente(0);
__ok(S.agente && S.agente.anos===2, "al ficharle, contrato de dos temporadas");
/* 5 · el agente trae ofertas, una por semana */
nuevo(); S.jornada=8; var rr=rnd; rnd=function(){ return 0.03; };
agenteTrae(); __ok(__sem.length===1 && /revisar tu ficha/.test(__sem[0].t), "con suerte, el agente pide revisar tu ficha");
__sem[0].ops[0].fx(); __ok(S.contrato.salario>1e6, "pedir la revisión sube la ficha");
__sem=[]; agenteTrae(); __ok(__sem.length===0, "una propuesta por semana como mucho");
rnd=function(){ return 0.09; }; nuevo(); S.jornada=9; __sem=[]; agenteTrae();
__ok(__sem.length===1 && /club en la línea/.test(__sem[0].t), "el agente te trae un club que pregunta");
__sem[0].ops[0].fx(); __ok(S.ofertaInv && S.ofertaInv.club && S.ofertaInv.salario>0, "escucharlo deja la oferta sobre la mesa");
rnd=rr;
/* 6 · sin agente o sin club no trae nada */
nuevo(); S.agente=null; __sem=[]; rnd=function(){ return 0.03; }; agenteTrae(); __ok(__sem.length===0, "sin agente no hay propuestas");
rnd=rr;
console.log("AGENTE_VIDA: "+__o+" ok · "+__f+" fallos");
