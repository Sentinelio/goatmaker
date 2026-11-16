/* ===== ADAPTACIÓN AL SERVIDOR REAL (Goatmaker) =====
   Sustituye los datos de ejemplo por PocketBase. Lo que no está integrado queda atenuado (clase .off, deshabilitado). */
var PB_URL="https://server-pc.tail3b4002.ts.net:8447";
CUR_VER="4.69.9";   /* versión actual del juego: el filtro «Versión antigua» compara con esto */
var OK_NAV=["jugadores","grupos","codigos","reportes"];
var PB={tok:"",byInst:{},raw:{pl:[],cod:[],can:[],rep:[]}};
var PB_RT={bug:["🐞","Fallo"],idea:["💡","Idea"],otro:["💬","Otro"]};

function pbFecha(t){ if(!t) return "—"; var d=new Date(t); return d.toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit"})+" "+d.toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"}); }
function pbCopia(t){ return (navigator.clipboard&&window.isSecureContext?navigator.clipboard.writeText(t):Promise.reject()).catch(function(){ var a=document.createElement("textarea"); a.value=t; a.style.position="fixed"; a.style.opacity="0"; document.body.appendChild(a); a.select(); try{document.execCommand("copy")}catch(e){} a.remove(); }); }
function pbCod(c){ return /^GM[A-Z0-9]{12}$/.test(c)?"GM-"+c.slice(2,6)+"-"+c.slice(6,10)+"-"+c.slice(10):c; }
function pbNuevoCod(){ var a="ABCDEFGHJKMNPQRSTUVWXYZ23456789",s="GM",u=new Uint8Array(32),i; while(s.length<14){ crypto.getRandomValues(u); for(i=0;i<32&&s.length<14;i++) if(u[i]<248) s+=a[u[i]%31]; } return s; }
function pbDisp(ua){ ua=ua||""; return (/Mobi|Android|iPhone|iPad/.test(ua)?"Móvil":"Escritorio")+" · "+ua.slice(0,60); }
function pbNombre(p){ return p?(p.label||(p.estado&&p.estado.nombre)||""):""; }
function pbClub(n){ if(!n) return null; var e=CL.filter(function(x){return x.n===n||x.c===n})[0]; if(e) return e.id; var id="x-"+n; if(!CLI[id]) CLI[id]={id:id,n:n,c:n.slice(0,3).toUpperCase(),col:["#64748b","#334155","plain"],est:"",liga:""}; return id; }
function cardOff(t,b,e,c){ return '<div class="off">'+card(t,b,e,c)+'</div>'; }

async function pbApi(path,opt){
  opt=opt||{}; opt.headers=Object.assign({Authorization:PB.tok},opt.headers||{});
  var r=await fetch(PB_URL+path,opt);
  if(r.status===401){ pbOut(); throw new Error("sesión caducada"); }
  if(!r.ok){ var t=""; try{t=(await r.json()).message}catch(e){} throw new Error(r.status+" "+t); }
  return r.status===204?null:r.json();
}
var PB_JSON={"Content-Type":"application/json"};
async function pbAll(col,q){ var out=[],p=1,tp=1; do{ var r=await pbApi("/api/collections/"+col+"/records?perPage=500&page="+p+"&"+(q||"")); out=out.concat(r.items); tp=r.totalPages; p++; }while(p<=tp); return out; }

/* datos: PocketBase → formas que usa el prototipo */
function pbAdapta(){
  var now=Date.now();
  PB.byInst={}; PB.raw.pl.forEach(function(p){ PB.byInst[p.install]=p; });
  JUG.length=0;
  PB.raw.pl.forEach(function(p){ var e=p.estado||{}, lt=p.last_t||0;
    JUG.push({id:p.install,_rid:p.id,n:pbNombre(p),g:pbGrupoNom(p.adm_grupo),ver:p.ver||"—",eq:pbClub(e.club_n),pos:"—",niv:e.nivel||0,temp:e.temporada||0,jor:e.jornada||0,med:e.nota||0,edad:0,last:lt?pbFecha(lt):"—",lastN:lt?(now-lt)/36e5:9999,h:(p.active_s||0)/3600,ses:p.sessions||0,st:p.adm_bloqueado?"blq":((lt&&now-lt<120000)?"on":""),din:0,arq:"—",dev:p.ua?pbDisp(p.ua):"—",tz:p.tz||"—",first:p.first_t||0,lang:p.lang||"—",scr:p.scr||"—",ua:p.ua||"",nota:p.adm_nota||"",cont:p.estado&&p.estado.cont});
  });
  COD.length=0;
  PB.raw.cod.forEach(function(c){ COD.push({_rid:c.id,raw:c.code,c:pbCod(c.code),fx:(c.efectos||[]).map(function(x){return [x.k,x.v]}),u:c.usos||0,max:c.max_usos||0,cad:c.hasta?new Date(c.hasta).toISOString().slice(0,10):"",uno:!!c.una_por_jugador,on:!!c.activo,nota:c.nota||""}); });
  REP.length=0;
  PB.raw.rep.forEach(function(r){ var p=PB.byInst[r.install],T=PB_RT[r.tipo]||PB_RT.otro,cx=r.ctx||{},e=cx.estado||{};
    REP.push({_rid:r.id,inst:r.install,ic:T[0],tipo:T[1],de:pbNombre(p)||r.install.slice(0,8),x:r.texto||"",est:r.estado||"nuevo",t:pbFecha(r.t),ctx:(cx.ver?"v"+cx.ver:"v?")+(e.club_n?" · "+e.club_n+" · T"+(e.temporada||0)+" J"+(e.jornada||0):""),save:!!cx.adjunta,nota:r.nota_admin||""});
  });
}
async function pbCarga(){
  $("conn").innerHTML='<span class="dot on"></span>Conectado · servidor';
  PB.raw.grp=await pbAll("tl_grupos","sort=nombre");
  GRP.length=0; PB.raw.grp.forEach(function(g){ GRP.push({id:g.id,n:g.nombre,d:g.descripcion||"",borr:false}); if(OK_CHIP.indexOf(g.nombre)<0) OK_CHIP.push(g.nombre); });
  PB.raw.pl=await pbAll("tl_players","sort=-last_t");
  PB.raw.cod=await pbAll("tl_codes","sort=-created");
  PB.raw.can=await pbAll("tl_canjes","sort=-t");
  PB.raw.rep=await pbAll("tl_reports","sort=-t&fields="+encodeURIComponent("id,install,t,tipo,texto,ctx,estado,nota_admin"));
  PB.det={}; pbAdapta(); go();
}
async function pbEntra(){
  $("l-err").textContent="";
  try{
    var r=await fetch(PB_URL+"/api/collections/_superusers/auth-with-password",{method:"POST",headers:PB_JSON,body:JSON.stringify({identity:$("l-mail").value.trim(),password:$("l-pass").value})});
    var j=await r.json(); if(!r.ok) throw new Error(j.message||r.status);
    PB.tok=j.token; try{sessionStorage.setItem("gm-adm",JSON.stringify({u:PB_URL,t:j.token}))}catch(e){}
    $("l-pass").value=""; pbMuestra(); await pbCarga();
  }catch(e){ $("l-err").textContent=(e instanceof TypeError)? "No llega a server-pc: revisa que Tailscale esté conectado en este dispositivo y que PocketBase esté encendido en el servidor." : "No se pudo entrar: "+e.message; }
}
function pbMuestra(){ $("login").classList.add("hide"); $("app").classList.remove("hide"); }
function pbOut(){ try{sessionStorage.removeItem("gm-adm")}catch(e){} PB.tok=""; $("app").classList.add("hide"); $("login").classList.remove("hide"); }

/* barra lateral: solo lo integrado tiene enlace; el resto va atenuado */
function side(){
  $("side").innerHTML=NAV.map(function(g,gi){ var act=false;
    var its=g[1].map(function(i){
      if(ST.sec===i[0]) act=true;
      if(OK_NAV.indexOf(i[0])<0) return '<a class="off" title="No integrado todavía"><i>'+i[1]+'</i>'+i[2]+'</a>';
      var n=i[0]==="reportes"?REP.filter(function(r){return r.est==="nuevo"}).length:0;
      return '<a class="'+(ST.sec===i[0]?"on":"")+'" onclick="nav(\''+i[0]+'\')"><i>'+i[1]+'</i>'+i[2]+(n?'<em class="hot">'+n+'</em>':'')+'</a>';
    }).join("");
    var c=!!COL[g[0]];
    return '<h4 class="'+(c?"col":"")+(c&&act?" act":"")+'" onclick="plegar(NAV['+gi+'][0])" title="'+(c?"Desplegar":"Plegar")+'"><span class="cv">▼</span>'+g[0]+'</h4>'+(c?"":its);
  }).join("");
}
/* barra superior: sin cambios de contenido (no integrado) */
function topbar(){
  $("bcam").innerHTML='Sin cambios'; $("bcam").disabled=true;
  $("bpub").disabled=true; $("bpub").classList.add("off");
  $("modo").innerHTML='<span class="dot"></span>Datos en vivo';
}

/* códigos: formulario real */
function codForm(){ return function(){ return '<h2>Código nuevo</h2>'+
  '<div class="f"><label>Efectos</label><div class="fx">'+CAT.map(function(c){return '<label><input type="checkbox" data-fk="'+c.k+'"> '+esc(c.n)+(c.u?' <input type="number" data-fv="'+c.k+'" value="'+c.def+'" min="'+c.min+'" max="'+c.max+'" style="width:110px"> <span class="small mut">'+esc(c.u)+'</span>':'')+'</label>'}).join("")+'</div><div class="fab"></div></div>'+
  '<div class="f"><label>Código (vacío = generar)</label><input type="text" id="cf-code" class="mono" placeholder="GM-XXXX-XXXX-XXXX"><div class="fab">letras y cifras</div></div>'+
  '<div class="f"><label>Nota</label><input type="text" id="cf-nota" placeholder="Para quién es"><div class="fab">solo la ves tú</div></div>'+
  '<div class="f"><label>Usos máximos</label><input type="number" id="cf-max" value="1" min="0"><div class="fab">0 = sin límite</div></div>'+
  '<div class="f"><label>Caduca</label><select id="cf-cad"><option value="0">Nunca</option><option value="1">En 1 día</option><option value="7" selected>En 7 días</option><option value="30">En 30 días</option></select><div class="fab"></div></div>'+
  '<div class="f"><label>Una vez por jugador</label><div><input type="checkbox" id="cf-uno" checked></div><div class="fab"></div></div>'+
  '<p class="small errt" id="cf-msg" style="margin:6px 0 0"></p>'+
  '<div class="row" style="justify-content:flex-end;margin-top:14px">'+btn("Cancelar",function(){modal()})+btn("Crear código",coCrear,"gold")+'</div>'; }; }
async function coCrear(){
  var m=$("cf-msg"); m.textContent="";
  var ef=[], bad=null;
  CAT.forEach(function(c){ var cb=document.querySelector('[data-fk="'+c.k+'"]'); if(cb&&cb.checked){ var o={k:c.k}; if(c.u){ var v=Math.round(Number(document.querySelector('[data-fv="'+c.k+'"]').value)); if(!(v>=c.min&&v<=c.max)){ bad="«"+c.n+"»: entre "+c.min+" y "+c.max+"."; return; } o.v=v; } ef.push(o); } });
  if(bad){ m.textContent=bad; return; }
  if(!ef.length){ m.textContent="Marca al menos un efecto."; return; }
  var cad=$("cf-cad").value, hasta=cad==="0"?0:Date.now()+(+cad)*864e5;
  var manual=($("cf-code").value||"").toUpperCase().replace(/[^A-Z0-9]/g,"");
  if(manual&&(manual.length<4||manual.length>24)){ m.textContent="El código a mano tiene que tener entre 4 y 24 letras o cifras."; return; }
  var body={nota:$("cf-nota").value.trim().slice(0,200),efectos:ef,max_usos:Math.max(0,Math.round(+$("cf-max").value||0)),usos:0,una_por_jugador:$("cf-uno").checked,desde:0,hasta:hasta,activo:true};
  try{
    for(var i=0;i<4;i++){ body.code=manual||pbNuevoCod();
      try{ await pbApi("/api/collections/tl_codes/records",{method:"POST",headers:PB_JSON,body:JSON.stringify(body)}); break; }
      catch(e){ if(manual||i===3) throw e; } }
  }catch(e){ m.textContent="No se pudo crear: "+e.message; return; }
  PB.raw.cod=await pbAll("tl_codes","sort=-created"); pbAdapta(); modal();
  await pbCopia(body.code); toast("Creado y copiado: "+pbCod(body.code));
}
async function coAcc(a,c){
  try{
    if(a==="copiar"){ await pbCopia(c.raw); return toast("Copiado: "+c.c); }
    if(a==="toggle"){ await pbApi("/api/collections/tl_codes/records/"+c._rid,{method:"PATCH",headers:PB_JSON,body:JSON.stringify({activo:!c.on})}); }
    if(a==="borrar"){ if(!confirm("¿Borrar el código "+c.c+"? Se conserva el historial de canjes.")) return; await pbApi("/api/collections/tl_codes/records/"+c._rid,{method:"DELETE"}); }
    if(a==="regen"){
      var d=prompt("Regenerar "+c.c+" con cadena nueva, usos a 0 y reactivado.\n\n¿Días de validez desde ahora? (0 = sin caducidad · vacío = dejar el límite)","");
      if(d===null) return;
      var patch={usos:0,activo:true};
      if(String(d).trim()!==""){ var n=Math.max(0,Math.round(+d||0)); patch.hasta=n?Date.now()+n*864e5:0; }
      var ok=false;
      for(var i=0;i<4&&!ok;i++){ patch.code=pbNuevoCod(); try{ await pbApi("/api/collections/tl_codes/records/"+c._rid,{method:"PATCH",headers:PB_JSON,body:JSON.stringify(patch)}); ok=true; }catch(e){ if(i===3) throw e; } }
      await pbCopia(pbCod(patch.code)); toast("Nuevo código copiado: "+pbCod(patch.code));
    }
    PB.raw.cod=await pbAll("tl_codes","sort=-created"); pbAdapta(); go();
  }catch(e){ alert("No se pudo: "+e.message); }
}
function canjesTabla(){
  var rows=PB.raw.can.map(function(x){ var p=PB.byInst[x.install];
    return '<tr><td class="mut">'+pbFecha(x.t)+'</td><td><b>'+esc(pbNombre(p)||"sin nombre")+'</b></td><td class="mono">'+esc(pbCod(x.code))+'</td><td><span class="tag ok">aplicado</span></td></tr>'; }).join("");
  return card("Canjes",'<div class="ox"><table><tr><th>Cuándo</th><th>Jugador</th><th>Código</th><th>Resultado</th></tr>'+rows+'</table></div>'+(PB.raw.can.length?'':'<p class="mut">Todavía no hay canjes.</p>'));
}

/* reportes: acciones reales */
function reTexto(R){ return "[Goatmaker · "+R.tipo.toLowerCase()+" · "+R.ctx+"]\nJugador: "+R.de+"\nFecha: "+R.t+"\n\n"+R.x+(R.nota?"\n\nNota mía: "+R.nota:""); }
async function reEst(R,x){ try{ await pbApi("/api/collections/tl_reports/records/"+R._rid,{method:"PATCH",headers:PB_JSON,body:JSON.stringify({estado:x})}); R.est=x; var r=PB.raw.rep.find(function(q){return q.id===R._rid}); if(r) r.estado=x; go(); }catch(e){ alert("No se pudo: "+e.message); } }
async function reNota(R,x){ try{ var v=x.trim().slice(0,2000); await pbApi("/api/collections/tl_reports/records/"+R._rid,{method:"PATCH",headers:PB_JSON,body:JSON.stringify({nota_admin:v})}); R.nota=v; toast("Nota guardada"); }catch(e){ alert("No se pudo: "+e.message); } }
async function reAcc(a,R){
  try{
    if(a==="copiar"){ await pbCopia(reTexto(R)); if(R.est==="nuevo"){ await pbApi("/api/collections/tl_reports/records/"+R._rid,{method:"PATCH",headers:PB_JSON,body:JSON.stringify({estado:"visto"})}); R.est="visto"; } go(); return toast("Copiado: pégaselo a Claude"); }
    if(a==="partida"){ var x=await pbApi("/api/collections/tl_reports/records/"+R._rid), s=x.save;
      if(!s||!Object.keys(s).length) return alert("Este reporte no trae partida.");
      var b=new Blob([JSON.stringify(s)],{type:"application/json"}), el=document.createElement("a");
      el.href=URL.createObjectURL(b); el.download="goatmaker-reporte-"+R._rid+"-t"+s.temporada+"-j"+((s.jornada||0)+1)+".json"; el.click(); return; }
    if(a==="borrar"){ if(!confirm("¿Borrar este reporte?")) return; await pbApi("/api/collections/tl_reports/records/"+R._rid,{method:"DELETE"}); PB.raw.rep=PB.raw.rep.filter(function(q){return q.id!==R._rid}); pbAdapta(); go(); }
  }catch(e){ alert("No se pudo: "+e.message); }
}

/* entrar y arrancar */
$("l-go").onclick=pbEntra;
$("l-pass").addEventListener("keydown",function(e){ if(e.key==="Enter") pbEntra(); });
(function(){ try{ var s=JSON.parse(sessionStorage.getItem("gm-adm")||"null"); if(s&&s.t){ PB.tok=s.t; pbMuestra(); pbCarga().catch(function(e){ alert("No se pudo cargar: "+e.message); }); } }catch(e){} })();
function flagsBar(){ return '<div class="off">'+flagsBarOrig()+'</div>'; }

/* borrado de usuarios: sus datos del servidor (sesiones, eventos, partidas guardadas y fila de jugador) */
function pbConfirmaBorrar(ids,todo){ return function(){ return '<h2>'+(todo?'Borrar todos los datos de '+esc(ids.length===1&&JUG.find(function(j){return j.id===ids[0]})?JUG.find(function(j){return j.id===ids[0]}).n:ids.length+' usuarios'):'Borrar datos de '+ids.length+' usuario'+(ids.length===1?'':'s'))+'</h2>'+
  (todo?'<p class="mut">Se borra todo lo del jugador: sesiones, eventos, partidas guardadas, reportes, canjes y su fila de jugador. No se puede deshacer.</p>':'<p class="mut">Se borran del servidor sus sesiones, eventos, partidas guardadas y su fila de jugador. Los reportes y los canjes se conservan. No se puede deshacer.</p>')+
  '<p class="mut small">El progreso de la carrera vive en el navegador del jugador y no se borra. Si ese navegador vuelve a jugar, aparecerá como usuario nuevo.</p>'+
  '<div class="f"><label>Escribe BORRAR para confirmar</label><input type="text" id="bd-conf" placeholder="BORRAR"><div class="fab"></div></div>'+
  '<p class="small errt" id="bd-msg"></p>'+
  '<div class="row" style="justify-content:flex-end;margin-top:14px">'+btn("Cancelar",function(){modal()})+btn("Confirmar",function(){pbBorra(ids,todo)},"red")+'</div>'; }; }
async function pbBorra(ids,todo){
  var m=$("bd-msg"); m.textContent="";
  if(($("bd-conf").value||"").trim().toUpperCase()!=="BORRAR"){ m.textContent="Escribe BORRAR para confirmar."; return; }
  try{
    for(var k=0;k<ids.length;k++){
      var id=ids[k], f="fields=id&filter="+encodeURIComponent("install='"+id+"'");
      var cols=["tl_events","tl_sessions","tl_snapshots"].concat(todo?["tl_reports","tl_canjes","tl_intentos"]:[]);
      for(var c=0;c<cols.length;c++){ var rs=await pbAll(cols[c],f); for(var x=0;x<rs.length;x++) await pbApi("/api/collections/"+cols[c]+"/records/"+rs[x].id,{method:"DELETE"}); }
      var pl=PB.raw.pl.find(function(p){return p.install===id}); if(pl) await pbApi("/api/collections/tl_players/records/"+pl.id,{method:"DELETE"});
      // baja: la partida del jugador se borra al volver a entrar en el juego (ver tl_bajas en /tele)
      var ya=await pbAll("tl_bajas",f);
      if(!ya.length) await pbApi("/api/collections/tl_bajas/records",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({install:id,t:Date.now()})});
    }
  }catch(e){ m.textContent="No se pudo borrar: "+e.message; return; }
  ST.chk={}; if(ST.sel) ST.sel.jug=null;
  await pbCarga(); modal(); toast("Datos borrados: "+ids.length);
}
// Datos del admin de la ficha: nombre (label) y nota privada (adm_nota). Se guarda al salir del campo.
async function pbDatoAdm(J,campo,x){
  var v=String(x||"").trim().slice(0,campo==="label"?80:2000);
  var o={}; o[campo]=v;
  try{
    await pbApi("/api/collections/tl_players/records/"+J._rid,{method:"PATCH",headers:PB_JSON,body:JSON.stringify(o)});
    var p=PB.raw.pl.find(function(q){return q.id===J._rid}); if(p) p[campo]=v;
    if(campo==="label") J.n=pbNombre(p); else J.nota=v;
    toast("Guardado");
  }catch(e){ toast("No se pudo guardar: "+e.message); }
  go();
}
// ---- Grupos: tl_grupos + relación adm_grupo en tl_players ----
OK_BTN.push("+ Grupo","Guardar","Borrar grupo");
function pbGrupoNom(id){ var g=(PB.raw.grp||[]).find(function(x){return x.id===id}); return g?g.nombre:""; }
async function pbGrupoGuarda(G,n,d){
  n=String(n||"").trim().slice(0,40); d=String(d||"").trim().slice(0,200);
  if(!n){ toast("Pon un nombre al grupo"); return false; }
  try{
    var o={nombre:n,descripcion:d};
    if(G) await pbApi("/api/collections/tl_grupos/records/"+G.id,{method:"PATCH",headers:PB_JSON,body:JSON.stringify(o)});
    else await pbApi("/api/collections/tl_grupos/records",{method:"POST",headers:PB_JSON,body:JSON.stringify(o)});
    if(G&&ST.tab.jg===G.n) ST.tab.jg=n;   /* si el filtro de Usuarios estaba en el grupo renombrado, sigue en él */
    await pbCarga(); toast("Grupo guardado"); return true;
  }catch(e){ toast("No se pudo guardar: "+e.message); return false; }
}
async function pbGrupoBorra(G){
  try{ await pbApi("/api/collections/tl_grupos/records/"+G.id,{method:"DELETE"}); modal(); if(ST.tab.jg===G.n) ST.tab.jg="Todos"; await pbCarga(); toast("Grupo borrado"); }
  catch(e){ toast("No se pudo borrar: "+e.message); }
}
function grpBorraPregunta(G){ return function(){ return '<h2>Borrar el grupo «'+esc(G.n)+'»</h2><p class="mut">Sus miembros se quedan sin grupo. Los datos de los jugadores no se borran.</p><div class="row">'+btn("Confirmar",function(){pbGrupoBorra(G)},"red")+btn("Cancelar",function(){modal()})+'</div>'; }; }
function grpForm(G){ return function(){ return '<h2>'+(G?"Editar grupo":"Grupo nuevo")+'</h2><div class="f"><label>Nombre</label><input id="gf-n" type="text" maxlength="40" value="'+esc(G?G.n:"")+'"><div class="fab"></div></div><div class="f"><label>Descripción</label><input id="gf-d" type="text" maxlength="200" value="'+esc(G?G.d:"")+'"><div class="fab"></div></div><div class="row">'+btn("Guardar",function(){ pbGrupoGuarda(G,$("gf-n").value,$("gf-d").value).then(function(ok){ if(ok) modal(); }); },"gold")+btn("Cancelar",function(){modal()})+'</div>'; }; }
async function pbCambiaGrupo(J,nombre){
  var G=GRP.filter(function(g){return g.n===nombre})[0];
  try{
    await pbApi("/api/collections/tl_players/records/"+J._rid,{method:"PATCH",headers:PB_JSON,body:JSON.stringify({adm_grupo:G?G.id:""})});
    var p=PB.raw.pl.find(function(q){return q.id===J._rid}); if(p) p.adm_grupo=G?G.id:"";
    J.g=nombre; toast(nombre?"Grupo: "+nombre:"Sin grupo"); go();
  }catch(e){ toast("No se pudo cambiar: "+e.message); }
}
V.grupos=function(){
  var cab=hd("Grupos","Sirven para filtrar a los usuarios. Cada jugador tiene como mucho un grupo.",btn("+ Grupo",function(){modal(grpForm(null))},"gold"));
  if(!GRP.length) return cab+card("",'<p class="mut">Todavía no hay grupos. Crea el primero con «+ Grupo».</p>');
  return cab+'<div class="grid g2">'+GRP.map(function(g){
    var ms=JUG.filter(function(j){return j.g===g.n});
    var cuerpo='<div class="f"><label>Nombre</label><input type="text" value="'+esc(g.n)+'" onchange="'+on(function(x){pbGrupoGuarda(g,x,g.d)})+'"><div class="fab"></div></div>'
      +'<div class="f"><label>Descripción</label><input type="text" value="'+esc(g.d)+'" onchange="'+on(function(x){pbGrupoGuarda(g,g.n,x)})+'"><div class="fab"></div></div>'
      +'<div class="f off"><label>Reciben el borrador</label><div class="row"><span class="small mut">Pendiente: el juego aún no lee los grupos</span></div><div class="fab"></div></div>'
      +'<div class="f"><label>Miembros</label><div>'+(ms.length?ms.map(function(j){return '<span class="chip" onclick="'+on(function(){ST.sel.jug=j.id;nav("jugadores")})+'">'+esc(jNom(j))+'</span>'}).join(""):'<span class="mut small">ninguno</span>')+'</div><div class="fab"></div></div>'
      +'<div class="row" style="margin-top:12px">'+btn("Borrar grupo",function(){modal(grpBorraPregunta(g))},"red")+'</div>';
    return card(g.n,cuerpo);
  }).join("")+'</div>';
};
// ---- Ficha del jugador: pestañas con datos reales (eventos, partidas, canjes, reportes, dispositivo) ----
OK_TAB.push("Vida y tienda","Línea de tiempo","Partidas","Regalos y mensajes","Reportes y errores","Dispositivo");
OK_BTN.push("Cargar más","Última partida","Exportar CSV","Desbloquear","Bloquear este navegador");
PB.det={};
async function pbCargaDet(id,masEv){
  var D=PB.det[id]||(PB.det[id]={evN:200,loading:false});
  if(masEv) D.evN+=200;
  if(D.loading) return; D.loading=true; D.fallo=false;
  var f="filter="+encodeURIComponent("install='"+id+"'");
  try{
    var ev=await pbApi("/api/collections/tl_events/records?perPage="+D.evN+"&sort=-t&"+f);
    var sn=await pbApi("/api/collections/tl_snapshots/records?perPage=6&sort=-t&fields=id,t,bytes,ver&"+f);
    var cn=await pbApi("/api/collections/tl_canjes/records?perPage=100&sort=-t&"+f);
    var se=await pbApi("/api/collections/tl_sessions/records?perPage=500&sort=-start_t&fields=start_t&"+f);
    var dias=[0,0,0,0,0,0,0,0,0,0,0,0,0,0], hoy=new Date(); hoy.setHours(0,0,0,0);
    se.items.forEach(function(s){ var d=Math.round((hoy-new Date(s.start_t).setHours(0,0,0,0))/864e5); if(d>=0&&d<14) dias[13-d]++; });
    var ul=await pbApi("/api/collections/tl_snapshots/records?perPage=1&sort=-t&"+f);
    Object.assign(D,{ev:ev,snap:sn.items,can:cn.items,dias:dias,save:(ul.items[0]&&ul.items[0].save)||null,ok:true,t:Date.now()});
  }catch(e){ D.fallo=true; toast("No se pudieron cargar los datos del jugador: "+e.message); }
  D.loading=false; go();
}
function pbDet(J){ var D=PB.det[J.id]; if(D&&D.ok){ if(!D.loading && Date.now()-D.t>60000) pbCargaDet(J.id); return D; } if(!(D&&(D.loading||D.fallo))) pbCargaDet(J.id); return null; }
function pbPend(){ return card("Cargando",'<p class="mut">Leyendo los datos del jugador…</p>'); }
function pbResumen(d){ if(d==null) return ""; var s=typeof d==="string"?d:JSON.stringify(d); return s.length>110?s.slice(0,110)+"…":s; }
function pbSave(J){ var D=pbDet(J); return D&&D.save? D.save : null; }
function pbPuesto(J){ var s=pbSave(J); return s&&G_POS[s.pos]? G_POS[s.pos].n : "—"; }
function pbEdad(J){ var s=pbSave(J); return s&&s.edad? s.edad : "—"; }
function pbDinero(J){ var s=pbSave(J); return s&&s.dinero!=null? eur(s.dinero) : "—"; }
function pbContenido(J){ var n=J.cont; if(n==null) return "—"; if(!n) return "de fábrica"; if(n>=1000000) return "borrador"; return "v"+n; }
function pbNum(v){ return typeof v==="number"? String(Math.round(v*10)/10).replace(".",",") : (v==null||v===""? "—" : String(v)); }
function pbPosNom(k){ return G_POS[k]? G_POS[k].n : (k||"—"); }
function pbItemNom(id){
  var p=String(id).split("-"), c=G_TCATS.filter(function(x){return x.id===p[0];})[0];
  return (c && c.modelos && c.modelos[+p[1]] && c.modelos[+p[1]][+p[2]]) || id;
}
// texto legible de cada evento del juego (las claves son las que manda index.html)
function pbEvTexto(x){
  var d=x.d||{}, n=function(v){ return v==null||v===""? "—" : String(v); };
  switch(x.tipo){
    case "sesion": return "Abre el juego"+(d.ref? " desde "+d.ref : "");
    case "pantalla": return "Pantalla: "+n(d.k);
    case "modal": return "Aviso: «"+n(d.t)+"»";
    case "decision": return "«"+n(d.l)+"»"+(d.m!=null? " · min. "+d.m : "")+(d.sc? " · "+d.sc[0]+"-"+d.sc[1] : "")+(d.f&&d.f!=="juego"? " · "+({post:"después del partido",previa:"antes del partido"}[d.f]||d.f) : "");
    case "partido": return "vs "+n(d.rival)+(d.casa===true? " (en casa)" : d.casa===false? " (fuera)" : "")+(d.sc? " · "+d.sc[0]+"-"+d.sc[1] : "")+(d.nota!=null? " · nota "+pbNum(d.nota) : "")+(d.g? " · "+d.g+(d.g===1?" gol":" goles") : "")+(d.a? " · "+d.a+" asist." : "")+(d.ta? " · "+d.ta+" amarilla(s)" : "")+(d.tr? " · roja" : "")+(d.j? " · J"+d.j : "");
    case "carrera": return "Carrera "+(d.motivo==="cambio"?"cambiada":"abierta")+" · T"+n(d.r&&d.r.temporada)+" J"+n(d.r&&d.r.jornada);
    case "carrera_inicio": return "Empieza carrera"+(d.pos? " de "+pbPosNom(d.pos) : "")+(d.eq? " · "+d.eq : "");
    case "traspaso_ui": return "Traspaso"+(d.pos? " como "+pbPosNom(d.pos) : "")+(d.eq? " · "+d.eq : "");
    case "temporada_nueva": return "Temporada "+n(d.a)+" · "+n(d.pj)+" PJ · "+n(d.g)+" goles · "+n(d.asist)+" asist."+(d.nota!=null? " · nota media "+pbNum(d.nota) : "");
    case "club": return "Ficha por "+n(d.a)+(d.de? " (venía de "+d.de+")" : "");
    case "division": return "División "+n(d.de)+" → "+n(d.a);
    case "lesion": return "Lesión de "+n(d.jornadas)+" jornadas";
    case "sancion": return "Sanción de "+n(d.jornadas)+" jornadas";
    case "nivel": return "Sube al nivel "+n(d.a);
    case "fin_temporada": return "Fin de temporada · "+n(d.pos)+"º en "+n(d.div)+(d.pts!=null? " · "+d.pts+" pts" : "");
    case "err": return "Error: "+n(d.msg);
    default: var j=JSON.stringify(d); return j.length>110? j.slice(0,110)+"…" : j;
  }
}
function pbDias(J){ var D=pbDet(J); return D?D.dias:[0,0,0,0,0,0,0,0,0,0,0,0,0,0]; }
function pbTabEventos(J){
  var D=pbDet(J); if(!D) return pbPend();
  var tipos=[]; D.ev.items.forEach(function(x){ if(tipos.indexOf(x.tipo)<0) tipos.push(x.tipo); });
  var f=ST.tab.evf||"Todo";
  var L=D.ev.items.filter(function(x){ return f==="Todo"||x.tipo===f; });
  var chips='<div class="row" style="margin-bottom:10px">'+["Todo"].concat(tipos).map(function(t){return '<span class="chip '+(f===t?"on":"")+'" onclick="'+on(function(){ST.tab.evf=t;go()})+'">'+esc(t)+'</span>'}).join("")+'</div>';
  var rows=L.map(function(x){ return [pbFecha(x.t), '<span class="tag">'+esc(x.tipo)+'</span> '+esc(pbEvTexto(x))]; });
  var mas=D.ev.totalItems>D.ev.items.length? '<div style="margin-top:10px">'+btn("Cargar más",function(){pbCargaDet(J.id,true)},"sm")+'</div>' : '';
  return card("Eventos",chips+(rows.length?tl(rows,110):'<p class="mut">Sin eventos.</p>')+mas);
}
function pbTabPartidas(J){
  var D=pbDet(J); if(!D) return pbPend();
  if(!D.snap.length) return card("Partidas guardadas",'<p class="mut">Ninguna partida guardada.</p>');
  var filas=D.snap.map(function(s){ return '<tr><td>'+pbFecha(s.t)+'</td><td class="mut">'+(s.bytes?Math.round(s.bytes/1024)+' kB':'—')+'</td><td><span class="tag ok">'+esc(s.ver||"—")+'</span></td><td class="r">'+btn("Descargar",function(){pbDescargaSnap(J.id,s.id)},"sm")+'</td></tr>'; }).join("");
  return card("Partidas guardadas · las 6 últimas",'<table><tr><th>Cuándo</th><th>Tamaño</th><th>Versión</th><th></th></tr>'+filas+'</table><p class="small mut" style="margin:10px 0 0">El .json es la partida tal como la guardó el juego.</p>');
}
async function pbDescargaSnap(id,sid){
  try{
    var r=await pbApi("/api/collections/tl_snapshots/records/"+sid);
    var blob=new Blob([JSON.stringify(r.save||{},null,1)],{type:"application/json"});
    var a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="partida-"+id+"-"+r.t+".json";
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){URL.revokeObjectURL(a.href)},2000);
  }catch(e){ toast("No se pudo descargar: "+e.message); }
}
function pbDescargaUltima(J){
  var D=PB.det[J.id];
  if(!D||!D.ok){ pbCargaDet(J.id); toast("Cargando partidas…"); return; }
  if(!D.snap.length){ toast("Sin partidas guardadas"); return; }
  pbDescargaSnap(J.id,D.snap[0].id);
}
function pbTabRegalos(J){
  var D=pbDet(J); if(!D) return pbPend();
  var canj=D.can.length? '<table><tr><th>Código</th><th>Cuándo</th></tr>'+D.can.map(function(c){return '<tr><td class="mono">'+esc(c.code)+'</td><td class="mut">'+pbFecha(c.t)+'</td></tr>'}).join("")+'</table>' : '<p class="mut">Ningún código canjeado.</p>';
  return '<div class="grid g2">'+cardOff("Regalos",'<p class="mut">Los regalos enviados todavía no se guardan en el servidor.</p>')+cardOff("Mensajes",'<p class="mut">El juego todavía no recibe mensajes del admin.</p>')+card("Códigos canjeados",canj)+'</div>';
}
function pbTabReportes(J){
  var D=pbDet(J); if(!D) return pbPend();
  var mios=REP.filter(function(r){return r.inst===J.id});
  var errs=D.ev.items.filter(function(x){return x.tipo==="error"});
  return '<div class="grid g2">'+card("Sus reportes", mios.map(function(r){return '<div class="diff"><span>'+r.ic+'</span><span class="p">'+esc(r.x)+'</span><span class="tag">'+r.est+'</span></div>'}).join("")||'<p class="mut">Ninguno.</p>')+card("Sus errores", errs.map(function(x){return '<div class="diff"><span class="p mono small">'+esc(pbResumen(x.d))+'</span><span class="tag">'+pbFecha(x.t)+'</span></div>'}).join("")||'<p class="mut">Ninguno.</p>')+'</div>';
}
function pbTabDispositivo(J){
  return card("Dispositivo",'<div class="diff"><span class="p">Navegador y sistema</span><b>'+esc(J.dev)+'</b></div><div class="diff"><span class="p">Pantalla</span><b>'+esc(J.scr)+'</b></div><div class="diff"><span class="p">Zona horaria</span><b>'+esc(J.tz)+'</b></div><div class="diff"><span class="p">Idioma</span><b>'+esc(J.lang)+'</b></div><div class="diff"><span class="p">Id del navegador</span><b class="mono">'+esc(J.id)+'</b></div><p class="small mut" style="margin:10px 0 0">Si la misma persona juega en dos dispositivos, salen como dos jugadores.</p>'+btn("Fusionar con otro jugador",function(){},"sm"));
}
async function pbBloquea(J,v){
  try{
    await pbApi("/api/collections/tl_players/records/"+J._rid,{method:"PATCH",headers:PB_JSON,body:JSON.stringify({adm_bloqueado:!!v})});
    toast(v?"Bloqueado: ese navegador deja de enviar datos":"Desbloqueado");
    await pbCarga();
  }catch(e){ toast("No se pudo cambiar: "+e.message); }
}
function pbExportaCSV(){
  var cols=["id","nombre","grupo","club","nivel","temporada","jornada","horas","sesiones","version","ultima_vez"];
  var filas=JUG.map(function(j){ var e=j.eq&&CLI[j.eq]; return [j.id,j.n,j.g,e?e.n:"",j.niv,j.temp,j.jor,(j.h||0).toFixed(1).replace(".",","),j.ses,j.ver,j.last]; });
  var csv=[cols].concat(filas).map(function(r){ return r.map(function(v){ v=String(v==null?"":v); return /[";\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v; }).join(";"); }).join("\n");
  var a=document.createElement("a"); a.href=URL.createObjectURL(new Blob(["﻿"+csv],{type:"text/csv"})); a.download="usuarios-goatmaker.csv";
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){URL.revokeObjectURL(a.href)},2000);
}

// pestaña «Vida y tienda»: todo lo que sale de la partida guardada (inventario, compras, decisiones de vida, contrato, atributos)
function pbAtribFicha(J){
  var s=pbSave(J); var ATR={TEC:"Técnica",FIS:"Físico",TAC:"Táctica",DEF:"Defensa",MEN:"Mentalidad"};
  if(!s||!s.attr) return '<p class="mut">Sin partida guardada todavía.</p>';
  return Object.keys(ATR).map(function(k){ return '<div class="diff"><span class="p">'+ATR[k]+'</span><b>'+(s.attr[k]!=null? Math.round(s.attr[k]) : "—")+'</b></div>'; }).join("");
}
function pbArq(J){
  var s=pbSave(J); if(!s) return "—";
  var c=s.car||{};
  var a=pbArqDe(c.disciplina||0, c.ego||0, c.temperamento!=null? c.temperamento : undefined);
  return a? a.n : "—";
}
function pbTabVida(J){
  var D=PB.det[J.id]; var s=pbSave(J);
  if(!s){ return D&&D.ok? card("Vida y tienda",'<p class="mut">Este jugador todavía no tiene partida guardada en el servidor.</p>') : pbPend(); }
  var fila=function(a,b){ return '<div class="diff"><span class="p">'+a+'</span><b>'+b+'</b></div>'; };
  var lista=function(arr,vacio){ return arr.length? arr.map(function(t){ return '<div class="diff small"><span class="p">'+esc(t)+'</span></div>'; }).join("") : '<p class="mut">'+vacio+'</p>'; };
  var ATR={TEC:"Técnica",FIS:"Físico",TAC:"Táctica",DEF:"Defensa",MEN:"Mentalidad"};
  var attr=s.attr? Object.keys(ATR).map(function(k){ return fila(ATR[k], s.attr[k]!=null? Math.round(s.attr[k]) : "—"); }).join("") : '<p class="mut">Sin datos.</p>';
  var own=Object.keys((s.tienda&&s.tienda.own)||{}).map(function(id){ return pbItemNom(id); });
  var serv=Object.keys((s.tienda&&s.tienda.serv)||{}).map(function(id){ return pbItemNom(id)+" · desde la jornada "+(s.tienda.serv[id]); });
  var v=s.vida||{};
  var vida=fila("Fisio personal", v.fisio? "Sí" : "No")+fila("Preparador mental", v.mentor? "Sí" : "No")+fila("Donado a la grada", v.dona? eur(v.dona) : "—");
  var c=s.contrato;
  var contrato=c? fila("Salario", eur(c.salario||0))+fila("Años", c.anos||"—")+fila("Cláusula", c.clausula? eur(c.clausula) : "—")+fila("Firmado en", c.firmadoT||"—") : '<p class="mut">Sin contrato.</p>';
  var tal=0; Object.keys(s.talentos||{}).forEach(function(r){ Object.keys(s.talentos[r]||{}).forEach(function(k){ tal+=(+s.talentos[r][k]||0); }); });
  var estado=fila("Club", (J.eq&&CLI[J.eq])? CLI[J.eq].n : "—")+fila("División", s.division||"—")+fila("Dinero", eur(s.dinero||0))+fila("Ánimo", s.animo!=null? Math.round(s.animo) : "—")+fila("Fama", s.fama!=null? Math.round(s.fama) : "—")+fila("Prensa", s.prensa!=null? Math.round(s.prensa) : "—")+fila("Talentos desbloqueados", tal)+fila("Confianza", s.conf!=null? Math.round(s.conf) : "—");
  var talList=[]; Object.keys(G_TALENTOS).forEach(function(r){ (G_TALENTOS[r].nodes||[]).forEach(function(nd){ var k=(s.talentos&&s.talentos[r]&&s.talentos[r][nd.id])||0; if(k>0) talList.push(G_TALENTOS[r].name+" · "+nd.n+" "+k+"/"+nd.rank); }); });
  var diario=(s.vidaLog||[]).slice(-60).reverse();
  return '<div class="grid g2">'+card("Carrera ahora",estado)+card("Atributos",attr)+card("Contrato",contrato)+card("Vida personal",vida)+
    card("Inventario · bienes ("+own.length+")",lista(own,"Nada comprado todavía."))+card("Servicios activos ("+serv.length+")",lista(serv,"Sin servicios activos."))+
    card("Talentos · "+tal,lista(talList,"Ningún talento desbloqueado todavía."))+card("Decisiones de vida · últimas 60",lista(diario,"Sin movimientos todavía."))+'</div>';
}
