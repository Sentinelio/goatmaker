/* ===== TEST · mismas habilidades por decisión en el partido y en el entreno (0.03.055) ===== */
var __f=0,__o=0; function __ok(c,m){ if(c) __o++; else { __f++; console.log("✘ "+m); } }
function fresco(){ S=nuevoEstado("BET","LAT","B",7,"D",ROLES.LAT[0].id,22); S.temporada=3; S.jornada=5; S.skills={}; S.repsM={}; S.reps={}; }
function ptsTotal(){ var t=0; skillsDisp().forEach(function(k){ t+=sklData(k.id).pts; }); return t; }
var bien={l:"Disparar", fx:{inst:{gol:0.2}, nota:1}, juicio:"buena"};
var discreta={l:"Disparar", fx:{inst:{gol:0.2}, nota:1}, juicio:"discreta"};
/* partido: 'killer' (definición) cuenta con remate t en área */
fresco(); usoSkillsPartido({m:60, s:"del-area", z:"A", k:"t", r:"ok", juicio:"buena"}); var pOk=ptsTotal();
__ok(pOk>0, "un remate bien hecho en el área da puntos de habilidad");
fresco(); usoSkillsPartido({m:60, s:"del-area", z:"A", k:"t", r:"ko", juicio:"mala"}); __ok(ptsTotal()===0, "mala decisión + mala ejecución: ningún punto (igual que el atributo)");
fresco(); var tot=0; for(var i=0;i<200;i++){ usoSkillsPartido({m:60, s:"del-area", z:"A", k:"t", r:"mid", juicio:"buena"}); } tot=ptsTotal();
__ok(tot>0 && tot<200*pOk*1.0+1, "regular con buena decisión: da puntos, menos que bien ("+tot+" en 200)");
var pMid=tot;
/* entreno del míster: misma regla, mismas habilidades */
__ok(typeof claseDecision==="function" && claseDecision(bien, {id:"del-area"}, false)==="t", "tipo de decisión: un gol es 't' también en el entreno");
__ok(claseDecision(bien, {id:"del-area"}, true)==="v", "fuera del campo: 'v'");
fresco(); usoSkillsPartido({m:0, s:"del-area", z:"A", k:"t", r:"ko", juicio:"mala", enPartido:false}); __ok(ptsTotal()===0, "entreno: mala decisión + mala ejecución no da habilidad");
fresco(); usoSkillsPartido({m:0, s:"del-area", z:"A", k:"t", r:"ok", juicio:"buena", enPartido:false}); __ok(ptsTotal()===pOk, "entreno: misma decisión buena → mismos puntos que el partido");
__ok(JSON.stringify(S.repsM)==="{}", "el entreno no suma repeticiones de partido");
console.log("HAB_MISMO: "+__o+" ok · "+__f+" fallos");
