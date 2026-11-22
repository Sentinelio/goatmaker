/* Banquillo (0.04.002): lesión de un compañero de tu puesto, ventanas de las decisiones y calidad del set */
var OK=0, KO=0;
function t(c,m){ if(c){ OK++; } else { KO++; console.log("✘ "+m); } }

/* ---- 1. el set: ids únicos, 2-3 opciones, textos de resultado coherentes ---- */
var ids={}; var nuevas=["bq-lesion","bq-rival-estrella","bq-grada","bq-titular-mal-dia","bq-veterano","bq-amarilla-compi","bq-ventaja","bq-analista","bq-capitan","bq-descanso","bq-cambios-sin-ti"];
SITS_BANQUILLO.forEach(function(s){ t(!ids[s.id],"id repetido "+s.id); ids[s.id]=1; });
nuevas.forEach(function(id){
  var s=SITS_BANQUILLO.filter(function(x){return x.id===id;})[0];
  t(!!s,"existe "+id); if(!s) return;
  t(s.o.length>=3,id+": al menos 3 opciones");
  t(s.o.every(function(o){ return o.l && (o.ok||o.mid||o.ko); }), id+": cada opción tiene texto");
  t(s.o.every(function(o){ return o.fx && o.fx.entra!==99; }), id+": ninguna opción de «hoy no juegas»");
});
t(nuevas.length===11,"10 nuevas + la de la lesión");

/* ---- 2. ventanas: nada técnico antes de que haya partido para opinar ---- */
function base(pos){
  OVSEM=null; OVSEM_COLA=[]; NEG=null;
  S=nuevoEstado("SEV",pos,"Manu",9,"D",ROLES[pos][0].id,24);
  S.contrato={salario:500000,anos:3,clausula:12000000,prima:25000,franja:"media",exige:65};
  ["TEC","FIS","TAC","DEF","MEN","POR"].forEach(function(k){ if(S.attr[k]!==undefined) S.attr[k]=60; });
  S.compis=crearCompis("SEV","Manu"); S.entrenador=crearEntrenador("SEV");
  return S;
}
["DFC","MC","DC"].forEach(function(pos){
  var s=SITS_BANQUILLO.filter(function(x){ return x.id==={DFC:"bq-segundo-def",MC:"bq-segundo-med",DC:"bq-segundo-att"}[pos]; })[0];
  t(!s.cond({min:32,sc:[0,0]}),"bq-segundo ("+pos+") NO sale en el 32");
  t(!s.cond({min:45,sc:[0,0]}),"bq-segundo ("+pos+") NO sale antes del 50");
  t(s.cond({min:55,sc:[0,0]}),"bq-segundo ("+pos+") sí sale en el 55");
});

/* ---- 3. simulación de suplentes ---- */
var sims=0, lesiones=0, ok1=0, delPuesto=0, conBajaReal=0, flashTxt=0, entraMin=[], segundoAntes50=0, decs={};
var _pf=pushFlash;
pushFlash=function(f){
  if(f && f.tipo==="sub-in" && M && M.lesionCompi && M.lesionCompi.n){
    var c=compis().filter(function(x){return x.n===M.lesionCompi.n;})[0];
    ok1++;
    if(c && c.pos===S.pos) delPuesto++;
    if(c && c.lesionPartido && c.lesion>0) conBajaReal++;
    if(f.txt && f.txt.indexOf(M.lesionCompi.n)>=0) flashTxt++;
    entraMin.push(M.min);
  }
  return _pf.apply(this,arguments);
};
var _es=elegirSituacion;
elegirSituacion=function(){
  var r=_es.apply(this,arguments);
  if(r && /^bq-/.test(r.id) && M && !M.enCampo){ decs[r.id]=(decs[r.id]||0)+1; if(/^bq-segundo/.test(r.id) && M.min<50) segundoAntes50++; }
  return r;
};
["DFC","MC","DC","LAT","EXT","POR"].forEach(function(pos){
  for(var r=0;r<3;r++){
    base(pos);
    for(var j=0;j<38;j++){
      S.conv={jor:S.jornada, rol:"suplente", txt:"Suplente", det:""};
      try{ jugarJornada(S.jornada); }catch(e){ console.log("ERROR jornada",e.message); break; }
      sims++; if(M && M.lesionCompi) lesiones++;
    }
  }
});
console.log("partidos de suplente simulados:",sims," · lesiones de compañero con entrada:",ok1);
t(ok1>=sims*0.03 && ok1<=sims*0.14,"frecuencia de lesión de compañero razonable (3-14%): "+(Math.round(ok1/sims*1000)/10)+"%");
t(delPuesto===ok1 && ok1>0,"el que se lesiona es siempre de tu puesto");
t(conBajaReal===ok1,"el compañero se queda de baja de verdad");
t(flashTxt===ok1,"el aviso de entrada nombra al lesionado");
t(entraMin.every(function(m){ return m>=30 && m<=89; }) && entraMin.some(function(m){ return m<45; }) && entraMin.some(function(m){ return m>=60; }),"la entrada por lesión cae a lo largo del partido: "+JSON.stringify(entraMin.slice(0,10)));
t(segundoAntes50===0,"el segundo entrenador nunca sale antes del 50");
console.log("decisiones de banquillo servidas:",JSON.stringify(decs));
t(Object.keys(decs).length>=8,"el banquillo reparte variedad: "+Object.keys(decs).length+" decisiones distintas");
pushFlash=_pf; elegirSituacion=_es;
console.log("BANQUILLO: "+OK+" ok · "+KO+" fallos");
