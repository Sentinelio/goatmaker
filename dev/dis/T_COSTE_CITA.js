/* ===== TEST · la cita ya no regala nada: el bonus es por sesiones usadas — 0.03.020 ===== */
var __f=0, __o=0;
function __ok(c,m){ if(c) __o++; else { __f++; console.log("✘ "+m); } }
guardar=function(){}; irSub=function(){}; irSec=function(){};
function nuevo(){ S=nuevoEstado("BET","LAT","B",7,"D",ROLES.LAT[0].id,22); S.contrato=S.contrato||{salario:900000,anos:3,exige:60}; S.lesion=0; S.sancion=0; S.jornada=5; S.forma=90; S.mister=55; S.conf=55; S.dia=null; S.entMister=null; S.rachaExtra=0; S.avisoMercado=null; S.avisoEntreno=null; S.car=S.car||{}; }
function cita(ll,sa){ CITA_UI={jor:S.jornada,ll:ll,sa:sa}; empezarDia(); }
function haceMister(){ while(S.dia.fase==="mister"){ if(S.dia.ultimo){ if(S.dia.ronda>=S.dia.rondas.length) diaCerrarMister(); else diaSiguienteJugada(); } else entMisterElige(0); } if(S.dia.fase==="notaMister") diaSeguir(); }
(function(){
  /* 1 · presencia sin sesiones: nada gratis */
  nuevo(); var m0=S.mister; cita(2,2); diaSaltar(); diaSaltar(); haceMister(); diaSaltar(); diaSaltar();
  var mDia=S.mister-m0-Math.round((S.dia.nota-6)*1.5);
  __ok(Math.abs(mDia)<1e-9, "saltar las 4 horas no da míster por presencia (extra sobre la nota: "+mDia+")");
  __ok(S.rachaExtra===0, "sin sesiones no hay racha de carga");
  /* 2 · cada sesión usada suma */
  nuevo(); m0=S.mister; cita(2,0); diaSesion("tecnica"); diaSesion("tactica"); haceMister();
  __ok(Math.abs((S.mister-m0)-(3+Math.round((S.dia.nota-6)*1.5)))<1e-9, "dos sesiones reales suman +3 de míster antes de la nota ("+(S.mister-m0)+")");
  __ok(S.rachaExtra===1, "dos sesiones reales = una semana de racha");
  /* 3 · la cuarta extra solo con cuatro reales */
  nuevo(); cita(2,2); diaSaltar(); diaSaltar(); haceMister(); diaSaltar(); diaSesion("tecnica");
  __ok(S.dia.despues[1].extra===false, "tres huecos libres + una sesión real: no es extra");
  nuevo(); cita(2,2); diaSesion("tecnica"); diaSesion("mental"); haceMister(); diaSesion("tactica"); diaSesion("tecnica");
  __ok(S.dia.despues[1].extra===true, "cuatro sesiones reales: la última es extra");
  /* 4 · el aviso del entreno no pisa el de mercado */
  nuevo(); S.avisoMercado="Oferta del Sevilla sobre la mesa."; cita(0,0); haceMister(); finDia();
  __ok(S.avisoMercado==="Oferta del Sevilla sobre la mesa." && !!S.avisoEntreno, "acabar el día deja el aviso de mercado y pone el suyo");
  nuevo(); S.avisoMercado="Arranca la liga: el mercado queda cerrado."; cerrarEntrenoPendiente();
  __ok(S.avisoMercado==="Arranca la liga: el mercado queda cerrado." && /entreno/.test(S.avisoEntreno), "faltar al entreno tampoco pisa el aviso de mercado");
  console.log("COSTE_CITA: "+__o+" ok · "+__f+" fallos");
})();
