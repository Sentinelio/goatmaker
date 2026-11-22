/* ===== TEST · entreno: primero si la decisión fue buena, después si la ejecución, y qué atributo trabajar (0.03.049) ===== */
var __f=0,__o=0; function __ok(c,m){ if(c) __o++; else { __f++; console.log("✘ "+m); } }
S=nuevoEstado("BET","LAT","B",7,"D",ROLES.LAT[0].id,22); S.temporada=3; S.jornada=5;
var mala={n:"Balón al área", op:"Centrar", cls:"ko", ok:false, txt:"El centro sale demasiado largo.", gan:"", juicio:"mala", por:"Centrar sin mirar al segundo palo regala la pelota.", mejora:"TEC"};
var h=veredictoEntreno(mala, true);
var iD=h.indexOf("Tu decisión fue mala"), iE=h.indexOf("Tu ejecución fue mala"), iM=h.indexOf("trabaja tu");
__ok(iD>=0 && iE>iD, "la decisión sale antes que la ejecución");
__ok(iM>iE && /trabaja tu/.test(h) && /#E8C547">técnica/.test(h) && !/Sigue trabajando/.test(h), "con ejecución mala se dice qué atributo trabajar en amarillo, sin la frase de relleno");
var buena={n:"Pase", op:"Pasar al hueco", cls:"ok", ok:true, txt:"Llega solo.", gan:"", juicio:"buena", por:"Es el pase que el delantero necesita."};
var hb=veredictoEntreno(buena, true);
__ok(hb.indexOf("Tu decisión fue buena")<hb.indexOf("Tu ejecución fue buena") && hb.indexOf("trabaja tu")<0, "ejecución buena: no se pide mejorar nada");
var reg=veredictoEntreno({cls:"mid", txt:"Llega tarde.", juicio:"discreta", por:"Vale, pero hay algo mejor.", mejora:"FIS"}, true);
__ok(/Tu ejecución fue regular/.test(reg) && /trabaja tu <b[^>]*>físico/.test(reg), "regular: también dice qué trabajar");
__ok(atrMejoraEntreno({fx:{inst:{parada:0.2}}})==="POR", "una parada pide portería");
__ok(atrMejoraEntreno({fx:{inst:{gol:0.2}}})==="TEC", "un gol pide técnica");
__ok(atrMejoraEntreno({fx:{ta:1}})==="MEN", "una tarjeta pide mentalidad");
var sol=veredictoEntreno({cls:"ko", txt:"Mal.", juicio:"", por:""}, false);
__ok(sol.indexOf("ejecución")<0, "en el registro sin detalle solo se ve la decisión");
var sube={n:"Pase", op:"Pasar al hueco", cls:"ok", ok:true, txt:"Llega solo.", gan:"TEC +0.12", juicio:"buena", por:"Es el pase que el delantero necesita.", mejora:null};
var hs=veredictoEntreno(sube, true);
__ok(/▲ Técnica \+0,12/.test(hs) && /var\(--ok\)/.test(hs.slice(hs.indexOf("▲")-60, hs.indexOf("▲"))), "la subida sale en verde con el nombre del atributo");
__ok(/margin-top:8px/.test(hs) && (hs.match(/<div/g)||[]).length>=5, "el veredicto va en líneas separadas");
__ok(!/<b[^>]*>[^<]*<br>/.test(hs), "ya no hay un bloque en negrita con todo dentro");
console.log("VEREDICTO: "+__o+" ok · "+__f+" fallos");
