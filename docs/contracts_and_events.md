# Documento de Contratos JSON y Eventos — CONIITI 2026

Este documento define los esquemas de los mensajes intercambiados a través del bus de eventos (RabbitMQ) para asegurar integraciones robustas entre microservicios.

## Infraestructura
- **Exchange**: `coniiti_events`
- **Tipo**: `topic`
- **Persistencia**: Durable

---

## 1. Dominio de Agenda

### Evento: `ponencia.creada`
Publicado cuando se crea una nueva sesión en el congreso.
- **Routing Key**: `ponencia.creada`
- **Payload**:
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

### Evento: `agenda.sesion_actualizada`
Publicado cuando una sesión existente sufre cambios en campos críticos (título, hora, salón, etc.).
- **Routing Key**: `agenda.sesion_actualizada`
- **Payload**:
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

---

## 2. Dominio de Usuarios

### Evento: `usuario.registrado`
Publicado cuando un nuevo usuario completa su registro local.
- **Routing Key**: `usuario.registrado`
- **Payload**:
```json
{
  "event_id": "uuid",
  "user_id": "uuid",
  "full_name": "string",
  "correo": "string",
  "role": "string"
}
```

---

## 3. Dominio de Pagos (Simulado)

### Evento: `pago.completado`
Publicado tras una transacción exitosa en la pasarela.
- **Routing Key**: `pago.completado`
- **Payload**:
```json
{
  "event_id": "uuid",
  "user_id": "uuid",
  "transaction_id": "string",
  "monto": "float",
  "moneda": "string"
}
```

---

## Escenario de Resiliencia (Demo)
El microservicio `notifications-service` actúa como consumidor pasivo. 
- **Prueba**: Detener el contenedor `notifications-service`.
- **Resultado**: Los servicios `agenda-service` y el monolito siguen operando y publicando eventos en RabbitMQ. Al reiniciar el contenedor de notificaciones, este procesará los mensajes acumulados en la cola `notifications_queue` sin pérdida de información.
