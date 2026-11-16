/// <reference path="../pb_data/types.d.ts" />
// Goatmaker · datos que solo escribe el admin en la ficha del jugador. «label» (nombre) ya existía en tl_players.
// adm_nota: nota privada del admin. El juego nunca la toca.
migrate((app) => {
  const c = app.findCollectionByNameOrId("tl_players");
  c.fields.add(new TextField({ name: "adm_nota", max: 2000 }));
  app.save(c);
}, (app) => {
  const c = app.findCollectionByNameOrId("tl_players");
  c.fields.removeByName("adm_nota");
  app.save(c);
});
