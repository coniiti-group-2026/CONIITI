# CONIITI 2026 v1 — Documentación del Proyecto Front-end

> Módulo de Agenda Reactiva para el XI Congreso Internacional de Innovación y Tendencias en Ingeniería  
> Universidad Católica de Colombia · Bogotá, Colombia · Octubre 1–3, 2026

---

## Tabla de Contenidos

1. [Resumen del Proyecto](#resumen-del-proyecto)
2. [Tecnologías Utilizadas](#tecnologías-utilizadas)
3. [Estructura del Proyecto](./estructura.md)
4. [Páginas](./paginas.md)
5. [Componentes](./componentes.md)
6. [Servicios y Datos](./servicios.md)
7. [Autenticación y Rutas Protegidas](./autenticacion.md)
8. [Guía de Estilos](./estilos.md)
9. [Flujos de Usuario](./flujos.md)

---

## Resumen del Proyecto

CONIITI Front-end es una **Single Page Application (SPA)** construida con React que gestiona la agenda del congreso. Permite a los asistentes consultar sesiones en tiempo real, pre-inscribirse a conferencias y al staff administrar el contenido del programa.

### Funcionalidades Implementadas

| Funcionalidad | Estado |
|---|---|
| Agenda con filtros en tiempo real | ✅ Completo |
| Pre-inscripción a sesiones | ✅ Completo |
| Sección "Mis Conferencias" | ✅ Completo |
| Login con autenticación por rol | ✅ Completo (mock) |
| Registro de nuevos usuarios | ✅ Completo (mock) |
| Panel de Staff (CRUD completo) | ✅ Completo |
| Verificación de enlaces virtuales por staff | ✅ Completo |
| Sistema de cupos con barra de progreso | ✅ Completo |
| Rutas protegidas por rol | ✅ Completo |
| Polling automático cada 60 segundos | ✅ Completo |
| Animación de partículas en Login/Registro | ✅ Completo |
| Backend / API real | ⏳ Pendiente |

---

## Tecnologías Utilizadas

| Tecnología | Versión | Uso |
|---|---|---|
| React | 18+ | Framework principal |
| Vite | 5+ | Bundler y dev server |
| React Router DOM | 6 | Navegación y rutas |
| @tsparticles/react | 3 | Animación de partículas |
| @tsparticles/slim | 3 | Motor de partículas |
| react-icons | latest | Íconos (Feather Icons) |
| CSS Modules | — | Estilos encapsulados por componente |

---

## Credenciales de Prueba (Mock)

| Email | Contraseña | Rol | Redirige a |
|---|---|---|---|
| `admin@coniiti.edu.co` | cualquiera | Staff | `/staff` |
| cualquier otro email | cualquiera | Normal | `/` |
