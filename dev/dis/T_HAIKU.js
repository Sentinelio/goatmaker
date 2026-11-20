/* ===== TEST · arreglos menores de Haiku: club con «el», carta al techo, jugadas sin repetir — 0.03.021 ===== */
var __f=0, __o=0;
function __ok(c,m){ if(c) __o++; else { __f++; console.log("✘ "+m); } }
guardar=function(){}; irSub=function(){}; irSec=function(){};
(function(){
  __ok(nombreClubVoz("R. Madrid")==="Real Madrid", "R. Madrid se dice Real Madrid");
  __ok(nombreClubVoz("Barcelona")==="Barcelona", "Barcelona se queda igual");
  S=nuevoEstado("BET","LAT","B",7,"D",ROLES.LAT[0].id,22); S.contrato=S.contrato||{salario:900000,anos:3,exige:60};
  var e=ENTRENOS[0]; var k=Object.keys(e.sube)[0];
  S.attr[k]=techoAtributoDe(k)+1;
  __ok(ejCarta(e,null,false).indexOf("al techo")>0, "atributo en el techo: la carta dice «al techo», no «+0.0»");
  S.attr[k]=techoAtributoDe(k)-40;
  __ok(ejCarta(e,null,false).indexOf("+0.0")<0, "sin techo alcanzado no aparece «+0.0» si ya sube");
  /* jugadas: con varias semanas no repite las mismas mientras haya donde elegir */
  S.sitsRec=[];
  var usadas=[], repes=0;
  for(var w=0; w<6; w++){
    var L=elegirSitsEntreno(3), ids=L.map(function(x){return x.id;});
    ids.forEach(function(id){ if(usadas.indexOf(id)>=0 && (usadas.length+3)<=sitsEntreno().length) repes++; usadas.push(id); });
  }
  __ok(repes===0, "seis semanas seguidas sin repetir ninguna jugada ("+repes+" repetidas)");
  console.log("HAIKU: "+__o+" ok · "+__f+" fallos");
})();
