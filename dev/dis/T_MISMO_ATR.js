/* ===== TEST · misma regla de atributos en el entreno y en el partido (0.03.054) ===== */
var __f=0,__o=0; function __ok(c,m){ if(c) __o++; else { __f++; console.log("✘ "+m); } }
function fresco(){ S=nuevoEstado("BET","LAT","B",7,"D",ROLES.LAT[0].id,22); S.temporada=3; S.jornada=5; S.attr.TEC=40; S.attr.TAC=40; S.attr.MEN=40; S.attr.DEF=40; S.attr.FIS=40; }
var gol={l:"Disparar", fx:{inst:{gol:0.2}, nota:1}, juicio:"buena"};
var pase={l:"Pase", fx:{inst:{asis:0.2}, nota:1}, juicio:"discreta"};
var malo={l:"Regatear", fx:{inst:{}, nota:2}, juicio:"mala"};
fresco(); var g1=ganaAtrDecision(gol,"ok");
__ok(/^TEC \+/.test(g1), "un remate bien ejecutado sube técnica (el atributo que nombra el míster): "+g1);
fresco(); var g2=ganaAtrDecision(gol,"mid");
__ok(/^TEC \+/.test(g2) && parseFloat(g2.split("+")[1])<parseFloat(g1.split("+")[1]) && parseFloat(g2.split("+")[1])>0, "regular con buena decisión: sube, menos que bien");
fresco(); __ok(ganaAtrDecision(gol,"ko")==="", "ejecución mala: no sube");
fresco(); __ok(ganaAtrDecision(pase,"mid")==="", "regular con decisión discreta: no sube");
fresco(); __ok(ganaAtrDecision(malo,"ok")!=="" && ganaAtrDecision(malo,"ok").indexOf("+")>0, "mala decisión + ejecución buena: sube el atributo que pide la jugada");
fresco(); __ok(ganaAtrDecision(gol,"ok").split(" ")[0]===atrMejoraEntreno(gol), "el atributo que sube es el que el míster te manda trabajar");
/* mismo resultado en el partido y en el entreno: misma función */
fresco(); var a1=ganaAtrDecision(gol,"ok"); var v1=S.attr.TEC;
fresco(); var a2=ganaAtrDecision(gol,"ok"); __ok(a1===a2, "dos veces la misma decisión da lo mismo");
console.log("MISMO_ATR: "+__o+" ok · "+__f+" fallos");
