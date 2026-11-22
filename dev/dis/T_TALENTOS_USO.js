/* ===== TEST · los talentos sirven en el entreno y en el partido (0.03.065) ===== */
var __f=0,__o=0; function __ok(c,m){ if(c) __o++; else { __f++; console.log("✘ "+m); } }
function fresco(pos){ S=nuevoEstado("BET",pos||"DFC","B",7,"D",ROLES[pos||"DFC"][0].id,22); S.temporada=3; S.jornada=5; S.forma=80; S.attr.TEC=50; S.attr.TAC=50; S.attr.DEF=50; S.attr.MEN=50; S.attr.FIS=50; S.nivel=40; S.talentos={}; S.ritmo=null; }
var atqGol={l:"x", fx:{inst:{gol:0.30}, nota:1.5}, juicio:"buena"}, def={l:"y", fx:{inst:{golR:0.30}, nota:1}, juicio:"buena"}, pase={l:"z", fx:{inst:{asis:0.30}, nota:1}, juicio:"buena"};
/* entreno del míster: las probabilidades usan tus talentos */
fresco("DC"); var p0=probsEntreno(atqGol, null).ok;
S.talentos={ataque:{instinto:3, defin:3}}; var p1=probsEntreno(atqGol, null).ok;
__ok(p1>p0, "Instinto de gol y Definición fría suben la probabilidad de acierto en el entreno del míster ("+p0.toFixed(3)+" → "+p1.toFixed(3)+")");
fresco("DFC"); var k0=probsEntreno(def, null).ko;
S.talentos={defensa:{duelo:3, antic:3}}; var k1=probsEntreno(def, null).ko;
__ok(k1<k0, "Duelo limpio y Anticipación bajan el riesgo de fallo defensivo en el entreno ("+k0.toFixed(3)+" → "+k1.toFixed(3)+")");
fresco("MC"); var a0=probsEntreno(pase, null).ok;
S.talentos={centro:{vision:3, buenpie:3}}; var a1=probsEntreno(pase, null).ok;
__ok(a1>a0, "Visión y Buen pie suben el acierto de pase en el entreno");
/* las habilidades también (sk las incluye) */
fresco("DC"); S.skl={killer:{niv:20, pts:0}}; var h1=probsEntreno(atqGol, null).ok; fresco("DC"); var h0=probsEntreno(atqGol, null).ok;
__ok(h1>h0, "una habilidad (Killer del área) también pesa en el entreno");
/* subida por decisión: talentos de entreno de ese atributo */
fresco("DFC"); var sd0=parseFloat(ganaAtrDecision(def,"ok").split("+")[1]);
fresco("DFC"); S.talentos={defensa:{duelo:3, antic:3}}; var sd1=parseFloat(ganaAtrDecision(def,"ok").split("+")[1]);
__ok(sd1>sd0*1.15, "Duelo limpio y Anticipación aceleran la subida de DEF por decisión ("+sd0.toFixed(2)+" → "+sd1.toFixed(2)+")");
fresco("MC"); S.talentos={mental:{sfria:3, concent:3}}; var m1=bonusTalentosEntreno("MEN"); __ok(m1>1.15, "las ramas Mental y Defensa ya mejoran el entreno: MEN ×"+m1.toFixed(2));
fresco("DFC"); S.talentos={defensa:{duelo:3, antic:3}}; __ok(bonusTalentosEntreno("DEF")>1.15, "DEF ×"+bonusTalentosEntreno("DEF").toFixed(2));
/* la sesión semanal sigue funcionando con ellos */
fresco("DFC"); var e=ENTRENOS[ejIdx("duelos")]; var gb=gananciaEntreno(e,"DEF",false); S.talentos={defensa:{duelo:3, antic:3}}; var gt=gananciaEntreno(e,"DEF",false);
__ok(gt>gb, "en la sesión semanal de duelos, los talentos suben la ganancia de DEF ("+gb+" → "+gt+")");
/* partido: cada talento de fx tiene un consumidor */
var camposUsados=["gol","asis","golR","parada","ta","lesion","lider","resil"];
var huerfanos=[]; Object.keys(TALENTOS).forEach(function(r){ TALENTOS[r].nodes.forEach(function(n){ Object.keys(n.fx||{}).forEach(function(c){ if(camposUsados.indexOf(c)<0) huerfanos.push(r+"/"+n.id+":"+c); }); Object.keys(n.fxForma||{}).forEach(function(c){ if(["recupera","desgaste","riesgo"].indexOf(c)<0) huerfanos.push(r+"/"+n.id+":forma."+c); }); Object.keys(n.fxEntreno||{}).forEach(function(c){ if(["TEC","FIS","TAC","DEF","MEN","POR"].indexOf(c)<0) huerfanos.push(r+"/"+n.id+":entreno."+c); }); }); });
__ok(huerfanos.length===0, "ningún talento apunta a un campo que nadie lee: "+huerfanos.join(","));
/* el partido: un talento mueve la probabilidad real */
fresco("DC"); S.talentos={ataque:{instinto:3}}; var pm1=probOpc({fx:{inst:{gol:0.3}}}, "gol"); fresco("DC"); var pm0=probOpc({fx:{inst:{gol:0.3}}}, "gol");
__ok(pm1>pm0, "en el partido, Instinto de gol sube la probabilidad de gol ("+pm0.toFixed(3)+" → "+pm1.toFixed(3)+")");
console.log("TALENTOS_USO: "+__o+" ok · "+__f+" fallos");
