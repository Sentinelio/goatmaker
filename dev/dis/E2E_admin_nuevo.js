/* E2E · Admin nuevo (prototipo adaptado): entrar, Usuarios, Códigos y Reportes con PocketBase real.
   Uso: TELEDIR=.../dev/telemetria ADMIN=.../dev/telemetria/admin-nuevo.html node E2E_admin_nuevo.js  (PB opcional, por defecto /tmp/pbtest/pocketbase) */
const { chromium } = require('playwright');
const { spawn, spawnSync } = require('child_process');
const fs = require('fs'), os = require('os'), path = require('path');
const PB = process.env.PB || '/tmp/pbtest/pocketbase', TEL = process.env.TELEDIR, ADM = process.env.ADMIN, PORT = 18095, BASE = 'http://127.0.0.1:' + PORT;
let fails = [], oks = 0; const ok = (c, m) => { if (c) oks++; else fails.push(m); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pbnuevo_'));
  fs.cpSync(TEL + '/pb_migrations', dir + '/pb_migrations', { recursive: true }); fs.cpSync(TEL + '/pb_hooks', dir + '/pb_hooks', { recursive: true });
  const base = ['--dir', dir + '/pb_data', '--migrationsDir', dir + '/pb_migrations', '--hooksDir', dir + '/pb_hooks'];
  spawnSync(PB, ['superuser', 'upsert', 'a@t.local', 'testpass1234', ...base]);
  const srv = spawn(PB, ['serve', '--http', '127.0.0.1:' + PORT, ...base], { env: { ...process.env, TELE_KEY: 'k-test' }, stdio: 'ignore' });
  try {
    for (let i = 0; i < 40; i++) { try { if ((await fetch(BASE + '/api/health')).ok) break; } catch (e) {} await sleep(250); }
    const auth = await (await fetch(BASE + '/api/collections/_superusers/auth-with-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identity: 'a@t.local', password: 'testpass1234' }) })).json();
    const H = { 'Content-Type': 'application/json', Authorization: auth.token };
    const now = Date.now();
    const pl = await (await fetch(BASE + '/api/collections/tl_players/records', { method: 'POST', headers: H, body: JSON.stringify({ install: 'inst-aaaa-1111', label: 'Dani', last_t: now, active_s: 3, sessions: 4, ver: '4.69.6', estado: { nombre: 'Dani', club_n: 'Betis', division: '1', temporada: 1, jornada: 14, nivel: 23, pj: 14, g: 3, a: 2, nota: 7.8 } }) })).json();
    ok(!!pl.id, 'sembrar jugador: ' + JSON.stringify(pl).slice(0, 200));
    const rp = await (await fetch(BASE + '/api/collections/tl_reports/records', { method: 'POST', headers: H, body: JSON.stringify({ install: 'inst-aaaa-1111', t: now, tipo: 'bug', texto: 'Se cuelga al fichar', ctx: { ver: '4.69.6', adjunta: false }, estado: 'nuevo', nota_admin: '' }) })).json();
    ok(!!rp.id, 'sembrar reporte: ' + JSON.stringify(rp).slice(0, 200));

    const br = await chromium.launch({ executablePath: '/usr/bin/google-chrome' }).catch(() => chromium.launch());
    const ctx = await br.newContext({ viewport: { width: 1280, height: 860 }, permissions: ['clipboard-read', 'clipboard-write'] });
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept(''));
    await p.goto('file://' + ADM);
    await p.evaluate(u => { window.PB_URL = u; }, BASE);
    await p.fill('#l-mail', 'a@t.local'); await p.fill('#l-pass', 'testpass1234'); await p.click('#l-go');
    await p.waitForSelector('#side a[data-sec]', { timeout: 10000 });
    // Usuarios
    await p.waitForSelector('td input.lab');
    ok((await p.locator('td input.lab').inputValue()) === 'Dani', 'Usuarios: nombre real');
    ok(await p.locator('#side a.off').count() >= 20, 'menú: lo no integrado atenuado (' + await p.locator('#side a.off').count() + ')');
    await p.screenshot({ path: '/tmp/parche/nuevo_usuarios.png' });
    // Códigos
    await p.click('#side a[data-sec=codigos]');
    await p.waitForSelector('#cf-go');
    await p.locator('[data-fk=dinero]').check(); await p.fill('#cf-nota', 'prueba humo'); await p.fill('#cf-code', 'SMOKE2026');
    await p.click('#cf-go'); await p.waitForTimeout(900);
    ok(await p.locator('.cod', { hasText: 'SMOK' }).count() >= 1 || await p.getByText('SMOKE2026').count() >= 1, 'Códigos: el código creado aparece');
    await p.screenshot({ path: '/tmp/parche/nuevo_codigos.png' });
    // Reportes
    await p.click('#side a[data-sec=reportes]');
    await p.waitForSelector('[data-rf]');
    ok(await p.getByText('Se cuelga al fichar').count() === 1, 'Reportes: el reporte nuevo aparece');
    await p.locator('textarea[data-rn]').fill('lo miro el lunes'); await p.locator('textarea[data-rn]').dispatchEvent('change'); await p.waitForTimeout(500);
    const nt = await (await fetch(BASE + '/api/collections/tl_reports/records/' + rp.id, { headers: H })).json();
    ok(nt.nota_admin === 'lo miro el lunes', 'Reportes: nota guardada');
    await p.locator('select[data-re]').selectOption('visto'); await p.waitForTimeout(700);
    const est = await (await fetch(BASE + '/api/collections/tl_reports/records/' + rp.id, { headers: H })).json();
    ok(est.estado === 'visto', 'Reportes: cambio de estado guardado en PocketBase');
    await p.screenshot({ path: '/tmp/parche/nuevo_reportes.png' });
    ok(errs.length === 0, 'sin errores de página: ' + errs.join(' | '));
    await br.close();
  } finally { srv.kill(); }
  console.log(fails.length ? 'FALLOS:\n- ' + fails.join('\n- ') : 'OK');
  console.log('comprobaciones OK: ' + oks);
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('ERROR', e); process.exit(2); });
