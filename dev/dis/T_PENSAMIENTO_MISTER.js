/* ===== TEST · el míster se expresa con pensamientos en color, no con números (0.03.050) ===== */
var __f=0,__o=0; function __ok(c,m){ if(c) __o++; else { __f++; console.log("✘ "+m); } }
S=nuevoEstado("BET","LAT","B",7,"D",ROLES.LAT[0].id,22); S.temporada=3; S.jornada=5; S.contrato={salario:1e6,anos:2,clausula:1e7,exige:60,firmadoT:2};
function diaCon(nota){ return {jor:5, fase:"notaMister", nota:nota, rondas:[], ronda:0, pts:0, log:[], antes:[], despues:[], ll:0, sa:0, mis0:S.mister, conf0:S.conf}; }
var verde=pensMister(diaCon(8.2)), amarillo=pensMister(diaCon(6.8)), rojo=pensMister(diaCon(4.1));
__ok(/var\(--ok\)/.test(verde) && /Le gustas/.test(verde), "nota alta: verde, le gustas");
__ok(/#E8C547/.test(amarillo) && /Te duda/.test(amarillo), "nota media: amarillo, duda");
__ok(/var\(--bad\)/.test(rojo) && /No le gustas/.test(rojo), "nota baja: rojo, no le gustas");
__ok(!/\d,\d|\d\.\d/.test(verde+amarillo+rojo), "ninguna frase lleva el número");
S.dia=diaCon(8.2);
var h=entMisterHTML();
__ok(h.indexOf("8,2")<0 && h.indexOf("Nota del")<0, "la pantalla del míster no enseña la nota numérica");
__ok(h.indexOf("Le gustas")>=0, "la pantalla del míster enseña el pensamiento");
var e=pensMister(diaCon(7.5)); __ok(/Le gustas/.test(e), "7,5 ya es verde");
var r1=pensMister(diaCon(7.0)), r2=pensMister(diaCon(7.0)); __ok(r1===r2, "el mismo día muestra siempre la misma frase");
console.log("PENS: "+__o+" ok · "+__f+" fallos");
