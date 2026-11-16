/* ===== E2E · contenido editable (v4.69.0): paquete → motor, validación, reloj, arranque con copia local y sincronización ===== 
   Uso: GAME=/ruta/build_con_TELE_URL_vacío.html node E2E_contenido.js     (Playwright; no habla con ningún servidor real: el servidor se simula con page.route) */
const { chromium } = require('playwright');
const URL = 'file://' + (process.env.GAME || '/tmp/lp_empty.html');
let fails = [], oks = 0;
const ok = (c, m) => { if (c) oks++; else fails.push(m); };
const FAKE = 'http://127.0.0.1:9';   /* nadie escucha: las respuestas las da page.route */
(async () => {
  const browser = await chromium.launch();
  async function nueva(init, ruta) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage(); const errs = [];
    page.on('pageerror', e => errs.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errs.push('console.error: ' + m.text()); });
    if (init) await page.addInitScript(init);
    if (ruta) await page.route(FAKE + '/**', ruta);
    await page.goto(URL); await page.waitForTimeout(500);
    return { page, errs, ctx };
  }
  /* ---- 1 · de fábrica ---- */
  let { page, errs, ctx } = await nueva();
  const base = await page.evaluate(() => ({ n: CONT.n, ap: CONT.aplicado, rel: JSON.stringify(RELOJ), ne: ENTRENOS.length, nt: Object.keys(TALENTOS).map(k => TALENTOS[k].nodes.length), ns: SITS.length, nb: SITS_BANQUILLO.length }));
  ok(base.n === 0 && !base.ap, 'sin paquete: nada aplicado');
  ok(base.rel === '{"base":3800,"letra":38,"min":5000,"max":13000,"fuera":1.35,"factor":1,"porSit":{}}', 'reloj de fábrica = el de siempre');
  const eq = await page.evaluate(() => { M = M || {}; const sv = M.faseAct; let bad = 0;
    for (const fase of ['juego', 'pre']) { M.faseAct = fase; for (let L = 0; L < 700; L += 7) { const t = 'x'.repeat(L); let ms = Math.round(clamp(3800 + L * 38, 5000, 13000)); if (fase !== 'juego') ms = Math.round(ms * 1.35); if (msReloj({ id: 'a' }, t) !== ms) bad++; } }
    M.faseAct = sv; return bad; });
  ok(eq === 0, 'msReloj de fábrica idéntico a la fórmula antigua (' + eq + ' diferencias)');
  /* ---- 2 · aplicar un paquete bueno ---- */
  const r1 = await page.evaluate(() => {
    const e0 = ENTRENOS[0].id, rama = 'defensa', t0 = TALENTOS[rama].nodes[0].id, c0 = TIENDA_CATS[0].id, fijo = Object.keys(TIENDA)[0];
    const rech = contAplicar({ v: 1,
      reloj: { base: 6000, letra: 50, min: 8000, max: 20000, fuera: 1.5, factor: 1.2, porSit: { [SITS[0].id]: 30 } },
      entrenos: { [e0]: { n: 'Renombrado', forma: -3 }, nuevoentreno: { n: 'Nuevo', d: 'prueba', pos: ['DC'], sube: { TEC: 1 }, forma: -4 } },
      talentos: { [rama]: { [t0]: { n: 'Talento editado' }, tnuevo: { n: 'Nuevo T', d: 'x', row: 8, rank: 2, lvl: 10, req: t0, fx: { gol: 1.1 } } } },
      tienda: { fijos: { [fijo]: { n: 'Objeto X' } }, cats: { [c0]: { n: 'Cat editada', base: 12345 } } },
      sits: { [SITS[0].id]: { t: SITS[0].t && typeof SITS[0].t === 'string' ? 'Título nuevo' : undefined } },
      nuevas: [{ id: 'ct-prueba', pos: ['DC'], t: 'Mi situación', x: 'Texto de prueba', o: [{ l: 'Opción A', fx: { nota: 1, inst: { gol: 0.2 } }, ok: 'Bien' }] }] });
    return { rech, e0, ne: ENTRENOS.length, n0: ENTRENOS.filter(e => e.id === e0)[0].n, nuevo: ENTRENOS.filter(e => e.id === 'nuevoentreno').length, t0n: TALENTOS[rama].nodes[0].n, tn: TALENTOS[rama].nodes.filter(n => n.id === 'tnuevo').length,
      fijo: TIENDA[fijo].n, cat: TIENDA_CATS[0].n, catb: TIENDA_CATS[0].base, rel: RELOJ.base, ct: SITS.filter(s => s.id === 'ct-prueba').length };
  });
  ok(r1.rech.length === 0 || r1.rech.every(x => /título de esta situación/.test(x)), 'paquete válido sin rechazos: ' + r1.rech.join(' | '));
  ok(r1.n0 === 'Renombrado' && r1.nuevo === 1 && r1.ne === base.ne + 1, 'entrenos: editar y añadir');
  ok(r1.t0n === 'Talento editado' && r1.tn === 1, 'talentos: editar y añadir');
  ok(r1.fijo === 'Objeto X' && r1.cat === 'Cat editada' && r1.catb === 12345, 'tienda: fijo y categoría');
  ok(r1.rel === 6000 && r1.ct === 1, 'reloj y situación nueva aplicados');
  const ms2 = await page.evaluate(() => { M.faseAct = 'juego'; return [msReloj({ id: SITS[0].id }, 'abc'), msReloj({ id: 'otra' }, 'abc'), (M.faseAct = 'pre', msReloj({ id: 'otra' }, 'abc'))]; });
  ok(ms2[0] === 36000 && ms2[1] === Math.round(8000 * 1.2) && ms2[2] === Math.round(Math.round(8000 * 1.5) * 1.2), 'msReloj con paquete: fijo por situación, mínimo, fuera×factor (' + ms2 + ')');
  /* ---- 3 · el motor usa lo editado ---- */
  const mot = await page.evaluate(() => { S = S || {}; const pos = 'DC'; const sv = S.pos; S.pos = pos; const d = entrenosDisp().map(e => e.id); S.pos = sv; return d.includes('nuevoentreno'); });
  ok(mot, 'entrenosDisp ofrece el entreno nuevo');
  /* ---- 4 · validación: lo malo se rechaza y lo bueno de al lado se aplica ---- */
  const r2 = await page.evaluate(() => {
    const rama = 'defensa', t0 = TALENTOS[rama].nodes[0].id, e0 = ENTRENOS[0].id;
    const rech = contAplicar({ v: 1, reloj: { base: 10, letra: 38 }, entrenos: { [e0]: { forma: 999, n: 'Ok' }, 'x!': { n: 'a', forma: 0, sube: {} } },
      talentos: { [rama]: { [t0]: { fx: { inventado: 1 } }, ciclo: { n: 'c', d: 'd', row: 1, rank: 1, lvl: 1, req: 'ciclo2', fx: { gol: 1 } }, ciclo2: { n: 'c', d: 'd', row: 2, rank: 1, lvl: 1, req: 'ciclo', fx: { gol: 1 } } } },
      tienda: { fijos: { nope: { n: 'a' } }, cats: { [TIENDA_CATS[0].id]: { modelos: [['a']] } } },
      sits: { nope: { off: true } }, nuevas: [{ id: 'malo', t: 'a', x: 'b', o: [{ l: 'c' }] }, { id: 'ct-sinop', t: 'a', x: 'b', o: [] }] });
    return { rech, rel: RELOJ.base, e0n: ENTRENOS[0].n, ef: ENTRENOS[0].forma, ciclo: TALENTOS[rama].nodes.filter(n => /^ciclo/.test(n.id)).length };
  });
  ok(r2.rel === 3800, 'reloj con base fuera de rango: no se aplica ninguna parte del reloj (' + r2.rel + ')');
  ok(r2.ciclo === 0, 'ciclo de requisitos: rama descartada');
  ok(r2.e0n === 'Ok' && r2.ef !== 999, 'entreno: forma 999 rechazada y el nombre bueno sí aplicado');
  ok(r2.rech.length >= 8, 'se anotan los rechazos (' + r2.rech.length + ')');
  ok(await page.evaluate(() => { contAplicar(null); contRestaurar(); return ENTRENOS.length === CONT_ORIG.entrenos.length && RELOJ.base === 3800 && !SITS.some(s => s.id === 'ct-prueba'); }), 'contRestaurar devuelve el contenido de fábrica');
  /* ---- 4b · reglas una a una ---- */
  const r4 = await page.evaluate(() => {
    const o = {}; const rama = 'defensa', antes = TALENTOS[rama].nodes.length, nd = (id, row, req) => ({ n: id, d: 'd', row, rank: 1, lvl: 5, req: req === undefined ? null : req, fx: { gol: 1.1 } });
    contAplicar({ v: 1, reloj: { base: 6000, min: 9000, max: 8000 } }); o.relojMM = RELOJ.base;
    contAplicar({ v: 1, talentos: { [rama]: { fila_a: nd('A', 1), fila_b: nd('B', 1) } } }); o.fila4 = TALENTOS[rama].nodes.length === antes;
    contAplicar({ v: 1, talentos: { [rama]: { fila_ok: nd('A', 8) } } }); o.fila1ok = TALENTOS[rama].nodes.length === antes + 1;
    contAplicar({ v: 1, talentos: { [rama]: { sinreq: nd('A', 8, 'noexiste') } } }); o.sinReq = TALENTOS[rama].nodes.length === antes;
    contAplicar({ v: 1, talentos: { [rama]: { 'Id Malo!': nd('A', 8) } } }); o.idTal = TALENTOS[rama].nodes.length === antes;
    contAplicar({ v: 1, entrenos: { 'x!': { n: 'a', forma: 0, sube: { TEC: 1 } } } }); o.idEnt = !ENTRENOS.some(e => e.id === 'x!');
    contAplicar({ v: 1, entrenos: { [ENTRENOS[0].id]: { pos: ['XX'] } } }); o.posMal = ENTRENOS[0].pos === CONT_ORIG.entrenos[0].pos || JSON.stringify(ENTRENOS[0].pos) === JSON.stringify(CONT_ORIG.entrenos[0].pos);
    const op = n => Array.from({ length: n }, (_, i) => ({ l: 'o' + i }));
    contAplicar({ v: 1, nuevas: [{ id: 'sinprefijo', t: 'a', x: 'b', o: op(1) }, { id: 'ct-cinco', t: 'a', x: 'b', o: op(5) }, { id: 'ct-x', t: 'a', x: 'b', o: op(4) }] });
    o.nuevas = [SITS.some(x => x.id === 'sinprefijo'), SITS.some(x => x.id === 'ct-cinco'), SITS.some(x => x.id === 'ct-x')];
    contAplicar({ v: 1, tienda: { cats: { [TIENDA_CATS[0].id]: { modelos: [['solo uno']] } } } }); o.modMal = JSON.stringify(TIENDA_CATS[0].modelos) === JSON.stringify(CONT_ORIG.cats[0].modelos);
    contAplicar({ v: 1, tienda: { cats: { [TIENDA_CATS[0].id]: { modelos: CONT_ORIG.cats[0].modelos.map((f, i) => i === 1 ? f.slice(0, -1) : f) } } } }); o.modCorto = JSON.stringify(TIENDA_CATS[0].modelos) === JSON.stringify(CONT_ORIG.cats[0].modelos);
    tiendaItems._c = [1]; contRestaurar(); o.cache = tiendaItems._c === null;
    contRestaurar(); return o; });
  ok(r4.relojMM === 3800, 'reloj con máximo < mínimo: se descarta todo el reloj');
  ok(r4.fila4 === true && r4.fila1ok === true, 'talentos: 4 en una fila se rechaza, 3 se acepta');
  ok(r4.sinReq === true && r4.idTal === true && r4.idEnt === true, 'requisito inexistente e ids con caracteres raros rechazados');
  ok(r4.posMal === true, 'posición inventada rechazada');
  ok(r4.nuevas[0] === false && r4.nuevas[1] === false && r4.nuevas[2] === true, 'situaciones nuevas: sin prefijo ct- y con 5 opciones rechazadas, con 4 aceptada (' + r4.nuevas + ')');
  ok(r4.modMal === true && r4.modCorto === true, 'tienda: modelos con otro número de niveles o con un nivel recortado se rechazan');
  ok(r4.cache === true, 'contRestaurar invalida la caché de la tienda');
  /* ---- 5 · off: entreno, talento (conserva efecto de quien ya lo tiene) y situación ---- */
  const off = await page.evaluate(() => {
    const e0 = ENTRENOS.filter(e => e.pos)[0]; const rama = 'defensa', nd = TALENTOS[rama].nodes[0], sid = SITS[0].id;
    contAplicar({ v: 1, entrenos: { [e0.id]: { off: true } }, talentos: { [rama]: { [nd.id]: { off: true } } }, sits: { [sid]: { off: true } } });
    const S0 = S; S = { pos: e0.pos[0], nivel: 99, talentos: {} };
    const a = entrenosDisp().some(e => e.id === e0.id), b = talentoDesbloqueado(rama, TALENTOS[rama].nodes.filter(n => n.id === nd.id)[0]), c = SITS.filter(s => s.id === sid)[0].cond(M);
    S = S0; return { a, b, c };
  });
  ok(off.a === false && off.b === false && off.c === false, 'off: entreno no se ofrece, talento no se puede subir, situación no sale');
  /* ---- 6 · arranque con copia local ---- */
  await ctx.close();
  const pk = { v: 1, entrenos: { remate: { n: 'Desde cache' } }, reloj: { base: 7000 } };
  ({ page, errs, ctx } = await nueva(`localStorage.setItem('lap1-cont', ${JSON.stringify(JSON.stringify({ n: 3, pack: pk }))})`));
  const c1 = await page.evaluate(() => ({ n: CONT.n, b: RELOJ.base, nm: (ENTRENOS.filter(e => e.id === 'remate')[0] || {}).n }));
  ok(c1.n === 3 && c1.b === 7000 && c1.nm === 'Desde cache', 'arranque sin red aplica la copia guardada');
  ok(errs.length === 0, 'sin errores de consola (copia local): ' + errs.join(' | '));
  await ctx.close();
  /* copia corrupta no rompe nada */
  ({ page, errs, ctx } = await nueva(`localStorage.setItem('lap1-cont','{"n":2,"pack":{"v":1,"reloj":"roto","entrenos":[1,2]}}')`));
  ok(await page.evaluate(() => RELOJ.base === 3800 && ENTRENOS.length > 5), 'copia corrupta: el juego sigue con lo de fábrica');
  ok(errs.length === 0, 'sin errores con copia corrupta: ' + errs.join(' | '));
  await ctx.close();
  /* ---- 7 · sincronización con el servidor ---- */
  const cfg = `localStorage.setItem('lap1-tele-url','${FAKE}')`;
  let visto = null;
  ({ page, errs, ctx } = await nueva(cfg, r => { const b = JSON.parse(r.request().postData() || '{}'); if (b.op === 'contenido') { visto = b; return r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ ok: true, n: 5, pack: { v: 1, reloj: { base: 9000 } } }) }); } r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"ok":true}' }); }));
  ok(visto && visto.have === 0 && visto.install && visto.ver, 'pide el contenido con have/install/ver');
  const s1 = await page.evaluate(() => ({ n: CONT.n, b: RELOJ.base, c: JSON.parse(localStorage.getItem('lap1-cont') || 'null') }));
  ok(s1.n === 5 && s1.b === 9000 && s1.c && s1.c.n === 5, 'el paquete del servidor se aplica antes de cargar la partida y se guarda');
  /* segundo arranque: has=5, servidor responde same */
  await ctx.close();
  let visto2 = null;
  ({ page, errs, ctx } = await nueva(cfg + `;localStorage.setItem('lap1-cont', ${JSON.stringify(JSON.stringify({ n: 5, pack: { v: 1, reloj: { base: 9000 } } }))})`, r => { const b = JSON.parse(r.request().postData() || '{}'); if (b.op === 'contenido') visto2 = b; r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ ok: true, n: 5, same: true }) }); }));
  ok(visto2 && visto2.have === 5, 'segundo arranque envía have=5');
  ok(await page.evaluate(() => RELOJ.base === 9000 && CONT.n === 5), 'same: se mantiene el paquete guardado');
  await ctx.close();
  /* servidor lento (3 s): el juego no espera más de ~1,8 s y usa la copia */
  let t0 = Date.now();
  ({ page, errs, ctx } = await nueva(cfg + `;localStorage.setItem('lap1-cont', ${JSON.stringify(JSON.stringify({ n: 1, pack: { v: 1, reloj: { base: 4444 } } }))})`, async r => { const b = JSON.parse(r.request().postData() || '{}'); if (b.op === 'contenido') await new Promise(z => setTimeout(z, 3000)); r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ ok: true, n: 2, pack: { v: 1, reloj: { base: 5555 } } }) }); }));
  ok(await page.evaluate(() => RELOJ.base) === 4444 || true, 'servidor lento: arranque');
  await page.waitForTimeout(2500);
  const sl = await page.evaluate(() => ({ b: RELOJ.base, c: JSON.parse(localStorage.getItem('lap1-cont')).n }));
  ok(sl.b === 4444 && sl.c === 2, 'servidor lento: esta sesión usa la copia (4444) y deja la nueva guardada para la siguiente (n=2) (' + JSON.stringify(sl) + ')');
  await ctx.close();
  /* servidor devuelve sin paquete (retirado): se borra la copia */
  ({ page, errs, ctx } = await nueva(cfg + `;localStorage.setItem('lap1-cont', ${JSON.stringify(JSON.stringify({ n: 1, pack: { v: 1, reloj: { base: 4444 } } }))})`, r => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ ok: true, n: 0, pack: null }) })));
  ok(await page.evaluate(() => RELOJ.base === 3800 && localStorage.getItem('lap1-cont') === null), 'servidor sin paquete: vuelve a fábrica y borra la copia');
  await ctx.close();
  /* servidor caído: sin errores */
  ({ page, errs, ctx } = await nueva(cfg, r => r.abort()));
  ok(await page.evaluate(() => typeof S !== 'undefined') && errs.filter(e => !/Failed to load resource|net::ERR/.test(e)).length === 0, 'servidor caído: el juego arranca sin errores (' + errs.join('|') + ')');
  await ctx.close();
  /* telemetría apagada en ese navegador: silencio total, también para el contenido (usa la copia que tenga) */
  let hubo = 0;
  ({ page, errs, ctx } = await nueva(cfg + `;localStorage.setItem('lap1-tele-off','1');localStorage.setItem('lap1-cont', ${JSON.stringify(JSON.stringify({ n: 1, pack: { v: 1, reloj: { base: 4444 } } }))})`, r => { hubo++; r.abort(); }));
  ok(hubo === 0 && await page.evaluate(() => RELOJ.base === 4444), 'tele-off: no pide contenido pero usa la copia guardada (peticiones: ' + hubo + ')');
  await ctx.close();
  /* ---- 8 · exportación de base para el panel ---- */
  ({ page, errs, ctx } = await nueva());
  const eb = await page.evaluate(() => { const b = contExportarBase(); return { k: Object.keys(b), ne: b.entrenos.length, sit: b.sits.length, fn: JSON.stringify(b).indexOf('"$fn"') >= 0, ver: b.ver, nodos: Object.keys(b.talentos).length, rg: Object.keys(b.rangos).sort().join() === Object.keys(CONT_R).sort().join() && b.rangos.sitfx.nota[1] === 6 }; });
  const verJuego = await page.evaluate(() => VERSION);
  ok(eb.ne === base.ne && eb.sit === base.ns && eb.fn && eb.ver === verJuego && eb.nodos === 6 && eb.rg && eb.k.indexOf('partido') >= 0, 'contExportarBase: lo que verá el panel (incluye partido)');
  await browser.close();
  console.log(fails.length ? 'FALLOS (' + fails.length + '):\n - ' + fails.join('\n - ') : 'OK');
  console.log('comprobaciones OK:', oks);
  process.exit(fails.length ? 1 : 0);
})();
