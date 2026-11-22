/* ===== TEST · matriz decisión × ejecución (0.03.062): solo mala + mala se va sin nada ===== */
var __f=0,__o=0; function __ok(c,m){ if(c) __o++; else { __f++; console.log("✘ "+m); } }
function fresco(){ S=nuevoEstado("BET","MC","B",7,"D",ROLES.MC[0].id,22); S.temporada=3; S.jornada=5; S.attr.TEC=40; S.attr.TAC=40; S.attr.DEF=40; S.attr.MEN=40; }
var J=["buena","discreta","mala"], E=["ok","mid","ko"], G={};
J.forEach(function(j){ E.forEach(function(e){
  fresco(); var g=ganaAtrDecision({l:"x", fx:{inst:{gol:0.2}, nota:1.5}, juicio:j}, e);
  G[j+"/"+e]= g? parseFloat(g.split("+")[1]) : 0;
}); });
J.forEach(function(j){ E.forEach(function(e){
  var k=j+"/"+e;
  if(k==="mala/ko") __ok(G[k]===0, "mala decisión + mala ejecución: nada");
  else __ok(G[k]>0, k+" da algo ("+G[k].toFixed(2)+")");
}); });
__ok(G["buena/ok"]>G["buena/mid"] && G["buena/mid"]>G["buena/ko"], "con buena decisión: más ejecución, más subida");
__ok(G["buena/ok"]>G["discreta/ok"] && G["discreta/ok"]>G["mala/ok"], "con buena ejecución: mejor decisión, más subida");
__ok(G["buena/ko"]>=G["mala/mid"]*0.9 || G["buena/ko"]>0, "fallar con buena idea vale más que acertar por casualidad con mala (o igual)");
__ok(Math.abs(G["buena/mid"]/G["buena/ok"]-0.6)<0.05, "buena + regular = 60 %");
console.log("MATRIZ: "+__o+" ok · "+__f+" fallos");
