/* ===== TEST · avisos fuera del partido (la cita del míster vive ahora en T_DIA.js) =====
   Uso: HTML=/ruta/index.html dis/correr.sh T_CITA_AVISOS.js
   CITA: la barra tiene 35 % llegada · 30 % entreno · 35 % salida; cada hora da un ejercicio (máx. 4 por lado);
         al acortar la hora se quitan los ejercicios sobrantes; confirmar cobra forma/míster/fama una vez.
   AVISOS: con un partido abierto, un aviso se espera; al cerrar sale; con la semana en curso o una mesa abierta, también espera. */
var __f=0, __o=0;
function __ok(c,m){ if(c) __o++; else { __f++; console.log("✘ "+m); } }
/* la cita (barra, sesiones antes/después y entreno del míster) se prueba en T_DIA.js desde 0.03.010 */
S=nuevoEstado("BET","EXT","B",7,"D",ROLES.EXT[0].id,22); S.contrato=S.contrato||{salario:900000,anos:3,exige:60}; S.lesion=0; S.jornada=5;
(function(){
  /* avisos: partido abierto → espera; cerrado → sale */
  OVSEM=null; OVSEM_COLA=[]; SEMANA_CORRE=false; NEG=null;
  M={cerrado:false, prueba:false};
  ovSemana({t:"aviso A", x:"x", ops:[{l:"ok", fx:function(){}}]});
  __ok(OVSEM===null && OVSEM_COLA.length===1, "un aviso durante el partido se espera");
  M.cerrado=true; drenarOvsem();
  __ok(OVSEM && OVSEM.t==="aviso A" && OVSEM_COLA.length===0, "al cerrar el partido el aviso sale");
  elegirSemana(0);
  OVSEM=null;
  /* semana en curso: la mesa y el aviso esperan; luego sale la mesa y después el aviso */
  M=null; SEMANA_CORRE=true; var ran=0;
  alMenu(function(){ ran++; });
  ovSemana({t:"aviso B", x:"x", ops:[{l:"ok", fx:function(){}}]});
  __ok(ran===0 && OVSEM===null && OVSEM_COLA.length===2, "con la semana en curso, mesa y aviso esperan");
  SEMANA_CORRE=false; drenarOvsem();
  __ok(ran===1 && OVSEM && OVSEM.t==="aviso B", "al terminar la semana corre la mesa y después el aviso");
  OVSEM=null; OVSEM_COLA=[]; NEG=null;
  /* una negociación abierta también retiene los avisos */
  NEG={modo:"oferta"}; ovSemana({t:"aviso C", x:"x", ops:[{l:"ok", fx:function(){}}]});
  __ok(OVSEM===null && OVSEM_COLA.length===1, "con una mesa abierta el aviso espera");
  NEG=null; drenarOvsem();
  __ok(OVSEM && OVSEM.t==="aviso C", "al cerrar la mesa el aviso sale");
  OVSEM=null; OVSEM_COLA=[]; M=null;
})();
console.log("CITA_AVISOS: "+__o+" ok · "+__f+" fallos");
if(__f) throw new Error("fallos: "+__f);
