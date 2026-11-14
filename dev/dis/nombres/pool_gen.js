/* ---- perfiles: cómo se reparte el ORIGEN según quién sea la persona (pesos relativos; se normalizan) ----
   jug = jugadores de plantillas inventadas (Segunda, partidillo, fichajes y ventas) · mister = entrenadores · agente = candidatos a agente · esp = solo España (apellidos de negocios locales) */
var NOM_PERFIL_PESOS={
 jug:   {es:50,cat:9.5,eus:5,gal:7.5, ar:4.5,lat:5, br:2.2,pt:1.6, fr:2.2,afo:2.2, mag:1.6,afa:1.5, it:1.4,ger:1.3,en:1,bal:1.8, pl:0.5,ua:0.4,ge:0.4,jp:0.3},
 mister:{es:58,cat:10,eus:8.5,gal:8, ar:4,lat:0.5, br:0.3,pt:2.2, fr:0.8, it:2.5,ger:1.5,en:0.8,bal:1.2, mag:0.2},
 agente:{es:60,cat:12,eus:5,gal:8, ar:3.5,lat:1.5, br:0.5,pt:4, fr:1, it:2.5,ger:0.5,en:1},
 esp:   {es:72,cat:12,eus:6,gal:10}
};
var NOM_SESGO=1.35;      /* los primeros de cada lista salen más (García antes que Jaén): índice = n·r^1,35 */
var NOM_MAXLEN=26;       /* ningún nombre pasa de 26 letras (el generador de sílabas llegaba a 27) */
var NOM_ORIG={}, NOM_PERFIL={}, NOM_VETO=null;
(function nomInit(){
  Object.keys(NOM_DATA).forEach(function(id){
    var D=NOM_DATA[id], jov=[], men=[], neu=[];
    D.n.split(/\s+/).forEach(function(t){
      if(!t) return;
      if(t.charAt(0)==="+") jov.push(t.slice(1));
      else if(t.charAt(0)==="-") men.push(t.slice(1));
      else { jov.push(t); neu.push(t); }
    });
    NOM_ORIG[id]={ jov:jov, vet:men.concat(neu),
      ape:D.a.split(/\s+/).filter(Boolean).map(function(s){ return s.replace(/_/g," "); }),
      comp:D.comp? D.comp.split("|") : [], pcomp:D.pcomp||0, dob:D.dob||0, ma:D.ma||[], mn:D.mn||[] };
  });
  Object.keys(NOM_PERFIL_PESOS).forEach(function(p){
    var ids=[], acc=[], t=0, W=NOM_PERFIL_PESOS[p];
    Object.keys(W).forEach(function(id){ if(W[id]>0){ t+=W[id]; ids.push(id); acc.push(t); } });
    NOM_PERFIL[p]={ids:ids, acc:acc, tot:t};
  });
})();
function nomPick(a,r){ return a[Math.floor(Math.pow(r(),NOM_SESGO)*a.length)]; }
function nomOrigen(r,tipo){
  var P=NOM_PERFIL[tipo]||NOM_PERFIL.jug, x=r()*P.tot, i=0;
  while(i<P.ids.length-1 && x>=P.acc[i]) i++;
  return P.ids[i];
}
/* una persona SIN filtrar: origen → (nombre de pila, apellido) que casan; devuelve el desglose para poder auditarlo */
function nomConstruir(r,tipo){
  var oid=nomOrigen(r,tipo), O=NOM_ORIG[oid], era=(tipo==="jug"?"jov":"vet"), i, M, po=oid, ao=oid;
  for(i=0;i<O.mn.length;i++){ M=O.mn[i]; if(r()<M[1]){ po=M[0]; break; } }
  for(i=0;i<O.ma.length;i++){ M=O.ma[i]; if(r()<M[1]){ ao=M[0]; break; } }
  var P=NOM_ORIG[po], A=NOM_ORIG[ao], pila, a1, a2="", j;
  if(P.comp.length && r()<Math.min(0.30,P.pcomp*(tipo==="jug"?1:6))) pila=nomPick(P.comp,r); else pila=nomPick(P[era],r);
  a1=nomPick(A.ape,r);
  for(j=0;j<6 && a1===pila;j++) a1=nomPick(A.ape,r);                    /* «Lorenzo Lorenzo», nunca */
  if(A.dob && r()<Math.min(0.30,A.dob*(tipo==="jug"?1:2))){ a2=nomPick(A.ape,r); if(a2===a1 || a2===pila) a2=""; }
  var n=pila+" "+a1+(a2?" "+a2:"");
  if(n.length>NOM_MAXLEN && a2){ a2=""; n=pila+" "+a1; }                 /* demasiado largo: fuera el segundo apellido… */
  if(n.length>NOM_MAXLEN){ pila=nomPick(P[era],r); n=pila+" "+a1; }      /* …y, si hace falta, el nombre compuesto */
  return {n:n, o:oid, po:po, ao:ao, pila:pila, a1:a1, a2:a2};
}
function nomClave(n){ return String(n).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,""); }
/* vetados: gente demasiado conocida para que un jugador de Segunda se llame igual (y los jugadores reales de las plantillas del juego) */
function nomVetado(n){
  if(!NOM_VETO){
    if(typeof PLANTILLAS_REALES==="undefined" || !PLANTILLAS_REALES) return false;
    NOM_VETO={};
    NOM_VETADOS.split("|").forEach(function(v){ NOM_VETO[nomClave(v)]=1; });
    Object.keys(PLANTILLAS_REALES).forEach(function(id){ PLANTILLAS_REALES[id].forEach(function(j){ NOM_VETO[nomClave(j[0])]=1; }); });
  }
  return !!NOM_VETO[nomClave(n)];
}
function genPersonaD(r,tipo){
  r=r||rnd; if(!NOM_PERFIL[tipo]) tipo="jug";
  var p, k;
  for(k=0;k<8;k++){ p=nomConstruir(r,tipo); if(!nomVetado(p.n)) return p; }
  return p;
}
/* identidad procedural: determinista si le das la misma r; tipo = "jug" (por defecto), "mister" o "agente" */
function genPersona(r,tipo){ return genPersonaD(r,tipo).n; }
/* apellido español (negocios locales, patrocinios): sale del pool de España y sus lenguas */
function genApellido(r){ r=r||rnd; return nomPick(NOM_ORIG[nomOrigen(r,"esp")].ape,r); }
function nombrePrueba(){ return genPersona(rnd); }
/* ¿ya hay alguien con ese nombre en TU equipo (o eres tú)? Los rivales y los fichajes nuevos no pueden repetirlo */
function nomOcupado(n){
  if(typeof S==="undefined" || !S) return false;
  if(S.nombre===n) return true;
  var L=S.compis||[], i;
  for(i=0;i<L.length;i++) if(L[i].n===n) return true;
  return false;
}
function personaNuevaEnMiClub(){ var n, k=0; do { n=genPersona(rnd); k++; } while(nomOcupado(n) && k<30); return n; }
