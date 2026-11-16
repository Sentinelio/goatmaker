/// <reference path="../pb_data/types.d.ts" />
// Goatmaker · bajas de usuarios. Cuando el admin borra un jugador, se guarda aquí su id de instalación.
// POST /tele responde {baja:true} a ese id: el juego borra su partida y su identidad de telemetría, y no vuelve a crear el jugador en el servidor.
// Colección cerrada al público (reglas null): solo el superusuario la escribe.
migrate((app) => {
  const col = new Collection({
    type: "base", name: "tl_bajas", listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null,
    fields: [
      { type: "text", name: "install", required: true, max: 64 },
      { type: "number", name: "t" },
      { type: "autodate", name: "created", onCreate: true, onUpdate: false },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_tl_bajas_install ON tl_bajas (install)"],
  });
  app.save(col);
}, (app) => {
  try { app.delete(app.findCollectionByNameOrId("tl_bajas")); } catch (e) {}
});
