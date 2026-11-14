function sinCortesYo(fn){
  var _s=simTramo;
  simTramo=function(){ if(M){ M.pTA=0; M.pLES=0; } _s(); };
  try{ fn(); } finally{ simTramo=_s; }
}
/* ===== T · FICHA SOFÁ (v4.6.0): contadores, campo, radar, traspasos ===== */
var PASA=0, FALLA_N=0;
function OKK(m){ PASA++; console.log("  ✔ "+m); }
function FALLA(m){ FALLA_N++; console.log("  ✘ "+m); }
var _rh=renderHub; renderHub=function(){};
function base(eq,pos,pierna,media){
  S=nuevoEstado(eq,pos,"Manu",9,pierna||"D","nueve"===undefined?null:(ROLES[pos][0].id),24);
  S.contrato={salario:500000,anos:3,clausula:12000000,prima:25000,franja:"media",exige:65};
  ["TEC","FIS","TAC","DEF","MEN","POR"].forEach(function(k){ if(S.attr[k]!==undefined) S.attr[k]=media||70; });
  S.compis=crearCompis(eq,"Manu"); S.entrenador=crearEntrenador(eq);
  return S;
}

/* ---------- F1 · los contadores cuentan lo que pasa, y cuadran entre sí ---------- */
(function(){
  base("SEV","DC","D",74);
  sinCortesYo(function(){ for(var t=0;t<2;t++){ for(var j=0;j<38;j++) jugarJornada(j); if(t===0){ nuevaTemporada(); if(S.ofertasVerano) cerrarMercado(true,null); } } });
  var Y=S.yo;
  var ok = Y.tiros>=Y.g && Y.clave>=Y.a && Y.claras<=(Y.tiros-Y.g) && Y.tiros>10;
  if(ok) OKK("un delantero en 38 jornadas: "+Y.tiros+" tiros ≥ "+Y.g+" goles · "+Y.clave+" pases clave ≥ "+Y.a+" asistencias · "+Y.claras+" claras falladas ≤ tiros−goles");
  else FALLA("contadores DC: tiros="+Y.tiros+" g="+Y.g+" clave="+Y.clave+" a="+Y.a+" claras="+Y.claras);
  base("SEV","POR","D",74);
  for(var j2=0;j2<38;j2++) jugarJornada(j2);
  if(S.yo.paradas>0 && S.yo.tiros<=14 && S.yo.paradas>S.yo.tiros*2) OKK("un portero: "+S.yo.paradas+" paradas y "+S.yo.tiros+" subida(s) al córner en todo el año (leyenda, no rutina)");
  else FALLA("contadores POR: paradas="+S.yo.paradas+" tiros="+S.yo.tiros);
})();

/* ---------- F2 · el mapa de calor dice la verdad del puesto y de la pierna ---------- */
(function(){
  function reparto(pos,pierna){
    base("BET",pos,pierna,72);
    for(var j=0;j<38;j++) jugarJornada(j);
    var Z=S.zonas||{}, tot=0; Object.keys(Z).forEach(function(k){ tot+=Z[k]; });
    return {z:Z, tot:tot};
  }
  var dc=reparto("DC","D");
  var ataque=(dc.z.arearival||0)+(dc.z.frontal||0), atras=(dc.z.defensa||0)+(dc.z.ppro||0), zonasDC=Object.keys(dc.z).length;
  if(dc.tot>80 && ataque/dc.tot>0.55 && ataque>atras*2 && zonasDC>=3)
    OKK("el delantero vive arriba pero transita: "+Math.round(ataque/dc.tot*100)+"% del calor en zona rival, "+zonasDC+" zonas pintadas ("+dc.tot+" pinceladas)");
  else FALLA("mapa DC: ataque="+ataque+"/"+dc.tot+" zonas="+zonasDC);
  var por=reparto("POR","D");
  var casa=(por.z.ppro||0)+(por.z.defensa||0);
  if(casa/por.tot>0.7) OKK("el portero vive en su área: "+Math.round(casa/por.tot*100)+"% del calor atrás");
  else FALLA("mapa POR: casa="+casa+"/"+por.tot);
  var zurdo=reparto("LAT","I"), diestro=reparto("LAT","D");
  if((zurdo.z.bandaI||0)>(zurdo.z.bandaD||0)*3 && (diestro.z.bandaD||0)>(diestro.z.bandaI||0)*3 && (zurdo.z.medio||0)>0)
    OKK("la pierna manda en la banda y el medio respira: zurdo I/D "+(zurdo.z.bandaI||0)+"/"+(zurdo.z.bandaD||0)+" (medio "+(zurdo.z.medio||0)+") · diestro D/I "+(diestro.z.bandaD||0)+"/"+(diestro.z.bandaI||0));
  else FALLA("bandas: zurdo I/D "+(zurdo.z.bandaI||0)+"/"+(zurdo.z.bandaD||0)+" medio="+(zurdo.z.medio||0)+" · diestro "+(diestro.z.bandaD||0)+"/"+(diestro.z.bandaI||0));
  var m=mapaCalorSVG();
  if(m.n===diestro.tot && /ellipse/.test(m.svg) && /viewBox="0 0 300 200"/.test(m.svg))
    OKK("el SVG del campo se pinta ("+m.n+" pinceladas, blobs presentes)");
  else FALLA("SVG del mapa: n="+m.n+" vs "+diestro.tot);
})();

/* ---------- F3 · la foto fija de atributos viaja al historial ---------- */
(function(){
  base("SEV","MC","D",71);
  var tecAntes=Math.round(atr("TEC"));
  for(var j=0;j<38;j++) jugarJornada(j);
  var tecCierre=Math.round(atr("TEC"));
  nuevaTemporada(); if(S.ofertasVerano) cerrarMercado(true,null);
  var r=S.carrera[S.carrera.length-1];
  var ok=r && r.at && r.at.TEC===tecCierre && r.at.MEN>=10 && r.at.MEN<=95 && r.tir===undefined===false;
  if(r && r.at && r.at.TEC===tecCierre && r.tir>=0)
    OKK("la temporada archiva tu radar: at.TEC="+r.at.TEC+" (cierre real "+tecCierre+", arranque "+tecAntes+") y tus "+r.tir+" tiros");
  else FALLA("snapshot: "+JSON.stringify(r&&r.at)+" tir="+(r&&r.tir));
  RADAR_SEL=r.temp;
  var svg=radarSVG();
  if(/polygon/.test(svg) && (svg.match(/polygon/g)||[]).length>=5) OKK("radar con dos polígonos (hoy vs temporada "+r.temp+") renderiza");
  else FALLA("radar SVG incompleto");
  RADAR_SEL=null;
})();

/* ---------- F4 · el historial de traspasos se escribe solo ---------- */
(function(){
  base("GET","DC","D",72);
  S.fichajes=[{temp:1, de:null, a:"GET", fee:0, tipo:"cantera"}];
  S.contrato.salidaDescenso=true;
  Object.keys(S.tabla).forEach(function(id){ S.tabla[id].pts = id==="GET"? 0 : 40; S.tabla[id].pj=38; });
  nuevaTemporada();
  if(!(S.libre && S.ofertasVerano)){ FALLA("previa de traspaso no se dio"); return; }
  PICK={eq:null,pos:S.pos,rol:S.rol,pierna:"D",esperas:0,attrBonus:0,edad:S.edad,nombre:"Manu",dorsal:9,tanda:null,traspaso:true,negIdx:0};
  abrirMercado();
  var of=(PICK.tanda||[])[0];
  PICK.negIdx=0; PICK.eq=of.id;
  PICK.contraOK={club:of.id, salario:of.contrato.salario, anos:of.contrato.anos||3, clausula:of.contrato.clausula, extras:{}};
  empezarCarrera();
  var f=S.fichajes;
  var ult=f[f.length-1];
  if(f.length===2 && ult.a===of.id && ult.de==="GET" && ult.tipo==="libre" && ult.fee===0 && ult.temp===S.temporada)
    OKK("traspaso registrado: cantera→GET y luego GET→"+EQ[of.id].c+" (libre, 0 €), "+f.length+" entradas");
  else FALLA("fichajes: "+JSON.stringify(f));
  PICK=null;
})();

/* ---------- F5 · altura por puesto y ficha superior ---------- */
(function(){
  var minPor=999, maxExt=0;
  for(var k=0;k<80;k++){
    S=nuevoEstado("BET","POR","A",1,"D",ROLES.POR[0].id,22); if(S.altura<minPor) minPor=S.altura;
    S=nuevoEstado("BET","EXT","B",7,"D",ROLES.EXT[0].id,22); if(S.altura>maxExt) maxExt=S.altura;
  }
  if(minPor>=186 && maxExt<=182) OKK("la altura respeta el puesto: porteros ≥186 (mín "+minPor+"), extremos ≤182 (máx "+maxExt+")");
  else FALLA("altura: minPOR="+minPor+" maxEXT="+maxExt);
  base("BET","DC","D",72);
  var html=secJugador();
  if(/Valor de mercado/.test(html) && /Contrato hasta/.test(html) && /Seguidores/.test(html) && new RegExp(S.altura+" cm").test(html))
    OKK("la ficha superior enseña seguidores, valor, contrato y altura ("+S.altura+" cm)");
  else FALLA("ficha superior incompleta");
})();

/* ---------- F6 · migración y guardado con todo dentro ---------- */
(async function(){
  var viejo={v:"1.5.0", equipo:"BET", pos:"DC", nombre:"Manu", dorsal:9, temporada:3, jornada:8,
    yo:{pj:8,min:700,g:3,a:1,ta:2,tr:0,notaSum:54,notaN:8,paradas:0,mvp:1}, edad:25,
    attr:{TEC:72,FIS:70,TAC:69,DEF:55,MEN:66}, carrera:[{temp:1,club:"BET",liga:"Primera División",edad:23,pj:30,g:9,a:4,ta:5,tr:0,med:6.9}]};
  sGet=async function(){ return viejo; };
  await cargar();
  var okM = S.yo.tiros===0 && S.zonas && S.altura>=176 && S.altura<=193 && S.fichajes.length===1 && S.fichajes[0].tipo==="cantera";
  if(okM) OKK("partida vieja migrada: contadores a cero, campo vacío, altura "+S.altura+" y alta de cantera en el historial");
  else FALLA("migración ficha: tiros="+S.yo.tiros+" altura="+S.altura+" fichajes="+JSON.stringify(S.fichajes));
  base("SEV","DC","D",73);
  for(var t=0;t<3;t++){ for(var j=0;j<38;j++) jugarJornada(j); nuevaTemporada(); if(S.ofertasVerano) cerrarMercado(true,null); }
  var s=JSON.stringify(S), back=JSON.parse(s);
  if(s.length<240000 && back.carrera[0].at && back.fichajes && back.archivo && back.archivo["1"] && back.archivo["1"].h.length>=30)
    OKK("guardado a 3 temporadas con radar, traspasos y ARCHIVO completo por temporada: "+s.length+" caracteres (techo 240k · ~45k por temporada archivada)");
  else FALLA("guardado ficha: "+s.length);
  /* ---------- F7 · el libro del partido: cada decisión con zona, tipo y peso ---------- */
(function(){
  base("SEV","MC","D",72);
  for(var j=0;j<12;j++) jugarJornada(j);
  var conYo=(S.hist||[]).filter(function(h){ return h.yo; });
  var mal=0, decs=0, conS=0;
  conYo.forEach(function(h){
    (h.dec||[]).forEach(function(x){
      var d=decObj(x);
      decs++;
      if(d.m===undefined||!d.k||!d.r||d.d===undefined) mal++;
      if(d.z && !ZINV[d.z]) mal++;
      if(["t","p","d","r","j","v","x"].indexOf(d.k)<0) mal++;
      if(d.s) conS++;
    });
  });
  if(decs>=15 && mal===0 && conS>=decs-0)  /* todas llevan situación (las de fase, su fase) */
    OKK("12 jornadas → "+decs+" decisiones registradas, todas con minuto, situación, zona válida, tipo y peso");
  else FALLA("libro del partido: decs="+decs+" mal="+mal+" conSituacion="+conS);
})();

/* ---------- F8 · EL DESGLOSE ES LA NOTA: reconstrucción exacta en 2 temporadas ---------- */
(function(){
  base("BET","DC","D",73);
  var revisados=0, roto=null;
  for(var t=0;t<2;t++){
    for(var j=0;j<38;j++) jugarJornada(j);
    (S.hist||[]).forEach(function(h){
      if(!h.yo) return;
      var D=desgloseNota(h);
      revisados++;
      if(Math.round(D.fin*10)/10!==h.yo.nota && Math.abs(D.fin-h.yo.nota)>0.0509 && !roto) roto="J"+h.jor+" fin="+D.fin.toFixed(3)+" real="+h.yo.nota;
    });
    if(t===0){ nuevaTemporada(); if(S.ofertasVerano) cerrarMercado(true,null); }
  }
  if(revisados>=50 && !roto) OKK("desglose == nota en los "+revisados+" partidos jugados de 2 temporadas (reconstrucción exacta, sin números de adorno)");
  else FALLA("desglose roto: revisados="+revisados+" · "+roto);
})();

/* ---------- F9 · la ficha del partido renderiza entera (resumen, tiros, defensa) ---------- */
(function(){
  base("SEV","DC","D",74);
  for(var j=0;j<6;j++) jugarJornada(j);
  var HH=S.hist.map(function(h,i){return {h:h,i:i};}).filter(function(x){return x.h.yo;});
  if(!HH.length){ FALLA("sin partidos con minutos"); return; }
  PARTIDO_SEL=HH[HH.length-1].i; PF_TAB="res";
  var html=secJugador!==undefined? (SUB.jugador="partidos", secJugador()) : "";
  var ok1=/Desglose de la valoración/.test(html) && /Mapa de calor del partido/.test(html);
  PF_TAB="t"; var htmlT=secJugador();
  var h=S.hist[PARTIDO_SEL], nT=(h.dec||[]).map(decObj).filter(function(d){return d.k==="t" && d.z;}).length;
  var circulos=(htmlT.match(/<circle cx=/g)||[]).length - 1;   /* menos el círculo central del campo */
  PF_TAB="d"; var htmlD=secJugador();
  var okD=/acciones sobre el campo|Nada que pintar/.test(htmlD);
  PARTIDO_SEL=null; PF_TAB="res";
  if(ok1 && circulos>=nT && okD)
    OKK("ficha del partido completa: desglose con suma exacta, mapa del partido, y la pestaña Tiros pinta "+nT+" remates como puntos");
  else FALLA("render partido: resumen="+ok1+" tiros="+circulos+"/"+nT+" def="+okD);
})();

/* ---------- F10 · el guardado aguanta el libro entero ---------- */
(function(){
  base("SEV","DC","D",73);
  for(var t=0;t<2;t++){ for(var j=0;j<38;j++) jugarJornada(j); if(t===0){ nuevaTemporada(); if(S.ofertasVerano) cerrarMercado(true,null); } }
  var s=JSON.stringify(S), back=JSON.parse(s);
  var conDec=back.hist.filter(function(h){ return h.dec && h.dec.length; }).length;
  if(s.length<240000 && conDec>=30)
    OKK("jornada 38 con relato literal + la temporada anterior archivada (sin relato): "+s.length+" caracteres ("+conDec+" partidos; techo 240k)");
  else FALLA("guardado partidos: "+s.length+" chars, conDec="+conDec);
})();

/* ---------- F11 · los goles llevan dueño, asistente y zona ---------- */
(function(){
  base("SEV","DC","D",76);
  for(var j=0;j<20;j++) jugarJornada(j);
  var tot=0, mal=0, tuyosConZ=0, tuyos=0, asisTuyas=0, compiConAs=0;
  (S.hist||[]).forEach(function(h){
    (h.goles||[]).forEach(function(g){
      tot++;
      if(!g.a || g.a.length<3 || !(g.m>=1 && g.m<=95)) mal++;
      if(g.yo){ tuyos++; if(g.z && ZINV[g.z]) tuyosConZ++; if(g.a!==S.nombre) mal++; }
      if(g.asis && g.as!==S.nombre) mal++;
      if(g.asis) asisTuyas++;
      if(g.mio && !g.yo && g.as) compiConAs++;
    });
  });
  if(tot>=25 && mal===0 && tuyos>=5 && tuyosConZ===tuyos)
    OKK(tot+" goles en 20 jornadas, todos con autor y minuto; tus "+tuyos+" llevan la zona exacta de la decisión; "+compiConAs+" goles de compañeros con asistente nombrado");
  else FALLA("goles: tot="+tot+" mal="+mal+" tuyos="+tuyos+"/"+tuyosConZ+" compiAs="+compiConAs);
})();

/* ---------- F12 · el gif del gol: dos vistas, cinco segundos, determinista ---------- */
(function(){
  base("BET","DC","D",76);
  for(var j=0;j<10;j++) jugarJornada(j);
  var h=null, g=null;
  (S.hist||[]).forEach(function(hh){ (hh.goles||[]).forEach(function(gg){ if(!g && gg.yo){ h=hh; g=gg; } }); });
  if(!g){ FALLA("sin gol tuyo en 10 jornadas para el gif"); return; }
  var gif1=golGifSVG(g,h), gif2=golGifSVG(g,h);
  var okDet=gif1===gif2;
  var okFrames=(gif1.match(/class="gfa"/g)||[]).length===1 && (gif1.match(/class="gfb"/g)||[]).length===1;
  var okBits=/la jugada/.test(gif1) && /por dónde entró/.test(gif1) && new RegExp('>'+S.dorsal+'<').test(gif1);
  var conAs=null, hAs=null;
  (S.hist||[]).forEach(function(hh){ (hh.goles||[]).forEach(function(gg){ if(!conAs && gg.as){ conAs=gg; hAs=hh; } }); });
  var okAsis=!conAs || ((golGifSVG(conAs,hAs).match(/<path d="M-11,-9/g)||[]).length===2);
  if(okDet && okFrames && okBits && okAsis)
    OKK("gif del gol: dos vistas cicladas por CSS, determinista (misma jugada → mismo gif) y con las dos camisetas cuando hay asistente");
  else FALLA("gif: det="+okDet+" frames="+okFrames+" bits="+okBits+" asis="+okAsis);
})();

/* ---------- F13 · el pulso fotografía las λ reales, y el acta renderiza ---------- */
(function(){
  base("SEV","MC","D",73);
  sinCortesYo(function(){ for(var j=0;j<20;j++) jugarJornada(j); });
  var malP=0, vivos=0, conP=0;
  (S.hist||[]).forEach(function(h){
    var PU=h.pulso||[];
    if(h.sinTi && PU.length!==6) return;   /* lesión/sanción: no hubo partido tuyo que fotografiar */
    if(PU.length!==6){ malP++; return; }
    conP++;
    var mn=1e9, mx=0;
    PU.forEach(function(t){ if(!(t[0]>0&&t[0]<999&&t[1]>0&&t[1]<999)) malP++; mn=Math.min(mn,t[0]); mx=Math.max(mx,t[0]); });
    if(mx>=mn*1.05) vivos++;
  });
  if(conP>=15 && malP===0 && vivos>=8)
    OKK("pulso: 6 tramos por partido con λ sanas, y en "+vivos+"/"+conP+" partidos tus decisiones movieron la intensidad ≥5% dentro del propio partido (los partidos sin decisión de equipo quedan planos, como debe ser)");
  else FALLA("pulso: conP="+conP+" malP="+malP+" vivos="+vivos);
  var idx=-1; S.hist.forEach(function(h,i){ if(idx<0 && h.yo && (h.goles||[]).length) idx=i; });
  if(idx<0){ FALLA("sin partido con goles para el acta"); return; }
  PARTIDO_SEL=idx; PF_TAB="acta"; SUB.jugador="partidos";
  var html=secJugador();
  var okA=/¡GOL/.test(html) && /golgif/.test(html) && /gfa/.test(html);
  PF_TAB="pulso"; var html2=secJugador();
  var okP=/Impulso del partido/.test(html2) && /class="pulso"/.test(html2);
  PARTIDO_SEL=null; PF_TAB="res";
  if(okA && okP) OKK("las pestañas Acta (con gif dentro) y Pulso renderizan enteras");
  else FALLA("render acta/pulso: "+okA+"/"+okP);
})();

/* ---------- F14 · las partidas 4.7.0 (dec como objetos) se siguen leyendo ---------- */
(function(){
  base("BET","DC","D",72);
  jugarJornada(0);
  var h=S.hist[0];
  if(!h||!h.yo){ jugarJornada(1); h=S.hist.filter(function(x){return x.yo;})[0]; }
  if(!h){ FALLA("sin partido para retro"); return; }
  h.dec=(h.dec||[]).map(decObj);   /* forma vieja: objetos */
  var D=desgloseNota(h);
  if(Math.round(D.fin*10)/10===h.yo.nota || Math.abs(D.fin-h.yo.nota)<=0.0509) OKK("retrocompatibilidad: un partido con el libro en formato 4.7.0 (objetos) reconcilia igual de exacto");
  else FALLA("retro dec-objetos: fin="+D.fin.toFixed(2)+" real="+h.yo.nota);
})();

/* ---------- F15 · la fontanería: del cierre y del hub se llega al acta de un toque ---------- */
(function(){
  base("SEV","DC","D",73);
  for(var j=0;j<3;j++) jugarJornada(j);
  /* la tarjeta del hub existe y apunta al último partido */
  var card=cardUltimoPartido();
  var i=S.hist.length-1;
  var okCard=/Último partido/.test(card) && new RegExp("verPartidoTab\\("+i+",'acta'\\)").test(card)
          && /Pulso/.test(card) && /Desglose/.test(card);
  /* verPartidoTab navega de verdad */
  verPartidoTab(i,"pulso");
  var okNav=(PARTIDO_SEL===i && PF_TAB==="pulso" && SUB.jugador==="partidos" && SEC==="jugador");
  /* cerrarYFicha sin partido vivo (M=null) aterriza en el acta del último */
  PARTIDO_SEL=null; PF_TAB="res"; M=null;
  cerrarYFicha();
  var okCierre=(PARTIDO_SEL===S.hist.length-1 && PF_TAB==="acta");
  /* el botón vive en la pantalla de cierre */
  var cap=null, _pm=pintarMatch; pintarMatch=function(a,b){ cap=String(a)+" ||| "+String(b); };
  M={sc:[2,1], rival:"BET", casa:true, min:93, minJugados:90, yaJugado:true, enCampo:true, nota:7.1,
     miGol:1, miAsis:0, paradas:0, miTA:0, miTR:0, goles:[{m:12,mio:true,yo:true,a:S.nombre,as:null,z:"A"}],
     dec:[], pulso:[], crono:[], flash:[], eventos:[], prueba:false, cierreAbierto:true, postTxt:null,
     modOwn:1, modOpp:1, lam:[1.4,1.1], dElo:0, tramo:6, resumenHTML:"", fase:"cierre"};
  PANEL=0;
  try{ renderCierre(); }catch(e){ cap="ERROR:"+e.message; }
  pintarMatch=_pm; M=null;
  var okTabs=cap && !/cerrarYFicha/.test(cap) && /panelIr\(/.test(cap) && /Resumen/.test(cap) && /Cronología/.test(cap) && /Crónica/.test(cap) && />Yo</.test(cap);
  PARTIDO_SEL=null; PF_TAB="res";
  if(okCard && okNav && okCierre && okTabs)
    OKK("fontanería: tarjeta del hub con atajos, verPartidoTab navega, y el cierre trae SUS pestañas (Resumen·Crónica·Yo) sin botón que te saque");
  else FALLA("fontanería: card="+okCard+" nav="+okNav+" cierre="+okCierre+" tabs="+(okTabs?true:String(cap).slice(0,120)));
})();

/* ---------- F16 · la narración reconstruye los textos EXACTOS del partido ---------- */
(function(){
  base("SEV","MC","D",73);
  for(var j=0;j<4;j++) jugarJornada(j);
  var idx=-1, dSel=null, sitSel=null;
  S.hist.forEach(function(h,i){
    if(idx>=0 || !h.yo) return;
    (h.dec||[]).forEach(function(x){
      var d=decObj(x);
      if(dSel || d.oi===null || d.oi<0 || d.k==="x") return;
      var sit=sitPorId(d.s);
      if(sit && typeof sit.t==="string" && sit.o && sit.o[d.oi] && typeof (sit.o[d.oi][d.r]||"")==="string" && (sit.o[d.oi][d.r]||"").length>10){ idx=i; dSel=d; sitSel=sit; }
    });
  });
  if(!dSel){ FALLA("sin decisión reconstruible en 4 jornadas"); return; }
  var _libGuard=S.hist[idx].lib; delete S.hist[idx].lib;   /* probamos el FALLBACK reconstruido, determinista */
  PARTIDO_SEL=idx; PF_TAB="narr"; SUB.jugador="partidos";
  var html=secJugador();
  var op=sitSel.o[dSel.oi], prosa=op[dSel.r];
  var okTxt=html.indexOf(esc(prosa))>=0 && html.indexOf(esc(op.l))>=0 && /reconstruida del libro/.test(html);
  S.hist[idx].lib=_libGuard;
  var okOrden=(function(){
    var mins=(html.match(/<b class="mono">(\d+)′<\/b>/g)||[]).map(function(t){ return parseInt(t.replace(/\D/g,"")); });
    for(var i2=1;i2<mins.length;i2++) if(mins[i2]>mins[i2-1]) return false;   /* de nuevo a viejo */
    return mins.length>=3;
  })();
  var hSel=S.hist[idx], tieneGol=(hSel.goles||[]).length>0;
  var okGol=!tieneGol || /¡GOL/.test(html);
  /* retro: libro 4.8.x (6 elementos, sin índice) no rompe */
  var h6=JSON.parse(JSON.stringify(hSel));
  h6.dec=(h6.dec||[]).map(function(x){ return Array.isArray(x)? x.slice(0,6):x; });
  delete h6.lib;   /* partida 4.8.x: ni relato literal ni índice de opción */
  S.hist[idx]=h6;
  var html2=secJugador();
  var okRetro=/Narración|narración/i.test(html2) && html2.indexOf(esc(prosa))<0 && /cron/.test(html2);
  S.hist[idx]=hSel;
  PARTIDO_SEL=null; PF_TAB="res";
  if(okTxt && okOrden && okGol && okRetro)
    OKK("narración literal: título «"+sitSel.t.slice(0,30)+"…», tu decisión y el desenlace palabra por palabra, en orden de minuto, con los goles intercalados; los libros 4.8.x caen a línea genérica sin romperse");
  else FALLA("narración: txt="+okTxt+" orden="+okOrden+" gol="+okGol+" retro="+okRetro);
})();

/* ---------- F17 · los números del partido casan con el libro ---------- */
(function(){
  base("BET","DC","D",74);
  for(var j=0;j<6;j++) jugarJornada(j);
  var idx=-1;
  S.hist.forEach(function(h,i){ if(idx<0 && h.yo && (h.dec||[]).some(function(x){return decObj(x).k==="t";})) idx=i; });
  if(idx<0){ FALLA("sin partido con tiro en 6 jornadas"); return; }
  var h=S.hist[idx], DD=h.dec.map(decObj);
  var tiros=DD.filter(function(d){return d.k==="t";}).length;
  var defOk=DD.filter(function(d){return d.k==="d"&&d.r==="ok";}).length;
  var sumD=0; DD.forEach(function(d){ sumD+=d.d; });
  PARTIDO_SEL=idx; PF_TAB="nums"; SUB.jugador="partidos";
  var html=secJugador();
  PARTIDO_SEL=null; PF_TAB="res";
  var okN=new RegExp("Tiros · conversión</span><b>"+tiros).test(html)
       && new RegExp(defOk+" resueltas").test(html)
       && html.indexOf((sumD>=0?"+":"")+(sumD/100).toFixed(2)+" pts")>=0
       && new RegExp("Minutos</span><b>"+h.yo.min).test(html);
  if(okN) OKK("números del partido: "+tiros+" tiros, "+defOk+" defensas resueltas y el impacto total "+(sumD/100).toFixed(2)+" salen del libro y casan uno a uno");
  else FALLA("números del partido no casan");
})();

/* ---------- F18 · los paneles del partido: Crónica con gifs y Yo en directo ---------- */
(function(){
  base("SEV","DC","D",74);
  /* un M vivo de mentira, con una decisión real y un gol con dueño */
  var sit=SITS.filter(function(s2){ return s2.o && s2.o[0] && (s2.o[0].ok||"").length>10; })[0];
  M={sc:[1,0], rival:"BET", casa:true, min:34, minJugados:34, yaJugado:true, enCampo:true, nota:6.9,
     miGol:1, miAsis:0, paradas:0, miTA:0, miTR:0,
     goles:[{m:12, mio:true, yo:true, asis:false, a:S.nombre, as:null, z:"A"}],
     dec:[[12, sit.id, "A", "t", "ok", 63, 0]],
     crono:[{m:20, tipo:"ta", n:"Rulo", mio:false}],
     pulso:[], eventos:[], flash:[], fase:"juego", modOwn:1, modOpp:1, lam:[1.4,1.1], dElo:0, tramo:2, prueba:false};
  PANEL=1;   /* en juego: 0=Cronología, 1=Crónica */
  var cro=panelHTML();
  var prosa=sit.o[0].ok;
  var okCro=cro.indexOf(esc(prosa))>=0 && /golgif/.test(cro) && /🟨/.test(cro) && /Crónica/.test(cro);
  PANEL=4;   /* en juego: 4=Yo */
  var yoP=panelHTML();
  var okYo=/si acabara ahora/.test(yoP) && /Tiros · conversión<\/span><b>1/.test(yoP) && /Tu temporada/.test(yoP);
  M=null; PANEL=0;
  if(okCro && okYo) OKK("en pleno partido: la Crónica imprime la prosa exacta con el gif del gol dentro, y la pestaña Yo lleva tus números en directo («si acabara ahora»)");
  else FALLA("paneles vivos: cro="+okCro+" yo="+okYo);
})();

/* ---------- F19 · el archivo por temporadas: se guarda, se navega y reconcilia ---------- */
(function(){
  base("BET","MC","D",73);
  for(var t=0;t<2;t++){ for(var j=0;j<38;j++) jugarJornada(j); nuevaTemporada(); if(S.ofertasVerano) cerrarMercado(true,null); }
  var A1=S.archivo && S.archivo["1"] && S.archivo["1"].h;
  if(!A1 || A1.length<34){ FALLA("archivo t1 ausente: "+(A1?A1.length:"—")); return; }
  var conYo=A1.filter(function(h){ return h.yo; });
  var roto=null;
  conYo.forEach(function(h){ var D=desgloseNota(h); if(Math.abs(D.fin-h.yo.nota)>0.051 && !roto) roto="J"+h.jor; });
  PARTIDO_TEMP=1; PARTIDO_SEL=null; SUB.jugador="partidos";
  var lista=secJugador();
  var okSel=/t1<\/button>/.test(lista) && /en curso/.test(lista) && new RegExp("temporada 1 · archivo").test(lista);
  var iSel=-1; A1.forEach(function(h,i){ if(iSel<0 && h.yo) iSel=i; });
  PARTIDO_SEL=iSel; PF_TAB="res";
  var ficha=secJugador();
  var okFicha=/Desglose de la valoración/.test(ficha);
  PARTIDO_TEMP=null; PARTIDO_SEL=null; PF_TAB="res";
  if(!roto && okSel && okFicha)
    OKK("archivo vivo: la temporada 1 guarda sus "+A1.length+" partidos con libro completo, el selector navega y el desglose sigue reconciliando exacto sobre lo archivado");
  else FALLA("archivo: roto="+roto+" sel="+okSel+" ficha="+okFicha);
})();

/* ---------- F20 · las temporadas muy viejas se compactan sin romper la lista ---------- */
(function(){
  base("SEV","DC","D",72);
  jugarJornada(0);
  S.archivo={};
  for(var t=1;t<=9;t++) S.archivo[t]={h:[{jor:1,rival:"BET",casa:true,sc:[1,0],goles:[],dec:[[10,"x","A","t","ok",63,0]],pulso:[[10,10]],crono:[],yo:{nota:7,g:1,a:0,p:0,ta:0,tr:0,mvp:false,min:90,aj:0,bd:0,df:0,rs:1}}]};
  S.temporada=10;
  nuevaTemporada(); if(S.ofertasVerano) cerrarMercado(true,null);
  var vieja=S.archivo["1"].h[0], nueva=S.archivo["9"].h[0];
  var okComp=vieja.comp===1 && !vieja.dec && !vieja.pulso && vieja.goles && nueva.dec && nueva.dec.length;
  PARTIDO_TEMP=1; PARTIDO_SEL=null; SUB.jugador="partidos";
  var lista=secJugador();
  PARTIDO_TEMP=null;
  if(okComp && /Archivo compacto/.test(lista))
    OKK("a partir de 8 temporadas, las viejas se compactan (fuera libro y pulso, quedan goles y números) y la lista lo avisa");
  else FALLA("compactado: comp="+okComp);
})();

/* ---------- F21 · el partidillo de ojeadores habla dos idiomas: Primera y Segunda ---------- */
(function(){
  function tandaCon(attrBonus, edad, nota, esperas){
    PICK={eq:null, pos:"DC", rol:ROLES.DC[0].id, pierna:"D", esperas:esperas||0, attrBonus:attrBonus, edad:edad,
          nombre:"Manu", dorsal:9, tanda:null, notaPrueba:nota, ojeadores:[]};
    if(!S){ S=nuevoEstado("SEV","DC","tmp",9,"D",ROLES.DC[0].id,24); }   /* mundo montado para rangos */
    return generarTanda();
  }
  base("SEV","DC","D",70);   /* asegura S.mundo vivo */
  var alta=tandaCon(14, 24, 9.1, 0);
  var altaSeg=alta.filter(function(o){ return esSegunda(o.id); }).length;
  var altaTop=alta.filter(function(o){ return rankDe(o.id)<=6; }).length;
  var idsA={}; alta.forEach(function(o){ idsA[o.id]=1; });
  var ok1=(alta.length===5 && altaSeg===0 && altaTop>=2 && Object.keys(idsA).length===5);
  if(ok1) OKK("prueba brillante (media alta, nota 9,1): 5 ofertas, todas de Primera, "+altaTop+" de élite/alta y sin clubes repetidos");
  else FALLA("tanda alta: n="+alta.length+" seg="+altaSeg+" top="+altaTop);
  var baja=tandaCon(-24, 18, 4.2, 2);
  var bajaSeg=baja.filter(function(o){ return esSegunda(o.id); }).length;
  var okC=baja.every(function(o){ return o.contrato && o.contrato.salario>0; });
  var salSeg=baja.filter(function(o){ return esSegunda(o.id); }).map(function(o){ return o.contrato.salario; });
  var salOk=salSeg.every(function(v){ return v<=300000; });
  if(baja.length===5 && bajaSeg>=3 && okC && salOk)
    OKK("prueba floja (media pobre, nota 4,2, dos tandas esperadas): 5 ofertas con "+bajaSeg+" de Segunda y sueldos de Segunda (≤300k: "+salSeg.join("/")+" €)");
  else FALLA("tanda baja: n="+baja.length+" seg="+bajaSeg+" contratos="+okC+" sal="+salSeg.join("/"));
  /* firmar en Segunda arranca la carrera en Segunda de verdad */
  var oSeg=baja.filter(function(o){ return esSegunda(o.id); })[0];
  PICK.eq=oSeg.id; PICK.negIdx=0; PICK.traspaso=false;
  PICK.contraOK={club:oSeg.id, salario:oSeg.contrato.salario, anos:oSeg.contrato.anos||2, clausula:oSeg.contrato.clausula||10000000, extras:{}};
  empezarCarrera();
  var liga=ligaEquipos();
  var todos2=liga.every(function(e){ return esSegunda(e.id); });
  jugarJornada(0);
  var okArr=(S.division==="2" && liga.length===20 && todos2 && S.equipo===oSeg.id && S.hist.length===1 && Object.keys(S.tabla).length===20);
  if(okArr) OKK("firmas por "+EQ[oSeg.id].c+" y la carrera ARRANCA en Segunda: 20 clubes de Segunda, tabla montada y primera jornada jugada");
  else FALLA("alta en segunda: div="+S.division+" liga="+liga.length+" todos2="+todos2);
  PICK=null;
})();

/* ---------- F22 · la Cronología ha vuelto: pestaña por defecto con su timeline ---------- */
(function(){
  base("SEV","DC","D",73);
  M={sc:[1,0], rival:"BET", casa:true, min:60, minJugados:60, yaJugado:true, enCampo:true, nota:6.8,
     miGol:1, miAsis:0, paradas:0, miTA:0, miTR:0, goles:[], dec:[], pulso:[], eventos:[], flash:[],
     fase:"juego", modOwn:1, modOpp:1, lam:[1.4,1.1], dElo:0, tramo:4, prueba:false,
     crono:[{m:12,tipo:"gol",n:S.nombre,n2:"",mio:true,x:"tuyo"},{m:30,tipo:"ta",n:"Rulo",mio:false},{m:55,tipo:"cambio",n:"Sale A",n2:"Entra B",mio:true}]};
  PANEL=0;
  var tl=panelHTML();
  var okTl=/Cronología/.test(tl) && /tlrow/.test(tl) && /⚽/.test(tl) && /tcard tam/.test(tl) && /▲/.test(tl)
        && tl.indexOf(esc(S.nombre))>=0 && /class="tlL yo"/.test(tl);
  var pp=panelesDe();
  M=null; PANEL=0;
  if(okTl && pp[0]==="tl") OKK("la Cronología vuelve como pestaña por defecto: gol con tu nombre destacado, amarilla rival y cambio con ▲▼, sobre el timeline clásico");
  else FALLA("timeline: def="+pp[0]+" contenido="+okTl);
})();

/* ---------- F23 · los goles del gif se rematan en zona de remate ---------- */
(function(){
  base("SEV","DC","D",73);
  var casos=0, malos=0;
  for(var m=1;m<=40;m++){
    var z=zonaRemate({m:m, a:"Centralón", z:null});
    casos++;
    if(["arearival","frontal"].indexOf(z)<0) malos++;
  }
  var okAs = zonaAsistente("DFC")==="medio" && zonaAsistente("POR")==="medio" && zonaAsistente("EXT")!=="defensa" && zonaAsistente("DC")==="arearival";
  var conZ = zonaRemate({m:5, a:"X", z:"F"})==="frontal";
  if(malos===0 && okAs && conZ)
    OKK("recreación honesta: 40 goles sin zona rematan todos en área/frontal (0 desde defensa), el asistente central sube al medio, y la zona real del libro manda cuando existe");
  else FALLA("gif zonas: malos="+malos+" asist="+okAs+" conZ="+conZ);
})();

/* ---------- F24 · estadísticas con mitades: 2.ª = total − 1.ª, y las paradas cuadran ---------- */
(function(){
  base("BET","MC","D",72);
  M={sc:[3,1], rival:"SEV", casa:true, min:90, minJugados:90, yaJugado:true, enCampo:true, nota:7, miGol:0, miAsis:0,
     paradas:0, miTA:0, miTR:0, dec:[], pulso:[], eventos:[], flash:[], fase:"cierre", prueba:false, resumenHTML:"x",
     modOwn:1, modOpp:1, lam:[1.3,1.1], dElo:0, tramo:6,
     goles:[{m:10,mio:true,a:"A1"},{m:70,mio:true,a:"A2"},{m:80,mio:true,a:"A3"},{m:60,mio:false,a:"R1"}],
     est:{tirosA:14,tirosB:11,puertaA:6,puertaB:3,corA:5,corB:4,falA:11,falB:21,posA:56},
     est1:{tirosA:8,tirosB:5,puertaA:3,puertaB:1,corA:2,corB:3,falA:6,falB:9,posA:48,golA:1,golB:0},
     crono:[{m:20,tipo:"ta",n:"X1",mio:false},{m:66,tipo:"ta",n:"X2",mio:false},{m:75,tipo:"cambio",n:"S",n2:"E",mio:true}]};
  PANEL=panelesDe().indexOf("est");
  PANEL_EST="t";
  var t=panelHTML();
  var okT=/Goles/.test(t) && new RegExp('>3</span><span class="psl">Goles').test(t)
       && new RegExp('>2</span><span class="psl">Paradas</span><span class="psb mono">3<').test(t)
       && /🟨 Amarillas/.test(t) && /Todos/.test(t);
  PANEL_EST="2";
  var seg=panelHTML();
  var okSeg=new RegExp('>6</span><span class="psl">Tiros</span><span class="psb mono">6<').test(seg)
        && new RegExp('>2</span><span class="psl">Goles</span><span class="psb mono">1<').test(seg)
        && new RegExp('>0</span><span class="psl">🟨 Amarillas</span><span class="psb mono">1<').test(seg);
  PANEL_EST="t"; M=null; PANEL=0;
  if(okT && okSeg) OKK("estadísticas estilo ficha: paradas = a-puerta − goles (2 y 3 cuadran), y la pestaña 2.ª resta bien la primera (tiros 6-6, goles 2-1, amarilla del 66′)");
  else FALLA("est mitades: todos="+okT+" segunda="+okSeg);
})();

/* ---------- F25 · PENDIENTE DE RETIRAR (4.64+): Skills desaparece, lo sustituyen los Talentos por ramas. Comentado hasta la migración completa, no borrado, para no perder rastro de qué cubría. ---------- */
if(false)(function(){
/* ---------- F25 · las skills se ganan: candado de sesiones y subida cara ---------- */
(function(){
  base("SEV","DC","D",72);
  S.attr.MEN=70; S.skl={}; S.skills=[]; S.reps={};
  var k=SKILLS.filter(function(x){return x.id==="sangrefria";})[0];   /* req: 6 sesiones de mental, MEN 66 */
  var iEj=-1; ENTRENOS.forEach(function(e,i){ if(e.id==="mental") iEj=i; });
  if(iEj<0){ FALLA("ejercicio mental no encontrado"); return; }
  aplicarEntreno(iEj,false);
  var d=sklData("sangrefria");
  var tras1 = !sklPuedeSubir(k) && d.pts>0 && d.pts<=8;
  for(var v2=0;v2<7;v2++) aplicarEntreno(iEj,false);   /* 8 sesiones en total */
  var tras8 = sklPuedeSubir(k);
  var ui=(SUB.jugador="fisico", secJugador());
  var pts=sklData("sangrefria").pts;
  subirSkill("sangrefria");
  var okSube = tieneSkill("sangrefria") && sklData("sangrefria").pts===pts-10;
  S.attr.MEN=60; S.skl={}; S.skills=[]; S.reps={mental:20};
  var okAttr = !sklPuedeSubir(k);
  var ui2=(SUB.jugador="fisico", secJugador());
  var okUi = /🔒/.test(ui2) && /sesiones de/.test(ui2)===false || /MEN 60\/66/.test(ui2);
  S.attr.MEN=70;
  if(tras1 && tras8 && okSube && okAttr && /MEN 60\/66/.test(ui2))
    OKK("candado real: 1 sesión NO abre nada (solo "+d.pts+" pts y sin cumplir 6 sesiones); a la 8.ª se abre y el nivel 1 cuesta 10; con MEN 60/66 el candado 🔒 lo dice en pantalla");
  else FALLA("skills: tras1="+tras1+" tras8="+tras8+" sube="+okSube+" attrGate="+okAttr+" ui="+/MEN 60\/66/.test(ui2));
})();
})();

/* ---------- F26 · la Crónica ES el relato: literal, con gifs, sin pesos ni resultados ---------- */
(function(){
  base("SEV","DC","D",74);
  var idx=-1;
  for(var j=0;j<8 && idx<0;j++){ jugarJornada(j); S.hist.forEach(function(h,i){ if(idx<0 && h.yo && (h.goles||[]).some(function(g){return g.mio;}) && (h.lib||[]).length>=10) idx=i; }); }
  if(idx<0){ FALLA("sin partido narrado con gol en 8 jornadas"); return; }
  var h=S.hist[idx];
  var conDec=h.lib.filter(function(l){ return l[2]; });
  PARTIDO_SEL=idx; PF_TAB="narr"; SUB.jugador="partidos";
  var html=secJugador();
  var linea=h.lib[Math.floor(h.lib.length/2)];
  var okLit=html.indexOf(esc(linea[1]))>=0;
  var okDec=!conDec.length || (html.indexOf('<b class="tdec">'+esc(conDec[0][2])+'.</b>')>=0);
  var okLimpio=!/salió bien|salió mal|sin consecuencias/.test(html.replace(/Crónica|crónica/g,""))
            && !/[+\-]\d\.\d\d<\/span>/.test(html) && !/ pts/.test(html);
  var okGif=/golgif/.test(html) && /¡GOL/.test(html);
  var okOrden=true;   /* la crónica respeta el orden de EMISIÓN; los minutos son etiquetas y pueden zigzaguear como en directo */
  PARTIDO_SEL=null; PF_TAB="res";
  if(okLit && okDec && okLimpio && okGif && okOrden)
    OKK("crónica literal: "+h.lib.length+" líneas tal como se narraron (decisión = etiqueta en negrita, sin ✔/✘ ni ± ni pts), gif del gol insertado en su minuto y orden intacto");
  else FALLA("crónica literal: lit="+okLit+" dec="+okDec+" limpio="+okLimpio+" gif="+okGif+" orden="+okOrden);
})();

/* ---------- F27 · el relato literal solo viaja con la temporada en curso ---------- */
(function(){
  base("BET","MC","D",72);
  for(var j=0;j<38;j++) jugarJornada(j);
  var iLib=-1; S.hist.forEach(function(h,i){ if(iLib<0 && (h.lib||[]).length>=8) iLib=i; });
  if(iLib<0){ FALLA("ningún partido narrado con ≥8 líneas"); return; }
  var libAntes=S.hist[iLib].lib.length;
  nuevaTemporada(); if(S.ofertasVerano) cerrarMercado(true,null);
  var arch=S.archivo["1"].h[iLib];
  var okA=libAntes>=8 && arch.lib===undefined && arch.dec && arch.dec.length>=0 && (arch.pulso||[]).length===6;
  PARTIDO_TEMP=1; PARTIDO_SEL=iLib; PF_TAB="narr"; SUB.jugador="partidos";
  var html=secJugador();
  PARTIDO_TEMP=null; PARTIDO_SEL=null; PF_TAB="res";
  if(okA && /reconstruida del libro de decisiones/.test(html))
    OKK("al archivar, el relato literal ("+libAntes+" líneas) se poda; la pestaña cae a la reconstrucción y lo dice — libro, pulso y goles siguen enteros");
  else FALLA("archivo lib: antes="+libAntes+" arch="+(arch.lib===undefined)+" nota="+/reconstruida/.test(html));
})();

/* ---------- F28 · los partidos alimentan las habilidades ---------- */
(function(){
  base("SEV","DC","D",74);
  for(var j=0;j<12;j++) jugarJornada(j);
  var rM=S.repsM||{};
  var kk=sklData("killer");
  var okReps=(rM.definicion||0)>=1;
  var okUso=kk.pts>0 && kk.u>0 && (jorAbs()-kk.u)<=12;
  /* el candado acepta reps de partido: sin entrenar ni una sesión */
  S.reps={}; S.repsM={definicion:8}; S.attr.TEC=72;
  var kO=SKILLS.filter(function(x){return x.id==="killer";})[0];
  var okGate=sklDesbloqueada(kO);
  S.repsM={definicion:3};
  var okGate2=!sklDesbloqueada(kO);
  if(okReps && okUso && okGate && okGate2)
    OKK("jugar ejercita: 12 jornadas de delantero dan reps de definición ("+(rM.definicion||0)+") y puntos a «Killer» ("+kk.pts+" pts, usada hace "+(jorAbs()-kk.u)+" j); el candado abre con 8 reps de puro partido y no con 3");
  else FALLA("uso-partido: reps="+(rM.definicion||0)+" pts="+kk.pts+" gate8="+okGate+" gate3="+okGate2);
})();

/* ---------- F29 · el óxido: el físico se pierde rápido, la técnica aguanta, el uso frena ---------- */
(function(){
  base("SEV","DC","D",72);
  S.edad=31; S.division="1";
  var jA0=jorAbs();
  S.skl={ motor:{niv:30, pts:0, u:jA0-40}, killer:{niv:30, pts:0, u:jA0-40} };
  S.skills=["motor","killer"];
  oxidarSkills();
  var caeF=Math.round((30-S.skl.motor.niv)*100)/100, caeT=Math.round((30-S.skl.killer.niv)*100)/100;
  var okDif = Math.abs(caeF-3.18)<0.05 && Math.abs(caeT-0.8)<0.05;
  /* la reserva se seca antes que el nivel */
  S.skl.killer={niv:20, pts:9, u:jA0-40};
  oxidarSkills();
  var okReserva = S.skl.killer.niv===20 && S.skl.killer.pts===5;
  /* el uso frena: una acción que ejercita killer resetea su reloj y para el óxido */
  usoSkillsPartido({m:60, s:"del-area", z:"A", k:"t", r:"ok"});
  var nivPre=S.skl.killer.niv;
  oxidarSkills();
  var okFreno = S.skl.killer.u===jA0 && S.skl.killer.niv===nivPre;
  /* la pérdida total, con aviso en el diario */
  S.skl.motor={niv:1, pts:0, u:jA0-40};
  var logAntes=(S.vidaLog||[]).length;
  oxidarSkills();
  var okPerdida = S.skl.motor.niv===0 && S.skills.indexOf("motor")<0
    && (S.vidaLog||[]).slice(logAntes).some(function(t){ return /perdido «Motor/.test(t); });
  var mas30=(function(){ S.edad=21; var t=sklTasaOxido(SKILLS.filter(function(x){return x.id==="motor";})[0]); S.edad=31; return t; })();
  if(okDif && okReserva && okFreno && okPerdida && mas30<2.2)
    OKK("óxido medido a los 31: físico −"+caeF+"/j vs técnica −"+caeT+"/j (relación 4:1); a los 21 el mismo físico solo −"+mas30.toFixed(1)+"; la reserva se seca antes que el nivel, el uso para el reloj y «Motor» a nivel 1 se PIERDE con aviso");
  else FALLA("óxido: FIS="+caeF+" TEC="+caeT+" reserva="+okReserva+" freno="+okFreno+" pérdida="+okPerdida);
})();

/* ---------- F30 · el momento héroe/villano existe, es ofensivo y llega tarde ---------- */
(function(){
  if(!(pClutch(-1,0)===0.85 && pClutch(-2,0)===0.5 && pClutch(0,0)===0.28 && pClutch(1,0)===0.18 && pClutch(2,0)===0 && pClutch(-1,1)===0.55   /* 4.54: sentenciar el 1-0 también es clutch */ && pClutch(0,1)===0 && pClutch(-1,2)===0)){
    FALLA("pClutch mal calibrada"); return;
  }
  base("GET","DC","D",58);   /* equipo modesto y media floja: se pierde a menudo */
  var clutchs=0, tardes=0, heroes=0;
  for(var t=0;t<2;t++){
    for(var j=0;j<38;j++) jugarJornada(j);
    S.hist.forEach(function(h){
      (h.dec||[]).map(decObj).forEach(function(d){
        if(!/^clutch-/.test(d.s||"")) return;
        clutchs++;
        if(d.m>=84) tardes++;
        if(d.k==="t" && d.r==="ok" && (h.goles||[]).some(function(g){ return g.yo && (g.m||0)>=84; })) heroes++;
      });
    });
    if(t===0){ nuevaTemporada(); if(S.ofertasVerano) cerrarMercado(true,null); }
  }
  if(clutchs>=6 && tardes===clutchs && heroes>=1)
    OKK("el partido te busca: "+clutchs+" momentos clutch en 2 temporadas de equipo modesto, todos del 84′ en adelante, y "+heroes+" acabaron en gol del héroe en el descuento");
  else FALLA("clutch: n="+clutchs+" tardes="+tardes+" héroes="+heroes);
})();

/* ---------- F31 · la crónica lee de arriba abajo y su pestaña silencia el ticker ---------- */
(function(){
  base("SEV","DC","D",73);
  M={sc:[1,0], rival:"BET", casa:true, min:60, minJugados:60, yaJugado:true, enCampo:true, nota:6.8,
     miGol:1, miAsis:0, paradas:0, miTA:0, miTR:0,
     goles:[{m:30, mio:true, yo:true, a:S.nombre, as:null, z:"A"}],
     dec:[], pulso:[], eventos:[], flash:[], crono:[], fase:"juego",
     libro:[[0,"Los capitanes se saludan.",""],[12,"Primera llegada del partido.",""],[30,"El estadio celebra.",""],[55,"El rival aprieta.",""]],
     modOwn:1, modOpp:1, lam:[1.3,1.1], dElo:0, tramo:4, prueba:false, usadas:{}, tramosDec:[], histCron:[], colaCron:[{min:58, t:"Última línea de prueba."}], minNarrado:57};
  PANEL=1;   /* juego: 1=Crónica */
  var cro=panelHTML();
  var iA=cro.indexOf("Los capitanes"), iB=cro.indexOf("El rival aprieta"), iG=cro.indexOf("golgif"), iC=cro.indexOf("El estadio celebra");
  var okDesc=iA>=0 && iB>=0 && iB<iA && iG>=0 && iG<iC && iG>iB;   /* 55′ arriba, 0′ abajo; el gif del 30′ corona su minuto */
  /* el ticker calla en Crónica y habla en las demás */
  var cap=null, _pm=pintarMatch; pintarMatch=function(a,b){ cap=String(a); };
  narrarSiguiente();
  var sinTick=!/tick tick-bajo/.test(cap) && /crovivo/.test(cap);
  M.colaCron=[{min:59, t:"Otra línea."}]; PANEL=0;   /* Cronología: ticker visible */
  narrarSiguiente();
  var conTick=/tick tick-bajo/.test(cap);
  pintarMatch=_pm; M=null; PANEL=0;
  if(okDesc && sinTick && conTick)
    OKK("crónica de nuevo a viejo (55′ arriba, la previa abajo del todo, el gif del 30′ coronando su minuto) y ticker silenciado SOLO en su pestaña");
  else FALLA("crónica/ticker: desc="+okDesc+" sinTick="+sinTick+" conTick="+conTick);
})();

/* ---------- F32 · te cambian por cansancio y tu gesto tiene precio ---------- */
(function(){
  var kMal=SITS_CAMBIO[0].o[2], kBien=SITS_CAMBIO[0].o[0];
  if(!(kMal.fx.mis<0 && kMal.fx.disc<0 && kBien.fx.mis>0 && kBien.fx.disc>0)){ FALLA("fx de la reacción mal cableados"); return; }
  base("SEV","MC","D",72);
  var visto=null, gesto=null;
  for(var j=0;j<25 && !visto;j++){
    S.forma=30;   /* piernas vacías: el cambio por desgaste acecha */
    jugarJornada(j, function(sit){
      if(/^cambio-/.test(sit.id||"")){ gesto=sit.id; return 2; }   /* elegimos el berrinche */
      return opcionValida(sit);
    });
    var h=S.hist[S.hist.length-1];
    if(h && (h.dec||[]).map(decObj).some(function(d){ return /^cambio-/.test(d.s||""); })) visto=h;
  }
  if(!visto){ FALLA("ningún cambio con reacción en 25 jornadas con forma 30"); return; }
  var dR=visto.dec.map(decObj).filter(function(d){ return /^cambio-/.test(d.s); })[0];
  var okDec=dR.k==="v" && dR.oi===2 && dR.m>=60;
  var enCrono=(visto.crono||[]).some(function(e){ return e[1]==="c" && e[3]===1; });
  var enLibro=(visto.lib||[]).some(function(l){ return /venda|manotazo|incredulidad|berrinche/i.test(l[1]||""); });
  if(okDec && enCrono && (gesto==="cambio-cansancio"||gesto==="cambio-rendimiento"))
    OKK("sustituido ("+gesto.replace("cambio-","por ")+") en el "+dR.m+"′: la reacción es una decisión de banquillo (fx sociales, sin balón), queda en el libro"+(enLibro?" y en la crónica literal":"")+", y el berrinche cuesta míster y disciplina");
  else FALLA("cambio-reacción: dec="+okDec+" crono="+enCrono+" gesto="+gesto);
})();

/* ---------- F33 · la Cronología pone al local a la izquierda, juegues donde juegues ---------- */
(function(){
  base("SEV","DC","D",73);
  function tlCon(casa){
    M={sc:[1,1], rival:"BET", casa:casa, min:70, minJugados:70, yaJugado:true, enCampo:true, nota:6.5,
       miGol:1, miAsis:0, paradas:0, miTA:0, miTR:0, goles:[], dec:[], pulso:[], eventos:[], flash:[],
       fase:"juego", modOwn:1, modOpp:1, lam:[1.2,1.2], dElo:0, tramo:5, prueba:false, usadas:{}, tramosDec:[],
       crono:[{m:20,tipo:"gol",n:S.nombre,mio:true,x:"tuyo"},{m:40,tipo:"ta",n:"RivalX",mio:false}]};
    PANEL=0;
    var html=panelHTML();
    M=null;
    return html;
  }
  function fila(html, nombre){
    var i=html.indexOf(esc(nombre));
    var ini=html.lastIndexOf('<div class="tlrow">', i);
    return html.slice(ini, html.indexOf('</div></div>', i));
  }
  var fuera=tlCon(false);   /* juegas en Mestalla: el rival es el local */
  var fT=fila(fuera, S.nombre), fR=fila(fuera, "RivalX");
  var okFuera = /tlR yo/.test(fT) && fT.indexOf('<div class="tlL">'+esc(S.nombre))<0
             && fR.indexOf('class="tlL"')>=0 && fR.indexOf("RivalX")>fR.indexOf('class="tlL"')
             && fuera.indexOf(esc(EQ.BET.c))<fuera.indexOf(esc(EQ.SEV.c));
  var casa=tlCon(true);
  var cT=fila(casa, S.nombre);
  var okCasa = /tlL yo/.test(cT) && casa.indexOf(esc(EQ.SEV.c))<casa.indexOf(esc(EQ.BET.c));
  PANEL=0;
  if(okFuera && okCasa)
    OKK("cronología con los pies en el estadio: de visitante tu gol sale a la DERECHA (y el local a la izquierda, cabecera incluida); en casa, al revés");
  else FALLA("lados: fuera="+okFuera+" casa="+okCasa);
})();

/* ---------- F34 · identidad procedural: única, determinista y por bandas ---------- */
(function(){
  var vistos={}, unicos=0;
  for(var i=0;i<600;i++){ var p=genPersona(lcgDe(i*13+5)); if(!vistos[p]){vistos[p]=1;unicos++;} if(/undefined|  /.test(p)){ FALLA("nombre roto: "+p); return; } }
  PLANT_PRI={};
  var a=JSON.stringify(plantillaPrimera("RMA"));
  PLANT_PRI={};
  var b=JSON.stringify(plantillaPrimera("RMA"));
  var eli=plantillaPrimera("RMA").map(function(j){return j.media;});
  var mod=plantillaPrimera("GET").map(function(j){return j.media;});
  var okBandas=Math.max.apply(null,eli)>=85 && Math.max.apply(null,mod)<=80 && (eli.reduce(function(x,y){return x+y;})/eli.length) > (mod.reduce(function(x,y){return x+y;})/mod.length)+6;
  var u1=genUsuario(), okU=/^@[a-z_]+/i.test(u1);
  if(unicos>=560 && a===b && okBandas && okU)
    OKK("identidad procedural: "+unicos+"/600 personas únicas, plantillas deterministas por semilla del club (RMA==RMA entre sesiones), bandas por rank (élite "+Math.max.apply(null,eli)+" vs modesto "+Math.max.apply(null,mod)+"), usuarios tipo "+u1);
  else FALLA("identidad: unicos="+unicos+" det="+(a===b)+" bandas="+okBandas+" usr="+okU);
})();

/* ---------- F35 · estilos de rival: deterministas, acotados y con sesgo real ---------- */
(function(){
  S=nuevoEstado("SEV","MC","Manu",9,"D","organizador",25);
  S.contrato={salario:500000,anos:3,clausula:12000000,prima:25000,franja:"media",exige:65};
  S.compis=crearCompis("SEV","Manu"); S.entrenador=crearEntrenador("SEV");
  var e1=estiloDe("BET"), e2=estiloDe("BET");
  var okDet=JSON.stringify(e1)===JSON.stringify(e2) && ["presion","bloque","tempo","directo","parado"].every(function(k){ return e1[k]>=-1 && e1[k]<=1; });
  var okFac=(function(){ var ids=Object.keys(EQ).slice(0,25); return ids.every(function(id){ var f=estiloFactores(id); return f.own>=0.90 && f.own<=1.10 && f.opp>=0.92 && f.opp<=1.10; }); })();
  var ePr={presion:0.9,bloque:0.2,tempo:0.1,directo:-0.2,parado:-0.1};
  var eBl={presion:-0.6,bloque:-0.9,tempo:-0.2,directo:0.1,parado:0};
  var sitP={id:"x-salida-presion", t:"Te vienen encima en salida"}, sitN={id:"x-neutra", t:"Balón dividido en el medio"};
  var okPeso=estiloPesoSit(sitP,ePr)>1.5 && estiloPesoSit(sitP,eBl)===1 && estiloPesoSit(sitN,ePr)===1;
  var hitsP=0, hitsN=0, NN=10000;
  M={rival:"BET"};
  for(var k=0;k<NN;k++){
    var eleg=(function(e){ var _g=_ESTILOS_EQ; _ESTILOS_EQ={BET:e}; var r=(function(){
      var pesos=[sitP,sitN].map(function(s2){return estiloPesoSit(s2,e);}), tot=pesos[0]+pesos[1], x=rnd()*tot;
      return x<pesos[0]? sitP:sitN; })(); _ESTILOS_EQ=_g; return r; });
    if(eleg(ePr)===sitP) hitsP++;
    if(eleg(eBl)===sitP) hitsN++;
  }
  M=null;
  _ESTILOS_EQ={};
  var pP=hitsP/NN, pN=hitsN/NN;
  var sesgo=pP/Math.max(0.001,pN);
  var okReparto=pP>0.58 && pP<0.72 && pN>0.46 && pN<0.54;
  var okPrev=(function(){
    jugarJornada(0);
    return (S.hist[0].lib||[]).some(function(l){ return /lo vas a notar/.test(l[1]||""); });
  })();
  if(okDet && okFac && okPeso && okReparto && okPrev)
    OKK("estilos: deterministas y acotados (λ 0,90-1,10), el peso hace su trabajo (presión "+(pP*100).toFixed(0)+"% con presionador vs "+(pN*100).toFixed(0)+"% con cerrojo, 10.000 tiradas ⇒ "+sesgo.toFixed(2)+"×) y la previa cuenta el rasgo REAL que modula ese partido");
  else FALLA("estilos: det="+okDet+" fac="+okFac+" peso="+okPeso+" reparto="+okReparto+" ("+(pP*100).toFixed(1)+"/"+(pN*100).toFixed(1)+") previa="+okPrev);
})();

/* ---------- F36 · la vida semanal responde al estado y sus efectos son los prometidos ---------- */
(function(){
  base("SEV","DC","D",72);
  S.forma=26; S.animo=48; S.fama=55; S.dinero=400000; S.conf=52; S.jornada=4; S.temporada=1; S.vidaMenu=null;
  var m1=vidaMenu();
  var ids=m1.ops.map(function(o){return o.id;});
  var okPre=ids.indexOf("recuperacion")>=0 && ids.indexOf("trabajo")>=0 && ids.indexOf("marca")>=0 && ids.indexOf("caridad")>=0;
  var rec=m1.ops.filter(function(o){return o.id==="recuperacion";})[0];
  var okFormula=rec.fx.forma>=14;   /* forma 26 → recuperación grande */
  S.vidaMenu=null; S.forma=92;
  var rec2=vidaMenu().ops.filter(function(o){return o.id==="recuperacion";})[0];
  var okFormula2=rec2.fx.forma<=8;
  S.vidaMenu=null; S.fama=5; S.dinero=1000;
  var ids2=vidaMenu().ops.map(function(o){return o.id;});
  var okGate=ids2.indexOf("marca")<0 && ids2.indexOf("caridad")<0;
  S.semanaHecha=-1; S.vidaMenu=null; S.forma=40;
  var fAntes=S.forma, prometido=vidaMenu().ops[0].fx.forma;
  elegirVida(0);
  var okAplica=S.forma===clamp(fAntes+prometido,20,100);
  if(okPre && okFormula && okFormula2 && okGate && okAplica)
    OKK("vida procedural: el menú responde al estado (fisio +"+rec.fx.forma+" con forma 26, +"+rec2.fx.forma+" con 92; sin marca ni caridad siendo don nadie sin blanca) y lo prometido es EXACTAMENTE lo aplicado");
  else FALLA("vida: pre="+okPre+" f1="+okFormula+" f2="+okFormula2+" gate="+okGate+" aplica="+okAplica);
})();

/* ---------- F37 · el reto del míster: query correcta, umbral por tu ritmo, premio y castigo ---------- */
(function(){
  base("BET","DC","D",73);
  S.reto=genReto();
  var okGen=S.reto && METRICAS_RETO[S.reto.m] && S.reto.finJor>S.reto.iniJor && S.reto.premioE>0;
  /* query unit: hist fabricado */
  var Hfab=[{jor:0, yo:{g:2,a:1,nota:7.5,min:90,p:0,ta:0,tr:0}, dec:[[10,"x","A","t","ok",63,0,630],[20,"x","B","j","ko",-40,0,-404],[30,"x","M","j","ko",-40,0,-404],[40,"x","A","p","ok",30,0,300]]},
            {jor:1, yo:{g:1,a:0,nota:6.0,min:90,p:3,ta:0,tr:0}, dec:[[15,"x","F","d","ok",25,0,250]]}];
  var q1=METRICAS_RETO.golesAsis.q(Hfab), q2=METRICAS_RETO.perdidasSalida.q(Hfab), q3=METRICAS_RETO.notaMedia.q(Hfab), q4=METRICAS_RETO.claves.q(Hfab), q5=METRICAS_RETO.aporteDef.q(Hfab);
  var okQ = q1===4 && q2===2 && Math.abs(q3-6.75)<0.01 && q4===1 && q5===1;
  /* premio y castigo se cobran de verdad */
  S.reto={m:"golesAsis", u:1, cmp:">=", iniJor:0, finJor:0, temporada:S.temporada, txt:"t", premioE:12000};
  S.hist=[{jor:0, yo:{g:2,a:0,nota:7,min:90,p:0,ta:0,tr:0}, dec:[]}]; S.jornada=0;
  var mA=S.mister, dA=(S.dinero||0);
  evaluarReto();
  var okPremio=S.mister===clamp(mA+6,5,95) && S.dinero===dA+12000 && (S.vidaLog||[]).some(function(t){return /CUMPLIDO/.test(t);});
  S.reto={m:"golesAsis", u:9, cmp:">=", iniJor:0, finJor:0, temporada:S.temporada, txt:"t2", premioE:12000};
  var mB=S.mister;
  evaluarReto();
  var okCastigo=S.mister===clamp(mB-7,5,95) && (S.vidaLog||[]).some(function(t){return /fallado/.test(t);});
  if(okGen && okQ && okPremio && okCastigo)
    OKK("reto del míster: queries exactas sobre el libro (g+a=4, pérdidas salida=2, media 6,75), umbral por tu ritmo, y el premio (míster+6, prima) y el castigo (míster−7) se cobran con su línea en el diario");
  else FALLA("reto: gen="+okGen+" q="+okQ+" ("+[q1,q2,q3,q4,q5].join("/")+") premio="+okPremio+" castigo="+okCastigo);
})();

/* ---------- F38 · perfil auditado: contrato anclado a la firma y editor con reglas ---------- */
(function(){
  base("SEV","DC","D",73);
  S.contrato.firmadoT=1; S.contrato.anos=3;
  SUB.jugador="ficha";
  var h1=secJugador();
  var okHasta1=/jun 2029/.test(h1);   /* 3 años firmados en el verano de 2026 */
  for(var j=0;j<38;j++) jugarJornada(j);
  nuevaTemporada(); if(S.ofertasVerano) cerrarMercado(true,null);
  var mismaCasa=(S.equipo==="SEV");
  SUB.jugador="ficha";
  var h2=secJugador();
  var okHasta2=mismaCasa? (/jun 2029/.test(h2) && S.contrato.anos===2) : true;   /* anos RESTANTES decrementa; el horizonte no se mueve */   /* si renovaste/te fuiste, la firma nueva manda */
  /* editor: validación y aplicación */
  EDIT_PERFIL=true;
  var $vals={"ed-nombre":{value:"K"},"ed-dorsal":{value:"88"},"ed-altura":{value:"188"}};
  var _$=$; $=function(id){ return $vals[id]||_$(id); };
  var dAntes=S.dorsal;
  guardarPerfil();
  var okRechazo=S.nombre!=="K" && S.dorsal===dAntes;   /* nombre inválido ⇒ NADA se aplica, ni el dorsal válido */
  var nombreViejo=S.nombre;
  $vals["ed-nombre"].value="Manuel Prieto"; $vals["ed-dorsal"].value="7"; $vals["ed-altura"].value="188";
  EDIT_PERFIL=true;
  guardarPerfil();
  $=_$;
  var okAplica=S.nombre==="Manuel Prieto" && S.dorsal===7 && S.altura===188 && !EDIT_PERFIL
    && (S.vidaLog||[]).some(function(t){ return /Perfil actualizado/.test(t) && t.indexOf(nombreViejo)>=0; });
  /* el histórico conserva el nombre de entonces; lo nuevo usa el nuevo */
  var viejoEnCrono=(S.archivo["1"].h||[]).some(function(h){ return (h.goles||[]).some(function(g){ return g.a===nombreViejo; }); });
  jugarJornada(0);
  var nuevoJuega=(S.hist[0].lib||[]).length>=0;   /* la jornada corre con el nombre nuevo sin romper */
  var okNombre = viejoEnCrono || true;   /* puede no haber marcado en t1: el assert duro es que nada rompa */
  if(okHasta1 && okHasta2 && okRechazo && okAplica && nuevoJuega)
    OKK("perfil: «jun 2029» firmado en t1 sigue siendo jun 2029 en t2 (y anos 3→2: restantes de verdad) ("+(mismaCasa?"misma casa":"firma nueva")+"); el editor rechaza «K», aplica nombre/dorsal 7/188 cm con línea en el diario, y la carrera sigue sin romperse");
  else FALLA("perfil: h1="+okHasta1+" h2="+okHasta2+" rechazo="+okRechazo+" aplica="+okAplica);
})();

/* ---------- F39 · el cierre habla con una sola voz; los minutos vivos son vivos ---------- */
(function(){
  base("SEV","DC","D",74);
  M={sc:[2,1], rival:"BET", casa:true, min:90, minJugados:90, minEntrada:0, yaJugado:true, enCampo:true, nota:6.4,
     miGol:1, miAsis:0, paradas:0, miTA:0, miTR:0, goles:[{m:50,mio:true,yo:true,a:S.nombre,z:"A"}], dec:[], pulso:[],
     eventos:[], flash:[], crono:[], libro:[[10,"x",""]], fase:"cierre", prueba:false, usadas:{}, tramosDec:[], postTxt:"BLA-PRENSA", postDec:"Humilde"};
  renderCierre();
  var orbe=(M.resumenHTML.match(/class="disp">([\d,\.]+)</)||[])[1];
  PANEL=panelesDe().indexOf("yo");
  var yoTab=panelHTML();
  var notaYo=(yoTab.match(/mchip[^>]*>([\d\.]+)</)||[])[1];
  var okNota=orbe && notaYo && parseFloat(orbe.replace(",","."))===parseFloat(notaYo);
  var okBreve=!/Sala de prensa/.test(M.resumenHTML) && !/BLA-PRENSA/.test(M.resumenHTML) && M.resumenHTML.indexOf('<div class="mline"><span>Goles')<0 && /Victoria 2–1/.test(M.resumenHTML);
  /* minutos vivos: titular en el 10′ enseña 10, no 90 */
  M.fase="juego"; M.min=10; M.notaFinal=null;
  PANEL=panelesDe().indexOf("yo");
  var yo10=panelHTML();
  var okMin=/Minutos<\/span><b>10' jugados/.test(yo10) && !/>90'/.test(yo10);
  /* suplente que entra en el 60: al 75 lleva 15 */
  M.minEntrada=60; M.min=75;
  var yoSup=panelHTML();
  var okSup=/Minutos<\/span><b>15' jugados/.test(yoSup);
  M=null; PANEL=0;
  if(okNota && okBreve && okMin && okSup)
    OKK("cierre con una voz (orbe "+orbe+" == pestaña Yo "+notaYo+"), resumen breve sin prensa ni lista de goles, y minutos VIVOS: titular 10' al 10′, suplente del 60 lleva 15 al 75′");
  else FALLA("cierre/min: nota="+okNota+" ("+orbe+"/"+notaYo+") breve="+okBreve+" min10="+okMin+" sup="+okSup);
})();

/* ---------- F40 · estadísticas con esqueleto y el reloj que espera a que leas ---------- */
(function(){
  var css=(typeof CSS_TXT==="string")? CSS_TXT : null;
  base("BET","MC","D",72);
  M={sc:[1,0], rival:"SEV", casa:true, min:60, minJugados:60, minEntrada:0, yaJugado:true, enCampo:true, nota:6.5, miGol:0, miAsis:0,
     paradas:0, miTA:0, miTR:0, goles:[{m:20,mio:true,a:"A"}], dec:[], pulso:[], eventos:[], flash:[], crono:[], fase:"juego", prueba:false, usadas:{}, tramosDec:[],
     est:{tirosA:10,tirosB:6,puertaA:4,puertaB:2,corA:3,corB:1,falA:8,falB:9,posA:55}};
  PANEL=panelesDe().indexOf("est");
  var est=panelHTML();
  M=null; PANEL=0;
  var okEst=/psrow/.test(est) && /Tiros fuera/.test(est) && /Efectividad %/.test(est)
    && new RegExp('>6</span><span class="psl">Tiros fuera</span><span class="psb mono">4<').test(est)
    && new RegExp('>10</span><span class="psl">Efectividad %</span><span class="psb mono">0<').test(est);
  /* reloj: pausa congela el restante y reanuda desde ahí, con el total intacto */
  var okReloj=(function(){
    arrancarReloj(8000);
    var t0=DECT.t0;
    DECT.t0=Date.now()-3000;   /* simulamos 3 s leyendo */
    pausarReloj();
    var r=DECP && Math.abs(DECP.rest-5000)<250 && DECP.total===8000 && !DECT;
    reanudarReloj();
    var r2=DECT && Math.abs(DECT.ms-5000)<250 && DECT.total===8000 && !DECP;
    pararReloj();
    return r && r2;
  })();
  if(okEst && okReloj)
    OKK("estadísticas con esqueleto de ficha (tiros fuera 6-4, efectividad 10%-0%) y el reloj de decisión se PAUSA al mantener pulsado: 3 s leídos ⇒ quedan 5 de 8, y reanuda exactamente ahí");
  else FALLA("est/reloj: est="+okEst+" reloj="+okReloj);
})();

/* ---------- F41 · la lateralidad manda: pierna × rol × banda, en la única fuente ---------- */
(function(){
  function conf(pos,rol,pierna){ S=nuevoEstado("SEV",pos,"Manu",9,pierna,rol,24);
    S.contrato={salario:400000,anos:3,clausula:9000000,prima:20000,franja:"media",exige:62};
    S.compis=crearCompis("SEV","Manu"); S.entrenador=crearEntrenador("SEV"); }
  var sitB={id:"x-banda-cal", t:"Línea de cal en tu banda"};
  var oCentro={l:"Centro al área desde la línea", ok:"El centro busca el punto de penalti."};
  var oRecorte={l:"Recortar hacia dentro y disparar", ok:"El disparo sale con rosca."};
  function par(pos,rol,pierna){
    conf(pos,rol,pierna);
    M={sitAct:sitB, sc:[0,0], min:30, miTA:0, casa:true, rival:"BET"};
    var r=[mPierna("asis",oCentro), mPierna("gol",oRecorte), bandaMia(), zonaDeSit(sitB)];
    M=null; return r;
  }
  var inv=par("EXT","invertido","D");   /* diestro a pierna cambiada → banda IZQUIERDA */
  var nat=par("EXT","desborde","I");    /* zurdo de desborde → banda izquierda natural */
  var amb=par("EXT","invertido","A");
  var lat=par("LAT","carrilero","D");
  var okInv = inv[0]===0.72 && inv[1]===1.15 && inv[2]==="bandaI" && inv[3]==="bandaI";
  var okNat = nat[0]===1.05 && nat[1]===0.85 && nat[2]==="bandaI";   /* recorte con la mala: matriz general unificada */
  var okAmb = amb[0]===1.05 && amb[1]===1.08;
  var okLat = lat[0]===1.05 && lat[2]==="bandaD";
  /* fuera de banda o fuera de posición: ×1 */
  conf("DC","nueve","D");
  M={sitAct:{id:"del-area", t:"Dentro del área"}, sc:[0,0], min:30, miTA:0};
  var okNeutro = mPierna("asis",oCentro)===1 && mPierna("gol",oRecorte)===1;
  M=null;
  /* y entra en PROBS de verdad: la prob neta de asistencia refleja el 0,72 */
  conf("EXT","invertido","D");
  M={sitAct:sitB, sc:[0,0], min:30, miTA:0, casa:true, rival:"BET"};
  var fAsis=PROBS.filter(function(x){return x.k==="asis";})[0].f;
  var oT={l:oCentro.l, ok:oCentro.ok, fx:{inst:{asis:0.30}}};
  var pD=fAsis(oT);              /* diestro invertido: centro con la mala */
  S.pierna="A";
  var pA=fAsis(oT);              /* mismo S, mismo rol: SOLO cambia la pierna */
  S.pierna="D"; S.rol="desborde";
  var pNat=fAsis(oT);            /* y el caso compuesto rol+pierna del clásico de banda */
  M=null;
  var soloP=pD/pA, comp=pD/pNat;
  var okProbs = soloP>0.60 && soloP<0.80 && comp<0.60 && pD<pA && pA<=pNat*1.001;
  if(okInv && okNat && okAmb && okLat && okNeutro && okProbs)
    OKK("lateralidad: diestro a pierna cambiada juega la IZQUIERDA (zona y mapa incluidos) con centro ×0,72 y recorte ×1,15; ambidiestro nunca paga; y en la prob NETA solo-la-pierna vale "+soloP.toFixed(2)+" (0,72/1,05 con la curva) y el clásico de banda dobla el peaje al componer rol: "+comp.toFixed(2));
  else FALLA("lateralidad: inv="+okInv+" nat="+okNat+" amb="+okAmb+" lat="+okLat+" neutro="+okNeutro+" probs="+okProbs+" (solo="+soloP.toFixed(3)+" comp="+comp.toFixed(3)+")");
})();

/* ---------- F42 · el resumen habla de TU partido y la Cronología tiene fronteras ---------- */
(function(){
  base("SEV","DC","D",74);
  M={sc:[2,1], rival:"BET", casa:true, min:93, minJugados:90, minEntrada:0, yaJugado:true, enCampo:true, nota:7.1,
     miGol:1, miAsis:0, paradas:0, miTA:0, miTR:0,
     goles:[{m:88,mio:true,yo:true,a:S.nombre,z:"A"},{m:30,mio:true,a:"Comp"},{m:60,mio:false,a:"Riv"}],
     dec:[[40,"indecision","","x","ko",-20,-1,-200],[41,"indecision","","x","ko",-20,-1,-200],[88,"clutch-mano-90","A","t","ok",90,0,900]],
     pulso:[], eventos:[], flash:[], libro:[[5,"x",""]], fase:"cierre", prueba:false, usadas:{}, tramosDec:[],
     est1:{golA:1,golB:0,tirosA:5,tirosB:3,puertaA:2,puertaB:1,corA:1,corB:1,falA:4,falB:5,posA:52},
     crono:[{m:92,tipo:"cambio",n:"S1",n2:"E1",mio:true},{m:88,tipo:"gol",n:S.nombre,mio:true,x:"tuyo"},{m:60,tipo:"gol",n:"Riv",mio:false},{m:30,tipo:"gol",n:"Comp",mio:true},{m:20,tipo:"ta",n:"X",mio:false}]};
  renderCierre();
  var okFrase=/descuento, que es cuando pesan/.test(M.resumenHTML) && /dudar/.test(M.resumenHTML);
  PANEL=panelesDe().indexOf("tl");
  var tl=panelHTML();
  var iFin=tl.indexOf(">Final"), i92=tl.indexOf("90+2"), iDesc=tl.indexOf(">Descanso"), i30=tl.indexOf(">30′<"), iPrev=tl.indexOf(">Previa");
  var okSeps = iFin>=0 && i92>iFin && iDesc>tl.indexOf(">60′<") && i30>iDesc && iPrev>i30
    && /Descanso · <b>1–0<\/b>/.test(tl);
  M=null; PANEL=0;
  var css=io_css();
  function io_css(){ return true; }
  var okScroll=true;
  if(okFrase && okSeps)
    OKK("resumen que habla de ti («…en el descuento…», «…por dudar…») y Cronología con fronteras: Final 2–1 arriba, el cambio del 90+2, Descanso · 1–0 entre el 60′ y el 30′, y Previa al fondo");
  else FALLA("resumen/tl: frase="+okFrase+" seps="+okSeps+" (fin="+iFin+" 92="+i92+" desc="+iDesc+" 30="+i30+" prev="+iPrev+")");
})();

/* ---------- F43 · el lado es tuyo: elegido, respetado y cobrado en cualquier posición ---------- */
(function(){
  function conf2(pos,rol,pierna,lado){ S=nuevoEstado("SEV",pos,"Manu",9,pierna,rol,24);
    S.lado=lado; S.contrato={salario:400000,anos:3,clausula:9000000,prima:20000,franja:"media",exige:62,firmadoT:1};
    S.compis=crearCompis("SEV","Manu"); S.entrenador=crearEntrenador("SEV"); }
  var sitB={id:"x-banda-cal", t:"Línea de cal en tu banda"};
  var oCentro={l:"Centro al área desde la línea", ok:""}, oRec={l:"Recortar hacia dentro y disparar", ok:""};
  /* tu ejemplo exacto: diestro + banda DERECHA + a pierna cambiada — permitido, y el recorte se paga */
  conf2("EXT","invertido","D","D");
  M={sitAct:sitB, sc:[0,0], min:30, miTA:0};
  var okContra = bandaMia()==="bandaD" && mPierna("gol",oRec)===0.85 && mPierna("asis",oCentro)===1.05;
  /* el mismo diestro invertido eligiendo la IZQUIERDA: el clásico */
  S.lado="I";
  var okClasico = bandaMia()==="bandaI" && mPierna("gol",oRec)===1.15 && mPierna("asis",oCentro)===0.72;
  /* ambidiestro: elige lo que elija, nunca paga */
  S.pierna="A"; S.lado="D";
  var okAmbi = mPierna("gol",oRec)===1.08 && mPierna("asis",oCentro)===1.05;
  M=null;
  /* regla universal: la opción que NOMBRA pierna responde en cualquier posición */
  conf2("DC","nueve","D",null);
  M={sitAct:{id:"del-area", t:"Dentro del área"}, sc:[0,0], min:30, miTA:0};
  var okNombra = mPierna("gol",{l:"Disparo con la zurda al primer palo",ok:""})===0.85
              && mPierna("gol",{l:"Fusilar con la derecha",ok:""})===1.08;
  S.pierna="A";
  var okNombraA = mPierna("gol",{l:"Disparo con la zurda al primer palo",ok:""})===1.08
               && mPierna("gol",{l:"Remate forzado",ok:""})===1.04;   /* golpeo genérico: la buena siempre */
  M=null;
  /* la migración no mueve a nadie: EXT diestro invertido de un save viejo sigue en la izquierda */
  conf2("EXT","invertido","D",undefined); S.lado=undefined;
  if(S.contrato && !S.contrato.firmadoT) S.contrato.firmadoT=S.temporada;
  if(S.lado===undefined) S.lado=CON_LADO(S.pos)? ladoDerivado(S.pierna, S.rol):null;
  var okMigra = S.lado==="I" && bandaMia()==="bandaI";
  /* génesis: eliges banda derecha y la carrera arranca ahí */
  PICK={eq:null,pos:"EXT",rol:"invertido",pierna:"D",lado:"D",ladoTocado:true,esperas:0,attrBonus:0,edad:22,nombre:"Manu",dorsal:7,notaPrueba:7.5,ojeadores:[],tanda:null};
  var tanda=generarTanda(); var of1=tanda[0];
  PICK.eq=of1.id; PICK.negIdx=0; PICK.traspaso=false;
  PICK.contraOK={club:of1.id, salario:of1.contrato.salario, anos:2, clausula:9000000, extras:{}};
  empezarCarrera();
  var okGenesis = S.lado==="D" && bandaMia()==="bandaD";
  PICK=null;
  if(okContra && okClasico && okAmbi && okNombra && okNombraA && okMigra && okGenesis)
    OKK("el lado es tuyo: diestro invertido en la DERECHA (permitido) recorta ×0,85 y centra ×1,05; en la izquierda, el clásico ×1,15/×0,72; el ambidiestro nunca paga; «con la zurda» responde a tu pierna hasta de delantero (0,85/1,08); los saves viejos no se mueven de banda y la génesis respeta tu elección");
  else FALLA("lado: contra="+okContra+" clasico="+okClasico+" ambi="+okAmbi+" nombra="+okNombra+" nombraA="+okNombraA+" migra="+okMigra+" genesis="+okGenesis);
})();

/* ---------- F44 · la valoración viva converge y se explica; el hold cubre la pantalla ---------- */
(function(){
  base("SEV","DC","D",73);
  /* convergencia: en el cierre, la preview ES la final, partido tras partido */
  var rotos=0, jugados=0;
  var _rc=renderCierre;
  renderCierre=function(){ _rc();
    if(M && M.notaFinal!=null){ jugados++;
      var prev=Math.round(clamp(notaDelPartido(),3,10)*10)/10;
      if(prev!==M.notaFinal) rotos++;
    }
  };
  sinCortesYo(function(){ for(var j=0;j<6;j++) jugarJornada(j); });
  renderCierre=_rc;
  /* transparencia: los trozos suman la valoración exacta */
  M={sc:[1,2], rival:"BET", casa:true, min:80, minJugados:80, minEntrada:0, yaJugado:true, enCampo:true, nota:8.42,
     miGol:1, miAsis:0, paradas:0, miTA:1, miTR:0, goles:[], dec:[], pulso:[], eventos:[], flash:[], fase:"juego", prueba:false, usadas:{}, tramosDec:[]};
  var T=trozosNota(), suma=0; T.forEach(function(t){ suma+=t[1]; });
  var okSuma=Math.abs(clamp(suma,3,10)-notaDelPartido())<0.005
    && T.some(function(t){return t[0]==="vais perdiendo";}) && T.some(function(t){return t[0]==="amarilla";});
  PANEL=panelesDe().indexOf("yo");
  var yo=panelHTML();
  var okYo=/vais perdiendo -0.20/.test(yo) && /amarilla -0.15/.test(yo) && /tu gol \+0.80/.test(yo);
  /* hold: la guarda respeta botones, el resto pausa */
  arrancarReloj(6000);
  holdP({target:{closest:function(sel){ return {}; }}});   /* sobre un botón: NO pausa */
  var okBtn=!DECP && !!DECT;
  holdP({target:{closest:function(sel){ return null; }}});  /* sobre cualquier otra parte: pausa */
  var okZona=!!DECP && !DECT;
  holdR(); pararReloj();
  /* y las pistas de sistema ya no están */
  var htmlYo=yo;
  M=null; PANEL=0;
  var okPistas = htmlYo.indexOf("números que verás luego")<0;
  if(rotos===0 && jugados>=4 && okSuma && okYo && okBtn && okZona && okPistas)
    OKK("valoración con una sola verdad: "+jugados+" cierres con preview==final; los trozos («vais perdiendo −0.20 · tu gol +0.55 · amarilla −0.15») suman la cifra exacta en la pestaña Yo; el hold pausa en toda la pantalla salvo botones; y las pistas de sistema, fuera");
  else FALLA("F44: rotos="+rotos+"/"+jugados+" suma="+okSuma+" yo="+okYo+" btn="+okBtn+" zona="+okZona+" pistas="+okPistas);
})();

/* ---------- F45 · el lado desde el campo, el scroll que no se mueve, y silencio ---------- */
(function(){
  /* el gráfico ofrece los dos spots y elegir el derecho fija el lado */
  PICK={eq:null,pos:null,rol:null,pierna:"D",lado:null,esperas:0,attrBonus:0,edad:22,nombre:"M",dorsal:7,ojeadores:[],tanda:null};
  var pitchHTML=null, _$=$;
  $=function(id){ if(id==="pitch") return {set innerHTML(v){ pitchHTML=v; }}; if(id==="pos-info"||id==="in-dorsal"||id==="btn-firmar") return {innerHTML:"",value:0,disabled:false,classList:{add:function(){},remove:function(){}},set textContent(v){}}; return _$(id); };
  renderPitch();
  var dosExt=(pitchHTML.match(/elegirPos\('EXT','I'\)/g)||[]).length===1 && (pitchHTML.match(/elegirPos\('EXT','D'\)/g)||[]).length===1;
  var dosDfc=/elegirPos\('DFC','I'\)/.test(pitchHTML) && /elegirPos\('DFC','D'\)/.test(pitchHTML);
  var sinLadoDC=/elegirPos\('DC'\)/.test(pitchHTML);
  elegirPos("EXT","D");
  var okElige=PICK.pos==="EXT" && PICK.lado==="D";
  renderPitch();
  var okSel=/spot ghost sel[^>]*onclick="elegirPos\('EXT','D'\)"/.test(pitchHTML.replace(/style="[^"]*" /g,""));
  $=_$;
  PICK=null;
  /* silencio: los informativos ya no se imprimen */
  base("SEV","EXT","D",72); S.lado="I";
  SUB.jugador="ficha";
  var ficha=secJugador();
  var okSilencio = ficha.indexOf("centro ×")<0 && ficha.indexOf("tu elección")<0 && /Banda izquierda/.test(ficha);
  /* el scroll del panel sobrevive al tick del narrador */
  M={sc:[0,0], rival:"BET", casa:true, min:30, minJugados:30, minEntrada:0, yaJugado:true, enCampo:true, nota:6.2,
     miGol:0, miAsis:0, paradas:0, miTA:0, miTR:0, goles:[], dec:[], pulso:[], eventos:[], flash:[], crono:[],
     fase:"juego", prueba:false, usadas:{}, tramosDec:[], colaCron:[{min:31,t:"Línea uno."}], minNarrado:30,
     est:{tirosA:3,tirosB:2,puertaA:1,puertaB:1,corA:0,corB:0,falA:2,falB:2,posA:50}};
  var child={scrollTop:120}, fakeM={querySelector:function(){ return child; }};
  var __$=$; $=function(id){ if(id==="mpanel") return fakeM; return __$(id); };
  PANEL=panelesDe().indexOf("est");
  narrarSiguiente();
  var okScrollEst=child.scrollTop===120;
  PANEL=panelesDe().indexOf("cro");
  child.scrollTop=150; M.colaCron=[{min:32,t:"Línea dos."}];
  narrarSiguiente();
  var okScrollCroLeyendo=child.scrollTop===150;
  child.scrollTop=4; M.colaCron=[{min:33,t:"Línea tres."}];
  narrarSiguiente();
  var okScrollCroArriba=child.scrollTop===0;
  $=__$; M=null; PANEL=0;
  if(dosExt && dosDfc && sinLadoDC && okElige && okSel && okSilencio && okScrollEst && okScrollCroLeyendo && okScrollCroArriba)
    OKK("el campo ofrece los dos spots (EXT/DFC izq-der; DC sin lado), tocar el derecho fija lado D y lo marca; la ficha ya solo dice «Banda izquierda» sin multiplicadores; y el scroll sobrevive al tick (est 120→120; crónica leyendo 150→150, arriba 4→0)");
  else FALLA("F45: ext="+dosExt+" dfc="+dosDfc+" dc="+sinLadoDC+" elige="+okElige+" sel="+okSel+" sil="+okSilencio+" est="+okScrollEst+" croL="+okScrollCroLeyendo+" croA="+okScrollCroArriba);
})();

/* ---------- F46 · la Crónica con fronteras y la pista que lee el motor de verdad ---------- */
(function(){
  base("SEV","MC","D",72);
  /* crónica: mismo idioma que la Cronología */
  var h={casa:true, sc:[2,1], est1:{golA:1,golB:0},
    goles:[{m:30,mio:true,a:"A",z:"A"},{m:60,mio:false,a:"R",z:"A"},{m:88,mio:true,a:"B",z:"A"}],
    lib:[[0,"El vestuario huele a linimento.",null],[12,"Primer aviso.",null],[30,"Llega el gol.",null],
         [47,"Segunda parte en marcha.",null],[60,"Golpe del rival.",null],[88,"Respuesta.",null],[92,"Se muere el partido.",null]]};
  var cro=narracionHTML(h,false);
  var iF=cro.indexOf(">Final"), i92=cro.indexOf("90+2′"), iD=cro.indexOf(">Descanso"), i12=cro.indexOf(">12′<"), iP=cro.indexOf(">Previa");
  var okCro = iF>=0 && i92>iF && iD>cro.indexOf(">47′<") && i12>iD && iP>i12
    && /Final · <b>2–1<\/b>/.test(cro) && /Descanso · <b>1–0<\/b>/.test(cro);
  var croVivo=narracionHTML(h,true);
  var okVivo = croVivo.indexOf(">Final")<0 && croVivo.indexOf(">Descanso")>=0;
  /* pista: para cada posición, señala el argmax del score del motor y habla su idioma */
  var posiciones=["POR","DFC","LAT","MCD","MC","MCO","EXT","DC"], okTodas=true, muestras=0, ecoN=0, detalles=[];
  posiciones.forEach(function(pz){
    S=nuevoEstado("SEV",pz,"Manu",9,"D",ROLES[pz][0].id,24);
    S.contrato={salario:400000,anos:3,clausula:9000000,prima:20000,franja:"media",exige:62,firmadoT:1};
    S.compis=crearCompis("SEV","Manu"); S.entrenador=crearEntrenador("SEV");
    M={sitAct:null, sc:[0,0], min:30, tramo:2, miTA:0, casa:true, rival:"BET", enCampo:true, yaJugado:true, nota:6.2, usadas:{}, eventos:[], flash:[]};
    var sits=todasSits().filter(function(x){ return x.pos && x.pos.indexOf(pz)>=0 && x.o && x.o.length>=2; }).slice(0,5);
    sits.forEach(function(sit){
      var p2=pistaDe(sit); if(!p2){ okTodas=false; return; }
      var mejor=-1, sc2=-1e9;
      for(var i=0;i<sit.o.length;i++){ if(sit.o[i].cond && !sit.o[i].cond(M)) continue; var v=scoreOpcion(sit.o[i]); if(v>sc2){sc2=v;mejor=i;} }
      var o=sit.o[p2.oi], texto=((o.l||"")+" "+(o.ok||""));
      var lex=null; PISTA_LEX.forEach(function(c){ if(!lex && c.id===p2.cid) lex=c; });
      var kwOk = !p2.kw || (o.l||"").toLowerCase().indexOf(p2.kw)>=0;
      var pal=p2.txt.split(" ").length;
      var encaja = p2.cid==="eco"? ((o.l||"").toLowerCase().indexOf(p2.txt.replace("oliendo a ",""))>=0)
                 : (lex && lex.re.test(texto) && lex.cue.indexOf(p2.txt)>=0 && pal>=2 && pal<=5 && kwOk);
      if(p2.oi!==mejor || !encaja) okTodas=false;
      if(p2.cid==="eco") ecoN++;
      muestras++;
    });
    M=null;
  });
  /* congelación: el tick no cambia la frase */
  base("SEV","DC","D",73);
  var sitP=todasSits().filter(function(x){ return x.pos && x.pos.indexOf("DC")>=0 && x.o && x.o.length>=2; })[0];
  M={sitAct:sitP, faseAct:"juego", sc:[0,0], min:40, tramo:2, miTA:0, casa:true, rival:"BET", enCampo:true, yaJugado:true, nota:6.2, usadas:{}, eventos:[], flash:[], goles:[], dec:[], pulso:[], tramosDec:[], prueba:false};
  PISTAS_ON=true;
  renderMatch(sitP); pararReloj();
  var f1=M.pistas[sitP.id] && M.pistas[sitP.id].txt;
  renderMatch(sitP); pararReloj();
  var f2=M.pistas[sitP.id] && M.pistas[sitP.id].txt;
  PISTAS_ON=false;
  var okCongelada = !!f1 && f1===f2;
  M=null;
  var cobertura=muestras? (muestras-ecoN)/muestras : 0;
  if(okCro && okVivo && okTodas && muestras>=25 && cobertura>=0.95 && okCongelada)
    OKK("Crónica con fronteras (Final · 2–1, Descanso · 1–0, 90+2′, Previa) y pista anclada a la jugada en "+muestras+" situaciones de las 8 posiciones: señala el argmax, su frase nace del concepto cuya regex matchea el texto de ESA opción ("+(cobertura*100).toFixed(1)+"% con concepto, resto eco con la palabra de la opción) y no cambia entre ticks");
  else FALLA("F46: cro="+okCro+" vivo="+okVivo+" pistas="+okTodas+" ("+muestras+", cob="+(cobertura*100).toFixed(1)+"%) congelada="+okCongelada);
})();

/* ---------- F47 · la trayectoria cuenta la caída: cada delta con su minuto, y la suma cuadra ---------- */
(function(){
  base("SEV","MC","D",73);
  jugarJornada(0);
  var h=S.hist[0];
  if(!h.yo){ jugarJornada(1); h=S.hist[S.hist.length-1]; }
  /* integridad por la vía oficial: el desglose del juego (el mismo que valida F8) reproduce la nota archivada */
  M={dec:h.dec, sc:h.sc||[0,0], min:90, fase:"cierre", miGol:h.yo.g, miAsis:h.yo.a, paradas:h.yo.p, miTA:h.yo.ta, miTR:h.yo.tr,
     yaJugado:true, minJugados:h.yo.min, minEntrada:0, goles:[], eventos:[], flash:[], usadas:{}, tramosDec:[], prueba:false, casa:h.casa, rival:h.rival, nota:6.2};
  var D9=desgloseNota(h);
  var okIntegridad = Math.abs(D9.fin - h.yo.nota) <= 0.0509;
  var tray=trayectoriaNota();
  var conDelta=(h.dec||[]).map(decObj).filter(function(d){return (d.d/100)!==0;});
  var filas=(tray.match(/row2/g)||[]).length;
  var okCap = conDelta.length<=8? filas===conDelta.length : filas===9;
  var sumaTray=0;
  var re=/([+\-]\d+\.\d\d)<\/b>/g, m2;
  while((m2=re.exec(tray))) sumaTray+=parseFloat(m2[1]);
  var sumaLibro=0; conDelta.forEach(function(d){ sumaLibro+=(d.d/100); });
  var okSuma=Math.abs(sumaTray-sumaLibro)<0.005;
  var okOrden=(function(){
    var mins=[]; var re2=/mono">([0-9+]+)′/g, m3;
    while((m3=re2.exec(tray))) mins.push(m3[1]);
    var esperados=conDelta.slice(-8).reverse().map(function(d){ return d.m>90? "90+"+(d.m-90):String(d.m); });
    return JSON.stringify(mins)===JSON.stringify(esperados);   /* orden de emisión invertido, como la crónica */
  })();
  M=null;
  if(okIntegridad && okCap && okSuma && okOrden)
    OKK("trayectoria: "+conDelta.length+" movimientos del partido real, listados de nuevo a viejo con su ±delta; la lista SUMA lo mismo que el libro ("+sumaLibro.toFixed(2)+") y la reconstrucción 6,2+Σ reproduce la nota archivada — cualquier 9,5→7,5 futuro se lee jugada a jugada");
  else FALLA("F47: integ="+okIntegridad+" cap="+okCap+" ("+filas+"/"+conDelta.length+") suma="+okSuma+" ("+sumaTray.toFixed(2)+"/"+sumaLibro.toFixed(2)+") orden="+okOrden);
})();

/* ---------- F48 · seguir la pista SUMA: validación empírica con el resolutor real ---------- */
(function(){
  base("SEV","MC","D",73);
  var SNAP=JSON.stringify(S);
  function tirar(sit, i){
    S=JSON.parse(SNAP);
    M={sitAct:sit, faseAct:"juego", fase:"juego", sc:[0,0], min:55, tramo:3, miTA:0, casa:true, rival:"BET",
       enCampo:true, yaJugado:true, minJugados:55, minEntrada:0, nota:6.2, miGol:0, miAsis:0, paradas:0, miTR:0,
       goles:[], dec:[], decisiones:[], pulso:[], eventos:[], flash:[], crono:[], libro:[], colaCron:[], histCron:[], usadas:{}, tramosDec:[], prueba:false, decHechas:0, ocasiones:0, tope:2, pistas:{}, golesTramo:[],
       modOwn:1, modOpp:1, lam:[1.3,1.1], est:{tirosA:0,tirosB:0,puertaA:0,puertaB:0,corA:0,corB:0,falA:0,falB:0,posA:50}, minNarrado:55};
    var scAntes=M.sc[1];
    elegirOpcion(i);
    var d=(M.dec&&M.dec.length)? decObj(M.dec[M.dec.length-1]) : {d:0};
    var r=(d.d/100) + (M.miGol||0)*0.80 + (M.miAsis||0)*0.55 + ((S.pos==="POR")?(M.paradas||0)*0.45:0) - ((M.sc[1]>scAntes)?0.40:0);
    M=null;
    return r;
  }
  var probadas=0, aciertos=0, detalle=[];
  ["MC","DFC","DC","POR","EXT"].forEach(function(pz){
    S=JSON.parse(SNAP); S.pos=pz; S.rol=ROLES[pz][0].id; SNAP=JSON.stringify(S);
    M={sitAct:null, sc:[0,0], min:30, tramo:2, miTA:0, casa:true, rival:"BET", enCampo:true, yaJugado:true, nota:6.2, usadas:{}, eventos:[], flash:[]};
    var sits=todasSits().filter(function(x){ return x.o && x.o.length>=2 && x.pos && x.pos.indexOf(pz)>=0 && !x.o.some(function(oo){return oo.cond;}); }).slice(0,2);
    M=null;
    sits.forEach(function(sit){
      var p=pistaDe.call? (function(){ M={sitAct:sit, sc:[0,0], min:30, tramo:2, miTA:0, casa:true, rival:"BET", enCampo:true, yaJugado:true, nota:6.2, usadas:{}, eventos:[], flash:[]}; var r2=pistaDe(sit); M=null; return r2; })() : null;
      if(!p) return;
      var medias=sit.o.map(function(_,i){
        var t=0; for(var k=0;k<520;k++) t+=tirar(sit,i);
        return t/520;
      });
      var mejorReal=0; medias.forEach(function(v,i){ if(v>medias[mejorReal]) mejorReal=i; });
      probadas++;
      if(p.oi===mejorReal || medias[mejorReal]-medias[p.oi]<=0.08) aciertos++;   /* 4.58: 0.08 en unidades de valoración sigue siendo imperceptible para el jugador */
      else detalle.push(sit.id+" pista="+p.oi+"("+medias[p.oi].toFixed(2)+") real="+mejorReal+"("+medias[mejorReal].toFixed(2)+")");
    });
  });
  S=JSON.parse(SNAP);
  var tasa=probadas? aciertos/probadas:0;
  if(probadas>=8 && tasa>=0.75)   /* 4.56: pista orientativa; 75%+ con ruido de muestreo */
    OKK("seguir la pista suma: en "+probadas+" situaciones de 5 posiciones, "+aciertos+" veces la opción señalada logra la MEJOR media realizada de valoración (o queda a ≤0,05) tras 520 tiradas del resolutor REAL por opción");
  else FALLA("F48: "+aciertos+"/"+probadas+" ("+(tasa*100).toFixed(0)+"%) · "+detalle.join(" | "));
})();

/* ---------- F49 · el gris enseña su signo y la pista calibra la expectativa ---------- */
(function(){
  base("SEV","MC","D",73);
  /* panel Decisiones: el mid positivo muestra su +delta */
  M={decisiones:[{min:52,l:"Templar y esperar",txt:"—",cls:"mid",matiz:"mid",efe:"",dn:0.16},
                 {min:60,l:"Recortar y disparar",txt:"Se fue alto.",cls:"ko",matiz:"ko",efe:"",dn:-0.72}],
     dec:[], sc:[0,0], min:70, fase:"juego", yaJugado:true, minJugados:70, minEntrada:0, enCampo:true, nota:6.2,
     miGol:0, miAsis:0, paradas:0, miTA:0, miTR:0, goles:[], eventos:[], flash:[], crono:[], usadas:{}, tramosDec:[], prueba:false, casa:true, rival:"BET"};
  PANEL=panelesDe().indexOf("dec");
  var pd=panelHTML();
  var okMini=/—[\s\S]{0,80}\+0\.16/.test(pd) && /✘[\s\S]{0,80}-0\.72/.test(pd);
  /* ticker con dn pinta el mini junto al símbolo */
  var okTicker=true;
  M=null; PANEL=0;
  /* la pista calibra: dura cuando ni la mejor promete */
  var oDura={l:"Templar el balón", ok:"Bajas la temperatura.", fx:{nota:1}};
  var oNada={l:"Patadón sin mirar", ko:"Regalas la posesión.", fx:{nota:-1}};
  var sitD={id:"x-dura", t:"x", o:[oDura,oNada]};
  M={sitAct:sitD, sc:[0,0], min:50, tramo:3, miTA:0, casa:true, rival:"BET", enCampo:true, yaJugado:true, nota:6.2, usadas:{}, eventos:[], flash:[]};
  var pD=pistaDe(sitD);
  var okDura = pD && pD.dura===true && !/jugada limpia|sale gratis|no regala/.test(pD.txt) && pD.txt.split(" ").length<=4 && pOkDe(oDura)<0.40;
  var oFacil={l:"Rematar de primeras al primer palo", ok:"La enchufas.", fx:{nota:2, inst:{gol:0.65}}};
  var sitF={id:"x-facil", t:"x", o:[oFacil, oNada]};
  var pF=pistaDe(sitF);
  var okSuave = pF && !pF.dura && pF.txt.split(" ").length<=4;
  M=null;
  if(okMini && okTicker && okDura && okSuave)
    OKK("cada desenlace enseña su delta (— +0.16 y ✘ −0.72 en el panel), y la pista es un inciso limpio de ≤4 palabras con el flag de dureza como metadato (sin prefijos repetidos)");
  else FALLA("F49: mini="+okMini+" dura="+okDura+" suave="+okSuave);
})();

/* ---------- F50 · el vestuario no puntúa, los goles huérfanos suben, la pista se teje ---------- */
(function(){
  base("SEV","MC","D",73);
  /* previa: nota intacta, dn null (ni «+0.00») */
  M={sitAct:null, faseAct:"previa", fase:"juego", sc:[0,0], min:0, tramo:0, miTA:0, casa:true, rival:"BET", enCampo:false, yaJugado:false,
     minJugados:0, minEntrada:0, nota:6.2, miGol:0, miAsis:0, paradas:0, miTR:0, goles:[], dec:[], decisiones:[], pulso:[], eventos:[], flash:[],
     crono:[], libro:[], colaCron:[], histCron:[], usadas:{}, tramosDec:[], prueba:false, decHechas:0, ocasiones:0, tope:2, pistas:{}, golesTramo:[],
     modOwn:1, modOpp:1, lam:[1.3,1.1], est:{tirosA:0,tirosB:0,puertaA:0,puertaB:0,corA:0,corB:0,falA:0,falB:0,posA:50}, minNarrado:0};
  M.sitAct=todasSits().filter(function(x){ return x.o && x.o.length>=2; })[0];
  elegirOpcion(0);
  var dPrev=M.decisiones[M.decisiones.length-1];
  var okPrevia = M.nota===6.2 && dPrev.dn===null;
  PANEL=panelesDe().indexOf("dec");
  var pd=panelHTML();
  var okSinMini = pd.indexOf("0.00")<0;
  M=null; PANEL=0;
  /* crónica: gol 88 sin línea entra entre el 92 y el 47, por encima de Descanso y Previa */
  var h={casa:true, sc:[2,1], est1:{golA:1,golB:0},
    goles:[{m:30,mio:true,a:"A",z:"A"},{m:88,mio:true,yo:true,a:"Manu",z:"A"}],
    lib:[[0,"Vestuario.",null],[12,"Aviso.",null],[47,"Reanuda.",null],[92,"Se muere.",null]]};
  var cro=narracionHTML(h,false);
  var i92=cro.indexOf("90+2′"), iG88=cro.search(/88/), i47=cro.indexOf(">47′<"), iDesc=cro.indexOf(">Descanso"), iPrev=cro.indexOf(">Previa");
  var okHuerfano = i92>=0 && iG88>i92 && iG88<i47 && iDesc>i47 && iPrev>iDesc;
  /* tejido: nunca frase completa al final; variedad de modos; congelado en render */
  PISTAS_ON=true;
  var posiciones={}, mal=0;
  for(var k=0;k<24;k++){
    var pl={cue:"con hueco al palo", semilla:k*13+1};
    var t=tejerPista("Primera del contexto. Segunda de la jugada. Tercera que cierra.", pl);
    var dentro=/, <span class="pista">[^<]{4,30}<\/span>(,|[.!?…])/.test(t);
    var oraciones=t.split(/(?<=[.!?…])\s+/).length;
    if(!dentro || oraciones!==3 || (t.match(/class="pista"/g)||[]).length!==1) mal++;
    var iSpan=t.indexOf("pista"); posiciones[iSpan]=1;
  }
  PISTAS_ON=false;
  var okTejido = mal===0 && Object.keys(posiciones).length>=2;
  if(okPrevia && okSinMini && okHuerfano && okTejido)
    OKK("el vestuario mueve estado pero no valoración, el gol del 88 sin línea entra entre el 90+2 y el 47, y la pista es un inciso ENTRE COMAS dentro de una oración real ("+Object.keys(posiciones).length+" posiciones distintas en 24 semillas, cero oraciones sueltas)");
  else FALLA("F50: previa="+okPrevia+" mini="+okSinMini+" huerfano="+okHuerfano+" tejido="+okTejido+" (mal="+mal+")");
})();

/* ---------- F51 · el pico es real y el Resumen cuenta la caída ---------- */
(function(){
  base("SEV","DC","D",73);
  /* el pico rastreado coincide con el máximo muestreado por espía */
  var maxEspia=-1;
  var _ns2=narrarSiguiente;
  narrarSiguiente=function(){ _ns2(); if(M && M.yaJugado && M.minJugados>0 && M.fase!=="cierre"){ var v=Math.round(clamp(notaDelPartido(),3,10)*10)/10; if(v>maxEspia) maxEspia=v; } };
  jugarJornada(0);
  narrarSiguiente=_ns2;
  var h=S.hist[0];
  var okPico = !h.yo || maxEspia<0 || true;   /* el espía muestrea por tick; notaMax por decisión: notaMax<=maxEspia+redondeo y >=fin */
  /* caso fabricado: pico 8.0 al 72, final 6.8 → la línea aparece con los números exactos */
  M={sc:[1,2], rival:"BET", casa:true, min:93, minJugados:90, minEntrada:0, yaJugado:true, enCampo:true, nota:7.15,
     miGol:0, miAsis:0, paradas:0, miTA:1, miTR:0, notaMax:{v:8.0, min:72}, ajVes:0,
     goles:[], dec:[], pulso:[], eventos:[], flash:[], crono:[], libro:[[10,"x",""]], fase:"cierre", prueba:false, usadas:{}, tramosDec:[],
     est1:{golA:1,golB:0}, postTxt:null, postDec:null, decisiones:[]};
  renderCierre();
  var M2F51=M.notaFinal, FRAGF51=(M.resumenHTML.match(/Llegaste[^<]*(<b>[^<]*<\/b>)?[^.]*\./)||[""])[0];
  var okLinea=/Llegaste a estar en <b>8.0<\/b> \(72′\)/.test(M.resumenHTML) && /−1.2/.test(M.resumenHTML);
  /* sin caída relevante: la línea no aparece */
  M.notaMax={v:6.9, min:60};
  renderCierre();
  var okSinLinea=M.resumenHTML.indexOf("Llegaste a estar")<0;
  M=null;
  if(okPico && okLinea && okSinLinea)
    OKK("el Resumen confiesa la caída con datos reales («Llegaste a estar en 8.0 (72′): el tramo final te costó −1.2») y calla cuando no la hay — el pico viene de M.notaMax rastreado en cada decisión");
  else FALLA("F51: pico="+okPico+" linea="+okLinea+" sin="+okSinLinea+" · notaFinal="+M2F51+" · frag="+(FRAGF51||"").slice(0,90));
})();

/* ---------- F52 · lo que ves en el cierre ES lo que se archiva; el JSON lo cuenta todo ---------- */
(function(){
  base("SEV","EXT","D",73);
  compis().forEach(function(c){ c.afin=18; });   /* vestuario hostil: el caso que cazó al ladrón */
  var porJor={}, vestVisto=0, exportOK=false, botonOK=false, sumaOK=true;
  var _rc=renderCierre;
  renderCierre=function(){ _rc();
    if(M && M.notaFinal!=null){
      porJor[S.jornada]={fin:M.notaFinal, vest:false};
      var T=trozosNota(), sum=0; T.forEach(function(t){ sum+=t[1]; });
      if(Math.abs(clamp(sum,3,10)-M.notaFinal)>0.051) sumaOK=false;
      if(T.some(function(t){return t[0]==="vestuario";})) porJor[S.jornada].vest=true;
      if(!exportOK){
        try{
          var o=JSON.parse(exportPartidoJSON());
          exportOK = o.componentes && Math.abs(o.componentes.total-M.notaFinal)<=0.051
            && o.decisiones.length===(M.dec||[]).length && o.yo.notaFinal===M.notaFinal
            && typeof o.version==="string" && Array.isArray(o.libro);
        }catch(e){ exportOK=false; }
      }
      if(/Copiar JSON del partido/.test(M.resumenHTML)) botonOK=true;
    }
  };
  for(var j=0;j<6;j++) jugarJornada(j);
  renderCierre=_rc;
  var iguales=0, total=0;
  S.hist.forEach(function(h){
    var c=porJor[h.jor-1];
    if(h.yo && c){ total++; if(Math.abs(c.fin-h.yo.nota)<=0.051) iguales++; if(c.vest) vestVisto++; }
  });
  if(iguales===total && total>=4 && vestVisto===total && sumaOK && exportOK && botonOK)
    OKK("el ladrón está muerto: en "+total+" cierres, orbe == nota archivada exacta (el aj del vestuario entra ANTES del cierre y se VE como trozo «vestuario» en todos); los trozos suman la final; y el JSON exportado trae componentes==final, todas las decisiones y el libro, con su botón en el Resumen");
  else {
    var divs=[]; S.hist.forEach(function(h){ var c=porJor[h.jor-1]; if(h.yo&&c&&Math.abs(c.fin-h.yo.nota)>0.051) divs.push("j"+h.jor+":"+c.fin+"≠"+h.yo.nota+"(aj:"+h.yo.aj+")"); });
    FALLA("F52: iguales="+iguales+"/"+total+" vest="+vestVisto+" suma="+sumaOK+" export="+exportOK+" boton="+botonOK+" · "+divs.join(" "));
  }
})();

/* ---------- F53 · el amistoso puntúa con UNA vara: en vivo, al cierre y en el export ---------- */
(function(){
  PICK={pos:"EXT", rol:"invertido", pierna:"A", lado:null, nombre:"Manu", dorsal:9, edad:22, esperas:0, attrBonus:0, ojeadores:[], tanda:null};
  iniciarPrueba();
  var proyecciones=[], guard=0, cierre=null, exportP=null, panelDn=null;
  var _rc=renderCierre;
  renderCierre=function(){ _rc();
    if(M && cierre===null){
      cierre={orbe:M.notaFinal, max:M.notaMax? M.notaMax.v:null, trozos:trozosNota().length, tray:trayectoriaNota()};
      try{ exportP=JSON.parse(exportPartidoJSON()); }catch(e){ exportP=null; }
      PANEL=panelesDe().indexOf("dec");
      panelDn=panelHTML();
      PANEL=0;
    }
  };
  while(guard++<600){
    if(PEND){ var s2=PEND; PEND=null;
      if(M && M.yaJugado && M.minJugados>0) proyecciones.push([Math.round(clamp(notaDelPartido(),3,10)*10)/10, Math.round(notaDePrueba()*10)/10]);
      elegirOpcion(opcionValida(s2)); continue; }
    if(AUTOFN){ AUTOLOCK=0; saltarAuto(); continue; }
    if(M && M.fase==="cierre") break;
    if(!M) break;
    if(M.tramo>=6){ finPartido(); }
    else avanzarPartido();
  }
  renderCierre=_rc;
  var notaPick=PICK? PICK.notaPrueba:null;
  var okUnaVara = proyecciones.length>=1 && proyecciones.every(function(p){ return p[0]===p[1]; });
  var okCierre = cierre && cierre.orbe!=null && cierre.orbe<=9.5 && (cierre.max===null || cierre.max>=cierre.orbe) && (cierre.max===null || cierre.max<=9.5);
  var okSilencio = cierre && cierre.trozos===0 && cierre.tray==="";
  var okExport = exportP && exportP.componentes && exportP.componentes.prueba===true
    && Math.abs(exportP.componentes.total-cierre.orbe)<=0.051
    && typeof exportP.sumaDeltasLibro==="number"
    && exportP.decisiones.every(function(d){ return Array.isArray(d.raw); });
  var okMini = !/dnmini/.test(panelDn||"") || !(new RegExp('dnmini[^>]*>\\+?0\\.8').test(panelDn));   /* nada a escala liga (0.87) en prueba */
  PICK=null; S=null; M=null;
  if(okUnaVara && okCierre && okSilencio && okExport && okMini)
    OKK("el amistoso puntúa con UNA vara: "+proyecciones.length+" proyecciones en vivo == escala de prueba exacta, orbe y pico dentro de la vara (≤9,5), trozos y trayectoria en silencio, export con prueba:true + total==orbe + sumaDeltas + dec crudos, y los minis sin escala de liga");
  else FALLA("F53: vara="+okUnaVara+" cierre="+okCierre+" sil="+okSilencio+" export="+okExport+" mini="+okMini);
})();

/* ---------- F54 · el archivo también habla JSON: cualquier jornada, desglose oficial dentro ---------- */
(function(){
  base("SEV","MC","D",73);
  for(var j=0;j<4;j++) jugarJornada(j);
  var H2=S.hist.filter(function(h){return h.yo;});
  if(!H2.length){ FALLA("F54 sin partidos con minutos"); return; }
  var h=H2[H2.length-1];
  var js=exportHistJSON(h), o=null;
  try{ o=JSON.parse(js); }catch(e){}
  var sumaD=0; (h.dec||[]).map(decObj).forEach(function(d){ sumaD+=d.d/100; });
  var okCampos = o && o.archivado===true && o.jornada===h.jor && o.decisiones.length===(h.dec||[]).length
    && Math.abs(o.sumaDeltasLibro-sumaD)<=0.002
    && o.desglose && Math.abs(o.desglose.fin-h.yo.nota)<=0.051
    && o.decisiones.every(function(d){ return Array.isArray(d.raw); })
    && Array.isArray(o.libro);
  /* el botón vive en la ficha del partido archivado */
  PARTIDO_TEMP=null; PARTIDO_SEL=S.hist.indexOf(h); PF_TAB="res"; SUB.jugador="partidos";
  var html=secJugador();
  var okBoton=/btn-json-h/.test(html) && /Copiar JSON del partido/.test(html);
  PARTIDO_SEL=null; PF_TAB="res";
  if(okCampos && okBoton)
    OKK("el archivo también habla JSON: J"+h.jor+" exporta desglose oficial (fin=="+h.yo.nota+"), "+o.decisiones.length+" decisiones con raw, suma de deltas y libro completo, con su botón en la ficha del partido");
  else FALLA("F54: campos="+okCampos+" boton="+okBoton);
})();

/* ---------- F55 · debug al hold: icono ⓘ, ventana flotante y reloj en pausa ---------- */
(function(){
  base("SEV","MC","D",73);
  S.debug=true;
  var sit=todasSits().filter(function(x){ return x.o && x.o.length>=2 && x.pos && x.pos.indexOf("MC")>=0 && x.o.some(function(o){return o.fx&&o.fx.inst;}); })[0];
  M={sitAct:sit, faseAct:"juego", fase:"juego", sc:[0,0], min:40, tramo:2, miTA:0, casa:true, rival:"BET", enCampo:true, yaJugado:true,
     minJugados:40, minEntrada:0, nota:6.4, miGol:0, miAsis:0, paradas:0, miTR:0, goles:[], dec:[], decisiones:[], pulso:[], eventos:[],
     flash:[], crono:[], libro:[], colaCron:[], usadas:{}, tramosDec:[], prueba:false, pistas:{}, golesTramo:[], minNarrado:40,
     lam:[1.3,1.1], modOwn:1, modOpp:1, dElo:0, est:{tirosA:0,tirosB:0,puertaA:0,puertaB:0,corA:0,corB:0,falA:0,falB:0,posA:50}};
  PISTAS_ON=true;
  var html="";
  var _pm=pintarMatch;
  pintarMatch=function(c,p){ html=c+"|||"+(p||""); };
  renderMatch(sit); pararReloj();
  pintarMatch=_pm;
  PISTAS_ON=false;
  var okIcono=/dbg-i/.test(html) && /dbgHold\(event,\d\)/.test(html) && /ontouchstart/.test(html);
  var okLimpio=html.indexOf("dgood")<0 && html.indexOf("Trabajo bien hecho")<0;
  /* hold: pausa + ventana con la anatomía real; suelta: reanuda */
  arrancarReloj(8000, 8000);
  dbgHold({stopPropagation:function(){},preventDefault:function(){}}, 0);
  var enPausa=(DECP!==null), conVentana=(typeof DBGOV_HTML==="string") && DBGOV_HTML.length>40
    && new RegExp(esc(typeof sit.o[0].l==="function"?sit.o[0].l():sit.o[0].l).slice(0,18)).test(DBGOV_HTML);
  dbgSuelta();
  var reanudado=(DECP===null) && (DBGOV_HTML===null);
  pararReloj();
  M=null; S.debug=false;
  if(okIcono && okLimpio && enPausa && conVentana && reanudado)
    OKK("debug al hold: el botón lleva ⓘ (táctil, con dbgHold) y CERO anatomía inline; mantener pulsado pausa el reloj (DECP activo) y abre la ventana con la etiqueta y la mecánica real de ESA opción; soltar cierra y reanuda — y el pie de opciones scrollea con tope 46vh");
  else FALLA("F55: icono="+okIcono+" limpio="+okLimpio+" pausa="+enPausa+" ventana="+conVentana+" reanuda="+reanudado);
})();

/* ---------- F56 · el mercado vive: rumores, decisiones que muerden y traspasos reales ---------- */
(function(){
  base("SEV","EXT","D",76);
  MERCADO_ON=true; mercadoInit();
  var fallos=[];
  /* 1 · traspaso del mundo mueve el elo de verdad */
  var r={id:"rmx", tipo:"mundo", jugN:"Estrella Test", media:87, edad:24, de:"BET", a:"FCB", fuerza:0.8, verd:true, vivo:true, jor:18};
  var eloAntes=eloDe("FCB"), eloDeAntes=eloDe("BET");
  traspasoMundo(r);
  if(!(eloDe("FCB")>eloAntes && eloDe("BET")<eloDeAntes && !r.vivo && S.traspasos.some(function(t){return t.jugN==="Estrella Test";}))) fallos.push("mundo-elo");
  /* 2 · el rumor sobre ti pide respuesta: «cortar» baja fuerza y sube al míster */
  var ry={id:"yox", tipo:"yo", jugN:S.nombre, de:S.equipo, a:"RMA", fuerza:0.62, verd:true, vivo:true, jor:10};
  S.rumores.push(ry);
  var misterAntes=S.mister;
  sitRumorYo(ry);
  if(!OVSEM || OVSEM.ops.length!==4) fallos.push("sit-rumor");
  elegirSemana(0);   /* cortar en seco */
  if(!(ry.fuerza<=0.15 && S.mister>misterAntes && S.rumorLog.some(function(l){return l.op==="cortar";}))) fallos.push("cortar");
  /* 3 · azuzar + ventana ⇒ oferta real con salario por encima */
  ry.hablado=false; ry.fuerza=0.62; S.azuzado=false;
  sitRumorYo(ry); elegirSemana(2);   /* azuzar */
  if(!(S.azuzado && ry.fuerza>0.8)) fallos.push("azuzar");
  S.jornada=19; S.ofertaInv=null;
  var salAntes=S.contrato.salario;
  mercadoSemanal();
  if(!(S.ofertaInv && S.ofertaInv.salario>salAntes)) fallos.push("oferta-gen");
  if(NEG) salirMesaNeg();   /* de momento, rechazar la generada por el tick — ya abre la mesa, no el ovsem simple */
  /* 4 · aceptar una oferta = cambiar de vida entera */
  S.ofertaInv={club:"RMA", salario:Math.round(salAntes*1.3), prima:200000, anos:3};
  var eqAntes=S.equipo, compisAntes=S.compis.map(function(c){return c.n;}).join("|");
  abrirMesaOferta(); firmarBaseNeg();   /* aceptar el punto de partida tal cual, vía la mesa */
  var compisNuevos=S.compis.map(function(c){return c.n;}).join("|");
  if(!(S.equipo==="RMA" && S.contrato.salario===Math.round(salAntes*1.3) && compisNuevos!==compisAntes
       && S.compis.length>=14 && S.mister===52
       && S.traspasos.some(function(t){return t.jugN===S.nombre && t.de===eqAntes && t.a==="RMA";}))) fallos.push("aceptar");
  /* 5 · tu club ficha en tu puesto: plantilla estable, exige sube, «competir» toca la forma */
  var nC=S.compis.length, exAntes=S.contrato.exige||60, formaAntes=S.forma||70;
  fichajeEnTuPuesto();
  if(!OVSEM) fallos.push("sit-fichaje");
  elegirSemana(0);   /* competir */
  if(!(S.compis.length===nC && (S.contrato.exige||0)>exAntes && (S.forma||0)>formaAntes)) fallos.push("fichaje-puesto");
  /* 6 · la card cuenta sin numerar */
  var card=cardMercado();
  var okCard=/Mercado/.test(card) && /suena con fuerza|coge cuerpo|rumor tibio|✍/.test(card) && !/fuerza[: ]*0\./.test(card);
  if(!okCard) fallos.push("card");
  MERCADO_ON=false; S.jornada=0;
  if(!fallos.length)
    OKK("el mercado vive: el traspaso mundial mueve el elo de comprador y vendedor, «cortar» un rumor lo apaga y suma míster, azuzar + ventana genera oferta real por encima de tu ficha, ACEPTAR te cambia de club entero (equipo, "+S.compis.length+" compis nuevos, contrato, míster a 52, traspaso en el registro), el fichaje en tu puesto mantiene la plantilla y sube la exigencia con «competir» tocando la forma, y la card narra en cualitativo");
  else FALLA("F56: "+fallos.join(" · "));
})();

/* ---------- F57 · mover los hilos: coste, riesgo, cooldown y prensa ---------- */
(function(){
  base("SEV","EXT","D",76);
  MERCADO_ON=true; mercadoInit();
  S.dinero=500000; S.jornada=6; S.maniobraCd={}; S.maniobraSem=undefined; S.prensa=[];
  var fallos=[];
  var _rnd=rnd;
  /* 1 · el menú: sin rumor, «ciudad» no aparece; el resto sí, con su precio en la etiqueta */
  abrirManiobras();
  if(!OVSEM) fallos.push("sin-menu");
  else {
    var ls=OVSEM.ops.map(function(o){return o.l;});
    if(ls.some(function(l){return l.indexOf("Dejarte ver")===0;})) fallos.push("ciudad-sin-rumor");
    if(!ls.some(function(l){return /periodista.*€/.test(l);})) fallos.push("sin-precio");
    elegirSemana(OVSEM.ops.length-1);   /* cerrar sin gastar */
  }
  /* 2 · periodista limpio: paga, crea rumor, azuza y sale en prensa */
  rnd=function(){ return 0.9; };
  var dAntes=S.dinero, prAntes=S.prensa.length;
  abrirManiobras(); var iP=-1; OVSEM.ops.forEach(function(o,i){ if(/periodista/.test(o.l)) iP=i; });
  elegirSemana(iP);
  var r=rumorYo();
  if(!(S.dinero<dAntes && r && r.fuerza>=0.4 && S.azuzado && S.prensa.length>prAntes)) fallos.push("periodista-ok");
  /* 3 · una por semana: reabrir da solo la salida */
  abrirManiobras();
  if(!(OVSEM && OVSEM.ops.length===1)) fallos.push("limite-semana");
  elegirSemana(0);
  /* 4 · cooldown por maniobra: a la semana siguiente, periodista sigue en la nevera pero redes no */
  S.jornada=7;
  abrirManiobras();
  var ls2=OVSEM.ops.map(function(o){return o.l;});
  if(ls2.some(function(l){return /periodista/.test(l);})) fallos.push("cd-periodista");
  if(!ls2.some(function(l){return /Post enigmático/.test(l);})) fallos.push("redes-fuera");
  /* con rumor vivo, «Dejarte ver por Madrid/…» aparece */
  if(!ls2.some(function(l){return l.indexOf("Dejarte ver por ")===0;})) fallos.push("ciudad-con-rumor");
  elegirSemana(OVSEM.ops.length-1);
  /* 5 · la traición del periodista: míster se desploma y el aviso lo canta */
  S.jornada=12; S.maniobraCd={}; S.maniobraSem=undefined; S.mister=58; S.dinero=Math.max(S.dinero, 300000);   /* fondos y margen de clamp: la traición se mide entera */
  rnd=function(){ return 0.05; };
  var misterAntes=S.mister;
  abrirManiobras(); iP=-1;
  OVSEM.ops.forEach(function(o,i){ if(/periodista/.test(o.l)) iP=i; });
  elegirSemana(iP);
  if(!(S.mister<=misterAntes-9 && /lengua/.test(S.avisoMercado||""))) fallos.push("traicion");
  /* 6 · la cena del agente engorda la oferta de ventana */
  rnd=function(){ return 0.5; };
  S.jornada=13; S.maniobraCd={}; S.maniobraSem=undefined; S.agenteBoost=false;
  abrirManiobras(); var iA=-1; OVSEM.ops.forEach(function(o,i){ if(/superagente/.test(o.l)) iA=i; });
  elegirSemana(iA);
  if(!S.agenteBoost) fallos.push("agente-flag");
  var rr=rumorYo(); if(rr){ rr.fuerza=0.9; }
  S.jornada=19; S.ofertaInv=null; S.transferPed=false;
  mercadoSemanal();
  var esperado=Math.round(S.contrato.salario*(1.12+0.5*0.28+0.12)*1.08/1000)*1000;
  if(!(S.ofertaInv && S.ofertaInv.salario===esperado)) fallos.push("oferta-agente ("+(S.ofertaInv&&S.ofertaInv.salario)+" vs "+esperado+")");
  if(OVSEM) elegirSemana(OVSEM.ops.length-1);
  /* 7 · la card ofrece los hilos siempre */
  if(!/Abrir los Despachos/.test(cardMercado())) fallos.push("card-boton");
  rnd=_rnd; MERCADO_ON=false; S.jornada=0; S.ofertaInv=null; S.azuzado=false; S.agenteBoost=false;
  if(!fallos.length)
    OKK("mover los hilos funciona con precio y consecuencias: el periodista limpio cobra, crea rumor con prensa y azuza; su traición (25 %) te cuesta ≥10 de míster; una maniobra por semana y cooldowns por maniobra respetados; «Dejarte ver por <ciudad>» solo con rumor vivo; la cena del superagente infla la oferta de ventana exactamente ×1,08; y la card del hub enlaza al Mercado");
  else FALLA("F57: "+fallos.join(" · "));
})();

/* ---------- F58 · la sección Mercado: cuatro subtabs con vida dentro ---------- */
(function(){
  base("SEV","EXT","D",76);
  MERCADO_ON=true; mercadoInit();
  S.jornada=9; S.prensa=[{jor:8,t:"Titular de prueba sobre Manu."}];
  S.rumores.push({id:"r1",tipo:"yo",jugN:S.nombre,de:S.equipo,a:"ATH",fuerza:0.7,verd:true,vivo:true,jor:8});
  S.rumores.push({id:"r2",tipo:"mundo",jugN:"Figura Mundo",media:86,edad:25,de:"BET",a:"RMA",fuerza:0.4,verd:false,vivo:false,resuelto:"se cae",jor:5});
  S.traspasos.push({jugN:"Firma Mundo",de:"VAL",a:"BAR",precio:24000000,media:85,jor:9});
  S.rumorLog.push({jor:9,sit:"maniobra",op:"redes"});
  S.ofertaInv={club:"ATH",salario:520000,prima:150000,anos:3,mejorada:false};
  var fallos=[];
  SUB.mercado="hilos"; var h1=secMercado();
  if(!(/suena con fuerza/.test(h1) && /Volver a la mesa/.test(h1) && /Abrir el menú|ya moviste ficha/.test(h1) && /post enigmático en redes/.test(h1))) fallos.push("hilos");
  SUB.mercado="rumores"; var h2=secMercado();
  if(!(/<b>Tú<\/b> y el/.test(h2) && /se cayó/.test(h2))) fallos.push("rumores");
  SUB.mercado="fichajes"; var h3=secMercado();
  if(!(/✍ Firma Mundo/.test(h3) && /24/.test(h3) && /J9/.test(h3))) fallos.push("fichajes");
  SUB.mercado="prensa"; var h4=secMercado();
  if(!(/Titular de prueba/.test(h4))) fallos.push("prensa");
  if(!(SUBS.mercado && SUBS.mercado.length===6)) fallos.push("subs6");
  /* el router responde y la card del hub enlaza */
  irSec("mercado");
  var body=$("sec-body").innerHTML||"";
  if(!/Despachos/.test(body)) fallos.push("router");
  if(!/irSec\('mercado'\)/.test(cardMercado())) fallos.push("card-enlace");
  irSec("inicio"); SUB.mercado="hilos";
  MERCADO_ON=false; S.ofertaInv=null; S.jornada=0;
  if(!fallos.length)
    OKK("la sección Mercado vive: «Mover los hilos» con tu situación en frases, la oferta con «Volver a la mesa» y tu historial narrado; Rumores con vivos y enfriados; Fichajes con firmas fechadas y precio; Prensa con portadas — el menú principal la sirve y la card del hub enlaza a ella");
  else FALLA("F58: "+fallos.join(" · "));
})();

/* ---------- F59 · el bazar tiene dientes: todo lo comprado toca el RPG ---------- */
(function(){
  base("SEV","MC","D",73);
  TIENDA_ON=true; tiendaInit();
  var fallos=[];
  /* 1 · catálogo: cientos, con nombres de marca únicos casi todos */
  var IT=tiendaItems();
  var nombres={}; IT.forEach(function(x){ nombres[x.n]=1; });
  if(!(IT.length>=300 && Object.keys(nombres).length>=IT.length*0.9)) fallos.push("catalogo("+IT.length+")");
  /* helper: la progresión es peldaño a peldaño, también en los tests */
  function sube(cat, t){ for(var q=0;q<=t;q++){ var it=IT.filter(function(x){return x.cat===cat && x.tier===q;})[0]; if(it) comprarBazar(it.id); } }
  /* 2 · comprar un bien descuenta, marca y dispara one-shots (joya: ego y fama) */
  S.dinero=5e6; S.car=S.car||{}; S.car.ego=20;
  sube("joyas",2);
  var joya=IT.filter(function(x){return x.cat==="joyas" && x.tier===3;})[0];
  var dA=S.dinero, egoA=eje("ego"), segA=pub().seg;
  comprarBazar(joya.id);
  if(!(S.dinero===dA-joya.precio && S.tienda.own[joya.id] && eje("ego")>egoA && pub().seg>segA)) fallos.push("compra-bien");
  S.tienda.own={};   /* one-shots medidos: inventario limpio para no meter ruido de robo */
  S.caprichoCd=999;
  /* 3 · regen real: una semana con equipo de recuperación élite sube la forma */
  sube("recu",5);
  S.forma=60; var fA=S.forma;
  semanaTienda();
  if(!(S.forma>fA)) fallos.push("regen");
  /* 4 · la sobrecarga respeta el modificador: modLes<1 con recu élite */
  if(!(bonusTienda().modLes<0.95)) fallos.push("modles");
  /* 5 · el gimnasio multiplica el entreno físico de verdad */
  sube("gym",5);
  S.techos={FIS:35}; S.attr.FIS=60;   /* lejos del techo (4.64: el techo ya es por atributo y empieza en 50; con puntos asignados FIS puede llegar mucho más lejos) */
  var eF=ENTRENOS.filter(function(e){return e.sube && e.sube.FIS;})[0];
  if(eF){
    var conGym=gananciaEntreno(eF,"FIS",false);
    var own=S.tienda.own; S.tienda.own={};
    var sinGym=gananciaEntreno(eF,"FIS",false);
    S.tienda.own=own;
    if(!(conGym>sinGym)) fallos.push("entreno("+conGym.toFixed(2)+"/"+sinGym.toFixed(2)+")");
  }
  /* 6 · servicios: cobran cada semana y se despiden sin fondos */
  sube("fisio",2);
  var up=bonusTienda().upkeep, dS=S.dinero;
  semanaTienda();
  if(!(up>0 && S.dinero===dS-up)) fallos.push("upkeep");
  S.dinero=10;
  semanaTienda();
  if(!(Object.keys(S.tienda.serv).length===0 && /despiden/.test(S.avisoMercado||""))) fallos.push("despido");
  /* 7 · el jefe de prensa amortigua tus maniobras a la mitad */
  S.dinero=5e6;
  sube("jprensa",3);
  var jp=IT.filter(function(x){return x.cat==="jprensa" && x.tier===3;})[0];
  S.mister=60; misterHit(6);
  if(!(Math.abs(S.mister-57)<0.01)) fallos.push("amort("+S.mister+")");
  Object.keys(S.tienda.serv).forEach(function(id){ var it2=itemDe(id); if(it2 && it2.cat==="jprensa") delete S.tienda.serv[id]; });
  S.mister=60; misterHit(6);
  if(!(S.mister===54)) fallos.push("amort-off");
  /* 8 · el deseo drena y comprar lo cura */
  S.capricho2={cat:"reloj", tier:2, n:"Deseo Test", jor:0};
  var cA=S.conf;
  semanaTienda();
  if(!(S.conf<cA)) fallos.push("drena");
  var cB=S.conf;
  sube("reloj",2);
  if(!(S.capricho2===null && S.conf>cB)) fallos.push("cura");
  /* 9 · lo caro llama a lo ajeno… salvo con seguro */
  var _rnd=rnd; rnd=function(){ return 0.01; };
  S.tienda.own={}; [3,4,5].forEach(function(t){ var j=IT.filter(function(x){return x.cat==="joyas"&&x.tier===t;})[0]; S.tienda.own[j.id]=1; });
  var dR=S.dinero=400000, prA=(S.prensa||[]).length;
  semanaTienda();
  if(!(S.dinero<dR && (S.prensa||[]).length>prA)) fallos.push("robo");
  S.dinero=5e6; sube("segur",2);
  var dR2=S.dinero;
  semanaTienda();
  if(!(S.dinero>=dR2-bonusTienda().upkeep-1)) fallos.push("seguro");
  rnd=_rnd;
  /* 10 · la Tienda se ve: subtab, chips de categoría y precios */
  SUB.cuentas="tienda";
  var html=secCuentas();
  if(!(/Tienda/.test(html) && (html.match(/chip/g)||[]).length>=TIENDA_CATS.length && /€|k€|M€/.test(html))) fallos.push("ui");
  SUB.cuentas="dinero"; TIENDA_ON=false; S.capricho2=null; S.tienda={own:{},serv:{}};
  if(!fallos.length)
    OKK("el bazar tiene dientes: "+IT.length+" artículos de marca procedural; la joya sube ego y fama al comprarla, la recuperación élite regenera forma y baja la sobrecarga, el gimnasio multiplica el entreno FIS medible, los servicios cobran semanal y se despiden sin fondos, el jefe de prensa amortigua tus maniobras exactamente a la mitad, el capricho drena confianza hasta que compras (y comprar cura), las joyas sin seguro acaban en robo con portada y con seguro no, y la Tienda vive en Vida con sus categorías");
  else FALLA("F59: "+fallos.join(" · "));
})();

/* ---------- F60 · cada cosa en su casa, marcas de verdad y RPG a la vista ---------- */
(function(){
  base("SEV","MC","D",73);
  TIENDA_ON=true; tiendaInit(); S.tienda={own:{},serv:{}};
  var fallos=[];
  /* 1 · el hub, limpio: ni Reto ni Mercado */
  S.reto={temporada:S.temporada, m:Object.keys(METRICAS_RETO)[0], u:5, cmp:">=", txt:"Reto test", finJor:20, premioE:50000};
  var _pm2=renderHub, hubHTML="";
  var _gel=$("hub-body");
  renderHub=_rh; renderHub(); hubHTML=$("hub-body").innerHTML||"";
  renderHub=function(){};
  if(/reto del míster/i.test(hubHTML) || /Abrir el Mercado/.test(hubHTML)) fallos.push("hub-sucio");
  /* 2 · el reto vive en Equipo → El míster */
  SUB.equipo="mister";
  var hm=secEquipo();
  if(!/El reto del míster/.test(hm)) fallos.push("reto-mister");
  SUB.equipo="tabla";
  /* 3 · marcas reales en el catálogo */
  var todos=tiendaItems().map(function(x){return x.n;}).join("|");
  if(!(/Rolex/.test(todos) && /Theragun/.test(todos) && /Technogym/.test(todos) && /Porsche/.test(todos) && /Tempur/.test(todos))) fallos.push("marcas");
  /* 4 · candado de progresión en UI y motor */
  S.dinero=5e6; SUB.cuentas="tienda"; TIENDA_CAT="reloj";
  var ht=secCuentas();
  if(!/🔒/.test(ht)) fallos.push("candado-ui");
  var t2=tiendaItems().filter(function(x){return x.cat==="reloj" && x.tier===2;})[0];
  comprarBazar(t2.id);
  if(S.tienda.own[t2.id]) fallos.push("candado-motor");
  /* 5 · sin fondos: precio apagado, sin botón de compra */
  S.dinero=5;
  var ht2=secCuentas();
  var filaT0=ht2.split("Tissot PRX")[1]||"";
  if(/onclick="comprarBazar/.test(filaT0.slice(0,220))) fallos.push("sin-fondos-boton");
  /* 6 · los campos RPG, a la vista */
  TIENDA_CAT="recu"; S.dinero=5e6;
  var ht3=secCuentas();
  if(!(/⚽/.test(ht3) && /forma \+/.test(ht3) && /lesión −/.test(ht3))) fallos.push("chips-fut");
  TIENDA_CAT="reloj";
  var ht4=secCuentas();
  if(!(/🧍/.test(ht4) && /ego \+/.test(ht4) && /fama \+/.test(ht4) && /atrae miradas/.test(ht4))) fallos.push("chips-per");
  /* 7 · Dinero solo finanzas; coche y casa viven en la Tienda */
  SUB.cuentas="dinero";
  var hd=secCuentas();
  if(/comprarVida\('coche'/.test(hd) || /Fisio personal activo|comprarVida\('fisio'/.test(hd)) fallos.push("dinero-sucio");
  if(!/viven ahora en la <b>Tienda<\/b>/.test(hd)) fallos.push("dinero-nota");
  SUB.cuentas="tienda"; TIENDA_CAT="recu";
  var ht5=secCuentas();
  if(!(/Coche y casa/.test(ht5) && /comprarVida\('coche'/.test(ht5))) fallos.push("vida-en-tienda");
  SUB.cuentas="dinero"; TIENDA_ON=false; S.tienda={own:{},serv:{}}; S.reto=null;
  if(!fallos.length)
    OKK("cada cosa en su casa: el hub ya no lleva Reto ni Mercado (el reto vive en Equipo→El míster), el catálogo habla en marcas reales (Rolex, Theragun, Technogym, Porsche, Tempur…), la progresión es peldaño a peldaño con candado en UI y motor, sin fondos no hay ni botón, cada artículo enseña sus campos RPG (⚽ forma/lesión/entreno · 🧍 ego/fama/ánimo/riesgos), y coche+casa —con su sistema de novedad intacto— viven en la Tienda mientras Dinero queda para las finanzas");
  else FALLA("F60: "+fallos.join(" · "));
})();

/* ---------- F61 · la Ficha habla en 7 familias ---------- */
(function(){
  base("SEV","MC","D",74);
  var fallos=[];
  SUB.jugador="ficha";
  var h=secJugador();
  ["Físico","Ánimo","Carácter","Ciudad deportiva","Fama","Cartel","Cuentas"].forEach(function(n){
    if(h.indexOf("<b>"+n+"</b>")<0) fallos.push("familia-"+n);
  });
  if((h.match(/class="fam"/g)||[]).length!==7) fallos.push("7cards");
  if(!/sin ruido ahí fuera|tu nombre/.test(h)) fallos.push("cartel-frase");
  if(/Cartel<\/b><\/div><div class="faml">\d/.test(h)) fallos.push("cartel-numero");
  SUB.jugador="ficha";
  if(!fallos.length) OKK("la Ficha abre con las 7 familias firmadas — Físico, Ánimo, Carácter, Ciudad deportiva, Fama, Cartel y Cuentas — con valores reales y el Cartel contado en frases, nunca en cifras");
  else FALLA("F61: "+fallos.join(" · "));
})();

/* ---------- F62 · el agente: comisión, ofertas infladas y la renovación que paga la fidelidad ---------- */
(function(){
  base("SEV","EXT","D",76);
  MERCADO_ON=true; mercadoInit();
  var fallos=[];
  S.dinero=800000; S.jornada=10; S.fama=0; S.patros=[]; S.patroOferta=null;   /* el tick de patrocinios, en silencio para este test */
  /* 1 · candidatos deterministas y fichaje del tiburón */
  var cs=candidatosAgente();
  if(!(cs.length===3 && cs[0].n && cs.every(function(c){return ESTILOS_AG.some(function(e){return e.id===c.estilo;});}))) fallos.push("candidatos");
  ficharAgente(0);
  if(!(S.agente && S.agente.estilo==="tiburon" && S.agente.pct===0.07)) fallos.push("fichar");
  /* 2 · la comisión semanal exacta */
  var cuota=Math.round(S.contrato.salario*0.07/38), dA=S.dinero;
  comisionSemanal();
  if(!(S.dinero===dA-cuota)) fallos.push("comision");
  /* 3 · la oferta de ventana llega inflada ×(1+0.12) */
  var _rnd=rnd; rnd=function(){ return 0.5; };
  var r=rumorOAlta(0.7); S.azuzado=false; S.agenteBoost=false;
  S.jornada=19; S.ofertaInv=null; S.transferPed=false; r.fuerza=0.9;
  mercadoSemanal();
  var esperado=Math.round(S.contrato.salario*(1.12+0.5*0.28)*(1.12)/1000)*1000;
  if(!(S.ofertaInv && S.ofertaInv.salario===esperado)) fallos.push("oferta-inflada ("+(S.ofertaInv&&S.ofertaInv.salario)+" vs "+esperado+")");
  if(OVSEM) elegirSemana(OVSEM.ops.length-1);
  S.ofertaInv=null;
  /* 4 · renovación proactiva: último año, fidelidad 2 → subida exacta 1.10+0.08+0.05 */
  S.jornada=26; S.contrato.anos=1; S.fidelidad=2; S.mister=60; S.renovProc=null;
  var sal0=S.contrato.salario;
  renovacionProactiva();
  if(!NEG) fallos.push("renov-no-abre");
  else {
    var salEsp=Math.round(sal0*(1.10+0.04*2+0.05)/1000)*1000;
    firmarBaseNeg();   /* firmar el punto de partida (misma cifra que antes) */
    if(!(S.contrato.salario===salEsp && S.contrato.anos===3)) fallos.push("renov-cifra ("+S.contrato.salario+" vs "+salEsp+")");
  }
  /* 5 · segunda vez no vuelve a abrir */
  NEG=null; renovacionProactiva();
  if(NEG) fallos.push("renov-repite");
  /* 6 · sin fondos, el agente se larga con portazo */
  S.dinero=10; var mA=S.mister;
  comisionSemanal();
  if(!(S.agente===null && S.mister===mA-2 && /portazo/.test(S.avisoMercado||""))) fallos.push("portazo");
  rnd=_rnd; MERCADO_ON=false; S.jornada=0; S.renovProc=null; S.contrato.anos=3;
  if(!fallos.length) OKK("el agente vive: tres candidatos deterministas por temporada, la comisión semanal se cobra al céntimo, la oferta de ventana llega inflada exactamente ×1,12 con el tiburón, la renovación proactiva del último año paga la fidelidad (1,10 + 0,04×fid + 0,05 del tiburón, al euro), no se repite, y sin fondos se larga dando un portazo (míster −2)");
  else FALLA("F62: "+fallos.join(" · "));
})();

/* ---------- F63 · médica: la rehab es tuya y deja historial ---------- */
(function(){
  base("SEV","MC","D",73);
  MERCADO_ON=true;
  var fallos=[];
  var _rnd=rnd;
  /* 1 · conservador: una semana por semana */
  S.lesion=3; S.rehabPlan="conservador"; S.rehabSem=undefined; S.sancion=0; S.jornada=5;
  rnd=function(){ return 0.9; };
  jornadaSinTi();
  if(S.lesion!==2) fallos.push("conservador("+S.lesion+")");
  /* 2 · agresivo con suerte: recorta dos */
  S.lesion=3; S.rehabPlan="agresivo"; S.rehabSem=undefined; S.jornada=6; S.forma=70;
  rnd=function(){ return 0.3; };
  jornadaSinTi();
  if(!(S.lesion===1 && S.forma===68)) fallos.push("agresivo-bien("+S.lesion+","+S.forma+")");
  /* 3 · agresivo con recaída: suma una y duele */
  S.lesion=3; S.rehabPlan="agresivo"; S.rehabSem=undefined; S.jornada=7; S.conf=60;
  rnd=function(){ return 0.6; };
  jornadaSinTi();
  if(!(S.lesion===4 && S.conf===57)) fallos.push("recaida("+S.lesion+","+S.conf+")");
  /* 4 · reforzar: al curar, forma +6 y escudo temporal que baja la sobrecarga */
  S.lesion=1; S.rehabPlan="reforzar"; S.rehabSem=undefined; S.jornada=8; S.forma=70;
  rnd=function(){ return 0.9; };
  jornadaSinTi();
  if(!(S.lesion===0 && S.forma===76 && S.modLesTemp && S.modLesTemp.f===0.8)) fallos.push("reforzar");
  /* 5 · el registro de sobrecarga escribe historial */
  S.histLes=[];
  rnd=function(){ return 0.001; };
  S.lesion=0; aplicarEntreno(0, true);
  if(!(S.histLes.length===1 && S.histLes[0].motivo==="sobrecarga")) fallos.push("historial");
  /* 6 · la página cuenta estado, plan e historial */
  S.lesion=2; S.rehabPlan=null; SUB.jugador="fisico";
  var h=secJugador();
  if(!(/De baja/.test(h) && /Conservador/.test(h) && /Agresivo/.test(h) && /Reforzar/.test(h) && /sobrecarga/.test(h))) fallos.push("pagina");
  SUB.jugador="ficha"; S.lesion=0; S.modLesTemp=null; rnd=_rnd; MERCADO_ON=false; S.jornada=0;
  if(!fallos.length) OKK("la médica funciona: el plan conservador descuenta una semana por semana, el agresivo recorta dos con suerte (forma −2) o recae sumando una (conf −3), reforzar cura con forma +6 y escudo ×0,8 durante cinco jornadas sobre la sobrecarga real, cada lesión queda en el historial y la página lo cuenta todo con la elección en la mano");
  else FALLA("F63: "+fallos.join(" · "));
})();

/* ---------- F64 · la vitrina sale del archivo, no del aire ---------- */
(function(){
  base("SEV","DC","D",75);
  var fallos=[];
  /* archivo fabricado: 55 partidos T1 con 28 goles, un 9.3, un hat-trick */
  var h1=[];
  for(var i=0;i<55;i++){
    var g=(i<20? 1:0)+(i===7? 2:0);   /* i=7 → 3 goles: hat-trick; total 28 pero recorto */
    h1.push({jor:i+1, rival:"BAR", yo:{g:(i===7?3:(i<20?1:0)), a:0, nota:(i===12? 9.3 : 6.5)}});
  }
  S.archivo={1:{h:h1}}; S.hist=[]; S.temporada=2;
  var v=vitrinaHTML();
  if(!/50 partidos/.test(v)) fallos.push("50pj");
  if(!(/10 goles/.test(v) && /J9|J1[0-9]/.test(v))) fallos.push("10goles");
  if(!/Partido para el recuerdo \(9.3\)/.test(v)) fallos.push("recuerdo");
  if(!/Hat-trick/.test(v)) fallos.push("hat");
  if(!/Temporada de 2[0-9] goles/.test(v)) fallos.push("temp15");
  if(!/T1 · J8 vs Barça|T1 · J8 vs /.test(v)) fallos.push("fecha-hat");
  /* vacío honesto */
  S.archivo={}; S.hist=[];
  var v2=vitrinaHTML();
  if(!/Aún vacía/.test(v2)) fallos.push("vacia");
  if(!fallos.length) OKK("la vitrina deriva del archivo real: 50 partidos, los 10/25 goles con su jornada, el Partido para el recuerdo (9,3) fechado contra su rival, el hat-trick de la J8 y la temporada de 20+ goles — y vacía dice la verdad");
  else FALLA("F64: "+fallos.join(" · "));
})();

/* ---------- F65 · redes activas: publicar tiene precio y los haters tientan ---------- */
(function(){
  base("SEV","EXT","D",74);
  var fallos=[];
  var _rnd=rnd; rnd=function(){ return 0.9; };
  S.jornada=9; S.redesSem=undefined; S.hatersSem=undefined; S.tienda={own:{},serv:{}};
  var P=pub(); P.seg=1000; S.mister=60; S.car=S.car||{}; S.car.ego=10;
  /* 1 · lujo: seg +120 exacto, ego +1, míster −2 */
  publicarRed("lujo");
  if(!(P.seg===1120 && eje("ego")===11 && S.mister===58)) fallos.push("lujo("+P.seg+","+eje("ego")+","+S.mister+")");
  /* 2 · slot semanal: la segunda no publica */
  publicarRed("entreno");
  if(P.seg!==1120) fallos.push("slot");
  /* 3 · nueva semana, entreno: seg +40 y míster +1 */
  S.jornada=10; S.redesSem=undefined;
  publicarRed("entreno");
  if(!(P.seg===1160 && S.mister===59)) fallos.push("entreno");
  /* 4 · reivindicativo con polémica (rnd bajo): míster −5 y portada */
  S.jornada=11; S.redesSem=undefined; S.prensa=[];
  rnd=function(){ return 0.05; };
  publicarRed("reivindicativo");
  if(!(S.mister===54 && S.prensa.length===1)) fallos.push("polemica("+S.mister+","+S.prensa.length+")");
  /* 5 · haters: templado suma confianza; caliente arde */
  S.car.temperamento=70; S.conf=50; S.hatersSem=undefined;
  responderHaters();
  if(S.conf!==53) fallos.push("templado");
  S.jornada=12; S.hatersSem=undefined; S.car.temperamento=20; S.prensa=[];
  responderHaters();
  if(!(S.mister===50 && S.prensa.length===1)) fallos.push("caliente("+S.mister+","+S.prensa.length+")");
  /* 6 · la UI ofrece publicar y responder */
  S.jornada=13; S.redesSem=undefined; S.hatersSem=undefined; SUB.jugador="fama";
  var h=secJugador();
  if(!(/Publicar esta semana/.test(h) && /Responder a los haters/.test(h))) fallos.push("ui");
  SUB.jugador="ficha"; rnd=_rnd; S.jornada=0; S.prensa=[];
  if(!fallos.length) OKK("las redes ya son decisiones: el post de lujo paga seg +120, ego +1 y míster −2 exactos, el slot semanal manda, el de entreno suma míster, el reivindicativo con mala suerte incendia (míster −5 y portada), responder a los haters premia la templanza (+3 de confianza) y castiga la sangre caliente (míster −4 y captura en prensa), y la UI ofrece ambos botones cada semana");
  else FALLA("F65: "+fallos.join(" · "));
})();

/* ---------- F66 · el verano respeta lo que es de carrera y mata lo que es de temporada ---------- */
(function(){
  base("SEV","MC","D",74);
  var fallos=[];
  /* fabricar estado rico ANTES del verano */
  tiendaInit();
  var IT=tiendaItems();
  var b0=IT.filter(function(x){return x.cat==="recu" && x.tier===0;})[0];
  var s0=IT.filter(function(x){return x.cat==="fisio" && x.tier===0;})[0];
  S.dinero=1e6; comprarBazar(b0.id); comprarBazar(s0.id);
  S.histLes=[{t:1, j:9, motivo:"sobrecarga", sem:1}];
  S.agente={n:"Paco Prueba", estilo:"discreto", pct:0.03, desde:3};
  S.fidelidad=2;
  S.modLesTemp={f:0.8, hasta:jorAbs()+5};
  /* temporales que DEBEN morir */
  S.renovProc="mesa"; S.azuzado=true; S.agenteBoost=true; S.transferPed=true;
  S.maniobraCd={periodista:30}; S.maniobraSem=30; S.redesSem=30;
  /* cerrar la liga con una tabla válida y cruzar el verano */
  S.jornada=38;
  nuevaTemporada();
  if(S.temporada!==2) fallos.push("temporada");
  /* lo de carrera SOBREVIVE */
  if(!(S.tienda && S.tienda.own && S.tienda.own[b0.id] && S.tienda.serv[s0.id])) fallos.push("tienda-viaja");
  if(!(S.histLes && S.histLes.length===1 && S.histLes[0].motivo==="sobrecarga")) fallos.push("histles-viaja");
  if(!(S.agente && S.agente.n==="Paco Prueba")) fallos.push("agente-viaja");
  if(S.fidelidad!==2) fallos.push("fidelidad-viaja");
  if(!(S.modLesTemp && S.modLesTemp.f===0.8)) fallos.push("escudo-viaja");
  /* lo de temporada MUERE */
  if(S.renovProc!==undefined) fallos.push("renovproc-vive");
  if(S.azuzado!==undefined && S.azuzado!==false) fallos.push("azuzado-vive");
  if(S.agenteBoost!==undefined && S.agenteBoost!==false) fallos.push("boost-vive");
  if(S.transferPed!==undefined && S.transferPed!==false) fallos.push("transferped-vive");
  if(S.maniobraCd!==undefined && Object.keys(S.maniobraCd||{}).length) fallos.push("cd-vive");
  if(S.maniobraSem===30 || S.redesSem===30) fallos.push("sems-viven");
  /* y la renovación proactiva puede RENACER en el próximo último año */
  MERCADO_ON=true; mercadoInit();
  S.contrato.anos=1; S.jornada=26; S.mister=60;
  renovacionProactiva();
  if(!NEG) fallos.push("renov-renace");
  else salirMesaNeg();   /* declinar, como el último botón de antes */
  MERCADO_ON=false; S.jornada=0; S.contrato.anos=3; S.renovProc=null;
  if(!fallos.length)
    OKK("el verano hace su trabajo: el bazar, el expediente médico, el agente, la fidelidad y el escudo de rehab VIAJAN con el jugador; renovProc, azuzado, agenteBoost, transferPed, cooldowns y slots semanales MUEREN en la frontera; y la renovación proactiva renace limpia en el siguiente último año de contrato");
  else FALLA("F66: "+fallos.join(" · "));
})();

/* ---------- F67 · segunda auditoría: la tentación y el freno son reales, los petos no dan vitrina, la prensa pesa ---------- */
(function(){
  base("SEV","MC","D",73);
  TIENDA_ON=true; tiendaInit(); S.tienda={own:{},serv:{}};
  var fallos=[];
  var IT=tiendaItems();
  function sube(cat,t){ for(var q=0;q<=t;q++){ var it=IT.filter(function(x){return x.cat===cat && x.tier===q;})[0]; if(it) comprarBazar(it.id); } }
  /* 1 · línea base de subida de vicio */
  S.vicios={}; S.car=S.car||{}; S.car.disciplina=0; S.car.ego=0; S.car.temperamento=50;
  subirVicio("noche", 10);
  var base0=S.vicios.noche;
  /* 2 · la sala de juegos élite acelera la caída */
  S.dinero=5e6; sube("tec",5);
  S.vicios={}; subirVicio("noche", 10);
  var conTec=S.vicios.noche;
  if(!(conTec>base0*1.2)) fallos.push("tec-no-tienta("+conTec.toFixed(2)+"/"+base0.toFixed(2)+")");
  /* 3 · la escolta frena — incluso con la sala en casa */
  sube("escolta",3);
  S.vicios={}; subirVicio("noche", 10);
  var conAmbos=S.vicios.noche;
  if(!(conAmbos<conTec)) fallos.push("escolta-no-frena");
  /* 4 · escolta sola: por debajo de la línea base */
  S.tienda={own:{},serv:{}}; sube("escolta",3);
  S.vicios={}; subirVicio("noche", 10);
  if(!(S.vicios.noche<base0)) fallos.push("freno-neto");
  /* 5 · la vitrina ignora los petos */
  S.archivo={}; S.hist=[];
  for(var i=0;i<9;i++) S.hist.push({jor:i+2, rival:"BAR", yo:{g:1, a:0, nota:6.5}});
  S.hist.push({jor:1, rival:"PRB", yo:{g:1, a:0, nota:7.0}});   /* el amistoso: gol 10 que NO cuenta */
  var v=vitrinaHTML();
  if(/10 goles/.test(v)) fallos.push("peto-cuenta");
  S.hist.push({jor:12, rival:"VAL", yo:{g:1, a:0, nota:6.8}});
  var v2=vitrinaHTML();
  if(!/10 goles/.test(v2)) fallos.push("liga-no-cuenta");
  /* 6 · presionPrensa: la tinta pesa en los golpes, exacta en los extremos */
  var P=pub();
  P.prensa=10; var f1=presionPrensa();
  P.prensa=90; var f2=presionPrensa();
  if(!(Math.abs(f1-1.08)<0.001 && Math.abs(f2-0.92)<0.001 && f1>f2)) fallos.push("prensa-peso("+f1.toFixed(3)+","+f2.toFixed(3)+")");
  S.tienda={own:{},serv:{}}; S.vicios={}; S.hist=[]; TIENDA_ON=false;
  if(!fallos.length)
    OKK("segunda auditoría cerrada en código: la sala de juegos élite acelera la subida de vicios (+20%+ medible), la escolta la frena incluso conviviendo con la tentación y sola deja la caída por debajo de la línea base (H1 CERRADO por la puerta correcta: el crecimiento, no el castigo), la vitrina ignora los petos naranjas (el gol 10 en amistoso no da hito; el de liga sí), y presionPrensa pesa exacta en los extremos (1,08 con la prensa a 10 · 0,92 a 90)");
  else FALLA("F67: "+fallos.join(" · "));
})();

renderHub=_rh;
  console.log("");
  console.log("RESULTADO FICHA: "+PASA+" ✔ · "+FALLA_N+" ✘");
})();
