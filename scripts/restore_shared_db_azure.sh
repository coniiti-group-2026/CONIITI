#!/usr/bin/env bash

# ==============================================================================
# restore_shared_db_azure.sh — Linux Bash script for database restores in Azure
# ==============================================================================

set -eo pipefail

RESOURCE_GROUP=${1:-"coniiti"}
CONTAINER_APP_NAME=${2:-"shared-db"}
STORAGE_ACCOUNT=${3:-"coniitistorage"}
STORAGE_CONTAINER=${4:-"postgres-backups"}
BACKUP_PREFIX=${5:-""}

invoke_container_app_command() {
    local cmd="$1"
    local max_retries=2
    local attempt=0

    while [ $attempt -le $max_retries ]; do
        set +e
        output=$(az containerapp exec \
            --resource-group "$RESOURCE_GROUP" \
            --name "$CONTAINER_APP_NAME" \
            --command "$cmd" 2>&1)
        exit_code=$?
        set -e

        if [ $exit_code -eq 0 ]; then
            echo "$output"
            return 0
        fi

        if [[ "$output" == *"429 Too Many Requests"* ]] && [ $attempt -lt $max_retries ]; then
            retry_seconds=600
            if [[ "$output" =~ \'retry-after\':[[:space:]]*\'([0-9]+)\' ]]; then
                retry_seconds="${BASH_REMATCH[1]}"
            elif [[ "$output" =~ \"retry-after\":[[:space:]]*\"([0-9]+)\" ]]; then
                retry_seconds="${BASH_REMATCH[1]}"
            fi

            echo "Azure limitó las sesiones exec. Reintentando en $retry_seconds segundos..." >&2
            sleep "$retry_seconds"
            attempt=$((attempt + 1))
            continue
        fi

        echo "Error ejecutando comando en ${CONTAINER_APP_NAME}: $output" >&2
        exit 1
    done
}

get_storage_account_key() {
    az storage account keys list \
        --resource-group "$RESOURCE_GROUP" \
        --account-name "$STORAGE_ACCOUNT" \
        --query "[0].value" \
        -o tsv
}

get_blob_read_sas_url() {
    local blob_name="$1"
    local storage_key="$2"

    # Cross-platform way to get UTC time + 2 hours
    local expiry
    expiry=$(python3 -c "from datetime import datetime, timedelta; print((datetime.utcnow() + timedelta(hours=2)).strftime('%Y-%m-%dT%H:%MZ'))")

    local sas
    sas=$(az storage blob generate-sas \
        --account-name "$STORAGE_ACCOUNT" \
        --account-key "$storage_key" \
        --container-name "$STORAGE_CONTAINER" \
        --name "$blob_name" \
        --permissions r \
        --expiry "$expiry" \
        -o tsv)

    echo "https://$STORAGE_ACCOUNT.blob.core.windows.net/$STORAGE_CONTAINER/$blob_name?$sas"
}

storage_key=$(get_storage_account_key)

if [ -z "$BACKUP_PREFIX" ]; then
    echo "Buscando el último backup en Azure Storage..."
    latest_manifest=$(az storage blob list \
        --account-name "$STORAGE_ACCOUNT" \
        --account-key "$storage_key" \
        --container-name "$STORAGE_CONTAINER" \
        --prefix "shared-db/" \
        --query "sort_by([?ends_with(name, 'manifest.json')], &properties.lastModified)[-1].name" \
        -o tsv)

    if [ -z "$latest_manifest" ]; then
        echo "No hay backups disponibles en $STORAGE_CONTAINER."
        exit 0
    fi

    BACKUP_PREFIX=$(echo "$latest_manifest" | sed 's/\/manifest.json$//')
fi

echo "Restaurando backup: $BACKUP_PREFIX"

restore_root="/tmp/coniiti-shared-db-restore-$(date +'%Y%m%d-%H%M%S')"
mkdir -p "$restore_root"

manifest_path="$restore_root/manifest.json"
az storage blob download \
    --account-name "$STORAGE_ACCOUNT" \
    --account-key "$storage_key" \
    --container-name "$STORAGE_CONTAINER" \
    --name "$BACKUP_PREFIX/manifest.json" \
    --file "$manifest_path" \
    --only-show-errors >/dev/null

# Parse manifest with python
dump_blob=$(python3 -c "import json; manifest = json.load(open('$manifest_path')); print(manifest.get('dump_blob', ''))")

if [ -n "$dump_blob" ]; then
    remote_file="/tmp/coniiti-shared-db-restore.sql"
    sas_url=$(get_blob_read_sas_url "$dump_blob" "$storage_key")

    echo "Descargando dump completo..."
    download_command="wget -q -O $remote_file '$sas_url'"
    invoke_container_app_command "$download_command" >/dev/null

    echo "Restaurando clúster PostgreSQL..."
    restore_command="psql -U admin -d postgres -v ON_ERROR_STOP=0 -f $remote_file"
    invoke_container_app_command "$restore_command" >/dev/null
else
    # Check for databases list in manifest
    has_dbs=$(python3 -c "import json; manifest = json.load(open('$manifest_path')); print('1' if 'databases' in manifest else '')")
    if [ "$has_dbs" = "1" ]; then
        # Loop through databases in Python and output as a simple key-value sequence
        python3 -c "import json; manifest = json.load(open('$manifest_path')); [print(f\"{db['name']}|{db['blob']}\") for db in manifest['databases']]" | while IFS='|' read -r db_name db_blob; do
            remote_file="/tmp/coniiti-$db_name-restore.sql"
            sas_url=$(get_blob_read_sas_url "$db_blob" "$storage_key")

            echo "Restaurando base de datos: $db_name..."
            download_command="wget -q -O $remote_file '$sas_url'"
            invoke_container_app_command "$download_command" >/dev/null

            recreate_command="dropdb --if-exists -U admin $db_name && createdb -U admin $db_name"
            invoke_container_app_command "$recreate_command" >/dev/null

            restore_command="psql -U admin -d $db_name -v ON_ERROR_STOP=1 -f $remote_file"
            invoke_container_app_command "$restore_command" >/dev/null
        done
    else
        echo "Error: El manifest no contiene dump_blob ni lista de bases." >&2
        exit 1
    fi
fi

echo "Restauración completada con éxito desde $BACKUP_PREFIX"
