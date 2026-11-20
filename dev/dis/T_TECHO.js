/* ===== TEST · puntos de techo: botón + y feedback visible — 0.03.018 ===== */
var __f=0, __o=0;
function __ok(c,m){ if(c) __o++; else { __f++; console.log("✘ "+m); } }
(function(){
  S=nuevoEstado("BET","EXT","B",7,"D",ROLES.EXT[0].id,22);
  S.nivel=10; S.techos={}; S.techoPend=3; TAL_RAMA=null;
  var h=secAtributos();
  __ok(h.indexOf("sumarTecho(&#39;TEC")>=0 || h.indexOf("sumarTecho('TEC")>=0 || h.indexOf("+ 1")>0, "con puntos libres aparece el botón + 1");
  __ok(h.indexOf("Puntos de techo sin asignar")>0, "contador de puntos visible");
  var t0=techoAtributoDe("TEC");
  var cap=""; var orig=chRefreshUI_; chRefreshUI_=function(){ cap=secAtributos(); };
  sumarTecho("TEC");
  chRefreshUI_=orig;
  __ok(Math.abs(techoAtributoDe("TEC")-(t0+TECHO_INC))<1e-9, "un clic sube el techo lo que marca TECHO_INC");
  __ok(S.techoPend===2, "un punto menos disponible");
  __ok(cap.indexOf("✔")>0 && cap.indexOf(t0.toFixed(1)+" → "+(t0+TECHO_INC).toFixed(1))>0, "feedback en el render: techo antes → después");
  __ok(secAtributos().indexOf("✔")<0, "el feedback se muestra una sola vez");
  chRefreshUI_=function(){}; sumarTecho("TEC"); sumarTecho("TEC");
  __ok(S.techoPend===0 && secAtributos().indexOf("+ 1")<0, "sin puntos no hay botones +");
  console.log("TECHO: "+__o+" ok · "+__f+" fallos");
})();
