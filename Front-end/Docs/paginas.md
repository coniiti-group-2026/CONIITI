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

## `/superusuario` — Panel de Control Superior *(Ruta protegida)*
**Archivo:** `src/pages/SuperuserDashboard.jsx`  
**Requiere:** rol `superuser`

Vista jerárquicamente superior al `/staff`. Permite al superadministrador visualizar en tiempo real a los usuarios pre-inscritos a las sesiones y enviar herramientas masivas. Consume `/sessions/{id}/users`.

---

## Páginas Dinámicas (Módulo CMS)
Las siguientes páginas exhiben el contenido ingresado desde la pestaña "Gestor de Contenido" en el `StaffDashboard` de forma pública. Apelan al módulo Pydantic `PersonModels` y `DocumentModels`.

- `/autores` (`Autores.jsx`): Renderiza filas de `<PersonCard>` orientadas a investigadores. Configurado mediante categoría `autores`.
- `/comite` (`Comite.jsx`): Muestra equipos y liderazgos de la universidad usando `<PersonCard>`.
- `/conferencistas` (`Conferencistas.jsx`): Reversión pública con biografía extendida de los speakers usando `<PersonCard>`. Consume categoría `conferencistas`.
- `/memorias` (`Memorias.jsx`): Módulo cronológico para descargar papers `/ proceedings`. Ordena inteligentemente la salida basada en el campo de "año". Posee modal interno "Ver más".
- `/galerias` (`Galerias.jsx`): Parrilla fotográfica proveniente del CMS.

---

## Páginas Misceláneas Estáticas
- `/acerca-de` (`About.jsx`)
- `/contacto` (`Contact.jsx`)
- `/paginas` (`Paginas.jsx`)
- `/verificar-otp` (`OTPVerification.jsx`): Vista forzada para inyección de token en cuentas que requieren confirmación de correo.
- `/recuperar-contrasena` (`ForgotPassword.jsx`): Flujo de token secreto por correo al extraviar cuenta.
