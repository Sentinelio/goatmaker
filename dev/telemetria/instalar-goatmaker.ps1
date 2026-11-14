<#
 Goatmaker Pro · instalador de la telemetría en SERVER-PC (Windows PowerShell 5.1, COMO ADMINISTRADOR)
 Crea una instancia PROPIA de PocketBase en C:\pocketbase\goatmaker (puerto 8091, solo local) y NO toca tu PocketBase actual (8090).
   1. copia pocketbase.exe, las migraciones y el hook (del zip), genera la clave en pb_hooks\tele.key y crea el superusuario
   2. la deja arrancando con Windows (tarea programada «PocketBase-Goatmaker», SYSTEM, reinicio automático)
   3. guarda una copia de tu configuración de Tailscale y añade DOS cosas: /tele público (Funnel) y el panel solo-tailnet en el puerto 8447
   4. prueba todo y borra el evento de prueba
 Uso (PowerShell como administrador):
   Set-ExecutionPolicy -Scope Process Bypass -Force
   .\instalar-goatmaker.ps1 -Zip "C:\Users\mmend\Downloads\goatmaker-telemetria.zip" -Email "tu@correo.com"
 Deshacer:   .\instalar-goatmaker.ps1 -Desinstalar      (quita la tarea y las rutas de Tailscale; conserva la carpeta y los datos)
#>
param(
  [string]$Zip = "$env:USERPROFILE\Downloads\goatmaker-telemetria.zip",
  [string]$Email = "",
  [string]$Dir = "C:\pocketbase\goatmaker",
  [int]$Puerto = 8091,
  [int]$PuertoPanel = 8447,
  [string]$PbExe = "",
  [string]$Host_ = "server-pc.tail3b4002.ts.net",
  [switch]$Desinstalar
)
$ErrorActionPreference = "Continue"   # los comandos nativos (tailscale) escriben en stderr; cada paso crítico lleva -ErrorAction Stop
$Tarea = "PocketBase-Goatmaker"
function Paso($t) { Write-Host ""; Write-Host "== $t" -ForegroundColor Cyan }
function Ok($t) { Write-Host "  OK  $t" -ForegroundColor Green }
function Aviso($t) { Write-Host "  !!  $t" -ForegroundColor Yellow }
function Falla($t) { Write-Host "  XX  $t" -ForegroundColor Red; throw $t }

if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) { Falla "Ejecútalo en PowerShell COMO ADMINISTRADOR." }

if ($Desinstalar) {
  Paso "Desinstalando (la carpeta $Dir y sus datos se conservan)"
  try { Stop-ScheduledTask -TaskName $Tarea -ErrorAction SilentlyContinue } catch {}
  Get-Process pocketbase -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "$Dir\*" } | Stop-Process -Force
  Unregister-ScheduledTask -TaskName $Tarea -Confirm:$false -ErrorAction SilentlyContinue
  & tailscale funnel --set-path /tele off 2>&1 | Out-Host
  & tailscale serve --https=$PuertoPanel off 2>&1 | Out-Host
  Ok "Tarea y rutas de Tailscale quitadas."
  return
}

Paso "1/6 Comprobaciones"
if (-not (Test-Path $Zip)) { Falla "No encuentro el zip en $Zip (usa -Zip con la ruta correcta)." }
if (-not $Email) { $Email = Read-Host "Email para el superusuario del PocketBase de goatmaker" }
if (Get-NetTCPConnection -LocalPort $Puerto -State Listen -ErrorAction SilentlyContinue) { Falla "El puerto $Puerto ya está en uso." }
if (Test-Path "$Dir\pb_data") { Falla "$Dir\pb_data ya existe: no lo piso. Si quieres reinstalar, renombra o borra esa carpeta a mano." }
if (-not $PbExe) { $p = Get-Process pocketbase -ErrorAction SilentlyContinue | Select-Object -First 1; if ($p) { $PbExe = $p.Path } }
if (-not $PbExe -or -not (Test-Path $PbExe)) { Falla "No localizo pocketbase.exe. Pásalo con -PbExe 'C:\ruta\pocketbase.exe'." }
$ver = (& $PbExe --version) -join " "
Ok "pocketbase.exe: $PbExe ($ver)"
if ($ver -match '(\d+)\.(\d+)\.(\d+)') { if ([int]$Matches[1] -eq 0 -and [int]$Matches[2] -lt 23) { Falla "Hace falta PocketBase 0.23 o superior y tienes $($Matches[0])." } }
& tailscale version | Out-Null
if ($LASTEXITCODE -ne 0) { Falla "No encuentro el comando tailscale." }

Paso "2/6 Carpeta y archivos"
New-Item -ItemType Directory -Force -Path $Dir -ErrorAction Stop | Out-Null
$tmp = Join-Path $env:TEMP ("gm_" + [guid]::NewGuid().ToString("N"))
Expand-Archive -Path $Zip -DestinationPath $tmp -Force -ErrorAction Stop
Copy-Item $PbExe "$Dir\pocketbase.exe" -ErrorAction Stop
Copy-Item "$tmp\pb_migrations" "$Dir\pb_migrations" -Recurse -ErrorAction Stop
Copy-Item "$tmp\pb_hooks" "$Dir\pb_hooks" -Recurse -ErrorAction Stop
Copy-Item "$tmp\LEEME.md" "$Dir\LEEME.md" -ErrorAction Stop
Remove-Item $tmp -Recurse -Force
$bytes = New-Object byte[] 24
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$Key = ([Convert]::ToBase64String($bytes)).Replace('+', 'a').Replace('/', 'b').Replace('=', '')
[IO.File]::WriteAllText("$Dir\pb_hooks\tele.key", $Key, (New-Object Text.UTF8Encoding($false)))
Ok "Archivos copiados a $Dir y clave generada en pb_hooks\tele.key"

Paso "3/6 Superusuario"
$sec = Read-Host "Contraseña nueva para el superusuario (mínimo 10 caracteres)" -AsSecureString
$Pass = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec))
if ($Pass.Length -lt 10) { Falla "La contraseña tiene menos de 10 caracteres." }
& "$Dir\pocketbase.exe" superuser upsert $Email $Pass | Out-Host
if ($LASTEXITCODE -ne 0) { Falla "No se pudo crear el superusuario." }

Paso "4/6 Arranque con Windows (tarea programada $Tarea)"
$act = New-ScheduledTaskAction -Execute "$Dir\pocketbase.exe" -Argument "serve --http 127.0.0.1:$Puerto" -WorkingDirectory $Dir
$trg = New-ScheduledTaskTrigger -AtStartup
$pri = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
$set = New-ScheduledTaskSettingsSet -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 99 -RestartInterval (New-TimeSpan -Minutes 1) -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
Register-ScheduledTask -TaskName $Tarea -Action $act -Trigger $trg -Principal $pri -Settings $set -Force -ErrorAction Stop | Out-Null
Start-ScheduledTask -TaskName $Tarea -ErrorAction Stop
$arriba = $false
for ($i = 0; $i -lt 40; $i++) { try { $h = Invoke-RestMethod "http://127.0.0.1:$Puerto/api/health" -TimeoutSec 2; if ($h.code -eq 200) { $arriba = $true; break } } catch {}; Start-Sleep -Milliseconds 500 }
if (-not $arriba) { Falla "PocketBase no arranca en el puerto $Puerto. Mira $Dir y la tarea $Tarea en el Programador de tareas." }
Ok "PocketBase de goatmaker escuchando en 127.0.0.1:$Puerto"

Paso "5/6 Tailscale (copia de seguridad + dos rutas nuevas)"
$bak = "C:\pocketbase\tailscale-serve-antes-de-goatmaker-$(Get-Date -Format yyyyMMdd-HHmm).json"
& tailscale serve status --json | Out-File -Encoding utf8 $bak
Ok "Copia de tu configuración actual: $bak"
& tailscale funnel --bg --set-path /tele "http://127.0.0.1:$Puerto/tele" 2>&1 | Out-Host
if ($LASTEXITCODE -ne 0) { Falla "No se pudo añadir /tele al Funnel (tu configuración sigue como estaba; copia en $bak)." }
& tailscale serve --bg --https=$PuertoPanel "http://127.0.0.1:$Puerto" 2>&1 | Out-Host
if ($LASTEXITCODE -ne 0) { Aviso "No se pudo abrir el panel solo-tailnet en el puerto $PuertoPanel." }
& tailscale funnel status | Out-Host

Paso "6/6 Pruebas"
$base = "http://127.0.0.1:$Puerto"
$cuerpo = '{"k":"%K%","install":"iprueba123456","sid":"sprueba1234","ctx":{"ver":"test"},"events":[{"t":1,"tipo":"hola","d":{}}]}'
function Post($url, $k) { try { $r = Invoke-WebRequest -ErrorAction Stop -Uri $url -Method Post -ContentType "application/json" -Body ($cuerpo.Replace("%K%", $k)) -UseBasicParsing -TimeoutSec 10; return "$($r.StatusCode) $($r.Content)" } catch { if ($_.Exception.Response) { return "$([int]$_.Exception.Response.StatusCode) (rechazado)" } else { return "sin respuesta: $($_.Exception.Message)" } } }
$t1 = Post "$base/tele" "clave-mala"; if ($t1 -like "403*") { Ok "clave mala -> $t1" } else { Falla "clave mala debía dar 403 y dio: $t1" }
$t2 = Post "$base/tele" $Key; if ($t2 -like "200*") { Ok "clave buena -> $t2" } else { Falla "clave buena debía dar 200 y dio: $t2" }
try { Invoke-WebRequest "$base/api/collections/tl_events/records" -UseBasicParsing -ErrorAction Stop | Out-Null; Falla "tl_events se pudo leer sin autenticar" } catch { if ($_.Exception.Response -and [int]$_.Exception.Response.StatusCode -eq 403) { Ok "tl_events sin autenticar -> 403" } else { Falla "respuesta inesperada leyendo tl_events: $($_.Exception.Message)" } }
$tp = Post "https://$Host_/tele" "clave-mala"
if ($tp -like "403*") { Ok "por la URL pública, clave mala -> $tp (el Funnel llega a /tele)" } else { Aviso "por la URL pública: $tp (si el servidor no se alcanza a sí mismo por Funnel, pruébalo desde el móvil con datos)" }
try { $x = Invoke-WebRequest "https://$Host_/_/" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop; Aviso "ATENCIÓN: https://$Host_/_/ respondió $($x.StatusCode) por la URL pública" } catch { Ok "el panel /_/ NO es accesible por la URL pública" }
$tok = (Invoke-RestMethod -ErrorAction Stop "$base/api/collections/_superusers/auth-with-password" -Method Post -ContentType "application/json" -Body (@{ identity = $Email; password = $Pass } | ConvertTo-Json)).token
$ev = Invoke-RestMethod "$base/api/collections/tl_events/records?filter=install%3D%27iprueba123456%27" -Headers @{ Authorization = $tok }
foreach ($it in $ev.items) { Invoke-RestMethod "$base/api/collections/tl_events/records/$($it.id)" -Method Delete -Headers @{ Authorization = $tok } | Out-Null }
foreach ($c in @("tl_sessions", "tl_players")) { $r = Invoke-RestMethod "$base/api/collections/$c/records?filter=install%3D%27iprueba123456%27" -Headers @{ Authorization = $tok }; foreach ($it in $r.items) { Invoke-RestMethod "$base/api/collections/$c/records/$($it.id)" -Method Delete -Headers @{ Authorization = $tok } | Out-Null } }
Ok "datos de prueba borrados"

Write-Host ""
Write-Host "================ LISTO ================" -ForegroundColor Green
Write-Host "TELE_URL (para el juego):   https://$Host_"
Write-Host "TELE_KEY (para el juego):   $Key"
Write-Host "Panel de PocketBase:        https://${Host_}:$PuertoPanel/_/   (solo desde tu tailnet)"
Write-Host "URL para goatmaker-admin:   https://${Host_}:$PuertoPanel      usuario: $Email"
Write-Host "Copia de tu config Tailscale: $bak"
Write-Host "Deshacer: .\instalar-goatmaker.ps1 -Desinstalar"
