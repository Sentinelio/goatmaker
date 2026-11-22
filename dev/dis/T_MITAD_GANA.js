/* ===== TEST · entreno: decisión buena + ejecución regular sube siempre la mitad; ejecución buena, entera (0.03.053) ===== */
var __f=0,__o=0; function __ok(c,m){ if(c) __o++; else { __f++; console.log("✘ "+m); } }
var sitFalsa={id:"t-mitad", t:"Prueba", x:"Prueba.", pos:["MC"], o:[{l:"Decisión buena", fx:{inst:{}, nota:1}, juicio:"buena", ok:"Bien.", ko:"Mal.", mid:"Regular."}]};
sitEntrenoPorId=function(){ return sitFalsa; };
var pr=probsEntreno;
function corre(forzado){
  S=nuevoEstado("BET","LAT","B",7,"D",ROLES.LAT[0].id,22); S.temporada=3; S.jornada=5;
  S.attr.TAC=40; S.attr.MEN=40; S.forma=90;
  S.dia={jor:5, fase:"mister", rondas:[{id:"t-mitad", ops:[0]}], ronda:0, pts:0, log:[], antes:[], despues:[], ll:0, sa:0, mis0:S.mister, conf0:S.conf};
  probsEntreno=function(){ return forzado; };
  var v0=atr("TAC")>atr("MEN")? atr("MEN"):atr("TAC");
  guardar=function(){}; irSub=function(){};
  entMisterElige(0);
  probsEntreno=pr;
  var u=S.dia.ultimo, ganado=0;
  var mejor=(atr("TAC")>atr("MEN")? atr("TAC"):atr("MEN"));
  return {u:u, ganado:mejor-40};
}
var reg=corre({ok:0, ko:0});   /* todas las tiradas salen regulares */
var bue=corre({ok:1, ko:0});   /* todas salen bien */
__ok(reg.u && reg.u.cls==="mid", "la ejecución sale regular");
__ok(reg.ganado>0, "buena decisión + regular: sube atributo siempre ("+reg.ganado.toFixed(2)+")");
__ok(bue.ganado>0 && reg.ganado>=bue.ganado*0.45 && reg.ganado<=bue.ganado*0.55, "sube la mitad de lo que sube una ejecución buena ("+reg.ganado.toFixed(2)+" vs "+bue.ganado.toFixed(2)+")");
console.log("MITAD: "+__o+" ok · "+__f+" fallos");
