# Observabilidad Local

## Panel de estado

La ruta `http://localhost/estado` muestra una verificacion agregada de los microservicios expuestos por Traefik:

| Servicio | Healthcheck |
| --- | --- |
| Auth | `/api/auth/health` |
| Users | `/api/users/health` |
| Agenda | `/api/agenda/health` |
| Files | `/api/files/health` |
| Payments | `/api/payments/health` |
| Analytics | `/api/analytics/health` |
| Notifications | `/api/notifications/health` |

Cada tarjeta muestra estado HTTP, disponibilidad, latencia y ultima verificacion. El resumen superior muestra servicios disponibles, latencia promedio y ultima verificacion global.

## Logs estructurados

Todos los microservicios FastAPI registran cada request desde el middleware `structured_access_log` definido en `app/main.py`.

Campos obligatorios:

| Campo | Descripcion |
| --- | --- |
| `service` | Nombre del microservicio que atendio la solicitud. |
| `request_id` | Identificador de correlacion. Si llega `x-request-id`, se reutiliza; si no, se genera un UUID. |
| `method` | Verbo HTTP recibido. |
| `path` | Ruta HTTP solicitada. |
| `status_code` | Codigo HTTP devuelto. |
| `duration_ms` | Duracion total de la solicitud en milisegundos. |

En errores no controlados se agrega `error` y se registra `status_code: 500`.

Ejemplo:

```json
{"service":"auth-service","request_id":"8b3c1a78-5b8c-4f3f-9a5a-42fb7f0d78b1","method":"GET","path":"/health","status_code":200,"duration_ms":4.32}
```

Comandos de consulta:

```powershell
docker compose logs -f auth-service
docker compose logs -f users-service
kubectl logs deployment/auth-service
```

## Evidencia tecnica

- Frontend de estado: `Front-end/src/pages/Estado.jsx`.
- Cliente de healthchecks: `Front-end/src/services/statusService.js`.
- Healthchecks de contenedores: `docker-compose.yml`.
- Middleware de logs: `microservices/*/app/main.py`.
