/* ===== TEST · auditoría 4.69.6: fichajes con nombre, semillas de texto y mesas que no pisan avisos =====
   Uso: HTML=/ruta/index.html dis/correr.sh T_AUDITORIA.js */
var __f=0, __o=0;
function __ok(c,m){ if(c) __o++; else { __f++; console.log("✘ "+m); } }
(function(){
  S=nuevoEstado("SEV","EXT","Manu",9,"D",ROLES.EXT[0].id,24);
  S.contrato={salario:500000,anos:3,clausula:12000000,prima:25000,franja:"media",exige:65};
  S.compis=crearCompis("SEV","Manu"); S.entrenador=crearEntrenador("SEV");
  MERCADO_ON=true; mercadoInit(); OVSEM=null; OVSEM_COLA=[]; NEG=null; M=null;
  /* 1 · el fichaje en tu puesto llega con nombre */
  var antes=S.compis.map(function(c){return c.n;});
  fichajeEnTuPuesto();
  var nuevo=S.compis.filter(function(c){ return antes.indexOf(c.n)<0; })[0];
  __ok(nuevo && typeof nuevo.n==="string" && nuevo.n.length>3, "fichaje en tu puesto con nombre ("+(nuevo&&nuevo.n)+")");
  __ok(OVSEM && OVSEM.x.indexOf("undefined")<0, "el aviso del fichaje no dice «undefined»");
  __ok(S.traspasos.every(function(t){ return typeof t.jugN==="string" && t.jugN; }), "los traspasos tienen nombre");
  OVSEM=null; OVSEM_COLA=[];
  /* 2 · la venta de un compañero trae un sustituto con nombre */
  S.compis.forEach(function(c){ if(c.pos!==S.pos) c.media=80; });
  ventaCompi();
  __ok(S.compis.every(function(c){ return typeof c.n==="string" && c.n; }), "tras vender, toda la plantilla tiene nombre");
  /* 3 · semillas de texto: cada cadena da su propia secuencia */
  __ok(lcgDe("a")()!==lcgDe("b")(), "lcgDe con cadenas distintas da números distintos");
  __ok(lcgDe("a")()===lcgDe("a")(), "y la misma cadena, el mismo");
  __ok(lcgDe(7)()===lcgDe(7)() && lcgDe(7)()!==lcgDe(8)(), "las semillas numéricas siguen igual");
  var ag=candidatosAgente().map(function(a){return a.n;});
  __ok(ag.length>=2 && ag.filter(function(n,i){ return ag.indexOf(n)===i; }).length===ag.length, "los agentes candidatos son personas distintas ("+ag.join(" · ")+")");
  var m1=genMarcaLocal("botas",1), m2=genMarcaLocal("botas",2), m3=genMarcaLocal("coches",1);
  var nm=function(x){ return (x&&x.n)||String(x); };
  __ok(!(nm(m1)===nm(m2) && nm(m2)===nm(m3)), "las marcas locales no salen todas iguales ("+nm(m1)+" · "+nm(m2)+" · "+nm(m3)+")");
  /* 4 · una mesa pedida con un aviso abierto espera a que se conteste */
  var corrio=0;
  ovSemana({t:"aviso", x:"x", ops:[{l:"ok", fx:function(){}}]});
  alMenu(function(){ corrio++; });
  __ok(corrio===0 && OVSEM_COLA.length===1, "con un aviso abierto, la mesa espera");
  elegirSemana(0);
  __ok(corrio===1, "al contestar el aviso, la mesa corre");
  /* 5 · una partida vieja con compañeros sin nombre se repara al cargar */
  S.compis[0].n=undefined; S.traspasos.push({jugN:undefined, de:"—", a:S.equipo, precio:1, media:70, jor:1});
  normalizarPartida();
  __ok(typeof S.compis[0].n==="string" && S.compis[0].n && S.traspasos.every(function(t){return !!t.jugN;}), "normalizarPartida repara los nombres que faltan");
  OVSEM=null; OVSEM_COLA=[];
})();
console.log("AUDITORIA: "+__o+" ok · "+__f+" fallos");
if(__f) throw new Error("fallos: "+__f);
