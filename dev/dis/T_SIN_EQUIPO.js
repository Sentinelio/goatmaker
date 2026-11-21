/* ===== TEST · sin equipo: desvinculado del club; renovar solo con club; precontrato en los últimos 6 meses (0.03.044) ===== */
var __f=0,__o=0; function __ok(c,m){ if(c) __o++; else { __f++; console.log("✘ "+m); } }
var __renderHubReal=renderHub;
guardar=function(){}; irSub=function(){}; irSec=function(){}; renderHub=function(){};
cerrarOvsemDom=function(){}; regSemana=function(){}; alMenu=function(){}; ovSemana=function(){};
mercadoSemanal=function(){}; semanaTienda=function(){}; cerrarEntrenoPendiente=function(){};
pendientesSemana=function(){ return []; };
function nuevo(){
  S=nuevoEstado("BET","LAT","B",7,"D",ROLES.LAT[0].id,22);
  S.temporada=3; S.mister=60; S.jornada=1; S.lesion=0; S.sancion=0; S.division="1";
  S.contrato={salario:1e6,anos:0,clausula:1e7,exige:60,firmadoT:2};
}
function finHtml(){
  var cap="", o=$;
  $=function(id){ return id==="ov-fin-inner" ? {set innerHTML(v){ cap=v; }, get innerHTML(){ return cap; }} : {classList:{remove:function(){},add:function(){}}}; };
  try{ nuevaTemporada(); }catch(e){ cap="ERR "+e.message; } finally{ $=o; }
  return cap;
}
function hubHtml(){
  var cap={}, o=$;
  $=function(id){ var el={classList:{remove:function(){},add:function(){}}, getElementsByTagName:function(){return [];}, getAttribute:function(){return "";}};
    Object.defineProperty(el,"innerHTML",{set:function(v){ cap[id]=v; }, get:function(){ return cap[id]||""; }}); return el; };
  var rh=renderHub; 
  try{ renderHub=__renderHubReal; renderHub(); } catch(e){ cap["hub-left"]="ERR "+e.message; } finally{ $=o; renderHub=rh; }
  return cap["hub-left"]||"";
}
(function(){
/* 1 · libre: la jornada se juega sin ti y consta como «sin equipo» */
nuevo(); S.libre=true; S.libreFin=true;
var __jst=jornadaSinTi, __jugo=0; jornadaSinTi=function(){ __jugo++; return __jst(); };
var jor0=S.jornada, racha0=S.racha.length, moral0=S.moral;
iniciarJornada();
var h=S.hist[S.hist.length-1];
__ok(__jugo===1, "libre: la jornada se juega sin ti");
__ok(h && h.sinTi==="sin equipo" && !h.yo, "libre: el historial marca «sin equipo»");
__ok(S.jornada===jor0+1, "libre: la liga avanza");
__ok(S.racha.length===racha0 && S.moral===moral0, "libre: no hay racha ni moral de un equipo que no es el tuyo");
jornadaSinTi=__jst;
/* 2 · el hub: tarjeta de agente libre donde iba el partido, y nada del club */
S.jornada=5;
var hh=hubHtml();
__ok(hh.indexOf("ERR")!==0, "libre: el hub se pinta sin errores ("+hh.slice(0,80)+")");
__ok(hh.indexOf("AGENTE LIBRE")>=0 && hh.indexOf("Escuchar ofertas")>=0, "libre: el hub ofrece escuchar ofertas · "+hh.slice(0,300));
__ok(hh.indexOf("Saltar al campo")<0 && hh.indexOf("vsrow")<0, "libre: el hub no muestra partido");
__ok(hh.indexOf("Renovar")<0, "libre: no se puede renovar");
/* 3 · sin club no se paga comisión ni hay renovación proactiva */
S.agente={n:"Pepe Ruiz",estilo:"cercano",pct:0.08,nivel:1,desde:1}; S.dinero=1000;
comisionSemanal(); __ok(S.dinero===1000, "libre: no se paga comisión de agente");
S.contrato.anos=1; S.jornada=26; S.renovProc=null; S.mister=60;
renovacionProactiva(); __ok(!S.renovProc, "libre: el club no te ofrece renovar");
/* 4 · ventana de precontrato: últimos seis meses de la última temporada */
nuevo(); S.contrato.anos=1; S.libre=null; S.libreFin=null;
S.jornada=18; __ok(!ventanaPrecontrato(), "precontrato: antes de la jornada 19 no hay ventana");
S.jornada=19; __ok(ventanaPrecontrato(), "precontrato: desde la jornada 19 de la última temporada sí");
S.contrato.anos=2; __ok(!ventanaPrecontrato(), "precontrato: con más de un año de contrato no hay ventana");
S.contrato.anos=1;
/* 5 · firmar un precontrato: sigues en tu club y no hay traspaso */
var otro=Object.keys(EQ).filter(function(k){ return k!==S.equipo; })[0];
var gt=generarTanda;
generarTanda=function(){ return [{id:otro, mia:70, frase:"x", rol:"Titular", col:"#fff", directo:true, mejor:70, competencia:"x", dif:0,
  contrato:{salario:2e6,anos:3,clausula:2e7,exige:60}}]; };
abrirMercado(true); generarTanda=gt;
__ok(PICK && PICK.pre===true && PICK.tanda && PICK.tanda.length===1, "precontrato: la mesa se abre en modo precontrato");
__ok(PICK.tanda[0].op && PICK.tanda[0].op.tipo==="libre" && PICK.tanda[0].op.fee===0, "precontrato: sin traspaso");
var eqAntes=S.equipo;
PICK.eq=otro; PICK.negIdx=0; PICK.pos=S.pos;
empezarCarrera();
__ok(S.equipo===eqAntes, "precontrato: hasta fin de contrato sigues en tu club");
__ok(S.precontrato && S.precontrato.eq===otro && S.precontrato.contrato.salario===2e6, "precontrato: queda guardado con sus condiciones");
S.jornada=30; renovacionProactiva(); __ok(!S.renovProc, "precontrato: ya no hay renovación con el club actual");
/* 6 · fin de temporada: empiezas directamente en el club nuevo, sin pasar por libre */
S.jornada=38;
var fh=finHtml(); if(fh.indexOf("ERR")===0) console.log("nuevaTemporada: "+fh.slice(0,200));
__ok(S.equipo===otro, "precontrato: la temporada nueva empieza en el club del precontrato");
__ok(!S.libre && !S.precontrato, "precontrato: no quedas libre y se consume");
__ok(S.contrato.salario===2e6 && S.contrato.anos===3, "precontrato: rigen las condiciones firmadas");
__ok(S.trasp && S.trasp.tipo==="libre", "precontrato: llegas sin traspaso");
/* 7 · libre al acabar la temporada: no se evalúa ni se paga objetivo, sigue libre */
nuevo(); S.libre=true; S.libreFin=true; S.jornada=38;
var sal=S.contrato.salario;
fh=finHtml(); if(fh.indexOf("ERR")===0) console.log("nuevaTemporada libre: "+fh.slice(0,200));
__ok(S.libre===true && !S.evaluacion && S.contrato.salario===sal, "libre: al cerrar la temporada sigues libre, sin evaluación ni cambios de ficha");
/* 8 · todas las pestañas se pintan sin errores sin equipo y con precontrato */
function pintaTodo(etq){
  var fallos=[];
  ["jugador","equipo","cuentas","mercado"].forEach(function(sec){
    (SUBS[sec]||[]).forEach(function(t){
      SUB[sec]=t[0];
      try{ var f={jugador:secJugador,equipo:secEquipo,cuentas:secCuentas,mercado:secMercado}[sec]; var h=f(); if(typeof h!=="string"||!h.length) fallos.push(sec+"/"+t[0]+" vacío"); }
      catch(e){ fallos.push(sec+"/"+t[0]+": "+e.message); }
    });
  });
  __ok(!fallos.length, etq+": todas las pestañas se pintan ("+fallos.join(" | ")+")");
}
nuevo(); S.libre=true; S.libreFin=true; pintaTodo("libre");
nuevo(); S.contrato.anos=1; S.jornada=22; pintaTodo("ventana de precontrato");
S.precontrato={eq:Object.keys(EQ).filter(function(k){return k!==S.equipo;})[0], contrato:{salario:2e6,anos:3,clausula:2e7}, op:{tipo:"libre",fee:0}}; pintaTodo("con precontrato");
var h3=hubHtml(); __ok(h3.indexOf("Precontrato firmado")>=0, "con precontrato el hub lo recuerda");
console.log("SIN_EQUIPO: "+__o+" ok · "+__f+" fallos");
})();
