var __f=0,__o=0; function __ok(c,m){ if(c) __o++; else { __f++; console.log("✘ "+m); } }
var DOM={}; function el(id){ if(!DOM[id]) DOM[id]={innerHTML:"",classList:{add:function(){},remove:function(){}},getElementsByTagName:function(){return [];},getAttribute:function(){return "";}}; return DOM[id]; }
$=function(id){ return el(id); }; window.scrollTo=function(){}; guardar=function(){}; renderHub=function(){};
S=nuevoEstado("BET","LAT","B",7,"D",ROLES.LAT[0].id,22); S.temporada=3; S.jornada=38; S.division="1";
S.contrato={salario:1e6,anos:0,clausula:1e7,exige:60,firmadoT:2}; S.libre=true; S.libreFin=true;
var otro=Object.keys(EQ).filter(function(k){return k!==S.equipo;})[0];
aplicarTraspaso(otro, {salario:1.5e6,anos:3,clausula:1e7,exige:60}, {tipo:"libre",fee:0});
__ok(S.equipo===otro && !S.libre, "tras firmar, ya tienes club");
var err=null; try{ finTemporada(); }catch(e){ err=e.message; }
__ok(!err, "finTemporada con el club nuevo no falla: "+err);
var h=el("ov-fin-inner").innerHTML;
__ok(h.indexOf("Continuar")>=0 && h.indexOf("nuevaTemporada()")>=0, "el botón Continuar está en el contenido");
console.log("FIN38: "+__o+" ok · "+__f+" fallos · longitud "+h.length);
