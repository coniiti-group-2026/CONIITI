param (
    [string]$ResourceGroup = "coniiti",
    [string]$ContainerAppName = "shared-db",
    [string]$StorageAccount = "coniitistorage",
    [string]$StorageContainer = "postgres-backups"
)

$ErrorActionPreference = "Stop"

function Invoke-ContainerAppCommand {
    param (
        [Parameter(Mandatory=$true)]
        [string]$Command,
        [int]$MaxRetries = 2
    )

    for ($attempt = 0; $attempt -le $MaxRetries; $attempt++) {
        $previousErrorActionPreference = $ErrorActionPreference
        $ErrorActionPreference = "Continue"
        $output = & az containerapp exec `
            --resource-group $ResourceGroup `
            --name $ContainerAppName `
            --command $Command 2>&1 | ForEach-Object { "$_" }
        $ErrorActionPreference = $previousErrorActionPreference

        if ($LASTEXITCODE -eq 0) {
            return $output
        }

        $text = $output -join [Environment]::NewLine
        if ($text -match "429 Too Many Requests" -and $attempt -lt $MaxRetries) {
            $retrySeconds = 600
            if ($text -match "'retry-after': '(\d+)'") {
                $retrySeconds = [int]$Matches[1]
            }

            Write-Host "Azure limito las sesiones exec. Reintentando en $retrySeconds segundos..." -ForegroundColor Yellow
            Start-Sleep -Seconds $retrySeconds
            continue
        }

        throw "Error ejecutando comando en ${ContainerAppName}: $output"
    }
}

function Get-SqlPayload {
    param (
        [string[]]$RawOutput
    )

    $lines = $RawOutput | Where-Object {
        $_ -notmatch "^INFO:" -and
        $_ -notmatch "^WARNING:" -and
        $_ -notmatch "Use ctrl" -and
        $_.Trim() -ne ""
    }

    return ($lines -join [Environment]::NewLine)
}

function Get-StorageAccountKey {
    return az storage account keys list `
        --resource-group $ResourceGroup `
        --account-name $StorageAccount `
        --query "[0].value" `
        -o tsv
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupRoot = Join-Path $env:TEMP "coniiti-shared-db-backup-$timestamp"
New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null

$storageKey = Get-StorageAccountKey

Write-Host "Creando contenedor de backups si no existe: $StorageContainer" -ForegroundColor Cyan
az storage container create `
    --account-name $StorageAccount `
    --account-key $storageKey `
    --name $StorageContainer `
    --only-show-errors | Out-Null

$manifest = [ordered]@{
    created_at_utc = (Get-Date).ToUniversalTime().ToString("o")
    resource_group = $ResourceGroup
    container_app = $ContainerAppName
    storage_account = $StorageAccount
    storage_container = $StorageContainer
    backup_prefix = "shared-db/$timestamp"
    dump_blob = "shared-db/$timestamp/shared-db.sql"
}

Write-Host "Generando backup completo de shared-db..." -ForegroundColor Yellow

$dumpCommand = "pg_dumpall -U admin --clean --if-exists --no-role-passwords"
$rawDump = Invoke-ContainerAppCommand -Command $dumpCommand
$sql = Get-SqlPayload -RawOutput $rawDump

if ([string]::IsNullOrWhiteSpace($sql) -or $sql -notmatch "PostgreSQL database cluster dump") {
    throw "El backup de shared-db no parece contener un dump valido."
}

$localDumpPath = Join-Path $backupRoot "shared-db.sql"
[System.IO.File]::WriteAllText($localDumpPath, $sql, [System.Text.UTF8Encoding]::new($false))

az storage blob upload `
    --account-name $StorageAccount `
    --account-key $storageKey `
    --container-name $StorageContainer `
    --name $manifest.dump_blob `
    --file $localDumpPath `
    --overwrite true `
    --only-show-errors | Out-Null

$manifestPath = Join-Path $backupRoot "manifest.json"
$manifest | ConvertTo-Json -Depth 5 | Set-Content -Path $manifestPath -Encoding UTF8

az storage blob upload `
    --account-name $StorageAccount `
    --account-key $storageKey `
    --container-name $StorageContainer `
    --name "shared-db/$timestamp/manifest.json" `
    --file $manifestPath `
    --overwrite true `
    --only-show-errors | Out-Null

Write-Host "Backup completado: shared-db/$timestamp" -ForegroundColor Green
