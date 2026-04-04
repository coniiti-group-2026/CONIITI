# 🚀 CONIITI 2026 - API Gateway

Este proyecto implementa un **API Gateway** utilizando Traefik para centralizar el acceso a los microservicios del sistema CONIITI 2026.

---

## 🧠 Descripción

El sistema está basado en una arquitectura de microservicios donde **Traefik actúa como puerta de entrada única**.

Esto permite que:

- El Front-end consuma una sola URL base
- No se expongan puertos internos innecesarios
- Los servicios se comuniquen de forma segura dentro de Docker

---

## 🏗️ Arquitectura

- **Traefik** → API Gateway (enrutamiento)
- **Backend (FastAPI)** → Lógica de negocio
- **Docker Compose** → Orquestación
- **Red interna Docker** → `coniiti-net`

📌 Todos los servicios se comunican usando nombres de contenedor, no IPs.

---

## 🌐 Acceso al sistema

### 🔗 API Gateway
http://localhost/api


### 📄 Documentación (Swagger)
http://localhost/api/docs


### 🌍 En Codespaces
https://crispy-funicular-r47grr5x944j2gpx-80.app.github.dev/api
https://crispy-funicular-r47grr5x944j2gpx-80.app.github.dev/api/docs


---

## 🧩 Servicios disponibles

| Servicio | Ruta |
|--------|------|
| Auth | `/api/auth` |
| Users | `/api/users` |
| Agenda (Sessions) | `/api/agenda` |
| CMS / Files | `/api/files` |

📌 Todas las rutas pasan obligatoriamente por el Gateway.

---

## 🔀 Enrutamiento (Traefik)

Traefik utiliza labels en Docker para enrutar las peticiones:

- `/api` → Backend
- Middleware elimina `/api` antes de llegar al servicio

Ejemplo:
traefik.http.routers.api.rule=PathPrefix(/api)


---

## 🐳 Ejecución del proyecto

1. Clonar repositorio:
git clone <repo-url>
cd CONIITI

2. Ejecutar contenedores:
docker-compose up -d --build

3. Acceder:
http://localhost/api/docs


---

## 🔐 Puertos expuestos

| Puerto | Uso |
|------|-----|
| 80 | Tráfico público (Gateway) |
| 8080 | Dashboard de Traefik |

❌ El backend NO expone puertos directamente  
✔ Todo pasa por el Gateway

---

## 🧪 Pruebas realizadas

Se validaron los endpoints usando:

- Swagger (`/api/docs`)
- Navegador

Resultados:

- ✅ `200 OK` → Respuesta correcta
- ✅ `401 Unauthorized` → Validación de autenticación

Esto confirma que el API Gateway enruta correctamente las solicitudes.

---

## 📦 Variables de entorno

Configuración mínima del backend:

DATABASE_URL=sqlite:///./test.db
SECRET_KEY=supersecreto123


---

## ☁️ Despliegue (Base)

El sistema está preparado para desplegarse en:

- AWS EC2
- Docker Compose
- IP pública o dominio

---

## 📌 Buenas prácticas implementadas

- Uso de API Gateway (Traefik)
- No exposición directa de servicios internos
- Red Docker aislada (`coniiti-net`)
- Enrutamiento por PathPrefix
- Variables de entorno centralizadas
- Separación de responsabilidades (microservicios)

---

## 👨‍💻 Autor

**Duvan Vaca**  
Responsable de API Gateway, enrutamiento y despliegue base

---

## 🏁 Conclusión

Se implementó correctamente un API Gateway que centraliza el acceso al sistema, garantizando:

- Escalabilidad
- Seguridad
- Mantenibilidad
- Integración con el Front-end

---