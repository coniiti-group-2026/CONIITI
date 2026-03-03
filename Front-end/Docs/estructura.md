# Estructura del Proyecto

```
CONIITI/Front-end/
├── public/
├── src/
│   ├── App.jsx                  # Enrutamiento principal + layout global
│   ├── main.jsx                 # Punto de entrada React
│   │
│   ├── assets/
│   │   └── coniiti_logo.png     # Logo del congreso
│   │
│   ├── components/              # Componentes reutilizables
│   │   ├── AgendaGrid.jsx       # Grid de tarjetas de sesión
│   │   ├── Footer.jsx           # Pie de página global
│   │   ├── Header.jsx           # Hero / banner principal
│   │   ├── LiveFilter.jsx       # Filtros en tiempo real (día, modalidad, track, búsqueda)
│   │   ├── Navbar.jsx           # Barra de navegación
│   │   ├── ProtectedRoute.jsx   # Guard de rutas por rol
│   │   ├── SessionCard.jsx      # Tarjeta de sesión individual
│   │   ├── SessionFormModal.jsx # Modal CRUD de sesiones (Staff)
│   │   ├── SpeakerModal.jsx     # Modal de perfil del ponente
│   │   ├── StatusBadge.jsx      # Badge de estado logístico
│   │   └── VirtualGatekeeper.jsx# Control de acceso al enlace virtual
│   │
│   ├── context/
│   │   └── AuthContext.jsx      # Estado global de autenticación
│   │
│   ├── hooks/
│   │   ├── useAgenda.js         # Hook: filtros + sesiones
│   │   └── usePolling.js        # Hook: polling automático
│   │
│   ├── pages/                   # Vistas / páginas
│   │   ├── About.jsx
│   │   ├── Agenda.jsx           # Página de agenda principal
│   │   ├── Contact.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx            # Login con partículas
│   │   ├── Memories.jsx
│   │   ├── MyConferences.jsx    # Mis pre-inscripciones
│   │   ├── Paginas.jsx
│   │   ├── Register.jsx         # Registro con partículas
│   │   └── StaffDashboard.jsx   # Panel de administración
│   │
│   ├── services/
│   │   ├── agendaService.js     # Funciones de acceso a datos de sesiones
│   │   └── mockData.js          # Datos simulados de sesiones y ponentes
│   │
│   ├── styles/
│   │   ├── App.module.css
│   │   ├── animations.css
│   │   ├── components/          # CSS Modules de componentes
│   │   │   ├── Footer.module.css
│   │   │   ├── Header.module.css
│   │   │   ├── LiveFilter.module.css
│   │   │   ├── Navbar.module.css
│   │   │   ├── SessionCard.module.css
│   │   │   ├── SessionFormModal.module.css
│   │   │   ├── SpeakerModal.module.css
│   │   │   ├── StatusBadge.module.css
│   │   │   └── VirtualGatekeeper.module.css
│   │   └── pages/               # CSS Modules de páginas
│   │       ├── Login.module.css
│   │       ├── Register.module.css
│   │       └── StaffDashboard.module.css
│   │
│   ├── types/
│   │   └── session.js           # Enums y tipos del modelo de sesión
│   │
│   └── utils/
│       └── particlesConfig.js   # Configuración de tsParticles
│
├── index.html
├── package.json
├── vite.config.js
└── Docs/                        # ← Esta carpeta
```
