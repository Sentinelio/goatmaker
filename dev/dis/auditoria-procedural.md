# LA PRIMERA · Auditoría procedural completa
*Sobre v4.16.0 (~6.950 líneas JS). Inventario medido con grep sobre el fuente, no de memoria.*

**El principio que gobierna toda conversión** — separar tres capas:
1. **Hechos**: el estado real (marcador, λ, libro de decisiones, acta, dinero, ejes). Nunca se generan: se leen.
2. **Mecánica**: fx calculados por fórmula desde parámetros (`inst.gol = base(zona)×agresividad×momento`). Nunca los escribe un autor.
3. **Piel**: texto por gramática de plantillas con huecos, con **precondiciones sobre los hechos** que el selector filtra ANTES de sortear. Lo incoherente es ingenerable por construcción.

Todo generador es auditable con el arnés actual: N-mil muestras contra estados aleatorios verificando que la precondición de cada línea era cierta. `crestSVG` y `golGifSVG` ya funcionan así: función pura de (hechos, semilla).

---

## A · Ya es procedural (la prueba del concepto)
| Sistema | Cómo |
|---|---|
| Escudos | `crestSVG(id)`: paleta+patrón por hash del id |
| Gif del gol | determinista de (hechos del gol, semilla) |
| Contratos/salarios | fórmula por franja/rank/edad/media |
| Mundo vivo | 40 clubes simulados por Elo/λ, tabla emergente |
| Óxido de skills | ventana y tasa por fórmula (attr×edad×división×req) |
| Ofertas del partidillo | franjas por media, 5 mesas paramétricas |

## B · Núcleo de partido
**B1 · Situaciones — el premio gordo.**
HOY: **167 sits de juego + 17 banquillo + 5 clutch + 2 cambio**, todas a mano (~40% del fuente).
GENERADOR: sit = contexto(zona×presión×marcador×minuto×racha) × acción(pase/tiro/regate/despeje/cobertura/duelo) × 3 opciones (verbo, riesgo, recompensa) con fx por fórmula. Texto: plantillas por familia + bancos de sinónimos + condimentos (derbi, lluvia, mote, rival concreto).
GANA: de ~190 sits a decenas de miles coherentes; el rival y el momento cambian lo que ves. ESFUERZO: L (el mayor del juego). PRIORIDAD: ★★★★★

**B2 · Narración ambiental.**
HOY: **41 bancos `pick([...])` inline** (~150 frases) + ~382 literales narrativos; semi-procedural sin contexto profundo.
GENERADOR: gramática sujeto(quién domina según λ real)+verbo(intensidad del tramo)+color(estadio/banquillo/marcador/minuto/racha). Precondiciones duras: "el rival te encierra" exige λ_rival alta EN ese tramo.
GANA: mata la repetición a las 10 temporadas; la crónica literal persistida queda auditada. ESFUERZO: M. PRIORIDAD: ★★★★★

**B3 · Indecisiones, flashes, relatos de gol, motivos VAR.**
HOY: INDECISION 10 líneas fijas por fase; relatos de gol y motivos VAR en picks.
GENERADOR: mismas plantillas contextuales de B2 (comparten motor). ESFUERZO: S (de rebote). ★★★

## C · Mundo social
**C1 · Prensa y redes.**
HOY: titulares por rangos de nota en picks; **~10 usuarios fijos** (`USUARIOS`); portadas por arquetipo.
GENERADOR: titular = (resultado × tu nota × evento estelar del acta × racha × tono del medio). Usuarios: gramática de alias (afición×tic×número). La prensa solo LEE el acta: cero riesgo.
GANA: miles de portadas; los medios cogen personalidad. ESFUERZO: S-M. ★★★★

**C2 · Míster: frases y exigencias.**
HOY: `fraseMister()` con picks; exigencia = un número (`exige`).
GENERADOR: arquetipo×sliders (resultadista/formador, valiente/cerrojo, paciencia, balón parado, favoritismo) → (a) frases con tono coherente; (b) **exigencias como queries paramétricas sobre el libro y el acta que YA persistimos** («3 goles de estrategia este trimestre», «nota ≥6 fuera», «no pierdas 2 balones en salida»): métrica+umbral+plazo+premio/castigo. Cero código por requisito nuevo. Su estilo sesga qué sits te sirve B1.
ESFUERZO: M. ★★★★★ (mejor ratio del juego junto a B2)

**C3 · Compañeros.**
HOY: nombres de 2 bancos (16+12), personalidad plana, afinidad numérica.
GENERADOR: arquetipo×ego×humor×veteranía sembrados por id, **con agenda** (el que compite por tu puesto no es neutral): peticiones, roces por titularidad, préstamos (conecta con D), reacciones a tus hechos (fallas el clutch → el capitán te busca con una decisión encima de la mesa). Formato: el motor de eventos de la sección F.
ESFUERZO: M-L. ★★★★

**C4 · Charlas de previa/descanso y celebraciones.**
HOY: sits fijas dentro de las 167. GENERADOR: caen con B1 (mismas plantillas con contexto de vestuario). ★★★

## D · Economía del jugador
**D1 · Tienda/caprichos.** HOY: **TIENDA = 3 items** medidos. GENERADOR: catálogo (categoría×gama×marca-ficticia) con precio por fama y fx de carácter por fórmula. ESFUERZO: S. ★★★
**D2 · Propiedades (no existe).** (ciudad×barrio×tipo×estado) → precio por fórmula sobre el mundo vivo: un piso donde asciende el club local **se revaloriza solo**. Alquiler por jornada, mantenimiento, eventos de propietario (avería/okupas/oferta) como tuplas→decisión. ESFUERZO: M. ★★★★
**D3 · Negocios (no existe).** (sector×ciudad×socio×ambición); retorno ligado a TU fama y a hechos del acta; socio con personalidad (quiebra/roba); gestionar cuesta un slot de entreno. ESFUERZO: M-L. ★★★★
**D4 · Inversiones (no existe).** Activos (μ,σ,correlación con liga/fama) sembrados por el mundo: acciones de patrocinadores, cripto con regímenes, **papel de clubes de la liga** con dividendo por resultados reales simulados; conflicto de interés → titular de C1. ESFUERZO: M. ★★★★
**D5 · VIDA_OPC.** HOY: **5 eventos fijos**. GENERADOR: evento por eje de carácter presionado (el juego ya sabe cuáles tienes altos): (eje, magnitud, contexto)→plantilla+fx del mapa. La vida te busca por donde flaqueas. ESFUERZO: S-M. ★★★★

## E · Identidad del mundo
**E1 · Nombres.** HOY: 4 bancos (16+12 jugadores, 12+10 entrenadores) → repetición visible a 3 temporadas. GENERADOR: gramática silábica española por región + apellidos compuestos; motes por (rasgo físico|hito|posición). ESFUERZO: S. ★★★
**E2 · Rivales con estilo.** HOY: 40 clubes = Elo+franja, clónicos en identidad. GENERADOR: 5-6 sliders por club sembrados por id (presión, bloque, tempo, directo, balón parado) que ya modulan λ **y sesgan qué familias de sits sirve B1** (bloque bajo→«muro de piernas»; presión alta→«salida bajo presión»). ~30 líneas. ESFUERZO: S. ★★★★★
**E3 · Estadios/ambiente.** HOY: nombre implícito. GENERADOR: (aforo por rank, apodo de grada, cántico por gramática con tu nombre) alimentando B2. ESFUERZO: S. ★★

## F · Carrera
**F1 · Lesiones.** HOY: 1-3 tipos planos. GENERADOR: (zona×gravedad×mecanismo)→curva paramétrica de recuperación + decisiones de rehab (conecta con roadmap §5). ESFUERZO: M. ★★★★
**F2 · Objetivos de club/temporada.** HOY: exige plano por franja. GENERADOR: mismas queries de C2 a escala club (puesto, copa, estilo). ESFUERZO: S tras C2. ★★★
**F3 · Ojeadores/negociación.** HOY: diálogo fijo; números ya paramétricos. GENERADOR: personalidad del director (tacaño/impulsivo/frío) → frases y forma de contraofertar. ESFUERZO: S-M. ★★★

---

## El motor único que lo abarata todo
Un **motor de eventos procedural** — `precondición(estado) → plantilla(huecos) → decisión {t, x, o:[{l, fx}]}` — sirve para partido (B), social (C), economía (D) y carrera (F). El formato de sit actual **ya es** ese formato: el motor es un generador de sits.

## Hoja de ruta sugerida (impacto/esfuerzo)
**✔ FASE 1 ENTREGADA en v4.17.0** — motor de identidad (E1), rivales con estilo (E2), retos-como-queries (C2) y vida procedural (D5), todos con test en batería.
1. **Fase 1 (cimientos, S-M)**: motor de eventos genérico + E2 rivales con estilo + C2 exigencias-como-queries + E1 nombres.
2. **Fase 2 (corazón, L)**: B1 sits procedurales por familias (migrando las 167 actuales a plantillas, familia a familia, con la batería vigilando reparto de cierres) + B2/B3 narración contextual.
3. **Fase 3 (mundo, M)**: D2-D4 economía (propiedades→negocios→inversiones) + C3 compañeros con agenda + C1 prensa + F1 lesiones.

Regla de oro en cada fase: el generador entra con su test estadístico en la batería (reparto de resultados, precondiciones verificadas contra estado, presupuesto de guardado) antes de tocar la siguiente pieza.
