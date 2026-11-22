/* ===== TEST · racha, forma de juego y techo por rendimiento (0.03.064) ===== */
var __f=0,__o=0; function __ok(c,m){ if(c) __o++; else { __f++; console.log("✘ "+m); } }
function fresco(pos){ S=nuevoEstado("BET",pos||"MC","B",7,"D",ROLES[pos||"MC"][0].id,24); S.temporada=2; S.jornada=5; S.attr.TEC=40; S.attr.TAC=40; S.attr.DEF=40; S.attr.MEN=40; S.ritmo=null; M=null; }
var bueno={l:"x", fx:{inst:{gol:0.2}, nota:1.5}, juicio:"buena"}, malo={l:"y", fx:{inst:{}, nota:1.5}, juicio:"mala"}, disc={l:"z", fx:{inst:{}, nota:1}, juicio:"discreta"};
/* racha */
fresco(); __ok(multRacha()===1, "sin racha ×1,0");
for(var i=0;i<3;i++) rachaDecision(bueno,"ok");
__ok(Math.abs(multRacha()-1.3)<1e-9, "3 aciertos dobles → ×1,3: "+multRacha());
for(i=0;i<9;i++) rachaDecision(bueno,"ok");
__ok(Math.abs(multRacha()-1.5)<1e-9, "tope ×1,5");
rachaDecision(bueno,"ko"); __ok(Math.abs(multRacha()-1.3)<1e-9, "un fallo resta 2 pasos (no reinicia): "+multRacha());
rachaDecision(disc,"ok"); __ok(Math.abs(multRacha()-1.3)<1e-9, "buena ejecución con decisión discreta: no suma ni resta");
rachaDecision(malo,"ok"); __ok(Math.abs(multRacha()-1.3)<1e-9, "mala decisión con buena ejecución: neutra");
rachaDecision(malo,"mid"); __ok(Math.abs(multRacha()-1.1)<1e-9, "mala decisión + regular: resta");
rachaDecision(bueno,"mid"); __ok(Math.abs(multRacha()-1.1)<1e-9, "buena decisión regular: neutra");
/* la racha multiplica la subida */
fresco(); var g0=parseFloat(ganaAtrDecision(bueno,"ok").split("+")[1]);
fresco(); for(i=0;i<3;i++) rachaDecision(bueno,"ok"); var g3=parseFloat(ganaAtrDecision(bueno,"ok").split("+")[1]);
__ok(g3>g0*1.2 && g3<g0*1.4, "con racha ×1,3 sube un ~30 % más ("+g0.toFixed(2)+" → "+g3.toFixed(2)+")");
/* forma de juego */
fresco("MC"); __ok(multForma()===1, "sin partidos: ×1,0");
[7.3,7.4,7.5,7.4,7.4].forEach(function(n){ registrarNotaRitmo(n); }); 
__ok(multForma()===1.1, "media 7,4 en MC (base 6,95): ×1,1 → "+multForma());
fresco("MC"); [7.6,7.7,7.6,7.7,7.6].forEach(function(n){ registrarNotaRitmo(n); }); __ok(multForma()===1.2, "media 7,6: ×1,2 → "+multForma());
fresco("MC"); [8,8,8.1,7.9,8].forEach(function(n){ registrarNotaRitmo(n); }); __ok(multForma()===1.3, "media 8,0: ×1,3 → "+multForma());
fresco("DFC"); [7.4,7.4,7.4,7.4,7.4].forEach(function(n){ registrarNotaRitmo(n); }); __ok(multForma()===1.2, "el mismo 7,4 vale más en defensa (base menor): "+multForma());
fresco("DC"); [7.4,7.4,7.4,7.4,7.4].forEach(function(n){ registrarNotaRitmo(n); }); __ok(multForma()===1, "y menos en delantero: "+multForma());
/* tope conjunto */
fresco("MC"); [8,8,8,8,8].forEach(function(n){ registrarNotaRitmo(n); }); S.ritmo.paso=5; __ok(Math.abs(multGanancia()-1.6)<1e-9, "tope conjunto ×1,6: "+multGanancia());
/* 8,5+ suma racha y techo gratis tras 10 partidos de nivel */
fresco("MC"); registrarNotaRitmo(6); registrarNotaRitmo(8.6); __ok(S.ritmo.paso>=1, "un 8,6 suma racha");
fresco("MC"); var t0=S.techoPend||0; for(i=0;i<10;i++) registrarNotaRitmo(7.9);
__ok((S.techoPend||0)===t0+1, "10 partidos con media ≥ base+0,85: 1 punto de techo gratis");
for(i=0;i<20;i++) registrarNotaRitmo(7.9); __ok((S.techoPend||0)<=t0+2, "máximo 2 por temporada ("+((S.techoPend||0)-t0)+")");
/* baja 1 por partido */
fresco("MC"); S.ritmo={paso:3,notas:[],tT:-1,tN:0}; registrarNotaRitmo(6.5); __ok(S.ritmo.paso===2, "la racha baja 1 por partido jugado");
console.log("RACHA: "+__o+" ok · "+__f+" fallos");
