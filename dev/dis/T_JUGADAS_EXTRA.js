/* ===== TEST · jugadas nuevas solo para el entreno (0.03.022) ===== */
var __f=0, __o=0;
function __ok(c,m){ if(c) __o++; else { __f++; console.log("✘ "+m); } }
(function(){
  var ids={}; SITS.concat(SITS_CLUTCH||[], [SIT_PEN_L, SIT_PEN_P], SITS_ENTRENO_EXTRA).forEach(function(s){ ids[s.id]=(ids[s.id]||0)+1; });
  __ok(Object.keys(ids).every(function(k){ return ids[k]===1; }), "ningún id de jugada se repite");
  SITS_ENTRENO_EXTRA.forEach(function(s){
    __ok(s.o.length===3 && s.o.every(function(o){ return o.l && o.ok && o.ko && o.mid; }), "«"+s.id+"» tiene 3 opciones con ok/ko/mid");
    __ok(s.t && s.x, "«"+s.id+"» tiene título y texto");
  });
  S=nuevoEstado("BET","DC","B",7,"D",ROLES.DC[0].id,22);
  var dc=sitsEntreno().filter(function(s){ return /^ent-dc/.test(s.id); }).length;
  __ok(dc===3, "el delantero ve sus tres jugadas nuevas en el entreno ("+dc+")");
  __ok(!SITS.some(function(s){ return /^ent-/.test(s.id); }), "no salen en los partidos");
  console.log("JUGADAS_EXTRA: "+__o+" ok · "+__f+" fallos");
})();
