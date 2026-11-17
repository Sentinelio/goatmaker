/* pestañas de Widgets integradas (la clave "wd" no comparte lista con el resto de páginas) */
var OK_TAB_WD=["Datos","Tamaños","Pantalla de inicio"];
/* WIDGETS: cada pestaña del juego como widget independiente. Se expone aquí para poder cambiarla por separado. */
var WSZ=["1x1","2x1","3x1","1x2","2x2","3x2","1x3","2x3","3x3"];
var WID=[
 {id:"W01", pg:"Inicio",  tab:"partido",  n:"Partido de hoy",   def:"3x3", txt:"Jornada, escudos, estado de banquillo o titular y botón Continuar."},
 {id:"W02", pg:"Jugador", tab:"ficha",    n:"Ficha",            def:"2x1", txt:"Nombre, posición y media."},
 {id:"W03", pg:"Jugador", tab:"fisico",   n:"Físico",           def:"1x1", txt:"Valor de forma física principal."},
 {id:"W04", pg:"Jugador", tab:"animo",    n:"Ánimo",            def:"1x1", txt:"Valor de ánimo."},
 {id:"W05", pg:"Jugador", tab:"caracter", n:"Carácter",         def:"1x2", txt:"Ejes de carácter resumidos."},
 {id:"W06", pg:"Jugador", tab:"fama",     n:"Fama",             def:"1x1", txt:"Fama y seguidores."},
 {id:"W07", pg:"Jugador", tab:"stats",    n:"Números",          def:"2x2", txt:"Goles, asistencias, media y tendencia de notas."},
 {id:"W08", pg:"Jugador", tab:"hist",     n:"Carrera",          def:"3x1", txt:"Temporadas y totales de carrera."},
 {id:"W09", pg:"Equipo",  tab:"tabla",    n:"Clasificación",    def:"2x2", txt:"Clasificación con tu equipo resaltado."},
 {id:"W10", pg:"Equipo",  tab:"plantilla",n:"Vestuario",        def:"2x2", txt:"Compañeros con su afinidad."},
 {id:"W11", pg:"Equipo",  tab:"mister",   n:"El míster",        def:"2x1", txt:"Confianza y último mensaje."},
 {id:"W12", pg:"Equipo",  tab:"entreno",  n:"Entreno",          def:"2x1", txt:"Sesiones usadas de la semana."},
 {id:"W13", pg:"Equipo",  tab:"jornada",  n:"Resultados",       def:"1x3", txt:"Partidos de la temporada, el más reciente arriba."},
 {id:"W14", pg:"Mercado", tab:"hilos",    n:"Mover los hilos",  def:"1x1", txt:"Hilos disponibles."},
 {id:"W15", pg:"Mercado", tab:"agente",   n:"Agente",           def:"1x1", txt:"Estado del agente."},
 {id:"W16", pg:"Mercado", tab:"patros",   n:"Patrocinios",      def:"1x1", txt:"Patrocinios activos."},
 {id:"W17", pg:"Mercado", tab:"rumores",  n:"Rumores",          def:"1x1", txt:"Último rumor."},
 {id:"W18", pg:"Mercado", tab:"fichajes", n:"Fichajes",         def:"1x1", txt:"Ofertas y fichajes."},
 {id:"W19", pg:"Mercado", tab:"prensa",   n:"Prensa",           def:"1x2", txt:"Último titular de prensa."},
 {id:"W20", pg:"Cuentas", tab:"dinero",   n:"Dinero",           def:"2x1", txt:"Saldo y últimos movimientos."},
 {id:"W21", pg:"Cuentas", tab:"tienda",   n:"Tienda",           def:"2x1", txt:"Artículos destacados."}
];
function wById(id){ return WID.filter(function(w){return w.id===id})[0]; }
/* galería: contenido de muestra por widget y cada tamaño a escala real (celdas de 76 px, hueco de 10 px) */
var MUESTRA={
 W01:{l:"Hoy · 20:45",v:"Espanyol – Zaragoza",s:"En el banquillo",r:[["J26","4-4"],["J25","1-0"]]},
 W02:{l:"Ficha",v:"J. de ejemplo",s:"Lateral · 68",f:0.68},
 W03:{l:"Físico",v:"72",f:0.72},
 W04:{l:"Ánimo",v:"55",f:0.55},
 W05:{l:"Carácter",r:[["Ambición","70"],["Disciplina","45"],["Humor","60"]]},
 W06:{l:"Fama",v:"38",s:"1,2 k seguidores"},
 W07:{l:"Números",v:"6,8",s:"media",r:[["Goles","7"],["Asist.","3"],["Media","6,8"]]},
 W08:{l:"Carrera",r:[["2025-26","12 G"],["2024-25","4 G"]]},
 W09:{l:"Clasificación",r:[["1. Equipo A","30"],["2. Equipo B","28"],["7. Tu equipo","24"]]},
 W10:{l:"Vestuario",r:[["Compañero 1","+2"],["Compañero 2","0"]]},
 W11:{l:"El míster",v:"Confianza 60",s:"«Buen trabajo»",f:0.6},
 W12:{l:"Entreno",v:"3 de 5",f:0.6},
 W13:{l:"Resultados",r:[["J26","4-4"],["J25","1-0"],["J24","2-1"]]},
 W14:{l:"Mover los hilos",v:"2 hilos",s:"disponibles"},
 W15:{l:"Agente",v:"Activo",s:"Nivel 2"},
 W16:{l:"Patrocinios",v:"1",s:"activo"},
 W17:{l:"Rumores",v:"2 clubes preguntan"},
 W18:{l:"Fichajes",v:"1 oferta",s:"Club B"},
 W19:{l:"Prensa",v:"«Titular de ejemplo»"},
 W20:{l:"Dinero",v:"12.400 €",r:[["Fichaje","-500 €"],["Patrocinio","+1.200 €"]]},
 W21:{l:"Tienda",v:"3 destacados",s:"artículos"}
};
function sampleBody(W,z){
  var m=MUESTRA[W.id]||{}, c=z.split("x"), cw=+c[0], ch=+c[1], n=cw*ch;
  var lbl='<div style="font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#8891AA">'+esc(m.l||W.n)+'</div>';
  var big=function(t,px){ return '<div style="font-size:'+px+'px;font-weight:700;color:#FFC24B;line-height:1.15">'+esc(t)+'</div>'; };
  var small=function(t){ return t? '<div style="font-size:11px;color:#8891AA;line-height:1.35;margin-top:2px">'+esc(t)+'</div>' : ''; };
  var bar=function(f){ return '<div style="height:8px;border-radius:4px;background:#2A3149;overflow:hidden"><i style="display:block;height:100%;width:'+Math.round(f*100)+'%;background:#FFC24B"></i></div>'; };
  var rows=function(k){ return (m.r||[]).slice(0,k).map(function(p){ return '<div style="display:flex;justify-content:space-between;gap:8px;font-size:11px;color:#E8EAF2;padding:4px 0;border-top:1px solid #232A40"><span>'+esc(p[0])+'</span><b>'+esc(p[1])+'</b></div>'; }).join(""); };
  if(z==="1x1") return lbl+'<div style="margin-top:auto">'+big(m.v||"—",22)+'</div>';
  if(z==="2x1") return lbl+'<div style="margin-top:auto">'+(m.f!=null? bar(m.f) : big(m.v||"—",16))+'</div>';
  if(z==="3x1") return '<div style="display:flex;justify-content:space-between;align-items:center;height:100%;gap:12px"><div>'+lbl+'</div><div style="text-align:right">'+big(m.v||"—",16)+small(m.s)+'</div></div>';
  if(z==="1x2") return lbl+'<div style="margin-top:auto">'+big(m.v||"—",16)+small(m.s)+'</div>';
  if(z==="1x3") return lbl+'<div style="margin-top:auto">'+(m.r? rows(3) : big(m.v||"—",16)+small(m.s))+'</div>';
  if(z==="2x2") return lbl+(m.r? '<div style="margin-top:auto">'+rows(3)+'</div>' : '<div style="margin-top:auto">'+big(m.v||"—",22)+small(m.s)+'</div>');
  if(z==="3x2") return '<div style="display:flex;flex-direction:column;height:100%">'+lbl+'<div style="display:flex;justify-content:space-between;align-items:flex-end;gap:12px;margin-top:auto"><div>'+big(m.v||"—",18)+small(m.s)+'</div>'+(m.f!=null?'<div style="width:40%">'+bar(m.f)+'</div>':'')+'</div><div style="margin-top:8px">'+rows(2)+'</div></div>';
  if(z==="2x3") return lbl+'<div style="margin-top:6px">'+big(m.v||"—",22)+small(m.s)+'</div>'+(m.f!=null?'<div style="margin-top:10px">'+bar(m.f)+'</div>':'')+'<div style="margin-top:auto">'+rows(3)+'</div>';
  return lbl+'<div style="margin-top:6px">'+big(m.v||"—",24)+small(m.s)+'</div>'+(m.f!=null? '<div style="margin-top:10px">'+bar(m.f)+'</div>' : '')+'<div style="margin-top:8px">'+rows(4)+'</div>';
}
/* pantalla de inicio: móvil con rejilla de 3 columnas x 4 filas que ocupa toda la pantalla (sin scroll) */
var PH_C=3, PH_R=4;
function inicioLayout(){
  var out={}, occ={};
  function sz(W){ var z=val("wd."+W.id+".def")||W.def; return {w:+z.split("x")[0], h:+z.split("x")[1]}; }
  function fits(c,r,w,h){ if(c+w-1>PH_C || r+h-1>PH_R) return false; for(var y=r;y<r+h;y++) for(var x=c;x<c+w;x++) if(occ[x+","+y]) return false; return true; }
  function mark(c,r,w,h){ for(var y=r;y<r+h;y++) for(var x=c;x<c+w;x++) occ[x+","+y]=1; }
  var ws=WID.filter(function(W){ return !!val("wd."+W.id+".on"); });
  ws.forEach(function(W){ var s=sz(W), c=val("wd."+W.id+".c"), r=val("wd."+W.id+".r"); if(c && r && fits(c,r,s.w,s.h)){ mark(c,r,s.w,s.h); out[W.id]={c:c,r:r,w:s.w,h:s.h}; } });
  return out;
}
/* ¿cabe el widget en (c,r) con el tamaño z, sin tapar a los demás? */
function inicioFits(id,c,r,z){
  var w=+z.split("x")[0], h=+z.split("x")[1];
  if(c<1 || r<1 || c+w-1>PH_C || r+h-1>PH_R) return false;
  var others=inicioLayout(); delete others[id];
  return !Object.keys(others).some(function(k){ var p=others[k]; return c<p.c+p.w && p.c<c+w && r<p.r+p.h && p.r<r+h; });
}
function inicioNearest(id,c,r,z){
  if(!val('wd.'+id+'.z'+z)) return null;
  var w=+z.split("x")[0], h=+z.split("x")[1], best=null;
  for(var cc=1; cc<=PH_C-w+1; cc++) for(var rr=1; rr<=PH_R-h+1; rr++){
    if(!inicioFits(id,cc,rr,z)) continue;
    var d=Math.abs(cc-c)+Math.abs(rr-r);
    if(!best || d<best.d) best={c:cc,r:rr,d:d};
  }
  return best;
}
function inicioClear(){
  var g=document.getElementById('wdghost'); if(g) g.remove();
  document.querySelectorAll('[id^="wdi-"]').forEach(function(e){ e.style.outline=''; });
}
function inicioOverlaps(id,c,r,w,h){
  var L=inicioLayout(), out=[];
  Object.keys(L).forEach(function(k){ if(k===id) return; var p=L[k]; if(c<p.c+p.w && p.c<c+w && r<p.r+p.h && p.r<r+h) out.push(k); });
  return out;
}
function inicioReason(id,c,r,z){
  var w=+z.split('x')[0], h=+z.split('x')[1];
  if(!val('wd.'+id+'.z'+z)) return 'El tamaño '+z+' está apagado en Tamaños';
  if(c<1||r<1||c+w-1>PH_C||r+h-1>PH_R) return 'Se sale del móvil';
  var o=inicioOverlaps(id,c,r,w,h);
  if(o.length) return 'Lo ocupa '+o.map(function(k){ return wById(k).n; }).join(' y ');
  return null;
}
function inicioGhost(c,r,w,h,ok,msg){
  var grid=document.getElementById('wdgrid'); if(!grid) return;
  var g=document.getElementById('wdghost');
  if(!g){ g=document.createElement('div'); g.id='wdghost'; grid.appendChild(g); }
  g.style.gridColumn=c+' / span '+w; g.style.gridRow=r+' / span '+h;
  g.style.position='relative'; g.style.zIndex='3'; g.style.pointerEvents='none'; g.style.boxSizing='border-box';
  g.style.display='flex'; g.style.alignItems='center'; g.style.justifyContent='center'; g.style.textAlign='center';
  g.style.padding='8px'; g.style.borderRadius='14px'; g.style.fontSize='11px'; g.style.lineHeight='1.3';
  g.style.border='2px dashed '+(ok?'#3DDC97':'#FF5470');
  g.style.background=ok?'rgba(61,220,151,.12)':'rgba(255,84,112,.14)';
  g.style.color=ok?'#3DDC97':'#FF8DA0';
  g.textContent=msg;
}
function inicioHighlight(id,c,r,w,h){
  inicioOverlaps(id,c,r,w,h).forEach(function(k){ var e=document.getElementById('wdi-'+k); if(e) e.style.outline='2px solid #FF5470'; });
}
function inicioShow(id,c,r,z){
  var w=+z.split('x')[0], h=+z.split('x')[1];
  inicioClear();
  var reason=inicioReason(id,c,r,z);
  if(!reason){ inicioGhost(c,r,w,h,true,'Cabe aquí'); return; }
  inicioHighlight(id,c,r,w,h);
  inicioGhost(Math.max(1,Math.min(c,PH_C-w+1)),Math.max(1,Math.min(r,PH_R-h+1)),w,h,false,reason);
}
function inicioMoveFeedback(){
  var id=window._WD; if(!id||window._WRS) return;
  var z=val('wd.'+id+'.def')||wById(id).def, w=+z.split('x')[0], h=+z.split('x')[1];
  var c=Math.max(1,Math.min(window._WC||1,PH_C-w+1)), r=Math.max(1,Math.min(window._WR||1,PH_R-h+1));
  var reason=inicioReason(id,c,r,z);
  if(!reason){ inicioClear(); inicioGhost(c,r,w,h,true,'Cabe aquí'); return; }
  var sp=inicioNearest(id,c,r,z);
  if(sp){ inicioClear(); inicioHighlight(id,c,r,w,h); inicioGhost(sp.c,sp.r,w,h,true,reason+' · se colocará en el hueco libre más cercano'); return; }
  inicioShow(id,c,r,z);
}
function inicioPlace(id,c,r,z){ set("wd."+id+".c",c); set("wd."+id+".r",r); set("wd."+id+".def",z); set("wd."+id+".on",true); }
function inicioSetSize(id,z){
  var p=inicioLayout()[id]; if(!p) return;
  if(!val("wd."+id+".z"+z)){ toast("Ese tamaño está apagado en Tamaños"); return; }
  if(!inicioFits(id,p.c,p.r,z)){ toast("Ese tamaño no cabe aquí"); return; }
  set("wd."+id+".def",z);
}
function inicioView(){
  WID.forEach(function(W){ reg("wd."+W.id+".c",null,W.id+" · columna en el inicio"); reg("wd."+W.id+".r",null,W.id+" · fila en el inicio"); });
  var L=inicioLayout(), sel=ST.sel.wdp||null, items="";
  Object.keys(L).forEach(function(id){ var p=L[id], W=wById(id), isS=id===sel;
    items+='<div id="wdi-'+id+'" draggable="true" ondragstart="window._WD=\''+id+'\';document.getElementById(\'wdtrash\').style.display=\'flex\'" ondragend="document.getElementById(\'wdtrash\').style.display=\'none\';inicioClear()" onclick="'+on(function(){ ST.sel.wdp=id; go(); })+'" style="grid-column:'+p.c+' / span '+p.w+';grid-row:'+p.r+' / span '+p.h+';position:relative;box-sizing:border-box;border-radius:14px;background:#161B2C;border:'+(isS?'2px solid #FFC24B':'1px solid #3A4262')+';padding:9px;overflow:hidden;display:flex;flex-direction:column;cursor:grab">'+'<div class="wdc" style="height:100%;width:100%">'+sampleBody(W,val("wd."+id+".def")||W.def)+'</div>'+(isS?'<span onmousedown="event.preventDefault();event.stopPropagation();window._WRS=\''+id+'\'" onpointerdown="this.setPointerCapture(event.pointerId)" title="Arrastra para cambiar el tamaño" style="position:absolute;right:4px;bottom:4px;width:16px;height:16px;border-radius:5px;background:#FFC24B;cursor:nwse-resize;z-index:2"></span>':'')+'</div>';
  });
  var dropTrash=on(function(){ var id=window._WD; if(id){ set("wd."+id+".on",false); set("wd."+id+".c",null); set("wd."+id+".r",null); ST.sel.wdp=null; } });
  var dropPhone=on(function(){ inicioClear();
    if(window._WRS){ var rid=window._WRS; window._WRS=null; var pr=inicioLayout()[rid]; if(!pr) return; var tw=Math.max(1,window._WC-pr.c+1), th=Math.max(1,window._WR-pr.r+1), best=null; WSZ.forEach(function(z){ var zw=+z.split("x")[0], zh=+z.split("x")[1]; if(!val("wd."+rid+".z"+z) || zw>tw || zh>th || !inicioFits(rid,pr.c,pr.r,z)) return; if(!best || zw*zh>best.a) best={z:z,a:zw*zh}; }); if(best) set("wd."+rid+".def",best.z); else toast("Ningún tamaño habilitado cabe ahí"); return; }
    var id=window._WD, c=window._WC, r=window._WR; if(!id||!c||!r) return;
    var z=val("wd."+id+".def")||wById(id).def;
    var sp=inicioNearest(id,c,r,z);
    if(!sp){ toast("No hay hueco libre para ese tamaño"); return; }
    inicioPlace(id,sp.c,sp.r,z); ST.sel.wdp=id;
  });
  var phone='<div style="flex:none"><div style="width:372px;border-radius:38px;background:#07090F;border:1px solid #2A3149;padding:6px;box-sizing:border-box">'+
    '<div style="position:relative;width:360px;height:640px;border-radius:32px;background:#0E1220;overflow:hidden;box-sizing:border-box">'+
    '<div style="position:absolute;top:10px;left:10px;right:10px;height:56px;border-radius:16px;background:#161B2C;border:1px solid #232A40;display:flex;align-items:center;gap:10px;padding:0 12px;box-sizing:border-box"><span style="width:34px;height:34px;border-radius:50%;background:#2A3149;flex:none"></span><div style="min-width:0"><div style="font-size:12px;color:#E8EAF2;white-space:nowrap">Jugador de ejemplo</div><div style="font-size:10px;color:#8891AA;white-space:nowrap">Lateral · Equipo</div></div><span style="margin-left:auto;color:#8891AA;font-size:14px">🔔 ⚙</span></div>'+
    '<div style="position:absolute;top:76px;left:12px;right:12px;bottom:84px;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(4,1fr);gap:8px;pointer-events:none">'+Array(13).join('<div style="background:#121A2D;border:1px solid #1E2740;border-radius:12px"></div>')+'</div>'+'<div style="position:absolute;top:76px;left:12px;right:12px;bottom:84px;pointer-events:none">'+[0,1,2,3].map(function(k){ var x=k===0?'0px':k===3?'100%':'calc('+k+'*(100% - 16px)/3 + '+((k-1)*8+4)+'px)'; return [0,1,2,3,4].map(function(j){ var y=j===0?'0px':j===4?'100%':'calc('+j+'*(100% - 24px)/4 + '+((j-1)*8+4)+'px)'; return '<span style="position:absolute;left:'+x+';top:'+y+';transform:translate(-50%,-50%);color:#4A5578;font-size:16px;line-height:1">+</span>'; }).join(''); }).join('')+'</div>'+
    '<div id="wdgrid" ondragover="event.preventDefault();event.dataTransfer.dropEffect=\'move\';var b=this.getBoundingClientRect();window._WC=Math.min(PH_C,Math.max(1,Math.floor((event.clientX-b.left)/114.67)+1));window._WR=Math.min(PH_R,Math.max(1,Math.floor((event.clientY-b.top)/122)+1));inicioMoveFeedback()" ondrop="event.preventDefault();var b=this.getBoundingClientRect();window._WC=Math.min(PH_C,Math.max(1,Math.floor((event.clientX-b.left)/114.67)+1));window._WR=Math.min(PH_R,Math.max(1,Math.floor((event.clientY-b.top)/122)+1));'+dropPhone+'" style="position:absolute;top:76px;left:12px;right:12px;bottom:84px;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(4,1fr);gap:8px" onpointermove="if(window._WRS){var b=this.getBoundingClientRect();window._WC=Math.min(PH_C,Math.max(1,Math.floor((event.clientX-b.left)/114.67)+1));window._WR=Math.min(PH_R,Math.max(1,Math.floor((event.clientY-b.top)/122)+1));inicioPreview();}" onpointerup="if(window._WRS){'+dropPhone+'}">'+items+'</div>'+
    '<div style="position:absolute;bottom:10px;left:10px;right:10px;height:60px;border-radius:20px;background:#161B2C;border:1px solid #232A40;display:flex;justify-content:space-around;align-items:center;box-sizing:border-box">'+["Inicio","Equipo","Jugador","Mercado","Cuentas"].map(function(n,i){ return '<span style="font-size:10px;color:'+(i===0?"#FFC24B":"#8891AA")+'">'+n+'</span>'; }).join("")+'</div>'+'<div id="wdtrash" ondragover="event.preventDefault()" ondrop="event.preventDefault();'+dropTrash+'" style="display:none;position:absolute;bottom:14px;left:50%;transform:translateX(-50%);width:56px;height:56px;border-radius:50%;background:#3A1A22;border:1px solid #FF5470;align-items:center;justify-content:center;font-size:24px;z-index:5">🗑</div>'+'</div></div>'+'</div>';
  return phone;
}
/* vista previa del reescalado: mientras se arrastra la esquina, el widget cambia de tamaño en el móvil */
function inicioBest(rid,pr,tw,th){
  var best=null;
  WSZ.forEach(function(z){
    var zw=+z.split("x")[0], zh=+z.split("x")[1];
    if(!val("wd."+rid+".z"+z) || zw>tw || zh>th || !inicioFits(rid,pr.c,pr.r,z)) return;
    if(!best || zw*zh>best.a) best={z:z,a:zw*zh,w:zw,h:zh};
  });
  return best;
}
function inicioPreview(){
  var rid=window._WRS; if(!rid) return;
  var pr=inicioLayout()[rid]; if(!pr) return;
  var b=inicioBest(rid,pr,Math.max(1,window._WC-pr.c+1),Math.max(1,window._WR-pr.r+1));
  var tw0=Math.max(1,window._WC-pr.c+1), th0=Math.max(1,window._WR-pr.r+1); inicioShow(rid,pr.c,pr.r,tw0+'x'+th0);
  var el=document.getElementById("wdi-"+rid); if(!el||!b) return;
  el.style.gridColumn=pr.c+" / span "+b.w; el.style.gridRow=pr.r+" / span "+b.h;
  var wc=el.querySelector(".wdc"); if(wc) wc.innerHTML=sampleBody(wById(rid),b.z);
}
function widgetList(){
  /* los valores del inicio se registran aquí, no solo al abrir Datos o Tamaños, para que el móvil funcione desde el primer momento */
  WID.forEach(function(W){
    reg("wd."+W.id+".on",false,W.id+" · aparece en el inicio");
    reg("wd."+W.id+".def",W.def,W.id+" · tamaño por defecto");
    reg("wd."+W.id+".c",null,W.id+" · columna en el inicio");
    reg("wd."+W.id+".r",null,W.id+" · fila en el inicio");
    WSZ.forEach(function(z){ reg("wd."+W.id+".z"+z,true,W.id+" · "+z+" permitido"); });
  });
  var L=inicioLayout(), sel=ST.sel.wd||WID[0].id, rows="";
  ["Inicio","Jugador","Equipo","Mercado","Cuentas"].forEach(function(g){
    rows+='<div class="gh">'+g+'</div>';
    WID.filter(function(x){ return x.pg===g; }).forEach(function(x){
      var isOn=!!val("wd."+x.id+".on");
      var st= L[x.id] ? '<span class="tag ok">en el móvil</span>' : (isOn ? '<span class="tag">sin hueco</span>' : '<span class="tag">fuera</span>');
      rows+='<div class="it'+(x.id===sel?' on':'')+'" draggable="true" ondragstart="window._WD=\''+x.id+'\'" ondragend="inicioClear()" onclick="'+on(function(){ ST.sel.wd=x.id; go(); })+'" style="display:flex;align-items:center;gap:8px;'+(isOn?'':'opacity:.6')+'"><span>'+x.id+' · '+esc(x.n)+'</span><span style="margin-left:auto">'+st+'</span></div>';
    });
  });
  var dropList=on(function(){ var id=window._WD; if(id){ set("wd."+id+".on",false); if(ST.sel.wdp===id) ST.sel.wdp=null; } });
  return '<div class="card list" ondragover="event.preventDefault()" ondrop="event.preventDefault();'+dropList+'" style="padding:0;overflow:hidden">'+rows+'</div>';
}
/* piezas de tetris con los tamaños del widget */
function tetris(W,defS){
  var pre="wd."+W.id;
  var pieces=WSZ.map(function(z){
    var w=+z.split("x")[0], h=+z.split("x")[1], isOn=!!val(pre+".z"+z), isD=z===defS;
    return '<div style="flex:'+w+' 1 0;min-width:0;'+(isOn?"":"opacity:.4")+'">'+
      '<div style="font-family:monospace;font-size:12px;color:#8891AA;margin-bottom:4px">'+z+(isD?' · defecto':'')+(isOn?'':' · apagado')+'</div>'+
      '<div style="width:100%;aspect-ratio:'+w+' / '+h+';box-sizing:border-box;border-radius:8px;background:'+(isD?'#2A2412':'#161B2C')+';border:1px solid '+(isD?'#FFC24B':'#3A4262')+'"></div></div>';
  }).join("");
  return '<div style="display:flex;gap:12px;align-items:flex-start;width:100%;padding:4px">'+pieces+'</div>';
}
V.widgets=function(){
  var s=ST.sel.wd||WID[0].id, W=wById(s)||WID[0], pre="wd."+W.id, L=W.id+" "+W.n;
  var t=tabs("wd",["Datos","Tamaños","Pantalla de inicio"]), tb=ST.tab.wd, b="";
  var ix=WID.indexOf(W);
  if(tb==="Datos") b=card(L,
      fld(pre+".n","Nombre",W.n,{full:L+" · nombre",d:"Solo para el panel."})+
      '<div class="diff"><span class="p mut">Página</span><b>'+esc(W.pg)+'</b></div>'+
      '<div class="diff"><span class="p mut">Pestaña de origen</span><span class="mono small">'+esc(W.tab)+'</span></div>'+
      fld(pre+".def","Tamaño por defecto",W.def,{type:"sel",opts:WSZ,full:L+" · tamaño por defecto"})+
      fld(pre+".on","Aparece en el inicio",false,{type:"tog",full:L+" · aparece en el inicio",si:"Sí",no:"No"})+
      fld(pre+".txt","Qué muestra en tamaño pequeño",W.txt,{type:"area",rows:3,full:L+" · contenido",d:"Cada widget muestra la misma pestaña que en el juego, en la versión que cabe en su tamaño."}));
  else if(tb==="Tamaños"){
    var filas=WSZ.map(function(z){
        return fld(pre+".z"+z, z+(z==="1x1"?" · una celda":z==="3x3"?" · tablero completo":""), true, {type:"tog", full:L+" · "+z, si:"Sí", no:"No"});
      }).join("");
    var defS=val(pre+".def")||W.def, prev=WSZ.map(function(z){
      var on=!!val(pre+".z"+z);
      return '<span class="tag '+(z===defS?"gold":on?"ok":"")+'" style="margin:0 4px 4px 0;'+(on?"":"opacity:.4;text-decoration:line-through")+'">'+z+(z===defS?" · defecto":"")+'</span>';
    }).join("");
    var defOff=!val(pre+".z"+defS);
    b=card("Tamaños permitidos", filas, '<span class="tag">'+WSZ.length+' tamaños</span>')
      + card("Tamaños como piezas · "+L, tetris(W,defS))
      + card("Vista rápida", '<div>'+prev+'</div>'+(defOff? '<p class="note small" style="margin:8px 0 0;color:var(--bad)">El tamaño por defecto está apagado: enciéndelo o cambia el defecto.</p>' : '<p class="note small" style="margin:8px 0 0">Así se ofrecen los tamaños al jugador en el inicio.</p>'));
  }
  return hd("Widgets","Cada pestaña del juego como widget independiente, para cambiar cada uno por separado.", "")+
    '<div class="split">'+widgetList()+'<div>'+t+(tb==="Pantalla de inicio"? inicioView() : b)+'</div></div>';
};
