# Goatmaker · telemetría, códigos, reportes y panel admin

Qué hay en esta carpeta

| Archivo | Para qué |
|---|---|
| `pb_migrations/1763000000_tele.js` | Crea las 4 colecciones `tl_players`, `tl_sessions`, `tl_events`, `tl_snapshots`. Todas cerradas al público. |
| `pb_migrations/1763000002_contenido.js` | Crea `tl_content` (borrador y versiones publicadas) y `tl_cfg` (modo en vivo / publicado). Cerradas al público. |
| `pb_migrations/1763000001_codigos_reportes.js` | Crea `tl_codes`, `tl_canjes`, `tl_reports`, `tl_intentos` (códigos canjeables y reportes). Cerradas al público. |
| `pb_hooks/tele.pb.js` | Ruta `POST /tele`: único punto de entrada de los jugadores. Valida la clave y reparte: telemetría (sin `op`), `op:"canje"` (códigos) y `op:"reporte"`. |
| `goatmaker-admin.html` | Tu panel. Se abre con doble clic (o desde `pb_public/`). Entras con tu superusuario de PocketBase. |

Probado con PocketBase **0.23.12** (hace falta ≥ 0.23: usa `_superusers` y los hooks JS nuevos).

## 1. Instalar en tu PocketBase (en el servidor de casa)

1. **En el explorador de archivos o por SSH:** copia las carpetas `pb_migrations` y `pb_hooks` junto al ejecutable `pocketbase` (si tu otro proyecto ya las usa, copia solo los dos archivos dentro de las existentes; los nombres no chocan).
2. **La clave** puede ir en la variable de entorno `TELE_KEY` o, más fácil en Windows, en un archivo de una línea `pb_hooks/tele.key` (sin clave configurada, `/tele` rechaza todo con 503). Después reinicia PocketBase. Ejemplo Linux:
   `TELE_KEY="pon-aqui-una-clave-larga" ./pocketbase serve --http 0.0.0.0:8090`
   Al arrancar, la migración crea las colecciones sola. (Si PocketBase corre como servicio systemd, añade `Environment=TELE_KEY=...` al servicio.)
3. **En el panel de PocketBase (`/_/`):** comprueba que aparecen las colecciones `tl_*`.

Si prefieres no mezclarlo con tu otro proyecto, levanta una segunda instancia de PocketBase en otro puerto con su propia carpeta.

## 2. URL pública con HTTPS (obligatorio)

El juego en GitHub Pages va por **https**, así que el navegador de tus amigos solo aceptará enviar a un **https** (si no, lo bloquea por contenido mixto).
Dos formas sin abrir puertos del router:

- **Cloudflare Tunnel** (en la terminal del servidor: `cloudflared tunnel --url http://localhost:8090` para probar; para algo fijo, un túnel con tu dominio).
- **Tailscale Funnel** (en la terminal del servidor: `tailscale funnel 8090`).

Te quedará una URL tipo `https://pb.tudominio.com`.

### Dos puertas: solo `/tele` es pública

La URL que va dentro del juego es pública (está en el HTML que descargan tus amigos). Por eso **por esa puerta solo debe pasar `POST /tele`**, que solo sabe escribir. Todo lo demás (el panel de PocketBase `/_/`, la API de lectura) debe quedar fuera de internet.

- **Puerta pública (para el juego):** en el archivo de configuración de Cloudflare Tunnel (en el servidor, `config.yml`):
  ```
  ingress:
    - hostname: pb.tudominio.com
      path: ^/tele$
      service: http://localhost:8090
    - service: http_status:404
  ```
  Con Caddy sería: `handle /tele { reverse_proxy localhost:8090 }` y `handle { respond 404 }`.
- **Puerta privada (para ti y el panel):** entra a PocketBase por Tailscale (`http://nombre-del-servidor:8090`) o por tu red local. En `goatmaker-admin.html` escribes esa dirección. El panel no lleva ninguna URL dentro y no está en GitHub: solo lo abres tú.
- Opcional: en el panel de PocketBase (Settings → Application → Rate limiting) activa el límite de peticiones.

## 3. Activar en el juego

En `goatmaker-pro-v4.67.0.html` hay dos constantes cerca del final del script:

```
var TELE_URL="";   // → "https://pb.tudominio.com"
var TELE_KEY="";   // → la misma clave que TELE_KEY del servidor
```

Con `TELE_URL` vacío la telemetría está **apagada**: el juego no hace ninguna petición de red. Pásame la URL y la clave y te dejo el archivo listo.

La clave va dentro del HTML público, así que no es un secreto fuerte: solo frena a curiosos y bots. Lo que protege tus datos es que las colecciones están cerradas y que la ruta `/tele` solo sabe **escribir**.

## 4. El panel

Abre `goatmaker-admin.html` en el navegador (doble clic), escribe la URL de PocketBase, tu email y contraseña de superusuario.
Pestañas: **Resumen** (jugadores, sesiones, embudo, horas de juego, versiones, dispositivos), **Jugadores** (tabla; escribe el nombre de tu amigo en la primera columna para etiquetarlo), **detalle** (línea de tiempo, nota por partido, partidas guardadas descargables), **Errores** (agrupados) y **Balance** (notas, decisiones más elegidas, nivel por edad, finales de temporada).
Las partidas se descargan como `.json` y se importan tal cual en el juego (Opciones → Importar) para abrir su carrera y reproducir un fallo.

## Qué se envía

- Un id aleatorio por navegador (`lap1-tele-id`). Sin email, sin cookies. La IP no se guarda en ninguna colección.
- Contexto: versión, navegador/sistema, tamaño de pantalla, idioma, zona horaria, tiempo activo, memoria JS.
- Resumen de carrera: nombre del personaje, posición, club, división, temporada, jornada, nivel, fama, dinero, estadísticas.
- Eventos: sesión, carrera, partido (marcador, minutos, nota, goles, tarjetas), decisión (qué opción eligió y en qué minuto), pantallas, avisos, cambio de club/división, lesión, sanción, nivel, temporada nueva, fin de temporada, errores de JavaScript.
- La partida completa (cada ≥ 3 min si cambió, y al cerrar la pestaña). El servidor conserva las 6 últimas por jugador.

Apagar en un navegador concreto (el tuyo, por ejemplo), en la consola del navegador:
`localStorage.setItem('lap1-tele-off','1')`

## Mantenimiento

- Si añades clubes al juego, regenera el mapa `CLUBES` del panel (el panel muestra el código del club si no lo conoce).
- Límite del servidor: 200 eventos y 5 MB de partida por petición; cada evento ≤ 7 KB.
- Borrar a un amigo: en su detalle, «Borrar todos sus datos».

## Panel dentro del propio PocketBase (recomendado)

Copia `pb_public/index.html` junto a `pb_data` (carpeta `pb_public`). PocketBase lo sirve en la raíz de su URL (`/`), así que el panel vive en la **misma dirección privada** que el panel de PocketBase y no necesita CORS: `https://TU-SERVIDOR.ts.net:8447/`. Si pones `--origins=https://sentinelio.github.io` al arrancar, solo el juego (desde GitHub Pages) puede enviar desde un navegador, y el panel sigue funcionando porque es del mismo origen. Por la puerta pública solo debe verse `/tele`, así que `pb_public` nunca queda expuesto a internet.

## Códigos canjeables (regalos) · v4.68.0

En el panel, pestaña **Códigos**: marcas los efectos (dinero, XP, subir de nivel, atributos, ejes, fama, forma, vestuario, curar, abrir el taller), pones los valores, un máximo de usos, una caducidad y si vale una vez por jugador, y pulsas **Crear código**. Te queda copiado (`GM-XXXX-XXXX-XXXX`): se lo mandas a tu amigo. Él lo escribe en el juego, en **Ajustes → Código → Canjear**, y se aplica a su carrera actual.

- **Usos y tiempo**: un código deja de valer cuando se agota, caduca o lo desactivas. Eso lo decide el servidor, dentro de una transacción (si 20 amigos lo escriben a la vez, solo entran los que quepan).
- **Regenerar**: cambia la cadena del código (la vieja deja de valer), pone los usos a cero y lo reactiva con los mismos efectos; te pregunta si quieres darle días de validez nuevos. Útil si se agotó, caducó o se filtró.
- **Freno**: 6 intentos fallidos seguidos por navegador (80 en total) y espera 10 minutos.
- **Versiones**: el juego manda qué efectos conoce; si un código trae un efecto que esa versión no entiende, el servidor lo rechaza **sin gastarlo**.
- **Límite**: el efecto se aplica en el navegador del jugador; sirve para regalos entre amigos, no es un control de acceso fuerte.
- **Añadir un efecto nuevo**: una línea en `EFECTOS` (en el juego) y otra en `CAT` (en el panel). El test del panel comprueba que coinciden.

## Reportes de jugadores · v4.68.0

En el juego: **Ajustes → Reportar** (fallo, idea u otro; con casilla para adjuntar la partida). En el panel, pestaña **Reportes** (el menú muestra cuántos hay nuevos): filtras por estado y tipo, cambias el estado (nuevo, visto, hecho, descartado), escribes tu nota y pulsas **📋 Copiar para Claude**, que deja un texto con tipo, versión, jugador, club, temporada y jornada, navegador y el texto del jugador, listo para pegar. «Descargar partida» baja el `.json` que se importa en el juego para reproducir el fallo. Máximo 6 reportes por navegador y hora.

## Actualizar un servidor que ya tienes en marcha (v4.67.x → 4.68.0)

1. **En el explorador de archivos, en la carpeta del servidor:** haz copia de `pb_hooks\tele.pb.js`. Si el tuyo tiene cambios propios (por ejemplo una ruta `GET /tele`), anótalos: hay que conservarlos al sustituirlo.
2. **Copia** `pb_migrations\1763000001_codigos_reportes.js` a `pb_migrations\`, el nuevo `pb_hooks\tele.pb.js` a `pb_hooks\` y `pb_public\index.html` a `pb_public\`.
3. **En PowerShell (administrador):** reinicia el servicio de PocketBase (`Restart-Service PocketBase-Goatmaker`, o el nombre que tenga). La migración crea las colecciones nuevas al arrancar.
4. **Comprueba** (PowerShell): `curl.exe -s -X POST https://TU-SERVIDOR.ts.net/tele -H "Content-Type: application/json" -d "{\"k\":\"LA-CLAVE\",\"op\":\"canje\",\"install\":\"prueba12345\",\"code\":\"NOEXISTE1\"}"` debe devolver `{"err":"no_existe","ok":false}`.
5. La puerta pública (Funnel) no cambia: sigue siendo solo `/tele`.

## Contenido editable del juego · v4.69.0

Panel → pestaña **Contenido**: reloj de las decisiones, entrenamientos, talentos, tienda y árbol de situaciones (con respuestas y consecuencias). Trabaja sobre un **paquete de cambios** encima del juego de fábrica (solo guarda las diferencias; volver al valor de fábrica borra el cambio).

- **Modo publicado** (por defecto): guardas un borrador, ves la lista de cambios y **publicas una versión** con nota; los jugadores solo reciben lo publicado. Historial con «cargar en el borrador» (volver atrás = volver a publicar esa versión) y «dejar todo de fábrica».
- **Modo en vivo**: lo que guardas en el borrador llega a los jugadores al momento. Cómodo para probar, sin red de seguridad.
- El juego lo pide al abrirse (espera 1,8 s como máximo; sin red usa la última copia que tenía) y valida todo con las reglas del motor: lo que no encaja se descarta y el resto se aplica. Con la telemetría apagada en ese navegador no pide nada (usa su copia).
- Qué NO se puede: borrar (se usa «fuera de catálogo»: no se ofrece, pero quien ya lo tenía lo conserva), ni cambiar la estructura del motor; lo que el juego calcula (textos o botones dinámicos) se ve como «calculado por el juego».
- Aún no hay editor de nombres, ligas, competiciones ni premios (próxima tanda).

### Actualizar el servidor (4.68.x → 4.69.0)
1. **Explorador de archivos:** copia `pb_migrations\1763000002_contenido.js` a `pb_migrations\`, el nuevo `pb_hooks\tele.pb.js` a `pb_hooks\` (conserva tus retoques propios, por ejemplo `GET /tele` → 404) y `pb_public\index.html` a `pb_public\`.
2. **PowerShell (administrador):** `Restart-Service PocketBase-Goatmaker`.
3. **Comprueba** (PowerShell): `curl.exe -s -X POST https://TU-SERVIDOR.ts.net/tele -H "Content-Type: application/json" -d "{\"k\":\"LA-CLAVE\",\"op\":\"contenido\",\"install\":\"prueba12345\",\"have\":0}"` debe devolver `{"modo":"publicado","n":0,"ok":true,"pack":null}`.
4. La puerta pública (Funnel) no cambia: sigue siendo solo `/tele`.
