# Construye piramide.html = plantilla + núcleo (core.js, entre /*CORE-START*/ y /*CORE-END*/) + clubes reales (clubes_min.json).
# Uso:  python3 dis/piramide/build.py [destino]      (por defecto escribe /mnt/user-data/outputs/piramide.html)
# Después:  cd <carpeta de trabajo>; CALC=<destino> TAIL=6 bash dis/correr.sh F87_piramide.js 1     (igual que el motor)
#           CALC=<destino> node dis/E2E_piramide.js                                                 (navegador real)
import sys, os
D=os.path.dirname(os.path.abspath(__file__))
core=open(os.path.join(D,'core.js'),encoding='utf8').read()
clubes=open(os.path.join(D,'clubes_min.json'),encoding='utf8').read().strip()
t=open(os.path.join(D,'template.html'),encoding='utf8').read()
assert t.count('/*@@CORE@@*/')==1 and t.count('/*@@CLUBES@@*/')==1
out=t.replace('/*@@CORE@@*/',core).replace('/*@@CLUBES@@*/',clubes)
dest=sys.argv[1] if len(sys.argv)>1 else '/mnt/user-data/outputs/piramide.html'
open(dest,'w',encoding='utf8').write(out)
print("escrito",dest,len(out),"bytes")
