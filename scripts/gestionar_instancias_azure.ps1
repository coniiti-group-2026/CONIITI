param (
    [Parameter(Mandatory=$true)]
    [ValidateSet("Encender", "Apagar")]
    [string]$Accion,

    [switch]$SkipBackup,
    [switch]$SkipRestore
)

$ErrorActionPreference = "Stop"

$ResourceGroup = "coniiti"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Gestion de instancias en Azure ($Accion)" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$InfrastructureApps = @(
    "shared-db",
    "analytics-mongo",
    "shared-rabbitmq"
)

$ServiceApps = @(
    "agenda-service",
    "analytics-service",
    "auth-service",
    "files-service",
    "notifications-service",
    "payments-service",
    "users-service",
    "frontend"
)

function Set-ContainerAppScale {
    param (
        [string[]]$Apps,
        [int]$MinReplicas,
        [int]$DefaultMaxReplicas,
        [string]$Title
    )

    Write-Host "`n$Title" -ForegroundColor Yellow
    foreach ($app in $Apps) {
        $maxReplicas = if ($MinReplicas -eq 1 -and $DefaultMaxReplicas -gt 1) { $DefaultMaxReplicas } else { 1 }
        Write-Host "-> Configurando $app a $MinReplicas instancia(s)"
        az containerapp update `
            --name $app `
            --resource-group $ResourceGroup `
            --min-replicas $MinReplicas `
            --max-replicas $maxReplicas | Out-Null
        Write-Host "   Listo: $app" -ForegroundColor Green
    }
}

function Wait-ForSharedDb {
    Write-Host "`nEsperando a que shared-db acepte conexiones..." -ForegroundColor Yellow
    for ($i = 1; $i -le 12; $i++) {
        az containerapp exec `
            --name "shared-db" `
            --resource-group $ResourceGroup `
            --command "pg_isready -U admin" | Out-Null

        if ($LASTEXITCODE -eq 0) {
            Write-Host "shared-db esta listo." -ForegroundColor Green
            return
        }

        Start-Sleep -Seconds 10
    }

    throw "shared-db no quedo listo a tiempo."
}

if ($Accion -eq "Apagar") {
    Set-ContainerAppScale `
        -Apps $ServiceApps `
        -MinReplicas 0 `
        -DefaultMaxReplicas 1 `
        -Title "[1/3] Apagando microservicios para dejar la base quieta..."

    if (-not $SkipBackup) {
        Write-Host "`n[2/3] Creando backup de shared-db en Azure Storage..." -ForegroundColor Yellow
        & (Join-Path $ScriptDir "backup_shared_db_azure.ps1")
        if ($LASTEXITCODE -ne 0) {
            throw "No se pudo crear el backup. Se cancela el apagado para proteger los datos."
        }
    } else {
        Write-Host "`n[2/3] Backup omitido por parametro -SkipBackup." -ForegroundColor Yellow
    }

    Set-ContainerAppScale `
        -Apps $InfrastructureApps `
        -MinReplicas 0 `
        -DefaultMaxReplicas 1 `
        -Title "[3/3] Apagando infraestructura..."
}
else {
    Set-ContainerAppScale `
        -Apps $InfrastructureApps `
        -MinReplicas 1 `
        -DefaultMaxReplicas 1 `
        -Title "[1/3] Encendiendo infraestructura..."

    if (-not $SkipRestore) {
        Wait-ForSharedDb
        Write-Host "`n[2/3] Restaurando ultimo backup de shared-db..." -ForegroundColor Yellow
        & (Join-Path $ScriptDir "restore_shared_db_azure.ps1")
        if ($LASTEXITCODE -ne 0) {
            throw "No se pudo restaurar shared-db. Se cancela el encendido de servicios."
        }
    } else {
        Write-Host "`n[2/3] Restauracion omitida por parametro -SkipRestore." -ForegroundColor Yellow
    }

    Set-ContainerAppScale `
        -Apps $ServiceApps `
        -MinReplicas 1 `
        -DefaultMaxReplicas 10 `
        -Title "[3/3] Encendiendo microservicios..."
}

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "Operacion completada con exito." -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
