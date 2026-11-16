/* E2E · Bloqueo de navegador en el juego: el admin marca adm_bloqueado, /tele responde 403 y el juego deja de enviar
   sin borrar la partida. Al desbloquear y recargar, vuelve a enviar.
   Uso: TELEDIR=.../dev/telemetria GAME=/home/claude/goatmaker node E2E_bloqueo_juego.js  */
const { chromium } = require('playwright');
const { spawn, spawnSync } = require('child_process');
const fs = require('fs'), os = require('os'), path = require('path');
const PB = process.env.PB || '/tmp/pbtest/pocketbase', TEL = process.env.TELEDIR, GAME = process.env.GAME;
const PORT = 18098, WEB = 18099, BASE = 'http://127.0.0.1:' + PORT, WURL = 'http://127.0.0.1:' + WEB + '/index.html';
const INST = 'inst-bloq-6666';
let fails = [], oks = 0; const ok = (c, m) => { if (c) oks++; else fails.push(m); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pbbloq_'));
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
    // el admin bloquea el navegador (igual que pbBloquea en el admin)
    const pl = await (await fetch(BASE + '/api/collections/tl_players/records', { method: 'POST', headers: H, body: JSON.stringify({ install: INST, label: 'Bloqueado', last_t: Date.now(), active_s: 0, sessions: 1, ver: '4.69.8', adm_bloqueado: true, estado: {} }) })).json();
    ok(!!pl.id, 'Admin: se crea el jugador bloqueado');

    br = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
    const ctx = await br.newContext();
    await ctx.addInitScript(({ base, inst }) => {
      if (sessionStorage.getItem('gm-seed')) return;
      sessionStorage.setItem('gm-seed', '1');
      localStorage.setItem('lap1-tele-url', base); localStorage.setItem('lap1-tele-key', 'k-test');
      localStorage.setItem('lap1-tele-id', inst); localStorage.setItem('lap1-save', JSON.stringify({ v: 1, carrera: 'bloqueada' }));
    }, { base: BASE, inst: INST });
    const p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    const tele = []; p.on('response', r => { if (r.url().indexOf('/tele') >= 0) tele.push(r.status()); });
    await p.goto(WURL, { waitUntil: 'load' });
    await sleep(800);

    // primer envío: el servidor responde 403 y el juego se para
    await p.evaluate(() => { window.onerror('prueba bloqueo 1', 'x.js', 1, 1, new Error('prueba bloqueo 1')); });
    await sleep(2500);
    ok(tele.indexOf(403) >= 0, 'Bloqueo: /tele responde 403 (' + tele.join(',') + ')');
    ok(await p.evaluate(() => localStorage.getItem('lap1-save') !== null), 'Bloqueo: la partida NO se borra del navegador');
    ok(await p.evaluate(() => !/Tu partida ya no existe/.test((document.getElementById('ov-modal-inner') || {}).textContent || '')), 'Bloqueo: no aparece el aviso de baja');

    // envíos posteriores: no sale ninguna petición más
    const antes = tele.length;
    await p.evaluate(() => { window.onerror('prueba bloqueo 2', 'x.js', 1, 1, new Error('prueba bloqueo 2')); });
    await sleep(3000);
    ok(tele.length === antes, 'Bloqueo: el juego deja de enviar mientras está bloqueado (peticiones extra: ' + (tele.length - antes) + ')');

    // desbloqueo desde el admin + recarga: vuelve a enviar
    await fetch(BASE + '/api/collections/tl_players/records/' + pl.id, { method: 'PATCH', headers: H, body: JSON.stringify({ adm_bloqueado: false }) });
    await p.reload({ waitUntil: 'load' }); await sleep(800);
    await p.evaluate(() => { window.onerror('prueba bloqueo 3', 'x.js', 1, 1, new Error('prueba bloqueo 3')); });
    await sleep(2500);
    ok(tele.slice(antes).indexOf(200) >= 0, 'Desbloqueo: tras recargar, el juego vuelve a enviar (' + tele.slice(antes).join(',') + ')');
    ok(errs.length === 0, 'sin errores de página: ' + errs.join(' | '));
    await br.close();
  } catch (e) { fails.push('EXCEPCIÓN: ' + e.message.split('\n')[0]); } finally { try { if (br) await br.close(); } catch (e) {} srv.kill(); web.kill(); }
  console.log(fails.length ? 'FALLOS:\n- ' + fails.join('\n- ') : 'OK');
  console.log('comprobaciones OK: ' + oks);
  process.exit(fails.length ? 1 : 0);
})();
