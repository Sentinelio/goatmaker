/* Aviso de nueva versión del panel: compara el contenido de los archivos del admin con el que se abrió la página.
   Si cambia algo en el servidor, muestra un banner con «Recargar» y «×». */
(function(){
  var FILES=["index.html","admin-core.js","widgets.js"];
  var base=null, pendiente=null, cerrada=null, CADA_MIN=2;
  function hashOf(texts){
    var buf=new TextEncoder().encode(texts.join("\u0000"));
    return crypto.subtle.digest("SHA-256",buf).then(function(d){
      return Array.from(new Uint8Array(d)).map(function(b){ return b.toString(16).padStart(2,"0"); }).join("");
    });
  }
  function leerTodo(){
    return Promise.all(FILES.map(function(f){
      return fetch(f+"?t="+Date.now(),{cache:"no-store"}).then(function(r){ if(!r.ok) throw new Error(f); return r.text(); });
    }));
  }
  function mostrar(){
    if(document.getElementById("updbar")) return;
    var bar=document.createElement("div");
    bar.id="updbar";
    bar.setAttribute("style","position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;gap:12px;padding:10px 16px;background:#FFC24B;color:#241800;font-weight:600;font-size:14px;box-shadow:0 2px 12px #0008;");
    bar.innerHTML='<span style="flex:1">Hay una nueva versión del panel. Recarga para usarla.</span>'+
      '<button id="updReload" style="all:unset;cursor:pointer;padding:6px 14px;border-radius:8px;background:#241800;color:#FFC24B;font-weight:700">Recargar</button>'+
      '<button id="updX" aria-label="Cerrar" style="all:unset;cursor:pointer;padding:2px 10px;font-size:20px;line-height:1">×</button>';
    document.body.appendChild(bar);
    document.getElementById("updReload").onclick=function(){ location.reload(); };
    document.getElementById("updX").onclick=function(){ cerrada=pendiente; bar.remove(); };
  }
  function comprobar(){
    return leerTodo().then(hashOf).then(function(h){
      if(base===null){ base=h; return; }
      if(h===base) return;
      pendiente=h;
      if(h!==cerrada) mostrar();
    }).catch(function(){});
  }
  comprobar();
  setInterval(comprobar, CADA_MIN*60*1000);
  document.addEventListener("visibilitychange", function(){ if(!document.hidden) comprobar(); });
})();
