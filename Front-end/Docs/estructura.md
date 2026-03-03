# Estructura del Proyecto

```
CONIITI/
├── .gitignore                   # Aplica a todo el proyecto (Front-end y Back-end)
│
├── Front-end/
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   │
│   ├── Docs/                    # Documentación del proyecto
│   │   ├── README.md
│   │   ├── autenticacion.md
│   │   ├── componentes.md
│   │   ├── estilos.md
│   │   ├── estructura.md        ← este archivo
│   │   ├── flujos.md
│   │   ├── paginas.md
│   │   └── servicios.md
│   │
│   └── src/
│       ├── App.jsx              # Enrutamiento principal + layout global
│       ├── main.jsx             # Punto de entrada React
│       │
│       ├── assets/
│       │   └── coniiti_logo.png
│       │
│       ├── components/
│       │   ├── AgendaGrid.jsx
│       │   ├── Footer.jsx
│       │   ├── Header.jsx
│       │   ├── LiveFilter.jsx
│       │   ├── Navbar.jsx
│       │   ├── ProtectedRoute.jsx
│       │   ├── SessionCard.jsx
│       │   ├── SessionFormModal.jsx
│       │   ├── SpeakerModal.jsx
│       │   ├── StatusBadge.jsx
│       │   └── VirtualGatekeeper.jsx
│       │
│       ├── context/
│       │   └── AuthContext.jsx
│       │
│       ├── hooks/
│       │   ├── useAgenda.js
│       │   └── usePolling.js
│       │
│       ├── pages/
│       │   ├── About.jsx
│       │   ├── Agenda.jsx
│       │   ├── Contact.jsx
│       │   ├── Home.jsx
│       │   ├── Login.jsx
│       │   ├── Memories.jsx
│       │   ├── MyConferences.jsx
│       │   ├── Paginas.jsx
│       │   ├── Register.jsx
│       │   └── StaffDashboard.jsx
│       │
│       ├── services/
│       │   ├── agendaService.js
│       │   └── mockData.js
│       │
│       ├── styles/
│       │   ├── App.module.css
│       │   ├── animations.css
│       │   ├── components/
│       │   │   ├── Footer.module.css
│       │   │   ├── Header.module.css
│       │   │   ├── LiveFilter.module.css
│       │   │   ├── Navbar.module.css
│       │   │   ├── SessionCard.module.css
│       │   │   ├── SessionFormModal.module.css
│       │   │   ├── SpeakerModal.module.css
│       │   │   ├── StatusBadge.module.css
│       │   │   └── VirtualGatekeeper.module.css
│       │   └── pages/
│       │       ├── Login.module.css
│       │       ├── Register.module.css
│       │       └── StaffDashboard.module.css
│       │
│       ├── types/
│       │   └── session.js
│       │
│       └── utils/
│           └── particlesConfig.js
│
└── Back-end/
    ├── app/                     # Módulos de la API FastAPI
    └── test_db.py               # Script de prueba de conexión a BD
```
