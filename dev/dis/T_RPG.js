/* ===== T_RPG · la auditoría que no duerme ===== */
renderHub=function(){};
console.log("— T_RPG: registro fx · manifiesto · rangos · fuzz de carrera —");
var RPG_FALLOS=[];
function RF(m){ RPG_FALLOS.push(m); }

/* ---------- PILAR 1 · registro fx: toda promesa del bazar, cableada ---------- */
(function(){
  var REG={ regen:"agrega", modLes:"agrega", mult:"agrega", seg:"agrega", conf:"agrega",
            misterSem:"agrega", amortMister:"agrega", robo:"agrega", seguro:"agrega",
            vicioMod:"agrega", vicio:"agrega", ego:"compra",
            confYa:"instant", formaYa:"instant", segYa:"instant", misterYa:"instant", afinYa:"instant", egoYa:"instant" };
  TIENDA_CATS.forEach(function(c){
    Object.keys(c.fx||{}).forEach(function(k){
      if(!(k in REG)) RF("fx sin registrar (promesa sin cable): "+c.id+"."+k);
    });
  });
  /* funcional: cada clave agregable mueve su campo en bonusTienda */
  S=nuevoEstado("SEV","MC","Manu",9,"D","clasico",22);
  S.compis=crearCompis("SEV","Manu"); S.entrenador=crearEntrenador("SEV");
  tiendaInit();
  var IT=tiendaItems();
  var PRUEBAS=[ ["recu", function(B){return B.regen>0 && B.modLes<1;}],
                ["gym",  function(B){return (B.mult.FIS||1)>1;}],
                ["reloj",function(B){return B.seg>0 && B.robo>0;}],
                ["mascota",function(B){return B.conf>0;}],
                ["mente",function(B){return B.misterSem>0;}],
                ["jprensa",function(B){return B.amortMister<1;}],
                ["segur",function(B){return B.seguro===true;}],
                ["escolta",function(B){return B.vicioMod<0;}],
                ["tec",  function(B){return B.vicioTent>0;}] ];
  PRUEBAS.forEach(function(p){
    S.tienda={own:{},serv:{}};
    var it=IT.filter(function(x){return x.cat===p[0] && x.tier===0;})[0];
    if(!it){ RF("registro: sin item t0 en "+p[0]); return; }
    (it.tipo==="serv"? S.tienda.serv : S.tienda.own)[it.id]=1;
    if(!p[1](bonusTienda())) RF("registro fx no mueve bonusTienda: "+p[0]);
  });
  S.tienda={own:{},serv:{}};
})();

/* ---------- MANIFIESTO de claves de S ---------- */
var FIJOS=["nombre","dorsal","pos","lado","pierna","rol","edad","altura","equipo","division","temporada","potencial","mister","repsM",
  "attr","reps","skills","skl","car","vicios","publico","muro","prensa","entrenador","contrato","acuerdo",
  "dinero","dineroCarrera","custom","vidaLog","fama","esperas","conf","moral","debug","compis","mote",
  "bienvenida","vida","mundo","fichajes","archivo","carrera","tienda","histLes","agente","fidelidad","modLesTemp","patros","misPosts","peso","posSec","tensiones","nemesis","nivel","xp","techos","techoPend","talentoPend","vitrina","talentos","ultimaJugada"];
var TEMPORALES=["jornada","hist","tabla","racha","yo","reto","forma","lesion","sancion","motivoBaja","crisisAvisada",
  "rumores","rumorLog","traspasos","ofertaInv","renovProc","azuzado","transferPed","agenteBoost","movClub",
  "capricho2","caprichoCd","maniobraSem","maniobraCd","redesSem","hatersSem","rehabSem","rehabPlan","rehabReforzada",
  "avisoMercado","avisoVida","ascendido","escandalo","calendario","golDif",
  "animo","misterNuevo","entreno","skillNueva","desafios","castigo","ciclo","objetivo","objPers","evaluacion",
  "garantia","subidaSueldo","ofertasVerano","conv","zonas","fixture","semanaHecha","sitGlobal",
  "avisoMister","avisoCapricho","avisoSaltado","player_cap","patroOferta","patroSem","ofertaPend","_castJor","portazo","renovCd","puntualSem","puntualBonus","rachaExtra","dia","entMister","convU","vocesClave","vocesElegidas","vocesVistas","avisoEntreno","sitsRec","horaRec","objPagadoT"];
var INFRA=["v","seed","ligaSeed","autoNota","pistas","opciones","dbg","tut","tutHecho","guardadoEn","idPartida","opts"];
var MANIFIESTO={};
FIJOS.concat(TEMPORALES).concat(INFRA).forEach(function(k){ MANIFIESTO[k]=1; });

/* ---------- NaN-scan recursivo + validadores de rango ---------- */
function nanScan(o, ruta, prof){
  if(prof>7) return;
  if(typeof o==="number"){ if(!isFinite(o)) RF("no-finito en "+ruta+" = "+o); return; }
  if(!o || typeof o!=="object") return;
  if(Array.isArray(o)){ for(var i=0;i<Math.min(o.length,400);i++) nanScan(o[i], ruta+"["+i+"]", prof+1); return; }
  for(var k in o) nanScan(o[k], ruta+"."+k, prof+1);
}
var RANGOS=[
  [function(){return S.forma;},                20, 100, "forma"],
  [function(){return S.conf;},                  5,  95, "conf"],
  [function(){return S.mister;},                5,  95, "mister"],
  [function(){return S.dinero;},                0, 1e12, "dinero"],
  [function(){return S.fama;},                  0, 1e6, "fama"],
  [function(){return pub().seg;},               0, 1e9, "seg"],
  [function(){return pub().afic;},              0, 100, "afic"],
  [function(){return pub().prensa;},            0, 100, "prensaIdx"],
  [function(){return S.lesion||0;},             0,  30, "lesion"],
  [function(){return bonusTienda().upkeep;},    0, 1e7, "upkeep"]
];
function chequeoRangos(tag){
  RANGOS.forEach(function(r){
    var v=r[0]();
    if(v===undefined) return;
    if(!(v>=r[1] && v<=r[2])) RF(tag+" · "+r[3]+" fuera de rango: "+v);
  });
  ATTR_ORDEN.forEach(function(a){ var v=atr(a); if(!(v>=10 && v<=99.5)) RF(tag+" · attr."+a+" fuera: "+v); });
  (S.compis||[]).forEach(function(c){ if(!(c.afin>=0 && c.afin<=100)) RF(tag+" · afin de "+c.n+" fuera: "+c.afin); });
  (S.rumores||[]).forEach(function(r){ if(r.vivo && !(r.fuerza>=0.05 && r.fuerza<=0.95)) RF(tag+" · fuerza rumor fuera: "+r.fuerza); });
  for(var k in (S.vicios||{})){ var vv=S.vicios[k]; if(!(vv>=0 && vv<=100)) RF(tag+" · vicio "+k+" fuera: "+vv); }
}
function chequeoClaves(tag){
  Object.keys(S).forEach(function(k){
    if(!MANIFIESTO[k]) RF(tag+" · CLAVE SIN CLASIFICAR en S: «"+k+"»");
  });
}

/* ---------- PILAR 4 · fuzz de carrera con los gates encendidos ---------- */
(function(){
  PISTAS_ON=true; MERCADO_ON=true; TIENDA_ON=true;
  [11, 47].forEach(function(semilla){
    S=nuevoEstado("SEV","EXT","Manu",9,"D","invertido",21);
    S.contrato={salario:420000,anos:3,clausula:9000000,prima:18000,franja:"media",exige:60,firmadoT:1};
    S.compis=crearCompis("SEV","Manu"); S.entrenador=crearEntrenador("SEV");
    S.dinero=300000;
    var paso=0;
    var decide=function(sit){
      paso++;
      var n=(sit.o||[]).length||1;
      return (semilla+paso*7)%n;
    };
    for(var T=0;T<2;T++){
      var tag="s"+semilla+"·T"+S.temporada;
      /* compras de fuzz: que el bazar viva */
      tiendaInit();
      var IT=tiendaItems();
      ["recu","tec","escolta"].forEach(function(cat){
        var it=IT.filter(function(x){return x.cat===cat && x.tier===0;})[0];
        if(it && (S.dinero||0)>=it.precio) comprarBazar(it.id);
      });
      temporadaCompleta(decide);
      if(!S){ RF(tag+" · S desapareció"); return; }
      nanScan(S, tag+".S", 0);
      chequeoRangos(tag);
      chequeoClaves(tag);
      if(S.hist.length!==38) RF(tag+" · hist="+S.hist.length+" (esperaba 38)");
      var dump=JSON.stringify(S);
      if(dump.length>2500000) RF(tag+" · guardado obeso: "+Math.round(dump.length/1024)+"KB");
      try{ JSON.parse(dump); }catch(e){ RF(tag+" · guardado no parseable"); }
      /* frontera: sellos antes, veredicto después */
      var sello={ tiendaOwn:Object.keys((S.tienda||{}).own||{}).length,
                  histLes:(S.histLes||[]).length, fid:S.fidelidad||0,
                  pot:S.potencial, mst:S.mister };
      nuevaTemporada();
      if(Object.keys((S.tienda||{}).own||{}).length!==sello.tiendaOwn) RF(tag+" · el bazar no cruzó el verano");
      if((S.histLes||[]).length!==sello.histLes) RF(tag+" · histLes no cruzó");
      if((S.fidelidad||0)!==sello.fid) RF(tag+" · fidelidad no cruzó");
      if(S.renovProc!==undefined) RF(tag+" · renovProc sobrevivió al verano");
      if(S.maniobraCd!==undefined && Object.keys(S.maniobraCd||{}).length) RF(tag+" · maniobraCd sobrevivió");
      if(S.potencial!==sello.pot) RF(tag+" · EL TECHO CAMBIÓ EN VERANO: "+sello.pot+"→"+S.potencial);
      if(!S.misterNuevo && Math.abs(S.mister-sello.mst)>15) RF(tag+" · míster sin continuidad (ni cura ni evaluación explican "+sello.mst.toFixed(1)+"→"+S.mister.toFixed(1)+")");
      if(S.misterNuevo && !(S.mister>=25 && S.mister<=75)) RF(tag+" · míster nuevo fuera del arrastre 25-75: "+S.mister);
    }
  });
  PISTAS_ON=false; MERCADO_ON=false; TIENDA_ON=false;
})();

if(RPG_FALLOS.length){
  var vistos={};
  RPG_FALLOS.forEach(function(f){ if(!vistos[f]){ vistos[f]=1; console.log("  ✘ "+f); } });
  console.log("RESULTADO T_RPG: "+Object.keys(vistos).length+" hallazgo(s) únicos ✘");
  process.exitCode=1;
} else {
  console.log("✔ T_RPG en verde: promesas del bazar cableadas, 33 parámetros en rango, ni un NaN en dos carreras completas con todo encendido, claves de S clasificadas al 100%, y la frontera del verano respetando carrera y matando temporada");
  console.log("RESULTADO T_RPG: 0 ✘");
}
