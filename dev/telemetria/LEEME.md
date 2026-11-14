# Goatmaker Pro · telemetría y panel admin

Qué hay en esta carpeta

| Archivo | Para qué |
|---|---|
| `pb_migrations/1763000000_tele.js` | Crea las 4 colecciones `tl_players`, `tl_sessions`, `tl_events`, `tl_snapshots`. Todas cerradas al público. |
| `pb_hooks/tele.pb.js` | Ruta `POST /tele`: único punto de entrada de los jugadores. Valida la clave, recorta tamaños y escribe. |
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
