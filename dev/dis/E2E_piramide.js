/* E2E de la calculadora: carga real en Chromium, 0 errores de consola, cada pestaña, cada control, persistencia, móvil.
   Uso:  CALC=/ruta/piramide.html [SHOTS=/carpeta/para/capturas] node dis/E2E_piramide.js        (por defecto, el piramide.html de outputs)
   Cubre: mapa 25×13 igual al motor · puertas + ventanas de edad · aviso sin bolsas · cobertura · curva (7 líneas, minutos, sesiones, umbral)
          reglas editables (umbral, rangos, puertas, ventanas) · persistencia al recargar · restaurar · pegar válido/basura · copiar · extremos · móvil sin desborde.
          Pestaña 5 (giros): cada escenario, ejemplo, edición y valor se recalcula con el núcleo por otro camino · el término de edad no se escapa a las pestañas 1–2 ·
          la regla «sin callejones, sin garantías» celda a celda · persistencia, migración de configuraciones antiguas, pegar y copiar. */
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + (process.env.CALC || '/mnt/user-data/outputs/piramide.html');
const SHOTS = process.env.SHOTS || '';
const F = [], N = {n:0};
const ok = (c, m) => { N.n++; if (!c) F.push(m); };
(async () => {
  const br = await chromium.launch();
  const ctx = await br.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('console', m => { if (m.type() === 'error' && !/fonts\.g(oogleapis|static)\.com/.test((m.location()||{}).url||'')) errs.push('console: ' + m.text() + ' @ ' + ((m.location()||{}).url||'')); });   /* las tipografías de Google no cargan en el sandbox: no es del código */
  pg.on('pageerror', e => errs.push('pageerror: ' + e.message));
  pg.on('dialog', d => d.dismiss().catch(()=>{}));
  await pg.goto(URL); await pg.waitForTimeout(400);
  const shot = async (n) => { if (SHOTS) await pg.screenshot({ path: path.join(SHOTS, n + '.png'), fullPage: true }); };
  const tab = async (t) => { await pg.click('#tabs [data-t="' + t + '"]'); await pg.waitForTimeout(60); };
  const vis = async (id) => pg.evaluate(i => { const e = document.getElementById(i); return !!e && e.offsetParent !== null; }, id);
  const selectPos = async (p) => { await pg.selectOption('#c-pos', p); await pg.waitForTimeout(60); };
  const setEN = async (e, n) => { await pg.evaluate(([e, n]) => { let i = document.getElementById('c-edad'); i.value = e; i.dispatchEvent(new Event('input')); i = document.getElementById('c-nota'); i.value = n; i.dispatchEvent(new Event('input')); }, [e, n]); await pg.waitForTimeout(60); };

  /* 1 · puertas */
  ok(await vis('t-puertas'), 'pestaña Puertas no visible al cargar');
  ok(await pg.locator('#hm .hm-r').count() === 25, 'mapa: se esperaban 25 filas (14–38), hay ' + await pg.locator('#hm .hm-r').count());
  ok(await pg.locator('#hm .hm-r').first().locator('.c').count() === 13, 'mapa: 13 columnas de nota');
  ok(await pg.locator('#hm .c.sel').count() === 1, 'debe haber exactamente una casilla marcada (tu edad/nota)');
  const celda = await pg.evaluate(() => { const r = document.querySelectorAll('#hm .hm-r')[20 - 14]; const cs = r.querySelectorAll('.c'); return cs[Math.round((6.5 - 4) / 0.5)].textContent; });
  const celdaC = await pg.evaluate(() => CORE.mediaAspirante('DC', 20, 6.5));
  ok(+celda === celdaC, 'casilla 20 años / nota 6,5 = ' + celda + ' ≠ motor ' + celdaC);
  await shot('1-puertas-nueva');
  await pg.click('#modo [data-m="hoy"]'); await pg.waitForTimeout(60);
  ok(await pg.locator('#hm .c.f0, #hm .c.f1, #hm .c.f2, #hm .c.f3, #hm .c.f4, #hm .c.f5').count() > 100, 'modo «hoy» no pinta franjas');
  await shot('1-puertas-hoy');
  await pg.click('#modo [data-m="nueva"]');
  ok(await pg.locator('#cober tr').count() === 6, 'cobertura: cabecera + 5 rangos');
  ok(await pg.locator('#cober .cob.cero').count() === 0, 'con la propuesta por defecto hay un hueco de cobertura (celda en rojo): ' + await pg.locator('#cober .cob.cero').count());
  ok(await pg.locator('#cober .cob.na').count() >= 1, 'la cobertura debe marcar alguna banda inalcanzable (Cantera nunca llega a banda alta)');

  /* controles globales */
  await pg.selectOption('#c-pos', 'MC'); await pg.waitForTimeout(40);
  const c2 = await pg.evaluate(() => { const r = document.querySelectorAll('#hm .hm-r')[24 - 14]; return +r.querySelectorAll('.c')[Math.round((7 - 4) / 0.5)].textContent; });
  ok(c2 === await pg.evaluate(() => CORE.mediaAspirante('MC', 24, 7)), 'cambiar de posición no recalcula el mapa');
  await pg.selectOption('#c-pos', 'DC');
  await pg.evaluate(() => { const i = document.getElementById('c-nota'); i.value = '8.4'; i.dispatchEvent(new Event('input')); });
  await pg.evaluate(() => { const i = document.getElementById('c-edad'); i.value = '16'; i.dispatchEvent(new Event('input')); });
  await pg.waitForTimeout(60);
  ok((await pg.textContent('#v-nota')) === '8.4' && (await pg.textContent('#v-edad')) === '16', 'las etiquetas de nota/edad no se actualizan');

  /* 2 · entrada */
  await tab('entrada');
  ok(await vis('t-entrada'), 'pestaña Entrada no visible');
  const mEnt = +(await pg.textContent('#e-media'));
  ok(mEnt === await pg.evaluate(() => CORE.mediaAspirante('DC', 16, 8.4)), 'media de entrada ≠ motor: ' + mEnt);
  ok(await pg.locator('#e-bolsas .bolsa').count() === 10, 'se esperaban 10 bolsas');
  ok(await pg.locator('#e-mesas .mesa').count() >= 1 && await pg.locator('#e-mesas .mesa').count() <= 5, 'mesas de ejemplo fuera de rango');
  const quote = await pg.locator('#e-mesas .q').first().textContent();
  ok(/«.+»/.test(quote), 'la mesa no trae su frase de opinión');
  await shot('2-entrada-16');
  /* un veterano de 36 con nota 5 (banda baja) */
  await pg.evaluate(() => { let i = document.getElementById('c-edad'); i.value = '36'; i.dispatchEvent(new Event('input')); i = document.getElementById('c-nota'); i.value = '4.5'; i.dispatchEvent(new Event('input')); });
  await pg.waitForTimeout(60);
  const bandaTxt = await pg.textContent('#e-ban');
  ok(/baja/i.test(bandaTxt), 'veterano de 36 con nota 4,5: se esperaba banda baja, sale «' + bandaTxt + '»');
  ok(await pg.locator('#e-bolsas .bolsa:not(.off)').count() === 1, '36 años / banda baja: debe quedar una sola bolsa elegible (Segunda Federación), hay ' + await pg.locator('#e-bolsas .bolsa:not(.off)').count());
  ok(/Segunda Federación/.test(await pg.locator('#e-bolsas .bolsa:not(.off) h4').first().innerText()), '36 años / banda baja: la bolsa elegible no es la Segunda Federación');
  await shot('2-entrada-36-baja');
  /* sin ninguna bolsa en la puerta: debe avisar, no romperse */
  await pg.evaluate(() => { let i = document.getElementById('c-edad'); i.value = '20'; i.dispatchEvent(new Event('input')); i = document.getElementById('c-nota'); i.value = '6.3'; i.dispatchEvent(new Event('input')); });
  await tab('reglas');
  await pg.evaluate(() => { document.querySelectorAll('#r-puertas input[data-p="medio"]').forEach(c => { if (c.checked) c.click(); }); });
  await tab('entrada');
  ok(await pg.locator('#e-bolsas h4.warn').count() === 1, 'sin bolsas en la puerta media no sale el aviso «ninguna bolsa elegible»');
  ok(await pg.locator('#e-mesas .mesa').count() === 0, 'sin bolsas elegibles no debe haber mesas');
  await tab('puertas');
  ok(await pg.locator('#cober .cob.cero').count() >= 1, 'la cobertura no marca en rojo la banda media vacía');
  await pg.click('#b-reset'); await pg.waitForTimeout(80);

  /* 3 · curva */
  await tab('curva');
  ok(await vis('t-curva'), 'pestaña Curva no visible');
  ok(await pg.locator('#chart polyline').count() === 7, 'gráfico: se esperaban 7 líneas (edades por defecto), hay ' + await pg.locator('#chart polyline').count());
  ok(await pg.locator('#tabla tr').count() === 8, 'tabla: cabecera + 7 filas');
  await pg.click('#edades [data-a="24"]'); await pg.waitForTimeout(80);
  ok(await pg.locator('#chart polyline').count() === 8, 'añadir una edad no añade línea');
  await pg.click('#edades [data-a="24"]'); await pg.waitForTimeout(80);
  ok(await pg.locator('#chart polyline').count() === 7, 'quitar una edad no quita línea');
  const filaAntes = await pg.locator('#tabla tr').nth(1).innerText();
  await pg.click('#xpp [data-xp="400"]'); await pg.waitForTimeout(100);
  const filaDespues = await pg.locator('#tabla tr').nth(1).innerText();
  ok(filaAntes !== filaDespues, 'cambiar los minutos no cambia la tabla');
  await pg.click('#xpp [data-xp="1700"]');
  await pg.selectOption('#k-ses', '1'); await pg.waitForTimeout(60);
  ok((await pg.locator('#tabla tr').nth(1).innerText()) !== filaAntes, 'cambiar las sesiones no cambia la tabla');
  await pg.selectOption('#k-ses', '3');
  await pg.evaluate(() => { const i = document.getElementById('k-umb'); i.value = '70'; i.dispatchEvent(new Event('input')); });
  await pg.waitForTimeout(60);
  ok(/Temp\. ≥70/i.test(await pg.locator('#tabla tr').first().innerText()), 'el umbral de temporadas no se refleja');
  await pg.evaluate(() => { const i = document.getElementById('k-umb'); i.value = '80'; i.dispatchEvent(new Event('input')); });
  /* comprobación cruzada con el motor del propio núcleo: la fila de 22 años */
  const pico = await pg.evaluate(() => { const r = CORE.simular({ pos: 'DC', edad0: 22, nota: ST.nota, xpTemp: 1700, sesiones: 3, reparto: 'reparto', multEntreno: 1 }); return Math.max(...r.temporadas.map(t => t.media)); });
  const filaTxt = await pg.evaluate(() => [...document.querySelectorAll('#tabla tr')].map(r => r.innerText).find(t => /^\s*22\b/.test(t)) || '');
  ok(filaTxt.indexOf(String(pico)) >= 0, 'el pico de la fila de 22 (' + pico + ') no aparece en la tabla: «' + filaTxt.replace(/\s+/g, ' ') + '»');
  await shot('3-curva');

  /* 4 · reglas */
  await tab('reglas');
  ok(await vis('t-reglas'), 'pestaña Reglas no visible');
  ok(await pg.locator('#r-edad tr').count() === 26, 'tabla de reglas de edad: cabecera + 25 filas');
  ok(await pg.locator('#r-bolsas tr').count() === 11, 'tabla de bolsas: cabecera + 10');
  ok(await pg.locator('#r-puertas tr').count() === 11, 'tabla de puertas: cabecera + 10');
  /* umbral: subir el alto a 90 cambia el mapa */
  await tab('puertas');
  const altosAntes = await pg.locator('#hm .c.b-alto').count();
  await tab('reglas');
  await pg.fill('#u-alto', '90'); await pg.waitForTimeout(80);
  await tab('puertas');
  const altosDespues = await pg.locator('#hm .c.b-alto').count();
  ok(altosDespues < altosAntes, 'subir el umbral alto a 90 no reduce las casillas altas (' + altosAntes + '→' + altosDespues + ')');
  /* rangos: cambiar el nombre de Cantera */
  await tab('reglas');
  await pg.fill('#r-rangos input[data-r="0"][data-f="n"]', 'Base'); await pg.waitForTimeout(60);
  await tab('puertas');
  ok((await pg.locator('#hm').innerText()).toLowerCase().indexOf('base') >= 0, 'renombrar el rango no se refleja en el mapa');
  /* puertas: quitar L4 de la banda baja y comprobar que la entrada de un veterano de 36 / nota 4,5 cambia */
  await pg.evaluate(() => { let i = document.getElementById('c-edad'); i.value = '36'; i.dispatchEvent(new Event('input')); i = document.getElementById('c-nota'); i.value = '4.5'; i.dispatchEvent(new Event('input')); });
  await tab('entrada');
  const offAntes = await pg.locator('#e-bolsas .bolsa.off').count();
  await tab('reglas');
  const chk = pg.locator('#r-puertas input[data-p="bajo"][data-b="L4"]');
  const estaba = await chk.isChecked();
  if (estaba) await chk.uncheck(); else await chk.check();
  await tab('entrada');
  const offDespues = await pg.locator('#e-bolsas .bolsa.off').count();
  ok(offAntes !== offDespues, 'cambiar una puerta no cambia las bolsas elegibles');
  /* ventana de edad: ampliar C del resto a 40 */
  await tab('reglas');
  await pg.fill('#r-bolsas input[data-bo="Cr"][data-f="e1"]', '40'); await pg.waitForTimeout(40);
  const matriz = await pg.textContent('#r-matriz');
  ok(matriz.length > 200, 'matriz bolsa × rango vacía');
  /* persistencia */
  await pg.reload(); await pg.waitForTimeout(300);
  await tab('reglas');
  ok((await pg.inputValue('#u-alto')) === '90', 'el umbral no se guarda al recargar');
  ok((await pg.inputValue('#r-rangos input[data-r="0"][data-f="n"]')) === 'Base', 'el rango renombrado no se guarda al recargar');
  await shot('4-reglas');
  /* pegar una configuración válida y una inválida */
  pg.removeAllListeners('dialog');
  const cfgTxt = await pg.evaluate(() => { const c = JSON.parse(JSON.stringify(CFG)); c.umbral = { bajo: 55, alto: 75 }; return JSON.stringify(c); });
  pg.once('dialog', d => d.accept(cfgTxt).catch(() => {}));
  await pg.click('#b-paste'); await pg.waitForTimeout(150);
  ok((await pg.inputValue('#u-bajo')) === '55' && (await pg.inputValue('#u-alto')) === '75', 'pegar una configuración válida no la aplica');
  let alertas = [];
  pg.on('dialog', d => { alertas.push(d.type() + ':' + d.message()); d.accept('esto no es json').catch(() => {}); });
  await pg.click('#b-paste'); await pg.waitForTimeout(150);
  ok(alertas.some(a => /alert:/.test(a)), 'pegar basura no avisa');
  ok((await pg.inputValue('#u-alto')) === '75', 'pegar basura estropeó la configuración');
  pg.removeAllListeners('dialog'); pg.on('dialog', d => d.dismiss().catch(() => {}));
  /* copiar: el contenido debe ser la configuración actual */
  let copiado = '';
  pg.removeAllListeners('dialog'); pg.on('dialog', d => { copiado = d.defaultValue(); d.dismiss().catch(() => {}); });
  await pg.click('#b-copy'); await pg.waitForTimeout(200);
  if (copiado) ok(JSON.stringify(JSON.parse(copiado)) === (await pg.evaluate(() => JSON.stringify(CFG))), 'lo copiado no es la configuración actual');
  pg.removeAllListeners('dialog'); pg.on('dialog', d => d.dismiss().catch(() => {}));
  /* extremos de los controles */
  for (const [e, n] of [[14, 4.0], [14, 10], [38, 4.0], [38, 10], [31, 6.3]]) {
    await pg.evaluate(([e, n]) => { let i = document.getElementById('c-edad'); i.value = e; i.dispatchEvent(new Event('input')); i = document.getElementById('c-nota'); i.value = n; i.dispatchEvent(new Event('input')); }, [e, n]);
    await pg.waitForTimeout(40);
    ok(/^\d+$/.test((await pg.textContent('#e-media')).trim()), 'extremo ' + e + ' años / nota ' + n + ': la media no es un número');
  }
  /* restaurar */
  await pg.click('#b-reset'); await pg.waitForTimeout(100);
  ok((await pg.inputValue('#u-alto')) === '80', 'Restaurar no devuelve el umbral a 80');
  ok((await pg.inputValue('#r-rangos input[data-r="0"][data-f="n"]')) === 'Cantera', 'Restaurar no devuelve «Cantera»');
  /* copiar configuración (sin portapapeles en headless: el botón no debe lanzar) */
  await pg.click('#b-copy'); await pg.waitForTimeout(100);

  /* 5 · giros: el escenario se recalcula con el núcleo por OTRO camino (esperado) y se compara con lo que pinta la pantalla.
     Los valores por defecto están fijados aquí a propósito: si cambias la propuesta, este test te obliga a decirlo. */
  const NIV0 = { toxico: { ritmo: .6, dForm: -1.2 }, pobre: { ritmo: .8, dForm: -.3 }, normal: { ritmo: 1, dForm: 0 }, bueno: { ritmo: 1.2, dForm: .5 }, elite: { ritmo: 1.4, dForm: 1 } };
  const PL0 = { cantera: 1, promesa: 1, plenitud: .8, madurez: .6, veterano: .4 };
  const esperado = (c) => pg.evaluate((c) => {
    const rango = e => e <= 17 ? 'cantera' : e <= 21 ? 'promesa' : e <= 27 ? 'plenitud' : e <= 33 ? 'madurez' : 'veterano';
    const tr = c.tramos.slice().sort((a, b) => a.de - b.de);
    const nivelEn = a => { let n = 'normal'; tr.forEach(t => { if (a >= t.de) n = t.nivel; }); return n; };
    CORE.setModoEdad(c.modo);
    let R; try { R = CORE.simular({ pos: c.pos, edad0: c.edad, nota: c.nota, xpTemp: c.xp, sesiones: 3, reparto: 'reparto', multEntreno: 1, formMin: c.tope[0], formMax: c.tope[1], form0: c.form0 || 0,
      entornoDe: a => { const n = c.niveles[nivelEn(a)]; return { ritmo: n.ritmo, dForm: n.dForm > 0 ? n.dForm * c.plast[rango(a)] : n.dForm }; },
      girosDe: a => (c.giros || []).filter(g => g.edad === a).reduce((s, g) => s + g.dForm, 0) }); } finally { CORE.setModoEdad('actual'); }
    const p = R.temporadas.reduce((q, t) => t.media > q.media ? t : q, R.temporadas[0]);
    return { media: p.media, edad: p.edad, serie: R.temporadas.map(t => t.media), form: R.temporadas[R.temporadas.length - 1].form };
  }, c);
  const estadoPag = () => pg.evaluate(() => ({ pos: ST.pos, edad: ST.edad, nota: ST.nota, xp: ST.xp, modo: ST.g.modo, tramos: ST.g.tramos, giros: ST.g.giros,
    niveles: CFG.giros.niveles, plast: CFG.giros.plast, tope: [CFG.giros.tope.min, CFG.giros.tope.max], form0: CFG.giros.form0 }));
  const leerMet = () => pg.evaluate(() => [...document.querySelectorAll('#g-met tr')].slice(1).map(tr => [...tr.children].map(td => td.textContent.replace(/\s+/g, ' ').trim())));
  const picoDe = (txt) => { const m = /^(\d+) \((\d+)\)/.exec(txt); return m ? { media: +m[1], edad: +m[2] } : null; };
  const serieDoradaPag = () => pg.evaluate(() => [...document.querySelectorAll('#g-chart svg circle[fill="#c9a227"] title')].map(t => +/media (\d+)/.exec(t.textContent)[1]));
  const chequea = async (et) => {
    /* el modo del núcleo se lee ANTES de recalcular por otro camino: esperado() lo deja siempre en «actual» y taparía una fuga de la pantalla */
    const modoNuc = await pg.evaluate(() => CORE.getModoEdad());
    ok(modoNuc === 'actual', et + ': el término de edad se quedó cambiado en el núcleo (' + modoNuc + '): afectaría a las pestañas 1 y 2');
    const s = await estadoPag(), ex = await esperado(s), met = await leerMet(), mia = picoDe(met[0][2]);
    ok(mia && mia.media === ex.media && mia.edad === ex.edad, et + ': el pico que pinta la pantalla (' + (met[0][2]) + ') ≠ el calculado por otro camino (' + ex.media + ' (' + ex.edad + '))');
    const ser = await serieDoradaPag();
    ok(JSON.stringify(ser) === JSON.stringify(ex.serie), et + ': la serie del gráfico no coincide con el núcleo · ' + ser.join(',') + ' ≠ ' + ex.serie.join(','));
    const hoyEx = await pg.evaluate((s) => { const R = CORE.simular({ pos: s.pos, edad0: s.edad, nota: s.nota, xpTemp: s.xp, sesiones: 3, reparto: 'reparto', multEntreno: 1 }); const p = R.temporadas.reduce((q, t) => t.media > q.media ? t : q, R.temporadas[0]); return p.media + ' (' + p.edad + ')'; }, s);
    ok(met[0][1] === hoyEx, et + ': la columna «Hoy» (' + met[0][1] + ') no es el motor tal cual (' + hoyEx + ')');
    return { s, ex, met };
  };
  await selectPos('DC'); await setEN(20, 6.3);
  await tab('giros'); await pg.waitForTimeout(250);
  ok(await vis('t-giros'), 'pestaña Giros no visible');
  ok(await pg.locator('#g-presets .pill').count() >= 6, 'presets: se esperaban 6 ejemplos');
  ok(await pg.locator('#g-chart svg').count() === 1, 'giros: falta el gráfico');
  ok(await pg.locator('#g-regla tr[data-e]').count() === 10, 'regla: se esperaban 10 filas (14…34)');
  ok(await pg.locator('#g-ver .verd').count() === 4, 'regla: se esperaban 4 veredictos');
  ok(await pg.locator('#g-met tr').count() === 8, 'métricas: cabecera + 7 filas');
  ok(await pg.locator('#g-xpp .pill').count() === 4, 'minutos: faltan las 4 píldoras en la pestaña 5');
  ok((await pg.locator('#g-chart svg polyline').count()) === 2, 'con el término de edad de hoy debe haber 2 líneas (hoy y mi escenario)');
  /* estado de partida: valores por defecto fijados */
  await pg.evaluate(() => { ST.g = { preset: 'inicio', tramos: [{ de: 14, nivel: 'normal' }, { de: 22, nivel: 'bueno' }], giros: [], modo: 'actual' }; renderGEditores(); });
  await pg.waitForTimeout(200);
  let est = await estadoPag();
  const nv = Object.fromEntries(Object.entries(est.niveles).map(([k, v]) => [k, { ritmo: v.ritmo, dForm: v.dForm }]));
  ok(JSON.stringify(nv) === JSON.stringify(NIV0) && JSON.stringify(est.plast) === JSON.stringify(PL0) && est.tope[0] === -10 && est.tope[1] === 6 && est.form0 === 0, 'los valores por defecto de la pestaña 5 han cambiado: ' + JSON.stringify([est.niveles, est.plast, est.tope, est.form0]));
  await chequea('inicio');
  await shot('5-giros-inicio');
  /* cada ejemplo: la pantalla = el núcleo, y deja puestos los mandos de arriba */
  const PRE = await pg.evaluate(() => PRESETS_G.map(p => ({ id: p.id, pos: p.pos, edad: p.edad, nota: p.nota, modo: p.modo, nt: p.tramos.length, ng: p.giros.length, hist: p.hist })));
  for (const P of PRE) {
    await pg.click('#g-presets [data-gp="' + P.id + '"]'); await pg.waitForTimeout(200);
    const r = await chequea('ejemplo «' + P.id + '»');
    ok((await pg.textContent('#v-edad')) === String(P.edad) && (await pg.textContent('#v-nota')) === P.nota.toFixed(1), 'ejemplo «' + P.id + '» no coloca la edad y la nota');
    if (P.pos) ok((await pg.inputValue('#c-pos')) === P.pos, 'ejemplo «' + P.id + '» no coloca la posición');
    ok((await pg.inputValue('#g-modo-s')) === P.modo, 'ejemplo «' + P.id + '» no coloca el término de edad');
    ok(await pg.locator('#g-tramos input[data-f="de"]').count() === P.nt && await pg.locator('#g-giros input[data-f="edad"]').count() === P.ng, 'ejemplo «' + P.id + '»: nº de etapas/giros en los editores');
    ok((await pg.textContent('#g-hist')).trim() === P.hist, 'ejemplo «' + P.id + '»: falta su historia');
    ok(await pg.locator('#g-presets .pill.on').count() === 1, 'ejemplo «' + P.id + '»: debe haber exactamente un ejemplo activo');
    ok((await pg.locator('#g-chart svg polyline').count()) === (P.modo === 'actual' ? 2 : 3), 'ejemplo «' + P.id + '»: líneas del gráfico (3 si el término de edad no es el de hoy)');
    if (P.id === 'hoy') ok(r.met.every(f => f.slice(3).every(c => !/[+−][1-9]/.test(c))), '«Hoy en el juego» debe dar diferencia cero en todas las filas: ' + JSON.stringify(r.met.map(f => f[3])));
    if (P.id === 'xavi' || P.id === 'modric') { const hoyT = picoDe(r.met[4][1]), miaT = picoDe(r.met[4][2]); ok(miaT.media > hoyT.media, '«' + P.id + '»: la mejor media a los 31 o más debería superar a la de hoy (' + r.met[4][1] + ' vs ' + r.met[4][2] + ')'); }
    await shot('5-giros-' + P.id);
  }
  /* mismo escenario con «Como hoy»: el escalón de los 31 vuelve y la línea roja coincide con él */
  await pg.click('#g-presets [data-gp="xavi"]'); await pg.waitForTimeout(150);
  const metSuave = await leerMet();
  await pg.selectOption('#g-modo-s', 'actual'); await pg.waitForTimeout(150);
  const metAct = await leerMet();
  ok(await pg.locator('#g-presets .pill.on[data-gp="custom"]').count() === 1, 'cambiar el término de edad debe pasar a «Escenario propio»');
  ok(picoDe(metAct[4][2]).media < picoDe(metSuave[4][2]).media, 'con «Como hoy» la mejor media a los 31+ debe bajar: ' + metAct[4][2] + ' vs ' + metSuave[4][2]);
  ok(metAct[4][1] === metSuave[4][1], 'cambiar el término de edad no puede tocar la columna «Hoy»');
  await chequea('xavi con «Como hoy»');
  await pg.selectOption('#g-modo-s', 'plano'); await pg.waitForTimeout(150);
  await chequea('xavi con «Plano»');
  /* la tabla del término de edad usa el motor: la columna «Como hoy» = mediaAspirante real */
  const mm = await pg.evaluate(() => [...document.querySelectorAll('#g-modo-m tr')].slice(1).map(tr => [...tr.children].map(td => +td.textContent)));
  const mmEx = await pg.evaluate(() => [30, 31, 32, 34, 36, 38].map(e => CORE.mediaAspirante(ST.pos, e, ST.nota)));
  ok(JSON.stringify(mm.map(f => f[1])) === JSON.stringify(mmEx), 'tabla del término de edad: «Como hoy» ≠ mediaAspirante del motor');
  ok(mm.every(f => f[2] >= f[1] && f[3] >= f[2]), 'tabla del término de edad: «Suave» y «Plano» no pueden quedar por debajo de «Como hoy»');
  /* aislamiento: el término de edad que se prueba en la pestaña 5 no cambia nada en las pestañas 1 y 2 (el modo del núcleo debe volver a «actual» tras pintar la tabla, y un recálculo posterior lo demuestra) */
  await pg.selectOption('#g-modo-s', 'actual'); await pg.waitForTimeout(200);
  await tab('puertas'); await pg.waitForTimeout(150);
  const leeP12 = () => pg.evaluate(() => document.getElementById('t-puertas').innerText + '|' + document.getElementById('t-entrada').innerText);
  const aisl0 = await leeP12();
  await tab('giros'); await pg.selectOption('#g-modo-s', 'suave'); await pg.waitForTimeout(250);
  ok((await pg.evaluate(() => CORE.getModoEdad())) === 'actual', 'aislamiento: con «Suave» elegido, el núcleo no puede quedarse en otro modo fuera de los cálculos de la pestaña 5');
  const [e0A, n0A] = await pg.evaluate(() => [ST.edad, ST.nota]);
  await setEN(e0A, n0A); await pg.waitForTimeout(250);           /* fuerza un recálculo de todas las pestañas */
  await tab('puertas'); await pg.waitForTimeout(150);
  ok((await leeP12()) === aisl0, 'aislamiento: tras elegir «Suave» en la pestaña 5 han cambiado las pestañas 1 o 2');
  await tab('giros'); await pg.selectOption('#g-modo-s', 'plano'); await pg.waitForTimeout(250);
  await setEN(e0A, n0A); await pg.waitForTimeout(250);
  await tab('puertas'); await pg.waitForTimeout(150);
  ok((await leeP12()) === aisl0, 'aislamiento: tras elegir «Plano» en la pestaña 5 han cambiado las pestañas 1 o 2');
  await tab('giros'); await pg.selectOption('#g-modo-s', 'plano'); await pg.waitForTimeout(150);
  /* las pestañas 1 y 2 NO cambian aunque la 5 use otro término de edad */
  await tab('puertas'); await pg.waitForTimeout(80);
  const cel36 = await pg.evaluate(() => { const r = document.querySelectorAll('#hm .hm-r')[36 - 14]; return +r.querySelectorAll('.c')[Math.round((6.5 - 4) / 0.5)].textContent; });
  ok(cel36 === await pg.evaluate(() => { CORE.setModoEdad('actual'); return CORE.mediaAspirante(ST.pos, 36, 6.5); }), 'la pestaña 1 cambió con el término de edad de la pestaña 5');
  await tab('giros'); await pg.waitForTimeout(100);
  /* editores: etapas y giros */
  await pg.click('#g-presets [data-gp="hoy"]'); await pg.waitForTimeout(150);
  const nT0 = await pg.locator('#g-tramos input[data-f="de"]').count();
  await pg.click('#g-addt'); await pg.waitForTimeout(100);
  ok(await pg.locator('#g-tramos input[data-f="de"]').count() === nT0 + 1, 'añadir etapa no añade fila');
  ok(await pg.locator('#g-presets .pill.on[data-gp="custom"]').count() === 1, 'añadir una etapa debe pasar a «Escenario propio»');
  await pg.selectOption('#g-tramos select[data-f="nivel"] >> nth=1', 'toxico'); await pg.waitForTimeout(150);
  let r1 = await chequea('etapa tóxica');
  est = await estadoPag();
  ok(est.tramos.some(t => t.nivel === 'toxico'), 'el cambio de entorno no llega al modelo');
  ok(r1.ex.media < (await esperado(Object.assign({}, est, { tramos: [{ de: 14, nivel: 'normal' }] }))).media, 'un entorno tóxico debe bajar el pico');
  await pg.fill('#g-tramos input[data-ti="1"][data-f="de"]', '99'); await pg.waitForTimeout(100);
  ok((await estadoPag()).tramos[1].de !== 99, 'una edad fuera de 14–38 no debe aceptarse');
  await pg.click('#g-hist'); await pg.waitForTimeout(150);
  ok(await pg.inputValue('#g-tramos input[data-ti="1"][data-f="de"]') !== '99', 'una edad inválida debe deshacerse al salir del campo');
  await pg.fill('#g-tramos input[data-ti="1"][data-f="de"]', '24'); await pg.locator('#g-tramos input[data-ti="1"][data-f="de"]').press('Tab'); await pg.waitForTimeout(150);
  ok((await estadoPag()).tramos[1].de === 24, 'escribir la edad de una etapa no llega al modelo');
  await chequea('etapa a los 24');
  /* escribir mientras sigues dentro de la tabla no la re-pinta (se tragaría el clic siguiente); al salir, se ordena por edad */
  await pg.fill('#g-tramos input[data-ti="0"][data-f="de"]', '30'); await pg.waitForTimeout(80);
  ok(await pg.inputValue('#g-tramos input[data-ti="1"][data-f="de"]') === '24', 'la tabla de etapas se re-pintó mientras escribías');
  await chequea('etapas escritas fuera de orden');
  await pg.click('#g-hist'); await pg.waitForTimeout(150);
  ok(await pg.inputValue('#g-tramos input[data-ti="0"][data-f="de"]') === '24' && await pg.inputValue('#g-tramos input[data-ti="1"][data-f="de"]') === '30', 'al salir de la tabla las etapas no se ordenan por edad');
  ok(await pg.inputValue('#g-tramos select[data-ti="0"]') === 'toxico', 'al ordenar, el entorno se queda con su edad');
  await chequea('etapas reordenadas');
  await pg.click('#g-tramos button[data-tdel="1"]'); await pg.waitForTimeout(120);
  ok(await pg.locator('#g-tramos input[data-f="de"]').count() === nT0, 'quitar etapa no quita la fila');
  await chequea('sin la etapa de los 30');
  await pg.click('#g-addg'); await pg.waitForTimeout(100);
  ok(await pg.locator('#g-giros input[data-f="edad"]').count() === 1, 'añadir giro no añade fila');
  await pg.fill('#g-giros input[data-gi="0"][data-f="edad"]', '24'); await pg.fill('#g-giros input[data-gi="0"][data-f="dForm"]', '5'); await pg.fill('#g-giros input[data-gi="0"][data-f="nombre"]', 'Prueba <b>'); await pg.waitForTimeout(150);
  const r2 = await chequea('giro +5 a los 24');
  ok(/▲\s*\+5,0/.test(await pg.textContent('#g-chart svg')), 'el giro positivo no se marca en el gráfico');
  ok(!(await pg.locator('#g-giros input[data-f="nombre"]').inputValue()).includes('&lt;') && (await pg.innerHTML('#g-chart')).indexOf('<b>') < 0, 'el nombre del giro se inyecta sin escapar');
  await pg.fill('#g-giros input[data-gi="0"][data-f="dForm"]', '-4'); await pg.waitForTimeout(150);
  await chequea('giro −4 a los 24');
  ok(/▼\s*−4,0/.test(await pg.textContent('#g-chart svg')), 'el giro negativo no se marca en el gráfico');
  await pg.fill('#g-giros input[data-gi="0"][data-f="dForm"]', ''); await pg.waitForTimeout(80);
  await pg.click('#g-giros button[data-gdel="0"]'); await pg.waitForTimeout(120);
  ok(await pg.locator('#g-giros input[data-f="edad"]').count() === 0, 'quitar giro no quita la fila');
  /* minutos: las dos tiras de píldoras van a la vez y cambian «Hoy» */
  await pg.click('#g-xpp [data-xp="400"]'); await pg.waitForTimeout(250);
  ok(await pg.locator('#xpp .pill.on[data-xp="400"]').count() === 1 && await pg.locator('#g-xpp .pill.on[data-xp="400"]').count() === 1, 'los minutos no se sincronizan entre las pestañas 3 y 5');
  await chequea('suplente');
  await pg.click('#g-xpp [data-xp="1700"]'); await pg.waitForTimeout(250);
  /* la regla: cada celda = el núcleo por otro camino; veredictos coherentes con las celdas */
  await pg.click('#g-presets [data-gp="hoy"]'); await pg.waitForTimeout(250);
  await selectPos('DC'); await pg.waitForTimeout(300);
  est = await estadoPag();
  const U = await pg.evaluate(() => umbralesPos());
  const celdas = async (E) => pg.evaluate((E) => [...document.querySelectorAll('#g-regla tr[data-e="' + E + '"] .pk')].map(x => x.textContent.replace(/\s+/g, ' ').trim()), E);
  const base = { pos: 'DC', xp: 1700, modo: est.modo, giros: [], niveles: est.niveles, plast: est.plast, tope: est.tope, form0: est.form0 };
  for (const E of [14, 20, 24, 30]) {
    const esc = [ [4.0, [{ de: 14, nivel: 'toxico' }]], [4.0, [{ de: 14, nivel: 'pobre' }, { de: E + 3, nivel: 'elite' }]], [9.5, [{ de: 14, nivel: 'elite' }]], [9.5, [{ de: 14, nivel: 'elite' }, { de: E + 3, nivel: 'toxico' }]], [6.3, [{ de: 14, nivel: 'normal' }]] ];
    const got = await celdas(E), exs = [];
    for (const [nota, tramos] of esc) exs.push(await esperado(Object.assign({}, base, { edad: E, nota, tramos })));
    exs.forEach((x, i) => ok(got[i] === x.media + ' (' + x.edad + ')', 'regla ' + E + ' años, escenario ' + 'ABCDN'[i] + ': pantalla ' + got[i] + ' ≠ núcleo ' + x.media + ' (' + x.edad + ')'));
    const clases = await pg.evaluate((E) => [...document.querySelectorAll('#g-regla tr[data-e="' + E + '"] .pk')].map(x => x.className.replace('pk ', '')), E);
    const tierEx = m => m >= U.mejor ? 't3' : m >= U.top ? 't2' : m >= U.med ? 't1' : 't0';
    exs.forEach((x, i) => ok(clases[i] === tierEx(x.media), 'regla ' + E + ' años, escenario ' + 'ABCDN'[i] + ': color ' + clases[i] + ' ≠ ' + tierEx(x.media) + ' para ' + x.media));
    const veredictos = await pg.evaluate((E) => [...document.querySelectorAll('#g-regla tr[data-e="' + E + '"] .ver')].map(x => x.textContent), E);
    ok(veredictos[0] === (exs[1].media >= U.top ? '✔' : '✘'), 'regla ' + E + ': «sin callejones» no coincide con B ≥ 3.º');
    ok(veredictos[1] === (exs[3].media < U.top ? '✔' : '✘'), 'regla ' + E + ': «sin garantías» no coincide con D < 3.º');
  }
  /* fronteras: B justo en el 3.º cuenta como ✔ (≥) y D justo en el 3.º como ✘ (no es «menor que») */
  const filasRegla = () => pg.evaluate(() => [...document.querySelectorAll('#g-regla tr[data-e]')].map(tr => { const pk = [...tr.querySelectorAll('.pk')].map(x => +x.textContent.trim().split(' ')[0]); return { E: +tr.dataset.e, B: pk[1], D: pk[3], v: [...tr.querySelectorAll('.ver')].map(x => x.textContent) }; }));
  let hitB = null, hitD = null;
  for (let f0 = 0; f0 >= -8 && !hitB; f0 -= 0.5) { await pg.fill('#g-vals input[data-g="form0"]', String(f0)); await pg.waitForTimeout(420); hitB = (await filasRegla()).find(r => r.B === U.top) || null; }
  ok(hitB && hitB.v[0] === '✔', 'frontera: con B == 3.º (' + U.top + ') «sin callejones» debe ser ✔ · ' + JSON.stringify(hitB));
  for (let f0 = 0; f0 <= 8 && !hitD; f0 += 0.5) { await pg.fill('#g-vals input[data-g="form0"]', String(f0)); await pg.waitForTimeout(420); hitD = (await filasRegla()).find(r => r.D === U.top) || null; }
  ok(hitD && hitD.v[1] === '✘', 'frontera: con D == 3.º (' + U.top + ') «sin garantías» debe ser ✘ · ' + JSON.stringify(hitD));
  await pg.fill('#g-vals input[data-g="form0"]', '0'); await pg.waitForTimeout(450);
  ok(await pg.locator('#g-regla tr.off').count() === 4, 'regla: con límite 24 deben quedar fuera de la regla las entradas 26, 28, 30 y 34');
  await shot('5-giros-regla');
  /* tardío: normal hasta los 27, élite desde los 28 con +3 */
  const tardEx = async (modo) => { const x = await esperado(Object.assign({}, base, { edad: 18, nota: 6.5, modo, tramos: [{ de: 14, nivel: 'normal' }, { de: 28, nivel: 'elite' }], giros: [{ edad: 28, dForm: 3 }] }));
    const t = x.serie.map((m, i) => ({ m, e: 18 + i })).filter(z => z.e >= 31); return t.reduce((q, z) => z.m > q.m ? z : q, t[0]); };
  const tA = await tardEx('actual'), tVer = (await pg.textContent('#g-ver')).replace(/\s+/g, ' ');
  ok(tVer.includes('es ' + tA.m + ' (' + tA.e + ') con «Como hoy»'), 'veredicto tardío: esperaba ' + tA.m + ' (' + tA.e + ') con «Como hoy» y la pantalla dice: ' + tVer.slice(tVer.indexOf('Explosiones'), tVer.indexOf('Explosiones') + 230));
  await pg.selectOption('#g-modo-s', 'suave'); await pg.waitForTimeout(450);
  const tS = await tardEx('suave'), tVer2 = (await pg.textContent('#g-ver')).replace(/\s+/g, ' ');
  ok(tVer2.includes('<b>' + tS.m) || tVer2.includes('es ' + tS.m + ' (' + tS.e + ') con «Suave»'), 'veredicto tardío con «Suave»: esperaba ' + tS.m + ' (' + tS.e + ')');
  ok(tS.m > tA.m, 'el término de edad suave debe permitir una mejor media pasados los 30 (' + tS.m + ' vs ' + tA.m + ')');
  await pg.selectOption('#g-modo-s', 'actual'); await pg.waitForTimeout(450);
  /* valores: cambian la carrera y la regla (la regla espera a que pares de escribir) */
  await pg.click('#g-presets [data-gp="modric"]'); await pg.waitForTimeout(300);
  await pg.fill('#g-vals input[data-lv="elite"][data-f="ritmo"]', '2'); await pg.waitForTimeout(500);
  est = await estadoPag(); ok(est.niveles.elite.ritmo === 2, 'cambiar el ritmo de Élite no llega al modelo');
  await chequea('élite con ritmo ×2');
  await pg.fill('#g-vals input[data-lv="bueno"][data-f="dForm"]', '1.5'); await pg.waitForTimeout(500);
  await chequea('bueno con +1,5');
  await pg.fill('#g-vals input[data-g="tmax"]', '2'); await pg.waitForTimeout(500);
  const r3 = await chequea('tope máximo 2');
  ok(r3.ex.form <= 2 + 1e-9, 'la formación supera el tope máximo');
  ok(/\+2,0 \(70,0\)/.test(r3.met[6][2]), 'formación al final con tope 2: ' + r3.met[6][2]);
  await pg.fill('#g-vals input[data-g="tmin"]', '5'); await pg.waitForTimeout(100);
  ok((await estadoPag()).tope[0] !== 5, 'un mínimo por encima del máximo no debe aceptarse');
  await pg.fill('#g-vals input[data-g="tmax"]', '6'); await pg.waitForTimeout(300);
  await pg.fill('#g-vals input[data-pl="madurez"]', '0'); await pg.waitForTimeout(500);
  await chequea('plasticidad de Madurez a 0');
  await pg.fill('#g-vals input[data-pl="madurez"]', ''); await pg.fill('#g-vals input[data-lv="elite"][data-f="ritmo"]', '0'); await pg.waitForTimeout(100);
  ok((await estadoPag()).niveles.elite.ritmo === 2, 'un ritmo 0 o vacío no debe aceptarse');
  /* formación de partida: baja «Normal» por debajo del top y la calibración lo dice */
  await pg.click('#b-reset'); await pg.waitForTimeout(150); await tab('giros'); await selectPos('DC'); await pg.waitForTimeout(400);
  ok((await pg.textContent('#g-ver')).includes('Calibración. Con entorno «Normal» siempre'), 'con formación de partida 0 debe avisar de que «Normal» ya llega al top');
  await pg.fill('#g-vals input[data-g="form0"]', '-6'); await pg.waitForTimeout(600);
  const calFin = (await pg.textContent('#g-ver')).replace(/\s+/g, ' ');
  ok(/Calibración\. Con «Normal» siempre llegan a/.test(calFin), 'con formación de partida −6 la calibración debe pasar a ✔: ' + calFin.slice(calFin.indexOf('Calibración'), calFin.indexOf('Calibración') + 160));
  const norm14 = await celdas(14);
  const nEx = await esperado(Object.assign({}, base, { edad: 14, nota: 6.3, tramos: [{ de: 14, nivel: 'normal' }], form0: -6, niveles: NIV0, plast: PL0, tope: [-10, 6] }));
  ok(norm14[4] === nEx.media + ' (' + nEx.edad + ')', 'regla con formación de partida −6: «Normal siempre» a los 14 = ' + norm14[4] + ' ≠ ' + nEx.media + ' (' + nEx.edad + ')');
  await chequea('con formación de partida −6');
  /* persistencia, migración y pegar */
  await pg.reload(); await pg.waitForTimeout(300);
  ok((await pg.evaluate(() => CFG.giros.form0)) === -6, 'la formación de partida no se guarda al recargar');
  await tab('giros'); await pg.waitForTimeout(250);
  ok(await pg.locator('#g-vals input[data-g="form0"]').inputValue() === '-6', 'el campo no muestra el valor guardado');
  await pg.evaluate(() => { const c = JSON.parse(JSON.stringify(CFG)); delete c.giros; localStorage.setItem('lp-piramide-cfg-v1', JSON.stringify(c)); });
  await pg.reload(); await pg.waitForTimeout(300);
  ok(await pg.evaluate(() => CFG.giros && CFG.giros.tope.max === 6 && CFG.giros.niveles.elite.ritmo === 1.4 && CFG.giros.form0 === 0), 'una configuración guardada sin «giros» no se completa con la propuesta');
  await pg.evaluate(() => { const c = JSON.parse(JSON.stringify(CFG)); c.giros = { niveles: { elite: { ritmo: 'x', dForm: 2 }, toxico: { ritmo: -1, dForm: 'a' } }, tope: { min: 5, max: 1 }, plast: { cantera: -3, promesa: 0.5, rarito: 7 }, form0: 'zz', edadRegla: null }; localStorage.setItem('lp-piramide-cfg-v1', JSON.stringify(c)); });
  await pg.reload(); await pg.waitForTimeout(300);
  const mig = await pg.evaluate(() => ({ er: CFG.giros.niveles.elite.ritmo, ed: CFG.giros.niveles.elite.dForm, tr: CFG.giros.niveles.toxico.ritmo, td: CFG.giros.niveles.toxico.dForm, tope: CFG.giros.tope, pc: CFG.giros.plast.cantera, pp: CFG.giros.plast.promesa, f0: CFG.giros.form0, er2: CFG.giros.edadRegla }));
  ok(mig.er === 1.4 && mig.ed === 2 && mig.tr === 0.6 && mig.td === -1.2 && mig.tope.min === -10 && mig.tope.max === 6 && mig.pc === 1 && mig.pp === 0.5 && mig.f0 === 0 && mig.er2 === 24, 'una configuración guardada con «giros» a medias o rara no se sanea: ' + JSON.stringify(mig));
  pg.removeAllListeners('dialog');
  const cfgSin = await pg.evaluate(() => { const c = JSON.parse(JSON.stringify(CFG)); delete c.giros; c.umbral = { bajo: 52, alto: 78 }; return JSON.stringify(c); });
  pg.once('dialog', d => d.accept(cfgSin).catch(() => {}));
  await pg.click('#b-paste'); await pg.waitForTimeout(250);
  ok(await pg.evaluate(() => CFG.umbral.alto === 78 && CFG.giros && CFG.giros.tope.max === 6), 'pegar una configuración sin «giros» no la completa');
  let copiadoG = '';
  pg.removeAllListeners('dialog'); pg.on('dialog', d => { copiadoG = d.defaultValue(); d.dismiss().catch(() => {}); });
  await pg.click('#b-copy'); await pg.waitForTimeout(200);
  if (copiadoG) ok(JSON.parse(copiadoG).giros && JSON.parse(copiadoG).giros.niveles.elite.ritmo === 1.4, 'lo copiado no incluye los valores de la pestaña 5');
  pg.removeAllListeners('dialog'); pg.on('dialog', d => d.dismiss().catch(() => {}));
  await pg.click('#b-reset'); await pg.waitForTimeout(150);
  /* extremos de edad en la pestaña 5 */
  await tab('giros');
  for (const e of [14, 38]) {
    await pg.evaluate((e) => { const i = document.getElementById('c-edad'); i.value = e; i.dispatchEvent(new Event('input')); }, e); await pg.waitForTimeout(150);
    const m = await leerMet(); ok(m.length === 7 && m.every(f => f[2] && f[2] !== 'NaN'), 'giros: con ' + e + ' años las métricas fallan: ' + JSON.stringify(m[0]));
    await chequea('entra a los ' + e);
  }
  await setEN(20, 6.3); await pg.waitForTimeout(100);

  /* móvil */
  await pg.setViewportSize({ width: 390, height: 844 });
  for (const t of ['puertas', 'entrada', 'curva', 'reglas', 'giros']) {
    await tab(t); await pg.waitForTimeout(80);
    const sw = await pg.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    ok(sw <= 2, 'móvil: la pestaña «' + t + '» desborda en horizontal (' + sw + ' px)');
    await shot('m-' + t);
  }

  ok(errs.length === 0, 'errores de consola/página: ' + errs.slice(0, 4).join(' | '));
  await br.close();
  if (!F.length) console.log('✔ E2E_piramide limpio: ' + N.n + ' comprobaciones, 0 errores de consola');
  else { console.log('✘ E2E_piramide: ' + F.length + ' fallo(s) de ' + N.n); F.forEach(x => console.log('  · ' + x)); process.exit(1); }
})().catch(e => { console.log('✘ E2E_piramide EXCEPCIÓN: ' + e.message); process.exit(2); });
