/// <reference path="../pb_data/types.d.ts" />
// Goatmaker · grupos de usuarios (para filtrar y, más adelante, avisar). Solo los escribe el admin.
// tl_players.adm_grupo: relación a un grupo (uno como mucho). Si se borra el grupo, el jugador queda sin grupo.
migrate((app) => {
  const g = new Collection({
    type: "base", name: "tl_grupos", listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null,
    fields: [
      { type: "text", name: "nombre", required: true, max: 40 },
      { type: "text", name: "descripcion", max: 200 },
      { type: "autodate", name: "created", onCreate: true, onUpdate: false },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_tl_grupos_nombre ON tl_grupos (nombre)"],
  });
  app.save(g);
  const p = app.findCollectionByNameOrId("tl_players");
  p.fields.add(new RelationField({ name: "adm_grupo", collectionId: app.findCollectionByNameOrId("tl_grupos").id, maxSelect: 1, cascadeDelete: false }));
  app.save(p);
}, (app) => {
  const p = app.findCollectionByNameOrId("tl_players");
  p.fields.removeByName("adm_grupo");
  app.save(p);
  try { app.delete(app.findCollectionByNameOrId("tl_grupos")); } catch (e) {}
});
