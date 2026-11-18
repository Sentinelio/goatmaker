/// <reference path="../pb_data/types.d.ts" />
// Goatmaker · telemetría, canje de códigos y reportes — POST /tele
// Una sola puerta pública. Sin «op» es telemetría; op:"canje" canjea un código; op:"reporte" guarda un reporte del jugador; op:"contenido" entrega el paquete de contenido editable.
// Un solo punto de entrada para los jugadores. Valida la clave, recorta tamaños y escribe en las colecciones tl_* (cerradas al público).
// La clave: variable de entorno TELE_KEY o, si no existe, la primera línea del archivo pb_hooks/tele.key (cómodo en Windows).
// Sin clave configurada, la ruta rechaza todo (503): no hay clave por defecto.
// ubicación aproximada de una sesión nueva (ciudad y país). Solo se consulta; la IP no se guarda.
function geoDe(ip) {
  try {
    if (!ip || /^(10\.|192\.168\.|127\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|::1|f[cd])/i.test(ip)) return null;
    // ipinfo.io por HTTPS. Token opcional en la variable de entorno IPINFO_TOKEN del servidor.
    const tok = $os.getenv("IPINFO_TOKEN");
    const r = $http.send({ url: "https://ipinfo.io/" + encodeURIComponent(ip) + "/json" + (tok ? "?token=" + encodeURIComponent(tok) : ""), method: "GET", timeout: 3 });
    if (r.statusCode !== 200) return null;
    const j = r.json;
    if (!j || !j.loc) return null;
    const ll = String(j.loc).split(",");
    const lat = Number(ll[0]), lon = Number(ll[1]);
    if (!isFinite(lat) || !isFinite(lon)) return null;
    return { lat: Math.round(lat * 10) / 10, lon: Math.round(lon * 10) / 10, pais: String(j.country || "").slice(0, 60), ciudad: String(j.city || "").slice(0, 60) };
  } catch (_) { return null; }
}

routerAdd("POST", "/tele", (e) => {
  let KEY = $os.getenv("TELE_KEY") || "";
  if (!KEY) { try { KEY = String(toString($os.readFile(`${__hooks}/tele.key`))).split(/\r?\n/)[0].trim(); } catch (_) {} }
  if (!KEY) return e.json(503, { ok: false, err: "sin clave configurada" });
  const MAX_EV = 200, MAX_SNAP = 5000000;
  let b = {};
  try { b = e.requestInfo().body || {}; } catch (_) { return e.json(400, { ok: false, err: "json" }); }
  if (String(b.k || "") !== KEY) return e.json(403, { ok: false, err: "clave" });
  const install = String(b.install || "").slice(0, 64), sid = String(b.sid || "").slice(0, 64);
  const op = String(b.op || "");
  // navegador bloqueado desde el admin: 403 para todo (el juego deja de enviar y usa el contenido de fábrica)
  if (/^[A-Za-z0-9_-]{8,64}$/.test(install)) {
    let bloqueado = false;
    try { const P = $app.findFirstRecordByData("tl_players", "install", install); bloqueado = !!P.get("adm_bloqueado"); } catch (_) {}
    if (bloqueado) return e.json(403, { ok: false, err: "bloqueado" });
  }
  if (op === "contenido") {
    // el juego pregunta qué contenido editable le toca. modo vivo = el borrador al momento (n = 1000000 + rev); modo publicado = la última versión (n = su número).
    // have = lo que ya tiene; si coincide, same. Sin nada publicado devuelve n:0 y pack:null (el juego vuelve a su contenido de fábrica).
    if (!/^[A-Za-z0-9_-]{8,64}$/.test(install)) return e.json(400, { ok: false, err: "id" });
    try {
      let modo = "publicado";
      try { const c = $app.findFirstRecordByFilter("tl_cfg", "key = 'modo'"); const j = JSON.parse(c.getString("val")); if (j && j.m === "vivo") modo = "vivo"; } catch (_) {}
      let rec = null, n = 0;
      if (modo === "vivo") { try { rec = $app.findFirstRecordByFilter("tl_content", "kind = 'draft'"); n = 1000000 + (Number(rec.get("n")) || 0); } catch (_) { rec = null; } }
      else { const l = $app.findRecordsByFilter("tl_content", "kind = 'ver'", "-n", 1, 0); if (l.length) { rec = l[0]; n = Number(rec.get("n")) || 0; } }
      if (!rec) return e.json(200, { ok: true, n: 0, pack: null, modo: modo });
      if (Number(b.have) === n) return e.json(200, { ok: true, n: n, same: true, modo: modo });
      let pack = null; try { pack = JSON.parse(rec.getString("pack")); } catch (_) { pack = null; }
      return e.json(200, { ok: true, n: n, pack: pack, modo: modo });
    } catch (err) { return e.json(500, { ok: false, err: String(err).slice(0, 120) }); }
  }
  // jugador dado de baja por el admin: el juego borra su partida y no vuelve a crear el jugador aquí
  if (/^[A-Za-z0-9_-]{8,64}$/.test(install)) {
    let baja = false;
    try { baja = $app.countRecords("tl_bajas", $dbx.exp("install = {:i}", { i: install })) > 0; } catch (_) {}
    if (baja) return e.json(200, { ok: true, baja: true });
  }
  if (op === "canje" || op === "reporte") {
    if (!/^[A-Za-z0-9_-]{8,64}$/.test(install)) return e.json(400, { ok: false, err: "id" });
    const ahora = Date.now();
    if (op === "canje") {
      // freno: pocos intentos FALLIDOS por navegador y por todos a la vez (los códigos son largos, pero así no se puede probar a ciegas)
      const code = String(b.code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
      const fallo = (razon) => {
        try { $app.runInTransaction((tx) => { const r = new Record(tx.findCollectionByNameOrId("tl_intentos")); r.set("install", install); r.set("t", ahora); tx.save(r);
          tx.findRecordsByFilter("tl_intentos", "t < {:v}", "", 200, 0, { v: ahora - 86400000 }).forEach((v) => tx.delete(v)); }); } catch (_) {}
        return e.json(razon === "demasiados" ? 429 : 404, { ok: false, err: razon });
      };
      try {
        const mios = $app.countRecords("tl_intentos", $dbx.exp("install = {:i} AND t > {:v}", { i: install, v: ahora - 600000 }));
        const todos = $app.countRecords("tl_intentos", $dbx.exp("t > {:v}", { v: ahora - 600000 }));
        if (mios >= 6 || todos >= 80) return e.json(429, { ok: false, err: "demasiados" });
      } catch (_) {}
      if (code.length < 4 || code.length > 24) return fallo("no_existe");
      const caps = Array.isArray(b.caps) ? b.caps.map((x) => String(x)) : null;
      let res = null, motivo = "";
      try {
        $app.runInTransaction((tx) => {
          let C;
          try { C = tx.findFirstRecordByData("tl_codes", "code", code); } catch (_) { motivo = "no_existe"; return; }
          let efectos = []; try { const j = JSON.parse(C.getString("efectos") || "[]"); if (Array.isArray(j)) efectos = j; } catch (_) {}
          if (!C.get("activo")) { motivo = "inactivo"; return; }
          const desde = Number(C.get("desde")) || 0, hasta = Number(C.get("hasta")) || 0;
          if (desde && ahora < desde) { motivo = "aun_no"; return; }
          if (hasta && ahora > hasta) { motivo = "caducado"; return; }
          const max = Number(C.get("max_usos")) || 0, usos = Number(C.get("usos")) || 0;
          if (max && usos >= max) { motivo = "agotado"; return; }
          if (caps && efectos.some((x) => !x || caps.indexOf(String(x.k)) < 0)) { motivo = "version"; return; }
          if (C.get("una_por_jugador")) {
            let ya = false; try { tx.findFirstRecordByFilter("tl_canjes", "code = {:c} && install = {:i}", { c: code, i: install }); ya = true; } catch (_) {}
            if (ya) { motivo = "ya_usado"; return; }
          }
          C.set("usos", usos + 1); tx.save(C);
          const R = new Record(tx.findCollectionByNameOrId("tl_canjes"));
          R.set("code", code); R.set("install", install); R.set("t", ahora); R.set("efectos", efectos); R.set("ver", String(b.ver || "").slice(0, 20)); tx.save(R);
          res = efectos;
        });
      } catch (err) { return e.json(500, { ok: false, err: String(err).slice(0, 120) }); }
      if (!res) return motivo === "version" ? e.json(409, { ok: false, err: "version" }) : fallo(motivo || "no_existe");
      return e.json(200, { ok: true, efectos: res });
    }
    // op === "reporte"
    const texto = String(b.texto || "").trim().slice(0, 4000);
    if (texto.length < 3) return e.json(400, { ok: false, err: "vacio" });
    try {
      const n = $app.countRecords("tl_reports", $dbx.exp("install = {:i} AND t > {:v}", { i: install, v: ahora - 3600000 }));
      if (n >= 6) return e.json(429, { ok: false, err: "demasiados" });
      const R = new Record($app.findCollectionByNameOrId("tl_reports"));
      const tipo = ["bug", "idea", "otro"].indexOf(String(b.tipo)) >= 0 ? String(b.tipo) : "otro";
      let ctx = (b.ctx && typeof b.ctx === "object") ? b.ctx : {}; if (JSON.stringify(ctx).length > 15000) ctx = { recortado: true };
      R.set("install", install); R.set("t", ahora); R.set("tipo", tipo); R.set("texto", texto); R.set("estado", "nuevo");
      ctx.adjunta = false;
      if (b.save && typeof b.save === "object") { const raw = JSON.stringify(b.save); if (raw.length <= 5000000) { R.set("save", b.save); ctx.adjunta = true; } }
      R.set("ctx", ctx);
      $app.save(R);
      return e.json(200, { ok: true, id: R.id });
    } catch (err) { return e.json(500, { ok: false, err: String(err).slice(0, 120) }); }
  }
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(install) || !/^[A-Za-z0-9_-]{4,64}$/.test(sid)) return e.json(400, { ok: false, err: "id" });
  const ctx = (b.ctx && typeof b.ctx === "object") ? b.ctx : {};
  const evs = Array.isArray(b.events) ? b.events.slice(0, MAX_EV) : [];
  const now = Date.now(), num = (v) => { v = Number(v); return isFinite(v) ? v : 0; };
  const ver = String(ctx.ver || "").slice(0, 20);
  let accepted = 0;
  // sesión nueva: se localiza una vez (fuera de la transacción, porque hace una petición de red)
  let nuevaSesion = false;
  try { $app.findFirstRecordByData("tl_sessions", "sid", sid); } catch (_) { nuevaSesion = true; }
  const geo = nuevaSesion ? geoDe(e.realIP()) : null;
  try {
    $app.runInTransaction((tx) => {
      // jugador (upsert)
      let P;
      try { P = tx.findFirstRecordByData("tl_players", "install", install); }
      catch (_) { P = new Record(tx.findCollectionByNameOrId("tl_players")); P.set("install", install); P.set("first_t", now); P.set("sessions", 0); P.set("active_s", 0); }
      // sesión (upsert)
      let S, nueva = false;
      try { S = tx.findFirstRecordByData("tl_sessions", "sid", sid); }
      catch (_) { S = new Record(tx.findCollectionByNameOrId("tl_sessions")); S.set("sid", sid); S.set("install", install); S.set("start_t", num(ctx.start_t) || now); S.set("active_s", 0); nueva = true; }
      const act = Math.max(0, Math.min(num(ctx.active_s), 86400));
      const antes = num(S.get("active_s"));
      S.set("last_t", now); S.set("ver", ver); S.set("ctx", { scr: ctx.scr, vp: ctx.vp, backend: ctx.backend, mem: ctx.mem, saveKB: ctx.saveKB, load_ms: ctx.load_ms, online: ctx.online });
      if (act > antes) S.set("active_s", act);
      if (nueva && geo) { S.set("geo_lat", geo.lat); S.set("geo_lon", geo.lon); S.set("geo_pais", geo.pais); S.set("geo_ciudad", geo.ciudad); }
      tx.save(S);
      P.set("last_t", now); P.set("ver", ver);
      P.set("ua", String(ctx.ua || "").slice(0, 200)); P.set("scr", String(ctx.scr || "").slice(0, 40));
      P.set("lang", String(ctx.lang || "").slice(0, 20)); P.set("tz", String(ctx.tz || "").slice(0, 60));
      if (nueva) P.set("sessions", num(P.get("sessions")) + 1);
      if (act > antes) P.set("active_s", num(P.get("active_s")) + (act - antes));
      if (ctx.estado && typeof ctx.estado === "object") P.set("estado", ctx.estado);
      tx.save(P);
      // eventos
      const col = tx.findCollectionByNameOrId("tl_events");
      evs.forEach((x) => {
        if (!x || typeof x !== "object") return;
        const tipo = String(x.tipo || "").slice(0, 40); if (!tipo) return;
        let d = (x.d && typeof x.d === "object") ? x.d : {};
        if (JSON.stringify(d).length > 7000) d = { recortado: true };
        const r = new Record(col);
        r.set("install", install); r.set("sid", sid); r.set("t", num(x.t) || now); r.set("tipo", tipo); r.set("d", d); r.set("ver", ver);
        tx.save(r); accepted++;
      });
      // partida completa (opcional)
      if (b.snap && typeof b.snap === "object") {
        const raw = JSON.stringify(b.snap);
        if (raw.length <= MAX_SNAP) {
          const r = new Record(tx.findCollectionByNameOrId("tl_snapshots"));
          r.set("install", install); r.set("sid", sid); r.set("t", now); r.set("bytes", raw.length); r.set("ver", ver); r.set("save", b.snap);
          tx.save(r);
          // conserva solo las 6 últimas por jugador
          const viejas = tx.findRecordsByFilter("tl_snapshots", "install = {:i}", "-t", 50, 6, { i: install });
          viejas.forEach((v) => tx.delete(v));
        }
      }
    });
  } catch (err) { return e.json(500, { ok: false, err: String(err).slice(0, 120) }); }
  return e.json(200, { ok: true, n: accepted });
});
