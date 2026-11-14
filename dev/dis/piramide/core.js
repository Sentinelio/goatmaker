/* ===== NÚCLEO · las fórmulas del motor de La Primera, copiadas tal cual (v4.66.0) =====
   Nada de aquí es una aproximación: cada función replica a la del juego y el test F87 lo comprueba contra el motor real.
   Lo único «nuevo» (puertas, rangos, bolsas) vive en CFG, fuera de este bloque. */
var CORE=(function(){
  function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
  var POSL=["POR","DFC","LAT","MCD","MC","MCO","EXT","DC"];
  var POS_N={POR:"Portero",DFC:"Central",LAT:"Lateral",MCD:"Pivote",MC:"Interior",MCO:"Mediapunta",EXT:"Extremo",DC:"Delantero"};
  var ATTR_ORDEN=["TEC","FIS","TAC","DEF","MEN"];
  var ATTR_BASE={
    POR:{TEC:44,FIS:52,TAC:56,DEF:50,MEN:58,POR:60},
    DFC:{TEC:46,FIS:60,TAC:56,DEF:64,MEN:54,POR:10},
    LAT:{TEC:52,FIS:64,TAC:54,DEF:56,MEN:50,POR:10},
    MCD:{TEC:52,FIS:58,TAC:62,DEF:60,MEN:54,POR:10},
    MC: {TEC:60,FIS:56,TAC:62,DEF:48,MEN:52,POR:10},
    MCO:{TEC:64,FIS:50,TAC:58,DEF:40,MEN:54,POR:10},
    EXT:{TEC:62,FIS:60,TAC:50,DEF:40,MEN:50,POR:10},
    DC: {TEC:58,FIS:58,TAC:50,DEF:38,MEN:58,POR:10}
  };
  var PESO_MEDIA={
    POR:{POR:.55,TAC:.15,MEN:.15,TEC:.10,FIS:.05,DEF:0},
    DFC:{DEF:.38,FIS:.22,TAC:.20,MEN:.10,TEC:.10,POR:0},
    LAT:{FIS:.30,DEF:.24,TEC:.20,TAC:.16,MEN:.10,POR:0},
    MCD:{TAC:.28,DEF:.28,TEC:.20,FIS:.14,MEN:.10,POR:0},
    MC: {TEC:.32,TAC:.28,FIS:.18,MEN:.12,DEF:.10,POR:0},
    MCO:{TEC:.38,TAC:.24,MEN:.18,FIS:.12,DEF:.08,POR:0},
    EXT:{TEC:.34,FIS:.26,TAC:.16,MEN:.14,DEF:.10,POR:0},
    DC: {TEC:.34,MEN:.24,FIS:.24,TAC:.12,DEF:.06,POR:0}
  };
  var ENTRENOS=[
    {id:"tecnica",  pos:null, sube:{TEC:1}},
    {id:"fisico",   pos:null, sube:{FIS:1}},
    {id:"tactica",  pos:null, sube:{TAC:1}},
    {id:"mental",   pos:null, sube:{MEN:1}},
    {id:"parado",   pos:null, sube:{TEC:0.55,MEN:0.5}},
    {id:"reflejos", pos:["POR"], sube:{POR:1.1}},
    {id:"salidas",  pos:["POR"], sube:{POR:0.7,DEF:0.5}},
    {id:"pies",     pos:["POR"], sube:{TEC:0.8,TAC:0.4}},
    {id:"duelos",   pos:["DFC","LAT","MCD"], sube:{DEF:1.1}},
    {id:"salidabal",pos:["DFC","LAT","MCD"], sube:{TEC:0.7,TAC:0.5}},
    {id:"idayvuelta",pos:["LAT","EXT"], sube:{FIS:0.9,TAC:0.3}},
    {id:"pasein",   pos:["MCD","MC","MCO"], sube:{TEC:0.7,TAC:0.6}},
    {id:"llegada",  pos:["MC","MCO","LAT"], sube:{FIS:0.6,TEC:0.5}},
    {id:"robo",     pos:["MCD","MC","DFC"], sube:{DEF:0.8,TAC:0.5}},
    {id:"definicion",pos:["DC","EXT","MCO"], sube:{TEC:0.9,MEN:0.4}},
    {id:"regate",   pos:["EXT","MCO","DC"], sube:{TEC:0.8,FIS:0.4}},
    {id:"remate",   pos:["DC","DFC"], sube:{FIS:0.7,DEF:0.4,TEC:0.3}}
  ];
  function entrenosDe(pos){ return ENTRENOS.filter(function(e){ return !e.pos || e.pos.indexOf(pos)>=0; }); }
  /* ---- nivel y XP ---- */
  function xpParaNivel(n){ return 30+10*n; }
  function nivelSuelo(edad){ return Math.max(1, Math.round((edad-16)*1.7)+1); }
  function nivelRango(edad){ return Math.round(clamp(26-(edad-16)*0.9, 5, 25)); }
  function nivelInicial(edad, notaPrueba){
    var suelo=nivelSuelo(edad), rango=nivelRango(edad);
    var norm=clamp(((notaPrueba||6)-4)/5, 0, 1);
    return clamp(suelo+Math.round(rango*norm), 1, 99);
  }
  function talentosDe(nivel){ return Math.max(0, nivel-7); }
  /* ---- la media y la edad ---- */
  function offsetEdad(e){ return e<20? -(20-e)*3.2 : e<=30? (e-20)*0.9 : (10*0.9)-(e-30)*1.4; }
  /* PROPUESTA (no es del motor): cómo se comporta el término de edad de la media DESPUÉS de los 30. «actual» = el del motor (cae de +5,5 a −1,1 de golpe). */
  var MODO_EDAD="actual";
  function setModoEdad(m){ MODO_EDAD=(m==="suave"||m==="plano")? m : "actual"; }
  function getModoEdad(){ return MODO_EDAD; }
  function curvaEdad(e){ return e<20? -4+(e-16)*1.1 : e<=30? (e-20)*0.55 : (MODO_EDAD==="suave"? 5.5-(e-30)*1.1 : MODO_EDAD==="plano"? 5.5 : -(e-30)*1.1); }
  function bonusPrueba(n){ return clamp(Math.round((n-6.3)*(n>=8?12:8)), -16, 26); }
  function mediaAspirante(pos, e, nota, attrBonus){
    var b=JSON.parse(JSON.stringify(ATTR_BASE[pos]));
    var d=offsetEdad(e);
    var w=PESO_MEDIA[pos]||PESO_MEDIA.MC, base=0;
    for(var k in w){ base+=clamp(b[k]+d+(attrBonus||0),15,92)*w[k]; }
    base+=(nota===undefined? 0 : bonusPrueba(nota));
    return Math.round(clamp(base*0.92+curvaEdad(e)+14, 40, 95));
  }
  function atributosIniciales(pos, e){
    var b=JSON.parse(JSON.stringify(ATTR_BASE[pos])), d=offsetEdad(e);
    for(var k in b){ b[k]=Math.round(clamp(b[k]+d,15,92)); }
    return b;
  }
  function mediaDe(pos, e, attr){
    var w=PESO_MEDIA[pos]||PESO_MEDIA.MC, base=0;
    for(var k in w){ base+=(attr[k]===undefined?50:attr[k])*w[k]; }
    return Math.round(clamp(base*0.92+curvaEdad(e)+14, 40, 95));
  }
  /* ---- techo por atributo (68 + 0,28 por punto) y declive a partir de los 29 ---- */
  function tasaDeclive(k){ return {TEC:0.35, FIS:1.0, TAC:0.30, DEF:0.55, MEN:0.20, POR:0.40}[k]||0.5; }
  function techoAtributo(pos, e, techos, k, form){
    var base=68+(form||0), inc=0.28, pts=(techos&&techos[k])||0;   /* form: PROPUESTA, techo base que sube o baja con el entorno; sin él, el del motor */
    var techo=base+pts*inc;
    if(e>28){
      var peso=(PESO_MEDIA[pos]||PESO_MEDIA.MC)[k]; if(peso===undefined) peso=0.15;
      var factorPos=0.3+peso*3.5, d=e-28;
      techo-=d*d*0.12*tasaDeclive(k)*factorPos;
    }
    return clamp(techo,30,96);
  }
  /* ---- una sesión de entreno ---- */
  function gananciaEntreno(ej, k, v, T, p){
    var base=(ej.sube[k]||0); if(!base) return 0;
    if(v>=T) return 0;
    var techo=clamp((T-v)/52, 0.05, 1.10);
    var ff=(ej.id==="remate")? clamp(1+(((p.altura===undefined?180:p.altura)-180)/220)+(((p.peso===undefined?75:p.peso)-75)/280), 0.85, 1.20) : 1;   /* factorFisico: solo el remate */
    var mult=(0.85+((p.conf===undefined?55:p.conf)/300))*(p.multEntreno||1)*ff;
    return Math.round(base*techo*mult*100)/100;
  }
  /* ---- el envejecimiento de cada verano (nuevaTemporada) ---- */
  function caidaAnual(ed){ return ed>=34? 2.6 : ed>=32? 1.7 : 0.9; }
  function envejecer(pos, attr, ed){
    if(ed<30) return;
    var c=caidaAnual(ed);
    attr.FIS=clamp(attr.FIS-c*1.6,10,95); attr.TEC=clamp(attr.TEC-c*0.4,10,95); attr.DEF=clamp(attr.DEF-c*0.5,10,95);
    if(pos==="POR") attr.POR=clamp(attr.POR-c*0.5,10,95);
    attr.TAC=clamp(attr.TAC+0.6,10,95); attr.MEN=clamp(attr.MEN+0.5,10,95);
  }
  /* ---- las reglas de edad que ya existen repartidas por el motor ---- */
  function sueldoX(e){ return e<19? 0.45 : e<22? 0.7 : e<=30? 1 : 0.75; }
  function contratoAnos(e){ return e<20? 4.4 : e<24? 3.5 : e<=30? 3 : 2; }   /* esperanza: 4+40%, 3+50% */
  function valorX(e){ return e<=21?1.15 : e<=27?1 : e<=29?0.85 : e<=31?0.65 : e<=33?0.45 : 0.3; }
  function traspasoX(e){ return e<=23? 1.35 : e<=27? 1.15 : e<=30? 0.85 : 0.5; }
  function oxidoSkill(e){ return e>=31? 1.5 : e>=28? 1.2 : e<=22? 0.7 : 1.0; }
  function oxidoTalento(e){ return e>=31? 1.6 : e>=28? 1.2 : e<=22? 0.6 : 1.0; }
  function reglasEdad(e){
    return {edad:e, off:offsetEdad(e), curva:curvaEdad(e), sueldoX:sueldoX(e), anos:contratoAnos(e), valorX:valorX(e), traspasoX:traspasoX(e),
            oxSk:oxidoSkill(e), oxTa:oxidoTalento(e), caidaFIS:(e>=30? caidaAnual(e)*1.6 : 0)};
  }
  /* ---- dinero: la ficha según la franja del club, tu media y tu edad ---- */
  var FRANJAS=["segunda","modesta","baja","media","alta","élite"];
  var FR={ "segunda":{exige:48,sal:150000,cl:10}, "modesta":{exige:52,sal:190000,cl:16}, "baja":{exige:59,sal:380000,cl:22},
           "media":{exige:65,sal:750000,cl:30}, "alta":{exige:71,sal:1500000,cl:45}, "élite":{exige:78,sal:3400000,cl:60} };
  function franjaPorMedia(mia){ return mia>=78?5 : mia>=71?4 : mia>=65?3 : mia>=59?2 : mia>=53?1 : 0; }
  function salarioDe(f, mia, edad){
    var ajusteMedia=Math.pow(clamp(mia/f.exige,0.55,1.4),2.2);
    return Math.round(f.sal*ajusteMedia*sueldoX(edad)/1000)*1000;
  }
  /* ---- la tanda de entrada de HOY (generarTanda): la franja manda, la nota del ojeo empuja o hunde ---- */
  function nivelHoy(mia, nota){
    var nivel=franjaPorMedia(mia);
    if(nota!==undefined){ if(nota>=8.6) nivel+=2; else if(nota>=7.6) nivel+=1; else if(nota<5.0) nivel-=1; }
    return clamp(nivel,0,5);
  }
  function tandaHoy(mia, nota){ var n=nivelHoy(mia,nota); return [Math.min(5,n+1), n, n, Math.max(0,n-1), Math.max(0,n-2)]; }
  /* ---- el papel que te ofrece un club (ofertaDe) ---- */
  function rolDe(dif){ return dif>=2? 0 : dif>=-5? 1 : dif>=-12? 2 : 3; }
  var ROLES=["Titular desde el primer día","Pelearás el puesto","Rotaciones y minutos sueltos","Banquillo y mucha paciencia"];
  /* ---- la carrera: sesiones voraces (el ejercicio que más media da), XP fija por temporada, puntos de techo a los 3 atributos clave ---- */
  function claves(pos){
    var w=PESO_MEDIA[pos], ks=Object.keys(w).filter(function(k){ return w[k]>0; });
    ks.sort(function(a,b){ return w[b]-w[a]; });
    return ks.slice(0,3);
  }
  function simular(p){
    var pos=p.pos, a0=p.edad0, nSes=(p.sesiones===undefined?3:p.sesiones), xpT=p.xpTemp, reparto=p.reparto||"reparto";
    var W=PESO_MEDIA[pos], K=Object.keys(W).filter(function(k){return W[k]>0;}).sort(function(a,b){return W[b]-W[a];});
    var disp=entrenosDe(pos).filter(function(e){ return Object.keys(e.sube).some(function(k){ return W[k]>0; }); });
    var attr=atributosIniciales(pos,a0), techos={}, nivel=nivelInicial(a0,p.nota), xp=0, pend=0, pts=0, out=[], rot=0, plata=0;
    var nivel0=nivel, maxEdad=p.maxEdad||38, form=(p.form0||0), pp=p, xpA=xpT;   /* form0: PROPUESTA, formación de partida (0 = como el motor) */
    var fMin=(p.formMin===undefined?-10:p.formMin), fMax=(p.formMax===undefined?8:p.formMax);
    for(var a=a0; a<=maxEdad; a++){
      /* PROPUESTA (opcional): el entorno de la temporada mueve el ritmo (XP y entreno) y la formación (techo base); los giros son saltos de formación a una edad */
      var ritmo=1;
      if(p.entornoDe){ var en=p.entornoDe(a)||{}; ritmo=(en.ritmo===undefined?1:en.ritmo); form+=(en.dForm||0); }
      if(p.girosDe){ form+=(p.girosDe(a)||0); }
      form=clamp(form,fMin,fMax);
      xpA=xpT*ritmo; pp=(ritmo===1? p : Object.assign({},p,{multEntreno:(p.multEntreno||1)*ritmo}));
      for(var j=0;j<38;j++){
        for(var s=0;s<nSes;s++){
          var mejor=null, mv=-1, mg=null;
          for(var i=0;i<disp.length;i++){
            var e=disp[i], val=0, gs={};
            for(var k in e.sube){
              var T=techoAtributo(pos,a,techos,k,form), g=gananciaEntreno(e,k,attr[k],T,pp);
              gs[k]=g; val+=g*(W[k]||0);
            }
            if(val>mv){ mv=val; mejor=e; mg=gs; }
          }
          if(mejor){ for(var k2 in mg){ attr[k2]=clamp(attr[k2]+mg[k2],10,techoAtributo(pos,a,techos,k2,form)); } }
        }
        if(nivel<99){
          xp+=xpA/38;
          while(nivel<99 && xp>=xpParaNivel(nivel)){ xp-=xpParaNivel(nivel); nivel++; pend++; }
        }
        while(pend>0){
          var kk=null;
          if(reparto==="concentra"){ for(var q=0;q<K.length;q++){ if(techoAtributo(pos,a,techos,K[q],form)<90){ kk=K[q]; break; } } if(!kk) kk=K[0]; }
          else { kk=K[rot%3]; rot++; }
          techos[kk]=(techos[kk]||0)+1; pend--; pts++;
        }
      }
      var med=mediaDe(pos,a,attr);
      var fr=FR[FRANJAS[franjaPorMedia(med)]];
      var ficha=salarioDe(fr,med,a); plata+=ficha;
      out.push({edad:a, media:med, nivel:nivel, pts:pts, talentos:talentosDe(nivel), ficha:ficha, plata:plata, franja:FRANJAS[franjaPorMedia(med)], form:form, ritmo:ritmo,
                attr:JSON.parse(JSON.stringify(attr))});
      envejecer(pos,attr,a+1);
    }
    return {nivel0:nivel0, talentos0:talentosDe(nivel0), temporadas:out};
  }
  return {setModoEdad:setModoEdad, getModoEdad:getModoEdad, POSL:POSL, POS_N:POS_N, ATTR_ORDEN:ATTR_ORDEN, ATTR_BASE:ATTR_BASE, PESO_MEDIA:PESO_MEDIA, ENTRENOS:ENTRENOS, FRANJAS:FRANJAS, FR:FR, ROLES:ROLES,
          clamp:clamp, xpParaNivel:xpParaNivel, nivelInicial:nivelInicial, talentosDe:talentosDe, offsetEdad:offsetEdad, curvaEdad:curvaEdad,
          bonusPrueba:bonusPrueba, mediaAspirante:mediaAspirante, atributosIniciales:atributosIniciales, mediaDe:mediaDe,
          techoAtributo:techoAtributo, gananciaEntreno:gananciaEntreno, envejecer:envejecer, entrenosDe:entrenosDe,
          sueldoX:sueldoX, contratoAnos:contratoAnos, valorX:valorX, traspasoX:traspasoX, oxidoSkill:oxidoSkill, oxidoTalento:oxidoTalento,
          reglasEdad:reglasEdad, franjaPorMedia:franjaPorMedia, salarioDe:salarioDe, rolDe:rolDe, claves:claves, simular:simular,
          nivelHoy:nivelHoy, tandaHoy:tandaHoy};
})();
