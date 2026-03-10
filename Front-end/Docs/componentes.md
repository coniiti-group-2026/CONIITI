# Componentes

## `<Navbar />`
**Archivo:** `src/components/Navbar.jsx`

Barra de navegación sticky con logo, menú de links, buscador y controles de autenticación.

**Comportamiento condicional según autenticación:**
- Si `user.isLoggedIn === false` → muestra botón **"Iniciar Sesión"**
- Si `user.isLoggedIn === true`:
  - Muestra nombre del usuario (`user.data.name`)
  - Si `user.role === 'staff'` → muestra enlace **"Panel Staff"**
  - Muestra botón **"Cerrar Sesión"**

---

## `<SessionCard />`
**Archivo:** `src/components/SessionCard.jsx`

Tarjeta de sesión con toda la información de una conferencia.

**Props:**
```js
{
  session: Session,         // objeto de sesión
  index: number,            // para animación escalonada
  onSpeakerClick: Function, // abre el modal del ponente
  isRegistered: boolean,    // si el usuario está pre-inscrito
  onToggleRegister: Function,
  mode: 'agenda' | 'mis-conferencias'
}
```

**Secciones:**
- **Barra de acento** superior (degradado azul→dorado)
- **Track badge** + **Tipo de evento badge** (coloreados)
- **Título** y **descripción** de la sesión
- **Barra de cupos** con porcentaje visual de ocupación
  - 🟢 Verde: < 80% ocupado
  - 🟡 Naranja: ≥ 80% ocupado
  - 🔴 Rojo: 100% (agotado)
- **Grid de meta-datos**: Horario, Salón, Ponente, Modalidad
- **Pie**: `<VirtualGatekeeper />` + timestamps
- **Botón de acción**:
  - Modo `agenda`: Pre-inscribirse / Pre-inscrito / Sin cupos
  - Modo `mis-conferencias`: Validar asistencia + Cancelar inscripción

---

## `<VirtualGatekeeper />`
**Archivo:** `src/components/VirtualGatekeeper.jsx`

Controla el acceso al enlace virtual de una sesión.

**Props:** `{ modalidad, linkVirtual, linkVerificado, isRegistered }`

| Caso | Lo que muestra |
|---|---|
| Presencial | "Sesión presencial únicamente" |
| Virtual/Híbrido + no pre-inscrito | Botón desactivado 🔒 + "Pre-inscríbete para acceder" |
| Pre-inscrito + enlace NO verificado | Botón desactivado ⚠ + "Enlace en validación" |
| Pre-inscrito + enlace verificado | Botón activo ✅ "Unirse a la sesión" |

---

## `<SessionFormModal />`
**Archivo:** `src/components/SessionFormModal.jsx`

Modal de formulario para crear o editar una sesión (usado en el Panel de Staff).

**Campos:**
- Título, Ponente, Afiliación
- Día (date), Hora inicio, Hora fin
- Salón, Salón anterior
- Track (enum), Tipo de evento (enum)
- Modalidad (enum), Estado logístico (enum)
- Enlace Virtual, Enlace verificado (checkbox)
- Descripción

---

## `<ProtectedRoute />`
**Archivo:** `src/components/ProtectedRoute.jsx`

Guard que verifica autenticación y rol antes de renderizar una ruta.

```jsx
<ProtectedRoute role="staff">
  <StaffDashboard />
</ProtectedRoute>
```

Si el usuario no cumple → redirige a `/login`.

---

## `<LiveFilter />`
**Archivo:** `src/components/LiveFilter.jsx`

Barra de filtros para la agenda. Permite filtrar por:
- **Día** (tabs: Oct 1, Oct 2, Oct 3, Todos)
- **Modalidad** (Presencial / Virtual / Híbrido)
- **Tipo de Evento** (Conferencia / Taller / Simposio)
- **Búsqueda** por texto libre

---

## `<StatusBadge />`
**Archivo:** `src/components/StatusBadge.jsx`

Badge de estado logístico de la sesión.

| Estado | Color | Información adicional |
|---|---|---|
| `NORMAL` | Verde | — |
| `CAMBIO_SALON` | Rojo | Muestra salón anterior |
| `RETRASADO` | Naranja | Muestra timestamp |

---

## `<AgendaGrid />`
**Archivo:** `src/components/AgendaGrid.jsx`

Grid responsivo que renderiza la lista de `<SessionCard />` con soporte para estado de carga (`isLoading`).

---

## `<SpeakerModal />`
**Archivo:** `src/components/SpeakerModal.jsx`

Modal que muestra el perfil del ponente: foto, nombre, rol, afiliación y bio.

---

## `<Header />`
**Archivo:** `src/components/Header.jsx`

Hero visual de la página de inicio con título animado, fecha del congreso y CTA de registro.

---

## `<Footer />`
**Archivo:** `src/components/Footer.jsx`

Pie de página con nombre del congreso, ubicación, fecha y copyright.  
Tiene `position: relative; z-index: 10` para aparecer sobre el canvas de partículas del Login/Registro.

---

## `<CMSPanel />`
**Archivo:** `src/components/CMSPanel.jsx`

Panel inteligente multi-propósito usado para gestionar el contenido de las distintas secciones públicas. Renderiza pestañas y formularios dinámicos para operaciones CRUD en el backend (`/cms/`).

**Secciones Integradas:**
- `autores`, `comite`, `conferencistas` → Gestionan un grid de perfiles profesionales.
- `memorias` → Gestiona la subida y visualización de documentos y proceedings históricos.
- `galerias` → Gestiona la visualización de imágenes multimedia.

**Características:**
- Selector lógico interactivo.
- Cortado automático de descripciones ("Ver Más").
- Formularios superpuestos emergentes.

---

## `<PersonCard />`
**Archivo:** `src/components/PersonCard.jsx`

Componente re-utilizable de visualización diseñado para las páginas del CMS. Se usa en páginas como `/autores`, `/comite`, y `/conferencistas`.

Muestra la foto de perfil del individuo en cabecera junto a información general. Las descripciones largas están truncadas en CSS con `-webkit-line-clamp` para consistencia en la rejilla.
