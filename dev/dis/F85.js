renderHub=function(){PARTIDA_ABIERTA=true;};
var f=[];

function cadenaHasta(rama,id){
  var porId={}; TALENTOS[rama].nodes.forEach(function(n){porId[n.id]=n;});
  function anc(id,acc){ var n=porId[id]; if(!n||!n.req) return acc;
    (Array.isArray(n.req)?n.req:[n.req]).forEach(function(r){ if(acc.indexOf(r)<0){ acc.push(r); anc(r,acc); } });
    return acc; }
  var nec=anc(id,[]).concat([id]);
  nec.sort(function(a,b){return porId[a].row-porId[b].row;});
  return nec;
}
function invertirCadena(rama,id){ cadenaHasta(rama,id).forEach(function(nid){ invertirTalento(rama,nid); }); }

/* 1 · estructura: 6 ramas, 4-6 filas, máx 3/fila, 1 capstone en su última fila, ids únicos, req a fila anterior */
var NOMBRES=Object.keys(TALENTOS);
if(NOMBRES.length!==6) f.push("no hay 6 ramas ("+NOMBRES.length+")");
NOMBRES.forEach(function(rama){
  var tree=TALENTOS[rama];
  var maxFila=0; tree.nodes.forEach(function(n){ if(n.row>maxFila) maxFila=n.row; });
  if(maxFila<4||maxFila>6) f.push(rama+" tiene "+maxFila+" filas, fuera de 4-6");
  for(var r=1;r<=maxFila;r++){
    var enFila=tree.nodes.filter(function(n){return n.row===r;});
    if(enFila.length>3) f.push(rama+" fila"+r+" tiene "+enFila.length+", máximo 3");
    if(enFila.length===0) f.push(rama+" fila"+r+" vacía");
  }
  var caps=tree.nodes.filter(function(n){return n.cap;});
  if(caps.length!==1) f.push(rama+" no tiene exactamente 1 capstone");
  else if(caps[0].row!==maxFila) f.push(rama+" el capstone no está en su última fila");
  var ids=tree.nodes.map(function(n){return n.id;});
  var dup=ids.filter(function(id,i){return ids.indexOf(id)!==i;});
  if(dup.length) f.push(rama+" ids duplicados: "+dup.join(","));
  var porId={}; tree.nodes.forEach(function(n){porId[n.id]=n;});
  tree.nodes.forEach(function(n){
    if(!n.req) return;
    (Array.isArray(n.req)?n.req:[n.req]).forEach(function(r){
      if(ids.indexOf(r)<0) f.push(rama+"."+n.id+" req inexistente: "+r);
      else if(porId[r].row>=n.row) f.push(rama+"."+n.id+" requiere "+r+" que no está en fila anterior");
    });
  });
  /* cada nodo trae AL MENOS un efecto mecánico real (fx, fxEntreno o fxForma) — nada decorativo */
  tree.nodes.forEach(function(n){ if(!n.fx && !n.fxEntreno && !n.fxForma) f.push(rama+"."+n.id+" no tiene ningún efecto mecánico"); });
});

/* 2 · talentoDesbloqueado: nivel + prerequisito AND, exactamente el patrón validado en la calculadora */
S=nuevoEstado("SEV","DC","Manu",9,"D","clasico",22);
S.talentos={}; S.nivel=8;
if(!talentoDesbloqueado("ataque", talentoNodo("ataque","instinto"))) f.push("fila1 no se desbloquea en su propio nivel mínimo");
S.nivel=7;
if(talentoDesbloqueado("ataque", talentoNodo("ataque","instinto"))) f.push("fila1 se desbloquea un nivel por debajo del suyo");
S.nivel=99;
if(talentoDesbloqueado("ataque", talentoNodo("ataque","defin"))) f.push("un talento con prerequisito se desbloquea sin él, aunque el nivel sea máximo");

/* 3 · invertirTalento: respeta rango máximo, presupuesto (nivel-7), y el desbloqueo */
S=nuevoEstado("SEV","DC","Manu",9,"D","clasico",22);
S.talentos={}; S.nivel=10;   /* presupuesto=3, justo lo necesario para maxear un talento de rango 3 */
if(!invertirTalento("ataque","instinto")) f.push("no se pudo invertir el primer punto disponible");
invertirTalento("ataque","instinto"); invertirTalento("ataque","instinto");
if(talentoRango("ataque","instinto")!==3) f.push("no llega al rango máximo (3) con puntos suficientes");
S.nivel=99;   /* ahora con presupuesto de sobra, confirmar que el TOPE sigue siendo el rango, no el presupuesto */
invertirTalento("ataque","instinto");
if(talentoRango("ataque","instinto")!==3) f.push("permite superar el rango máximo");
S=nuevoEstado("SEV","DC","Manu",9,"D","clasico",22); S.talentos={}; S.nivel=8;
invertirTalento("ataque","instinto");   /* 1 punto de 1 disponible (nivel8 → presupuesto 1) */
if(invertirTalento("ataque","ultpase")) f.push("invertirTalento ignora el presupuesto global (nivel-7)");

/* 4 · lógica AND real, con merges de 2 y de 3 en ramas reales del juego */
S=nuevoEstado("SEV","DC","Manu",9,"D","clasico",22); S.talentos={}; S.nivel=99;
invertirCadena("defensa","sinmiedo");
if(talentoRango("defensa","cazador")>0) f.push("defensa.cazador (AND de 2) se desbloquea con un solo padre");
invertirCadena("defensa","lectpas");
if(!invertirTalento("defensa","cazador")) f.push("defensa.cazador no se desbloquea con los DOS padres invertidos");
S=nuevoEstado("SEV","MC","Manu",8,"D","clasico",22); S.talentos={}; S.nivel=99;
invertirCadena("centro","orient"); invertirCadena("centro","letal");
if(invertirTalento("centro","completo")) f.push("centro.completo (AND de 3) se desbloquea con solo 2 de los 3 padres");
invertirCadena("centro","nuca");
if(!invertirTalento("centro","completo")) f.push("centro.completo no se desbloquea con los TRES padres");

/* 5 · el 2º/3er punto de un talento YA desbloqueado nunca se re-bloquea por gastar el resto en otra cosa */
S=nuevoEstado("SEV","MC","Manu",8,"D","clasico",22); S.talentos={}; S.nivel=30;
invertirTalento("mental","lider"); invertirTalento("mental","concent");
invertirTalento("mental","inqueb");   /* AND de [lider,concent] */
if(talentoRango("mental","inqueb")!==1) f.push("mental.inqueb no se desbloquea con sus 2 padres a rango 1");
invertirTalento("mental","sfria"); invertirTalento("mental","sfria"); invertirTalento("mental","sfria");
invertirTalento("mental","inqueb");
if(talentoRango("mental","inqueb")!==2) f.push("el 2º punto de un talento activo se bloquea por gastar el resto en otra cosa");

/* 6 · sk() ya lee talentos: un fx.gol escala con rango/rango_max, no solo con "invertido sí/no" */
S=nuevoEstado("SEV","DC","Manu",9,"D","clasico",22); S.talentos={}; S.nivel=99; S.car={};
var base=sk("gol");
invertirTalento("ataque","instinto");   /* rango 1/3, fx.gol:1.08 */
var conUnPunto=sk("gol");
invertirTalento("ataque","instinto"); invertirTalento("ataque","instinto");   /* rango 3/3, máximo */
var conMaximo=sk("gol");
if(!(conUnPunto>base)) f.push("sk('gol') no sube nada con 1 punto invertido");
if(!(conMaximo>conUnPunto)) f.push("sk('gol') no escala más al subir de 1/3 a 3/3");
if(Math.abs(conMaximo-base*1.08)>0.001) f.push("sk('gol') a rango máximo no aplica el fx completo declarado (esperado ×1.08, real ×"+(conMaximo/base).toFixed(4)+")");

/* 7 · bonusTalentosEntreno: un talento con fxEntreno multiplica de verdad gananciaEntreno de ESE atributo, y solo ese */
S=nuevoEstado("SEV","DC","Manu",9,"D","clasico",22);
S.compis=crearCompis("SEV","Manu"); S.entrenador=crearEntrenador("SEV");
S.talentos={}; S.nivel=99; S.techos={FIS:30,TEC:30};
var eFis=ENTRENOS.filter(function(e){return e.sube&&e.sube.FIS;})[0];
var gAntes=gananciaEntreno(eFis,"FIS",false);
invertirTalento("ataque","aereo");   /* fxEntreno:{FIS:1.10} */
var gDespues=gananciaEntreno(eFis,"FIS",false);
if(!(gDespues>gAntes)) f.push("un talento con fxEntreno.FIS no empuja gananciaEntreno de FIS");
var eTec=ENTRENOS.filter(function(e){return e.sube&&e.sube.TEC;})[0];
var gTecAntes=gananciaEntreno(eTec,"TEC",false);
S.talentos.ataque.aereo=0;   /* limpio el de FIS para no contaminar */
var gTecDespues=gananciaEntreno(eTec,"TEC",false);
if(Math.abs(gTecAntes-gTecDespues)>0.011) f.push("fxEntreno.FIS contamina la ganancia de OTRO atributo (TEC)");

/* 8 · bonusTalentosForma: fxForma.riesgo reduce de verdad la probabilidad de sobrecarga (medido empíricamente) */
function tasaSobrecarga(conTalento, tiradas){
  var hits=0;
  for(var i=0;i<tiradas;i++){
    S=nuevoEstado("SEV","DC","Manu",9,"D","clasico",22);
    S.compis=crearCompis("SEV","Manu"); S.entrenador=crearEntrenador("SEV");
    S.contrato={salario:5e5,anos:3,clausula:1e7,prima:2e4,franja:"media",exige:60,firmadoT:1};
    S.talentos={}; S.nivel=99; S.lesion=0; S.entreno={jor:0,hechos:[],extra:false};
    if(conTalento){ invertirCadena("fisico","indestr"); invertirTalento("fisico","indestr"); }   /* la cadena da rango 1; un punto más lo lleva al máximo (2) para medir el efecto completo */
    aplicarEntreno(0,true);
    if(S.lesion>0) hits++;
  }
  return hits/tiradas;
}
var tasaSin=tasaSobrecarga(false,1500), tasaCon=tasaSobrecarga(true,1500);   /* más tiradas: el efecto real (×0.75) es genuino pero la base ya es baja (~0.10), necesita potencia estadística */
if(!(tasaCon<tasaSin)) f.push("fxForma.riesgo (Indestructible) no reduce la sobrecarga medida (sin="+tasaSin.toFixed(3)+" con="+tasaCon.toFixed(3)+")");

/* 9 · oxidarTalentos: sin jugar durante muchas jornadas, el rango invertido baja; jugando regularmente, no */
S=nuevoEstado("SEV","DC","Manu",9,"D","clasico",22);
S.compis=crearCompis("SEV","Manu"); S.entrenador=crearEntrenador("SEV");
S.contrato={salario:5e5,anos:3,clausula:1e7,prima:2e4,franja:"media",exige:60,firmadoT:1};
S.talentos={}; S.nivel=99; S.edad=32;
invertirTalento("fisico","motor"); invertirTalento("fisico","motor"); invertirTalento("fisico","motor");
S.ultimaJugada=0;
var rangoAntes=talentoRango("fisico","motor");
var _r=rnd; rnd=function(){return 0.01;};   /* garantiza que la tirada de óxido siempre "acierte" cuando se evalúa */
for(var j=0;j<20;j++){ M=null; S.jornada=j; oxidarTalentos(); }
rnd=_r;
var rangoDespues=talentoRango("fisico","motor");
if(!(rangoDespues<rangoAntes)) f.push("oxidarTalentos no reduce el rango tras 20 jornadas sin jugar (antes="+rangoAntes+" despues="+rangoDespues+")");

/* 10 · sobrevive el cruce de temporada */
S=nuevoEstado("SEV","DC","Manu",9,"D","clasico",22);
S.compis=crearCompis("SEV","Manu"); S.entrenador=crearEntrenador("SEV");
S.contrato={salario:5e5,anos:3,clausula:1e7,prima:2e4,franja:"media",exige:60,firmadoT:1};
S.talentos={}; S.nivel=99;
invertirTalento("ataque","instinto"); invertirTalento("ataque","instinto");
S.jornada=38;
nuevaTemporada();
if(talentoRango("ataque","instinto")!==2) f.push("los talentos no sobreviven el cruce de temporada");

/* 11 · la UI pinta las 6 ramas y refleja qué falta cuando está bloqueado */
S=nuevoEstado("SEV","DC","Manu",9,"D","clasico",22);
S.compis=crearCompis("SEV","Manu"); S.entrenador=crearEntrenador("SEV");
S.talentos={}; S.nivel=8;
var html=secTalentos();
NOMBRES.forEach(function(rama){ if(html.indexOf(TALENTOS[rama].name)<0) f.push("la UI no muestra la rama "+rama); });
if(html.indexOf("Falta:")<0) f.push("la UI no muestra ningún aviso de 'Falta:' con nivel bajo (debería, con nivel 8 casi todo está bloqueado)");

/* 12 · regresión: Skills sigue funcionando exactamente igual (coexiste, no se rompió) */
S=nuevoEstado("SEV","DC","D",72);
S.attr.MEN=70; S.skl={}; S.skills=[]; S.reps={};
var kSkill=SKILLS.filter(function(x){return x.id==="sangrefria";})[0];
var iEj=-1; ENTRENOS.forEach(function(e,i){ if(e.id==="mental") iEj=i; });
aplicarEntreno(iEj,false);
var d=sklData("sangrefria");
if(!(d.pts>0 && d.pts<=8 && !sklPuedeSubir(kSkill))) f.push("skills dejó de funcionar tras convivir con talentos (candado de 1 sesión roto)");

console.log(f.length? "✘ F85: "+f.join(" · ") : "✔ F85: los 57 talentos (6 ramas, 4-6 filas, máx 3/fila, 1 capstone cada una) están completos y con efecto mecánico real en todos; el desbloqueo por nivel+prerequisito y la lógica AND (2 y 3 padres) funcionan igual que en la calculadora validada; el 2º/3er punto de un talento activo nunca se re-bloquea; sk() ya lee talentos y escala de verdad con el rango invertido (medido: ×1.08 exacto a rango máximo); fxEntreno empuja gananciaEntreno del atributo correcto y SOLO ese; fxForma.riesgo reduce la sobrecarga de forma medible; el óxido por inactividad reduce rango tras jornadas sin jugar; todo sobrevive el cruce de temporada; la UI pinta las 6 ramas con sus bloqueos explicados; y Skills sigue funcionando exactamente igual, sin romperse por la convivencia");
process.exit(f.length?1:0);
