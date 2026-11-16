/// <reference path="../pb_data/types.d.ts" />
// Goatmaker · bloqueo de navegadores desde el admin. adm_bloqueado: si es true, /tele responde 403 a ese jugador (telemetría, canjes, reportes y contenido).
migrate((app) => {
  const c = app.findCollectionByNameOrId("tl_players");
  c.fields.add(new BoolField({ name: "adm_bloqueado" }));
  app.save(c);
}, (app) => {
  const c = app.findCollectionByNameOrId("tl_players");
  c.fields.removeByName("adm_bloqueado");
  app.save(c);
});
