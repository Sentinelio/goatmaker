/* ===== TEST · talentos: pestañas por rama, pips por rango y puntos libres reales — v4.69.5 =====
   Uso: HTML=/ruta/index.html dis/correr.sh T_TALENTOS.js */
var __f=0, __o=0;
function __ok(c,m){ if(c) __o++; else { __f++; console.log("✘ "+m); } }
(function(){
  S=nuevoEstado("BET","EXT","B",7,"D",ROLES.EXT[0].id,22);
  S.nivel=23; S.talentos={}; S.talentoPend=4;   /* el contador viejo dice 4: no debe mandar */
  TAL_RAMA=null;
  var h=secTalentos();
  __ok(h.indexOf("16 por asignar")>0 && h.indexOf("4 por asignar")<0, "sin invertir: 16 libres (presupuesto 23−7), no los 4 del contador viejo");
  __ok((h.match(/talRama\(/g)||[]).length===TALENTO_ORDEN.length, "una pestaña por rama ("+TALENTO_ORDEN.length+")");
  var nodosRama=TALENTOS[TALENTO_ORDEN[0]].nodes.filter(function(n){ return !n.off; }).length;
  __ok((h.match(/class="row2"/g)||[]).length===nodosRama, "solo se pinta la rama activa ("+nodosRama+" talentos)");
  var rangos=TALENTOS[TALENTO_ORDEN[0]].nodes.filter(function(n){return !n.off;}).reduce(function(a,n){return a+n.rank;},0);
  __ok((h.match(/width:13px;height:4px/g)||[]).length===rangos, "un pip por rango ("+rangos+")");
  /* invertir hasta agotar el presupuesto: el texto dice que no quedan puntos */
  var rama=TALENTO_ORDEN[0], nodos=TALENTOS[rama].nodes.filter(function(n){return !n.off && n.lvl<=23 && !n.req;});
  nodos.forEach(function(n){ S.talentos[rama]=S.talentos[rama]||{}; S.talentos[rama][n.id]=n.rank; });
  var gast=puntosTalentoGastados(), presu=talentoPresupuesto();
  var h2=secTalentos();
  __ok(gast<=presu, "invertidos "+gast+" ≤ presupuesto "+presu);
  __ok(presu-gast===0 ? h2.indexOf("no te quedan puntos libres")>0 : h2.indexOf(" por asignar ahora mismo")>0, "el texto de libres coincide con invertidos/presupuesto");
  TAL_RAMA=TALENTO_ORDEN[1];
  __ok(secTalentos().indexOf(TALENTOS[TALENTO_ORDEN[1]].name)>0, "cambiar de pestaña muestra la rama elegida");
})();
console.log("TALENTOS: "+__o+" ok · "+__f+" fallos");
if(__f) throw new Error("fallos: "+__f);
