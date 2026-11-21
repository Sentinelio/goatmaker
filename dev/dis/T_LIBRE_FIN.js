/* ===== TEST · fin de contrato sin renovar: agente libre, no renovación automática (0.03.036) ===== */
var __f=0,__o=0; function __ok(c,m){ if(c) __o++; else { __f++; console.log("✘ "+m); } }
guardar=function(){}; irSub=function(){}; irSec=function(){}; renderHub=function(){};
function finHtml(){
  var cap="", o=$;
  $=function(id){ return id==="ov-fin-inner" ? {set innerHTML(v){ cap=v; }, get innerHTML(){ return cap; }} : {classList:{remove:function(){},add:function(){}}}; };
  try{ nuevaTemporada(); }catch(e){ cap="ERR "+e.message; } finally{ $=o; }
  return cap;
}
(function(){
  /* 1 · se acaba el contrato sin renovar: no se renueva solo, eres libre */
  S=nuevoEstado("BET","LAT","B",7,"D",ROLES.LAT[0].id,22);
  S.temporada=2; S.division=S.division||"1";
  S.contrato={salario:1e6,anos:1,clausula:1e7,exige:60};
  S.libre=null; S.libreFin=null; S.renovado=null;
  var fh=finHtml(); if(fh.indexOf("ERR")===0) console.log("nuevaTemporada: "+fh.slice(0,200));
  __ok(S.contrato.anos===0, "al acabar el último año el contrato queda en 0 temporadas ("+S.contrato.anos+")");
  __ok(S.libre===true && S.libreFin===true, "al acabar sin renovar eres agente libre");
  __ok(!S.renovado, "no hay renovación automática de dos años");
  __ok(S.ofertasVerano===true, "el mercado de verano se abre");
  /* 2 · te quedas con el club: dos temporadas con tu ficha, sin recorte */
  var sal=S.contrato.salario;
  quedarseConClub();
  __ok(S.libre===null && S.libreFin===null && S.contrato.anos===2, "quedarse con el club: dos temporadas");
  __ok(S.contrato.salario>=Math.round(sal*0.9), "quedarse tras fin de contrato no recorta la ficha ("+S.contrato.salario+" vs "+sal+")");
  /* 3 · descenso con cláusula: sigue recortada un 45% */
  S.contrato={salario:1e6,anos:2,clausula:1e7,exige:60}; S.libre=true; S.libreFin=null;
  quedarseConClub();
  __ok(S.contrato.salario===550000 && S.contrato.anos===2, "descenso: la ficha se recorta un 45% como antes");
  /* 4 · libre sin ninguna mesa: sigues libre y el aviso lo dice */
  S.contrato={salario:1e6,anos:0,clausula:1e7,exige:60}; S.libre=true; S.libreFin=true; S.ofertasVerano=true;
  var gt=generarTanda; generarTanda=function(){ return []; };
  abrirMercado();
  generarTanda=gt;
  __ok(S.libre===true && S.ofertasVerano===true, "sin mesas sigues libre y el mercado sigue abierto para la liga");
  __ok(/Ningún club llama/.test(S.avisoMercado||""), "sin mesas se avisa de que nadie llama");
  console.log("LIBRE_FIN: "+__o+" ok · "+__f+" fallos");
})();
