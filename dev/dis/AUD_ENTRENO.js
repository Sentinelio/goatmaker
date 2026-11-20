/* ===== AUDITORÍA · entrenamiento: simulación de semanas con decisiones al azar =====
   Uso: HTML=/ruta/index.html dis/correr.sh AUD_ENTRENO.js
   Busca: atascos del día, valores fuera de rango, atributos que bajan entrenando, rondas vacías o repetidas. */
var __f=0, __o=0, __hall={};
function __ok(c,m){ if(c) __o++; else { __f++; __hall[m]=(__hall[m]||0)+1; } }
var _em=estiloMister, FORZ_DOBLE=false;
guardar=function(){}; irSub=function(){}; irSec=function(){};   /* sin disco ni pantallas: solo la lógica */
estiloMister=function(){ var e=_em(); var c={}; for(var k in e) c[k]=e[k]; c.doble=FORZ_DOBLE; return c; };
var ATT=ATTR_ORDEN;
function snap(){ var o={}; ATT.concat(["POR"]).forEach(function(k){ o[k]=atr(k); }); return o; }
function nuevo(pos,edad){
  S=nuevoEstado("BET",pos,"B",7,"D",ROLES[pos][0].id,edad||22);
  S.contrato=S.contrato||{salario:900000,anos:3,exige:60};
  S.lesion=0; S.sancion=0; S.jornada=1; S.forma=80; S.mister=55; S.conf=55; S.dia=null; S.entMister=null;
}
function rr(n){ return Math.floor(Math.random()*n); }
/* 1 · situaciones por puesto */
var poss=Object.keys(POS), tabla=[];
poss.forEach(function(p){
  nuevo(p,24);
  var n=sitsEntreno().length; tabla.push(p+":"+n);
  [false,true].forEach(function(d){
    FORZ_DOBLE=d; S.dia=null; S.lesion=0; S.jornada++; CITA_UI={jor:S.jornada,ll:0,sa:0}; empezarDia();
    var esp=d?4:3, got=S.dia? S.dia.rondas.length:-1;
    __ok(got===esp, "RONDAS: "+p+(d?" doble":" normal")+" propone "+got+" jugadas y debería "+esp+" (situaciones propias: "+n+")");
    if(S.dia){ var ids=S.dia.rondas.map(function(r){return r.id;}); __ok(new Set(ids).size===ids.length, "RONDAS: "+p+" repite situación en un mismo día"); }
  });
});
console.log("situaciones por puesto → "+tabla.join(" · "));
/* 2 · simulación */
var stuck=0, semanas=0, lesiones=0;
poss.forEach(function(p){
  [false,true].forEach(function(d){
    FORZ_DOBLE=d; nuevo(p,19);
    for(var w=0; w<38*3; w++){
      S.jornada=(w%38)+1; S.temporada=Math.floor(w/38)+1; if(w%38===0 && w>0) S.edad=(S.edad||22)+1;
      if(S.lesion>0){ S.lesion--; continue; }
      semanas++;
      var accion=rr(10);
      if(accion===0){ cerrarEntrenoPendiente(); continue; }                 /* no vas al entreno */
      var ll=rr(3), sa=rr(3); CITA_UI={jor:S.jornada,ll:ll,sa:sa};
      var antes=snap(); empezarDia();
      if(!S.dia){ __ok(false,"DIA: empezarDia no creó el día en semana "+w+" ("+p+")"); continue; }
      var it=0, abandona=(accion===1)? rr(6):99, pasos=0;
      while(S.dia.fase!=="fin" && it<40){
        it++; pasos++;
        if(pasos>abandona){ break; }
        var ph=S.dia.fase, ant=snap(), ar=[S.forma,S.mister,S.conf];
        if(ph==="antes"||ph==="despues"){ if(S.lesion>0) break; if(rr(3)===0) diaSaltar(); else diaSesion(ENTRENOS[rr(ENTRENOS.length)].id); }
        else if(ph==="mister"){ var R=S.dia.rondas[S.dia.ronda]; if(!R){ __ok(false,"DIA: fase míster sin ronda ("+p+")"); break; } entMisterElige(rr(R.ops.length)); }
        else if(ph==="notaMister") diaSeguir();
        var des=snap(); ATT.concat(["POR"]).forEach(function(k){ __ok(des[k]>=ant[k]-1e-9, "ATRIB: entrenar BAJA "+k+" ("+ant[k]+"→"+des[k]+")"); });
        if(S.lesion>0){ lesiones++; break; }
        if(S.dia.fase===ph && it>38) { stuck++; break; }
      }
      cerrarEntrenoPendiente();
      __ok(S.dia.fase==="fin", "DIA: cerrarEntrenoPendiente deja el día sin cerrar ("+S.dia.fase+")");
      /* invariantes */
      ATT.concat(S.pos==="POR"?["POR"]:[]).forEach(function(k){
        var v=atr(k), T=techoAtributoDe(k);
        __ok(isFinite(v) && v>=10 && v<=96, "RANGO: "+k+" fuera de rango ("+v+")");
        if(v>antes[k]+1e-9) __ok(v<=T+1e-6, "TECHO: "+k+" sube por encima del techo ("+v+" > "+T+")");
      });
      __ok(S.forma>=20 && S.forma<=100 && isFinite(S.forma), "RANGO: forma "+S.forma);
      __ok(S.mister>=5 && S.mister<=95 && isFinite(S.mister), "RANGO: míster "+S.mister);
      __ok(S.conf>=5 && S.conf<=95 && isFinite(S.conf), "RANGO: confianza "+S.conf);
      __ok(S.dia.nota===undefined || (S.dia.nota>=3 && S.dia.nota<=10), "NOTA: fuera de 3–10 ("+S.dia.nota+")");
      Object.keys(S.skl||{}).forEach(function(id){ var q=S.skl[id]; __ok(isFinite(q.pts) && q.pts>=0 && q.niv>=0, "SKILL: "+id+" valor raro "+JSON.stringify(q)); });
      S.forma=clamp(S.forma+15,20,100);   /* recuperación entre semanas */
      S.entreno=null; S.puntualBonus=0;
    }
  });
});
console.log("semanas simuladas: "+semanas+" · atascos: "+stuck+" · lesiones por sobrecarga: "+lesiones);
Object.keys(__hall).forEach(function(k){ console.log("✘ ("+__hall[k]+"×) "+k); });
console.log("AUD_ENTRENO: "+__o+" ok · "+__f+" fallos");
