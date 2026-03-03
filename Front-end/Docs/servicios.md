# Servicios, Datos y Hooks

## Servicios

### `agendaService.js`
**Archivo:** `src/services/agendaService.js`

Capa de abstracción de acceso a datos. Por ahora usa datos mock; en el futuro conectará con la API FastAPI.

```js
// Funciones disponibles:
getAllSessions()         // todas las sesiones
getSessions(filters)    // sesiones filtradas (día, modalidad, track, búsqueda)
getSpeakerById(id)      // datos de un ponente por ID
filterSessions(sessions, filters) // filtrado del lado del cliente
```

### `mockData.js`
**Archivo:** `src/services/mockData.js`

Datos simulados del congreso. Contiene:
- **`MOCK_SESSIONS`** — 12 sesiones (4 por día) con todos los campos del modelo
- **`CONFERENCE_DAYS`** — días disponibles para el filtro
- **`MOCK_SPEAKERS`** — ponentes con foto, bio, afiliación

**Campos de cada sesión (`Session`):**

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | string | Identificador único (ej: `s1-001`) |
| `titulo` | string | Nombre de la sesión |
| `ponente` | string | Nombre del expositor |
| `speaker_id` | string | ID del ponente en `MOCK_SPEAKERS` |
| `event_type` | enum | Conferencia / Taller / Simposio / Panel |
| `afiliacion` | string | Institución del ponente |
| `track` | enum | Temática (IA, Ciberseguridad, IoT, etc.) |
| `dia` | string | Fecha ISO `YYYY-MM-DD` |
| `hora_inicio` | string | `HH:MM` |
| `hora_fin` | string | `HH:MM` |
| `salon` | string | Salón actual |
| `salon_anterior` | string\|null | Salón previo (si hubo cambio) |
| `modalidad` | enum | Presencial / Virtual / Híbrido |
| `status_logistico` | enum | Normal / Cambio de Salón / Retrasado |
| `link_virtual` | string\|null | URL del enlace virtual |
| `link_verificado` | boolean | Si el staff verificó el enlace |
| `timestamp_actualizacion` | string | ISO timestamp de última actualización |
| `descripcion` | string | Descripción de la sesión |
| `cupos_totales` | number | Capacidad máxima del evento |
| `inscritos` | number | Número de inscritos actuales |

---

## Tipos / Enums

**Archivo:** `src/types/session.js`

```js
SESSION_STATUS = {
  NORMAL: 'Normal',
  CAMBIO_SALON: 'Cambio de Salón',
  RETRASADO: 'Retrasado'
}

SESSION_MODALITY = {
  PRESENCIAL: 'Presencial',
  VIRTUAL: 'Virtual',
  HIBRIDO: 'Híbrido'
}

SESSION_TRACK = {
  IA: 'Inteligencia Artificial',
  CIBERSEGURIDAD: 'Ciberseguridad',
  IOT: 'Internet de las Cosas',
  DESARROLLO: 'Desarrollo de Software',
  DATOS: 'Ciencia de Datos',
  INNOVACION: 'Innovación y Tendencias'
}

SESSION_EVENT_TYPE = {
  CONFERENCE: 'Conferencia',
  WORKSHOP: 'Taller',
  SYMPOSIUM: 'Simposio',
  PANEL: 'Panel'
}
```

---

## Hooks

### `useAgenda`
**Archivo:** `src/hooks/useAgenda.js`

Hook personalizado que gestiona el estado de los filtros y las sesiones filtradas.

```js
const {
  searchQuery, setSearchQuery,
  activeDay, setActiveDay,
  activeModality, setActiveModality,
  activeEventType, setActiveEventType,
  sessions,   // sesiones filtradas
  days,       // array de días disponibles
  isLoading,
  refresh     // función para recargar datos
} = useAgenda();
```

### `usePolling`
**Archivo:** `src/hooks/usePolling.js`

Hook que ejecuta una función (`callback`) cada `interval` milisegundos.

```js
usePolling(refresh, 60_000); // llama refresh() cada 60 segundos
```

---

## Contexto de Autenticación

### `AuthContext`
**Archivo:** `src/context/AuthContext.jsx`

Provee el estado de autenticación a toda la app.

```js
// Estructura del estado "user":
{
  isLoggedIn: boolean,
  role: 'staff' | 'normal' | null,
  data: { name: string } | null
}

// Funciones disponibles:
login(roleType)  // inicia sesión con un rol
logout()         // cierra sesión (limpia el estado)
```

**Uso en componentes:**
```jsx
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const { user, login, logout } = useContext(AuthContext);
```
