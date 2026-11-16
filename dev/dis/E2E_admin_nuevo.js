/* E2E · Admin nuevo (prototipo + servidor real): entrar, Usuarios, Códigos y Reportes.
   Uso: TELEDIR=.../dev/telemetria ADMIN=.../dev/telemetria/admin-nuevo.html node E2E_admin_nuevo.js  */
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
  let br;
  try {
    for (let i = 0; i < 40; i++) { try { if ((await fetch(BASE + '/api/health')).ok) break; } catch (e) {} await sleep(250); }
    const auth = await (await fetch(BASE + '/api/collections/_superusers/auth-with-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identity: 'a@t.local', password: 'testpass1234' }) })).json();
    const H = { 'Content-Type': 'application/json', Authorization: auth.token };
    const now = Date.now();
    const pl = await (await fetch(BASE + '/api/collections/tl_players/records', { method: 'POST', headers: H, body: JSON.stringify({ install: 'inst-aaaa-1111', label: 'Dani', last_t: now, active_s: 14850, sessions: 4, ver: '4.69.6', ua: 'Chrome 142 · Windows', estado: { nombre: 'Dani', club_n: 'Real Betis', division: '1', temporada: 3, jornada: 14, nivel: 23, pj: 14, g: 3, a: 2, nota: 7.8 } }) })).json();
    ok(!!pl.id, 'sembrar jugador: ' + JSON.stringify(pl).slice(0, 200));
    const rp = await (await fetch(BASE + '/api/collections/tl_reports/records', { method: 'POST', headers: H, body: JSON.stringify({ install: 'inst-aaaa-1111', t: now, tipo: 'bug', texto: 'Se cuelga al fichar', ctx: { ver: '4.69.6', adjunta: false }, estado: 'nuevo', nota_admin: '' }) })).json();
    ok(!!rp.id, 'sembrar reporte: ' + JSON.stringify(rp).slice(0, 200));

    br = await chromium.launch({ executablePath: '/usr/bin/google-chrome' }).catch(() => chromium.launch());
    const ctx = await br.newContext({ viewport: { width: 1280, height: 860 }, permissions: ['clipboard-read', 'clipboard-write'] });
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept(''));
    await p.goto('file://' + ADM);
    await p.evaluate(u => { window.PB_URL = u; }, BASE);
    await p.fill('#l-mail', 'a@t.local'); await p.fill('#l-pass', 'testpass1234'); await p.click('#l-go');
    await p.waitForSelector('tbody tr td:nth-child(2) b, table td b', { timeout: 10000 });
    ok(await p.getByText('Dani').count() >= 1, 'Usuarios: nombre real');
    ok(await p.locator('#side a.off').count() >= 20, 'menú: lo no integrado atenuado (' + await p.locator('#side a.off').count() + ')');
    ok(await p.locator('#bpub[disabled]').count() === 1, 'Publicar desactivado');
    await p.screenshot({ path: '/tmp/parche/nuevo2_usuarios.png' });

    // Ficha de usuario: lo real visible, lo no integrado atenuado
    await p.getByText('Dani').first().click(); await p.waitForTimeout(300);
    ok(await p.getByText('Carrera').count() >= 1, 'Ficha: se abre');
    const ops = await p.evaluate(() => [...document.querySelectorAll('.off')].map(e => getComputedStyle(e).opacity + ' ' + (e.textContent || '').slice(0, 14)));
    console.log('OPACIDADES', JSON.stringify(ops));
    ok(ops.some(o => /ATRIBUTOS|Atributos/i.test(o) && parseFloat(o) < 0.5), 'Ficha: Atributos atenuado');
    ok(await p.locator('button[disabled]', { hasText: 'Mensaje' }).count() >= 1, 'Ficha: Mensaje desactivado');
    await p.screenshot({ path: '/tmp/parche/nuevo2_ficha.png' });
    await p.getByRole('button', { name: '← Volver a la lista' }).click(); await p.waitForTimeout(200);
    // Códigos
    await p.click('#side a:has-text("Códigos y regalos")');
    await p.getByText('+ Código').click();
    await p.locator('[data-fk=dinero]').check();
    await p.fill('#cf-code', 'SMOKE2026'); await p.fill('#cf-nota', 'prueba humo');
    await p.getByRole('button', { name: 'Crear código' }).click(); await p.waitForTimeout(900);
    const cods = await (await fetch(BASE + '/api/collections/tl_codes/records?perPage=50', { headers: H })).json();
    ok(cods.items.some(c => c.code === 'SMOKE2026'), 'Códigos: el código se guarda en PocketBase');
    ok(await p.getByText('GM-').count() + await p.getByText('SMOKE2026').count() >= 1, 'Códigos: aparece en la lista');
    await p.screenshot({ path: '/tmp/parche/nuevo2_codigos.png' });

    // Reportes
    await p.click('#side a:has-text("Bandeja de reportes")'); await p.waitForTimeout(300);
    ok(await p.getByText('Se cuelga al fichar').count() >= 1, 'Reportes: el reporte aparece');
    await p.locator('.split select').first().selectOption('visto'); await p.waitForTimeout(700);
    const est = await (await fetch(BASE + '/api/collections/tl_reports/records/' + rp.id, { headers: H })).json();
    ok(est.estado === 'visto', 'Reportes: estado guardado (' + est.estado + ')');
    await p.locator('.split textarea').first().fill('lo miro el lunes'); await p.locator('.split textarea').first().dispatchEvent('change'); await p.waitForTimeout(700);
    const nt = await (await fetch(BASE + '/api/collections/tl_reports/records/' + rp.id, { headers: H })).json();
    ok(nt.nota_admin === 'lo miro el lunes', 'Reportes: nota guardada');
    await p.screenshot({ path: '/tmp/parche/nuevo2_reportes.png' });
    ok(errs.length === 0, 'sin errores de página: ' + errs.join(' | '));
    await br.close();
  } catch (e) { fails.push('EXCEPCIÓN: ' + e.message.split('\n')[0]); } finally { try { if (br) await br.close(); } catch (e) {} srv.kill(); }
  console.log(fails.length ? 'FALLOS:\n- ' + fails.join('\n- ') : 'OK');
  console.log('comprobaciones OK: ' + oks);
  process.exit(fails.length ? 1 : 0);
})();
