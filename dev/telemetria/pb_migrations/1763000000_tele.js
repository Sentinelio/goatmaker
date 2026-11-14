/// <reference path="../pb_data/types.d.ts" />
// Goatmaker Pro · telemetría — colecciones. TODAS cerradas al público (reglas null): solo el superusuario las lee y escribe.
// Los jugadores no tocan las colecciones: envían a POST /tele (pb_hooks/tele.pb.js), que valida y escribe.
migrate((app) => {
  const mk = (name, fields, indexes) => {
    const c = new Collection({ type: "base", name, listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null, fields, indexes: indexes || [] });
    app.save(c);
  };
  const created = { type: "autodate", name: "created", onCreate: true, onUpdate: false };
  mk("tl_players", [
    { type: "text", name: "install", required: true, max: 64 },
    { type: "text", name: "label", max: 80 },            // el nombre de tu amigo, lo pones tú en el panel
    { type: "number", name: "first_t" }, { type: "number", name: "last_t" },
    { type: "number", name: "active_s" }, { type: "number", name: "sessions" },
    { type: "text", name: "ver", max: 20 }, { type: "text", name: "ua", max: 200 }, { type: "text", name: "scr", max: 40 },
    { type: "text", name: "lang", max: 20 }, { type: "text", name: "tz", max: 60 },
    { type: "json", name: "estado", maxSize: 20000 },   // última foto resumida: club, división, temporada, jornada, nivel…
    created,
  ], ["CREATE UNIQUE INDEX idx_tl_players_install ON tl_players (install)"]);
  mk("tl_sessions", [
    { type: "text", name: "install", required: true, max: 64 }, { type: "text", name: "sid", required: true, max: 64 },
    { type: "number", name: "start_t" }, { type: "number", name: "last_t" }, { type: "number", name: "active_s" },
    { type: "text", name: "ver", max: 20 }, { type: "json", name: "ctx", maxSize: 20000 },
    created,
  ], ["CREATE UNIQUE INDEX idx_tl_sessions_sid ON tl_sessions (sid)", "CREATE INDEX idx_tl_sessions_install ON tl_sessions (install)"]);
  mk("tl_events", [
    { type: "text", name: "install", required: true, max: 64 }, { type: "text", name: "sid", max: 64 },
    { type: "number", name: "t" }, { type: "text", name: "tipo", required: true, max: 40 },
    { type: "json", name: "d", maxSize: 8000 }, { type: "text", name: "ver", max: 20 },
    created,
  ], ["CREATE INDEX idx_tl_events_install_t ON tl_events (install, t)", "CREATE INDEX idx_tl_events_tipo ON tl_events (tipo)"]);
  mk("tl_snapshots", [
    { type: "text", name: "install", required: true, max: 64 }, { type: "text", name: "sid", max: 64 },
    { type: "number", name: "t" }, { type: "number", name: "bytes" }, { type: "text", name: "ver", max: 20 },
    { type: "json", name: "save", maxSize: 6000000 },    // el guardado completo: se puede importar tal cual en el juego
    created,
  ], ["CREATE INDEX idx_tl_snap_install_t ON tl_snapshots (install, t)"]);
}, (app) => {
  ["tl_snapshots", "tl_events", "tl_sessions", "tl_players"].forEach((n) => { try { app.delete(app.findCollectionByNameOrId(n)); } catch (e) {} });
});
