/* ===== E2E · Ajustes y taller de pruebas en un Chromium REAL (móvil 390 px) — v4.66.0 =====
   Uso:  cd <carpeta de trabajo>; node /mnt/user-data/outputs/dis/E2E_ajustes.js        (Playwright ya instalado: require('playwright'))
   Recorre: título → Opciones (sin partida) → las 4 pestañas → taller APAGADO de fábrica → encender → marca ● → recargar (se recuerda)
            → «Saltar la prueba» visible solo encendido → apagar → importar un JSON con el selector de archivos real (situación propia
            sin cond) → Ajustes con carrera → árbol de decisiones. Exige 0 errores de consola/página. Deja capturas shot_*.png en el cwd. */
const { chromium } = require('playwright');
const fs = require('fs');
const URL = 'file://' + (process.env.GAME || '/mnt/user-data/outputs/la-primera.html');   /* GAME=/ruta/otro.html prueba otra copia */
const SP = process.cwd();   /* capturas y JSON temporal salen aquí */
let fails = [], oks = 0;
const ok = (c, m) => { if (c) oks++; else fails.push(m); };
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('console.error: ' + m.text()); });
  const visible = async sel => await page.evaluate(s => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0; }, sel);
  const body = async () => await page.evaluate(() => document.getElementById('sec-body').innerText);

  /* ---- 1 · arranque limpio: título → Opciones → las 4 pestañas ---- */
  await page.goto(URL); await page.waitForTimeout(400);
  ok(await visible('#scr-title'), 'título visible');
  ok(!(await visible('#btn-chsaltar')), 'el botón «Saltar la prueba» no se ve en el título');
  await page.click('text=Opciones'); await page.waitForTimeout(200);
  ok(await visible('#scr-sec'), 'Opciones abre Ajustes sin partida');
  const chips = await page.$$eval('#sec-body .chip', els => els.map(e => e.innerText.trim()));
  ok(chips.length === 4, 'cuatro pestañas en Ajustes (hay ' + chips.length + ': ' + chips.join('|') + ')');
  for (const nombre of ['Partida', 'Contenido', 'Cheats', 'Información']) {
    await page.click('#sec-body .chip:has-text("' + nombre + '")'); await page.waitForTimeout(120);
    const t = await body();
    ok(t.length > 120, 'pestaña «' + nombre + '» con contenido (' + t.length + ' car.)');
    ok(!/undefined|NaN|\[object/.test(t), 'pestaña «' + nombre + '» sin undefined/NaN/[object]');
    if (nombre === 'Contenido') ok(/carrera en marcha/.test(t), 'Contenido sin carrera lo explica');
    if (nombre === 'Partida') ok(/Importar partida/.test(t) && !/Exportar partida/.test(t), 'Partida sin carrera: solo importar');
  }
  /* ---- 2 · Cheats apagado por defecto + interruptor ---- */
  await page.click('#sec-body .chip:has-text("Cheats")'); await page.waitForTimeout(120);
  let t = await body();
  ok(/APAGADO/.test(t), 'Cheats: nace APAGADO');
  ok(!/Atributos|Dinero|Simular|Verano/.test(t.replace(/Taller de pruebas[\s\S]*?Nace apagado/, '')), 'Cheats apagado: no hay trucos a la vista');
  await page.screenshot({ path: SP + '/shot_cheats_off.png' });
  await page.click('#sec-body button.opt:has-text("Taller:")'); await page.waitForTimeout(150);
  t = await body();
  ok(/ENCENDIDO/.test(t), 'el interruptor enciende');
  ok(await page.evaluate(() => /●/.test(document.querySelector('#sec-body .chip.on, #sec-body .chip:nth-child(3)').innerText) || [...document.querySelectorAll('#sec-body .chip')].some(c => /●/.test(c.innerText))), 'el chip Cheats lleva la marca ●');
  await page.screenshot({ path: SP + '/shot_cheats_on_sinpartida.png' });
  const cfg = await page.evaluate(() => localStorage.getItem('lap1-cfg'));
  ok(cfg && JSON.parse(cfg).cheats === true, 'se guarda en localStorage (lap1-cfg=' + cfg + ')');

  /* ---- 3 · recargar: se recuerda; el botón de la prueba aparece ---- */
  await page.reload(); await page.waitForTimeout(400);
  await page.click('text=Opciones'); await page.waitForTimeout(150);
  await page.click('#sec-body .chip:has-text("Cheats")'); await page.waitForTimeout(120);
  ok(/ENCENDIDO/.test(await body()), 'tras recargar sigue ENCENDIDO');
  await page.click('text=Volver al menú'); await page.waitForTimeout(200);
  await page.click('text=Empezar carrera'); await page.waitForTimeout(250);
  const enPos = await visible('#scr-pos');
  ok(enPos, 'Empezar carrera abre la pantalla de puesto');
  ok(await visible('#btn-chsaltar'), 'con el taller ENCENDIDO el botón «Saltar la prueba» se ve');
  await page.screenshot({ path: SP + '/shot_pos_on.png' });

  /* ---- 4 · apagarlo y comprobar que el botón desaparece también en la pantalla de puesto ---- */
  await page.reload(); await page.waitForTimeout(400);
  await page.click('text=Opciones'); await page.waitForTimeout(150);
  await page.click('#sec-body .chip:has-text("Cheats")'); await page.waitForTimeout(120);
  await page.click('#sec-body button.opt:has-text("Taller:")'); await page.waitForTimeout(150);
  ok(/APAGADO/.test(await body()), 'se apaga con el mismo botón');
  await page.reload(); await page.waitForTimeout(400);
  await page.click('text=Empezar carrera'); await page.waitForTimeout(250);
  ok(await visible('#scr-pos') && !(await visible('#btn-chsaltar')), 'apagado: «Saltar la prueba» no se ve en la pantalla de puesto');
  await page.screenshot({ path: SP + '/shot_pos_off.png' });

  /* ---- 5 · importar una partida con una situación propia (el JSON pierde cond) ---- */
  await page.reload(); await page.waitForTimeout(400);
  const json = await page.evaluate(() => {
    S = nuevoEstado('SEV', 'DC', 'Manu', 9, 'D', 'clasico', 22);
    S.compis = crearCompis('SEV', 'Manu'); S.entrenador = crearEntrenador('SEV');
    S.contrato = { salario: 500000, anos: 3, clausula: 12000000, prima: 25000, franja: 'media', exige: 65 };
    S.v = VERSION;
    S.custom = [{ id: 'mi-sit', t: 'Mi situación', x: 'Algo pasa.', custom: true, cond: function () { return true; }, o: [{ l: 'Hacer algo', ok: 'Bien.', mid: 'Normal.', ko: 'Mal.' }] }];
    const j = JSON.stringify(S); S = null; return j;
  });
  fs.writeFileSync(SP + '/partida_importar.json', json);
  await page.reload(); await page.waitForTimeout(400);
  await page.click('text=Opciones'); await page.waitForTimeout(150);
  await page.click('#sec-body .chip:has-text("Partida")'); await page.waitForTimeout(120);
  const [fc] = await Promise.all([page.waitForEvent('filechooser', { timeout: 4000 }).catch(() => null), page.click('button:has-text("Importar partida")')]);
  if (!fc) fails.push('el selector de archivos no se abrió (limitación del navegador sin cabeza o fallo real)');
  else {
    await fc.setFiles(SP + '/partida_importar.json'); await page.waitForTimeout(500);
    const st = await page.evaluate(() => ({ hay: !!S, cond: S && S.custom && S.custom[0] && typeof S.custom[0].cond, hub: !document.getElementById('scr-hub').classList.contains('hidden'), guardada: !!localStorage.getItem('lap1-save') }));
    ok(st.hay && st.cond === 'function', 'importar: la partida entra y la situación propia recupera su cond (' + JSON.stringify(st) + ')');
    ok(st.hub, 'importar: se muestra el hub de la partida');
    ok(st.guardada, 'importar: queda guardada');
    await page.screenshot({ path: SP + '/shot_importada.png' });
    /* con carrera: Ajustes completo */
    await page.evaluate(() => irSec('ajustes')); await page.waitForTimeout(150);
    for (const nombre of ['Partida', 'Contenido', 'Cheats', 'Información']) {
      await page.click('#sec-body .chip:has-text("' + nombre + '")'); await page.waitForTimeout(100);
      const tt = await body(); ok(tt.length > 120 && !/undefined|NaN|\[object/.test(tt), 'con carrera: «' + nombre + '» sana');
      if (nombre === 'Cheats') ok(/APAGADO/.test(tt) && !/Atributos|Simular/.test(tt.replace(/Taller de pruebas[\s\S]*?Nace apagado/, '')), 'con carrera: el taller sigue APAGADO y sin trucos a la vista');
      if (nombre === 'Contenido') ok(/árbol de decisiones/i.test(tt) && /Crear una situación/.test(tt) && /Exportar mis situaciones \(1\)/.test(tt), 'con carrera: Contenido ofrece árbol, editor y exportar (1)');
    }
    await page.click('#sec-body .chip:has-text("Contenido")'); await page.waitForTimeout(150);
    await page.click('button:has-text("Explorar el árbol")', { timeout: 4000 }); await page.waitForTimeout(250);
    ok((await page.evaluate(() => document.getElementById('sec-body').innerText)).length > 200, 'con carrera: el árbol de decisiones se abre');
    await page.screenshot({ path: SP + '/shot_arbol.png' });
  }
  ok(errs.length === 0, 'sin errores de consola/página: ' + errs.slice(0, 4).join(' || '));
  await browser.close();
  if (fails.length) { console.log('✘ E2E: ' + fails.length + ' fallo(s) de ' + (oks + fails.length)); fails.forEach(f => console.log('  · ' + f)); process.exitCode = 1; }
  else console.log('✔ E2E navegador real: ' + oks + ' comprobaciones, 0 fallos');
})().catch(e => { console.log('✘ E2E revienta: ' + (e.stack || e)); process.exit(1); });
