/// <reference path="../pb_data/types.d.ts" />
// Goatmaker · códigos canjeables y reportes de jugadores. TODAS cerradas al público (reglas null): solo el superusuario las lee y escribe.
// Los jugadores no tocan las colecciones: usan POST /tele con op:"canje" u op:"reporte" (pb_hooks/tele.pb.js).
migrate((app) => {
  const mk = (name, fields, indexes) => {
    app.save(new Collection({ type: "base", name, listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null, fields, indexes: indexes || [] }));
  };
  const created = { type: "autodate", name: "created", onCreate: true, onUpdate: false };
  mk("tl_codes", [
    { type: "text", name: "code", required: true, max: 24 },          // en mayúsculas y sin guiones; lo que escribe el jugador se normaliza igual
    { type: "text", name: "nota", max: 200 },                         // para quién es / de qué va (solo lo ves tú)
    { type: "json", name: "efectos", maxSize: 4000 },                 // [{k:"dinero", v:50000}, …]
    { type: "number", name: "max_usos" },                             // 0 = sin límite
    { type: "number", name: "usos" },
    { type: "bool", name: "una_por_jugador" },                        // si es true, cada jugador (navegador) solo lo canjea una vez
    { type: "number", name: "desde" }, { type: "number", name: "hasta" },   // ms desde 1970; 0 = sin límite
    { type: "bool", name: "activo" },
    created,
  ], ["CREATE UNIQUE INDEX idx_tl_codes_code ON tl_codes (code)"]);
  mk("tl_canjes", [
    { type: "text", name: "code", required: true, max: 24 }, { type: "text", name: "install", required: true, max: 64 },
    { type: "number", name: "t" }, { type: "json", name: "efectos", maxSize: 4000 }, { type: "text", name: "ver", max: 20 },
    created,
  ], ["CREATE INDEX idx_tl_canjes_code ON tl_canjes (code, install)", "CREATE INDEX idx_tl_canjes_t ON tl_canjes (t)"]);
  mk("tl_reports", [
    { type: "text", name: "install", required: true, max: 64 }, { type: "number", name: "t" },
    { type: "text", name: "tipo", max: 12 },                         // bug · idea · otro
    { type: "text", name: "texto", required: true, max: 4000 },
    { type: "json", name: "ctx", maxSize: 20000 },
    { type: "json", name: "save", maxSize: 6000000 },                 // la partida del jugador, solo si la adjuntó
    { type: "text", name: "estado", max: 16 },                        // nuevo · visto · hecho · descartado
    { type: "text", name: "nota_admin", max: 2000 },
    created,
  ], ["CREATE INDEX idx_tl_reports_t ON tl_reports (t)", "CREATE INDEX idx_tl_reports_install ON tl_reports (install, t)"]);
  mk("tl_intentos", [                                                 // intentos de canje FALLIDOS (freno contra adivinar códigos)
    { type: "text", name: "install", max: 64 }, { type: "number", name: "t" },
  ], ["CREATE INDEX idx_tl_intentos_t ON tl_intentos (t)"]);
}, (app) => {
  ["tl_intentos", "tl_reports", "tl_canjes", "tl_codes"].forEach((n) => { try { app.delete(app.findCollectionByNameOrId(n)); } catch (e) {} });
});
