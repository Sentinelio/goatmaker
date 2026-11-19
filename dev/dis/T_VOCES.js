/* ===== TEST · «Lo que se dice de ti» en el inicio tras cada partido (0.03.014) ===== */
var __f=0,__o=0; function __ok(c,m){ if(c) __o++; else { __f++; console.log("✘ "+m); } }
S=nuevoEstado("BET","MCO","B",7,"D",ROLES.MCO[0].id,22); S.contrato=S.contrato||{salario:900000,anos:3,exige:60}; S.nombre="Manu";
var riv=Object.keys(EQ).filter(function(k){ return k!==S.equipo; })[0];
function jugar(yo, sc, sinTi){ S.jornada=(S.jornada||0)+1; S.hist.push({jor:S.jornada, rival:riv, casa:true, sc:sc, goles:[], otros:[], yo:yo, sinTi:sinTi||null}); }
__ok(vocesPartido().length===0, "sin partidos no hay voces");
jugar({nota:10, g:0, a:2, p:0, mvp:true, min:90, rs:0}, [2,2]);
var V=vocesPartido(); V.forEach(function(v){ console.log("  "+v.de+(v.quien?" ("+v.quien+")":"")+": "+v.t); });
__ok(V.length>=3 && V.some(function(v){return v.de==="Prensa";}) && V.some(function(v){return v.de==="El míster";}), "partido de 10: prensa, grada y míster");
__ok(JSON.stringify(vocesPartido())===JSON.stringify(V), "las frases no cambian al repintar");
__ok(V.every(function(v){ return v.t.indexOf("undefined")<0 && v.t.indexOf("NaN")<0; }), "sin huecos raros en los textos");
jugar({nota:4.2, g:0, a:0, p:0, min:90, rs:-1}, [0,3]);
console.log("  — mal partido —"); vocesPartido().forEach(function(v){ console.log("  "+v.de+": "+v.t); });
__ok(vocesPartido().some(function(v){ return /olvidar|no estuvo|banquillo|alguien|no ha sido|pido más|currar|cabeza/i.test(v.t); }), "un 4,2 se critica");
jugar(null, [1,0], "sin minutos");
console.log("  — sin jugar —"); vocesPartido().forEach(function(v){ console.log("  "+v.de+": "+v.t); });
__ok(vocesPartido().length===2 && /inédito|Ni un minuto/.test(vocesPartido()[0].t), "sin jugar: hablan de tu ausencia");
S.jornada++; __ok(vocesPartido().length===0, "la semana siguiente sin partido nuevo, desaparecen");
S.publico={afic:20, prensa:20, seg:100}; S.jornada--; S.hist.pop(); jugar({nota:7, g:1, a:0, p:0, min:90, rs:1}, [1,0]);
console.log("  — buen partido, prensa y grada en contra —"); vocesPartido().forEach(function(v){ console.log("  "+v.de+": "+v.t); });
__ok(vocesHTML().indexOf("Lo que se dice de ti")>0, "la tarjeta se pinta");
console.log("VOCES: "+__o+" ok · "+__f+" fallos");
