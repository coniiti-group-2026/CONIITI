# CONIITI 2026 - Arquitectura de Microservicios

Este repositorio levanta el flujo principal de CONIITI sin el monolito legacy.

## Servicios activos

- `traefik`: API Gateway y unica puerta de entrada
- `frontend`: SPA del congreso
- `auth-service`: autenticacion, sesion, registro y recuperacion de contrasena
- `users-service`: perfiles y gestion de cuentas staff
- `agenda-service`: sesiones, agenda, speakers y preinscripciones
- `notifications-service`: consumidor asincrono persistente de eventos
- `rabbitmq`: mensajeria asincrona
- `auth-db`, `users-db`, `agenda-db`, `notifications-db`: bases de datos independientes

## Rutas finales

- Frontend: `http://localhost/`
- Auth: `http://localhost/api/auth`
- Users: `http://localhost/api/users`
- Agenda: `http://localhost/api/agenda`
- Traefik dashboard: `http://localhost:8080`

## Eventos asincronos

- `usuario.registrado`
- `ponencia.creada`
- `agenda.sesion_actualizada`

`notifications-service` consume desde la cola durable `notifications_queue` y persiste cada evento procesado en su propia base de datos.

## Levantar todo

```bash
docker-compose up --build
```

El flujo principal ya no utiliza el directorio `Back-end` ni servicios legacy de CMS, analytics, files o payments.
