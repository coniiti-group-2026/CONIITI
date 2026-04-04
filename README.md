# CONIITI 2026 - Arquitectura de Microservicios

El flujo principal del proyecto levanta solo microservicios y Traefik como puerta de entrada. El directorio `Back-end/` queda fuera del `docker-compose.yml` principal y no participa en el enrutamiento activo.

## Servicios activos

- `traefik`: API Gateway y unica puerta de entrada HTTP
- `frontend`: SPA del congreso
- `auth-service`: autenticacion, sesion, registro y recuperacion de contrasena
- `users-service`: perfiles y gestion de cuentas
- `agenda-service`: sesiones, speakers y preinscripciones
- `analytics-service`: consumo de eventos y estadisticas
- `files-service`: carga y descarga de archivos
- `notifications-service`: consumo asincrono y persistencia de eventos
- `payments-service`: checkout de pagos en modo local por gateway
- `rabbitmq`: mensajeria asincrona compartida
- `analytics-mongo`, `auth-db`, `users-db`, `agenda-db`, `notifications-db`, `payments-db`: persistencia aislada por servicio

## Rutas finales por Traefik

- Frontend: `http://localhost/`
- Auth: `http://localhost/api/auth`
- Users: `http://localhost/api/users`
- Agenda: `http://localhost/api/agenda`
- Analytics: `http://localhost/api/analytics`
- Files: `http://localhost/api/files`
- Notifications: `http://localhost/api/notifications`
- Payments: `http://localhost/api/payments`
- Traefik dashboard: `http://localhost:8080`

## Levantar todo

```bash
docker compose up --build
```
