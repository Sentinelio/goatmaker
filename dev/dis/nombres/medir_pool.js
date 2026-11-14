const fs = require('fs'), vm = require('vm');
const src = ['pool_data.js', 'pool_veto.js', 'pool_gen.js'].map(f => fs.readFileSync(f, 'utf8')).join('\n');
const pre = `function hashStr(s){ var h=2166136261; for(var i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return (h>>>0); }
function lcgDe(seed){ var x=(seed>>>0)||1; return function(){ x=(Math.imul(x,1664525)+1013904223)>>>0; return x/4294967296; }; }`;
const ctx = { Math, Object, String, console, S: undefined, rnd: Math.random, PLANTILLAS_REALES: {} }; vm.createContext(ctx); vm.runInContext(pre + src, ctx);
const N = +(process.argv[2] || 300000);
function medir(tipo) {
  const r = ctx.lcgDe(ctx.hashStr('medida:' + tipo)); const cnt = {}, org = {}; let largo = 0, maxl = 0, dobles = 0, comp = 0, vetoRaw = 0, sumLen = 0;
  const V = ctx.NOM_VETO || (ctx.nomVetado('x'), ctx.NOM_VETO);
  for (let i = 0; i < N; i++) {
    const p = ctx.nomConstruir(r, tipo); if (ctx.nomVetado(p.n)) vetoRaw++;
    cnt[p.n] = (cnt[p.n] || 0) + 1; org[p.o] = (org[p.o] || 0) + 1; sumLen += p.n.length; if (p.n.length > maxl) maxl = p.n.length; if (p.a2) dobles++; if (p.pila.indexOf(' ') >= 0) comp++;
  }
  let s2 = 0, dist = 0; for (const k in cnt) { s2 += cnt[k] * (cnt[k] - 1); dist++; }
  const pc = s2 / (N * (N - 1));       // prob. de que dos draws coincidan
  const grupo = { 'España': ['es', 'cat', 'eus', 'gal'], 'Latinoamérica': ['ar', 'lat'], 'Lusófonos': ['br', 'pt'], 'Francia+África fr': ['fr', 'afo'], 'Magreb+África ang.': ['mag', 'afa'], 'Resto de Europa+Japón': ['it', 'ger', 'en', 'bal', 'pl', 'ua', 'ge', 'jp'] };
  const g = Object.entries(grupo).map(([n, ids]) => n + ' ' + (100 * ids.reduce((a, i) => a + (org[i] || 0), 0) / N).toFixed(1) + '%').join(' · ');
  console.log(tipo.padEnd(7), '| N_eff ≈', Math.round(1 / pc), '| distintos en', N, ':', dist, '| esperados repetidos en 600:', (600 * 599 / 2 * pc).toFixed(1), '| en 320 (liga):', (320 * 319 / 2 * pc).toFixed(2), '| 2 plantillas de 16:', (16 * 16 * pc * 100).toFixed(3) + '%');
  console.log('        ', g, '| 2º apellido', (100 * dobles / N).toFixed(1) + '%', '| compuestos', (100 * comp / N).toFixed(1) + '%', '| largo medio', (sumLen / N).toFixed(1), 'máx', maxl, '| vetados en bruto', (100 * vetoRaw / N).toFixed(3) + '%');
}
['jug', 'mister', 'agente'].forEach(medir);
