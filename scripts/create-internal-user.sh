#!/usr/bin/env bash

set -euo pipefail

usage() {
  cat <<'EOF'
Uso:
  ./scripts/create-internal-user.sh \
    --email admin@coniiti.com \
    --full-name "Admin CONIITI" \
    --password "Admin1234" \
    --role superuser \
    [--institution "Universidad"] \
    [--base-url https://tu-dominio.com] \
    [--token coniiti-internal-token] \
    [--inactive]
EOF
}

EMAIL=""
FULL_NAME=""
PASSWORD=""
ROLE=""
INSTITUTION=""
BASE_URL="http://localhost"
INTERNAL_TOKEN="${CONIITI_INTERNAL_SERVICE_TOKEN:-coniiti-internal-token}"
IS_ACTIVE="true"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --email)
      EMAIL="$2"
      shift 2
      ;;
    --full-name)
      FULL_NAME="$2"
      shift 2
      ;;
    --password)
      PASSWORD="$2"
      shift 2
      ;;
    --role)
      ROLE="$2"
      shift 2
      ;;
    --institution)
      INSTITUTION="$2"
      shift 2
      ;;
    --base-url)
      BASE_URL="$2"
      shift 2
      ;;
    --token)
      INTERNAL_TOKEN="$2"
      shift 2
      ;;
    --inactive)
      IS_ACTIVE="false"
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Parametro no reconocido: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$EMAIL" || -z "$FULL_NAME" || -z "$PASSWORD" || -z "$ROLE" ]]; then
  echo "Faltan parametros obligatorios." >&2
  usage
  exit 1
fi

if [[ "$ROLE" != "staff" && "$ROLE" != "superuser" ]]; then
  echo "El rol debe ser 'staff' o 'superuser'." >&2
  exit 1
fi

BASE_URL="${BASE_URL%/}"

auth_payload=$(
  cat <<EOF
{"email":"$EMAIL","password":"$PASSWORD","full_name":"$FULL_NAME","is_active":$IS_ACTIVE}
EOF
)

echo "Creando cuenta en auth-service..."
auth_response="$(
  curl --silent --show-error --fail \
    -X POST "$BASE_URL/api/auth/internal/users" \
    -H "Content-Type: application/json" \
    -H "X-Internal-Service-Token: $INTERNAL_TOKEN" \
    -d "$auth_payload"
)"

user_id="$(printf '%s' "$auth_response" | sed -n 's/.*"user_id":"\([^"]*\)".*/\1/p')"

if [[ -z "$user_id" ]]; then
  echo "No se pudo extraer user_id de auth-service." >&2
  exit 1
fi

cleanup_auth_user() {
  curl --silent --show-error --fail \
    -X DELETE "$BASE_URL/api/auth/internal/users/$user_id" \
    -H "X-Internal-Service-Token: $INTERNAL_TOKEN" >/dev/null
}

if [[ -n "$INSTITUTION" ]]; then
  profile_payload=$(
    cat <<EOF
{"id":"$user_id","full_name":"$FULL_NAME","email":"$EMAIL","role":"$ROLE","institution":"$INSTITUTION","is_active":$IS_ACTIVE}
EOF
  )
else
  profile_payload=$(
    cat <<EOF
{"id":"$user_id","full_name":"$FULL_NAME","email":"$EMAIL","role":"$ROLE","institution":null,"is_active":$IS_ACTIVE}
EOF
  )
fi

echo "Creando perfil en users-service..."
if ! profile_response="$(
  curl --silent --show-error --fail \
    -X POST "$BASE_URL/api/users/internal/profiles" \
    -H "Content-Type: application/json" \
    -H "X-Internal-Service-Token: $INTERNAL_TOKEN" \
    -d "$profile_payload"
)"; then
  echo "Error creando el perfil; intentando rollback en auth-service..." >&2
  cleanup_auth_user || true
  exit 1
fi

echo
echo "Usuario creado correctamente."
echo "$profile_response"
