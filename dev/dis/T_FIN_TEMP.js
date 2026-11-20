/* ===== TEST · fin de temporada: tu equipo se destaca si sale en la clasificación (0.03.023) ===== */
var __f=0,__o=0; function __ok(c,m){ if(c) __o++; else { __f++; console.log("✘ "+m); } }
guardar=function(){}; irSub=function(){}; irSec=function(){};
function html(){
  var cap="", o=$;
  $=function(id){ return id==="ov-fin-inner" ? {set innerHTML(v){ cap=v; }, get innerHTML(){ return cap; }} : {classList:{remove:function(){}}}; };
  try{ finTemporada(); }catch(e){ cap="ERR "+e.message; } finally{ $=o; }
  return cap;
}
(function(){
  S=nuevoEstado("BET","LAT","B",7,"D",ROLES.LAT[0].id,22);
  S.temporada=2; S.division=S.division||"1";
  var yo=S.equipo;
  var cl=clasificacion(), pos=miPosicion();
  var dentro=cl.slice(0,4).concat(cl.slice(17)).some(function(r){ return r.id===yo; });
  var h=html();
  var resaltado=(h.match(/font-weight:700/g)||[]).length;
  __ok(dentro? resaltado===1 : resaltado===0, "tu equipo se marca solo si sale en las listas (sale="+dentro+", marcas="+resaltado+")");
  console.log("FIN_TEMP: "+__o+" ok · "+__f+" fallos (posición "+pos+")");
})();
/* forzar que tu equipo sea 2º y 19º: debe marcarse en las dos listas */
(function(){
  var orig=clasificacion;
  [1,18].forEach(function(idx){
    clasificacion=function(){ var c=orig().slice(); var k=c.findIndex(function(r){ return r.id===S.equipo; }); var f=c.splice(k,1)[0]; c.splice(idx,0,f); return c; };
    var h=html();
    __ok((h.match(/font-weight:700/g)||[]).length===1, "tu equipo en el puesto "+(idx+1)+" se resalta");
    __ok(h.indexOf("font-weight:700")>0, "la fila resaltada va en negrita dorada");
  });
  clasificacion=orig;
  console.log("FIN_TEMP (forzado): "+__o+" ok · "+__f+" fallos");
})();
