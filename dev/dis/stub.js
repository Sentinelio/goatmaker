/* ===== ARNÉS · stub.js — DOM mínimo y relojes muertos para correr el juego en Node =====
   Se concatena ANTES del script del juego: cat stub.js lap.js post.js TEST.js > run.js */
var __tid=0, __TIMERS=[];
var __ELS={};
function _CL(){ var set={};
  return { add:function(){ for(var i=0;i<arguments.length;i++) set[arguments[i]]=1; },
    remove:function(){ for(var i=0;i<arguments.length;i++) delete set[arguments[i]]; },
    toggle:function(c,f){ var on=(f===undefined)? !set[c] : !!f; if(on) set[c]=1; else delete set[c]; return on; },
    contains:function(c){ return !!set[c]; } };
}
function _E(id){
  var e={ style:{}, dataset:{}, children:[], childNodes:[], id:id||"", className:"", innerHTML:"", textContent:"", value:"", checked:false,
    disabled:false, onclick:null, scrollTop:0, scrollHeight:0, clientHeight:0, offsetHeight:100, offsetWidth:100,
    classList:_CL(),
    appendChild:function(c){ if(c && c.id) __ELS[c.id]=c; return c; }, removeChild:function(c){ return c; }, remove:function(){}, append:function(){}, prepend:function(){}, insertBefore:function(c){ return c; },
    addEventListener:function(){}, removeEventListener:function(){}, setAttribute:function(){}, getAttribute:function(){ return null; }, removeAttribute:function(){},
    querySelector:function(){ return null; }, querySelectorAll:function(){ return []; }, closest:function(){ return null; },
    getElementsByTagName:function(){ return []; }, getElementsByClassName:function(){ return []; }, contains:function(){ return false; }, cloneNode:function(){ return _E(); },
    focus:function(){}, blur:function(){}, click:function(){}, select:function(){}, scrollIntoView:function(){}, insertAdjacentHTML:function(){},
    getBoundingClientRect:function(){ return {top:0,left:0,width:0,height:0,right:0,bottom:0}; } };
  return e;
}
var document={ getElementById:function(id){ return __ELS[id]||(__ELS[id]=_E(id)); }, createElement:function(){ return _E(); },
  querySelector:function(){ return null; }, querySelectorAll:function(){ return []; }, addEventListener:function(){},
  execCommand:function(){ return true; }, body:_E(), documentElement:_E(), head:_E() };
var window={ addEventListener:function(){}, removeEventListener:function(){}, scrollTo:function(){}, innerWidth:420, innerHeight:900, onerror:null, storage:undefined };
var navigator={ clipboard:{ writeText:function(){ return Promise.resolve(); } }, vibrate:function(){} };
var __LS={}; var localStorage={ getItem:function(k){ return (k in __LS)? __LS[k] : null; }, setItem:function(k,v){ __LS[k]=String(v); }, removeItem:function(k){ delete __LS[k]; } };
var setTimeout=function(fn,ms){ __TIMERS.push({id:++__tid,fn:fn,ms:ms}); return __tid; };
var clearTimeout=function(id){ __TIMERS=__TIMERS.filter(function(t){ return t.id!==id; }); };
var setInterval=function(){ return ++__tid; };
var clearInterval=function(){};
var requestAnimationFrame=function(){ return ++__tid; };
