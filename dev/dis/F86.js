/* ===== F86 · Ajustes que funcionan sin partida + taller de pruebas APAGADO por defecto (v4.66.0) =====
   Uso:  cd <carpeta de trabajo>; TAIL=30 bash /mnt/user-data/outputs/dis/correr.sh F86.js 1
   Fija tres reglas del usuario:
     · los cheats y atajos NACEN apagados y solo se encienden desde Ajustes › Cheats (y se recuerdan en el dispositivo);
     · ninguna pestaña de Ajustes puede dar por hecho que hay una carrera en marcha;
     · una situación propia sobrevive al guardado/recarga/importación (el JSON pierde su función cond).      */
renderHub=function(){};
var __fs=require("fs");
var NOK=0, FALLOS=[];
function ok(c,m){ if(c) NOK++; else FALLOS.push(m); }
function sinLanzar(f,m){ try{ f(); NOK++; }catch(e){ FALLOS.push(m+" → LANZA: "+e.message); } }
function tick(){ return new Promise(function(r){ setImmediate(r); }); }
function nuevoS(){
  S=nuevoEstado("SEV","DC","Manu",9,"D","clasico",22);
  S.compis=crearCompis("SEV","Manu"); S.entrenador=crearEntrenador("SEV");
  S.contrato={salario:500000,anos:3,clausula:12000000,prima:25000,franja:"media",exige:65};
  S.v=VERSION;
}
function cuerpo(){ return $("sec-body").innerHTML; }
function cfgGuardado(){ try{ return JSON.parse(__LS["lap1-cfg"]); }catch(e){ return null; } }

(async function(){
  var HTML=__fs.readFileSync(process.env.HTML||"/mnt/user-data/outputs/la-primera.html","utf8");

  /* ---------- A · de fábrica: apagado ---------- */
  ok(CHEATS_ON===false, "A1 el taller nace apagado (valor por defecto)");
  var est=(HTML.match(/onclick="ch[A-Z][A-Za-z0-9]*\(/g)||[]);
  ok(est.length===1 && est[0]==='onclick="chSaltarPrueba(', "A2 en el HTML estático solo queda UN atajo de taller («Saltar la prueba»); hay "+est.length+": "+est.join(" "));
  ok(/<button id="btn-chsaltar" class="[^"]*\bhidden\b[^"]*"[^>]*onclick="chSaltarPrueba\(\)"/.test(HTML), "A3 ese botón nace con la clase hidden");
  ok(/\.hidden\{display:none!important\}/.test(HTML), "A4 la clase hidden oculta de verdad (display:none!important)");

  delete __LS["lap1-cfg"];
  await cargarAjustes();
  ok(CHEATS_ON===false, "A5 sin ajustes guardados el taller sigue apagado");
  ok($("btn-chsaltar").classList.contains("hidden"), "A6 el botón «Saltar la prueba» queda oculto tras cargar los ajustes");

  /* todos los trucos que existen en el código están en la lista (si alguien añade uno, este test lo obliga a pasar por la puerta) */
  var iBloque=HTML.indexOf("/* ===== CHEATS: el taller de pruebas"), fBloque=HTML.indexOf("function secCheats(");
  ok(iBloque>0 && fBloque>iBloque, "A7a el bloque de trucos tiene sus marcas (inicio y secCheats)");
  var BLOQUE=HTML.slice(iBloque,fBloque);   /* solo lo que vive dentro del taller: chRefreshUI_ y compañía son de otros sistemas */
  var DISCO=[], re=/function (ch[A-Z]\w*)\(/g, m;
  while((m=re.exec(BLOQUE))) if(DISCO.indexOf(m[1])<0) DISCO.push(m[1]);
  var NO_TRUCO=["chAviso","chRefresca"];
  var TRUCOS=[["chAttrs",[5]],["chAttrs90",[]],["chEjes",[5]],["chVital",[]],["chVestuario",[]],["chFama",[]],["chDinero",[1000000]],
    ["chCurar",[]],["chLesion",[]],["chVicios",[10]],["chCapricho",[]],["chSaciar",[]],["chRumor",[]],["chOferta",[]],["chRenovar",[]],
    ["chCooldowns",[]],["chOfertaPatro",[]],["chContraoferta",[]],["chSimular",[5,true]],["chSimular",[5,false]],["chVerano",[]],["chSaltarPrueba",[]]];
  var CONOCIDOS=TRUCOS.map(function(t){return t[0];}).concat(NO_TRUCO);
  DISCO.forEach(function(n){ ok(CONOCIDOS.indexOf(n)>=0, "A7 truco «"+n+"» existe en el código pero no está en la lista del test"); });
  TRUCOS.forEach(function(t){ ok(DISCO.indexOf(t[0])>=0, "A8 el test nombra «"+t[0]+"» pero ya no existe en el código"); });

  nuevoS(); PICK=null; M=null; PARTIDA_ABIERTA=true;
  var fotoS=JSON.stringify(S), fotoLS=JSON.stringify(__LS);
  TRUCOS.forEach(function(t){
    if(t[0]==="chSaltarPrueba") return;
    var f=eval(t[0]);
    sinLanzar(function(){ f.apply(null,t[1]); }, "A9 "+t[0]+"("+t[1].join(",")+") con el taller apagado");
  });
  ok(JSON.stringify(S)===fotoS, "A10 con el taller apagado NINGÚN truco toca la partida");
  ok(JSON.stringify(__LS)===fotoLS, "A11 con el taller apagado NINGÚN truco escribe en el almacén");

  S=null; PICK={pos:"EXT",rol:"invertido",pierna:"A",lado:null,nombre:"Manu",dorsal:9,edad:20,esperas:0,attrBonus:0,ojeadores:[],tanda:null};
  sinLanzar(function(){ chSaltarPrueba(); finPruebaCheat(); }, "A12 «Saltar la prueba» con el taller apagado");
  ok(PICK.notaPrueba===undefined && PICK.tanda===null && S===null, "A13 «Saltar la prueba» no hace nada con el taller apagado");

  /* ---------- B · el interruptor ---------- */
  S=null; PICK=null; M=null; PARTIDA_ABIERTA=false;
  SUB.ajustes="cheats"; irSec("ajustes");
  var b=cuerpo();
  ok(/toggleCheats\(\)/.test(b) && /APAGADO/.test(b), "B1 Cheats apagado: ofrece el interruptor y dice APAGADO");
  ok(!/onclick="ch[A-Z]/.test(b) && !/verCatCheat/.test(b) && !/genOfertaPatro/.test(b), "B2 Cheats apagado: ningún truco a la vista");
  ok(b.indexOf("●")<0, "B3 apagado: el chip «Cheats» no lleva marca");

  toggleCheats(); await tick();
  ok(CHEATS_ON===true, "B4 el interruptor enciende el taller");
  ok(!$("btn-chsaltar").classList.contains("hidden"), "B5 encendido: el botón «Saltar la prueba» se muestra");
  var cfg=cfgGuardado();
  ok(cfg && cfg.cheats===true, "B6 el encendido se guarda en el dispositivo");
  b=cuerpo();
  ok(/ENCENDIDO/.test(b) && b.indexOf("●")>=0, "B7 encendido: lo dice y el chip «Cheats» lleva la marca ●");
  ok(/Necesita una partida/.test(b), "B8 encendido sin partida ni prueba: lo explica en vez de dejar la pestaña vacía");

  nuevoS(); PARTIDA_ABIERTA=true; irSub("ajustes","cheats"); b=cuerpo();
  ok((b.match(/verCatCheat\(/g)||[]).length>=5, "B9 encendido con partida: aparecen las categorías de trucos");
  var d0=S.dinero||0; chDinero(1000);
  ok(S.dinero===d0+1000, "B10 encendido: un truco funciona (chDinero +1.000)");
  var j0=S.jornada; chSimular(2,false);
  ok(S.jornada>j0, "B11 encendido: chSimular avanza jornadas ("+j0+" → "+S.jornada+")");
  ok(Object.keys(S).indexOf("cheats")<0 && JSON.stringify(S).indexOf('"cheats"')<0, "B12 el interruptor NO viaja dentro de la partida");

  /* recargar el navegador: lo encendido se recuerda */
  CHEATS_ON=false; aplicarCheats();
  await cargarAjustes();
  ok(CHEATS_ON===true && !$("btn-chsaltar").classList.contains("hidden"), "B13 tras reabrir el juego el taller sigue encendido");

  /* empezar de cero no toca los ajustes del dispositivo */
  await guardar();
  ok(!!__LS["lap1-save"], "B14 (control) hay partida guardada antes de empezar de cero");
  await nuevaPartida();
  ok(!__LS["lap1-save"], "B15 «Empezar de cero» borra la partida…");
  ok(CHEATS_ON===true && (cfgGuardado()||{}).cheats===true, "B16 …pero no los ajustes del dispositivo");

  /* apagarlo */
  S=null; PICK=null; PARTIDA_ABIERTA=false;
  irSub("ajustes","cheats"); toggleCheats(); await tick();
  ok(CHEATS_ON===false && $("btn-chsaltar").classList.contains("hidden"), "B17 apagar: vuelve a ocultarse todo");
  ok((cfgGuardado()||{}).cheats===false, "B18 apagar: también se guarda");
  CHEATS_ON=true; await cargarAjustes();
  ok(CHEATS_ON===false, "B19 tras reabrir el juego sigue apagado");
  nuevoS(); fotoS=JSON.stringify(S); chDinero(5); chSimular(3,true);
  ok(JSON.stringify(S)===fotoS, "B20 apagado otra vez: los trucos vuelven a ser inertes");
  PARTIDA_ABIERTA=true; irSub("ajustes","cheats"); b=cuerpo();
  ok(!/onclick="ch[A-Z]/.test(b) && !/verCatCheat/.test(b) && !/genOfertaPatro/.test(b) && /toggleCheats\(\)/.test(b), "B20b Cheats apagado CON partida en marcha: solo el interruptor, ningún truco");

  /* un archivo de ajustes roto o raro nunca enciende nada */
  var INVALIDOS=[["{{{","JSON roto"],[JSON.stringify({v:1,cheats:"yes"}),"cheats:'yes'"],[JSON.stringify({v:1,cheats:1}),"cheats:1"],[JSON.stringify({v:1}),"sin clave"],["null","null"]];
  for(var q=0;q<INVALIDOS.length;q++){
    __LS["lap1-cfg"]=INVALIDOS[q][0]; CHEATS_ON=true;
    await cargarAjustes();
    ok(CHEATS_ON===false, "B21 ajustes inválidos ("+INVALIDOS[q][1]+") → taller apagado");
  }

  /* ---------- C · Ajustes sin partida ---------- */
  CHEATS_ON=false; aplicarCheats();
  S=null; M=null; PICK=null; PARTIDA_ABIERTA=false;
  SUBS.ajustes.forEach(function(t){
    sinLanzar(function(){ irSub("ajustes",t[0]); }, "C1 pestaña «"+t[0]+"» sin partida");
    ok(cuerpo().length>200, "C2 pestaña «"+t[0]+"» sin partida no queda vacía ("+cuerpo().length+" car.)");
  });
  irSub("ajustes","partida"); b=cuerpo();
  ok(/importar\(\)/.test(b) && !/exportar\(\)/.test(b) && !/toggleDebug/.test(b), "C3 Partida sin carrera: solo ofrece importar");
  irSub("ajustes","contenido"); b=cuerpo();
  ok(/Necesitan una carrera|necesitan una carrera/.test(b) && !/irArbol\(\)/.test(b) && !/irEditor\(\)/.test(b), "C4 Contenido sin carrera: lo explica y no ofrece lo que no puede abrir");
  irSub("ajustes","info"); b=cuerpo();
  ok(/Versión/.test(b) && b.indexOf("v"+VERSION)>=0 && b.indexOf("undefined")<0 && b.indexOf("NaN")<0, "C5 Información sin carrera: pinta versión y datos sin «undefined»/«NaN»");

  ["exportar()","toggleDebug()","irArbol()","irEditor()","guardarSituacion()","exportarContenido()","pedirNuevaPartida()"].forEach(function(c){
    S=null; sinLanzar(function(){ eval(c); }, "C6 «"+c+"» sin carrera");
  });
  ok(S===null, "C7 ninguna de esas rutas inventa una partida");

  nuevoS(); PARTIDA_ABIERTA=true;
  irSub("ajustes","partida"); b=cuerpo();
  ok(/exportar\(\)/.test(b) && /toggleDebug\(\)/.test(b) && /importar\(\)/.test(b) && /pedirNuevaPartida\(\)/.test(b), "C8 Partida con carrera: exportar, debug, importar y empezar de cero");
  irSub("ajustes","contenido"); b=cuerpo();
  ok(/irArbol\(\)/.test(b) && /irEditor\(\)/.test(b), "C9 Contenido con carrera: árbol y editor");
  irSub("ajustes","info"); b=cuerpo();
  ok(/Temporada/.test(b), "C10 Información con carrera: muestra la temporada");
  sinLanzar(function(){ irArbol(); }, "C11 el árbol de decisiones se abre con carrera");
  sinLanzar(function(){ irEditor(); }, "C12 el editor se abre con carrera");

  /* ---------- D · la situación propia sobrevive ---------- */
  nuevoS(); PARTIDA_ABIERTA=true; M=null;
  irEditor();
  $("e-id").value="mi-sit"; $("e-t").value="Mi situación"; $("e-x").value="Algo pasa."; $("e-o1-l").value="Hacer algo"; $("e-o1-ok").value="Bien."; $("e-o1-mid").value="Normal."; $("e-o1-ko").value="Mal.";
  guardarSituacion();
  ok(S.custom.length===1 && typeof S.custom[0].cond==="function", "D1 creada con el editor: la situación propia tiene cond");
  await guardar(); S=null; await cargar();
  ok(S && S.custom.length===1 && typeof S.custom[0].cond==="function", "D2 tras recargar la partida la situación propia conserva su cond");
  var err=null; try{ for(var j=0;j<4;j++) jugarJornada(j); }catch(e){ err=e; }
  ok(!err, "D3 la partida recargada juega 4 jornadas sin romperse"+(err? " → "+err.message : ""));

  var foto=JSON.parse(JSON.stringify(S));
  ok(foto.custom.length===1 && foto.custom[0].cond===undefined, "D4 (control) el JSON exportado no trae la función cond");
  nuevoS();
  var r1=adoptarPartida(foto);
  ok(r1===true && S.custom.length===1 && typeof S.custom[0].cond==="function", "D5 importar: la situación propia vuelve con cond");
  var prev=S;
  ok(adoptarPartida({})===false && adoptarPartida(null)===false && adoptarPartida({v:1})===false && S===prev, "D6 importar algo que no es una partida: lo rechaza y no toca la carrera abierta");
  var _r=rehidratarCustom; rehidratarCustom=function(){ throw new Error("boom"); };
  var lanzo=false; try{ adoptarPartida(JSON.parse(JSON.stringify(prev))); }catch(e){ lanzo=true; }
  rehidratarCustom=_r;
  ok(lanzo && S===prev, "D7 importar un JSON que revienta al normalizar: no se lleva por delante la carrera abierta");

  /* una situación propia rota (sin opciones) se descarta en vez de reventar el motor */
  var roto=JSON.parse(JSON.stringify(prev)); roto.custom=[{id:"x",t:"x",o:[]},null,{id:"y",o:[{l:"a"}],t:"y"}];
  adoptarPartida(roto);
  ok(S.custom.length===1 && S.custom[0].id==="y" && typeof S.custom[0].cond==="function", "D8 las situaciones propias vacías o rotas se descartan al cargar");
  ok(S.custom[0].o[0].fx && typeof S.custom[0].o[0].fx.inst==="object" && S.custom[0].o[0].ok==="", "D9 una opción sin efectos ni desenlaces se repara con la forma que espera el motor");
  sinLanzar(function(){ irArbol(); }, "D10 el árbol de decisiones lee la situación reparada sin lanzar");
  var sinTexto=JSON.parse(JSON.stringify(prev)); sinTexto.custom=[{id:"z",t:"z",o:[{l:""},{x:1},null]}];
  adoptarPartida(sinTexto);
  ok(S.custom.length===0, "D11 una situación propia sin ninguna opción con texto de botón se descarta entera");

  /* ---------- E · el vigilante de «pantalla sin pintar» no tapa a quien ya navegó ---------- */
  var vig=__TIMERS.filter(function(x){ return x.ms===2000 && /pintado/.test(String(x.fn)); })[0];
  ok(!!vig, "E1 existe el vigilante de pantalla a los 2 s");
  if(vig){
    var puestos=[], _ap=document.body.appendChild; document.body.appendChild=function(c){ puestos.push(c); return c; };
    ["scr-title","scr-hub","scr-sec","scr-pick","scr-pos"].forEach(function(id){ $(id).offsetHeight=0; });
    $("scr-sec").offsetHeight=300; vig.fn();
    ok(puestos.length===0, "E2 con Ajustes a la vista (entraste en <2 s) el vigilante NO tapa la pantalla");
    $("scr-sec").offsetHeight=0; $("scr-hub").offsetHeight=500; vig.fn();
    ok(puestos.length===0, "E3 con tu partida a la vista el vigilante NO tapa la pantalla");
    $("scr-hub").offsetHeight=0; vig.fn();
    ok(puestos.length===1, "E4 con TODO sin pintar (visor roto) sí avisa");
    document.body.appendChild=_ap;
    ["scr-title","scr-hub","scr-sec","scr-pick","scr-pos"].forEach(function(id){ $(id).offsetHeight=100; });
  }

  if(!FALLOS.length) console.log("✔ F86: "+NOK+" comprobaciones, 0 fallos");
  else { console.log("✘ F86: "+FALLOS.length+" fallo(s) de "+(NOK+FALLOS.length)); FALLOS.forEach(function(x){ console.log("  · "+x); }); process.exitCode=1; }
})().catch(function(e){ console.log("✘ F86 revienta: "+(e&&e.stack||e)); process.exitCode=1; });
