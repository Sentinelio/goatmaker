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

    const bp = await (await fetch(BASE + '/api/collections/tl_players/records', { method: 'POST', headers: H, body: JSON.stringify({ install: 'inst-borrar-2222', label: 'Borrame', last_t: now, active_s: 0, sessions: 1, ver: '4.69.6', estado: {} }) })).json();
    await fetch(BASE + '/api/collections/tl_events/records', { method: 'POST', headers: H, body: JSON.stringify({ install: 'inst-borrar-2222', sid: 'sborrar', t: now, tipo: 'sesion', d: {}, ver: '4.69.6' }) });
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
    // Datos del admin: nombre y nota se guardan en el servidor; Grupo queda deshabilitado
    const nombreIn = p.locator('input[value="Dani"]');
    await nombreIn.fill('Dani Ruiz'); await nombreIn.press('Tab'); await p.waitForTimeout(600);
    await p.locator('textarea').first().fill('Nota de prueba'); await p.locator('textarea').first().press('Tab'); await p.waitForTimeout(600);
    const dat = await (await fetch(BASE + '/api/collections/tl_players/records?filter=' + encodeURIComponent("install='inst-aaaa-1111'"), { headers: H })).json();
    ok(dat.items[0] && dat.items[0].label === 'Dani Ruiz', 'Datos admin: el nombre se guarda en el servidor');
    ok(dat.items[0] && dat.items[0].adm_nota === 'Nota de prueba', 'Datos admin: la nota se guarda en el servidor');
    // Grupos: crear desde su pantalla, asignar desde la ficha, filtrar en Usuarios y borrar
    await p.locator('a:has-text("Grupos")').first().click();
    await p.getByRole('button', { name: '+ Grupo' }).waitFor();
    await p.getByRole('button', { name: '+ Grupo' }).click();
    await p.locator('#gf-n').fill('Testers QA'); await p.locator('#gf-d').fill('Prueba');
    await p.getByRole('button', { name: 'Guardar' }).click();
    await p.locator('#gf-n').waitFor({ state: 'detached', timeout: 10000 }); // el modal se cierra cuando pbCarga ha terminado
    const gr = await (await fetch(BASE + '/api/collections/tl_grupos/records?filter=' + encodeURIComponent("nombre='Testers QA'"), { headers: H })).json();
    ok(gr.totalItems === 1, 'Grupos: se crea el grupo en el servidor');
    const gid = gr.items[0] && gr.items[0].id;
    // Dani: ficha desde la lista (si había una ficha abierta, primero se vuelve a la lista)
    await p.locator('a:has-text("Usuarios")').first().click();
    if (await p.locator('button', { hasText: 'Volver a la lista' }).count()) await p.locator('button', { hasText: 'Volver a la lista' }).click();
    await p.getByText('Dani Ruiz').first().click();
    const selG = p.locator('select').filter({ has: p.locator('option', { hasText: 'Testers QA' }) }).first();
    await selG.waitFor(); await selG.selectOption('Testers QA');
    await p.waitForFunction(() => JUG.some(j => j.n === 'Dani Ruiz' && j.g === 'Testers QA'));
    const dg = await (await fetch(BASE + '/api/collections/tl_players/records?filter=' + encodeURIComponent("install='inst-aaaa-1111'"), { headers: H })).json();
    ok(dg.items[0] && dg.items[0].adm_grupo === gid, 'Grupos: el jugador queda asignado en el servidor');
    await p.locator('button', { hasText: 'Volver a la lista' }).click();
    await p.locator('span.chip', { hasText: 'Testers QA' }).first().waitFor();
    await p.locator('span.chip', { hasText: 'Testers QA' }).first().click(); await p.waitForTimeout(300);
    ok(await p.getByText('Dani Ruiz').count() >= 1 && await p.getByText('Borrame').count() === 0, 'Filtro: el chip del grupo deja solo a sus miembros');
    await p.locator('a:has-text("Grupos")').first().click();
    await p.getByRole('button', { name: 'Borrar grupo' }).first().waitFor();
    await p.getByRole('button', { name: 'Borrar grupo' }).first().click();
    await p.getByRole('button', { name: 'Confirmar' }).waitFor();
    await p.getByRole('button', { name: 'Confirmar' }).click();
    await p.waitForFunction(() => GRP.length === 0);
    const dg2 = await (await fetch(BASE + '/api/collections/tl_players/records?filter=' + encodeURIComponent("install='inst-aaaa-1111'"), { headers: H })).json();
    ok(dg2.items[0] && !dg2.items[0].adm_grupo, 'Grupos: al borrar el grupo, sus miembros quedan sin grupo');
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
    // Pestañas reales de la ficha y bloqueo de navegador (ida y vuelta)
    await fetch(BASE + '/api/collections/tl_events/records', { method: 'POST', headers: H, body: JSON.stringify({ install: 'inst-aaaa-1111', sid: 'sess-dani-01', t: now, tipo: 'partido', d: {}, ver: '4.69.6' }) });
    const sn = await (await fetch(BASE + '/api/collections/tl_snapshots/records', { method: 'POST', headers: H, body: JSON.stringify({ install: 'inst-aaaa-1111', sid: 'sess-dani-01', t: now, bytes: 2048, ver: '4.69.6', save: { prueba: 1 } }) })).json();
    ok(!!sn.id, 'sembrar partida de Dani');
    await p.click('#side a:has-text("Usuarios")'); await p.waitForTimeout(300);
    if (await p.locator('button', { hasText: 'Volver a la lista' }).count()) { await p.locator('button', { hasText: 'Volver a la lista' }).click(); await p.waitForTimeout(300); }
    await p.getByText('Dani Ruiz').first().click(); await p.waitForTimeout(300);
    const tab = t => p.locator('.tabs button', { hasText: t }).first();
    await tab('Línea de tiempo').click();
    await p.waitForSelector('.tag:has-text("partido")', { timeout: 8000 }).catch(() => {});
    ok(await p.locator('.tag:has-text("partido")').count() >= 1, 'Línea de tiempo: muestra el evento real');
    await tab('Partidas').click(); await p.waitForTimeout(400);
    ok(await p.getByText('2 kB').count() >= 1, 'Partidas: muestra la partida real');
    await tab('Reportes y errores').click(); await p.waitForTimeout(400);
    ok(await p.getByText('Se cuelga al fichar').count() >= 1, 'Reportes y errores: muestra el reporte del jugador');
    await tab('Dispositivo').click(); await p.waitForTimeout(300);
    ok(await p.getByText('Zona horaria').count() >= 1, 'Dispositivo: muestra la ficha técnica');
    await tab('Ficha').click(); await p.waitForTimeout(300);
    await p.locator('button', { hasText: 'Bloquear este navegador' }).first().click(); await p.waitForTimeout(1200);
    const bl = await (await fetch(BASE + '/api/collections/tl_players/records?filter=' + encodeURIComponent("install='inst-aaaa-1111'"), { headers: H })).json();
    ok(bl.items[0] && bl.items[0].adm_bloqueado === true, 'Bloquear: el servidor marca el navegador');
    const t403 = await fetch(BASE + '/tele', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ k: 'k-test', install: 'inst-aaaa-1111', sid: 'sess-dani-01', ctx: { active_s: 5 }, events: [] }) });
    ok(t403.status === 403, 'Bloquear: /tele responde 403 a ese navegador (' + t403.status + ')');
    ok(await p.locator('button', { hasText: 'Desbloquear' }).count() >= 1, 'Bloquear: el botón pasa a Desbloquear');
    await p.locator('button', { hasText: 'Desbloquear' }).first().click(); await p.waitForTimeout(1200);
    const ub = await (await fetch(BASE + '/api/collections/tl_players/records?filter=' + encodeURIComponent("install='inst-aaaa-1111'"), { headers: H })).json();
    ok(ub.items[0] && ub.items[0].adm_bloqueado === false, 'Desbloquear: el servidor libera el navegador');
    const t200 = await fetch(BASE + '/tele', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ k: 'k-test', install: 'inst-aaaa-1111', sid: 'sess-dani-01', ctx: { active_s: 5 }, events: [] }) });
    ok(t200.status === 200, 'Desbloquear: /tele vuelve a responder (' + t200.status + ')');
    await p.locator('button', { hasText: 'Volver a la lista' }).click(); await p.waitForTimeout(300);

    // Borrado de usuario (selección + confirmación)
    await p.click('#side a:has-text("Usuarios")'); await p.waitForTimeout(300);
    await p.click('#side a:has-text("Usuarios")'); await p.waitForTimeout(300);
    if (await p.locator('button', { hasText: 'Volver a la lista' }).count()) { await p.locator('button', { hasText: 'Volver a la lista' }).click(); await p.waitForTimeout(300); }
    await p.locator('tr:has-text("Borrame") input[type=checkbox]').check(); await p.waitForTimeout(200);
    await p.getByRole('button', { name: 'Borrar datos' }).click(); await p.waitForTimeout(300);
    await p.locator('#bd-conf').fill('BORRAR'); await p.getByRole('button', { name: 'Confirmar' }).click(); await p.waitForTimeout(1200);
    const gone = await (await fetch(BASE + '/api/collections/tl_players/records/' + bp.id, { headers: H })).status;
    ok(gone === 404, 'Borrado: la fila del jugador desaparece del servidor (' + gone + ')');
    const evs = await (await fetch(BASE + '/api/collections/tl_events/records?filter=' + encodeURIComponent("install='inst-borrar-2222'"), { headers: H })).json();
    ok(evs.totalItems === 0, 'Borrado: sus eventos se borran');
    ok(await p.getByText('Borrame').count() === 0, 'Borrado: ya no aparece en la lista');
    // baja: el juego de ese navegador recibe {baja:true} y el servidor no vuelve a crear al jugador
    const tb = await (await fetch(BASE + '/tele', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ k: 'k-test', install: 'inst-borrar-2222', sid: 'sess-borrar-01', ctx: { active_s: 5 }, events: [{ tipo: 'x', t: now }] }) })).json();
    ok(tb.baja === true, 'Baja: /tele responde baja:true al jugador borrado');
    const pq = await (await fetch(BASE + '/api/collections/tl_players/records?filter=' + encodeURIComponent("install='inst-borrar-2222'"), { headers: H })).json();
    ok(pq.totalItems === 0, 'Baja: el servidor no recrea al jugador borrado');
    const tv = await (await fetch(BASE + '/tele', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ k: 'k-test', install: 'inst-vivo-4444', sid: 'sess-vivo-0001', ctx: { active_s: 5 }, events: [] }) })).json();
    ok(tv.ok === true && !tv.baja, 'Baja: un jugador no borrado sigue funcionando');
    ok(errs.length === 0, 'sin errores de página: ' + errs.join(' | '));
    await br.close();
  } catch (e) { fails.push('EXCEPCIÓN: ' + e.message.slice(0, 900).replace(/\n/g, ' | ')); try { const pg = br && br.contexts()[0].pages()[0]; if (pg) await pg.screenshot({ path: '/tmp/parche/fallo_admin.png', fullPage: true }); } catch (x) {} } finally { try { if (br) await br.close(); } catch (e) {} srv.kill(); }
  console.log(fails.length ? 'FALLOS:\n- ' + fails.join('\n- ') : 'OK');
  console.log('comprobaciones OK: ' + oks);
  process.exit(fails.length ? 1 : 0);
})();
