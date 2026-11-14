/// <reference path="../pb_data/types.d.ts" />
// Goatmaker · contenido editable. Cerradas al público: solo el superusuario (panel) las lee y escribe; el juego las lee por POST /tele op:"contenido".
//   tl_content: kind "draft" (el borrador, un solo registro, con n que sube en cada guardado) o "ver" (versión publicada, n creciente, con nota)
//   tl_cfg: key/val; key "modo" → val {"m":"vivo"|"publicado"}: vivo = los jugadores reciben el borrador al momento; publicado = solo lo publicado
migrate((app) => {
  const mk = (name, fields, indexes) => app.save(new Collection({ type: "base", name, listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null, fields, indexes: indexes || [] }));
  mk("tl_content", [
    { type: "text", name: "kind", required: true, max: 8 },
    { type: "number", name: "n" },                                    // versión publicada (kind=ver) o revisión del borrador (kind=draft)
    { type: "json", name: "pack", maxSize: 2000000 },
    { type: "text", name: "nota", max: 300 },
    { type: "number", name: "t" },
    { type: "text", name: "ver_juego", max: 20 },
  ], ["CREATE INDEX idx_tl_content_kind ON tl_content (kind, n)"]);
  mk("tl_cfg", [
    { type: "text", name: "key", required: true, max: 40 },
    { type: "json", name: "val", maxSize: 20000 },
  ], ["CREATE UNIQUE INDEX idx_tl_cfg_key ON tl_cfg (key)"]);
}, (app) => {
  ["tl_cfg", "tl_content"].forEach((n) => { try { app.delete(app.findCollectionByNameOrId(n)); } catch (e) {} });
});
