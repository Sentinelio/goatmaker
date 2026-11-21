/* ===== TEST · sin contrato: nadie renueva por ti; la renovación pasa por la mesa y decides tú (0.03.040) ===== */
var __f=0,__o=0; function __ok(c,m){ if(c) __o++; else { __f++; console.log("✘ "+m); } }
guardar=function(){}; irSub=function(){}; irSec=function(){}; renderHub=function(){};
var __mesa=0; abrirMesaRenov=function(){ __mesa++; };
cerrarOvsemDom=function(){}; regSemana=function(){};
S=nuevoEstado("BET","LAT","B",7,"D",ROLES.LAT[0].id,22);
S.temporada=2; S.mister=60;
S.contrato={salario:1e6,anos:0,clausula:1e7,exige:60,firmadoT:1};
S.libre=true; S.libreFin=true; S.ofertasVerano=true;
/* 1 · el botón de renovar abre la mesa, no renueva */
quedarmeMercado();
__ok(__mesa===0, "sin contrato no hay mesa de renovación: solo se renueva perteneciendo al club");
__ok(S.libre===true && S.contrato.anos===0, "pulsar renovar sin club no renueva nada por ti");
/* 2 · firmar en la mesa te saca del mercado */
NEG={modo:"renov", club:S.equipo, salario:1100000, anos:2, clausula:2400000, extras:{}, base:{salario:1100000}};
cerrarNegConAcuerdo(NEG);
__ok(S.contrato.anos===2 && S.contrato.salario===1100000, "firmar en la mesa fija tus nuevos términos");
__ok(S.libre===null && S.libreFin===null && S.ofertasVerano===null, "firmar la renovación te saca del mercado");
/* 3 · al empezar la liga sin contrato, sigues libre */
S.contrato={salario:1e6,anos:0,clausula:1e7,exige:60,firmadoT:1};
S.libre=true; S.libreFin=true; S.ofertasVerano=true;
console.log("SIN_CONTRATO: "+__o+" ok · "+__f+" fallos");
