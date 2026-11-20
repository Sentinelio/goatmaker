/* ===== TEST · liga terminada (jornada 39) no rompe el inicio — 0.03.024 ===== */
var __f=0,__o=0; function __ok(c,m){ if(c) __o++; else { __f++; console.log("✘ "+m); } }
guardar=function(){}; irSub=function(){}; irSec=function(){};
(function(){
  S=nuevoEstado("BET","LAT","B",7,"D",ROLES.LAT[0].id,22);
  __ok(partidoDe(1)!==null, "la jornada 1 tiene partido");
  __ok(partidoDe(39)===null, "la jornada 39 no tiene partido y no revienta");
  S.jornada=39; var err="";
  try{ renderHub(); }catch(e){ err=e.message; }
  __ok(err==="", "el inicio no falla con la jornada 39 ("+err+")");
  console.log("FIN_LIGA: "+__o+" ok · "+__f+" fallos");
})();
