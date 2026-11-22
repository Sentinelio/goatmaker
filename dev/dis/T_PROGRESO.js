/* ===== TEST · feedback de progreso y nota de entreno en la vara del partido (0.03.061) ===== */
var __f=0,__o=0; function __ok(c,m){ if(c) __o++; else { __f++; console.log("✘ "+m); } }
S=nuevoEstado("BET","MC","B",7,"D",ROLES.MC[0].id,22); S.temporada=2; S.jornada=5; S.conf=60;
/* nota del entreno */
function nota(x,n){ return notaEntreno({pts:x*n, rondas:new Array(n)}); }
__ok(nota(0.25,4)>=5.3 && nota(0.25,4)<=5.8, "todo regular ≈ 5,5: "+nota(0.25,4));
__ok(nota(0.67,4)>=6 && nota(0.67,4)<=6.5, "jornada normal ≈ 6,2 (antes 4,5): "+nota(0.67,4));
__ok(nota(1.48,4)>=7.5, "jugar seguro supera el 7,5 (le gustas): "+nota(1.48,4));
__ok(nota(-0.7,4)<5, "todo mal se nota: "+nota(-0.7,4));
/* marcador de progreso */
snapAtrSemana();
var t0=atr("TEC"); S.attr.TEC=t0+0.6;
var g=progAtr("TEC");
__ok(Math.abs(g.sem-0.6)<1e-9 && Math.abs(g.temp-0.6)<1e-9, "la semana y la temporada reflejan lo subido: "+g.sem.toFixed(2));
S.jornada++; snapAtrSemana();
var g2=progAtr("TEC");
__ok(Math.abs(g2.sem)<1e-9 && Math.abs(g2.temp-0.6)<1e-9, "al cambiar de semana se reinicia la semana y se conserva la temporada");
S.temporada++; snapAtrSemana();
__ok(Math.abs(progAtr("TEC").temp)<1e-9, "al cambiar de temporada se reinicia la temporada");
__ok(/esta semana/i.test(progAtrHTML("TEC")) && /esta temporada/.test(progAtrHTML("TEC")), "la ficha muestra semana y temporada");
__ok(sgnDec(0.64)==="+0,6" && sgnDec(-0.2)==="−0,2" && sgnDec(0)==="0,0", "formato de la subida: "+sgnDec(0.64)+" "+sgnDec(-0.2)+" "+sgnDec(0));
/* partida antigua sin instantáneas: no rompe */
delete S.attrSem; delete S.attrTemp; __ok(progAtr("DEF").sem===0, "partida sin instantáneas: cero, sin error");
console.log("PROGRESO: "+__o+" ok · "+__f+" fallos");
