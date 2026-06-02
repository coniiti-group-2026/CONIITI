#!/usr/bin/env bash

# ==============================================================================
# gestionar_instancias_azure.sh — Linux Bash script to scale Azure Container Apps
# ==============================================================================

set -eo pipefail

ACTION=""
SKIP_BACKUP=false
SKIP_RESTORE=false
RESOURCE_GROUP="coniiti"

# Get current script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        Encender|Apagar)
            ACTION="$1"
            shift
            ;;
        --skip-backup|-SkipBackup)
            SKIP_BACKUP=true
            shift
            ;;
        --skip-restore|-SkipRestore)
            SKIP_RESTORE=true
            shift
            ;;
        *)
            echo "Parámetro desconocido: $1" >&2
            echo "Uso: $0 {Encender|Apagar} [--skip-backup] [--skip-restore]" >&2
            exit 1
            ;;
    esac
done

if [ -z "$ACTION" ]; then
    echo "Error: Se requiere especificar la acción (Encender o Apagar)." >&2
    echo "Uso: $0 {Encender|Apagar} [--skip-backup] [--skip-restore]" >&2
    exit 1
fi

echo -e "\e[36m==========================================\e[0m"
echo -e "\e[36m  Gestión de instancias en Azure ($ACTION)\e[0m"
echo -e "\e[36m==========================================\e[0m"

infrastructure_apps=(
    "shared-db"
    "analytics-mongo"
    "shared-rabbitmq"
)

service_apps=(
    "agenda-service"
    "analytics-service"
    "auth-service"
    "files-service"
    "notifications-service"
    "payments-service"
    "users-service"
    "frontend"
)

set_container_app_scale() {
    local -n apps=$1
    local min_replicas="$2"
    local default_max_replicas="$3"
    local title="$4"

    echo -e "\n\e[33m$title\e[0m"
    for app in "${apps[@]}"; do
        local max_replicas=$min_replicas
        if [ "$min_replicas" -eq 1 ] && [ "$default_max_replicas" -gt 1 ]; then
            max_replicas=$default_max_replicas
        else
            max_replicas=1
        fi

        echo "-> Configurando $app a $min_replicas instancia(s)"
        az containerapp update \
            --name "$app" \
            --resource-group "$RESOURCE_GROUP" \
            --min-replicas "$min_replicas" \
            --max-replicas "$max_replicas" >/dev/null
        echo -e "   \e[32mListo: $app\e[0m"
    done
}

wait_for_shared_db() {
    echo -e "\n\e[33mEsperando a que shared-db acepte conexiones...\e[0m"
    for i in {1..12}; do
        set +e
        az containerapp exec \
            --name "shared-db" \
            --resource-group "$RESOURCE_GROUP" \
            --command "pg_isready -U admin" &>/dev/null
        exit_code=$?
        set -e

        if [ $exit_code -eq 0 ]; then
            echo -e "\e[32mshared-db está listo.\e[0m"
            return 0
        fi

        sleep 10
    done

    echo "Error: shared-db no quedó listo a tiempo." >&2
    exit 1
}

if [ "$ACTION" = "Apagar" ]; then
    set_container_app_scale service_apps 0 1 "[1/3] Apagando microservicios para dejar la base quieta..."

    if [ "$SKIP_BACKUP" = false ]; then
        echo -e "\n\e[33m[2/3] Creando backup de shared-db en Azure Storage...\e[0m"
        if ! "$SCRIPT_DIR/backup_shared_db_azure.sh"; then
            echo "Error: No se pudo crear el backup. Se cancela el apagado para proteger los datos." >&2
            exit 1
        fi
    else
        echo -e "\n\e[33m[2/3] Backup omitido por parámetro --skip-backup.\e[0m"
    fi

    set_container_app_scale infrastructure_apps 0 1 "[3/3] Apagando infraestructura..."
else
    set_container_app_scale infrastructure_apps 1 1 "[1/3] Encendiendo infraestructura..."

    if [ "$SKIP_RESTORE" = false ]; then
        wait_for_shared_db
        echo -e "\n\e[33m[2/3] Restaurando último backup de shared-db...\e[0m"
        if ! "$SCRIPT_DIR/restore_shared_db_azure.sh"; then
            echo "Error: No se pudo restaurar shared-db. Se cancela el encendido de servicios." >&2
            exit 1
        fi
    else
        echo -e "\n\e[33m[2/3] Restauración omitida por parámetro --skip-restore.\e[0m"
    fi

    set_container_app_scale service_apps 1 10 "[3/3] Encendiendo microservicios..."
fi

echo -e "\n\e[32m==========================================\e[0m"
echo -e "\e[32mOperación completada con éxito.\e[0m"
echo -e "\e[32m==========================================\e[0m"
