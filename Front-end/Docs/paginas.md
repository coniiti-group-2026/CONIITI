# Páginas del Proyecto

## `/` — Home
**Archivo:** `src/pages/Home.jsx`  
Página de inicio del congreso. Muestra el componente `<Header />` con el hero visual y botones de llamada a acción.

---

## `/agenda` — Agenda Principal
**Archivo:** `src/pages/Agenda.jsx`

Página central de la aplicación. Incluye:
- `<LiveFilter />` — filtros por día, modalidad, track y búsqueda
- `<AgendaGrid />` — grid de tarjetas `<SessionCard />`
- `<SpeakerModal />` — modal del ponente al hacer clic en su nombre
- Polling automático cada 60 segundos (`usePolling`)
- Pre-inscripción a sesiones (estado en `App.jsx` como `registeredIds`)

**Props recibidas:**
```js
{ registeredIds: Set, onToggleRegister: Function }
```

---

## `/mis-conferencias` — Mis Conferencias
**Archivo:** `src/pages/MyConferences.jsx`

Muestra solo las sesiones pre-inscritas por el usuario (`registeredIds`). Usa `<SessionCard mode="mis-conferencias" />` que activa el botón de **Validar asistencia** y **Cancelar inscripción**.

---

## `/login` — Inicio de Sesión
**Archivo:** `src/pages/Login.jsx`

Formulario de login con fondo animado de partículas (tsParticles). Lógica:
- Email `admin@coniiti.edu.co` → rol `staff` → redirige a `/staff`
- Cualquier otro email → rol `normal` → redirige a `/`

---

## `/register` — Registro
**Archivo:** `src/pages/Register.jsx`

Formulario de registro de nuevo usuario con fondo de partículas idéntico al login.  
Campos: Nombre, Apellido, Correo, Institución, Tipo de Participante, Contraseña, Confirmar Contraseña.  
Tipos de participante: `Staff`, `Comunidad Interna`, `Externo`.  
Validación: contraseñas coincidentes, mínimo 6 caracteres.  
Al completar → redirige a `/login`.

---

## `/staff` — Panel de Staff *(Ruta protegida)*
**Archivo:** `src/pages/StaffDashboard.jsx`  
**Requiere:** rol `staff`

CRUD completo de sesiones. Columnas de la tabla:

| Columna | Descripción |
|---|---|
| Título | Nombre de la sesión |
| Ponente | Nombre del expositor |
| Día | Fecha formateada (ej: `1 Oct 2026`) |
| Hora | Rango `HH:MM – HH:MM` |
| Salón | Lugar asignado |
| Modalidad | Badge (Presencial / Virtual / Híbrido) |
| Estado | Badge (Normal / Cambio de Salón / Retrasado) |
| Enlace Virtual | Toggle verificado/no verificado + link |
| Acciones | Botones Editar y Eliminar |

**Operaciones:**
- **Nueva Conferencia** — abre `<SessionFormModal />` en modo creación
- **Editar** — abre el modal pre-cargado con datos de la sesión
- **Eliminar** — confirmación y eliminación del estado local
- **Toggle verificado** — marca/desmarca el enlace como verificado (afecta al botón "Unirse" en la agenda)

---

## Páginas pendientes de contenido real

| Ruta | Archivo | Estado |
|---|---|---|
| `/acerca-de` | `About.jsx` | Placeholder |
| `/memorias` | `Memories.jsx` | Placeholder |
| `/contacto` | `Contact.jsx` | Placeholder |
| `/paginas` | `Paginas.jsx` | Placeholder |
