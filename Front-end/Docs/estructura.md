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
│       ├── App.jsx              # Enrutamiento principal + Carga perezosa (React.lazy)
│       ├── main.jsx             # Punto de entrada React
│       │
│       ├── assets/
│       │   └── coniiti_logo.png
│       │
│       ├── components/
│       │   ├── AgendaGrid.jsx
│       │   ├── CMSPanel.jsx         # Gestor de tarjetas y campos dinámicos
│       │   ├── Footer.jsx
│       │   ├── Header.jsx
│       │   ├── LiveFilter.jsx
│       │   ├── Navbar.jsx
│       │   ├── PersonCard.jsx       # Componente presentacional para autores, comité y ponentes
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
│       │   ├── Autores.jsx          # Renderiza PersonCards desde /cms/autores
│       │   ├── Comite.jsx           # Renderiza PersonCards desde /cms/comite
│       │   ├── Conferencistas.jsx   # Renderiza PersonCards con descripciones dinámicas
│       │   ├── Contact.jsx
│       │   ├── Galerias.jsx         # Cuadrícula fotográfica CMS
│       │   ├── Home.jsx
│       │   ├── Login.jsx
│       │   ├── Memorias.jsx         # Archivo cronológico CMS con badge de año
│       │   ├── MyConferences.jsx
│       │   ├── Paginas.jsx
│       │   ├── Register.jsx
│       │   └── StaffDashboard.jsx   # Contiene la pestaña del CMSPanel
│       │
│       ├── services/
│       │   ├── agendaService.js
│       │   └── mockData.js
│       │
│       ├── styles/
│       │   ├── App.module.css
│       │   ├── animations.css
│       │   ├── components/
│       │   │   ├── CMSPanel.module.css
│       │   │   ├── Footer.module.css
│       │   │   ├── Header.module.css
│       │   │   ├── LiveFilter.module.css
│       │   │   ├── Navbar.module.css
│       │   │   ├── PersonCard.module.css
│       │   │   ├── SessionCard.module.css
│       │   │   ├── SessionFormModal.module.css
│       │   │   ├── SpeakerModal.module.css
│       │   │   ├── StatusBadge.module.css
│       │   │   └── VirtualGatekeeper.module.css
│       │   └── pages/
│       │       ├── DynamicPage.module.css
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
    ├── alembic.ini              # Archivo de configuración de migraciones
    ├── requirements.txt         # Dependencias Python
    ├── seed.py                  # Poblador original de BDD (deprecated)
    ├── seed_sessions.py         # Poblador principal de administradores y sesiones de prueba
    │
    ├── migrations/              # Historial de versiones y revisiones Alembic
    │
    └── app/                     # Módulos principales de la API FastAPI
        ├── main.py              # Punto de entrada de FastAPI + Middlewares / CORS
        │
        ├── core/
        │   ├── config.py        # Validadores Pydantic a variables .env
        │   ├── email.py         # Cliente SMTP aiosmtplib
        │   └── security.py      # Funciones Bcrypt, JWT y OAuth2
        │
        ├── db/
        │   ├── database.py      # Motor Async de SQLAlchemy (SQLModel/psycopg)
        │   └── models.py        # (Legacy) Modelos base
        │
        ├── models/              # Tablas de Base de Datos
        │   ├── cms.py           # PersonModels, DocumentModels
        │   ├── otp.py           # OTPModel
        │   ├── session.py       # SessionModel
        │   └── user.py          # UserModel
        │
        ├── schemas/             # Validadores de carga (Pydantic BaseModels)
        │   ├── auth.py          # Tokens, Passwords
        │   ├── cms.py           # PersonCreate, DocumentCreate
        │   ├── session.py       # SessionCreate, SessionUpdate
        │   └── user.py          # UserCreate, UserResponse
        │
        ├── routers/             # Controladores (Endpoints HTTP)
        │   ├── auth.py          # /auth/* (login, forgot-password, OTP)
        │   ├── cms.py           # /cms/* (crear miembros, documentos, etc.)
        │   ├── oauth.py         # (Experimental) /oauth/google
        │   ├── sessions.py      # /sessions/* (CRUD de agenda)
        │   └── users.py         # /users/* (consulta de rol/perfil)
        │
        ├── services/            # Lógica de negocio desconectada del Router
        │   └── cms_service.py   # Helpers del CMS
        │
        └── dependencies/
            └── auth.py          # get_current_user y verificador de permisos
```
