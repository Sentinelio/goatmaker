/* validar_pool.js — lee pool_data.js + pool_veto.js + pool_gen.js y audita el pool sin cargar el juego */
const fs = require('fs'), vm = require('vm');
const dir = process.argv[2] || '.';
const src = ['pool_data.js', 'pool_veto.js', 'pool_gen.js'].map(f => fs.readFileSync(dir + '/' + f, 'utf8')).join('\n');
const ctx = { Math, Object, String, console, PLANTILLAS_REALES: undefined, S: undefined, rnd: Math.random };
vm.createContext(ctx);
try { vm.runInContext(src + '\n;this.__ok=1;', ctx); } catch (e) { console.log('ERROR al cargar:', e.message); process.exit(1); }
const O = ctx.NOM_ORIG, D = ctx.NOM_DATA;
const RE = /^[A-ZÁÉÍÓÚÑÜÇÀÈÌÒÙÂÊÎÔÛÄËÏÖÃÕ][A-Za-zÁÉÍÓÚÑÜÇÀÈÌÒÙÂÊÎÔÛÄËÏÖÃÕáéíóúñüçàèìòùâêîôûäëïöãõ]*( [A-ZÁÉÍÓÚÑÜa-z][A-Za-zÁÉÍÓÚÑÜÇÀÈÌÒÙÂÊÎÔÛÄËÏÖÃÕáéíóúñüçàèìòùâêîôûäëïöãõ]*)*$/;
let malos = [], tot = { n: 0, a: 0, jov: 0, vet: 0 };
console.log('origen  jov  vet   ape  comp | dup  largos');
for (const id of Object.keys(O)) {
  const o = O[id], lst = { jov: o.jov, vet: o.vet, ape: o.ape, comp: o.comp };
  let dups = [], largos = [];
  for (const k of ['jov', 'ape', 'comp']) {
    const seen = {};
    for (const t of lst[k]) {
      const key = t.toLowerCase();
      if (seen[key]) dups.push(k + ':' + t); seen[key] = 1;
      if (!RE.test(t)) malos.push(id + '/' + k + ': «' + t + '»');
      if (k === 'jov' && t.length > 11) largos.push(t);
      if (k === 'ape' && t.length > 15) largos.push(t);
      if (t.length < 2) malos.push(id + '/' + k + ' corto «' + t + '»');
    }
  }
  const seenV = {}; for (const t of o.vet) { if (seenV[t.toLowerCase()]) dups.push('vet:' + t); seenV[t.toLowerCase()] = 1; }
  console.log(id.padEnd(6), String(o.jov.length).padStart(4), String(o.vet.length).padStart(4), String(o.ape.length).padStart(5), String(o.comp.length).padStart(5), '|', dups.length ? 'DUP ' + dups.join(',') : '  -', largos.length ? ' LARGOS ' + largos.join(',') : '');
  tot.jov += o.jov.length; tot.a += o.ape.length;
}
const pila = new Set(), ape = new Set();
for (const id of Object.keys(O)) { O[id].jov.concat(O[id].vet).forEach(x => pila.add(x)); O[id].ape.forEach(x => ape.add(x)); }
console.log('\nnombres de pila distintos (todas las listas):', pila.size, '· apellidos distintos:', ape.size, '· apellidos totales (suma por origen):', tot.a);
console.log('tokens mal formados:', malos.length ? malos.join(' | ') : 'ninguno');
const V = ctx.NOM_VETADOS.split('|'); console.log('vetados:', V.length, '· únicos:', new Set(V.map(ctx.nomClave)).size);
// perfiles
for (const p of Object.keys(ctx.NOM_PERFIL)) { const P = ctx.NOM_PERFIL[p]; const bad = P.ids.filter(i => !O[i]); if (bad.length) console.log('perfil', p, 'referencia orígenes que no existen:', bad); }
for (const id of Object.keys(O)) { for (const m of O[id].ma.concat(O[id].mn)) if (!O[m[0]]) console.log('mezcla a origen inexistente en', id, m); }
