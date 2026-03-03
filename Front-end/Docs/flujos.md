# Flujos de Usuario

## Flujo 1: Asistente explorando la agenda

```
Portada (/)
    │
    ▼
Clic en "Ver Agenda" o link Navbar
    │
    ▼
/agenda — Carga sesiones
    │
    ├── Filtra por día / modalidad / track / búsqueda
    │       │
    │       ▼
    │   Lista de SessionCards actualizada
    │
    ├── Clic en nombre del ponente → abre SpeakerModal
    │
    └── Clic en "Pre-inscribirse"
            │
            ¿Cupos disponibles?
            │ No → botón desactivado "Sin cupos"
            │ Sí → sesión se agrega a registeredIds (estado global)
                    │
                    ▼
              Botón cambia a "Pre-inscrito" ✅
              + Enlace "Unirse" se activa si link verificado
```

---

## Flujo 2: Staff administrando sesiones

```
/login → ingresa admin@coniiti.edu.co
    │
    ▼
Redirige automáticamente a /staff
    │
    ▼
Panel de Staff — tabla de 12 sesiones
    │
    ├── [Nueva Conferencia] → abre SessionFormModal vacío
    │       │
    │       ▼
    │   Llena campos → [Guardar] → sesión aparece en la tabla
    │
    ├── [Editar] → abre SessionFormModal con datos pre-cargados
    │       │
    │       ▼
    │   Modifica campos → [Guardar] → sesión actualizada en tabla
    │
    ├── [Eliminar] → confirmación → sesión removida de la tabla
    │
    └── [Sin verificar] / [Verificado] (columna Enlace Virtual)
            │
            ▼
        Toggle del campo link_verificado
        → Impacta el botón "Unirse" en la agenda para usuarios pre-inscritos
```

---

## Flujo 3: Pre-inscripción y acceso a enlace virtual

```
Usuario en /agenda
    │
    ▼
Sesión virtual/híbrida con cupos disponibles
    │
    ├── Estado inicial: botón "Pre-inscribirse"
    │                  botón "Unirse" 🔒 desactivado
    │
    ▼
Clic en "Pre-inscribirse"
    │
    ▼
Sesión en /mis-conferencias
Botón "Unirse a la sesión":
    ├── Si enlace NO verificado → desactivado ⚠
    └── Si enlace verificado   → activo ✅ → abre link en nueva pestaña
```

---

## Flujo 4: Cancelar inscripción

```
Usuario en /mis-conferencias
    │
    ▼
SessionCard modo "mis-conferencias"
    │
    ├── [Validar asistencia] → (mock, sin funcionalidad backend)
    │
    └── [Cancelar inscripción]
            │
            ▼
        La sesión se elimina de registeredIds
        El cupo queda disponible nuevamente en /agenda
        El botón "Unirse" en /agenda vuelve a bloquearse
```

---

## Flujo 5: Registro de nuevo usuario

```
/login → clic en "Regístrate acá"
    │
    ▼
/register — formulario de registro
    │
    ├── Campos: Nombre, Apellido, Correo, Institución, Tipo, Contraseña x2
    │
    ├── Validación:
    │   ├── Contraseñas coinciden
    │   └── Mínimo 6 caracteres
    │
    ├── Error → muestra mensaje en rojo
    │
    └── Éxito → alert() (mock) → redirige a /login
```
