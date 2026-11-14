# LA PRIMERA · Mapa RPG
### Auditoría de parámetros, conexiones y huecos — v4.41.0
*Método: escáner de escritores/lectores sobre el código real (grep), con verificación manual de cada cabo dudoso. Nada de memoria: líneas.*

---

## I · Los parámetros nucleares

| Parámetro | Rango | Lo escriben | Lo leen | Veredicto |
|---|---|---|---|---|
| **S.forma** | 20–100 | entreno (coste), derrotas, vicios (−1.5/−3.5/−6), bazar (regen recuperación/sueño/chef), escapadas (−2) | `formaM` **en el motor del partido** (0.92–1.08 sobre λ), cansancio como motivo de cambio, ficha | ✔ bucle cerrado, toca el césped |
| **S.conf** | 5–95 | resultados, decisiones de vestuario, mercado (rechazos, ventas de compis), capricho² (drena −1/sem), bazar (mascota, nutrición, consumibles), robos (−3) | multiplicador de **gananciaEntreno** (0.85+conf/300), golpes post-derrota, textos | ✔ bucle; llega al césped **por cadena** (conf→entreno→attr→PROBS) |
| **S.mister** | 5–95 | decisiones, reto, maniobras (`misterHit` ×amort del jefe de prensa), coach mental (+0.6/sem), renovaciones | titularidad, reto, negociaciones, rumor-yo («pedir hablar»), destitución | ✔ el eje político del juego |
| **S.dinero** | ≥0 | nómina/prima/goles, reto premio, multas, bazar (compras + upkeep semanal + robos), maniobras | catálogo (candados de fondos), caprichos («solo pica lo que ves posible»), maniobras | ✔ ahora con **demanda real** (bazar+deseo) |
| **S.car (6 ejes)** | −100..100 / 0..100 | **nacen completos en la creación** (l.323: disciplina 0, ego 0, temperamento 50, compañerismo 50, liderazgo 45, resiliencia 50). En juego: **ego** (bazar joyas/relojes/coche +, caridad −) y **disciplina** mutan; los otros 4, no | `eje()` ×42: arquetipos, vicios (susceptibilidad), caprichos (score), **mLider→resolutor** (l.3883: amplifica `fx.own` de tus decisiones de empuje), **mResil** (castigo tras error), rumor-deseo | ⚠ vivo pero **semiestático**: 4 de 6 ejes jamás evolucionan |
| **afin (compis)** | 5–99 | decisiones sociales, `mueveAfin`, fichajes (entran a 30-34), caridad | **ajuste de vestuario** `(afinMedia−55)/45` sobre la nota (±1.0, visible como trozo), ventas dolorosas, eco de decisiones | ✔ de los bucles más potentes |
| **pub().seg / afic / prensa** | libres | bazar (relojes/moda/estilista/consumibles), maniobras, goles/actuaciones | `nivelSeg`, `apoyoAficion`×`mVestuario` (multiplicadores), valor de mercado → rumores | ✔ la fama alimenta el mercado |
| **S.prensa** | feed | `prensaPush` (maniobras, bazar tier alto, robos, caridad, coches) | subtab Prensa del Mercado, ambiente | ✔ eco narrativo con fuente mecánica |
| **S.lesion / modLes** | — | sobrecarga entreno (0.09×**modLes del bazar**), partido (compis) | disponibilidad, cambios, fisio | ✔ el bazar ya muerde aquí |
| **S.attr** | 10–techo | entreno (`gananciaEntreno` × míster × conf × **mult del bazar** FIS/TEC), envejecimiento | **PROBS** (todo el partido), skills (requisitos), media/valor | ✔ la columna vertebral |
| **S.skl (skills)** | niv | ejercicios+requisitos (`skillsDisp`) | gate de opciones (`o.skill`, l.4562), **tabla 676 → PROBS** (p.ej. sangre fría: t/p min 75) | ✔ (el escáner inicial falló por nombre: es `skl`, no `sk`) |
| **vicioMetro** | oculto | rasgos → susceptibilidad; tentaciones (tec del bazar ⚑) | `cobrarVicios` (forma −, multas, prensa) | ✔ núcleo; ver hueco H1 |
| **rumor.fuerza** | 0.05–0.95 | evolución semanal, actuaciones, maniobras, decisiones | conversión a traspaso, generación de ofertas, textos cualitativos | ✔ vivo |
| **W.d (elo)** | ±acum | traspasos del mundo y tuyos | `eloDe` → `dElo` **de cada partido** | ✔ el mundo que firma te cambia los partidos |
| **novedad/ánimo (coche-casa)** | 0–100 | compra (pico de estreno), decaimiento temporal | `animoBase`, `aporteDe`, recuperación (+casa), capricho clásico | ✔ el sistema viejo, intacto en la Tienda |
| **bonusTienda()** | agregado | compras (`own/serv`) | hooks: lesión, entreno, semana (regen/upkeep/robos), `misterHit` | ✔ motor central nuevo |
| **exige** | 40–92 | fichaje en tu puesto (+4), traspaso (+3) | titularidad | ✔ |
| **azuzado / transferPed / agenteBoost** | flags | maniobras, decisiones | generación y tamaño de ofertas (×1.08 del agente, +12% azuzado) | ✔ |
| **S.fidelidad** | contador | «cortar en seco» (+1), traspaso (reset) | **solo una frase** («te tienen por uno de los suyos») | ✘ **sin dientes** — ver H2 |
| **vicioMod (escolta)** | agregado | bazar | **nadie**: `cobrarVicios` no lo consulta | ✘ **promesa rota** — ver H1 |

---

## II · Matriz sistemas × parámetros (E=escribe · L=lee)

| Sistema | forma | conf | mister | dinero | car | afin | fama | attr/skl | vicio | rumor | elo | tienda |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Partido (motor+decisiones)** | L | L¹ | E/L | E (primas/goles) | L (mLider/mResil) | E/L (aj vestuario) | E | **L (PROBS)** | — | E (notas→fuerza) | **L (dElo)** | — |
| **Entreno** | E | L | L (métodos) | — | L (disciplina) | — | — | **E** | — | — | — | **L (mult)** |
| **Vestuario/compis** | — | E | E | — | L | **E/L** | — | — | — | — | — | — |
| **Míster/reto** | — | E | **E/L** | E (prima) | — | — | — | L (métricas) | — | — | — | — |
| **Vida/familia** | E | **E/L** | — | E/L | L | — | — | — | E | — | — | — |
| **Vicios** | **E** | E | E | E (multas) | **L (suscept.)** | — | E (prensa) | — | **E/L** | — | — | ⚑L roto |
| **Mercado/rumores** | — | E | **E/L** | E | — | E | **L (valor)** | — | — | **E/L** | **E** | — |
| **Maniobras** | — | E | **E (misterHit)** | **E** | — | — | E | — | — | **E** | — | L (amort) |
| **Tienda/bazar** | **E (regen)** | E | E (coach) | **E/L** | **E (ego)** | E (caridad) | **E** | **L/E (mult)** | ⚑ | L (deseo) | — | **E/L** |
| **Coche-casa clásico** | E (recup.) | E (ánimo) | — | E/L | L (capricho) | — | E | — | — | — | — | — |
| **Economía/contrato** | — | — | L | **E/L** | — | — | — | L (valor) | — | L (ofertas) | — | — |
| **Prensa/público** | — | — | L | — | — | — | **E/L** | — | E | E | — | E |

¹ conf llega al partido por cadena (entreno→attr), no directo — decisión de diseño sana: el ánimo no te hace mejor HOY, te hace entrenar mejor.

---

## III · Las cadenas maestras (el grafo en palabras)

1. **La espina dorsal**: decisiones → nota → míster/conf/prensa → titularidad/entreno → **attr → PROBS** → mejores decisiones. El bucle largo del juego.
2. **La cadena social**: decisiones de vestuario → afin → **ajuste ±1.0 sobre TU nota** (visible) → míster → todo lo demás. El vestuario te puntúa.
3. **La cadena del deseo** (nueva, cerrada en 4.40): actuar bien → dinero+fama → **capricho nace del ego** → drena conf → compras → ego sube → caprichos mayores. La rueda del consumo, con dientes.
4. **La cadena del ruido** (4.37-38): notas altas → rumor → maniobras (pagas, te expones) → fuerza → **oferta** → traspaso → elo del mundo + vida nueva. El meta-juego del mercado.
5. **La cadena del cuerpo**: bazar recuperación/sueño/chef → **regen forma + modLes** → más disponibilidad → más partidos → más de todo.
6. **El mundo que responde**: traspasos (tuyos y ajenos) → `W.d` → **dElo de tus partidos futuros**. Vender la estrella del rival te allana marzo.

---

## IV · HUECOS — por prioridad, con receta

**H1 · ~~`vicioMod` sin lector~~ — CERRADO en v4.44.0, por la puerta correcta.** El hook vive en `subirVicio` (el crecimiento, no el castigo): `mult ×= 1 + vicioTent·0,06 + vicioMod·0,12` [0,5–1,6] — la sala de juegos élite acelera la caída (+~36% a tope), la escolta la frena (−~48% a tope) y te saca del lío antes de entrar. `fx.vicio` ahora se agrega en `bonusTienda` (antes era solo un chip). F67 mide las tres combinaciones.

**H2 · ~~`S.fidelidad` sin dientes~~ — CERRADO en v4.42.0.** La renovación proactiva del último año paga 1,10 + 0,04×fid (tope 3) + bonus del agente. La parte (b) —suelo suave en el aj de vestuario— queda como mejora opcional futura.

**H3 · Cuatro ejes de carácter congelados (P2, diseño).** Temperamento, compañerismo, liderazgo y resiliencia nacen y mueren iguales; solo ego y disciplina viven. Todos SE LEEN (mLider en el resolutor, mResil en castigos, susceptibilidades) — el input está muerto, no el output. *Receta: micro-evolución por evidencia acumulada — p.ej. 3 partidos seguidos levantando al equipo → liderazgo +2; encadenar respuestas templadas a provocaciones → temperamento +2. Contadores discretos, techos por temporada.*

**H4 · Compañerismo casi mudo (P2).** Dos lectores (perfil + susceptibilidad). *Receta: que module la VELOCIDAD de ganar afinidad (mueveAfin ×(0.8+cmp/250)) — el eje social gobernando el ritmo social.*

**H5 · Sistemas sin contenido RPG (oportunidades, no bugs):**
- **Árbitros**: sin personalidad — cada colegiado podría tener mano (tarjetero/permisivo, casero) sembrada como los estilos de club, leída por probOpc de ta/protesta.
- **Clima/horario**: inexistente — lluvia y frío tocando λ y lesión sería barato y procedural.
- **Redes (subtab de Vida)**: display de seguidores sin decisiones propias — las maniobras ya cubren parte; podría absorberla.
- **Selección/Copa/Europa**: roadmap conocido.
- Cronología/Crónica/exportadores/guardado: **presentación y herramientas** — correcto que no lleven RPG.

**Falsas alarmas del escáner (cerradas):**
- ~~skills solo-leídas~~ → viven en `S.skl` (niv), se ganan por requisitos y **entran en PROBS** vía la tabla de la l.676. Sanas.
- ~~motor.forma muerto~~ → el gancho antiguo del roadmap quedó obsoleto: la forma YA toca el motor vía `formaM` (l.2720). Retirar del roadmap.
- ~~sangrefria.penal~~ → la skill vive por la vía genérica; el gancho específico de penaltis es contenido futuro, no un cabo roto.

---

## VI-bis · TAXONOMÍA CANÓNICA (decisión del director)

Los 32 parámetros se organizan en siete categorías con nombre propio (finales, sin artículo): **FÍSICO** (Forma, Lesión, Atributos, Skills) · **CABEZA** (Confianza, animoBase, Novedad, Caprichos) · **PERSONALIDAD** (los 6 ejes) · **CIUDAD DEPORTIVA** (Míster, Exige, Afinidad, Reto) · **FAMA** (Seguidores, Afición, prensa) · **DESPACHOS** (Rumor y flags de mercado, Fidelidad) · **CUENTAS** (Dinero, Bazar, VicioMetro, Elo del mundo). **Ejecutada en v4.42.0**: la Ficha abre con las 7 familias como hoja de personaje (Cartel en frases). Los 32 parámetros siguen vivos por debajo; la criba fina de primera clase queda abierta a futuras pasadas.

### El espejo Football Legacy (referencia del director)

Sus 11 baldosas son pantallas de función; nuestras 7 categorías son familias de estado. Cruce de cobertura:

| Legacy | En La Primera | Estado |
|---|---|---|
| Training | Jugador→Entreno (métodos del míster, techos, mults del bazar) | ✔ vivo |
| Squad | Equipo→Vestuario (afinidades, rasgos, ciclos) | ✔ vivo |
| Stats | Jugador→Números | ✔ vivo |
| Fixtures | Equipo→Resultados + calendario | ✔ vivo |
| Lifestyle | Vida (personal/Tienda/coche-casa) | ✔ vivo y más profundo |
| News | Mercado→Prensa | ✔ vivo |
| Social Feed | **Vida→Redes activas (v4.42.0)**: publicar con precio, haters con temperamento | ✔ vivo |
| Agent | **Mercado→Agente (v4.42.0)**: comisión, ofertas infladas, renovación proactiva | ✔ vivo |
| Medical | **Jugador→Médica (v4.42.0)**: historial, riesgo, rehab jugable (3 planes) | ✔ vivo |
| Trophies | **Jugador→Carrera→Vitrina (v4.42.0)**: hitos derivados del archivo | ✔ vivo |
| Mentorship | Mentor del sistema clásico (vive en Tienda tras la mudanza) | ✔ vivo, discreto |

**Lectura**: 7 de 11 cubiertas y con más profundidad; los 4 huecos (Social activo, Agente, Médica/rehab, Vitrina) ya estaban en nuestro roadmap — Legacy los confirma como estándar del género, no los descubre.

## VI · EL PANEL MÍNIMO — de 32 parámetros a 6 diales + 2 capas

**El criterio de corte**: un parámetro merece estar en el panel del jugador solo si cumple LAS DOS — *(a) el jugador puede moverlo con sus decisiones* y *(b) necesita leerlo para decidir la siguiente*. Todo lo que falle una de las dos se pliega, se vuelve frase o se esconde.

### Los 6 diales activos (lo que gestionas cada semana)

| Dial | Qué absorbe | Cómo lo mueves | Por qué es irreducible |
|---|---|---|---|
| **💪 CUERPO** | forma + riesgo de lesión (modLes) como matiz cualitativo | intensidad de entreno, bazar de recuperación/sueño/chef, descansos | es tu disponibilidad: sin cuerpo no hay juego |
| **🔥 ÁNIMO** | conf **⊕ animoBase** (coche/casa/estreno) ⊕ drenajes de capricho — HOY SON DOS SISTEMAS PARALELOS: el refactor | decisiones, vida, compras, saciar deseos | es tu multiplicador de crecimiento (entreno) y tu estabilidad |
| **🎖 MÍSTER** | mister; exige/titularidad son derivados suyos | rendimiento, obediencia/rebeldía, maniobras (con escudo de prensa) | es tu capital político: minutos y renovaciones salen de aquí |
| **🤝 VESTUARIO** | **afinMedia como cifra única** (ya gobierna el aj ±1.0); los compis individuales, vista de detalle | decisiones sociales, ventas/fichajes, caridad | te puntúa cada partido, literalmente |
| **⭐ FAMA** | nivelSeg como cara; afic/prensa internos | actuaciones, maniobras, bazar de estatus, prensa | alimenta tu valor → rumores → ofertas |
| **💶 DINERO** | dinero; upkeeps y candados derivan | contrato, primas, bazar, maniobras | el recurso duro con demanda real |

### Las 2 capas de identidad (se consultan, no se gestionan)

| Capa | Qué es | Ritmo |
|---|---|---|
| **📈 NIVEL** | media de attr + skills — «cómo de bueno eres» | arco largo: lo mueves eligiendo QUÉ entrenar, lo lees una vez al mes |
| **🧬 CARÁCTER** | los 6 ejes — «quién eres» | casi fijo: nace contigo, evoluciona por evidencia (H3); se lee para entenderte, no para optimizar |

### Dónde va cada uno de los 32

| Se pliega EN un dial | Se vuelve FRASE diegética | Se ESCONDE (se vive, no se lee) | Es EVENTO/carta, no parámetro |
|---|---|---|---|
| animoBase, novedad, aporteDe → **ÁNIMO** | rumor.fuerza («suena con fuerza») ✔ ya | vicioMetro ✔ ya | reto del míster |
| afin individual → **VESTUARIO** (detalle) | fidelidad («uno de los suyos») | vicioMod/tentaciones | oferta sobre la mesa |
| afic, prensa-índice → **FAMA** | azuzado, transferPed, agenteBoost ✔ ya | modLes exacto (matiz en CUERPO) | capricho (carta de deseo) |
| modLes → matiz de **CUERPO** | exige («el club espera más») | W.d/elo (el mundo, no tú) | lesión (estado temporal) |
| skills → **NIVEL** | contrato-años («⚠ último año») | bonusTienda (agregador interno) | notaMax y todo lo de partido |
| upkeep → **DINERO** (línea de gasto) | estiloDe rivales (la previa ya narra) | susceptibilidades | prensa (feed, no dial) |

### Los 4 que aprueban el criterio para volver al panel (elegir 2-4)

Revisados los plegados/escondidos contra el criterio doble, **cuatro lo aprueban de verdad** — el resto sigue mejor donde está:

| Dial nuevo | Por qué aprueba (a) *lo mueves* + (b) *lo lees para decidir* | De dónde sale |
|---|---|---|
| **📻 RUIDO** — tu presencia en el mercado | (a) maniobras, cortar/azuzar, dejarte ver, pedir salir; (b) decides CUÁNDO calentar y cuándo calmar mirándolo — es el timing de tu carrera | asciende desde «frase diegética»: la fuerza de TU rumor merece dial (los del mundo siguen en frases) |
| **👨‍👩‍👧 FAMILIA** — cómo están los tuyos | (a) detalles, escapadas, decisiones de vida, la casa del pueblo; (b) su estado te avisa de tormentas antes de que lleguen al ánimo | asciende desde «eventos»: VIDA_FAM ya tiene estados propios — que se lean como dial, no solo como sustos |
| **🩺 SALUD** — el largo plazo del cuerpo | (a) fisio, carga de entreno, bazar médico, (roadmap: rehabilitación jugable); (b) gestionas riesgo acumulado, no solo la frescura de esta semana | **se separa de CUERPO**: FRESCURA (forma, semanal) vs SALUD (lesión/desgaste, estacional) son dos gestiones distintas |
| **🏟 GRADA** — los tuyos de verdad *(opcional, el 4º)* | (a) donación de la peña, caridad local, celebrar con ellos, quedarte; (b) el apoyo local modula tu partido en casa y NO se compra con maniobras | **se separa de FAMA**: `afic` (amor local) y `seg` (focos globales) ya divergen mecánicamente — que el jugador vea que son dos amores distintos |

**Los que NO aprueban** (y por qué quedarse quietos es lo correcto): *titularidad* es consecuencia, no palanca (se lee en MÍSTER); *vicio* está oculto por diseño sagrado; *patrimonio* es tu recibo, no tu decisión; *elo del mundo* no es tuyo.

### El panel final recomendado: **9 diales + 2 capas** *(10 si entra GRADA)*

💪 FRESCURA · 🩺 SALUD · 🔥 ÁNIMO · 🎖 MÍSTER · 🤝 VESTUARIO · ⭐ FAMA · 📻 RUIDO · 👨‍👩‍👧 FAMILIA · 💶 DINERO *(+ 🏟 GRADA)* — y las capas 📈 NIVEL · 🧬 CARÁCTER.

Nueve es el número: cubre cuerpo (×2), mente (×1), política (×2: míster+vestuario), público (×1-2), mercado (×1), raíces (×1) y recurso (×1) — **cada dial una palanca distinta, cero solapes**.

### El único refactor estructural que esto pide

**ÁNIMO ÚNICO**: hoy conviven `S.conf` (5–95) y `animoBase()` (62 ± aportes de coche/casa − caprichos) — **dos sistemas de humor en paralelo**, cada uno con sus escritores. La fusión: `animoBase` deja de ser un número aparte y sus términos (aporte de estreno, drenaje de capricho clásico) pasan a ser **escritores semanales de conf**, igual que ya hace el capricho² del bazar. Un solo dial, una sola verdad, y el desglose («qué te llena, qué se te antoja») como tooltip del dial — no como segundo sistema. Todo lo demás de esta sección es **presentación** (plegar, frasear, esconder), no cirugía.

---

## VII · CICLO DE VIDA (auditoría v4.43.0): qué viaja, qué muere y cuándo

**El mecanismo**: `nuevaTemporada()` reconstruye S desde cero y solo la **lista blanca `LLEVAR`** cruza el verano. Todo lo demás muere automáticamente — higiene por diseño, no por disciplina. La auditoría verificó cada parámetro contra esa frontera.

### FIJOS — lo que es del jugador y viaja (en `LLEVAR`)
attr · skl · **car (los 6 ejes)** · conf · moral · dinero/dineroCarrera · contrato · publico (fama/afic/prensa-índice) · prensa (feed) · vicios · vida (coche-casa clásico) · compis/entrenador · mundo (elo W.d) · archivo/carrera · división · **+ los cuatro rescatados en 4.43.0**: **tienda (own/serv)** · **histLes** · **agente** · **fidelidad** · modLesTemp (el escudo cruza si está vivo).

### TEMPORALES-TEMPORADA — mueren en verano (fuera de LLEVAR, y está bien)
reto (además autoexpira por `temporada`) · rumores/rumorLog/traspasos (el mercado narra SU temporada) · ofertaInv · renovProc · azuzado · transferPed · agenteBoost · movClub · capricho²/caprichoCd · hist (ya archivado antes de morir).

### TEMPORALES-VENTANA — caducidad explícita por jorAbs
modLesTemp (`hasta`) · caprichoCd (tregua +5) · novedad coche-casa (decae por jornadas desde compra).

### TEMPORALES-SEMANA — flag contra jornada, un uso por semana
maniobraSem · redesSem · hatersSem · rehabSem · maniobraCd (por-maniobra, jornadas relativas). *Sin colisión entre temporadas: mueren en verano antes de poder chocar.*

### FUGAS CERRADAS en v4.43.0 (las cuatro eran graves)
1. **S.tienda no viajaba**: el bazar entero —Rolex, hiperbárica, chef, escolta— se esfumaba cada verano en silencio (bug de integración desde 4.40). 2. **S.histLes**: el expediente médico prometido como historial se borraba anual. 3. **S.agente**: te abandonaba cada verano sin portazo. 4. **S.fidelidad**: los años de «me quedo» a cero — la renovación proactiva jamás habría visto fid acumulada entre temporadas.

### SEGUNDA PASADA (v4.44.0) — hallazgos y cierres
- **Parámetro 33 descubierto: `S.fama` (prestigio de carrera)** — nunca estuvo en la lista de 32 y está vivísimo: alimenta el score de caprichos, `valorJugador`, el ritmo de crecimiento de seguidores, eventos de vida (marca, caridad) y los extras de contrato (coche/imagen). Familia FAMA queda en cuatro voces: **seg** (focos globales) · **fama** (prestigio) · **afic** (grada) · **prensaIdx** (la tinta). Registrado en la taxonomía.
- **`pub().prensa` índice: bucle VIVO** — escritores post-partido/escándalo/redes y lector mecánico `presionPrensa()` (0,9–1,10) consumido en los golpes de confianza (l.4238: «con la prensa encima, cuesta más levantarse»). F67 verifica los extremos exactos.
- **Vitrina contaba amistosos** — el gol contra el peto naranja daba hitos. Cerrado: filtro de liga (PRA/PRB fuera) en ambos recolectores.
- **Legacy de LLEVAR (reps/muro/esperas/acuerdo/vidaLog/custom)**: todos con lectores. Sanos.

### FALSAS ALARMAS del escáner (verificadas sanas)
avisoMercado (patrón consumo-y-limpieza: 30 escritores → 1 render que lo anula) · maniobraSem («solo escrito» era el regex contando sus propias comparaciones) · mis tres «fugas de frontera» iniciales (cd/sems/renovProc) — la lista blanca las mata sola. **F66** juega una `nuevaTemporada()` real y verifica supervivientes y difuntos.

## VIII · VIGILANCIA PERMANENTE (v4.45.0): la auditoría que no duerme

**`T_RPG.js`** entra en la batería estándar — la cuarta pasada, convertida en test que corre con cada versión:
1. **Registro fx**: toda clave `fx` de TIENDA_CATS debe estar registrada y mover su campo en `bonusTienda` (una promesa nueva sin cable → rojo el día que nace).
2. **Manifiesto de claves de S**: FIJOS (47) ∪ TEMPORALES (56) ∪ INFRA — una clave nueva sin clasificar → rojo con su nombre.
3. **NaN-scan recursivo + rangos**: forma/conf/míster/dinero/fama/attr/afin[0-100]/vicios/fuerzas/upkeep, cada jornada.
4. **Fuzz de carrera**: 2 semillas × 2 temporadas con TODOS los gates encendidos, guardado parseable y <2,5MB, `hist=38`, y **sellos de frontera**: lo de carrera cruza, lo de temporada muere, el techo no cambia y el míster mantiene continuidad (|Δ|≤15 o arrastre 25-75 si es nuevo).

### HALLAZGOS de la 4ª pasada (los que tres pasadas manuales no vieron)
- **`S.potencial` — la fuga más grave del proyecto, CERRADA**: el «techo personal» (72+rnd×23) que `techoAtributo` consume para TODA ganancia **se re-tiraba cada verano** — el destino del jugador cambiaba de dado anualmente (un l.8423 de migración confirmaba la pérdida). Ahora viaja en LLEVAR.
- **`S.mister` y `S.repsM` viajan**: la relación con el míster (y lo sudado con él hacia las skills) ya no muere a 58 — y al revivirla aflora el diseño que YA existía esperándola: la **cura de verano** (+6 si <45, +2 si no, l.7820) y el **arrastre ×0,25 hacia 50 si cambia el entrenador** (l.7822-24). El reset al traspasarte sigue donde debe.
- **`S.animo` — descubierto el TERCER sistema de humor**: multiplicador `mAnimo` (0,85–1,13), evoluciona con resultados y gravita hacia `animoBase()` («la vida tira hacia TU normal»). Se queda temporal (el verano resetea el humor) y queda documentado como insumo del refactor ÁNIMO ÚNICO: la fusión ya no es conf⊕animoBase, es **conf⊕animo⊕animoBase**.
- **Clamp real de afin = [0,100]** (no [5,99]): corregido el validador, absuelto el motor.
- 21 claves de sistemas del míster/temporada (desafíos, castigo, ciclo, evaluación, garantía, conv, zonas…) clasificadas TEMPORALES con evidencia.

## V · Veredicto

**23 parámetros auditados: 19 bucles cerrados, 2 promesas rotas (H1, H2), 1 semiestático de diseño (H3), 1 infrautilizado (H4).** Las seis cadenas maestras conectan partido↔persona↔mundo sin callejones: lo que compras te cambia el cuerpo, lo que decides te cambia el vestuario, lo que ganas te despierta deseos, lo que deseas te cuesta el ánimo, y el mundo que firma te cambia los rivales. Los huecos H1-H4 son cuatro parches quirúrgicos, no rediseños.
