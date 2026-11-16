/* E2E · Pantalla de partido: barras grises (lectura) que saltan con un toque y pausan al mantenerlas,
   barra naranja de decisión que pausa al mantenerla, aviso de cada decisión, titular/suplente en la cabecera
   y tarjetas del jugador solo por decisiones.
   Uso: GAME=/home/claude/goatmaker node E2E_partido_ui.js  (carga dev/dis/partida_importar.json) */
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const GAME = process.env.GAME, WEB = 18101, WURL = 'http://127.0.0.1:' + WEB + '/index.html';
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
    await ctx.addInitScript((save) => {
      if (sessionStorage.getItem('gm-seed')) return;
      sessionStorage.setItem('gm-seed', '1');
      localStorage.setItem('lap1-save', save);
    }, SAVE);
    const p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(WURL, { waitUntil: 'load' }); await sleep(800);
    /* partida de muestra: titular fijado, sin el aviso de pendientes; la previa del vestuario es una decisión */
    await p.evaluate(() => { S = JSON.parse(localStorage.getItem('lap1-save')); normalizarPartida(); S.avisoSaltado = true; S.conv = { rol: 'titular', txt: 'Titular', det: '', jor: S.jornada }; continuar(); iniciarJornada(); });
    await p.evaluate(() => {
      window.__av = { cajas: 0, enPie: 0, textos: [] };
      const orig = pintarMatch;
      pintarMatch = function (c, pie) {
        if (/avisodec/.test(pie || '')) { window.__av.cajas++; window.__av.enPie++; const m = /abtxt">([^<]*)/.exec(pie); window.__av.textos.push(m ? m[1].slice(0, 40) : '?'); }
        return orig.apply(this, arguments);
      };
    });
    for (let i = 0; i < 200; i++) {
      if (await p.locator('.autobar').count() > 0) break;
      const op = p.locator('#ov-match .opt').first();
      if (await op.count()) await op.click().catch(() => {}); else await sleep(100);
    }
    ok(await p.locator('.autobar').count() >= 1, 'Partido: aparece la barra de lectura');
    const col = await p.evaluate(() => getComputedStyle(document.querySelector('.autobar i')).backgroundColor);
    ok(col === 'rgb(125, 134, 153)', 'Barra de lectura en gris (' + col + ')');
    const altoBarra = await p.evaluate(() => document.querySelector('.autobar i').getBoundingClientRect().height);
    ok(altoBarra > 0, 'La barra de lectura se ve (alto del relleno ' + altoBarra + ' px)');
    const rol = await p.evaluate(() => { const e = document.querySelector('.rolx'); return e ? e.textContent : ''; });
    ok(/Titular|Suplente|Fuera/.test(rol), 'Cabecera: se ve si eres titular o suplente (' + rol + ')');

    // un toque en la barra gris salta el contenido al momento
    const antes = await p.evaluate(() => (document.querySelector('.tick') || {}).textContent || '');
    await p.locator('.autobar').first().click({ position: { x: 20, y: 4 } }); await sleep(120);
    const despues = await p.evaluate(() => (document.querySelector('.tick') || {}).textContent || '');
    ok(despues !== antes, 'Toque en la barra gris: salta al momento');

    // mantener la barra gris pausa la lectura; al soltar sigue y no salta
    const bar = await p.locator('.autobar').first().boundingBox();
    await p.mouse.move(bar.x + 30, bar.y + bar.height / 2); await p.mouse.down(); await sleep(450);
    const pausada = await p.evaluate(() => document.querySelector('.autobar i').style.animationPlayState);
    ok(pausada === 'paused', 'Mantener la barra gris pausa la lectura (' + pausada + ')');
    const tAntes = await p.evaluate(() => (document.querySelector('.tick') || {}).textContent || '');
    await p.mouse.up(); await sleep(250);
    const tDesp = await p.evaluate(() => (document.querySelector('.tick') || {}).textContent || '');
    ok(tDesp === tAntes, 'Soltar tras mantener no salta el contenido');
    const reanuda = await p.evaluate(() => { const b = document.querySelector('.autobar i'); return b ? b.style.animationPlayState : 'none'; });
    ok(reanuda === 'running' || reanuda === '', 'Soltar reanuda la lectura (' + reanuda + ')');

    // avanzar saltando hasta la primera decisión
    let dec = false;
    for (let i = 0; i < 500 && !dec; i++) {
      dec = await p.locator('#relojwrap').count() > 0;
      if (dec) break;
      const b = p.locator('.autobar').first();
      if (await b.count()) await b.click({ position: { x: 20, y: 4 }, timeout: 2000 }).catch(() => {}); else await sleep(60);
    }
    ok(dec, 'Llega una decisión del jugador');
    if (dec) {
      const rb = await p.locator('#relojwrap').boundingBox();
      const colDec = await p.evaluate(() => getComputedStyle(document.querySelector('#relojbar')).backgroundColor);
      ok(colDec !== 'rgb(125, 134, 153)', 'La barra de decisión no es gris (' + colDec + ')');
      await p.mouse.move(rb.x + 30, rb.y + rb.height / 2); await p.mouse.down(); await sleep(450);
      const pDec = await p.evaluate(() => DECP !== null);
      ok(pDec, 'Mantener la barra de decisión pausa el tiempo');
      await p.mouse.up(); await sleep(150);
      ok(await p.evaluate(() => DECP === null), 'Soltar la barra de decisión reanuda el tiempo');
      await p.locator('.opt').first().click(); await sleep(150);
    }
    /* cada decisión tiene su caja de aviso, en el pie y no bajo el marcador: se mide jugando el partido entero */
    for (let i = 0; i < 1500; i++) {
      const st = await p.evaluate(() => ({ opts: document.querySelectorAll('#ov-match .opt').length, bar: document.querySelectorAll('.autobar').length, fin: !!document.querySelector('.mfoot .gold-btn') && !document.querySelector('.autobar') }));
      if (st.fin) break;
      if (st.opts) { await p.locator('#ov-match .opt').first().click().catch(() => {}); await sleep(120); continue; }
      if (st.bar) await p.locator('.autobar').first().click({ position: { x: 20, y: 4 }, timeout: 2000 }).catch(() => {}); else await sleep(60);
    }
    const av = await p.evaluate(() => ({ cajas: window.__av.cajas, decisiones: (M && M.decisiones ? M.decisiones.length : -1), textos: window.__av.textos, dec: (M && M.decisiones ? M.decisiones.map(d => (d.min + ' ' + d.cls + ' ' + (d.txt || '').slice(0, 40))) : []) }));
    if (av.cajas !== av.decisiones) console.log('DEBUG', JSON.stringify(av, null, 1));
    ok(av.decisiones > 0 && av.cajas === av.decisiones, 'Cada decisión tiene su caja de aviso (' + av.cajas + ' cajas / ' + av.decisiones + ' decisiones)');
    await p.screenshot({ path: '/tmp/parche/partido_ui.png' });

    // tarjetas del jugador: ninguna sin decisión (simular muchos tramos sin decidir nada)
    const tarj = await p.evaluate(() => {
      var a = S.yo.ta, r = S.yo.tr;
      M.enCampo = true; M.miTA = 0; M.pausa = false;
      for (var i = 0; i < 400; i++) { try { simTramo(); } catch (e) { return 'ERR ' + e.message; } if (M.fin) break; }
      return [S.yo.ta - a, S.yo.tr - r];
    });
    ok(Array.isArray(tarj) && tarj[0] === 0 && tarj[1] === 0, 'Sin decisión no hay tarjetas para el jugador (' + JSON.stringify(tarj) + ')');
    ok(errs.length === 0, 'sin errores de página: ' + errs.join(' | '));
  } catch (e) { fails.push('EXCEPCIÓN: ' + e.message.split('\n')[0]); } finally { try { if (br) await br.close(); } catch (e) {} web.kill(); }
  console.log(fails.length ? 'FALLOS:\n- ' + fails.join('\n- ') : 'OK');
  console.log('comprobaciones OK: ' + oks);
  process.exit(fails.length ? 1 : 0);
})();
