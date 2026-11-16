/* ===== E2E · Panel admin: pestaña Contenido, con el juego real en el otro extremo — v4.69.0 =====
   Uso:  cd <carpeta de trabajo>; PB=/ruta/pocketbase GAME=/ruta/juego_con_TELE_URL_vacío.html node E2E_panel_contenido.js
   Ciclo: el admin edita reloj, entrenos, talentos, tienda y situaciones desde la interfaz → guarda borrador → publica → el JUEGO (con otro navegador,
   contra el PocketBase real) lo recibe al arrancar y el motor cambia SIN ningún rechazo; modo en vivo; historial y vuelta atrás; validación de rangos del panel;
   y la base embebida en el panel es exactamente el contenido de fábrica del juego probado. */
const { chromium } = require('playwright');
const { spawn, spawnSync } = require('child_process');
const fs = require('fs'), os = require('os'), path = require('path');
const PB = process.env.PB || '/tmp/pbtest/pocketbase', TEL = process.env.TELEDIR || '/mnt/user-data/outputs/telemetria', GAME = process.env.GAME || '/tmp/lp_empty.html';
const ADM = process.env.ADMIN || (TEL + '/goatmaker-admin.html'), PORT = 18095, BASE = 'http://127.0.0.1:' + PORT, KEY = 'k-test';
let fails = [], oks = 0; const ok = (c, m) => { if (c) oks++; else fails.push(m); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pbcont_'));
  fs.cpSync(TEL + '/pb_migrations', dir + '/pb_migrations', { recursive: true }); fs.cpSync(TEL + '/pb_hooks', dir + '/pb_hooks', { recursive: true });
  const base = ['--dir', dir + '/pb_data', '--migrationsDir', dir + '/pb_migrations', '--hooksDir', dir + '/pb_hooks'];
  spawnSync(PB, ['superuser', 'upsert', 'a@t.local', 'testpass1234', ...base]);
  const srv = spawn(PB, ['serve', '--http', '127.0.0.1:' + PORT, ...base], { env: { ...process.env, TELE_KEY: KEY }, stdio: 'ignore' });
  for (let i = 0; i < 40; i++) { try { if ((await fetch(BASE + '/api/health')).ok) break; } catch (e) {} await sleep(250); }
  const browser = await chromium.launch(); const errs = [];
  const mon = p => { p.on('pageerror', e => errs.push('pageerror: ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/fonts\.|ERR_TUNNEL|Failed to load resource|net::/.test(m.text())) errs.push('console.error: ' + m.text()); }); };
  const jugador = async () => { const c = await browser.newContext({ viewport: { width: 390, height: 844 } }); const g = await c.newPage(); mon(g);
    await g.addInitScript(`localStorage.setItem('lap1-tele-url','${BASE}');localStorage.setItem('lap1-tele-key','${KEY}');`);
    await g.goto('file://' + GAME); await g.waitForTimeout(900); return { g, c }; };
  const estado = g => g.evaluate(() => ({ n: CONT.n, rech: CONT.rech.slice(), rel: RELOJ.base, ls: localStorage.getItem('lap1-cont') ? JSON.parse(localStorage.getItem('lap1-cont')).n : null }));

  /* —— admin —— */
  const actx = await browser.newContext({ viewport: { width: 1280, height: 900 } }); const a = await actx.newPage(); mon(a);
  a.on('dialog', d => d.accept());
  await a.goto('file://' + ADM); await a.evaluate(u=>{window.PB_URL=u},BASE); await a.fill('#l-mail', 'a@t.local'); await a.fill('#l-pass', 'testpass1234'); await a.click('#l-go');
  await a.waitForSelector('#nav button', { timeout: 8000 }); await a.waitForTimeout(500);
  const setf = async (sel, v) => { await a.fill(sel, String(v)); await a.dispatchEvent(sel, 'change'); await a.waitForTimeout(80); };
  const chk = async (sel, on) => { await a.setChecked(sel, on); await a.waitForTimeout(80); };
  ok((await a.$$eval('#nav button', b => b.map(x => x.innerText.trim()))).some(x => /^Publicación/.test(x)), 'P0 el menú tiene Publicación (Contenido)');
  /* la base del panel == contenido de fábrica del juego */
  const g0 = await jugador();
  const baseJuego = await g0.g.evaluate(() => JSON.stringify(contExportarBase()));
  const basePanel = await a.evaluate(() => JSON.stringify(BASE));
  ok(baseJuego === basePanel, 'P1 la base embebida en el panel es idéntica al contenido de fábrica del juego (panel ' + basePanel.length + ' B, juego ' + baseJuego.length + ' B)');
  const B = JSON.parse(baseJuego);
  ok((await estado(g0.g)).n === 0, 'P2 sin nada publicado el juego se queda de fábrica');
  await g0.c.close();

  await a.click('nav button[data-t=contenido]'); await a.waitForSelector('[data-cs=pub]', { timeout: 5000 });
  ok(/Modo publicado/.test(await a.innerText('#main')) && /0 cambio/.test(await a.innerText('#main')), 'P3 arranca en modo publicado y sin cambios');

  /* —— reloj —— */
  await a.click('[data-cs=reloj]');
  await setf('[data-cp="reloj|base"]', 10); ok(/Fuera de rango/.test(await a.innerText('#ce-msg')) && (await a.inputValue('[data-cp="reloj|base"]')) === '3800', 'P4 un valor fuera de rango se rechaza y el campo vuelve a su valor');
  await setf('[data-cp="reloj|base"]', 6000); await setf('[data-cp="reloj|letra"]', 50); await setf('[data-cp="reloj|min"]', 8000); await setf('[data-cp="reloj|max"]', 20000); await setf('[data-cp="reloj|fuera"]', 1.5); await setf('[data-cp="reloj|factor"]', 1.2);
  const sitA = B.sits.find(s => typeof s.t === 'string' && typeof s.x === 'string' && s.o.length >= 2 && s.o.every(o => typeof o.l === 'string') && !s.core);
  await a.selectOption('#ce-ps', sitA.id); await a.click('[data-ce=add-ps]'); await setf('[data-cp="reloj|porSit|' + sitA.id + '"]', 30);
  ok(/6\.0|7\.2/.test(await a.innerText('#main')), 'P5 la tabla de ejemplo se recalcula');

  /* —— entrenos —— */
  await a.click('[data-cs=ent]');
  const e0 = B.entrenos[0], e1 = B.entrenos.find(e => e.pos);
  await setf('[data-cp="entrenos|' + e0.id + '|n"]', 'Entreno renombrado'); await setf('[data-cp="entrenos|' + e0.id + '|forma"]', -2);
  await chk('[data-cp="entrenos|' + e1.id + '|off"]', true);
  await a.fill('#ce-ne-id', 'sprint'); await a.fill('#ce-ne-n', 'Sprints cortos'); await a.selectOption('#ce-ne-a', 'FIS'); await a.fill('#ce-ne-v', '0.9'); await a.click('[data-ce=nuevo-ent]'); await a.waitForTimeout(150);
  await setf('[data-cp="entrenos|sprint|pos"]', 'dc, ext');
  await a.fill('#ce-ne-id', 'sprint'); await a.fill('#ce-ne-n', 'x'); await a.click('[data-ce=nuevo-ent]'); ok(/repetido/.test(await a.innerText('#ce-msg')), 'P6 id de entreno repetido se rechaza');
  await setf('[data-cp="entrenos|' + e0.id + '|sube|TEC"]', 99); ok(/Fuera de rango/.test(await a.innerText('#ce-msg')), 'P6b atributo fuera de rango rechazado');

  /* —— talentos —— */
  await a.click('[data-cs=tal]');
  const n0 = B.talentos.defensa.nodes[1];
  await setf('[data-cp="talentos|defensa|' + n0.id + '|n"]', 'Talento renombrado'); await setf('[data-cp="talentos|defensa|' + n0.id + '|lvl"]', 12);
  await a.fill('#ce-nt-id', 'muro'); await a.fill('#ce-nt-n', 'Muro'); await a.fill('#ce-nt-d', 'Cierras el área.'); await a.fill('#ce-nt-row', '5'); await a.fill('#ce-nt-req', B.talentos.defensa.nodes.find(n => n.row === 4).id); await a.selectOption('#ce-nt-fx', 'fx|golR'); await a.fill('#ce-nt-v', '0.9'); await a.click('[data-ce=nuevo-tal]'); await a.waitForTimeout(150);
  ok(await a.$('[data-cp="talentos|defensa|muro|n"]') !== null, 'P7 el talento nuevo aparece en la rama');
  await a.fill('#ce-nt-id', 'malo'); await a.fill('#ce-nt-n', 'a'); await a.fill('#ce-nt-d', 'b'); await a.fill('#ce-nt-req', 'noexiste'); await a.click('[data-ce=nuevo-tal]'); ok(/no existe/.test(await a.innerText('#ce-msg')), 'P7b requisito inexistente rechazado');
  const nOff = B.talentos.defensa.nodes[0]; await chk('[data-cp="talentos|defensa|' + nOff.id + '|off"]', true);
  await a.selectOption('[data-cadd]:near([data-cp="talentos|defensa|' + n0.id + '|n"])', 'x').catch(() => {});

  /* —— tienda —— */
  await a.click('[data-cs=tie]');
  const fijo = Object.keys(B.tienda)[0], cat = B.cats[0];
  await setf('[data-cp="tienda|fijos|' + fijo + '|n"]', 'Objeto editado');
  await setf('[data-cp="tienda|cats|' + cat.id + '|n"]', 'Categoría editada'); await setf('[data-cp="tienda|cats|' + cat.id + '|base"]', 250);
  const mod = cat.modelos.map((f, i) => i === 0 ? f.concat(['Modelo nuevo']).join(', ') : f.join(', ')).join('\n');
  await a.fill('[data-cp="tienda|cats|' + cat.id + '|modelos"]', mod); await a.dispatchEvent('[data-cp="tienda|cats|' + cat.id + '|modelos"]', 'change'); await a.waitForTimeout(100);
  await a.fill('[data-cp="tienda|cats|' + cat.id + '|modelos"]', 'solo una línea'); await a.dispatchEvent('[data-cp="tienda|cats|' + cat.id + '|modelos"]', 'change'); ok(/líneas/.test(await a.innerText('#ce-msg')), 'P8 modelos: cambiar el número de niveles se rechaza');

  /* —— situaciones —— */
  await a.click('[data-cs=sit]'); await a.click('[data-cx="' + sitA.id + '"]');
  await setf('[data-cp="sits|' + sitA.id + '|t"]', 'Título editado'); await a.fill('[data-cp="sits|' + sitA.id + '|x"]', 'Texto editado de la situación.'); await a.dispatchEvent('[data-cp="sits|' + sitA.id + '|x"]', 'change');
  await setf('[data-cp="sits|' + sitA.id + '|o|0|l"]', 'Botón editado'); await a.fill('[data-cp="sits|' + sitA.id + '|o|0|ok"]', 'Salió de lujo.'); await a.dispatchEvent('[data-cp="sits|' + sitA.id + '|o|0|ok"]', 'change');
  const nota0 = sitA.o[0].fx.nota; await setf('[data-cp="sits|' + sitA.id + '|o|0|fx|nota"]', Math.min(6, (nota0 || 0) + 1));
  const sitB = B.sits.find(s => s.id !== sitA.id && !s.core && !s.unico); await a.click('[data-cx="' + sitB.id + '"]'); await chk('[data-cp="sits|' + sitB.id + '|off"]', true);
  await a.click('[data-ce=nueva-sit]'); await a.waitForTimeout(150);
  if (process.env.DBG) console.log('DBG', await a.evaluate(() => JSON.stringify({ sit: CE.sit, sub: CE.sub, n: CE.pack.nuevas, msg: CE.msg })), await a.innerText('#ce-msg'));
  await setf('[data-cp="nuevas|0|t"]', 'Mi situación'); await a.fill('[data-cp="nuevas|0|x"]', 'Pasa algo nuevo en el campo.'); await a.dispatchEvent('[data-cp="nuevas|0|x"]', 'change');
  await setf('[data-cp="nuevas|0|o|0|fx|nota"]', 2);
  ok(/sin guardar/.test(await a.innerText('#main')), 'P9 el panel avisa de que hay cambios sin guardar');

  /* —— publicación —— */
  await a.click('[data-cs=pub]');
  const nCamb = parseInt((await a.innerText('#main')).match(/(\d+) cambio/)[1]); ok(nCamb >= 20, 'P10 el resumen cuenta los cambios (' + nCamb + ')');
  ok((await a.innerText('#main')).includes('Título editado') && (await a.innerText('#main')).includes('Entreno renombrado'), 'P10b la lista de cambios los muestra');
  /* guardar el borrador NO cambia al jugador en modo publicado */
  await a.click('[data-ce=guardar]'); await a.waitForTimeout(500);
  let J = await jugador(); ok((await estado(J.g)).n === 0, 'P11 modo publicado: guardar el borrador no llega al jugador'); await J.c.close();
  await a.fill('#ce-nota', 'primera de prueba'); await a.click('[data-ce=publicar]'); await a.waitForTimeout(700);
  ok(/v1/.test(await a.innerText('#main')) && /vigente/.test(await a.innerText('#main')), 'P12 la versión 1 queda publicada y vigente');
  J = await jugador(); let st = await estado(J.g);
  ok(st.n === 1 && st.rel === 6000 && st.ls === 1, 'P13 el juego recibe la versión 1 al arrancar (' + JSON.stringify(st) + ')');
  ok(st.rech.length === 0, 'P14 el motor NO rechaza nada de lo que produce el panel: ' + st.rech.join(' | '));
  const v = await J.g.evaluate((q) => { const e0 = ENTRENOS.find(e => e.id === q.e0), e1 = ENTRENOS.find(e => e.id === q.e1), sp = ENTRENOS.find(e => e.id === 'sprint');
    const nd = TALENTOS.defensa.nodes.find(n => n.id === q.n0), mu = TALENTOS.defensa.nodes.find(n => n.id === 'muro'), no = TALENTOS.defensa.nodes.find(n => n.id === q.nOff);
    const c = TIENDA_CATS.find(x => x.id === q.cat), sa = SITS.find(s => s.id === q.sitA), sb = SITS.find(s => s.id === q.sitB), ct = SITS.find(s => s.id === 'ct-1');
    S = { pos: 'DC', nivel: 99, talentos: {} }; M = { faseAct: 'juego' };
    return { e0: [e0.n, e0.forma], off: !!e1.off, offDisp: entrenosDisp().some(e => e.id === q.e1), sp: sp && [sp.n, sp.sube.FIS, sp.pos.join()], spDisp: entrenosDisp().some(e => e.id === 'sprint'),
      nd: [nd.n, nd.lvl], mu: mu && [mu.n, mu.fx.golR, mu.row, mu.req], noOff: !!no.off, noUp: talentoDesbloqueado('defensa', no),
      fijo: TIENDA[q.fijo].n, cat: [c.n, c.base, c.modelos[0].length], sa: [sa.t, sa.x, sa.o[0].l, sa.o[0].ok, sa.o[0].fx.nota], sbCond: sb.cond(M, {}), ct: ct && [ct.t, ct.o.length, ct.o[0].fx.nota],
      reloj: msReloj({ id: q.sitA }, 'abc') };
  }, { e0: e0.id, e1: e1.id, n0: n0.id, nOff: nOff.id, cat: cat.id, fijo, sitA: sitA.id, sitB: sitB.id });
  ok(v.e0[0] === 'Entreno renombrado' && v.e0[1] === -2, 'P15 entreno editado en el motor');
  ok(v.off && !v.offDisp, 'P16 entreno fuera de catálogo no se ofrece');
  ok(v.sp && v.sp[0] === 'Sprints cortos' && v.sp[1] === 0.9 && v.sp[2] === 'DC,EXT' && v.spDisp, 'P17 entreno nuevo creado en el panel funciona en el motor ' + JSON.stringify(v.sp));
  ok(v.nd[0] === 'Talento renombrado' && v.nd[1] === 12 && v.mu && v.mu[0] === 'Muro' && v.mu[1] === 0.9 && v.mu[2] === 5, 'P18 talento editado y talento nuevo en el motor');
  ok(v.noOff && v.noUp === false, 'P19 talento fuera de catálogo no se puede subir');
  ok(v.fijo === 'Objeto editado' && v.cat[0] === 'Categoría editada' && v.cat[1] === 250 && v.cat[2] === cat.modelos[0].length + 1, 'P20 tienda: objeto, categoría y modelo añadido ' + JSON.stringify(v.cat));
  ok(v.sa[0] === 'Título editado' && v.sa[1] === 'Texto editado de la situación.' && v.sa[2] === 'Botón editado' && v.sa[3] === 'Salió de lujo.' && v.sa[4] === Math.min(6, (nota0 || 0) + 1), 'P21 situación editada en el motor ' + JSON.stringify(v.sa));
  ok(v.sbCond === false, 'P22 situación fuera de catálogo no sale');
  ok(v.ct && v.ct[0] === 'Mi situación' && v.ct[2] === 2, 'P23 situación nueva creada en el panel está en el motor');
  ok(v.reloj === Math.round(30000 * 1.2), 'P24 reloj fijo por situación aplicado (' + v.reloj + ')');
  /* la situación nueva forma parte del conjunto del que elige el motor y cumple su filtro */
  const sale = await J.g.evaluate(() => { const s = todasSits().find(x => x.id === 'ct-1'); return !!s && s.cond({}, {}) === true && s.pos === null && !!s.o.length; });
  ok(sale === true, 'P25 la situación nueva está en todasSits() con su cond y sin filtro de puesto (' + sale + ')'); await J.c.close();

  /* —— modo en vivo —— */
  await a.click('[data-cs=pub]'); await a.click('[data-cm=vivo]'); await a.waitForTimeout(500);
  ok(/EN VIVO/.test(await a.innerText('#main')), 'P26 el panel avisa del modo en vivo');
  await a.click('[data-cs=reloj]'); await setf('[data-cp="reloj|base"]', 7000); await a.click('[data-ce=guardar]'); await a.waitForTimeout(500);
  J = await jugador(); st = await estado(J.g); ok(st.n >= 1000000 && st.rel === 7000, 'P27 en vivo: guardar llega al jugador al momento (' + JSON.stringify(st) + ')'); await J.c.close();
  await a.click('[data-cs=pub]'); await a.click('[data-cm=publicado]'); await a.waitForTimeout(500);
  J = await jugador(); st = await estado(J.g); ok(st.n === 1 && st.rel === 6000, 'P28 al volver a publicado el jugador vuelve a la versión 1 (' + JSON.stringify(st) + ')'); await J.c.close();

  /* —— historial y vuelta atrás —— */
  await a.click('[data-cs=reloj]'); await setf('[data-cp="reloj|base"]', 4200); await a.click('[data-cs=pub]'); await a.fill('#ce-nota', 'segunda'); await a.click('[data-ce=publicar]'); await a.waitForTimeout(700);
  J = await jugador(); st = await estado(J.g); ok(st.n === 2 && st.rel === 4200, 'P29 versión 2 publicada y recibida'); await J.c.close();
  await a.locator('[data-ce=restaurar]').last().click(); await a.waitForTimeout(500);
  ok(/cargada en el borrador/i.test(await a.innerText('#main')) || (await a.evaluate(() => CE.pack.reloj.base)) === 6000, 'P30 cargar la versión 1 en el borrador');
  await a.fill('#ce-nota', 'vuelta a la 1'); await a.click('[data-ce=publicar]'); await a.waitForTimeout(700);
  J = await jugador(); st = await estado(J.g); ok(st.n === 3 && st.rel === 6000, 'P31 volver a una versión anterior = publicarla de nuevo (v3 con el reloj de la v1)'); await J.c.close();
  /* —— dejar todo de fábrica —— */
  await a.click('[data-ce=vaciar]'); await a.fill('#ce-nota', 'todo de fábrica'); await a.click('[data-ce=publicar]'); await a.waitForTimeout(700);
  J = await jugador(); st = await estado(J.g); ok(st.n === 4 && st.rel === 3800 && st.rech.length === 0, 'P32 paquete vacío = juego de fábrica (' + JSON.stringify(st) + ')'); await J.c.close();
  /* —— exportar / servidor cerrado a terceros —— */
  const r = await fetch(BASE + '/api/collections/tl_content/records'); ok(r.status === 403 || r.status === 404, 'P33 tl_content cerrada al público (HTTP ' + r.status + ')');
  const r2 = await fetch(BASE + '/tele', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ k: 'mala', op: 'contenido', install: 'abcdefgh12', have: 0 }) }); ok(r2.status === 403, 'P34 op contenido con clave mala → 403');
  const r3 = await fetch(BASE + '/tele', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ k: KEY, op: 'contenido', install: 'x', have: 0 }) }); ok(r3.status === 400, 'P35 op contenido con id malo → 400');
  /* —— móvil sin desborde horizontal —— */
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 } }); const m = await mctx.newPage(); mon(m);
  await m.goto('file://' + ADM); await m.evaluate(u=>{window.PB_URL=u},BASE); await m.fill('#l-mail', 'a@t.local'); await m.fill('#l-pass', 'testpass1234'); await m.click('#l-go'); await m.waitForSelector('#nav button'); await m.click('#bmenu'); await m.click('nav button[data-t=contenido]'); await m.waitForSelector('[data-cs=pub]');
  for (const s of ['pub', 'reloj', 'ent', 'tal', 'tie', 'sit']) { await m.click('[data-cs=' + s + ']'); await m.waitForTimeout(100); const w = await m.evaluate(() => document.documentElement.scrollWidth); ok(w <= 392, 'P36 móvil sin desborde en ' + s + ' (' + w + ' px)'); }
  ok(errs.length === 0, 'sin errores de consola: ' + errs.slice(0, 3).join(' | '));
  await browser.close(); srv.kill();
  console.log(fails.length ? 'FALLOS (' + fails.length + '):\n - ' + fails.join('\n - ') : 'OK'); console.log('comprobaciones OK:', oks);
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('EXCEPCIÓN', e); try { spawnSync('pkill', ['-f', 'pocketbase serve --http 127.0.0.1:' + PORT]); } catch (_) {} process.exit(2); });
