param (
    [Parameter(Mandatory=$true)]
    [ValidateSet("Encender", "Apagar")]
    [string]$Accion
)

$ResourceGroup = "coniiti"
$MinReplicas = if ($Accion -eq "Encender") { 1 } else { 0 }

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Gestión de Instancias en Azure ($Accion)" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Lista de contenedores de infraestructura (Bases de datos y colas)
$InfrastructureApps = @(
    "shared-db",
    "analytics-mongo",
    "shared-rabbitmq"
)

# Lista de microservicios y frontend
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

# 1. Aplicar escala a la infraestructura
Write-Host "`n[1/2] Aplicando escala a la Infraestructura (Bases de Datos)..." -ForegroundColor Yellow
foreach ($app in $InfrastructureApps) {
    Write-Host "-> Configurándolo a $MinReplicas instancias: $app"
    az containerapp update --name $app --resource-group $ResourceGroup --min-replicas $MinReplicas --max-replicas 1 | Out-Null
    Write-Host "   Listo: $app" -ForegroundColor Green
}

# 2. Aplicar escala a los servicios
Write-Host "`n[2/2] Aplicando escala a los Microservicios..." -ForegroundColor Yellow
foreach ($app in $ServiceApps) {
    $MaxRep = if ($MinReplicas -eq 1) { 10 } else { 1 }
    Write-Host "-> Configurándolo a $MinReplicas instancias: $app"
    az containerapp update --name $app --resource-group $ResourceGroup --min-replicas $MinReplicas --max-replicas $MaxRep | Out-Null
    Write-Host "   Listo: $app" -ForegroundColor Green
}

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host " ¡Operación completada con éxito!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
