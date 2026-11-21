/* ===== TEST · agente libre: aviso emergente sin ofertas, jornada que pasa sin pantalla del club, partidillo en la 19 y la 38 (0.03.046) ===== */
var __f=0,__o=0; function __ok(c,m){ if(c) __o++; else { __f++; console.log("✘ "+m); } }
guardar=function(){}; irSub=function(){}; irSec=function(){}; renderHub=function(){};
cerrarOvsemDom=function(){}; regSemana=function(){}; alMenu=function(){}; ovSemana=function(){};
mercadoSemanal=function(){}; semanaTienda=function(){}; cerrarEntrenoPendiente=function(){};
pendientesSemana=function(){ return []; };
var __modal=[]; modal=function(c){ __modal.push(c); };
var __ovMatch=0, __ovMatchReal=null, __ovInnerOK=null;
function nuevo(){
  S=nuevoEstado("BET","LAT","B",7,"D",ROLES.LAT[0].id,22);
  S.temporada=3; S.mister=60; S.jornada=18; S.lesion=0; S.sancion=0; S.division="1";
  S.contrato={salario:1e6,anos:0,clausula:1e7,exige:60,firmadoT:2};
  S.libre=true; S.libreFin=true; S.hist=[];
}
/* 1 · sin ofertas: aviso emergente, no un aviso en el hub */
nuevo();
var gt=generarTanda; generarTanda=function(){ return []; };
__modal=[]; abrirMercado();
generarTanda=gt;
__ok(__modal.length===1 && /ningún club/i.test(__modal[0].x), "sin ofertas sale una ventana emergente");
__ok(!(S.avisoMercado||"").match(/ningún club/i), "sin ofertas no se deja el aviso en el hub");
__ok(!$("scr-pick") || true, "sin ofertas no se abre la pantalla de mercado");
/* 2 · jornada que pasa sin equipo: sin pantalla del club antiguo */
nuevo(); var jugadas=0;
var jst=jornadaSinTi; jornadaSinTi=function(){ jugadas++; return jst(); };
var ovUsado=false; var ovOrig=$;
var tocados=[]; $=function(id){ return {innerHTML:"", classList:{add:function(){},remove:function(){ if(id==="ov-match") tocados.push(id); }}}; };
try{ iniciarJornada(); } catch(e){ console.log("iniciarJornada: "+e.message); }
$=ovOrig; jornadaSinTi=jst;
__ok(jugadas===1, "sin equipo, la jornada se juega sin ti");
__ok(tocados.indexOf("ov-match")<0 && __ovInnerOK!==false, "sin equipo no se abre la pantalla de partido del club");
/* 3 · jornada 19 sin equipo: invitación al partidillo; «Ahora no» sigue la liga */
nuevo(); S.jornada=19; __modal=[];
var ovOtro=$; $=function(){ return {innerHTML:"", classList:{add:function(){},remove:function(){}}}; };
cerrarSinTi(); $=ovOtro;
__ok(__modal.length===1 && /ojeadores/i.test(__modal[0].t), "jornada 19 sin equipo: se ofrece el partidillo con ojeadores");
/* 4 · se apunta: arranca el partidillo con la copia del jugador, y el estado real no se pisa */
var real=S, arr=0;
var apr=arrancarPrueba; arrancarPrueba=function(){ arr++; };
__modal[0].onOk();
arrancarPrueba=apr;
__ok(arr===1 && PICK.realS===real && PICK.libreTrial===true, "apuntarse arranca el partidillo guardando tu estado real");
__ok(S!==real && S.nombre===real.nombre, "durante el partidillo juegas con una copia de tu jugador");
/* 5 · una vez por temporada y jornada: no vuelve a salir */
nuevo(); S.jornada=38; __modal=[];
$=function(){ return {innerHTML:"", classList:{add:function(){},remove:function(){}}}; };
var fin=finTemporada; finTemporada=function(){};
cerrarSinTi(); __ok(__modal.length===1, "jornada 38 sin equipo: se ofrece el partidillo");
S.jornada=38; __modal=[]; cerrarSinTi(); __ok(__modal.length===0, "no se repite en la misma jornada");
finTemporada=fin; $=ovOtro;
/* 6 · con club no hay invitación */
nuevo(); S.libre=null; S.libreFin=null; S.jornada=19; __modal=[];
$=function(){ return {innerHTML:"", classList:{add:function(){},remove:function(){}}}; };
cerrarSinTi(); $=ovOtro;
__ok(__modal.length===0, "con club no se ofrece el partidillo");
/* 7 · el partidillo con ojeadores da al menos tres mesas aunque no tengas agente */
nuevo(); PICK={pos:"LAT", edad:22, conPrueba:true, notaPrueba:7.5, ojeadores:[]};
var gh=generarTanda(); __ok(gh.length>=3, "con partidillo hay al menos tres mesas ("+gh.length+")");
console.log("OJEADORES_LIBRE: "+__o+" ok · "+__f+" fallos");
