/* Agente con estrellas: mejora solo, busca por su cuenta y siempre pregunta antes de cerrar nada */
var OK=0,KO=0; function t(c,m){ if(c) OK++; else { KO++; console.log("✘ "+m); } }
function base(nivel,estilo){
  OVSEM=null; OVSEM_COLA=[]; NEG=null; S=nuevoEstado("SEV","DC","Manu",9,"D",ROLES.DC[0].id,24);
  S.contrato={salario:2000000,anos:3,clausula:12000000,prima:25000,franja:"media",exige:65}; S.fama=60; S.jornada=5; S.dinero=5e6;
  S.agente={n:"Pepe Sanz",estilo:estilo||"cercano",pct:pctAgente(estilo||"cercano",nivel),nivel:nivel,desde:0,anos:2,hechos:0}; S.agProp=[]; S.patroOferta=null;
  OVSEM_COLA=[]; return S;
}
/* ---- estrellas ---- */
t(agEstrellas(1)===1 && agEstrellas(8)===5 && NIVELES_AG.every(function(L,i){ return i===0 || agEstrellas(L.n)>agEstrellas(L.n-1); }),"8 niveles de agente = de 1 a 5 estrellas, siempre creciendo");
t(NIVELES_AG.some(function(L){ return agEstrellas(L.n)%1===0.5; }),"y con medias estrellas");
/* ---- poder creciente ---- */
var prev=null; [1,3,5,6,7,8].forEach(function(n){ base(n); var P=agPoder();
  if(prev) t(P.freq>=prev.freq && P.maxAb>=prev.maxAb && P.val>prev.val && P.sq>prev.sq && P.eloExtra>=prev.eloExtra,"nivel "+n+" busca, aprieta y llega más lejos que el anterior"); prev=P; });
base(1); var P1=agPoder(); base(8); var P5=agPoder();
t(P1.eloExtra===0 && P5.eloExtra>=100,"solo un 5★ llega a clubes por encima de tu nivel");
t(P5.maxAb>P1.maxAb && P5.freq>=2.0*P1.freq*0.9,"un 5★ busca más y mantiene más propuestas abiertas: "+P5.maxAb+" frente a "+P1.maxAb);
/* ---- proactividad: simular 600 semanas ---- */
function semanas(nivel,n){ var c=0, el=0, maxA=0, pat=0;
  for(var k=0;k<n;k++){ base(nivel); S.jornada=(k%36)+1; S.temporada=1+Math.floor(k/36);
    var _o=ovSemana; ovSemana=function(){}; agenteBusca(); ovSemana=_o;
    if(S.agProp.length) c++; if(S.agProp.some(function(p){return p.elite;})) el++; if(S.patroOferta) pat++; maxA=Math.max(maxA,S.agProp.length); }
  return {c:c/n, el:el/n, pat:pat/n, maxA:maxA}; }
var r1=semanas(1,1500), r5=semanas(8,1500);
console.log("proactividad por semana — 1★: "+Math.round(r1.c*100)+"% propuestas · 5★: "+Math.round(r5.c*100)+"% propuestas, "+Math.round(r5.el*100)+"% de grandes");
t(r5.c>r1.c*1.7,"un 5★ trae bastantes más propuestas que un 1★");
t(r1.el===0 && r5.el>0,"los clubes grandes solo los trae el 5★");
/* nunca cierra nada solo */
base(8); var sal0=S.contrato.salario; S.ofertaInv=null; for(var k=0;k<80;k++){ S.jornada=k%36+1; var _o2=ovSemana; ovSemana=function(){}; agenteBusca(); ovSemana=_o2; S.ofertaInv=null; S.patroOferta=null; }
t(S.contrato.salario===sal0 && S.contrato.anos===3 && S.equipo==="SEV","pase lo que pase, no cambia tu contrato ni tu club sin que lo apruebes");
/* ---- tope de abiertas y caducidad ---- */
base(1); for(var k=0;k<400;k++){ S.jornada=5; S.agenteOfJor=-1; var _o3=ovSemana; ovSemana=function(){}; agenteBusca(); ovSemana=_o3; S.patroOferta=null; }
t(S.agProp.length<=agPoder().maxAb,"nunca pasa del máximo de propuestas abiertas ("+S.agProp.length+" ≤ "+agPoder().maxAb+")");
base(3); S.agProp=[{id:"x",tipo:"ficha",sube:100000,q:.5,exp:0,hasta:S.jornada-1}]; var _o4=ovSemana; ovSemana=function(){}; S.agenteOfJor=S.jornada; agenteBusca(); ovSemana=_o4;
t(S.agProp.length===0 && /enfr/.test(S.avisoMercado||""),"lo que no contestas se enfría y avisa");
/* ---- acciones: aceptar, rechazar ---- */
base(5); S.agProp=[{id:"f1",tipo:"ficha",sube:150000,q:.8,exp:0,hasta:S.jornada+4},{id:"c1",tipo:"club",club:"BET",salario:2600000,prima:780000,anos:3,elite:false,q:.7,exp:0,hasta:S.jornada+4},{id:"c2",tipo:"club",club:"VAL",salario:2500000,prima:750000,anos:3,elite:false,q:.2,exp:0,hasta:S.jornada+4}];
var s0=S.contrato.salario; agAceptar("f1"); t(S.contrato.salario===s0+150000 && !agPropById("f1") && S.agente.hechos===1,"aceptar la subida la aplica y cuenta como trato");
agRechazar("c2"); t(!agPropById("c2") && S.contrato.salario===s0+150000,"rechazar la quita sin tocar nada");
var _a=alMenu; var llamado=false; alMenu=function(fn){ llamado=true; }; agAceptar("c1"); alMenu=_a;
t(S.ofertaInv && S.ofertaInv.club==="BET" && S.ofertaInv.salario===2600000 && llamado,"aceptar la oferta de otro club abre su mesa (no firma por ti)"); S.ofertaInv=null;
/* ---- exprimir ---- */
function pruebaExprimir(nivel,intentos){ var ok=0, N=1500;
  for(var k=0;k<N;k++){ base(nivel); S.agProp=[{id:"p",tipo:"club",club:"BET",salario:2600000,prima:780000,anos:3,elite:false,q:.5,exp:intentos,hasta:99}]; var v0=S.agProp[0].salario;
    agExprimir("p"); var p=agPropById("p"); if(p && p.salario>v0) ok++; } return ok/N; }
var e1=pruebaExprimir(1,0), e5=pruebaExprimir(8,0), e5b=pruebaExprimir(8,1);
console.log("exprimir: 1★ "+Math.round(e1*100)+"% · 5★ "+Math.round(e5*100)+"% · 5★ segundo intento "+Math.round(e5b*100)+"%");
t(e5>e1+0.3,"un 5★ exprime con mucho más éxito"); t(e5b<e5,"cada intento extra es más difícil");
base(8); S.agProp=[{id:"p",tipo:"ficha",sube:100000,q:.5,exp:2,hasta:99}]; var v=S.agProp[0].sube; agExprimir("p"); t(agPropById("p").sube===v,"solo se puede apretar dos veces");
var ret=0; for(var k=0;k<400;k++){ base(1); S.agProp=[{id:"p",tipo:"ficha",sube:100000,q:.5,exp:0,hasta:99}]; agExprimir("p"); if(!agPropById("p")) ret++; }
t(ret>0,"apretar de más puede costar la oferta ("+ret+"/400)");
/* ---- el consejo: más fiable cuanto más estrellas ---- */
function fiab(n){ var ok=0, N=600; for(var k=0;k<N;k++){ base(n); var p={id:"c"+k,tipo:"ficha",q:(k%2? .8:.1)}; var dice=/yo la cogería/.test(agConsejo(p)); if(dice===(p.q>=0.45)) ok++; } return ok/N; }
var f1=fiab(1), f5=fiab(8); t(f5>f1+0.2 && f5>0.85,"el consejo del 5★ acierta casi siempre ("+Math.round(f5*100)+"% frente a "+Math.round(f1*100)+"%)");
/* ---- crecimiento en verano: solo, sin cursos ---- */
function crece(hechos,n){ var c=0; for(var k=0;k<n;k++){ base(3); S.temporada=k+1; S.fama=80; S.equipo="BAR"; S.agente.hechos=hechos; var pct0=S.agente.pct; agenteCrece(); if(S.agente.nivel===4){ c++; t(S.agente.pct>=pct0,"al subir, cobra igual o más"); } } return c/n; }
var c0=crece(0,300), c6=crece(6,300); console.log("agente sube en verano: sin tratos "+Math.round(c0*100)+"% · con 6 tratos "+Math.round(c6*100)+"%");
t(c6>c0+0.2,"el agente que cierra tratos mejora mucho más rápido");
base(8); S.fama=95; agenteCrece(); t(S.agente.nivel===8,"un 5★ no pasa de 5★");
base(2); S.fama=5; S.equipo="SEV"; for(var k=0;k<60;k++){ S.temporada=k; S.agente.hechos=6; agenteCrece(); } t(S.agente.nivel<=Math.min(8,nivelCarrera()+2),"nunca se aleja más de dos niveles de tu carrera");
t(typeof eqCursoElige==="function" && !/curso/i.test((base(4),S.jornada=5,secAgente()).replace(/no se forma en cursos[^<]*/i,"")),"al agente no se le ofrece formación: mejora solo");
/* ---- fichar: candidatos variados ---- */
base(1); delete S.agente; S.fama=70; S.equipo="BAR"; var C=candidatosAgente(); t(C.length===3 && C[0].nivel>C[2].nivel,"tres candidatos de niveles distintos: "+C.map(function(x){return x.nivel;}).join(","));
/* ---- pantalla ---- */
base(7); S.agProp=[{id:"f1",tipo:"ficha",sube:90000,q:.7,exp:0,hasta:S.jornada+3},{id:"c1",tipo:"club",club:"RMA",salario:3300000,prima:990000,anos:3,elite:true,q:.8,exp:0,hasta:S.jornada+3}];
S.patroOferta={cat:"botas",catN:"Botas",marca:"Nike",tipo:"largo",tipoN:"larga duración",dur:34,fijo:2500,inc:{},pct:0,perk:null};
var h=secAgente(); t(/Lo que ha encontrado/.test(h) && /Aceptar/.test(h) && /Exprimir/.test(h) && /Rechazar/.test(h),"la bandeja muestra aceptar, exprimir y rechazar");
t(/grande/.test(h) && /Nike/.test(h) && /yo (la cogería|apretaría)/.test(h),"con el club grande, la marca y el consejo del agente");
t(!/NaN|undefined/.test(h),"sin NaN ni undefined");
var _o5=ovSemana, cfg=null; ovSemana=function(c){ cfg=c; }; avisoAgente("Pepe","algo"); ovSemana=_o5; t(cfg && /Verlo/.test(cfg.ops[0].l),"cuando encuentra algo, avisa y te deja verlo");
base(7); S.patroOferta={cat:"botas",catN:"Botas",marca:"Nike",tipo:"largo",tipoN:"larga duración",dur:34,fijo:2500,inc:{},pct:0,perk:null}; S.patros=S.patros||[]; patroInit(); var n0=S.patros.length; agPatroAceptar();
t(S.patros.length===n0+1 && !S.patroOferta,"aceptar la marca la firma"); S.patroOferta={cat:"moda",catN:"Moda",marca:"Zara",tipo:"corto",tipoN:"corto plazo",dur:8,fijo:900,inc:{},pct:0,perk:null}; agPatroRechazar(); t(!S.patroOferta,"y rechazarla la retira");
console.log("AGENTE: "+OK+" ok · "+KO+" fallos");
