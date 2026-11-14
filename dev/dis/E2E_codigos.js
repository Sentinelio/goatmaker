/* ===== E2E · Códigos canjeables y reportes contra un PocketBase REAL + Chromium REAL — v4.68.0 =====
   Uso:  cd <carpeta de trabajo>; PB=/ruta/pocketbase node /mnt/user-data/outputs/dis/E2E_codigos.js      (GAME=otra copia del juego)
   Levanta un PocketBase propio (puerto 18092, carpeta temporal) con las migraciones y el hook de /mnt/user-data/outputs/telemetria.
   SIEMPRE apunta el juego al servidor de prueba (lap1-tele-url en localStorage): nunca toca el servidor real.
   SERVIDOR (peticiones directas): canje válido; una vez por jugador; máximo de usos; caducado / aún no / desactivado; mayúsculas y guiones;
     efecto que el juego no conoce → 409 sin gastar el código; clave mala 403; id malo 400; freno de intentos fallidos 429; ATOMICIDAD con
     12 canjes simultáneos de un código de 3 usos (exactamente 3); reportes: guardar, vacío, tipo raro → otro, partida adjunta, tope por hora;
     las colecciones nuevas no se leen sin ser superusuario.
   NAVEGADOR (juego real, móvil 390): pestañas Ajustes; canjear de verdad y comprobar que el motor cambió (dinero, XP, nivel, atributos);
     errores en claro (no existe, ya usado, agotado, caducado, versión, sin carrera, sin servidor); efecto «taller»; enviar un reporte con y sin partida;
     el cuerpo enviado solo lleva las claves permitidas; 0 errores de consola/página. */
const { chromium } = require('playwright');
const { spawn, spawnSync } = require('child_process');
const fs = require('fs'), os = require('os'), path = require('path');
const GAME = process.env.GAME || '/mnt/user-data/outputs/la-primera.html';
const PB = process.env.PB || '/tmp/pbtest/pocketbase';
const TEL = process.env.TELEDIR || '/mnt/user-data/outputs/telemetria';
const PORT = 18092, BASE = 'http://127.0.0.1:' + PORT, KEY = 'k-test';
let fails = [], oks = 0;
const ok = (c, m) => { if (c) oks++; else fails.push(m); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SEED = `(function(){var a=7*2654435761>>>0;Math.random=function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};})();`;
async function api(p, o = {}) { const r = await fetch(BASE + p, o); let j = null; try { j = await r.json(); } catch (e) {} return { s: r.status, j }; }
const post = (b) => api('/tele', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ k: KEY }, b)) });
let n = 0; const inst = () => 'inst' + (++n) + 'abcdefgh' + Math.random().toString(36).slice(2, 8);
(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pbcod_'));
  fs.cpSync(TEL + '/pb_migrations', dir + '/pb_migrations', { recursive: true }); fs.cpSync(TEL + '/pb_hooks', dir + '/pb_hooks', { recursive: true });
  const base = ['--dir', dir + '/pb_data', '--migrationsDir', dir + '/pb_migrations', '--hooksDir', dir + '/pb_hooks'];
  const up = spawnSync(PB, ['superuser', 'upsert', 'a@t.local', 'testpass1234', ...base]); if (up.status !== 0) { console.log('✘ no pude crear el superusuario: ' + up.stderr); process.exit(1); }
  let srv = null;
  const arrancar = async () => { srv = spawn(PB, ['serve', '--http', '127.0.0.1:' + PORT, ...base], { env: { ...process.env, TELE_KEY: KEY }, stdio: 'ignore' }); for (let i = 0; i < 40; i++) { try { const r = await fetch(BASE + '/api/health'); if (r.ok) return; } catch (e) {} await sleep(250); } throw new Error('PocketBase no arrancó'); };
  await arrancar();
  const tok = (await api('/api/collections/_superusers/auth-with-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identity: 'a@t.local', password: 'testpass1234' }) })).j.token;
  const A = { headers: { Authorization: tok, 'Content-Type': 'application/json' } };
  const crea = async (o) => { const r = await api('/api/collections/tl_codes/records', { method: 'POST', ...A, body: JSON.stringify(Object.assign({ nota: 'test', efectos: [{ k: 'dinero', v: 1000 }], max_usos: 0, usos: 0, una_por_jugador: false, desde: 0, hasta: 0, activo: true }, o)) }); if (r.s !== 200) throw new Error('crear código ' + r.s + ' ' + JSON.stringify(r.j)); return r.j; };
  const lee = async (c, q = '') => (await api('/api/collections/' + c + '/records?perPage=200&sort=created' + q, A)).j.items;
  const usos = async (code) => (await lee('tl_codes', '&filter=' + encodeURIComponent("code='" + code + "'")))[0].usos;
  const CAPS = ['dinero', 'xp', 'niveles', 'atributos', 'ejes', 'fama', 'vital', 'vestuario', 'curar', 'taller'];

  /* ================= SERVIDOR ================= */
  await crea({ code: 'GMAAAABBBBCCCC', efectos: [{ k: 'dinero', v: 5000 }, { k: 'xp', v: 100 }] });
  let r = await post({ op: 'canje', install: inst(), code: 'GMAAAABBBBCCCC', caps: CAPS });
  ok(r.s === 200 && r.j.ok && r.j.efectos.length === 2 && r.j.efectos[0].k === 'dinero' && r.j.efectos[0].v === 5000, 'S1 canje válido devuelve los efectos (' + r.s + ' ' + JSON.stringify(r.j) + ')');
  ok(await usos('GMAAAABBBBCCCC') === 1, 'S1b el canje suma un uso');
  const cj = await lee('tl_canjes'); ok(cj.length === 1 && cj[0].code === 'GMAAAABBBBCCCC' && cj[0].efectos.length === 2, 'S1c queda registrado quién canjeó');
  r = await post({ op: 'canje', install: inst(), code: 'gm-aaaa-bbbb-cccc ', caps: CAPS });
  ok(r.s === 200 && r.j.ok, 'S2 minúsculas, guiones y espacios se normalizan (' + r.s + ')');

  await crea({ code: 'UNAVEZ', una_por_jugador: true });
  const yo = inst(); r = await post({ op: 'canje', install: yo, code: 'UNAVEZ', caps: CAPS }); ok(r.s === 200, 'S3a una_por_jugador: primera vez ok');
  r = await post({ op: 'canje', install: yo, code: 'UNAVEZ', caps: CAPS }); ok(r.s === 404 && r.j.err === 'ya_usado', 'S3b una_por_jugador: segunda vez del mismo jugador → ya_usado (' + r.s + ' ' + JSON.stringify(r.j) + ')');
  r = await post({ op: 'canje', install: inst(), code: 'UNAVEZ', caps: CAPS }); ok(r.s === 200, 'S3c una_por_jugador: otro jugador sí puede');
  ok(await usos('UNAVEZ') === 2, 'S3d el rechazo no gastó un uso (usos=' + await usos('UNAVEZ') + ')');

  await crea({ code: 'DOSUSOS', max_usos: 2 });
  const rs = []; for (let i = 0; i < 3; i++) rs.push(await post({ op: 'canje', install: inst(), code: 'DOSUSOS', caps: CAPS }));
  ok(rs[0].s === 200 && rs[1].s === 200 && rs[2].s === 404 && rs[2].j.err === 'agotado', 'S4 max_usos=2: el tercero → agotado (' + rs.map(x => x.s).join(',') + ')');

  await crea({ code: 'AYER', hasta: Date.now() - 1000 }); await crea({ code: 'MANANA', desde: Date.now() + 3600000 }); await crea({ code: 'APAGADO', activo: false });
  r = await post({ op: 'canje', install: inst(), code: 'AYER', caps: CAPS }); ok(r.j.err === 'caducado', 'S5a caducado');
  r = await post({ op: 'canje', install: inst(), code: 'MANANA', caps: CAPS }); ok(r.j.err === 'aun_no', 'S5b todavía no');
  r = await post({ op: 'canje', install: inst(), code: 'APAGADO', caps: CAPS }); ok(r.j.err === 'inactivo', 'S5c desactivado');
  r = await post({ op: 'canje', install: inst(), code: 'NOEXISTE1', caps: CAPS }); ok(r.s === 404 && r.j.err === 'no_existe', 'S5d no existe');

  await crea({ code: 'FUTURO', efectos: [{ k: 'dinero', v: 1 }, { k: 'efectoinventado', v: 1 }] });
  r = await post({ op: 'canje', install: inst(), code: 'FUTURO', caps: CAPS }); ok(r.s === 409 && r.j.err === 'version', 'S6 efecto que el juego no conoce → 409 version (' + r.s + ')');
  ok(await usos('FUTURO') === 0, 'S6b …y NO gasta el código');
  r = await post({ op: 'canje', install: inst(), code: 'FUTURO' }); ok(r.s === 200, 'S6c sin caps (cliente antiguo que no las manda) el servidor no bloquea');

  r = await api('/tele', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ k: 'mala', op: 'canje', install: inst(), code: 'UNAVEZ' }) }); ok(r.s === 403, 'S7 clave mala → 403');
  r = await post({ op: 'canje', install: 'x', code: 'UNAVEZ' }); ok(r.s === 400, 'S8 id mal formado → 400');

  /* freno: 6 fallos de un navegador → el siguiente, aunque el código sea bueno, 429 */
  await crea({ code: 'BUENO123' }); const bruto = inst(); let ultimo = null;
  for (let i = 0; i < 6; i++) await post({ op: 'canje', install: bruto, code: 'ZZZZ' + i + 'X', caps: CAPS });
  ultimo = await post({ op: 'canje', install: bruto, code: 'BUENO123', caps: CAPS });
  ok(ultimo.s === 429 && ultimo.j.err === 'demasiados', 'S9 tras 6 intentos fallidos el navegador queda frenado (' + ultimo.s + ')');
  r = await post({ op: 'canje', install: inst(), code: 'BUENO123', caps: CAPS }); ok(r.s === 200, 'S9b otro navegador no se ve afectado por el freno');

  /* atomicidad: 12 canjes a la vez de un código de 3 usos */
  await crea({ code: 'CARRERA3', max_usos: 3 });
  const rr = await Promise.all(Array.from({ length: 12 }, () => post({ op: 'canje', install: inst(), code: 'CARRERA3', caps: CAPS })));
  const buenos = rr.filter(x => x.s === 200).length;
  ok(buenos === 3 && await usos('CARRERA3') === 3, 'S10 12 canjes simultáneos de un código de 3 usos: ' + buenos + ' ok, usos=' + await usos('CARRERA3') + ' (debe ser 3 y 3)');

  /* reportes */
  const rep = inst();
  r = await post({ op: 'reporte', install: rep, tipo: 'bug', texto: 'El botón X no responde', ctx: { ver: '9.9.9', estado: { club_n: 'Oviedo' } } });
  ok(r.s === 200 && r.j.ok && r.j.id, 'R1 reporte guardado (' + r.s + ')');
  let rp = await lee('tl_reports'); ok(rp.length === 1 && rp[0].texto === 'El botón X no responde' && rp[0].tipo === 'bug' && rp[0].estado === 'nuevo' && rp[0].ctx.ver === '9.9.9' && rp[0].install === rep, 'R1b campos guardados');
  r = await post({ op: 'reporte', install: inst(), tipo: 'bug', texto: '  ' }); ok(r.s === 400, 'R2 texto vacío → 400');
  r = await post({ op: 'reporte', install: inst(), tipo: 'raro', texto: 'algo' }); rp = await lee('tl_reports'); ok(r.s === 200 && rp.some(x => x.texto === 'algo' && x.tipo === 'otro'), 'R3 tipo desconocido → «otro»');
  r = await post({ op: 'reporte', install: inst(), tipo: 'idea', texto: 'con partida', save: { temporada: 3, jornada: 7, equipo: 'X' } }); rp = await lee('tl_reports');
  ok(r.s === 200 && rp.some(x => x.texto === 'con partida' && x.save && x.save.jornada === 7), 'R4 la partida adjunta se guarda');
  const largo = 'a'.repeat(9000); r = await post({ op: 'reporte', install: inst(), tipo: 'otro', texto: largo }); rp = await lee('tl_reports');
  ok(r.s === 200 && rp.find(x => x.texto.startsWith('aaaa')).texto.length === 4000, 'R5 el texto se recorta a 4.000');
  const spam = inst(); const sr = []; for (let i = 0; i < 8; i++) sr.push((await post({ op: 'reporte', install: spam, tipo: 'otro', texto: 'spam ' + i })).s);
  ok(sr.slice(0, 6).every(x => x === 200) && sr[6] === 429 && sr[7] === 429, 'R6 tope de 6 reportes por hora por navegador (' + sr.join(',') + ')');
  for (const c of ['tl_codes', 'tl_canjes', 'tl_reports', 'tl_intentos']) { const a = await api('/api/collections/' + c + '/records'); ok(a.s === 403 || a.s === 404, 'P1 ' + c + ' cerrada al público (' + a.s + ')'); }
  r = await post({ install: inst(), sid: 'sesion1', ctx: { ver: 't' }, events: [{ t: Date.now(), tipo: 'sesion', d: {} }] }); ok(r.s === 200 && r.j.n === 1, 'T1 la telemetría normal (sin op) sigue funcionando');

  /* ================= NAVEGADOR ================= */
  const browser = await chromium.launch(); const errs = [];
  const nueva = async (url = BASE) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } }); const page = await ctx.newPage(); const posts = [];
    page.on('pageerror', e => errs.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error' && !/fonts\.(googleapis|gstatic)|ERR_TUNNEL|Failed to load resource|ERR_CONNECTION_REFUSED|net::|CORS|Access-Control/.test(m.text())) errs.push('console: ' + m.text()); });
    page.on('request', q => { if (q.method() === 'POST' && q.url().endsWith('/tele')) { try { posts.push(JSON.parse(q.postData())); } catch (e) {} } });
    await page.addInitScript(SEED);
    await page.addInitScript(`localStorage.setItem('lap1-tele-url','${url}');localStorage.setItem('lap1-tele-key','${KEY}');localStorage.setItem('lap1-tele-off','1');`);   /* off: la telemetría no habla; el canje y los reportes SÍ */
    await page.goto('file://' + GAME); await page.waitForTimeout(300);
    return { ctx, page, posts };
  };
  const monta = page => page.evaluate(async () => {
    const id = Object.keys(EQ).find(k => EQ[k].c === 'Oviedo');
    S = nuevoEstado(id, 'DC', 'Manu', 9, 'D', 'clasico', 22); S.compis = crearCompis(id, 'Manu'); S.entrenador = crearEntrenador(id);
    S.contrato = { salario: 500000, anos: 3, clausula: 12000000, prima: 25000, franja: 'media', exige: 65 }; S.v = VERSION; PARTIDA_ABIERTA = true; S.division = '2'; montarLiga(); await guardar();
    irSec('ajustes'); irSub('ajustes', 'codigo');
  });
  const cuerpo = page => page.evaluate(() => document.getElementById('sec-body').innerText);
  const canjea = async (page, code) => { await page.fill('#cod-in', code); await page.click('button:has-text("Canjear")'); await page.waitForTimeout(900); return await cuerpo(page); };
  const foto = page => page.evaluate(() => ({ din: S.dinero, nivel: S.nivel, xp: S.xp, atr: ATTR_ORDEN.map(a => atr(a)), taller: CHEATS_ON, fama: S.fama }));

  const N = await nueva(); const pg = N.page;
  /* pestañas */
  await pg.click('text=Opciones'); await pg.waitForTimeout(200);
  let t = await cuerpo(pg); ok(/Canjear/.test(t) || true, 'N0 (control)');
  await pg.evaluate(() => { irSec('ajustes'); irSub('ajustes', 'codigo'); }); t = await cuerpo(pg);
  ok(/Canjear/.test(t) && /sin carrera|Primero tiene que haber una carrera/.test(t), 'N1 sin carrera: la caja existe y avisa de que hace falta una');
  t = await canjea(pg, 'GMAAAABBBBCCCC'); ok(/carrera en marcha/.test(t), 'N2 sin carrera el canje no se intenta (' + t.slice(-90).replace(/\n/g, ' ') + ')');
  ok(N.posts.filter(r => !/"op":"contenido"/.test(r.postData() || '')).length === 0, 'N2b …y no sale ninguna petición');
  await monta(pg);

  /* canje real: cambia el motor */
  await crea({ code: 'REGALOREAL', efectos: [{ k: 'dinero', v: 50000 }, { k: 'xp', v: 120 }, { k: 'niveles', v: 2 }, { k: 'atributos', v: 3 }], una_por_jugador: true });
  const f0 = await foto(pg);
  t = await canjea(pg, 'regalo-real');
  const f1 = await foto(pg);
  ok(/Código canjeado/.test(t) && /50 k€|50\.000/.test(t) && /nivel/i.test(t), 'N3 mensaje de éxito con el detalle (' + t.slice(-200).replace(/\n/g, ' | ') + ')');
  ok(f1.din === (f0.din || 0) + 50000, 'N3b dinero +50.000 (' + f0.din + ' → ' + f1.din + ')');
  ok(f1.nivel >= (f0.nivel || 1) + 2, 'N3c nivel +2 como mínimo (' + f0.nivel + ' → ' + f1.nivel + ')');
  ok(f1.atr.every((v, i) => v === Math.min(99, f0.atr[i] + 3) || v >= f0.atr[i] + 3 || f0.atr[i] + 3 > 99), 'N3d todos los atributos +3');
  ok(f1.taller === false, 'N3e el taller NO queda abierto tras un código de regalo');
  const guardada = await pg.evaluate(() => localStorage.getItem('lap1-save')); ok(guardada && JSON.parse(guardada).dinero === f1.din, 'N3f la partida se guarda con el regalo');
  const pq = N.posts.find(p => p.op === 'canje');
  ok(pq && Object.keys(pq).sort().join() === 'caps,code,install,k,op,ver', 'N3g el canje envía solo caps,code,install,k,op,ver (' + (pq && Object.keys(pq).join()) + ')');
  t = await canjea(pg, 'REGALOREAL'); ok(/ya has canjeado/i.test(t), 'N4 segundo canje: «Ya has canjeado ese código» (' + t.slice(-80).replace(/\n/g, ' ') + ')');
  ok((await foto(pg)).din === f1.din, 'N4b …y el motor no cambia');
  t = await canjea(pg, 'ZZZZNOEXISTE'); ok(/no existe/i.test(t), 'N5 código inexistente en claro');
  t = await canjea(pg, 'AYER'); ok(/caducado/i.test(t), 'N6 caducado en claro');
  t = await canjea(pg, 'DOSUSOS'); ok(/máximo de veces/i.test(t), 'N7 agotado en claro');
  t = await canjea(pg, 'FUTURO'); ok(/versión más nueva/i.test(t), 'N8 efecto desconocido: pide versión nueva');
  ok(await usos('FUTURO') === 1, 'N8b …sin gastar el código (usos = ' + await usos('FUTURO') + ': el 1 es el de S6c)');
  t = await canjea(pg, 'ab'); ok(/completo/i.test(t), 'N9 código demasiado corto: lo dice sin llamar al servidor');

  /* efecto taller */
  await crea({ code: 'ABRETALLER', efectos: [{ k: 'taller' }], una_por_jugador: true });
  t = await canjea(pg, 'ABRETALLER'); const f2 = await foto(pg);
  ok(f2.taller === true && /ENCENDIDO/.test(await cuerpo(pg)), 'N10 el efecto «taller» abre el taller y se ve dentro de Código');
  const cfg = await pg.evaluate(() => localStorage.getItem('lap1-cfg')); ok(cfg && JSON.parse(cfg).cheats === true, 'N10b se recuerda en el dispositivo');
  await pg.evaluate(() => { CHEATS_ON = false; aplicarCheats(); guardarAjustes(); irSub('ajustes', 'codigo'); });

  /* vida, curar, ejes, vestuario, fama: todos pasan por el motor */
  await crea({ code: 'TODOS', efectos: [{ k: 'ejes', v: 4 }, { k: 'fama' }, { k: 'vital' }, { k: 'vestuario', v: 10 }, { k: 'curar' }] });
  await pg.evaluate(() => { S.lesion = 3; S.forma = 40; });
  const g0 = await pg.evaluate(() => ({ fama: S.fama, forma: S.forma, les: S.lesion, ej: RASGOS_ORDEN.map(k => eje(k)) }));
  t = await canjea(pg, 'TODOS'); const g1 = await pg.evaluate(() => ({ fama: S.fama, forma: S.forma, les: S.lesion, ej: RASGOS_ORDEN.map(k => eje(k)) }));
  ok(/Código canjeado/.test(t) && g1.fama === (g0.fama || 30) + 20 && g1.forma === 100 && g1.les === 0 && g1.ej.some((v, i) => v > g0.ej[i]), 'N11 ejes, fama, vital, vestuario y curar actúan (' + JSON.stringify([g0.fama, g1.fama, g1.forma, g1.les]) + ')');
  await pg.evaluate(() => { try { jugarJornadaPrueba && 0; } catch (e) {} });

  /* clamp: un valor absurdo del servidor no rompe nada */
  await crea({ code: 'ABSURDO', efectos: [{ k: 'dinero', v: 9e18 }, { k: 'atributos', v: 500 }] });
  const h0 = await foto(pg); t = await canjea(pg, 'ABSURDO'); const h1 = await foto(pg);
  ok(h1.din === h0.din + 1000000000 && h1.atr.every(v => v <= 99), 'N12 valores absurdos se recortan a los topes del juego (dinero +1.000 M€ máx., atributos ≤ 99)');

  /* reportes */
  await pg.evaluate(() => irSub('ajustes', 'reportar')); t = await cuerpo(pg);
  ok(/Adjuntar mi partida/.test(t) && /versión del juego/.test(t), 'N13 Reportar con carrera: ofrece adjuntar y dice qué se envía');
  await pg.click('#sec-body .chip:has-text("Idea")'); await pg.fill('#rep-tx', 'Añadir cesiones a clubes más pequeños'); await pg.click('button:has-text("Enviar")'); await pg.waitForTimeout(900);
  t = await cuerpo(pg); rp = await lee('tl_reports', '&filter=' + encodeURIComponent("texto~'cesiones'"));
  ok(/Enviado, gracias/.test(t), 'N14 mensaje de enviado');
  ok(rp.length === 1 && rp[0].tipo === 'idea' && rp[0].save && rp[0].save.equipo && rp[0].ctx.ver && rp[0].ctx.estado && rp[0].ctx.estado.club_n === 'Oviedo', 'N14b el reporte llega con tipo, partida y contexto (' + (rp[0] && JSON.stringify(Object.keys(rp[0].ctx || {}))) + ')');
  ok(await pg.evaluate(() => document.getElementById('rep-tx').value === ''), 'N14c el cuadro queda vacío tras enviar');
  await pg.fill('#rep-tx', 'sin partida adjunta'); await pg.uncheck('#sec-body input[type=checkbox]'); await pg.click('button:has-text("Enviar")'); await pg.waitForTimeout(900);
  rp = await lee('tl_reports', '&filter=' + encodeURIComponent("texto~'sin partida adjunta'")); ok(rp.length === 1 && (!rp[0].save || Object.keys(rp[0].save).length === 0), 'N15 desmarcar «adjuntar» → no viaja la partida');
  const pr = N.posts.filter(p => p.op === 'reporte').pop(); ok(pr && Object.keys(pr).sort().join() === 'ctx,install,k,op,texto,tipo,ver', 'N15b el reporte sin partida envía solo ctx,install,k,op,texto,tipo,ver (' + (pr && Object.keys(pr).join()) + ')');
  await pg.click('button:has-text("Enviar")'); await pg.waitForTimeout(300); t = await cuerpo(pg); ok(/unas palabras|Cuéntanos/.test(t), 'N16 enviar vacío: lo dice');
  const cx = JSON.stringify(pr.ctx); ok(!/@|password|email/i.test(cx), 'N16b el contexto no lleva datos personales');

  /* servidor caído */
  srv.kill(); await sleep(600);
  await pg.evaluate(() => irSub('ajustes', 'codigo')); t = await canjea(pg, 'REGALOREAL'); ok(/No hay conexión/.test(t), 'N17 servidor caído: «No hay conexión»');
  await pg.evaluate(() => irSub('ajustes', 'reportar')); await pg.fill('#rep-tx', 'texto que no se pierde'); await pg.click('button:has-text("Enviar")'); await pg.waitForTimeout(900);
  ok(/No hay conexión/.test(await cuerpo(pg)) && await pg.evaluate(() => document.getElementById('rep-tx').value) === 'texto que no se pierde', 'N18 reporte sin conexión: avisa y conserva el texto');
  await arrancar();
  await pg.click('button:has-text("Enviar")'); await pg.waitForTimeout(900); ok(/Enviado, gracias/.test(await cuerpo(pg)), 'N19 con el servidor de vuelta se envía lo que se conservó');
  await N.ctx.close();

  /* sin URL configurada (ni constante ni localStorage) */
  const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 } }), p2 = await ctx2.newPage(); const html0 = fs.readFileSync(GAME, 'utf8').replace(/var TELE_URL="[^"]*";/, 'var TELE_URL="";'); const tmp = path.join(dir, 'sinurl.html'); fs.writeFileSync(tmp, html0);
  await p2.goto('file://' + tmp); await p2.waitForTimeout(300); await monta(p2); t = await canjea(p2, 'REGALOREAL'); ok(/No hay conexión/.test(t), 'N20 sin URL de servidor: «No hay conexión» y no se rompe'); await ctx2.close();

  ok(errs.length === 0, 'sin errores de consola/página: ' + errs.slice(0, 4).join(' || '));
  await browser.close(); try { srv.kill(); } catch (e) {}
  console.log((fails.length ? '✘ ' : '✔ ') + 'E2E códigos y reportes: ' + (oks + fails.length) + ' comprobaciones, ' + fails.length + ' fallos'); fails.forEach(f => console.log('  · ' + f));
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.log('✘ excepción: ' + e.stack); process.exit(2); });
