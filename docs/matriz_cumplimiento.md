# Matriz Final de Cumplimiento

| Requisito | Evidencia en archivo/ruta | Estado |
| --- | --- | --- |
| Frontend moderno basado en componentes React/Vite | `Front-end/src/App.jsx`, `Front-end/src/components/`, `Front-end/src/pages/`, `Front-end/package.json` | Cumple |
| Gestion de estado dinamico para sesion, formularios y flujos internos | `Front-end/src/context/AuthContext.jsx`, `Front-end/src/hooks/useAgenda.js`, `Front-end/src/components/SessionFormModal.jsx`, `Front-end/src/pages/Login.jsx` | Cumple |
| Diseno adaptativo para movil, tablet y escritorio | `Front-end/src/styles/`, `Front-end/src/styles/pages/Estado.module.css`, `Front-end/src/styles/components/` | Cumple |
| Consumo asincrono de APIs con estados de carga y manejo de errores | `Front-end/src/services/`, `Front-end/src/services/statusService.js`, `Front-end/src/pages/Estado.jsx`, `Front-end/src/__test__/pages/Estado.test.jsx` | Cumple |
| Desacoplamiento backend por dominios de usuarios, eventos y comites | `microservices/auth-service/`, `microservices/users-service/`, `microservices/agenda-service/`, `docs/arquitectura_microservicios.md` | Cumple |
| Servicios adicionales desacoplados para notificaciones, analitica, pagos y archivos | `microservices/notifications-service/`, `microservices/analytics-service/`, `microservices/payments-service/`, `microservices/files-service/` | Cumple |
| API REST con endpoints versionables por gateway y uso de codigos HTTP | `traefik/dynamic.yml`, `microservices/*/app/api/`, `microservices/*/app/main.py` | Cumple |
| Persistencia mediante ORM/ODM y archivos de inicializacion | `microservices/*/app/database.py`, `microservices/*/app/models/`, `microservices/analytics-service/app/database.py`, `postgres-init/init-db.sql` | Cumple |
| Validacion y sanitizacion de entradas en servidor | `microservices/auth-service/app/schemas/`, `microservices/users-service/app/schemas/`, `microservices/agenda-service/app/schemas/agenda.py`, `microservices/files-service/app/schemas.py`, `microservices/payments-service/app/schemas/` | Cumple |
| Dockerfile multi-stage para componentes de aplicacion | `Front-end/Dockerfile`, `microservices/*/Dockerfile` | Cumple |
| Orquestacion local con un solo comando | `docker-compose.yml`, comando `docker compose up --build` documentado en `README.md` | Cumple |
| Aislamiento de configuracion por variables de entorno | `.env.example`, `.gitignore`, `docker-compose.yml`, `scripts/minikube-local.ps1` / `scripts/minikube-local.sh` | Cumple |
| Evitar secretos sensibles en codigo fuente | `.env.example`, `.gitignore`, `README.md`, `scripts/minikube-local.ps1` / `scripts/minikube-local.sh` | Cumple |
| Suite de pruebas frontend | `Front-end/src/__test__/`, `Front-end/package.json` | Cumple |
| Suite de pruebas backend por microservicio | `microservices/*/tests/`, `.github/workflows/ci.yml` | Cumple |
| Linter backend con Ruff | `pyproject.toml`, `.github/workflows/ci.yml` | Cumple |
| Integracion continua con lint, pruebas, auditoria, Docker y manifiestos | `.github/workflows/ci.yml` | Cumple |
| Despliegue continuo remoto a staging | `README.md`, seccion `CD Local Simulado` | No aplica por alcance economico |
| Despliegue continuo local tipo staging | `scripts/minikube-local.ps1` / `scripts/minikube-local.sh`, `Kubernetes/`, `README.md`, `.github/workflows/ci.yml` | Local |
| Autenticacion con JWT firmado | `microservices/auth-service/app/utils/jwt.py`, `microservices/users-service/app/utils/security.py`, `microservices/agenda-service/app/utils/security.py`, `microservices/files-service/app/utils/security.py`, `microservices/payments-service/app/utils/security.py` | Cumple |
| Hash adaptativo de contrasenas | `microservices/auth-service/app/utils/jwt.py`, `microservices/auth-service/requirements.txt` | Cumple |
| Control de acceso por roles | `Front-end/src/components/ProtectedRoute.jsx`, `microservices/users-service/app/utils/security.py`, `microservices/agenda-service/app/utils/security.py`, `microservices/files-service/app/utils/security.py`, `microservices/payments-service/app/utils/security.py` | Cumple |
| Observabilidad minima con panel de disponibilidad | `Front-end/src/pages/Estado.jsx`, `Front-end/src/services/statusService.js`, `docker-compose.yml` | Cumple |
| Logs estructurados con `service`, `request_id`, `method`, `path`, `status_code` y `duration_ms` | `microservices/*/app/main.py`, `docs/observabilidad.md` | Cumple |
| Sustentacion tecnica grupal | `README.md`, `docs/arquitectura_microservicios.md`, `docs/contracts_and_events.md`, `docs/observabilidad.md`, `docs/matriz_cumplimiento.md` | No aplica por alcance del repositorio |
