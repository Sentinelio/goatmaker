/* ===== TEST · liga terminada (jornada 38) muestra cómo seguir; la prima se cobra una vez — 0.03.025 ===== */
var __f=0,__o=0; function __ok(c,m){ if(c) __o++; else { __f++; console.log("✘ "+m); } }
guardar=function(){}; irSub=function(){}; irSec=function(){};
(function(){
  S=nuevoEstado("BET","LAT","B",7,"D",ROLES.LAT[0].id,22);
  __ok(partidoDe(0)!==null, "la jornada 0 tiene partido");
  __ok(partidoDe(38)===null, "tras la última jornada no hay partido y no revienta");
  S.jornada=38; var err="", cap="", o=$;
  $=function(id){ return {set innerHTML(v){ if(id==="hub-left") cap=v; }, get innerHTML(){ return cap; }, classList:{remove:function(){}, add:function(){}}}; };
  try{ renderHub(); }catch(e){ err=e.message; }
  $=o;
  __ok(err==="", "el inicio no falla con la liga terminada ("+err+")");
  __ok(cap.indexOf("Ver el resumen")>0, "con la liga terminada se ofrece «Ver el resumen»");
  S.contrato=S.contrato||{}; S.contrato.obj={k:"g", n:0, pago:1000, t:"goles"}; S.yo=S.yo||{}; S.yo.g=0;
  S.dinero=S.dinero||0; var d0=S.dinero; S.objPagadoT=null; finTemporada(); finTemporada();
  __ok(S.dinero-d0===1000, "la prima se cobra una sola vez aunque se abra el resumen dos veces ("+(S.dinero-d0)+")");
  console.log("FIN_LIGA: "+__o+" ok · "+__f+" fallos");
})();
