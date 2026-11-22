/* ===== TEST · mismas habilidades por decisión en el partido y en el entreno (0.03.055) ===== */
var __f=0,__o=0; function __ok(c,m){ if(c) __o++; else { __f++; console.log("✘ "+m); } }
function fresco(){ S=nuevoEstado("BET","LAT","B",7,"D",ROLES.LAT[0].id,22); S.temporada=3; S.jornada=5; S.skills={}; S.repsM={}; S.reps={}; }
function ptsTotal(){ var t=0; skillsDisp().forEach(function(k){ t+=sklData(k.id).pts; }); return t; }
var bien={l:"Disparar", fx:{inst:{gol:0.2}, nota:1}, juicio:"buena"};
var discreta={l:"Disparar", fx:{inst:{gol:0.2}, nota:1}, juicio:"discreta"};
/* partido: 'killer' (definición) cuenta con remate t en área */
fresco(); usoSkillsPartido({m:60, s:"del-area", z:"A", k:"t", r:"ok"}); var pOk=ptsTotal();
__ok(pOk>0, "un remate bien hecho en el área da puntos de habilidad");
fresco(); usoSkillsPartido({m:60, s:"del-area", z:"A", k:"t", r:"ko"}); __ok(ptsTotal()===0, "ejecución mala: ningún punto (igual que el atributo)");
fresco(); usoSkillsPartido({m:60, s:"del-area", z:"A", k:"t", r:"mid", bien:false}); __ok(ptsTotal()===0, "regular con decisión discreta: ningún punto");
fresco(); usoSkillsPartido({m:60, s:"del-area", z:"A", k:"t", r:"mid", bien:true}); var pMid=ptsTotal();
__ok(pMid>0 && pMid<pOk, "regular con buena decisión: la mitad que bien");
/* entreno del míster: misma regla, mismas habilidades */
__ok(typeof claseDecision==="function" && claseDecision(bien, {id:"del-area"}, false)==="t", "tipo de decisión: un gol es 't' también en el entreno");
__ok(claseDecision(bien, {id:"del-area"}, true)==="v", "fuera del campo: 'v'");
fresco(); usoSkillsPartido({m:0, s:"del-area", z:"A", k:"t", r:"ko", enPartido:false}); __ok(ptsTotal()===0, "entreno: decisión mala no da habilidad");
fresco(); usoSkillsPartido({m:0, s:"del-area", z:"A", k:"t", r:"ok", enPartido:false}); __ok(ptsTotal()===pOk, "entreno: misma decisión buena → mismos puntos que el partido");
__ok(JSON.stringify(S.repsM)==="{}", "el entreno no suma repeticiones de partido");
console.log("HAB_MISMO: "+__o+" ok · "+__f+" fallos");
