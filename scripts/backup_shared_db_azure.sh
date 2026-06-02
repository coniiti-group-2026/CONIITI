#!/usr/bin/env bash

# ==============================================================================
# backup_shared_db_azure.sh — Linux Bash script for database backups in Azure
# ==============================================================================

set -eo pipefail

RESOURCE_GROUP=${1:-"coniiti"}
CONTAINER_APP_NAME=${2:-"shared-db"}
STORAGE_ACCOUNT=${3:-"coniitistorage"}
STORAGE_CONTAINER=${4:-"postgres-backups"}

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
            # Attempt to parse retry-after from output
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

get_sql_payload() {
    # Filter out INFO, WARNING, and instructions
    echo "$1" | grep -v -E "^(INFO:|WARNING:|Use ctrl)" | sed '/^[[:space:]]*$/d'
}

get_storage_account_key() {
    az storage account keys list \
        --resource-group "$RESOURCE_GROUP" \
        --account-name "$STORAGE_ACCOUNT" \
        --query "[0].value" \
        -o tsv
}

timestamp=$(date +"%Y%m%d-%H%m%S")
backup_root="/tmp/coniiti-shared-db-backup-$timestamp"
mkdir -p "$backup_root"

echo "Obteniendo llave de almacenamiento..."
storage_key=$(get_storage_account_key)

echo "Creando contenedor de backups si no existe: $STORAGE_CONTAINER"
az storage container create \
    --account-name "$STORAGE_ACCOUNT" \
    --account-key "$storage_key" \
    --name "$STORAGE_CONTAINER" \
    --only-show-errors >/dev/null

echo "Generando backup completo de shared-db..."
dump_command="pg_dumpall -U admin --clean --if-exists --no-role-passwords"
raw_dump=$(invoke_container_app_command "$dump_command")
sql=$(get_sql_payload "$raw_dump")

if [[ -z "$sql" || ! "$sql" == *"PostgreSQL database cluster dump"* ]]; then
    echo "Error: El backup de shared-db no parece contener un dump válido." >&2
    exit 1
fi

local_dump_path="$backup_root/shared-db.sql"
echo "$sql" > "$local_dump_path"

dump_blob="shared-db/$timestamp/shared-db.sql"
echo "Subiendo dump a Azure Blob Storage..."
az storage blob upload \
    --account-name "$STORAGE_ACCOUNT" \
    --account-key "$storage_key" \
    --container-name "$STORAGE_CONTAINER" \
    --name "$dump_blob" \
    --file "$local_dump_path" \
    --overwrite true \
    --only-show-errors >/dev/null

# Generate JSON manifest
created_at_utc=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
manifest_path="$backup_root/manifest.json"

cat <<EOF > "$manifest_path"
{
  "created_at_utc": "$created_at_utc",
  "resource_group": "$RESOURCE_GROUP",
  "container_app": "$CONTAINER_APP_NAME",
  "storage_account": "$STORAGE_ACCOUNT",
  "storage_container": "$STORAGE_CONTAINER",
  "backup_prefix": "shared-db/$timestamp",
  "dump_blob": "$dump_blob"
}
EOF

echo "Subiendo manifest a Azure Blob Storage..."
az storage blob upload \
    --account-name "$STORAGE_ACCOUNT" \
    --account-key "$storage_key" \
    --container-name "$STORAGE_CONTAINER" \
    --name "shared-db/$timestamp/manifest.json" \
    --file "$manifest_path" \
    --overwrite true \
    --only-show-errors >/dev/null

echo "Backup completado con éxito: shared-db/$timestamp"
