/* E2E · Baja de usuario en el juego: el admin borra al jugador (tl_bajas) y su navegador borra la partida al siguiente envío.
   Uso: TELEDIR=.../dev/telemetria GAME=/home/claude/goatmaker node E2E_baja_juego.js  */
const { chromium } = require('playwright');
const { spawn, spawnSync } = require('child_process');
const fs = require('fs'), os = require('os'), path = require('path');
const PB = process.env.PB || '/tmp/pbtest/pocketbase', TEL = process.env.TELEDIR, GAME = process.env.GAME;
const PORT = 18096, WEB = 18097, BASE = 'http://127.0.0.1:' + PORT, WURL = 'http://127.0.0.1:' + WEB + '/index.html';
const INST = 'inst-baja-5555';
let fails = [], oks = 0; const ok = (c, m) => { if (c) oks++; else fails.push(m); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pbbaja_'));
  fs.cpSync(TEL + '/pb_migrations', dir + '/pb_migrations', { recursive: true }); fs.cpSync(TEL + '/pb_hooks', dir + '/pb_hooks', { recursive: true });
  const base = ['--dir', dir + '/pb_data', '--migrationsDir', dir + '/pb_migrations', '--hooksDir', dir + '/pb_hooks'];
  spawnSync(PB, ['superuser', 'upsert', 'a@t.local', 'testpass1234', ...base]);
  const srv = spawn(PB, ['serve', '--http', '127.0.0.1:' + PORT, ...base], { env: { ...process.env, TELE_KEY: 'k-test' }, stdio: 'ignore' });
  const web = spawn('python3', ['-m', 'http.server', String(WEB), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' });
  let br;
  try {
    for (let i = 0; i < 40; i++) { try { if ((await fetch(BASE + '/api/health')).ok) break; } catch (e) {} await sleep(250); }
    const auth = await (await fetch(BASE + '/api/collections/_superusers/auth-with-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identity: 'a@t.local', password: 'testpass1234' }) })).json();
    const H = { 'Content-Type': 'application/json', Authorization: auth.token };
    // el admin registra la baja (igual que pbBorra en el admin)
    const bj = await (await fetch(BASE + '/api/collections/tl_bajas/records', { method: 'POST', headers: H, body: JSON.stringify({ install: INST, t: Date.now() }) })).json();
    ok(!!bj.id, 'Admin: se crea la baja en tl_bajas');
    await sleep(300);

    br = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
    const ctx = await br.newContext();
    // antes de cargar: el navegador tiene partida e identidad de ese jugador (solo la primera vez)
    await ctx.addInitScript(({ base, inst }) => {
      if (sessionStorage.getItem('gm-seed')) return;
      sessionStorage.setItem('gm-seed', '1');
      localStorage.setItem('lap1-tele-url', base); localStorage.setItem('lap1-tele-key', 'k-test');
      localStorage.setItem('lap1-tele-id', inst); localStorage.setItem('lap1-save', JSON.stringify({ v: 1, carrera: 'vieja' }));
    }, { base: BASE, inst: INST });
    const p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(WURL, { waitUntil: 'load' });
    await sleep(800);
    ok(await p.evaluate(() => !!localStorage.getItem('lap1-save')), 'Antes: el navegador tiene la partida');

    // un envío de telemetría (un error de página lo provoca): el servidor responde baja
    await p.evaluate(() => { window.onerror('prueba baja', 'x.js', 1, 1, new Error('prueba baja')); });
    await p.waitForSelector('#ov-modal:not(.hidden)', { timeout: 10000 }).catch(() => {});
    const visible = await p.evaluate(() => !document.getElementById('ov-modal').classList.contains('hidden'));
    ok(visible, 'Baja: aparece el aviso de partida borrada');
    ok(await p.evaluate(() => /Tu partida ya no existe/.test(document.getElementById('ov-modal-inner').textContent)), 'Baja: el aviso tiene el texto esperado');
    ok(await p.evaluate(() => localStorage.getItem('lap1-save') === null), 'Baja: la partida se borra del navegador');
    ok(await p.evaluate(() => localStorage.getItem('lap1-tele-id') === null), 'Baja: se borra la identidad de telemetría');

    // al pulsar el aviso se recarga; en la nueva carga no hay partida ni se vuelve a usar el jugador borrado
    await Promise.all([p.waitForNavigation({ waitUntil: 'load', timeout: 10000 }).catch(() => {}), p.click('#ov-modal button.gold-btn, #ov-modal button.peligro')]);
    await sleep(800);
    ok(await p.evaluate(() => localStorage.getItem('lap1-save') === null), 'Recarga: sin partida, no aparece continuar');
    const nuevoId = await p.evaluate(() => localStorage.getItem('lap1-tele-id'));
    ok(!!nuevoId && nuevoId !== INST, 'Recarga: el navegador tiene una identidad nueva');
    const cont = await p.evaluate(() => { const b = document.getElementById('btn-continuar'); return !!b && b.classList.contains('hidden'); });
    ok(cont, 'Recarga: el botón Continuar temporada está oculto');
    const pq = await (await fetch(BASE + '/api/collections/tl_players/records?filter=' + encodeURIComponent("install='" + INST + "'"), { headers: H })).json();
    ok(pq.totalItems === 0, 'Servidor: el jugador borrado no vuelve a aparecer');
    ok(errs.length === 0, 'sin errores de página: ' + errs.join(' | '));
  } catch (e) { fails.push('EXCEPCIÓN: ' + e.message.split('\n')[0]); } finally { try { if (br) await br.close(); } catch (e) {} srv.kill(); web.kill(); }
  console.log(fails.length ? 'FALLOS:\n- ' + fails.join('\n- ') : 'OK');
  console.log('comprobaciones OK: ' + oks);
  process.exit(fails.length ? 1 : 0);
})();
