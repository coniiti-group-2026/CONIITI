param (
    [string]$ResourceGroup = "coniiti",
    [string]$ContainerAppName = "shared-db",
    [string]$StorageAccount = "coniitistorage",
    [string]$StorageContainer = "postgres-backups",
    [string]$BackupPrefix = ""
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

function Get-StorageAccountKey {
    return az storage account keys list `
        --resource-group $ResourceGroup `
        --account-name $StorageAccount `
        --query "[0].value" `
        -o tsv
}

function Get-BlobReadSasUrl {
    param (
        [Parameter(Mandatory=$true)]
        [string]$BlobName,
        [Parameter(Mandatory=$true)]
        [string]$StorageKey
    )

    $expiry = (Get-Date).ToUniversalTime().AddHours(2).ToString("yyyy-MM-ddTHH:mmZ")
    $sas = az storage blob generate-sas `
        --account-name $StorageAccount `
        --account-key $StorageKey `
        --container-name $StorageContainer `
        --name $BlobName `
        --permissions r `
        --expiry $expiry `
        -o tsv

    return "https://$StorageAccount.blob.core.windows.net/$StorageContainer/$BlobName`?$sas"
}

if ([string]::IsNullOrWhiteSpace($BackupPrefix)) {
    $listStorageKey = Get-StorageAccountKey
    $latestManifest = az storage blob list `
        --account-name $StorageAccount `
        --account-key $listStorageKey `
        --container-name $StorageContainer `
        --prefix "shared-db/" `
        --query "sort_by([?ends_with(name, 'manifest.json')], &properties.lastModified)[-1].name" `
        -o tsv

    if ([string]::IsNullOrWhiteSpace($latestManifest)) {
        Write-Host "No hay backups disponibles en $StorageContainer." -ForegroundColor Yellow
        exit 0
    }

    $BackupPrefix = $latestManifest -replace "/manifest.json$", ""
}

Write-Host "Restaurando backup: $BackupPrefix" -ForegroundColor Cyan

$restoreRoot = Join-Path $env:TEMP ("coniiti-shared-db-restore-" + (Get-Date -Format "yyyyMMdd-HHmmss"))
New-Item -ItemType Directory -Path $restoreRoot -Force | Out-Null

$storageKey = Get-StorageAccountKey
$manifestPath = Join-Path $restoreRoot "manifest.json"
az storage blob download `
    --account-name $StorageAccount `
    --account-key $storageKey `
    --container-name $StorageContainer `
    --name "$BackupPrefix/manifest.json" `
    --file $manifestPath `
    --only-show-errors | Out-Null

$manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json

if ($manifest.dump_blob) {
    $remoteFile = "/tmp/coniiti-shared-db-restore.sql"
    $sasUrl = Get-BlobReadSasUrl -BlobName $manifest.dump_blob -StorageKey $storageKey

    Write-Host "Descargando dump completo..." -ForegroundColor Yellow

    $downloadCommand = "wget -q -O $remoteFile '$sasUrl'"
    Invoke-ContainerAppCommand -Command $downloadCommand | Out-Null

    Write-Host "Restaurando cluster PostgreSQL..." -ForegroundColor Yellow

    $restoreCommand = "psql -U admin -d postgres -v ON_ERROR_STOP=0 -f $remoteFile"
    Invoke-ContainerAppCommand -Command $restoreCommand | Out-Null
}
elseif ($manifest.databases) {
    foreach ($database in $manifest.databases) {
    $dbName = $database.name
    $blobName = $database.blob
    $remoteFile = "/tmp/coniiti-$dbName-restore.sql"
    $sasUrl = Get-BlobReadSasUrl -BlobName $blobName -StorageKey $storageKey

    Write-Host "Restaurando $dbName..." -ForegroundColor Yellow

    $downloadCommand = "wget -q -O $remoteFile '$sasUrl'"
    Invoke-ContainerAppCommand -Command $downloadCommand | Out-Null

    $recreateCommand = "dropdb --if-exists -U admin $dbName && createdb -U admin $dbName"
    Invoke-ContainerAppCommand -Command $recreateCommand | Out-Null

    $restoreCommand = "psql -U admin -d $dbName -v ON_ERROR_STOP=1 -f $remoteFile"
    Invoke-ContainerAppCommand -Command $restoreCommand | Out-Null
    }
}
else {
    throw "El manifest no contiene dump_blob ni lista de bases."
}

Write-Host "Restauracion completada desde $BackupPrefix" -ForegroundColor Green
