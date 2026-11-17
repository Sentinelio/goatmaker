/// <reference path="../pb_data/types.d.ts" />
// Goatmaker · configuración de widgets desde el admin. Una sola fila (kind "cfg") con pack: mapa de claves wd.* (tamaños, fondos en data URL, encuadres y velos).
// Cerrada al público: solo el superusuario (panel) la lee y escribe.
migrate((app) => {
  app.save(new Collection({ type: "base", name: "tl_widgets", listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null,
    fields: [
      { type: "text", name: "kind", required: true, max: 20 },
      { type: "json", name: "pack", maxSize: 15000000 },
      { type: "number", name: "t" },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_tl_widgets_kind ON tl_widgets (kind)"],
  }));
}, (app) => {
  try { app.delete(app.findCollectionByNameOrId("tl_widgets")); } catch (e) {}
});
