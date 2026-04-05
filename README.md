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

## Entregables del taller

- Arquitectura y justificacion tecnologica: `docs/arquitectura_microservicios.md`
- Diagrama exportable: `docs/architecture-diagram.svg`
- Contratos JSON y eventos: `docs/contracts_and_events.md`
- Guion de prueba de resiliencia: `docs/prueba_resiliencia.md`
- Guia de despliegue remoto: `docs/despliegue_remoto.md`

## Scripts utiles

- Crear usuario interno `staff` o `superuser` desde PowerShell: `scripts/create-internal-user.ps1`
- Crear usuario interno `staff` o `superuser` desde Bash: `scripts/create-internal-user.sh`

## Resumen de la solucion

- El Front-end consume exclusivamente rutas `'/api/*'` publicadas por Traefik.
- Cada microservicio mantiene su propia persistencia y no comparte tablas con los demas.
- `auth-service` y `agenda-service` publican eventos en RabbitMQ.
- `notifications-service` y `analytics-service` reaccionan de forma asincrona a esos eventos.
- Si `notifications-service` se apaga, el registro y la agenda siguen respondiendo; los eventos pendientes quedan en cola y se reprocesan cuando el consumidor vuelve.

## Observacion tecnica

La resiliencia frente a la caida de `notifications-service` esta cubierta por RabbitMQ y colas durables. Aun asi, una caida del broker durante el registro de usuarios todavia impacta `auth-service`; una mejora futura natural es implementar un patron Outbox para desacoplar todavia mas la publicacion de eventos.
