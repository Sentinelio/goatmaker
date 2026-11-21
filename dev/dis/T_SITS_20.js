/* ===== TEST · 20+ situaciones por puesto, en partido y en entreno; explicación en cada opción (0.03.029) ===== */
var __f=0, __o=0;
function __ok(c,m){ if(c) __o++; else { __f++; console.log("✘ "+m); } }
(function(){
  var POSL=['POR','DFC','LAT','MCD','MC','MCO','EXT','DC'];
  function enPos(L,p){ return L.filter(function(s){ return s.pos && s.pos.indexOf(p)>=0; }); }
  var partido=SITS.concat(SITS_CLUTCH||[], [SIT_PEN_L, SIT_PEN_P]);
  var banco=sitsBancoEntreno();
  var ids={}; partido.forEach(function(s){ ids[s.id]=(ids[s.id]||0)+1; });
  __ok(Object.keys(ids).every(function(k){ return ids[k]===1; }), "ningún id de situación se repite");
  POSL.forEach(function(p){
    var np=enPos(partido,p).length, nb=enPos(banco,p).length;
    __ok(np>=20, p+": "+np+" situaciones en partido (mínimo 20)");
    __ok(nb>=20, p+": "+nb+" situaciones en entreno (mínimo 20)");
    __ok(np===nb, p+": partido y entreno tienen el mismo número ("+np+" / "+nb+")");
  });
  /* todas las opciones de las situaciones con puesto llevan juicio y explicación */
  var sinExp=[];
  banco.forEach(function(s){ if(!s.pos) return; s.o.forEach(function(o){
    if(!o.por || ["buena","discreta","mala"].indexOf(o.juicio)<0) sinExp.push(s.id+" / "+o.l); }); });
  __ok(sinExp.length===0, "todas las opciones de entreno tienen juicio y explicación"+(sinExp.length? ": "+sinExp.slice(0,5).join(" | "):""));
  /* el registro del entreno muestra el juicio y el porqué */
  S=nuevoEstado("BET","DC","B",7,"D",ROLES.DC[0].id,22);
  var D={log:[{n:"t", op:"o", cls:"ok", ok:true, txt:"x", gan:"", juicio:"mala", por:"Porque sí."}]};
  var html=diaMisterFilas(D,false);
  __ok(html.indexOf("Mala decisión")>=0 && html.indexOf("Porque sí.")>=0, "el registro muestra «Mala decisión» y el porqué");
  console.log("SITS_20: "+__o+" ok · "+__f+" fallos");
})();
