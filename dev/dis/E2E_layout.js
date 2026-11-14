/* ===== E2E · Maquetación: tarjetas, menú inferior y secciones CENTRADOS en un Chromium REAL — v4.66.1 =====
   Uso:  cd <carpeta de trabajo>; node /mnt/user-data/outputs/dis/E2E_layout.js            (GAME=/ruta/otro.html para probar otra copia; por defecto el juego vivo)
   Nace de un fallo real (4.66.0): a partir de 980 px el inicio reservaba una columna lateral de 366 px que renderHub deja SIEMPRE vacía, así que las
   tarjetas quedaban arrinconadas a la izquierda y el menú inferior, que sí está centrado, no coincidía con ellas (192 px de desvío).
   Qué exige, a 11 anchos (390 … 2560 px) y con una carrera REAL de Segunda (tarjeta de último partido, de próximo partido, estado, mensajes):
     · cada hijo de la pantalla visible (inicio, Jugador, Ciudad dep., Despachos, Cuentas, Ajustes) tiene su centro en el eje de la página (±1,5 px)
     · el menú inferior también, y en escritorio (≥ 980 px) mide 520 px (no la mitad del viewport, como antes hasta los 1040)
     · en escritorio las tarjetas del inicio y el menú comparten borde izquierdo, borde derecho y ancho (520 px): quedan alineados de verdad
     · en móvil/tableta (< 980 px) las tarjetas respiran ≥ 12 px a cada lado y el menú ocupa todo el ancho
     · el título también está centrado y nada desborda en horizontal
   Exige 0 errores de consola/página. Si falla, dice qué ancho, qué pantalla y cuántos píxeles de desvío. */
const { chromium } = require('playwright');
const GAME = process.env.GAME || '/mnt/user-data/outputs/la-primera.html';
const ANCHOS = [390, 768, 979, 980, 1024, 1039, 1040, 1280, 1642, 1920, 2560];
const SECCIONES = ['inicio', 'jugador', 'equipo', 'mercado', 'cuentas', 'ajustes'];
const TOL = 1.5;
let fails = [], oks = 0;
const ok = (c, m) => { if (c) oks++; else fails.push(m); };
(async () => {
  const browser = await chromium.launch();
  const errs = [];
  for (const w of ANCHOS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    page.on('pageerror', e => errs.push(w + 'px pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error' && !/fonts\.(googleapis|gstatic)|ERR_TUNNEL|Failed to load resource/.test(m.text())) errs.push(w + 'px console.error: ' + m.text()); });
    await page.goto('file://' + GAME); await page.waitForTimeout(250);

    /* título: la columna de la portada está en el eje */
    const tit = await page.evaluate(() => { const b = document.querySelector('.wrap').getBoundingClientRect(); return { c: (b.left + b.right) / 2, cw: document.documentElement.clientWidth, sw: document.documentElement.scrollWidth, visible: !document.getElementById('scr-title').classList.contains('hidden') }; });
    ok(tit.visible, w + 'px: el título no se ve al arrancar');
    ok(Math.abs(tit.c - tit.cw / 2) <= TOL, w + 'px · título: la columna está a ' + (tit.c - tit.cw / 2).toFixed(1) + ' px del eje');
    ok(tit.sw <= tit.cw, w + 'px · título: desborda en horizontal (' + tit.sw + ' > ' + tit.cw + ')');

    /* una carrera real de Segunda (como la del fallo): hay tarjeta de último partido y de próximo partido */
    const fx = await page.evaluate(() => {
      const idDe = n => Object.keys(EQ).find(k => EQ[k].c === n);
      const id = idDe('Oviedo'), hue = idDe('Huesca'), fer = idDe('Ferrol');
      if (!id || !hue || !fer) return { error: 'faltan clubes de Segunda en EQ' };
      S = nuevoEstado(id, 'DC', 'Manu', 9, 'D', 'clasico', 22);
      S.compis = crearCompis(id, 'Manu'); S.entrenador = crearEntrenador(id);
      S.contrato = { salario: 500000, anos: 3, clausula: 12000000, prima: 25000, franja: 'media', exige: 65 }; S.v = VERSION;
      PARTIDA_ABIERTA = true; S.division = '2'; montarLiga();
      S.jornada = 2; S.hist = [{ jor: 1, rival: fer, casa: false, sc: [0, 1], sinTi: 'sin minutos' }, { jor: 2, rival: hue, casa: true, sc: [5, 2], sinTi: 'sin minutos' }];
      S.racha = [null, null, null, 'V', 'V'];
      return { ok: true };
    });
    ok(fx.ok, w + 'px: no se pudo montar la carrera de prueba (' + (fx.error || '') + ')');
    if (!fx.ok) { await ctx.close(); continue; }

    for (const k of SECCIONES) {
      const m = await page.evaluate((k) => {
        irSec(k);
        const oculto = e => !e || e.classList.contains('hidden');
        const hubVisible = !oculto(document.getElementById('scr-hub'));
        const raiz = hubVisible ? document.getElementById('hub-left') : document.getElementById('sec-body');
        const cw = document.documentElement.clientWidth;
        const hijos = [...raiz.children].map(e => { const b = e.getBoundingClientRect(); return { c: (b.left + b.right) / 2, l: b.left, r: b.right, w: b.width, t: (e.className || e.tagName).toString().slice(0, 18) }; }).filter(x => x.w > 0);
        const mb = document.getElementById('menu').getBoundingClientRect();
        return { hubVisible, cw, sw: document.documentElement.scrollWidth, hijos, menu: { l: mb.left, r: mb.right, w: mb.width, c: (mb.left + mb.right) / 2 },
                 next: !!document.querySelector('#hub-left .nextcard'), ultimo: /Último partido/.test(document.getElementById('hub-left').innerText) };
      }, k);
      const et = w + 'px · ' + k;
      ok(m.hijos.length >= 3, et + ': la pantalla casi no tiene tarjetas (' + m.hijos.length + ')');
      ok(m.hubVisible === (k === 'inicio'), et + ': pantalla equivocada (hub visible=' + m.hubVisible + ')');
      const fuera = m.hijos.filter(x => Math.abs(x.c - m.cw / 2) > TOL);
      ok(fuera.length === 0, et + ': ' + fuera.length + ' de ' + m.hijos.length + ' tarjetas fuera del eje (la «' + (fuera[0] ? fuera[0].t : '') + '» está a ' + (fuera[0] ? (fuera[0].c - m.cw / 2).toFixed(1) : '') + ' px)');
      ok(Math.abs(m.menu.c - m.cw / 2) <= TOL, et + ': el menú está a ' + (m.menu.c - m.cw / 2).toFixed(1) + ' px del eje');
      ok(m.sw <= m.cw, et + ': desborda en horizontal (' + m.sw + ' > ' + m.cw + ')');
      if (w >= 980) ok(Math.abs(m.menu.w - 520) <= TOL, et + ': el menú de escritorio mide ' + m.menu.w.toFixed(1) + ' px y debe medir 520');
      else ok(Math.abs(m.menu.l) <= TOL && Math.abs(m.menu.r - m.cw) <= TOL, et + ': en móvil el menú debe ocupar todo el ancho (' + m.menu.l.toFixed(0) + '–' + m.menu.r.toFixed(0) + ')');
      if (k === 'inicio') {
        ok(m.next && m.ultimo, et + ': faltan la tarjeta de próximo partido o la de último partido (next=' + m.next + ', ultimo=' + m.ultimo + ')');
        if (w >= 980) {
          const malL = m.hijos.filter(x => Math.abs(x.l - m.menu.l) > TOL), malR = m.hijos.filter(x => Math.abs(x.r - m.menu.r) > TOL);
          ok(malL.length === 0 && malR.length === 0, et + ': las tarjetas no comparten bordes con el menú · tarjeta ' + (m.hijos[0].l).toFixed(0) + '–' + (m.hijos[0].r).toFixed(0) + ' · menú ' + m.menu.l.toFixed(0) + '–' + m.menu.r.toFixed(0));
        } else {
          const malM = m.hijos.filter(x => x.l < 12 - TOL || x.r > m.cw - 12 + TOL);
          ok(malM.length === 0, et + ': tarjetas pegadas al borde (' + (m.hijos[0].l).toFixed(0) + '–' + (m.hijos[0].r).toFixed(0) + ' de ' + m.cw + ')');
        }
      }
    }
    await ctx.close();
  }
  ok(errs.length === 0, 'sin errores de consola/página: ' + errs.slice(0, 4).join(' || '));
  await browser.close();
  if (fails.length) { console.log('✘ E2E_layout: ' + fails.length + ' fallo(s) de ' + (oks + fails.length)); fails.slice(0, 40).forEach(f => console.log('  · ' + f)); if (fails.length > 40) console.log('  · … y ' + (fails.length - 40) + ' más'); process.exitCode = 1; }
  else console.log('✔ E2E_layout limpio: ' + oks + ' comprobaciones, ' + ANCHOS.length + ' anchos × ' + SECCIONES.length + ' pantallas, 0 errores de consola');
})().catch(e => { console.log('✘ E2E_layout revienta: ' + (e.stack || e)); process.exit(1); });
