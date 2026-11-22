/* Un gol no compensa tres errores: el gol puntúa una sola vez y los fallos pesan más. */
var ok=0, ko=0;
function t(c,m){ if(c){ ok++; } else { ko++; console.log("✘ "+m); } }
var o={fx:{nota:2}};
t(Math.abs(deltaNota(o,"ko")-(-0.9))<1e-9, "ko con nota 2 = -0,90 (era -0,60)");
t(Math.abs(deltaNota(o,"ok",false)-0.32)<1e-9, "ok sin logro real = 0,32");
t(Math.abs(deltaNota(o,"ok",true)-0.395)<1e-9, "ok con gol/asis = 0,395 (el gol ya puntúa aparte)");
t(deltaNota(o,"ok",true)+NOTA_GOL < 1.0, "un gol vale menos de 1,0 en total (antes 1,15)");
t(3*(-deltaNota(o,"ko")) > deltaNota(o,"ok",true)+NOTA_GOL, "tres errores pesan más que un gol");
console.log("NOTA_ERRORES: "+ok+" ok · "+ko+" fallos");
