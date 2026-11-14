const fs = require('fs'), vm = require('vm');
const src = ['pool_data.js', 'pool_veto.js', 'pool_gen.js'].map(f => fs.readFileSync(f, 'utf8')).join('\n');
const pre = `function hashStr(s){ var h=2166136261; for(var i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return (h>>>0); }
function lcgDe(seed){ var x=(seed>>>0)||1; return function(){ x=(Math.imul(x,1664525)+1013904223)>>>0; return x/4294967296; }; }`;
const ctx = { Math, Object, String, console, S: undefined, rnd: Math.random, PLANTILLAS_REALES: undefined }; vm.createContext(ctx); vm.runInContext(pre + src, ctx);
const seed = +(process.argv[2] || 1);
function lista(tipo, n) { const r = ctx.lcgDe(ctx.hashStr('muestra:' + tipo + ':' + seed)); const o = []; for (let i = 0; i < n; i++) { const p = ctx.genPersonaD(r, tipo); o.push(p.n + (p.o !== 'es' ? ' [' + p.po + (p.ao !== p.po ? '/' + p.ao : '') + ']' : '')); } return o; }
console.log('JUGADORES:\n' + lista('jug', 90).join(' · '));
console.log('\nMÍSTER:\n' + lista('mister', 30).join(' · '));
console.log('\nAGENTES:\n' + lista('agente', 18).join(' · '));
const r = ctx.lcgDe(7); const m = []; for (let i = 0; i < 12; i++) m.push(['Talleres', 'Conservas', 'Deportes', 'Cervezas'][i % 4] + ' ' + ctx.genApellido(r)); console.log('\nMARCAS LOCALES:\n' + m.join(' · '));
