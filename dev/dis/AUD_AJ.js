/* ===== AUDITORÍA DE AJUSTES: cada pestaña × cada contexto × taller apagado/encendido × cada botón =====
   Uso:  cd <carpeta de trabajo>; TAIL=40 bash /mnt/user-data/outputs/dis/correr.sh AUD_AJ.js 1
   Qué exige:  (1) la pestaña se pinta sin lanzar y no deja el cuerpo vacío;
               (2) cada botón visible se puede pulsar (su onclick se ejecuta en un estado limpio) sin lanzar;
               (3) con el taller APAGADO la pestaña Cheats solo ofrece el interruptor, nada más. */
renderHub=function(){};
var F=[], N_CLICKS=0, N_RENDER=0;
function nuevoS(){
  S=nuevoEstado("SEV","DC","Manu",9,"D","clasico",22);
  S.compis=crearCompis("SEV","Manu"); S.entrenador=crearEntrenador("SEV");
  S.contrato={salario:500000,anos:3,clausula:12000000,prima:25000,franja:"media",exige:65};
}
var MODO=false;   /* taller apagado / encendido: se audita todo en los dos estados */
function taller(){ CHEATS_ON=MODO; aplicarCheats(); }
var CTX=[
  {n:"título sin partida",  pre:function(){ taller(); S=null; M=null; PICK=null; PARTIDA_ABIERTA=false; }},
  {n:"título con partida",  pre:function(){ taller(); nuevoS(); M=null; PICK=null; PARTIDA_ABIERTA=false; }},
  {n:"en juego",            pre:function(){ taller(); nuevoS(); M=null; PICK=null; PARTIDA_ABIERTA=true; }},
  {n:"prueba de ojeadores", pre:function(){ taller(); S=null; M=null; PICK={pos:"EXT",rol:"invertido",pierna:"A",lado:null,nombre:"Manu",dorsal:9,edad:20,esperas:0,attrBonus:0,ojeadores:[],tanda:null}; PARTIDA_ABIERTA=false; }}
];
var TABS=SUBS.ajustes.map(function(t){return t[0];});
function handlers(h){
  var out=[], re=/onclick="([^"]*)"/g, m;
  while((m=re.exec(h))) out.push(m[1].replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,"&"));
  return out;
}
[false,true].forEach(function(modo){
  MODO=modo;
  CTX.forEach(function(c){
    TABS.forEach(function(k){
      var et="["+(modo?"taller ON":"taller OFF")+" · "+c.n+"]";
      /* 1 · la pestaña se pinta y no deja el cuerpo vacío */
      c.pre(); SUB.ajustes=k;
      var body;
      try{ irSec("ajustes"); body=$("sec-body").innerHTML; N_RENDER++; }
      catch(e){ F.push(et+" pestaña «"+k+"»: IRSEC LANZA → "+e.message); return; }
      if(!body || body.length<80) F.push(et+" pestaña «"+k+"»: cuerpo vacío ("+(body||"").length+" car.)");
      var hs=handlers(body);
      /* 3 · apagado: la pestaña Cheats no puede ofrecer ningún truco, solo el interruptor */
      if(k==="cheats" && !modo){
        var raros=hs.filter(function(h){ return /^ch[A-Z]/.test(h) || /genOfertaPatro/.test(h) || /^verCatCheat/.test(h); });
        if(raros.length) F.push(et+" Cheats con el taller APAGADO ofrece trucos: "+raros.slice(0,3).join(" | "));
        if(hs.indexOf("toggleCheats()")<0) F.push(et+" Cheats con el taller APAGADO no ofrece el interruptor");
      }
      /* 2 · cada botón de la pestaña responde */
      hs.forEach(function(code){
        c.pre(); SUB.ajustes=k;
        try{ irSec("ajustes"); }catch(e){ return; }
        N_CLICKS++;
        try{ eval(code); }
        catch(e){ F.push(et+" «"+k+"» botón «"+code.slice(0,50)+"» LANZA → "+e.message); }
      });
    });
  });
});
if(!F.length) console.log("✔ AUD_AJ limpio: "+N_RENDER+" pestañas pintadas (taller apagado y encendido), "+N_CLICKS+" botones pulsados, 0 excepciones");
else { console.log("✘ AUD_AJ: "+F.length+" fallo(s)"); F.forEach(function(x){ console.log("  · "+x); }); }
