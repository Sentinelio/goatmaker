renderHub=function(){PARTIDA_ABIERTA=true;};
var f=[], MODCAP=null; modal=function(c){ MODCAP=c; };
/* 1 · paciencia: cada portazo del club acerca el final; al agotarse, retira la oferta */
PICK={tanda:[{id:"SEV", contrato:{salario:5e5,anos:3,clausula:1e7,exige:60,franja:"media"}, mia:70, dif:0}], negIdx:0, notaPrueba:6.3, traspaso:false};
CONTRA={club:"SEV", salario:12e5, anos:6, clausula:25e5, extras:{prima:true,imagen:true}, pac:100};
var _r=rnd; rnd=function(){return 0.999;};   /* nunca aceptan, nunca ofenden por azar */
var pacs=[100], guard=0;
while(CONTRA.pac>0 && guard++<12){ presentarContra(); pacs.push(CONTRA.pac); if(MODCAP && /paciencia/i.test(MODCAP.x||"")) break; }
rnd=_r;
if(!(pacs[1]<100)) f.push("pac-no-desgasta");
if(!(CONTRA.pac<=0 || /paciencia/i.test((MODCAP&&MODCAP.x)||""))) f.push("pac-no-agota("+CONTRA.pac+")");
if(MODCAP && MODCAP.onOk && /retira|paciencia|deja/i.test(MODCAP.x||"")){ MODCAP.onOk(); if(PICK.tanda.length!==0) f.push("pac-no-retira"); }
CONTRA={club:"SEV",salario:5e5,anos:3,clausula:1e7,extras:{},pac:40};
var prBaja=probContra({contrato:{salario:5e5,anos:3,clausula:1e7},dif:0});
CONTRA.pac=100;
if(!(probContra({contrato:{salario:5e5,anos:3,clausula:1e7},dif:0})>prBaja)) f.push("pac-no-penaliza-prob");
/* 2 · fama por Elo: del Celta al Real Madrid la fama y los seguidores despegan */
S=nuevoEstado("CEL","DC","Manu",9,"D","clasico",22);
S.compis=crearCompis("CEL","Manu"); S.entrenador=crearEntrenador("CEL");
S.contrato={salario:6e5,anos:2,clausula:1e7,prima:1e5,franja:"media",exige:60,firmadoT:1};
S.fama=30; S.seguidores=200000; S.rumores=[]; S.traspasos=[];
S.ofertaInv={club:"RMA", salario:25e5, anos:4, prima:6e5};
var fA=S.fama, sgA=S.seguidores;
aceptarOferta();
if(!(S.fama>=fA+6)) f.push("fama-elo("+(S.fama-fA)+")");
if(!(S.seguidores>sgA)) f.push("seguidores-elo");
if(!(S.contrato.obj && S.contrato.obj.k==="g" && S.contrato.obj.n===10)) f.push("obj-dc");
/* 3 · objetivo cumplido paga; incumplido no */
S.yo.g=11; S.dinero=1e6; var dA=S.dinero; var r1=pagarObjetivo();
if(!(r1 && r1.ok && S.dinero===dA+S.contrato.obj.pago)) f.push("obj-paga(r1="+JSON.stringify(r1)+",din="+S.dinero+",dA="+dA+",pago="+(S.contrato.obj&&S.contrato.obj.pago)+")");
S.yo.g=3; var dB=S.dinero; var r2=pagarObjetivo();
if(!(r2 && !r2.ok && S.dinero===dB)) f.push("obj-no-regala");
/* 4 · portazo: con la puerta cerrada, ni transferPed genera ofertas */
MERCADO_ON=true; mercadoInit(); S.portazo=true; S.transferPed=true; S.ofertaInv=null; S.ofertaPend=false; S.movClub=false; S.jornada=18; S.agente=null;
var _r2=rnd; rnd=function(){return 0.001;};
mercadoSemanal();
if(S.ofertaInv || S.ofertaPend) f.push("portazo-ignorado");
/* 5 · el agente llama y mueve una marca */
S.portazo=false; S.agente={n:"Jorge Mendes", estilo:"tiburon", pct:0.05}; S.patroOferta=null; OVSEM=null; OVSEM_COLA=[]; M=null; S.fama=60;
var _tcm=tocaConversacionMister; tocaConversacionMister=function(){return false;};   /* aislamos el agente: la conversación del míster compite por el mismo turno semanal y este bloque prueba solo al agente */
mercadoSemanal();
tocaConversacionMister=_tcm;
rnd=_r2; MERCADO_ON=false;
if(!(OVSEM && /al teléfono/.test(OVSEM.t||""))) f.push("agente-mudo");
else { elegirSemana(0); if(!(S.patroOferta || S.azuzado)) f.push("agente-inutil"); }
OVSEM=null; OVSEM_COLA=[];
/* 6 · prensa viva: la jornada deja titular de otro partido */
S=nuevoEstado("SEV","DC","Manu",9,"D","clasico",22);
S.compis=crearCompis("SEV","Manu"); S.entrenador=crearEntrenador("SEV");
S.contrato={salario:4e5,anos:3,clausula:9e6,prima:2e4,franja:"media",exige:60,firmadoT:1};
var prA=(S.prensa||[]).length;
jugarJornada(0, function(s){return 0;});
var nueva=(S.prensa||[]).some(function(x){ return /-/.test(x.t) && (x.jor===S.jornada); });
if(!((S.prensa||[]).length>prA && nueva)) f.push("prensa-muda");
console.log(f.length? "✘ F74: "+f.join(" · ") : "✔ F74: la paciencia se gasta, penaliza el % y acaba en portazo con oferta retirada; fichar por el Madrid dispara fama y seguidores por Elo; el objetivo del contrato paga si se cumple y calla si no; el portazo silencia al mercado aunque pidas salir; el agente llama y mueve cosas; y la prensa titula el partidazo de cada jornada");
process.exit(f.length?1:0);
