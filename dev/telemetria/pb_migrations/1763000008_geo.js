/// <reference path="../pb_data/types.d.ts" />
// Goatmaker · ubicación aproximada de cada sesión (ciudad y país por IP). La IP solo se usa para consultar y no se guarda.
migrate((app) => {
  const s = app.findCollectionByNameOrId("tl_sessions");
  s.fields.add(new NumberField({ name: "geo_lat" }));
  s.fields.add(new NumberField({ name: "geo_lon" }));
  s.fields.add(new TextField({ name: "geo_pais", max: 60 }));
  s.fields.add(new TextField({ name: "geo_ciudad", max: 60 }));
  app.save(s);
}, (app) => {
  const s = app.findCollectionByNameOrId("tl_sessions");
  ["geo_lat", "geo_lon", "geo_pais", "geo_ciudad"].forEach((n) => s.fields.removeByName(n));
  app.save(s);
});
