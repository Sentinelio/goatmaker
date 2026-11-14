/// <reference path="../pb_data/types.d.ts" />
// Goatmaker Pro · telemetría — POST /tele
// Un solo punto de entrada para los jugadores. Valida la clave, recorta tamaños y escribe en las colecciones tl_* (cerradas al público).
// La clave: variable de entorno TELE_KEY o, si no existe, la primera línea del archivo pb_hooks/tele.key (cómodo en Windows).
// Sin clave configurada, la ruta rechaza todo (503): no hay clave por defecto.
routerAdd("POST", "/tele", (e) => {
  let KEY = $os.getenv("TELE_KEY") || "";
  if (!KEY) { try { KEY = String(toString($os.readFile(`${__hooks}/tele.key`))).split(/\r?\n/)[0].trim(); } catch (_) {} }
  if (!KEY) return e.json(503, { ok: false, err: "sin clave configurada" });
  const MAX_EV = 200, MAX_SNAP = 5000000;
  let b = {};
  try { b = e.requestInfo().body || {}; } catch (_) { return e.json(400, { ok: false, err: "json" }); }
  if (String(b.k || "") !== KEY) return e.json(403, { ok: false, err: "clave" });
  const install = String(b.install || "").slice(0, 64), sid = String(b.sid || "").slice(0, 64);
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(install) || !/^[A-Za-z0-9_-]{4,64}$/.test(sid)) return e.json(400, { ok: false, err: "id" });
  const ctx = (b.ctx && typeof b.ctx === "object") ? b.ctx : {};
  const evs = Array.isArray(b.events) ? b.events.slice(0, MAX_EV) : [];
  const now = Date.now(), num = (v) => { v = Number(v); return isFinite(v) ? v : 0; };
  const ver = String(ctx.ver || "").slice(0, 20);
  let accepted = 0;
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
