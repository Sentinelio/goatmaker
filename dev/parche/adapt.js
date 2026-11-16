/* ===== ADAPTACIÓN AL SERVIDOR REAL (Goatmaker) =====
   Sustituye los datos de ejemplo por PocketBase. Lo que no está integrado queda atenuado (clase .off, deshabilitado). */
var PB_URL="https://server-pc.tail3b4002.ts.net:8447";
CUR_VER="4.69.7";   /* versión actual del juego: el filtro «Versión antigua» compara con esto */
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
    JUG.push({id:p.install,_rid:p.id,n:pbNombre(p),g:pbGrupoNom(p.adm_grupo),ver:p.ver||"—",eq:pbClub(e.club_n),pos:"—",niv:e.nivel||0,temp:e.temporada||0,jor:e.jornada||0,med:e.nota||0,edad:0,last:lt?pbFecha(lt):"—",lastN:lt?(now-lt)/36e5:9999,h:(p.active_s||0)/3600,ses:p.sessions||0,st:(lt&&now-lt<120000)?"on":"",din:0,arq:"—",dev:p.ua?pbDisp(p.ua):"—",tz:"—",nota:p.adm_nota||""});
  });
  COD.length=0;
  PB.raw.cod.forEach(function(c){ COD.push({_rid:c.id,raw:c.code,c:pbCod(c.code),fx:(c.efectos||[]).map(function(x){return [x.k,x.v]}),u:c.usos||0,max:c.max_usos||0,cad:c.hasta?new Date(c.hasta).toISOString().slice(0,10):"",uno:!!c.una_por_jugador,on:!!c.activo,nota:c.nota||""}); });
  REP.length=0;
  PB.raw.rep.forEach(function(r){ var p=PB.byInst[r.install],T=PB_RT[r.tipo]||PB_RT.otro,cx=r.ctx||{},e=cx.estado||{};
    REP.push({_rid:r.id,ic:T[0],tipo:T[1],de:pbNombre(p)||r.install.slice(0,8),x:r.texto||"",est:r.estado||"nuevo",t:pbFecha(r.t),ctx:(cx.ver?"v"+cx.ver:"v?")+(e.club_n?" · "+e.club_n+" · T"+(e.temporada||0)+" J"+(e.jornada||0):""),save:!!cx.adjunta,nota:r.nota_admin||""});
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
  pbAdapta(); go();
}
async function pbEntra(){
  $("l-err").textContent="";
  try{
    var r=await fetch(PB_URL+"/api/collections/_superusers/auth-with-password",{method:"POST",headers:PB_JSON,body:JSON.stringify({identity:$("l-mail").value.trim(),password:$("l-pass").value})});
    var j=await r.json(); if(!r.ok) throw new Error(j.message||r.status);
    PB.tok=j.token; try{sessionStorage.setItem("gm-adm",JSON.stringify({u:PB_URL,t:j.token}))}catch(e){}
    $("l-pass").value=""; pbMuestra(); await pbCarga();
  }catch(e){ $("l-err").textContent="No se pudo entrar: "+e.message; }
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
function pbConfirmaBorrar(ids){ return function(){ return '<h2>Borrar datos de '+ids.length+' usuario'+(ids.length===1?'':'s')+'</h2>'+
  '<p class="mut">Se borran del servidor sus sesiones, eventos, partidas guardadas y su fila de jugador. Los reportes y los canjes se conservan. No se puede deshacer.</p>'+
  '<p class="mut small">El progreso de la carrera vive en el navegador del jugador y no se borra. Si ese navegador vuelve a jugar, aparecerá como usuario nuevo.</p>'+
  '<div class="f"><label>Escribe BORRAR para confirmar</label><input type="text" id="bd-conf" placeholder="BORRAR"><div class="fab"></div></div>'+
  '<p class="small errt" id="bd-msg"></p>'+
  '<div class="row" style="justify-content:flex-end;margin-top:14px">'+btn("Cancelar",function(){modal()})+btn("Confirmar",function(){pbBorra(ids)},"red")+'</div>'; }; }
async function pbBorra(ids){
  var m=$("bd-msg"); m.textContent="";
  if(($("bd-conf").value||"").trim().toUpperCase()!=="BORRAR"){ m.textContent="Escribe BORRAR para confirmar."; return; }
  try{
    for(var k=0;k<ids.length;k++){
      var id=ids[k], f="fields=id&filter="+encodeURIComponent("install='"+id+"'");
      var cols=["tl_events","tl_sessions","tl_snapshots"];
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
