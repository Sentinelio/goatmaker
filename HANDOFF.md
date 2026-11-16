# Goatmaker · traspaso de contexto (14 nov 2026, actualizado con la 4.69.0)

Lee esto primero en una sesión nueva. Resume todo lo hecho hasta v4.69.0. Detalle técnico por versión: `dis/sistemas.md`. Diseño de pirámide/edades: doc del proyecto `claude/piramide-y-edades.md` y `piramide.html`.

## 1. Qué es y reglas del dueño (Manu)
- Simulador de carrera de fútbol en **un solo HTML**, en español. Antes «La Primera», ahora **Goatmaker** (4.66.2 lo llamó «Goatmaker Pro»; la 4.68.0 quitó el «Pro» y el subtítulo «Temporada 2026 · 27» de la portada). Archivo de trabajo: `/mnt/user-data/outputs/la-primera.html`; el repo público lo tiene como `index.html`.
- Innegociables: todo lo que se muestra es mecánicamente real; sin tutoriales; clubes y marcas reales; entregas versionadas con md5 (SendUserFile); diseños genéricos y extensibles; los sistemas complejos se validan con calculadoras aparte antes de tocar el juego; Manu aporta las decisiones de diseño.
- Disciplina de parches: parches Python con `assert count==1`, `node --check`, pruebas por mutación, cambios de UI quirúrgicos.
- Trato: español, directo, sin rodeos; en cada paso decir **en qué programa/ventana** se hace (PowerShell, navegador, app de Tailscale…).
- Decisiones de Manu sobre telemetría: sin aviso de consentimiento; recoger todo lo posible; la página de admin no debe exponer el enlace de PocketBase.

## 2. Estado de versiones
| Versión | Qué | md5 |
|---|---|---|
| 4.66.1 | maquetación escritorio | — |
| 4.66.2 | renombrado a Goatmaker Pro | `fb020496b2889b1461012c35d91ed467` |
| 4.67.0 | telemetría apagada por defecto (constantes vacías) | `7c0cbe32894da6cb0397cfbb68d2eca0` |
| 4.67.1 | telemetría activa (solo URL+clave+versión) | `4d6145017f0aaf47e79ae8a13a1c8ffd` |
| 4.68.0 | Goatmaker · códigos canjeables · reportes | `805cb15cd621717aaf6feb45b37a5b04` |
| 4.69.0 | contenido editable desde el panel · reloj de decisiones | `69a14479d52ecf78f8385bd2162cb405` |
| 4.69.1 | cita del míster como barra con dos sliders · avisos y mesas fuera del partido · reportes con más tiempo | `4093e4ec2fb533ce818f57be929bf788` |
| **4.69.2** | cita con barra de tres tramos y ejercicios antes/después del entreno | `11700e3c0736738e45c2a29cbb2e0ea8` |
| **4.69.3** | cita: controles dentro de la barra del día (35 % llegada · 30 % entreno · 35 % salida), un ejercicio por hora, máx. 4 por lado | `d1416bbd2cafdced953138c54bfbb28f` |
| **4.69.4** | cita: barra fina con sliders normales (llegada azul · entreno dorado · salida verde); reportes muestran el motivo exacto del fallo | `ce8c25c2b8defbf69e801088c03c1a85` |
| **4.69.5** | talentos: una pestaña por rama, progreso en pips como talentos.html, puntos libres calculados del presupuesto | `dfece86a27df800b6e05c09d81cf83fb` |
| **4.69.6** | auditoría: fichajes del club con nombre, semillas de texto (agentes, marcas y precios del bazar ya no salen iguales), las mesas no se abren encima de un aviso, la cola se vacía al cambiar de carrera | `ae7f7a13ac739d5bc292848d19971c93` |
| **4.69.7** | baja de usuario: si el admin borra a un jugador, su navegador borra la partida y empieza de cero (tabla `tl_bajas` en el servidor) | `d3afe241c17e4bf2e9fd479e0bd31d20` |
| **4.69.8** | telemetría: el estado del jugador incluye la versión de contenido que tiene (`cont`), para verla en el admin | `ceb6fd11ecdc14467e6293999283e061` |
| **4.69.9** | partido: barras de lectura grises (un toque salta, mantenerlas pausa), la naranja de decisión pausa al mantenerla, cada decisión con su caja de aviso bajo la narración (también tras un gol o tarjeta y en el cierre), titular/suplente en la cabecera, tarjetas del jugador solo por decisiones, cronología compacta | `b60633a0e409ccf510e38c08bb0a36d6` |
| **4.69.10** | partido: las últimas 3 acciones van a la base de la pantalla, con una línea vacía sobre ellas y la caja de resumen/cronología/decisiones arriba | `d353f40dd288ac2de8e758c676d198fe` |
| **4.69.11** | partido: la caja de resumen/cronología/decisiones ocupa todo el espacio libre sobre las últimas acciones (con scroll), en vez de quedar encogida | `4c9b645f6f98e20dfe9ec1e3841e19a2` |
| **4.69.12** | partido: las flechas y pestañas de la caja vuelven a su tamaño; solo el contenido ocupa el espacio libre | `2b3475f57716c6b518ec0218b8d1c996` |

Repo: `github.com/Sentinelio/goatmaker`, rama main, GitHub Pages en `https://sentinelio.github.io/goatmaker/` (misma origin que otra app de Manu, otra ruta). Commit 4.67.1: `b828c51`. Guardado del jugador: `localStorage` con prefijo `lap1-` (clave `lap1-save`), por navegador: cada amigo juega su partida sin ver la de otro.

## 3. Telemetría (4.67.x)
- **Cliente** `TELE` dentro del juego: envuelve `guardar`, `irSec`, `modal`, `elegirOpcion`, `finTemporada`, `empezarCarrera`; encadena `window.onerror`/`unhandledrejection`. Eventos por diferencia de estado (carrera, partido, club, división, lesión, sanción, nivel, temporada nueva) y explícitos (sesión, pantalla, modal, decisión, fin de temporada, error). Cola en `lap1-tele-q` (tope 400), envío ≤150 eventos/petición; 4xx descarta el lote (403 → desactiva), 5xx/red reintenta con espera creciente. Pulso cada 15 s (solo tiempo activo y visible). Partida completa cuando cambió y (fin o >180 s), ≤4,8 MB. Claves: `lap1-tele-id` (id aleatorio), `lap1-tele-off=1` (apagar en ese navegador), `lap1-tele-url/key` (anular).
- **Servidor**: hook PocketBase `pb_hooks/tele.pb.js`, único punto de entrada `POST /tele`: 503 sin clave, 403 clave mala, 400 ids malos, 200 `{"ok":true,"n":N}`. Migración `pb_migrations/1763000000_tele.js` crea `tl_players`, `tl_sessions`, `tl_events`, `tl_snapshots`, cerradas al público. El servidor guarda las 6 últimas partidas por jugador.
- **Panel** `goatmaker-admin.html` (= `pb_public/index.html`): Resumen, Jugadores (etiquetar por nombre), detalle (línea de tiempo, partidas descargables), Errores, Balance. Entra con superusuario de PocketBase. Las partidas descargadas se importan en el juego (Opciones → Importar).
- **Producción (PC de casa)**: PocketBase 0.40.5 en `C:\MyProjects\Goatmaker\Servidor` (servicio NSSM `PocketBase-Goatmaker`, 127.0.0.1:8091). **Dos puertas con Tailscale**: Funnel público solo `https://server-pc.tail3b4002.ts.net/tele`; panel y PocketBase solo por tailnet `https://server-pc.tail3b4002.ts.net:8447/`; `/api/collections/_superusers` bloqueado. Otro proyecto (ShoppingList, :8090) convive y no se toca. Notas del servidor: `C:\MyProjects\Goatmaker\HANDOFF.md`. El agente del servidor editó el hook desplegado (lee `tele.key`, GET /tele → 404): la copia de producción puede diferir de `telemetria/pb_hooks/tele.pb.js`.
- **Clave**: constante `TELE_KEY` del propio `index.html` (pública; solo frena a curiosos). La protección real: colecciones cerradas y `/tele` solo escribe.
- **Pruebas**: `dis/E2E_telemetria.js` (50 comprobaciones contra un PocketBase 0.23.12 real y Chromium; necesita la build con TELE_URL vacío y `PB=/ruta/pocketbase`), `dis/mutar_telemetria.py` (12/12 mutantes), pruebas del panel (16). Regresión completa verde.
- **Pendiente de verificar**: el sandbox no llega a la URL pública (salida bloqueada: 403 del túnel del proxy), así que **no se ha probado el servidor en vivo desde aquí**. Falta: una jornada real con el panel abierto; borrar el jugador de prueba `iprueba123456` desde el panel. Para dar salida a Claude: añadir el dominio en Configuración → Code → entorno → Network access.

## 3b. Códigos y reportes (4.68.0)
- **Códigos**: el admin los crea en el panel (pestaña Códigos) con efectos `[{k,v}]`, usos máximos, caducidad, «una vez por jugador»; se pueden **regenerar**, desactivar y borrar. El jugador los escribe en Ajustes → Código (la pestaña Cheats desapareció) y se aplican a su carrera por las funciones reales del taller. Registro de efectos `EFECTOS` en el juego y catálogo `CAT` en el panel (el test comprueba que coinciden): dinero, xp, niveles, atributos, ejes, fama, vital, vestuario, curar, taller. El efecto `taller` abre en ese dispositivo el taller de pruebas antiguo, dentro de Ajustes → Código.
- **Reportes**: Ajustes → Reportar (fallo/idea/otro, con partida adjunta opcional) → panel, pestaña Reportes (estados, nota, «Copiar para Claude», descargar partida).
- **Servidor**: misma puerta `/tele`, con `op:"canje"` y `op:"reporte"`; migración `1763000001_codigos_reportes.js` (colecciones `tl_codes`, `tl_canjes`, `tl_reports`, `tl_intentos`). Hay que **desplegarlo en el PC de Manu** (copiar migración, hook y `pb_public`, reiniciar el servicio; pasos en `telemetria/LEEME.md`). Producción corre PocketBase 0.40.5; las pruebas, 0.23.12: probar un canje real tras desplegar.
- Pruebas: `E2E_codigos.js` (69), `E2E_panel_codigos.js` (38), `mutar_codigos.py` (28/28). Para las E2E de telemetría y mutaciones del cliente hay que usar una copia del juego con `TELE_URL=""` (`GAME=`), para no hablar con el servidor real.

## 3c. Contenido editable y reloj de decisiones (4.69.0)
Petición de Manu: cuenta atrás de las decisiones configurable y editor de contenido en el admin con página de publicación (por versiones o en vivo). Hecho para: reloj, entrenamientos, talentos, objetos/categorías de la tienda y árbol de situaciones (respuestas y consecuencias). **Falta** (próxima tanda): nombres, ligas, competiciones, premios.
- Juego: módulo `CONT`/`RELOJ` (ver `sistemas.md` 4.69.0). Un **paquete** de diferencias se aplica sobre el contenido de fábrica; todo se valida con los rangos del motor (`CONT_R`); lo inválido se descarta (`CONT.rech`). `off` en lugar de borrar.
- Servidor: migración `1763000002_contenido.js` + `op:"contenido"` en `/tele`. Modo `publicado` (versiones con nota) o `vivo` (el borrador al momento). **Hay que desplegarlo** en el PC de Manu (pasos en `telemetria/LEEME.md`, sección «Contenido editable»). Sin desplegar, el juego sigue igual (la petición falla en silencio).
- Panel: pestaña Contenido. La base de fábrica embebida (`BASE`) se genera con `contExportarBase()` del juego: **si cambia el contenido del juego hay que regenerar el panel** (el test `E2E_panel_contenido.js` P1 lo detecta).
- Pruebas: `E2E_contenido.js` (30), `E2E_panel_contenido.js` (46), `mutar_contenido.py`.

## 4. Diseño en curso: pirámide y edades (nada implementado en el juego)
Resumen (todo en `claude/piramide-y-edades.md`): empezar a los 14 años; puerta de entrada por la media visible tras el ojeo (<50, 50–79, ≥80); cinco rangos de edad (Cantera 14–17, Promesa 18–21, Plenitud 22–27, Madurez 28–33, Veterano 34–38); diez bolsas de equipos con ventana de edad; **entorno** de cinco niveles con dos canales (ritmo y formación = «multiplicador de potencial» que viaja con el jugador); plasticidad por rango; **giros** puntuales; regla «sin callejones, sin garantías»; término de edad de la media «Suave» para que Modrić/Kane sean posibles. Herramienta: `piramide.html`, fuentes en `dis/piramide/`, pruebas `dis/F87_piramide.js` (25.726 comprobaciones) y `dis/E2E_piramide.js` (303), 14+12 mutaciones.
**Decisiones que Manu aún no ha dado**: (1) puerta 50/80 con edad por media y ventana de cada bolsa; (2) los cinco rangos; (3) tope de edad 38 (subirlo exige Retirada); (4) cuarta puerta para buenos veteranos; (5) formación dinámica que viaja con el jugador, sí/no; (6) suavizar el término de edad de la media (recomendado «Suave»); (7) giros con causa visible y tirada por edad o solo por decisiones; (8) calibración de «Normal» (86 como hoy o más bajo, formación de partida −4/−5).
Hallazgo clave del motor: el techo por atributo es `68 + 0,28·puntos − declive`, con la base 68 igual para todos; hoy «normal» ya es top y el pasado casi no deja huella; la media cae 6,6 de golpe a los 31.
Reglas de diseño aprendidas: ver `design-principles.md` del proyecto.

## 5. Otros pendientes
- Tres fallos detectados, a la espera de que Manu apruebe un parche pequeño: compañero «undefined»; agentes/marcas idénticos; fluctuación del bazar.
- Pool de nombres de personas (`dis/nombres/`): **pausado**, Manu no lo ha pedido (se había pedido por error; quería alternativas al nombre «La Primera», ya resuelto).
- Antes de cambiar progresión, talento o atributos: leer `design-principles.md`.

## 6. Cómo reproducir el entorno de pruebas
- Arnés: `dis/correr.sh TEST.js [veces]` genera `lap.js` a partir del HTML (variable `HTML=`), antepone `stub.js` y `post.js` y ejecuta el test con Node.
- Playwright con Chromium (`NODE_PATH=$(npm root -g)`); PocketBase de pruebas 0.23.12 descargado en `/tmp/pbtest/pocketbase` (se pierde al reiniciar el entorno).
- Cada parche: script Python con `assert s.count(a)==1`, luego `node --check` sobre los scripts concatenados y las pruebas relevantes; mutación cuando se toca lógica.
- Commits al repo con los trailers de atribución que indique la sesión.

## 7. Dónde está cada cosa
- Repo `Sentinelio/goatmaker`: `index.html` (juego) y carpeta `dev/` con `dis/` y `telemetria/` (esto).
- Proyecto «Football Pro» (claude.ai): `claude/piramide-y-edades.md`, `claude/goatmaker-traspaso.md` (este texto), `piramide.html`, versiones anteriores del juego.
- Servidor de Manu: ver §3.
