/* ===== E2E · Panel admin: pestañas Códigos y Reportes, con el juego real en el otro extremo — v4.68.0 =====
   Uso:  cd <carpeta de trabajo>; PB=/ruta/pocketbase node /mnt/user-data/outputs/dis/E2E_panel_codigos.js
   El ciclo completo: el admin CREA un código desde su interfaz → el jugador (juego real) lo CANJEA y el motor cambia → el admin ve el canje,
   REGENERA el código (el viejo deja de valer, el nuevo sí), lo desactiva y lo borra → el jugador ENVÍA un reporte → el admin lo lee en Reportes,
   lo copia para Claude (formato), cambia el estado, escribe una nota, descarga la partida adjunta y filtra.
   También: el catálogo de efectos del panel coincide con el registro EFECTOS del juego (clave, unidad, topes); móvil 390 sin desborde. */
const { chromium } = require('playwright');
const { spawn, spawnSync } = require('child_process');
const fs = require('fs'), os = require('os'), path = require('path');
const PB = process.env.PB || '/tmp/pbtest/pocketbase', TEL = process.env.TELEDIR || '/mnt/user-data/outputs/telemetria', GAME = process.env.GAME || '/mnt/user-data/outputs/la-primera.html';
const ADM = process.env.ADMIN || (TEL + '/goatmaker-admin.html'), PORT = 18094, BASE = 'http://127.0.0.1:' + PORT, KEY = 'k-test';
let fails = [], oks = 0; const ok = (c, m) => { if (c) oks++; else fails.push(m); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SEED = `(function(){var a=3*2654435761>>>0;Math.random=function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};})();`;
(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pbpan_'));
  fs.cpSync(TEL + '/pb_migrations', dir + '/pb_migrations', { recursive: true }); fs.cpSync(TEL + '/pb_hooks', dir + '/pb_hooks', { recursive: true });
  const base = ['--dir', dir + '/pb_data', '--migrationsDir', dir + '/pb_migrations', '--hooksDir', dir + '/pb_hooks'];
  spawnSync(PB, ['superuser', 'upsert', 'a@t.local', 'testpass1234', ...base]);
  const srv = spawn(PB, ['serve', '--http', '127.0.0.1:' + PORT, ...base], { env: { ...process.env, TELE_KEY: KEY }, stdio: 'ignore' });
  for (let i = 0; i < 40; i++) { try { if ((await fetch(BASE + '/api/health')).ok) break; } catch (e) {} await sleep(250); }
  const browser = await chromium.launch(); const errs = [];
  const mon = (p) => { p.on('pageerror', e => errs.push('pageerror: ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/fonts\.|ERR_TUNNEL|Failed to load resource|net::/.test(m.text())) errs.push('console: ' + m.text()); }); };

  /* ---- el juego (jugador) ---- */
  const gctx = await browser.newContext({ viewport: { width: 390, height: 844 } }); const g = await gctx.newPage(); mon(g);
  await g.addInitScript(SEED); await g.addInitScript(`localStorage.setItem('lap1-tele-url','${BASE}');localStorage.setItem('lap1-tele-key','${KEY}');localStorage.setItem('lap1-tele-off','1');`);
  await g.goto('file://' + GAME); await g.waitForTimeout(300);
  await g.evaluate(async () => { const id = Object.keys(EQ).find(k => EQ[k].c === 'Oviedo'); S = nuevoEstado(id, 'DC', 'Manu', 9, 'D', 'clasico', 22); S.compis = crearCompis(id, 'Manu'); S.entrenador = crearEntrenador(id);
    S.contrato = { salario: 500000, anos: 3, clausula: 12000000, prima: 25000, franja: 'media', exige: 65 }; S.v = VERSION; PARTIDA_ABIERTA = true; S.division = '2'; montarLiga(); await guardar(); irSec('ajustes'); irSub('ajustes', 'codigo'); });
  const efectosJuego = await g.evaluate(() => Object.keys(EFECTOS).map(k => ({ k, u: EFECTOS[k].u || null, min: EFECTOS[k].min == null ? null : EFECTOS[k].min, max: EFECTOS[k].max == null ? null : EFECTOS[k].max })));

  /* ---- el panel (admin) ---- */
  const actx = await browser.newContext({ viewport: { width: 1280, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] }); const a = await actx.newPage(); mon(a);
  a.on('dialog', d => { if (d.type() === 'prompt') d.accept(a._promptAns == null ? '' : a._promptAns); else d.accept(); });
  await a.goto('file://' + ADM); await a.fill('#l-url', BASE); await a.fill('#l-mail', 'a@t.local'); await a.fill('#l-pass', 'testpass1234'); await a.click('#l-go');
  await a.waitForSelector('#nav button', { timeout: 8000 }); await a.waitForTimeout(600);
  const navT = await a.$$eval('#nav button', b => b.map(x => x.innerText.trim()));
  ok(navT.some(x => /^Códigos/.test(x)) && navT.some(x => /^Reportes/.test(x)), 'P0 el menú tiene Códigos y Reportes (' + navT.join('|') + ')');
  ok(!/Pro\b/.test(await a.title()) && !/ Pro /.test(await a.innerText('.brand')), 'P0b el panel ya no dice «Pro» (' + await a.title() + ')');

  /* catálogo del panel == registro del juego */
  const cat = await a.evaluate(() => CAT.map(c => ({ k: c.k, u: c.u || null, min: c.min == null ? null : c.min, max: c.max == null ? null : c.max })));
  const ordena = x => JSON.stringify(x.slice().sort((p, q) => p.k < q.k ? -1 : 1));
  ok(ordena(cat) === ordena(efectosJuego), 'P1 el catálogo del panel coincide con EFECTOS del juego\n   panel: ' + ordena(cat) + '\n   juego: ' + ordena(efectosJuego));

  /* crear un código desde la interfaz */
  await a.click('nav button[data-t=codigos]'); await a.waitForTimeout(250);
  ok(/Todavía no hay ningún código/.test(await a.innerText('#main')), 'P2 sin códigos lo dice');
  await a.click('[data-fk=dinero]'); await a.fill('[data-fv=dinero]', '25000'); await a.click('[data-fk=niveles]'); await a.fill('[data-fv=niveles]', '2');
  await a.fill('#cf-nota', 'regalo de prueba'); await a.fill('#cf-max', '1'); await a.selectOption('#cf-cad', '7');
  await a.click('#cf-go'); await a.waitForTimeout(900);
  let t = await a.innerText('#main');
  const cod1 = (await a.$$eval('.cod', e => e.map(x => x.textContent)))[0];
  ok(/^GM-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(cod1 || ''), 'P3 se genera un código con formato GM-XXXX-XXXX-XXXX (' + cod1 + ')');
  ok(!/[01OIL]/.test((cod1 || '').slice(3)), 'P3b sin caracteres ambiguos (0,1,O,I,L)');
  const lote = await a.evaluate(() => Array.from({ length: 300 }, () => codNuevo())); ok(new Set(lote).size === 300 && lote.every(c => /^GM[ABCDEFGHJKMNPQRSTUVWXYZ2-9]{12}$/.test(c)), 'P3c 300 códigos generados: todos distintos y con el alfabeto sin ambiguos');
  ok(/\+25\.000 €/.test(t) && /\+2 nivel/.test(t) && /Activo/.test(t) && /0 \/ 1/.test(t) && /caduca/.test(t) && /regalo de prueba/.test(t), 'P4 la fila muestra efectos, usos, caducidad, estado y nota');
  const clip = await a.evaluate(() => navigator.clipboard.readText()); ok(clip === cod1, 'P5 al crear, el código queda copiado al portapapeles (' + clip + ')');
  await a.fill('#cf-nota', 'x'); await a.click('#cf-go'); await a.waitForTimeout(400); ok(/Marca al menos un efecto/.test(await a.innerText('#cf-msg')), 'P6 sin efectos: lo dice y no crea');
  await a.fill('[data-fv=dinero]', '0'); await a.click('[data-fk=dinero]'); await a.click('#cf-go'); await a.waitForTimeout(300); ok(/entre 1 y/.test(await a.innerText('#cf-msg')), 'P6b valor fuera de rango: lo dice');

  /* el jugador lo canjea de verdad */
  const f0 = await g.evaluate(() => ({ din: S.dinero || 0, nivel: S.nivel || 1 }));
  await g.fill('#cod-in', cod1.toLowerCase()); await g.click('button:has-text("Canjear")'); await g.waitForTimeout(900);
  const f1 = await g.evaluate(() => ({ din: S.dinero || 0, nivel: S.nivel || 1 }));
  ok(f1.din === f0.din + 25000 && f1.nivel >= f0.nivel + 2, 'P7 el jugador canjea el código del panel y el motor cambia (' + JSON.stringify([f0, f1]) + ')');
  await g.fill('#cod-in', cod1); await g.click('button:has-text("Canjear")'); await g.waitForTimeout(800);
  ok(/máximo de veces|ya has canjeado/i.test(await g.evaluate(() => document.getElementById('sec-body').innerText)), 'P8 un segundo intento: agotado (max 1 uso)');

  /* el admin lo ve y lo regenera */
  await a.click('#refresh'); await a.waitForTimeout(900); await a.click('nav button[data-t=codigos]'); await a.waitForTimeout(250);
  t = await a.innerText('#main'); ok(/1 \/ 1/.test(t) && /Agotado/.test(t), 'P9 el panel ve 1/1 y «Agotado»'); ok(/Canjes:/.test(t), 'P9b el panel lista el canje');
  a._promptAns = '3'; await a.click('[data-a=regen]'); await a.waitForTimeout(1000);
  const cod2 = (await a.$$eval('.cod', e => e.map(x => x.textContent)))[0]; t = await a.innerText('#main');
  ok(cod2 && cod2 !== cod1 && /0 \/ 1/.test(t) && /Activo/.test(t), 'P10 regenerar: código nuevo (' + cod2 + '), usos a 0 y activo');
  ok(await a.evaluate(() => navigator.clipboard.readText()) === cod2, 'P10b el nuevo queda copiado');
  await g.evaluate(() => irSub('ajustes', 'codigo')); await g.fill('#cod-in', cod1); await g.click('button:has-text("Canjear")'); await g.waitForTimeout(800);
  ok(/no existe/i.test(await g.evaluate(() => document.getElementById('sec-body').innerText)), 'P11 el código viejo ya no existe');
  const f2 = await g.evaluate(() => S.dinero || 0); await g.fill('#cod-in', cod2); await g.click('button:has-text("Canjear")'); await g.waitForTimeout(900);
  ok((await g.evaluate(() => S.dinero || 0)) === f2 + 25000, 'P12 el código regenerado funciona');
  await a.click('#refresh'); await a.waitForTimeout(900); await a.click('nav button[data-t=codigos]'); await a.waitForTimeout(250);
  /* desactivar */
  await a.click('[data-a=regen]'); await a.waitForTimeout(900); await a.click('[data-a=toggle]'); await a.waitForTimeout(800);
  ok(/Desactivado/.test(await a.innerText('#main')), 'P13 desactivar');
  const cod3 = (await a.$$eval('.cod', e => e.map(x => x.textContent)))[0];
  await g.evaluate(() => irSub('ajustes', 'codigo')); await g.fill('#cod-in', cod3); await g.click('button:has-text("Canjear")'); await g.waitForTimeout(800);
  ok(/desactivado/i.test(await g.evaluate(() => document.getElementById('sec-body').innerText)), 'P13b el jugador ve «desactivado»');
  await a.click('[data-a=toggle]'); await a.waitForTimeout(700); ok(/Activo/.test(await a.innerText('#main')), 'P13c reactivar');
  /* caducidad a mano */
  await a.click('[data-fk=dinero]'); await a.fill('[data-fv=dinero]', '1000'); await a.fill('#cf-code', 'navidad 2026'); await a.selectOption('#cf-cad', 'x'); await a.fill('#cf-fecha', '2020-01-01T10:00'); await a.fill('#cf-max', '0'); await a.click('#cf-uno'); await a.click('#cf-go'); await a.waitForTimeout(900);
  t = await a.innerText('#main'); ok(/NAVIDAD2026/.test(t) && /Caducado/.test(t) && /caducó/.test(t) && /sin tope por jugador/.test(t) && /0 \/ ∞/.test(t), 'P14 código a mano con fecha pasada: «Caducado», sin tope de usos ni por jugador');
  await a.fill('#cf-code', 'navidad 2026'); await a.click('[data-fk=dinero]'); await a.click('#cf-go'); await a.waitForTimeout(700);
  /* borrar */
  const nAntes = (await a.$$('.cod')).length; await a.click('tr[data-c] [data-a=borrar] >> nth=0'); await a.waitForTimeout(900);
  ok((await a.$$('.cod')).length === nAntes - 1, 'P15 borrar quita el código (' + nAntes + ' → ' + (await a.$$('.cod')).length + ')');

  /* ---- reportes ---- */
  await g.evaluate(() => { irSub('ajustes', 'reportar'); });
  await g.click('#sec-body .chip:has-text("Fallo")'); await g.fill('#rep-tx', 'Al fichar por el Huesca el dinero sale negativo'); await g.click('button:has-text("Enviar")'); await g.waitForTimeout(900);
  await g.click('#sec-body .chip:has-text("Idea")'); await g.fill('#rep-tx', 'Que se pueda elegir dorsal al fichar'); await g.uncheck('#sec-body input[type=checkbox]'); await g.click('button:has-text("Enviar")'); await g.waitForTimeout(900);
  await a.click('#refresh'); await a.waitForTimeout(1000);
  ok(/Reportes\s*2/.test((await a.$$eval('#nav button', b => b.map(x => x.innerText.replace(/\s+/g, ' ').trim()))).join('|')), 'R0 el menú muestra «Reportes 2» (nuevos)');
  await a.click('nav button[data-t=reportes]'); await a.waitForTimeout(300); t = await a.innerText('#main');
  ok((t.match(/con partida/g) || []).length === 1, 'R1b solo el reporte que adjuntó la partida lleva «con partida»');
  ok(/dinero sale negativo/.test(t) && /elegir dorsal/.test(t) && /con partida/.test(t) && /Nuevo \(2\)/.test(t), 'R1 los dos reportes salen, uno con partida, y el filtro «Nuevo (2)"');
  await a.click('[data-ra=copiar] >> nth=0'); await a.waitForTimeout(700);
  const cp = await a.evaluate(() => navigator.clipboard.readText());
  ok(/^\[Goatmaker · (idea|fallo) · versión 4\.\d+\.\d+\]/.test(cp) && /Jugador: .*Oviedo/.test(cp) && /Fecha:/.test(cp) && /elegir dorsal|dinero sale negativo/.test(cp), 'R2 «Copiar para Claude» deja un texto con tipo, versión, jugador, club, fecha y texto:\n' + cp);
  t = await a.innerText('#main'); ok(/Nuevo \(1\)/.test(t) && /Visto \(1\)/.test(t), 'R3 al copiar, ese reporte pasa a «Visto» (' + (t.match(/(Nuevo|Visto) \(\d\)/g) || []).join(',') + ')');
  await a.click('[data-rf=estado][data-v=""]'); await a.waitForTimeout(250);
  const selId = await a.$eval('select[data-re] >> nth=0', s => s.dataset.re); await a.selectOption('select[data-re] >> nth=0', 'hecho'); await a.waitForTimeout(900);
  await a.fill('textarea[data-rn] >> nth=0', 'Se arregla en 4.68.1'); await a.dispatchEvent('textarea[data-rn] >> nth=0', 'change'); await a.waitForTimeout(700);
  const srvR = await (await fetch(BASE + '/api/collections/tl_reports/records?perPage=50', { headers: { Authorization: (await (await fetch(BASE + '/api/collections/_superusers/auth-with-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identity: 'a@t.local', password: 'testpass1234' }) })).json()).token } })).json();
  ok(srvR.items.some(r => r.estado === 'hecho') && srvR.items.some(r => r.nota_admin === 'Se arregla en 4.68.1'), 'R4 el estado y la nota se guardan en el servidor');
  await a.click('[data-rf=estado][data-v=hecho]'); await a.waitForTimeout(250); t = await a.innerText('#main'); ok((await a.$$('.rep')).length === 1 && /Se arregla en 4\.68\.1/.test(await a.$eval('textarea[data-rn]', e => e.value)), 'R5 el filtro «Hecho» enseña solo el reporte hecho, con su nota');
  await a.click('[data-rf=estado][data-v=""]'); await a.click('[data-rf=tipo][data-v=bug]'); await a.waitForTimeout(250);
  t = await a.innerText('#main'); ok(/dinero sale negativo/.test(t) && !/elegir dorsal/.test(t), 'R6 el filtro de tipo «Fallo»');
  const [dl] = await Promise.all([a.waitForEvent('download', { timeout: 5000 }), a.click('[data-ra=partida]')]);
  const pj = JSON.parse(fs.readFileSync(await dl.path(), 'utf8')); ok(pj && pj.equipo && pj.temporada != null && /goatmaker-reporte-/.test(dl.suggestedFilename()), 'R7 «Descargar partida» baja el .json de la carrera (' + dl.suggestedFilename() + ')');
  await a.click('[data-rf=tipo][data-v=""]'); await a.click('[data-rf=estado][data-v=""]'); await a.waitForTimeout(250); await a.click('#rp-copiar-todos'); await a.waitForTimeout(600);
  const todos = await a.evaluate(() => navigator.clipboard.readText()); ok((todos.match(/\[Goatmaker ·/g) || []).length === 2 && /————/.test(todos), 'R8 «Copiar los visibles» junta los 2 reportes');
  a._promptAns = null; a.removeAllListeners('dialog'); a.on('dialog', d => d.accept());
  await a.click('[data-ra=borrar] >> nth=0'); await a.waitForTimeout(900); ok((await a.$$('.rep')).length === 1, 'R9 borrar un reporte');

  /* móvil */
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 } }); const m = await mctx.newPage(); mon(m);
  await m.goto('file://' + ADM); await m.fill('#l-url', BASE); await m.fill('#l-mail', 'a@t.local'); await m.fill('#l-pass', 'testpass1234'); await m.click('#l-go'); await m.waitForSelector('#nav button'); await m.waitForTimeout(700);
  for (const tab of ['codigos', 'reportes']) { await m.click('#bmenu'); await m.click('nav button[data-t=' + tab + ']'); await m.waitForTimeout(300); const w = await m.evaluate(() => document.documentElement.scrollWidth); ok(w <= 391, 'M ' + tab + ' sin desborde horizontal en móvil (' + w + ')'); }
  await m.screenshot({ path: '/tmp/tele/adm_reportes_movil.png' });
  await a.click('nav button[data-t=codigos]'); await a.waitForTimeout(250); await a.screenshot({ path: '/tmp/tele/adm_codigos.png', fullPage: true });

  ok(errs.length === 0, 'sin errores de consola/página: ' + errs.slice(0, 4).join(' || '));
  await browser.close(); srv.kill();
  console.log((fails.length ? '✘ ' : '✔ ') + 'E2E panel (códigos y reportes): ' + (oks + fails.length) + ' comprobaciones, ' + fails.length + ' fallos'); fails.forEach(f => console.log('  · ' + f));
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.log('✘ excepción: ' + e.stack); process.exit(2); });
