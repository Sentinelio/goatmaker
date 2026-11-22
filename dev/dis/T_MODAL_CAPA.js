/* la ventana de confirmación debe quedar por encima de cualquier otra pantalla a pantalla completa (ofertas, partido, fin de temporada) */
var fs=require("fs"), src=fs.readFileSync(process.env.HTML,"utf8");
var ok=0,ko=0; function t(c,m){ if(c) ok++; else { ko++; console.log("✘ "+m); } }
var zOverlay=+(src.match(/\.overlay\{[^}]*?z-index:(\d+)/)||[])[1];
var zModal=+(src.match(/#ov-modal\{[^}]*?z-index:(\d+)/)||[])[1];
t(zOverlay>0,"el overlay base tiene z-index");
t(zModal>zOverlay,"#ov-modal queda por encima de ov-match y ov-fin ("+zModal+" > "+zOverlay+")");
var otros=[].concat(src.match(/#ov-(?!modal)\w+\{[^}]*?z-index:(\d+)/g)||[]).map(function(x){ return +x.match(/z-index:(\d+)/)[1]; });
t(otros.every(function(z){ return z<zModal; }),"y por encima de cualquier otro ov-* con z-index propio");
console.log("CAPA_MODAL: "+ok+" ok · "+ko+" fallos");
