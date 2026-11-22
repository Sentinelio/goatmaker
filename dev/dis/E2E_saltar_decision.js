/* E2E · botón ⏩ «hasta la siguiente decisión» (0.04.020): salta narración y flashes y se para en la siguiente decisión.
   Uso: GAME=/home/claude/goatmaker node E2E_saltar_decision.js */
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const GAME = process.env.GAME, WEB = 18102, WURL = 'http://127.0.0.1:' + WEB + '/index.html';
const SAVE = fs.readFileSync(path.join(__dirname, 'partida_importar.json'), 'utf8');
let fails = [], oks = 0; const ok = (c, m) => { if (c) oks++; else fails.push(m); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const web = spawn('python3', ['-m', 'http.server', String(WEB), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' });
  let br;
  try {
    await sleep(600);
    br = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
    const ctx = await br.newContext({ viewport: { width: 420, height: 880 } });
    await ctx.addInitScript((save) => { if (sessionStorage.getItem('gm-seed')) return; sessionStorage.setItem('gm-seed', '1'); localStorage.setItem('lap1-save', save); }, SAVE);
    const p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(WURL, { waitUntil: 'load' }); await sleep(800);
    await p.evaluate(() => { S = JSON.parse(localStorage.getItem('lap1-save')); normalizarPartida(); S.avisoSaltado = true; S.conv = { rol: 'titular', txt: 'Titular', det: '', jor: S.jornada }; continuar(); iniciarJornada(); });
    /* hasta la primera pantalla de narración (barra gris) */
    for (let i = 0; i < 200; i++) {
      if (await p.locator('.autobar').count() > 0) break;
      const op = p.locator('#ov-match .opt').first();
      if (await op.count()) await op.click().catch(() => {}); else await sleep(100);
    }
    ok(await p.locator('.autobar').count() >= 1, 'se llega a una pantalla de narración');
    ok(await p.locator('button[title^="Saltar hasta la siguiente decisión"]').count() === 1, 'en la narración aparece el botón ⏩');
    /* en una decisión el botón no está */
    const ant = await p.evaluate(() => ({ tr: M.tramo, min: M.min, libro: (M.libro || []).length }));
    await p.locator('button[title^="Saltar hasta la siguiente decisión"]').click();
    await sleep(300);
    const d = await p.evaluate(() => ({ sal: M.saltando, enDec: M.enDecision, fin: M.fin, fase: M.fase, tr: M.tramo, libro: (M.libro || []).length,
      reloj: !!document.getElementById('relojwrap'), cierre: M.fase === 'cierre' || M.fase === 'post' }));
    ok(d.sal === false, 'al llegar a la decisión (o al final) el salto está apagado');
    ok(d.reloj || d.cierre || d.fin, 'se queda en una decisión con reloj, o en el cierre si no hay más');
    ok(d.libro >= ant.libro, 'las líneas saltadas quedan en la crónica (' + ant.libro + ' → ' + d.libro + ')');
    if (d.reloj) {
      ok(d.enDec === true, 'enDecision activo en la decisión');
      ok(await p.locator('button[title^="Saltar hasta la siguiente decisión"]').count() === 0, 'en la decisión no se ofrece ⏩');
      ok(d.tr >= ant.tr, 'el partido ha avanzado (tramo ' + ant.tr + ' → ' + d.tr + ')');
    }
    /* y se puede seguir jugando: elegir una opción devuelve a la narración sin error */
    if (d.reloj) {
      await p.locator('#ov-match .opt').first().click();
      await sleep(300);
      ok(await p.evaluate(() => M && M.saltando !== true), 'tras decidir no sigue saltando');
    }
    ok(errs.length === 0, 'sin excepciones: ' + errs.join(' | ').slice(0, 200));
  } finally { if (br) await br.close(); web.kill(); }
  console.log('SALTAR_DECISION: ' + oks + ' ok · ' + fails.length + ' fallos'); fails.forEach(f => console.log('✘ ' + f));
  process.exit(fails.length ? 1 : 0);
})();
