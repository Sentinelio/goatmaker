/* ===== TEST · los atributos siguen moviéndose temporada tras temporada (0.03.059) ===== */
var __f=0,__o=0; function __ok(c,m){ if(c) __o++; else { __f++; console.log("✘ "+m); } }
function simula(temps, ses, dec){
  S=nuevoEstado("BET","MC","B",7,"D",ROLES.MC[0].id,19); S.temporada=1; S.conf=60; S.forma=80; S.lesion=0; S.techos={};
  var lista=ENTRENOS.filter(function(e){ return !e.off && !e.cuando && (!e.pos || e.pos.indexOf("MC")>=0); });
  var ks=["TEC","FIS","TAC","DEF","MEN"], porTemp=[];
  for(var t=1;t<=temps;t++){
    var antes=ks.reduce(function(a,k){ return a+atr(k); },0);
    for(var w=0;w<38;w++){
      S.forma=80;
      for(var i=0;i<ses;i++){ aplicarEntreno(ENTRENOS.indexOf(lista[Math.floor(rnd()*lista.length)]), false); }
      for(var j=0;j<dec;j++){ var r=rnd(), cls=r<0.4?"ok":r<0.75?"mid":"ko"; ganaAtrDecision({fx:{inst:{}, nota:1+rnd()*2}, juicio:rnd()<0.5?"buena":"discreta"}, cls); }
    }
    /* cada temporada ~11 niveles: los puntos de techo se reparten entre los 5 atributos */
    for(var p=0;p<11;p++){ S.techoPend=1; asignarTecho(ks[p%5]); }
    porTemp.push(ks.reduce(function(a,k){ return a+atr(k); },0)-antes);
  }
  return porTemp;
}
var g=simula(6,4,13);
__ok(g[3]>6 && g[5]>6, "con dos sesiones al día y decisiones, el conjunto sigue subiendo a la 4ª y 6ª temporada: "+g.map(function(x){return x.toFixed(1);}).join(" · "));
__ok(Math.abs(techoAtributoDe("TEC")-(68+TECHO_INC*3))<1e-9 || techoAtributoDe("TEC")>68, "el techo sube al asignar puntos");
/* en partido: la subida sale en los chips de la decisión */
__ok(require("fs").readFileSync(process.env.HTML,"utf8").indexOf("efe.push({t:ganTexto(_ganAtr), b:true})")>0, "la subida de atributo se añade a los efectos que ve el jugador");
console.log("RITMO: "+__o+" ok · "+__f+" fallos");
