/* ===== TEST · el club actúa por sus canales: renovación si te quiere, venta o rescisión (0.03.038) ===== */
var __f=0,__o=0; function __ok(c,m){ if(c) __o++; else { __f++; console.log("✘ "+m); } }
guardar=function(){}; irSub=function(){}; irSec=function(){}; renderHub=function(){};
var __ov=null, __menu=null, __ab=0;
ovSemana=function(c){ __ov=c; }; alMenu=function(f){ __menu=f; };
abrirMercado=function(){ __ab++; };
regSemana=function(){};
S=nuevoEstado("BET","LAT","B",7,"D",ROLES.LAT[0].id,22);
S.temporada=2; S.mister=60; S.dinero=1e6;
/* 1 · renovación: el club no te ve en sus planes → sin mesa, aviso una vez */
S.contrato={salario:1e6,anos:1,clausula:1e7,exige:250}; S.jornada=25; S.renovProc=null; __menu=null;
renovacionProactiva();
__ok(__menu===null, "sin interés del club no hay mesa de renovación");
__ok(/no te incluye/.test(S.avisoMercado||""), "el club avisa de que no te incluye");
/* 2 · renovación: el club te quiere → mesa de renovación */
S.contrato.exige=0; __menu=null; renovacionProactiva();
__ok(typeof __menu==="function", "con interés del club se abre la mesa de renovación");
/* 3 · rescisión: aceptar paga la indemnización y te deja libre */
S.contrato={salario:1e6,anos:2,clausula:1e7,exige:60}; S.libre=null; S.libreFin=null; S.ofertasVerano=null; S.dinero=0;
clubTeRescinde();
__ok(__ov && __ov.ops.length===2, "la rescisión llega como decisión con dos opciones");
__ov.ops[0].fx();
__ok(S.dinero===500000, "la indemnización es medio año de ficha ("+S.dinero+")");
__ok(S.libre===true && S.libreFin===true && S.contrato.anos===0, "tras aceptar quedas libre");
/* 4 · rescisión rechazada: sigues y pierdes algo de moral */
S.contrato={salario:1e6,anos:2,clausula:1e7,exige:60}; S.libre=null; S.mister=60;
clubTeRescinde(); __ov.ops[1].fx();
__ok(S.libre===null && S.mister===58, "seguir en el club: no quedas libre y baja la relación");
/* 5 · venta: escuchar abre el mercado oficial, negarse baja la relación */
__ab=0; clubPonTeEnVenta(); __ov.ops[0].fx();
__ok(__ab===1, "escuchar las ofertas abre el mercado");
S.mister=60; clubPonTeEnVenta(); __ov.ops[1].fx();
__ok(S.mister===57, "negarse a salir baja la relación");
console.log("CLUB: "+__o+" ok · "+__f+" fallos");
