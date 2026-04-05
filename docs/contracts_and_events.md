# Contratos JSON y Eventos - CONIITI 2026

## Infraestructura

- Exchange: `coniiti_events`
- Tipo: `topic`
- Cola de notificaciones: `notifications_queue`
- Persistencia: exchange durable, cola durable y mensajes persistentes

## `usuario.registrado`

- Routing key: `usuario.registrado`
- Publicador: `auth-service`

```json
{
  "event_id": "uuid",
  "event": "usuario.registrado",
  "user_id": "uuid",
  "email": "usuario@correo.com",
  "name": "Nombre Completo",
  "timestamp": "2026-04-04T15:30:00Z"
}
```

## `ponencia.creada`

- Routing key: `ponencia.creada`
- Publicador: `agenda-service`

```json
{
  "event_id": "uuid",
  "session_id": "uuid",
  "titulo": "string",
  "ponente": "string",
  "dia": "YYYY-MM-DD",
  "hora_inicio": "HH:MM"
}
```

## `agenda.sesion_actualizada`

- Routing key: `agenda.sesion_actualizada`
- Publicador: `agenda-service`

```json
{
  "event_id": "uuid",
  "session_id": "uuid",
  "titulo": "string",
  "cambios": {
    "campo_modificado": "nuevo_valor"
  },
  "afectados": ["uuid-usuario-1", "uuid-usuario-2"]
}
```

## Comportamiento resiliente

Si `notifications-service` se detiene, `auth-service` y `agenda-service` siguen publicando en RabbitMQ. Cuando notificaciones vuelve a levantarse, procesa los mensajes pendientes y los persiste en su propia base de datos sin depender del monolito.
