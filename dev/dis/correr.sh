#!/bin/bash
# Uso:  correr.sh TEST.js [veces]      TEST.js: nombre dentro de dis/ o ruta a un archivo
# Regenera lap.js desde la-primera.html (en el directorio actual) y concatena stub+lap+post+TEST.
# Variables: HTML=ruta al juego (por defecto el vivo) · TAIL=n líneas finales (por defecto 1)
D="$(cd "$(dirname "$0")" && pwd)"
HTML="${HTML:-/mnt/user-data/outputs/la-primera.html}"
awk '/<script>/{f=1;next}/<\/script>/{f=0;next}f' "$HTML" > lap.js || exit 2
node --check lap.js || exit 3
T="$1"; N="${2:-1}"
case "$T" in */*) TP="$T" ;; *) if [ -f "$D/$T" ]; then TP="$D/$T"; else TP="$T"; fi ;; esac   # nombre suelto: primero dis/, luego el directorio actual (una copia vieja en el cwd ya no tapa a la buena)
B="$(basename "$TP")"
cat "$D/stub.js" lap.js "$D/post.js" "$TP" > "run_$B"
for i in $(seq 1 "$N"); do timeout 300 node "run_$B" 2>&1 | tail -${TAIL:-1}; done
