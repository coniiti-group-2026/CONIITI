# CONIITI

Guia de ejecucion local para la plataforma de Gestion de Eventos y Comites. Por alcance economico, la entrega no despliega a un staging remoto ni a produccion. En su lugar implementa un flujo reproducible de validacion continua y despliegue continuo local usando Docker Compose y Minikube con Docker como driver.

## Requisitos

- Windows 10/11 con virtualizacion habilitada.
- Docker Desktop con Linux containers y backend WSL 2.
- Git.
- Minikube.
- kubectl.

Instalacion recomendada en PowerShell como administrador:

```powershell
winget install -e --id Docker.DockerDesktop
winget install -e --id Git.Git
winget install -e --id Kubernetes.minikube
winget install -e --id Kubernetes.kubectl
```

Verificacion:

```powershell
docker --version
docker compose version
minikube version
kubectl version --client
git --version
```

## Configuracion Local

El repositorio incluye `.env.example` con placeholders. Para una demo local puedes omitir `.env.local` y el script usara defaults seguros de desarrollo. Para usar valores propios:

```powershell
Copy-Item .env.example .env.local
```

Edita `.env.local` solo en tu maquina y reemplaza cualquier valor `replace-with-*`. Ese archivo esta ignorado por Git y no debe contener credenciales reales de produccion. El script de Minikube puede funcionar sin `.env.local`, usando valores locales de desarrollo.

## Opcion 1: Docker Compose

Desde la raiz del proyecto, este comando construye imagenes, crea la red interna, monta volumenes persistentes y levanta gateway, frontend, bases de datos, mensajeria y microservicios:

```powershell
docker compose up --build
```

Abre:

```text
http://localhost
```

Rutas principales:

- Frontend: `http://localhost`
- Estado/Uptime: `http://localhost/estado`
- Auth: `http://localhost/api/auth`
- Usuarios: `http://localhost/api/users`
- Comites: `http://localhost/api/committees/members`
- Agenda/Eventos: `http://localhost/api/agenda`
- Notificaciones: `http://localhost/api/notifications`
- Pagos: `http://localhost/api/payments`
- Analitica: `http://localhost/api/analytics`
- Archivos: `http://localhost/api/files`

Comandos utiles:

```powershell
docker compose ps
docker compose logs -f
docker compose config --quiet
docker compose down
```

`docker compose ps` muestra la disponibilidad declarada por los `healthcheck` de Postgres, MongoDB, RabbitMQ, microservicios FastAPI y frontend. La aplicacion tambien expone una vista agregada en `http://localhost/estado`.

Para borrar tambien volumenes locales:

```powershell
docker compose down -v
```

## Opcion 2: Minikube Local

Minikube es el entorno de pruebas local tipo staging. Simula el despliegue continuo sin costos de nube: usa imagenes construidas localmente, Secrets de Kubernetes generados desde `.env.local` o defaults de desarrollo, manifests versionados y validacion de rollouts.

El comando unico de despliegue local/staging local es:

```powershell
.\scripts\minikube-local.ps1 all
```

Ese flujo ejecuta:

```powershell
minikube start --driver=docker --cpus=2 --memory=3072 --disk-size=20g
```

Luego conecta Docker al daemon de Minikube, construye las imagenes locales, crea Secrets de Kubernetes desde `.env.local` o defaults locales, aplica infraestructura, microservicios e ingress, valida rollouts y expone Traefik por `localhost` con port-forward.

Acciones disponibles:

```powershell
.\scripts\minikube-local.ps1 start
.\scripts\minikube-local.ps1 build
.\scripts\minikube-local.ps1 secrets
.\scripts\minikube-local.ps1 deploy
.\scripts\minikube-local.ps1 status
.\scripts\minikube-local.ps1 open
.\scripts\minikube-local.ps1 stop-forward
.\scripts\minikube-local.ps1 clean
.\scripts\minikube-local.ps1 reset
.\scripts\minikube-local.ps1 all
```

`open` imprime una URL como `http://127.0.0.1:8080` y deja un `kubectl port-forward` en segundo plano. `stop-forward` cierra ese tunel local. `clean` elimina los recursos CONIITI aplicados al cluster local, incluyendo PVCs definidos en los manifiestos.

## CD Local Simulado

El pipeline `.github/workflows/ci.yml` no publica a un proveedor externo. Esa decision evita costos de infraestructura, credenciales cloud y dependencias fuera del alcance academico. La intencion DevOps se cubre asi:

1. En cada `push` o `pull_request`, GitHub Actions valida lint, pruebas frontend/backend, auditoria npm, builds Docker y sintaxis de Compose/Kubernetes.
2. Si la validacion pasa, cualquier integrante puede ejecutar `docker compose up --build` para levantar todo el ecosistema local.
3. Para una simulacion mas cercana a staging, `.\scripts\minikube-local.ps1 all` construye las imagenes, crea Secrets, aplica manifests de Kubernetes, valida rollouts y expone la aplicacion por port-forward.
4. Los `.dockerignore` de cada contexto evitan copiar dependencias locales, caches, tests, archivos `.env`, bases SQLite y logs dentro de las imagenes.

Este flujo reemplaza el CD remoto por un despliegue continuo local, auditable y reproducible con herramientas de contenedores y orquestacion vistas en clase.

## Arquitectura Local

- Frontend: React/Vite.
- API Gateway: Traefik.
- Usuarios y Comites: `users-service`.
- Autenticacion/JWT: `auth-service`.
- Eventos/Agenda: `agenda-service`.
- Notificaciones: `notifications-service`.
- Pagos: `payments-service`.
- Analitica: `analytics-service`.
- Archivos: `files-service`.
- Persistencia local ligera: un Postgres compartido con bases logicas separadas, MongoDB para analitica y RabbitMQ para mensajeria.

## Diagnostico y Observabilidad

Estado general desde la aplicacion:

```text
http://localhost/estado
```

Comandos utiles en Kubernetes:

```powershell
kubectl get pods
kubectl get svc
kubectl rollout status deployment/auth-service
kubectl logs deployment/auth-service
kubectl describe pod <NOMBRE_DEL_POD>
kubectl get events --sort-by=.lastTimestamp
```

Los servicios FastAPI emiten logs JSON con `service`, `request_id`, `method`, `path`, `status_code` y `duration_ms`.

## Pruebas

Frontend:

```powershell
cd Front-end
npm run lint
npm test
npm run build:strict
npm audit --audit-level=high
```

Backend, por servicio:

```powershell
cd microservices/auth-service
python -m pytest -q
```

Lint backend desde la raiz:

```powershell
ruff check microservices
```

Suite backend completa:

```powershell
foreach ($service in Get-ChildItem microservices -Directory) {
  Push-Location $service.FullName
  python -m pip install -r requirements.txt pytest
  $env:PYTHONPATH='.'
  python -m pytest -q
  Pop-Location
}
```

CI local de infraestructura:

```powershell
docker compose config --quiet
```

El workflow `.github/workflows/ci.yml` valida lint, pruebas, build frontend, auditoria npm, lint backend con Ruff, pruebas en todos los microservicios, builds Docker y sintaxis YAML. No realiza despliegue remoto por decision de alcance.

## Infraestructura Local

- Todos los Dockerfiles de aplicacion usan multi-stage build.
- Cada contexto de build tiene `.dockerignore` para reducir tamano de imagen y evitar subir secretos o artefactos locales.
- `docker-compose.yml` define red interna, volumenes persistentes y healthchecks para servicios criticos.
- `.env.example` contiene placeholders y valores locales no sensibles; `.env.local` esta ignorado por Git mediante `.gitignore`.

## Seguridad

- No hay secretos reales versionados para el despliegue local.
- `.env.local` queda fuera de Git.
- Kubernetes recibe secretos mediante `scripts/minikube-local.ps1`.
- Las contrasenas de usuarios se almacenan con hashing adaptativo mediante `passlib`.
- La autenticacion usa tokens JWT firmados. El token de sesion viaja en cookie `HttpOnly` y los microservicios validan la firma con `JWT_SECRET_KEY`.
- Los endpoints administrativos de archivos y contenido (`/api/files/upload`, `/api/files/assets/*`, `/api/files/documents/*`, `/api/files/content/cards/*`) requieren rol `staff` o `superuser`.
- Los pagos requieren usuario autenticado. Un usuario normal solo puede crear o consultar pagos cuyo `user_id` coincida con el `sub` del JWT; `staff` y `superuser` pueden operar pagos de otros usuarios.
- La agenda valida en servidor dias permitidos del congreso, formato y orden de horas, cupos no negativos y URLs virtuales `http/https`.
- Cualquier credencial real que haya sido expuesta previamente debe revocarse fuera del repositorio.

### Matriz de acceso

| Rol | Permisos principales |
| --- | --- |
| `superuser` | Administracion completa de usuarios staff, comites, agenda, archivos/contenido y pagos. |
| `staff` | Gestion operativa de agenda, archivos/contenido y pagos autorizados. |
| `university_community` / `external` | Consulta publica, preinscripcion a sesiones propias y pagos propios. |
