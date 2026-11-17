/* pestañas de Widgets integradas (la clave "wd" no comparte lista con el resto de páginas) */
var OK_TAB_WD=["Tamaños","Pantalla de inicio"];
OK_BTN.push("Guardar widgets");
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
/* fondos por tamaño: capa de imagen detrás del contenido, con encuadre y velo */
var BG_POS=["centro","arriba","abajo","izquierda","derecha"];
var BG_CSS={"centro":"center","arriba":"center top","abajo":"center bottom","izquierda":"left center","derecha":"right center"};
function wdBg(id,z){ return val("wd."+id+".bg."+z) || null; }
/* encuadre libre: zoom (100-400 %) y paneo (-100..100) de la imagen de cada tamaño */
function frOf(id,z){
  var s=val("wd."+id+".bgz."+z), x=val("wd."+id+".bgx."+z), y=val("wd."+id+".bgy."+z);
  return { s:(s==null? 100 : Number(s)), u:(x==null? 0 : Number(x)), v:(y==null? 0 : Number(y)) };
}
function frStyle(f){
  var k=f.s/100, tx=f.u*(k-1)/2, ty=f.v*(k-1)/2;
  return 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain;pointer-events:none;user-select:none;transform:translate('+tx+'%,'+ty+'%) scale('+k+');transform-origin:50% 50%';
}
function bgLayer(id,z){
  var img=wdBg(id,z); if(!img) return "";
  var ov=(Number(val("wd."+id+".bgov."+z))||0)/100;
  return '<div style="position:absolute;inset:-9px;border-radius:14px;overflow:hidden">'+
    '<img src="'+img+'" alt="" style="'+frStyle(frOf(id,z))+'">'+
    '<div style="position:absolute;inset:0;background:rgba(8,10,20,'+ov+')"></div></div>';
}
/* «Partido de hoy» tal como lo ve el jugador en el juego (tarjeta siguiente partido), con lo que cabe en cada tamaño.
   Datos de muestra; en el juego salen de la jornada, el rival y la convocatoria reales. */
var PARTIDO_MUESTRA={jor:"Jornada 26 de 38 · Local", liga:"LaLiga", casa:"Espanyol", fuera:"Zaragoza", rol:"titular", convTxt:"Titular", convDet:"Empiezas en el once", frase:"El partido más esperado de la jornada.", btn:"⚽ Saltar al campo", btnCorto:"⚽ Jugar"};
var PARTIDO_ROL={titular:"#4ADE80", suplente:"#FFC24B", fuera:"#F87171", lesion:"#F87171", sancion:"#F87171"};
function partidoBody(z){
  var P=PARTIDO_MUESTRA, col=PARTIDO_ROL[P.rol]||"#FFC24B";
  /* escudo provisional: forma neutra con las siglas del equipo (no se dibujan escudos reales) */
  var sig=function(n){ return n.slice(0,3).toUpperCase(); };
  var escudo=function(n,w){ return '<div style="width:'+w+'px;height:'+Math.round(w*1.15)+'px;clip-path:polygon(0 0,100% 0,100% 60%,50% 100%,0 60%);background:linear-gradient(160deg,#3A4262,#1C2236);color:#E8EAF2;font-weight:700;font-size:'+Math.max(8,Math.round(w*.36))+'px;display:flex;align-items:center;justify-content:center;flex:none">'+esc(sig(n))+'</div>'; };
  var tag=function(){ return '<div style="font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#8891AA;line-height:1.3">'+esc(P.jor)+'</div>'; };
  var vsb=function(){ return '<b style="font-size:12px;color:#8891AA">VS</b>'; };
  /* h: escudos y VS en fila · v: escudos apilados · vn: escudos y nombres apilados · tv: solo nombres apilados */
  var vs=function(mode,w){ w=w||26;
    var nom=function(n){ return '<span style="font-size:11px;color:#E8EAF2;font-weight:600">'+esc(n)+'</span>'; };
    if(mode==="h") return '<div style="display:flex;align-items:center;justify-content:center;gap:8px">'+escudo(P.casa,w)+vsb()+escudo(P.fuera,w)+'</div>';
    if(mode==="v") return '<div style="display:flex;flex-direction:column;align-items:center;gap:4px">'+escudo(P.casa,w)+vsb()+escudo(P.fuera,w)+'</div>';
    if(mode==="vn") return '<div style="display:flex;flex-direction:column;align-items:center;gap:3px;text-align:center">'+escudo(P.casa,w)+nom(P.casa)+vsb()+escudo(P.fuera,w)+nom(P.fuera)+'</div>';
    return '<div style="display:flex;flex-direction:column;align-items:center;gap:3px;text-align:center">'+nom(P.casa)+vsb()+nom(P.fuera)+'</div>';
  };
  var conv=function(){ return '<div style="border-left:3px solid '+col+';padding:3px 8px;font-size:11px;line-height:1.3"><b style="color:'+col+'">'+esc(P.convTxt)+'</b><div style="color:#8891AA">'+esc(P.convDet)+'</div></div>'; };
  /* sin botón de jugar en el widget */
  var btn=function(){ return ''; };
  var frase=function(){ return '<div style="font-size:11px;font-style:italic;color:#C9CEDF;text-align:center">'+esc(P.frase)+'</div>'; };
  var col_=function(gap,body){ return '<div style="display:flex;flex-direction:column;gap:'+gap+'px;height:100%;justify-content:center">'+body+'</div>'; };
  if(z==="1x1") return col_(3,'<div style="display:flex;justify-content:center">'+escudo(P.casa,20)+'</div>'+btn("Jugar",9));
  if(z==="2x1") return col_(6,tag()+btn(P.btnCorto,11));
  if(z==="3x1") return '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;height:100%">'+vs("h",22)+'<div style="width:42%">'+btn(P.btnCorto,11)+'</div></div>';
  if(z==="1x2") return col_(4,vs("vn",18)+btn(P.btnCorto,10));
  if(z==="1x3") return col_(6,'<div style="font-size:18px;text-align:center">🏆</div><div style="font-size:12px;font-weight:700;color:#E8EAF2;text-align:center">'+esc(P.liga)+'</div>'+tag()+vs("tv")+btn(P.btnCorto,10));
  if(z==="2x2") return col_(6,tag()+vs("h",26)+conv()+btn(P.btn,11));
  if(z==="3x2") return col_(8,tag()+vs("h",34)+frase()+btn(P.btn,11));
  if(z==="2x3") return col_(10,tag()+vs("v",30)+conv()+btn(P.btn,11));
  return col_(12,tag()+vs("h",44)+frase()+btn(P.btn,12));
}
function sampleBody(W,z){
  var bg=bgLayer(W.id,z), inner= W.id==="W01"? partidoBody(z) : sampleBodyBase(W,z);
  return bg? bg+'<div style="position:relative;height:100%;width:100%;box-sizing:border-box">'+inner+'</div>' : inner;
}
function sampleBodyBase(W,z){
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
  var dropTrash=on(function(){ var id=window._WD; if(id && !inicioBorrable(id)){ toast("Este widget no se puede quitar del inicio"); return; } if(id){ set("wd."+id+".on",false); set("wd."+id+".c",null); set("wd."+id+".r",null); ST.sel.wdp=null; } });
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
function inicioBorrable(id){ return !!val("wd."+id+".borrar"); }
function widgetList(){
  /* los valores del inicio se registran aquí, no solo al abrir Datos o Tamaños, para que el móvil funcione desde el primer momento */
  WID.forEach(function(W){
    reg("wd."+W.id+".on",false,W.id+" · aparece en el inicio");
    reg("wd."+W.id+".borrar",true,W.id+" · se puede quitar del inicio");
    reg("wd."+W.id+".def",W.def,W.id+" · tamaño por defecto");
    reg("wd."+W.id+".c",null,W.id+" · columna en el inicio");
    reg("wd."+W.id+".r",null,W.id+" · fila en el inicio");
    WSZ.forEach(function(z){
      reg("wd."+W.id+".z"+z,true,W.id+" · "+z+" permitido");
      reg("wd."+W.id+".bg."+z,null,W.id+" · "+z+" · imagen de fondo");
      reg("wd."+W.id+".bgz."+z,100,W.id+" · "+z+" · zoom del fondo");
      reg("wd."+W.id+".bgx."+z,0,W.id+" · "+z+" · paneo horizontal del fondo");
      reg("wd."+W.id+".bgy."+z,0,W.id+" · "+z+" · paneo vertical del fondo");
      reg("wd."+W.id+".bgov."+z,35,W.id+" · "+z+" · velo del fondo");
    });
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
  var dropList=on(function(){ var id=window._WD; if(id && !inicioBorrable(id)){ toast("Este widget no se puede quitar del inicio"); return; } if(id){ set("wd."+id+".on",false); if(ST.sel.wdp===id) ST.sel.wdp=null; } });
  return '<div class="card list" ondragover="event.preventDefault()" ondrop="event.preventDefault();'+dropList+'" style="padding:0;overflow:hidden">'+rows+'</div>';
}
/* piezas de tetris con los tamaños del widget */
/* carga: la imagen se reduce en el navegador (máx. 640 px, JPEG) para que quepa en el borrador */
function bgSubir(id,z,f){
  if(!/^image\//.test(f.type)){ toast("Elige un archivo de imagen"); return; }
  var url=URL.createObjectURL(f), im=new Image();
  im.onload=function(){
    var k=Math.min(1,640/im.naturalWidth), c=document.createElement("canvas");
    c.width=Math.round(im.naturalWidth*k); c.height=Math.round(im.naturalHeight*k);
    c.getContext("2d").drawImage(im,0,0,c.width,c.height);
    URL.revokeObjectURL(url);
    var pre="wd."+id;
    set(pre+".bg."+z, c.toDataURL("image/jpeg",0.82));
    set(pre+".bgz."+z, 100); set(pre+".bgx."+z, 0); set(pre+".bgy."+z, 0);
    toast("Fondo de "+id+" · "+z+" cargado");
  };
  im.onerror=function(){ URL.revokeObjectURL(url); toast("No se pudo leer la imagen"); };
  im.src=url;
}
function bgCargar(id,z,el){
  var f=el.files&&el.files[0]; el.value=""; if(f) bgSubir(id,z,f);
}
/* pegar (Ctrl+V): con un tamaño elegido en Tamaños como piezas, la imagen del portapapeles va a ese fondo */
document.addEventListener("paste", function(ev){
  var sel=ST.sel.bgp||""; if(!sel || !document.querySelector(".wdpz")) return;
  var t=ev.target; if(t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)) return;
  var items=(ev.clipboardData && ev.clipboardData.items)||[];
  for(var i=0;i<items.length;i++){
    if(items[i].kind==="file" && /^image\//.test(items[i].type)){
      var f=items[i].getAsFile(), p=sel.split("|"); if(!f) return;
      ev.preventDefault();
      if(!val("wd."+p[0]+".z"+p[1])){ toast("Ese tamaño está apagado"); return; }
      bgSubir(p[0],p[1],f); return;
    }
  }
});
/* arrastrar para mover la imagen; se guarda al soltar. La rueda amplía o reduce */
function bgDragIni(f){
  return on(function(x,el,ev){
    el.setPointerCapture(ev.pointerId);
    window._BGD={ x:ev.clientX, y:ev.clientY, u0:f.u, v0:f.v, cu:f.u, cv:f.v, k:f.s/100, w:el.getBoundingClientRect().width, el:el };
  });
}
function bgDragMov(){
  return on(function(x,el,ev){
    var d=window._BGD; if(!d || d.k<=1) return;
    d.cu=Math.max(-100,Math.min(100, d.u0 + (ev.clientX-d.x)*200/((d.k-1)*d.w)));
    d.cv=Math.max(-100,Math.min(100, d.v0 + (ev.clientY-d.y)*200/((d.k-1)*d.w)));
    var im=d.el.querySelector("img"); if(im) im.style.transform="translate("+(d.cu*(d.k-1)/2)+"%,"+(d.cv*(d.k-1)/2)+"%) scale("+d.k+")";
  });
}
function bgDragFin(W,z){
  return on(function(){
    var d=window._BGD; window._BGD=null; if(!d) return;
    if(Math.round(d.cu)===Math.round(d.u0) && Math.round(d.cv)===Math.round(d.v0)) return;
    set("wd."+W.id+".bgx."+z, Math.round(d.cu)); set("wd."+W.id+".bgy."+z, Math.round(d.cv));
  });
}
function bgRueda(W,z,f){
  return on(function(x,el,ev){
    ev.preventDefault();
    set("wd."+W.id+".bgz."+z, Math.max(100,Math.min(400, f.s+(ev.deltaY<0?10:-10))));
  });
}
/* vista previa del tamaño elegido: aquí se encuadra la imagen */
function bgPreview(W,z,ov){
  var img=wdBg(W.id,z), c=z.split("x"), f=frOf(W.id,z);
  var forma='width:100%;height:170px;box-sizing:border-box;border-radius:8px;';
  if(!img) return '<div style="'+forma+'border:1px dashed #3A4262;display:flex;align-items:center;justify-content:center;color:#8891AA;font-size:12px;text-align:center;padding:10px">Sin imagen. Pega con Ctrl+V o sube una.</div>';
  return '<div class="wdprev" title="Arrastra para mover · rueda para ampliar" '+
    'onpointerdown="'+bgDragIni(f)+'" onpointermove="'+bgDragMov()+'" onpointerup="'+bgDragFin(W,z)+'" onpointercancel="'+bgDragFin(W,z)+'" onwheel="'+bgRueda(W,z,f)+'" '+
    'style="position:relative;overflow:hidden;'+forma+'border:1px solid #3A4262;touch-action:none;cursor:grab;background:#0B0E18">'+
    '<img src="'+img+'" alt="" style="'+frStyle(f)+'">'+
    '<div style="position:absolute;inset:0;background:rgba(8,10,20,'+ov+');pointer-events:none"></div></div>';
}
/* ajuste en vivo mientras se arrastra el slider: se pinta al momento y se guarda al soltar */
function bgVivo(id,z,que,v){
  var f=frOf(id,z), k=v/100;
  var tf="translate("+(f.u*(k-1)/2)+"%,"+(f.v*(k-1)/2)+"%) scale("+k+")";
  var targets=[document.querySelector(".wdprev"), document.querySelector('.wdpz[data-k="'+id+'|'+z+'"]')];
  targets.forEach(function(box){
    if(!box) return;
    if(que==="zoom"){ var im=box.querySelector("img"); if(im) im.style.transform=tf; }
    else { var ov=box.querySelector(":scope > div:last-child, .wdpov"); if(ov) ov.style.background="rgba(8,10,20,"+(v/100)+")"; }
  });
}
/* controles del fondo del tamaño elegido: van en su tarjeta fija, dentro de Tamaños permitidos */
function bgControles(W,z){
  var pre="wd."+W.id, k=pre+".bg."+z, img=wdBg(W.id,z), ov=val(pre+".bgov."+z), f=frOf(W.id,z);
  var rot='font-size:12px;color:#8891AA;width:44px;flex:none';
  return '<div style="display:flex;flex-direction:column;gap:10px">'+
    bgPreview(W,z,(Number(ov)||0)/100)+
    '<div style="display:flex;gap:8px;flex-wrap:wrap">'+
      '<label class="b sm" style="cursor:pointer;text-align:center;padding:6px;flex:1">'+(img?'Cambiar imagen':'Subir imagen')+'<input type="file" accept="image/*" style="display:none" onchange="'+on(function(x,el){ bgCargar(W.id,z,el); })+'"></label>'+
      (img? '<button class="b sm" onclick="'+on(function(){ set(k,null); })+'">Quitar imagen</button>' : '')+
    '</div>'+
    '<p class="mut" style="margin:0;font-size:12px">o pega una imagen con Ctrl+V</p>'+
    (img? '<div style="display:flex;align-items:center;gap:8px"><span style="'+rot+'">Zoom</span><input type="range" min="100" max="400" step="5" value="'+f.s+'" style="flex:1" oninput="'+on(function(x,el){ bgVivo(W.id,z,'zoom',Number(x)); el.nextElementSibling.textContent=x+' %'; })+'" onchange="'+on(function(x){ set(pre+".bgz."+z,Number(x)); })+'"><span style="font-size:12px;color:#8891AA;width:48px;text-align:right;flex:none">'+f.s+' %</span></div>'+
      '<div style="display:flex;justify-content:space-between;align-items:center"><span class="mut" style="font-size:12px">Arrastra la imagen para encuadrarla</span><button class="b sm" onclick="'+on(function(){ set(pre+".bgz."+z,100); set(pre+".bgx."+z,0); set(pre+".bgy."+z,0); })+'">Centrar</button></div>' : '')+
    '<div style="display:flex;align-items:center;gap:8px"><span style="'+rot+'">Velo</span><input type="range" min="0" max="80" step="5" value="'+ov+'" style="flex:1" oninput="'+on(function(x,el){ bgVivo(W.id,z,'velo',Number(x)); el.nextElementSibling.textContent=x+' %'; })+'" onchange="'+on(function(x){ set(pre+".bgov."+z,Number(x)); })+'"><span style="font-size:12px;color:#8891AA;width:48px;text-align:right;flex:none">'+ov+' %</span></div>'+
  '</div>';
}
function bgFijo(W,selZ){
  var ok = !!selZ && !!val("wd."+W.id+".z"+selZ);
  return card("Fondo"+(ok?" · "+selZ:""), ok? bgControles(W,selZ) : '<p class="mut" style="margin:0">Pulsa un tamaño en Tamaños como piezas para editar su fondo.</p>').replace('<div class="card "','<div class="card " style="flex:1;margin:0"');
}
function tetris(W,defS,selZ){
  var pre="wd."+W.id;
  var pieces=[1,2,3].map(function(hh){ return '<div style="display:flex;gap:12px;align-items:flex-start;width:100%">'+WSZ.filter(function(z){ return +z.split("x")[1]===hh; }).map(function(z){
    var w=+z.split("x")[0], h=+z.split("x")[1], isOn=!!val(pre+".z"+z), isD=z===defS, elegido=isOn && selZ===z, key=W.id+"|"+z;
    return '<div style="flex:'+w+' 1 0;min-width:0;'+(isOn?"":"opacity:.4")+'">'+
      '<div style="font-family:monospace;font-size:12px;color:'+(elegido?'#E8EAF2':'#8891AA')+';margin-bottom:4px">'+z+(isOn?'':' · apagado')+'</div>'+
      '<div class="wdpz" data-k="'+key+'" '+(isOn?'onclick="'+on(function(){ ST.sel.bgp = key; go(); })+'" title="Editar el fondo de '+z+'" ':'')+'style="position:relative;overflow:hidden;width:100%;aspect-ratio:'+w+' / '+h+';box-sizing:border-box;border-radius:8px;cursor:'+(isOn?'pointer':'default')+';background:'+(isD?'#2A2412':'#161B2C')+''+';border:'+(elegido?'2px solid #60A5FA':'1px solid '+(isD?'#FFC24B':'#3A4262'))+'">'+(wdBg(W.id,z)?'<img src="'+wdBg(W.id,z)+'" alt="" style="'+frStyle(frOf(W.id,z))+'"><div class="wdpov" style="position:absolute;inset:0;pointer-events:none;background:rgba(8,10,20,'+((Number(val(pre+".bgov."+z))||0)/100)+')"></div>':'')+'</div></div>';
  }).join("")+'</div>'; }).join("");
  return '<div style="display:grid;gap:12px;width:100%">'+pieces+'</div>';
}
V.widgets=function(){
  var s=ST.sel.wd||WID[0].id, W=wById(s)||WID[0], pre="wd."+W.id, L=W.id+" "+W.n;
  var t=tabs("wd",["Tamaños","Pantalla de inicio"]), tb=ST.tab.wd, b="";
  var ix=WID.indexOf(W);
  var datos=card(L,
      fld(pre+".n","Nombre",W.n,{full:L+" · nombre",d:"Solo para el panel."})+
      '<div class="diff"><span class="p mut">Página</span><b>'+esc(W.pg)+'</b></div>'+
      '<div class="diff"><span class="p mut">Pestaña de origen</span><span class="mono small">'+esc(W.tab)+'</span></div>'+
      fld(pre+".def","Tamaño por defecto",W.def,{type:"sel",opts:WSZ,full:L+" · tamaño por defecto"})+
      fld(pre+".on","Aparece en el inicio",false,{type:"tog",full:L+" · aparece en el inicio",si:"Sí",no:"No"})+
      fld(pre+".borrar","Se puede quitar del inicio",true,{type:"tog",full:L+" · se puede quitar del inicio",si:"Sí",no:"No",d:"Si está en No, no se puede borrar arrastrándolo a la papelera. Sí se puede cambiar su tamaño y moverlo."})+
      fld(pre+".txt","Qué muestra en tamaño pequeño",W.txt,{type:"area",rows:3,full:L+" · contenido",d:"Cada widget muestra la misma pestaña que en el juego, en la versión que cabe en su tamaño."}));
  if(tb==="Tamaños"){
    /* cada tamaño: nombre a la izquierda y su interruptor a la misma altura, también con la columna estrecha */
    var filas='<div class="tamf"><style>.tamf .f{display:flex;align-items:center;justify-content:space-between;gap:12px}.tamf .f>label{flex:1 1 auto;min-width:0}.tamf .f>div{margin:0;flex:none;width:auto}.tamf .f .row{display:flex;flex-direction:row;flex-wrap:nowrap;align-items:center;gap:8px}.tamf .f .fab{flex:none}</style>'+WSZ.map(function(z){
        return fld(pre+".z"+z, z+(z==="1x1"?" · una celda":z==="3x3"?" · tablero completo":""), true, {type:"tog", full:L+" · "+z, si:"Sí", no:"No"});
      }).join("")+'</div>';
    var defS=val(pre+".def")||W.def;
    var selZ=(ST.sel.bgp||"").indexOf(W.id+"|")===0? ST.sel.bgp.split("|")[1] : null;
    /* Fondo va dentro de Tamaños permitidos, a la derecha de la lista */
    var permitidos='<div style="display:flex;flex-wrap:wrap;gap:16px;align-items:stretch"><div style="flex:1 1 260px;min-width:0">'+filas+'</div>'+
      '<div style="flex:0 0 280px;max-width:100%;display:flex;flex-direction:column">'+bgFijo(W,selZ)+'</div></div>';
    b='<div style="display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:14px;align-items:stretch">'+
      '<div style="display:flex;flex-direction:column;gap:14px;min-width:0">'+datos+card("Tamaños permitidos", permitidos, '<span class="tag">'+WSZ.length+' tamaños</span>')+'</div>'+
      card("Tamaños como piezas · "+L, tetris(W,defS,selZ))+'</div>';
  }
  return hd("Widgets","Cada pestaña del juego como widget independiente, para cambiar cada uno por separado.", btn("Guardar widgets",wdGuardar,"gold"))+
    t+'<div class="split">'+widgetList()+'<div style="min-width:0;flex:1 1 auto;width:100%">'+(tb==="Pantalla de inicio"? inicioView() : b)+'</div></div>';
};

/* guarda en el servidor (tl_widgets) toda la configuración de widgets: tamaños, fondos, encuadres y velos */
function wdGuardar(){
  var keys={}; Object.keys(BASE).concat(Object.keys(DRAFT)).forEach(function(k){ if(k.indexOf("wd.")===0) keys[k]=true; });
  var pack={}; Object.keys(keys).forEach(function(k){ var v=val(k); if(v!==undefined) pack[k]=v; });
  toast("Guardando widgets…");
  pbApi("/api/collections/tl_widgets/records?perPage=1&filter="+encodeURIComponent("(kind='cfg')")).then(function(r){
    var body=JSON.stringify({kind:"cfg", pack:pack, t:Date.now()}), it=r.items&&r.items[0];
    return it? pbApi("/api/collections/tl_widgets/records/"+it.id,{method:"PATCH",headers:PB_JSON,body:body})
             : pbApi("/api/collections/tl_widgets/records",{method:"POST",headers:PB_JSON,body:body});
  }).then(function(){
    Object.keys(pack).forEach(function(k){ BASE[k]=pack[k]; delete DRAFT[k]; });
    try{ guardarBorrador(); }catch(e){}
    go(); toast("Widgets guardados en el servidor");
  }).catch(function(e){
    var m=String(e.message||e);
    toast(/404/.test(m)? "Falta la colección tl_widgets en el servidor (migración 1763000007)" : "No se guardaron los widgets: "+m);
  });
}
