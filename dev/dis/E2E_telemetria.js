/* ===== E2E · Telemetría contra un PocketBase REAL + Chromium REAL — v4.67.0 =====
   Uso:  cd <carpeta de trabajo>; PB=/ruta/pocketbase node /mnt/user-data/outputs/dis/E2E_telemetria.js      (GAME=otra copia del juego)
   Levanta un PocketBase propio (puerto 18091, carpeta temporal) con las migraciones y el hook de /mnt/user-data/outputs/telemetria,
   y juega partidos de verdad. Exige:
     · DESACTIVADA (sin URL, o con lap1-tele-off=1): cero peticiones de red y cero cola guardada, y el juego funciona igual
     · ACTIVADA: llegan jugador, sesión, eventos (sesion, carrera, pantalla, modal, decision, partido, club, division, lesion, nivel, temporada_nueva, error)
       con sus datos, y la partida completa, que se puede ADOPTAR de nuevo en el juego (ida y vuelta)
     · privacidad: solo claves permitidas en el cuerpo, sin email ni otras claves de localStorage; las colecciones tl_* no se leen sin ser superusuario
     · resiliencia: servidor caído → el juego sigue, la cola sobrevive a recargar y se entrega al volver; 5xx conserva; clave mala (403) tira el lote y calla
     · servidor: id mal formado → 400, evento enorme → recortado, más de 200 eventos → solo 200 */
const { chromium } = require('playwright');
const { spawn, spawnSync } = require('child_process');
const fs = require('fs'), os = require('os'), path = require('path');
const GAME = process.env.GAME || '/mnt/user-data/outputs/la-primera.html';
const PB = process.env.PB || '/tmp/pbtest/pocketbase';
const TEL = process.env.TELEDIR || '/mnt/user-data/outputs/telemetria';   /* TELEDIR=/ruta/dev/telemetria cuando se corre desde el repo */
const VER_JUEGO = (fs.readFileSync(GAME, 'utf8').match(/VERSION="([^"]+)"/) || [])[1];   /* la versión del propio juego, no un número fijo */
const PORT = 18091, BASE = 'http://127.0.0.1:' + PORT, KEY = 'k-test';
let fails = [], oks = 0;
const ok = (c, m) => { if (c) oks++; else fails.push(m); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SEED = `(function(){var a=1*2654435761>>>0;Math.random=function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};})();`;   /* azar fijo: el mismo partido en cada ejecución */
async function api(p, o = {}) { const r = await fetch(BASE + p, o); let j = null; try { j = await r.json(); } catch (e) {} return { s: r.status, j }; }
(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pbtele_'));
  fs.cpSync(TEL + '/pb_migrations', dir + '/pb_migrations', { recursive: true }); fs.cpSync(TEL + '/pb_hooks', dir + '/pb_hooks', { recursive: true });
  const base = ['--dir', dir + '/pb_data', '--migrationsDir', dir + '/pb_migrations', '--hooksDir', dir + '/pb_hooks'];
  const up = spawnSync(PB, ['superuser', 'upsert', 'a@t.local', 'testpass1234', ...base]); if (up.status !== 0) { console.log('✘ no pude crear el superusuario: ' + up.stderr); process.exit(1); }
  let srv = null;
  const arrancar = async () => { srv = spawn(PB, ['serve', '--http', '127.0.0.1:' + PORT, ...base], { env: { ...process.env, TELE_KEY: KEY }, stdio: 'ignore' }); for (let i = 0; i < 40; i++) { try { const r = await fetch(BASE + '/api/health'); if (r.ok) return; } catch (e) {} await sleep(250); } throw new Error('PocketBase no arranca'); };
  await arrancar();
  const tok = (await api('/api/collections/_superusers/auth-with-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identity: 'a@t.local', password: 'testpass1234' }) })).j.token;
  const col = async (c, q = '') => { let out = [], pg = 1, tp = 1; do { const r = (await api('/api/collections/' + c + '/records?perPage=500&page=' + pg + '&sort=created' + q, { headers: { Authorization: tok } })).j; out = out.concat(r.items); tp = r.totalPages; pg++; } while (pg <= tp); return out; };
  const browser = await chromium.launch(); const errs = [];
  const nueva = async (init, opts = {}) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } }); const page = await ctx.newPage(); const posts = [], reqs = [];
    page.on('pageerror', e => { if (!/boom-test-telemetria/.test(e.message)) errs.push('pageerror: ' + e.message); });
    page.on('console', m => { if (m.type() === 'error' && !/fonts\.(googleapis|gstatic)|ERR_TUNNEL|Failed to load resource|ERR_CONNECTION_REFUSED|net::/.test(m.text())) errs.push('console: ' + m.text()); });
    page.on('request', r => { if (!r.url().startsWith('file:') && !r.url().startsWith('data:')) { reqs.push(r.url()); if (r.method() === 'POST') posts.push(r); } });
    await page.addInitScript(SEED); if (init) await page.addInitScript(init);
    await page.goto('file://' + GAME); await page.waitForTimeout(300);
    return { ctx, page, posts, reqs };
  };
  const monta = page => page.evaluate(async () => {
    const idDe = n => Object.keys(EQ).find(k => EQ[k].c === n); const id = idDe('Oviedo');
    S = nuevoEstado(id, 'DC', 'Manu', 9, 'D', 'clasico', 22); S.compis = crearCompis(id, 'Manu'); S.entrenador = crearEntrenador(id);
    S.contrato = { salario: 500000, anos: 3, clausula: 12000000, prima: 25000, franja: 'media', exige: 65 }; S.v = VERSION; PARTIDA_ABIERTA = true; S.division = '2'; montarLiga(); await guardar();
  });
  const jugar = page => page.evaluate(async () => {   /* una jornada real, con decisiones reales */
    S.avisoSaltado = true; iniciarJornada();
    for (let k = 0; k < 60 && M && M.fase !== 'cierre'; k++) { if (M.sitAct && M.sitAct.o) elegirOpcion(0); else simularResto(); }
    if (M) cerrarJornada(); await new Promise(r => setTimeout(r, 900)); await guardar(); return { jor: S.jornada, hist: S.hist.length };
  });
  const CFG = (u, k) => `localStorage.setItem('lap1-tele-url','${u}');localStorage.setItem('lap1-tele-key','${k}');`;

  /* ---------- A. DESACTIVADA ---------- */
  for (const modo of ['sin-url', 'off']) {
    const A = await nueva(modo === 'off' ? CFG(BASE, KEY) + "localStorage.setItem('lap1-tele-off','1');" : null);
    await monta(A.page); const j = await jugar(A.page); await A.page.evaluate(() => { irSec('jugador'); TELE.flush(true); });
    await A.page.waitForTimeout(500);
    const st = await A.page.evaluate(() => ({ vivo: TELE.vivo(), cola: TELE.cola(), ls: localStorage.getItem('lap1-tele-q') }));
    ok(j.jor === 1 && j.hist === 1, 'A/' + modo + ': el juego no avanza con la telemetría desactivada');
    ok(A.reqs.length === 0, 'A/' + modo + ': hizo ' + A.reqs.length + ' petición(es) de red con la telemetría desactivada (' + A.reqs.slice(0, 2).join(', ') + ')');
    ok(!st.vivo && st.cola === 0 && st.ls === null, 'A/' + modo + ': guarda cola o se declara viva estando desactivada ' + JSON.stringify(st));
    await A.ctx.close();
  }

  /* ---------- B. ACTIVADA, contra el servidor real ---------- */
  const B = await nueva(CFG(BASE, KEY)); const pg = B.page;
  await monta(pg);
  await pg.evaluate(() => { irSec('jugador'); irSec('inicio'); modal({ ico: '💬', t: 'Prueba telemetría', x: 'x', okTxt: 'ok' }); $('ov-modal').classList.add('hidden'); });
  const j1 = await jugar(pg), j2 = await jugar(pg);
  ok(j2.jor === 2 && j2.hist === 2, 'B: no se pudieron jugar 2 jornadas reales (' + JSON.stringify(j2) + ')');
  await pg.evaluate(async () => {
    const e0 = S.equipo, otro = Object.keys(EQ).find(k => k !== e0 && EQ[k].c === 'Huesca');
    S.lesion = 3; S.nivel = (S.nivel || 1) + 1; await guardar();
    S.equipo = otro; S.division = '1'; await guardar();
    S.temporada++; S.jornada = 0; await guardar();
    setTimeout(() => { throw new Error('boom-test-telemetria'); }, 0);
  });
  await pg.waitForTimeout(700);
  const ids = await pg.evaluate(() => ({ install: TELE.install, sid: TELE.sid, jor: S.jornada, n: S.nombre, hist: S.hist.length }));
  await pg.mouse.click(5, 5); await pg.waitForTimeout(16000);   /* el latido (15 s) solo cuenta con la pestaña visible y alguien tocando */
  await pg.evaluate(() => TELE.flush(true)); await pg.waitForTimeout(1200);
  let P = (await col('tl_players')).filter(x => x.install === ids.install), SE = (await col('tl_sessions')).filter(x => x.sid === ids.sid);
  const EV = (await col('tl_events')).filter(x => x.install === ids.install), tipos = {}; EV.forEach(e => tipos[e.tipo] = (tipos[e.tipo] || 0) + 1);
  ok(P.length === 1, 'B: debe haber 1 jugador y hay ' + P.length);
  if (P.length) { const p = P[0]; ok(p.ver === VER_JUEGO && /Mozilla|HeadlessChrome/.test(p.ua) && /^\d+x\d+@/.test(p.scr), 'B: ficha del jugador incompleta ' + JSON.stringify({ v: p.ver, ua: p.ua.slice(0, 20), scr: p.scr })); ok(p.estado && p.estado.club_n === 'Huesca' && p.estado.nombre === 'Manu', 'B: el resumen de carrera no refleja el último estado ' + JSON.stringify(p.estado).slice(0, 120)); ok(p.sessions === 1, 'B: sesiones=' + p.sessions); ok(p.active_s >= 15, 'B: el tiempo activo no se cuenta (active_s=' + p.active_s + ')'); }
  ok(SE.length === 1, 'B: debe haber 1 sesión y hay ' + SE.length);
  for (const t of ['sesion', 'carrera', 'pantalla', 'modal', 'decision', 'partido', 'club', 'division', 'lesion', 'nivel', 'temporada_nueva', 'error']) ok(tipos[t] >= 1, 'B: falta el evento «' + t + '» (hay: ' + JSON.stringify(tipos) + ')');
  ok((tipos.partido || 0) === 2, 'B: partidos esperados 2, enviados ' + tipos.partido);
  const pa = EV.filter(e => e.tipo === 'partido'); ok(pa.length === 2 && pa[0].d.j === 1 && pa[1].d.j === 2 && Array.isArray(pa[0].d.sc) && pa[0].d.sc.length === 2 && typeof pa[0].d.min === 'number' && pa[0].d.rival, 'B: datos del partido mal ' + JSON.stringify(pa[0] && pa[0].d));
  const de = EV.find(e => e.tipo === 'decision'); ok(de && typeof de.d.l === 'string' && de.d.l.length > 0 && typeof de.d.m === 'number', 'B: decisión sin texto/minuto ' + JSON.stringify(de && de.d));
  const er = EV.find(e => e.tipo === 'error'); ok(er && /boom-test-telemetria/.test(er.d.msg), 'B: el error no llegó con su mensaje');
  const cl = EV.find(e => e.tipo === 'club'); ok(cl && cl.d.de !== cl.d.a && cl.d.a, 'B: evento club sin de/a');
  const sn = await col('tl_snapshots'); const sm = sn.filter(x => x.install === ids.install);
  ok(sm.length >= 1, 'B: no llegó la partida completa'); if (sm.length) {
    const sv = sm[sm.length - 1].save; ok(sv && sv.nombre === 'Manu' && sv.tabla && sv.fixture && sv.hist.length === 2, 'B: la partida enviada está incompleta');
    const r = await pg.evaluate(sv => { const antes = S; const okk = adoptarPartida(sv); return { okk, n: S.nombre, j: S.jornada, h: S.hist.length, distinto: S !== antes }; }, sv);
    ok(r.okk && r.n === 'Manu' && r.h === 2 && r.distinto, 'B: la partida enviada no se puede adoptar de nuevo en el juego ' + JSON.stringify(r));
  }
  /* privacidad: cuerpos reales enviados */
  const PERMIT = new Set(['k', 'install', 'sid', 'ctx', 'events', 'snap']), PERMC = new Set(['ver', 'start_t', 'active_s', 'ua', 'scr', 'vp', 'lang', 'backend', 'online', 'load_ms', 'tz', 'mem', 'saveKB', 'estado']);
  let mal = [], nreq = 0;
  for (const r of B.posts) { if (!r.url().endsWith('/tele')) continue; if (/"op":"contenido"/.test(r.postData() || '')) { const cb = JSON.parse(r.postData()); const kk = Object.keys(cb).sort().join(); if (kk !== 'have,install,k,op,ver') mal.push('contenido con claves ' + kk); continue; } nreq++; let b; try { b = JSON.parse(r.postData()); } catch (e) { mal.push('cuerpo no JSON'); continue; } Object.keys(b).forEach(k => { if (!PERMIT.has(k)) mal.push('clave ' + k); }); Object.keys(b.ctx || {}).forEach(k => { if (!PERMC.has(k)) mal.push('ctx.' + k); }); if (/[\w.+-]+@[\w-]+\.\w{2,}|password|e-?mail/i.test(JSON.stringify(b.ctx || {}) + JSON.stringify(b.events || []))) mal.push('posible dato personal'); }
  ok(nreq >= 1 && mal.length === 0, 'B: privacidad del cuerpo: ' + mal.slice(0, 4).join(', ') + ' (' + nreq + ' peticiones)');
  ok(B.reqs.every(u => u.startsWith(BASE + '/tele')), 'B: peticiones a sitios que no son tu servidor: ' + B.reqs.filter(u => !u.startsWith(BASE + '/tele')).slice(0, 3).join(', '));
  const pub = await api('/api/collections/tl_events/records'), pub2 = await api('/api/collections/tl_snapshots/records');
  ok(pub.s === 403 && pub2.s === 403, 'B: las colecciones tl_* se pueden leer sin ser superusuario (' + pub.s + '/' + pub2.s + ')');
  /* snapshot: con cambios recientes y sin ser «fin», no se reenvía antes de 3 min */
  const antesSn = (await col('tl_snapshots')).length;
  await pg.evaluate(async () => { await guardar(); TELE.flush(false); }); await pg.waitForTimeout(800);
  ok((await col('tl_snapshots')).length === antesSn, 'B: reenvió la partida completa sin esperar los 3 minutos');
  await B.ctx.close();

  /* ---------- C. SERVIDOR CAÍDO → cola persistente → entrega ---------- */
  const DEAD = 'http://127.0.0.1:18999';
  const ctxC = await browser.newContext({ viewport: { width: 390, height: 844 } }); const pc = await ctxC.newPage(); pc.on('pageerror', e => errs.push('C pageerror: ' + e.message));
  await pc.addInitScript(SEED); await pc.addInitScript(`if(!localStorage.getItem('lap1-tele-url')) { ${CFG(DEAD, KEY)} }`);
  /* el juego se sirve por http (no file://): en Chromium sin cabeza el localStorage de file:// a veces se pierde entero al recargar (pasa también con la 4.67.0), y aquí se prueba que la COLA sobrevive a recargar */
  const httpSrv = require('http').createServer((q, r) => { r.setHeader('Content-Type', 'text/html; charset=utf-8'); r.end(fs.readFileSync(GAME)); }); await new Promise(r => httpSrv.listen(0, '127.0.0.1', r));
  await pc.goto('http://127.0.0.1:' + httpSrv.address().port + '/'); await pc.waitForTimeout(300); await monta(pc); await jugar(pc);
  await pc.evaluate(() => TELE.flush(true)); await pc.waitForTimeout(600);
  const c1 = await pc.evaluate(() => ({ cola: TELE.cola(), ls: JSON.parse(localStorage.getItem('lap1-tele-q') || '[]').length, vivo: TELE.vivo(), install: TELE.install }));
  ok(c1.cola >= 3 && c1.ls === c1.cola && c1.vivo, 'C: con el servidor caído la cola no se conserva ' + JSON.stringify(c1));
  await pc.evaluate(u => localStorage.setItem('lap1-tele-url', u), BASE); await pc.waitForTimeout(800);   /* Chromium vuelca localStorage a disco con retraso: sin esta espera, recargar enseguida a veces lo pierde TODO (pasa con cualquier página file://, no es del juego) */
  await pc.reload();
  for (let i = 0; i < 40; i++) { await pc.waitForTimeout(500); if (await pc.evaluate(() => TELE.cola() === 0 && TELE.enviados() > 0)) break; }   /* arranca y manda a los 2,5 s; se espera hasta 20 s a que el servidor conteste (un PocketBase recién arrancado a veces tarda) */
  const c2 = await pc.evaluate(() => ({ cola: TELE.cola(), enviados: TELE.enviados(), ls: JSON.parse(localStorage.getItem('lap1-tele-q') || '[]').length, vivo: TELE.vivo(), url: localStorage.getItem('lap1-tele-url') }));
  const evC = await col('tl_events', "&filter=install='" + c1.install + "'");
  ok(c2.cola === 0 && evC.length >= c1.cola, 'C: la cola no se entregó al volver el servidor ' + JSON.stringify(c2) + ' (cola ' + c2.cola + ', enviados ' + c2.enviados + ', en servidor ' + evC.length + ' de ' + c1.cola + ')');
  ok(evC.filter(e => e.tipo === 'partido').length === 1, 'C: el partido jugado sin servidor se perdió o se duplicó');
  await ctxC.close(); httpSrv.close();

  /* ---------- D. 5xx conserva · 403 tira y calla ---------- */
  const D = await nueva(CFG(BASE, KEY)); await monta(D.page);
  await D.page.route('**/tele', r => r.fulfill({ status: 503, body: '{}' }));
  await jugar(D.page); await D.page.evaluate(() => TELE.flush(true)); await D.page.waitForTimeout(500);
  const d1 = await D.page.evaluate(() => ({ cola: TELE.cola(), vivo: TELE.vivo() })); ok(d1.cola >= 3 && d1.vivo, 'D: un 503 no debe tirar la cola ni apagar la telemetría ' + JSON.stringify(d1));
  await D.ctx.close();
  const E = await nueva(CFG(BASE, 'clave-mala')); await monta(E.page); await jugar(E.page);
  await E.page.evaluate(() => TELE.flush(true)); await E.page.waitForTimeout(600); const n1 = E.posts.length;
  await E.page.evaluate(async () => { await guardar(); TELE.flush(true); }); await E.page.waitForTimeout(600);
  const e1 = await E.page.evaluate(() => ({ cola: TELE.cola(), vivo: TELE.vivo() }));
  ok(e1.vivo === false && E.posts.length === n1, 'E: con clave mala (403) debe callar y no insistir (vivo=' + e1.vivo + ', peticiones ' + n1 + '→' + E.posts.length + ')');
  const instE = await E.page.evaluate(() => TELE.install);
  ok((await col('tl_events')).every(x => x.install !== instE), 'E: con clave mala se guardaron datos');
  await E.ctx.close();

  /* ---------- F. SERVIDOR: validaciones ---------- */
  const post = b => api('/tele', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
  ok((await post({ k: KEY, install: 'x', sid: 'abcd1234' })).s === 400, 'F: id demasiado corto debe dar 400');
  ok((await post({ k: KEY, install: 'abc/../def12345', sid: 'abcd1234' })).s === 400, 'F: id con caracteres raros debe dar 400');
  ok((await post({ k: 'no', install: 'iiiiiiiiii', sid: 'ssssss' })).s === 403, 'F: clave mala debe dar 403');
  const muchos = Array.from({ length: 260 }, (_, i) => ({ t: i, tipo: 'bulk', d: { i } })); muchos.push({ t: 1, tipo: 'enorme', d: { x: 'y'.repeat(9000) } });
  const rr = await post({ k: KEY, install: 'iiBULK123456', sid: 'sBULK1234', ctx: { ver: 'x' }, events: muchos });
  const bulk = (await col('tl_events', "&filter=install='iiBULK123456'"));
  ok(rr.s === 200 && bulk.length === 200, 'F: un lote de 261 eventos debe quedarse en 200 (quedó ' + bulk.length + ')');
  const rr2 = await post({ k: KEY, install: 'iiBULK123456', sid: 'sBULK1234', ctx: {}, events: [{ t: 1, tipo: 'enorme', d: { x: 'y'.repeat(9000) } }] });
  const enorme = (await col('tl_events', "&filter=tipo='enorme'")); ok(enorme.length === 1 && enorme[0].d.recortado === true, 'F: un evento enorme no se recortó');
  for (let i = 0; i < 9; i++) await post({ k: KEY, install: 'iiSNAP123456', sid: 'sSNAP' + i + '234', ctx: {}, events: [], snap: { v: '1.5.0', n: i } });
  const snaps = await col('tl_snapshots', "&filter=install='iiSNAP123456'"); ok(snaps.length === 6, 'F: debe conservar solo 6 partidas por jugador y hay ' + snaps.length);

  await browser.close(); srv.kill();
  ok(errs.length === 0, 'sin errores de consola/página: ' + errs.slice(0, 4).join(' || '));
  if (fails.length) { console.log('✘ E2E_telemetria: ' + fails.length + ' fallo(s) de ' + (oks + fails.length)); fails.slice(0, 40).forEach(f => console.log('  · ' + f)); process.exitCode = 1; }
  else console.log('✔ E2E_telemetria limpio: ' + oks + ' comprobaciones contra PocketBase real, 0 errores');
  fs.rmSync(dir, { recursive: true, force: true });
})().catch(e => { console.log('✘ E2E_telemetria revienta: ' + (e.stack || e)); process.exit(1); });
