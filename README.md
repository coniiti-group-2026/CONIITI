# CONIITI

Guia rapida para instalar las herramientas necesarias y arrancar el proyecto en otro PC usando Docker, Docker Compose y Minikube con Docker como driver.

## Que necesitas instalar

Recomendado para Windows:

- Windows 10/11 de 64 bits con virtualizacion habilitada en BIOS/UEFI.
- Docker Desktop con backend WSL 2.
- Git.
- Minikube.
- kubectl.

Recursos recomendados:

- Minimo: 8 GB de RAM libres para Docker/Minikube.
- Recomendado: 16 GB de RAM en el equipo, porque el proyecto levanta varios microservicios, bases de datos, RabbitMQ, MongoDB y Traefik.

## Instalacion en Windows

Abre PowerShell como administrador y ejecuta:

```powershell
winget install -e --id Docker.DockerDesktop
winget install -e --id Git.Git
winget install -e --id Kubernetes.minikube
winget install -e --id Kubernetes.kubectl
```

Despues:

1. Reinicia el PC si Docker Desktop o WSL lo piden.
2. Abre Docker Desktop.
3. Verifica en Docker Desktop que este usando Linux containers y WSL 2.
4. En una nueva terminal de PowerShell valida:

```powershell
docker --version
docker compose version
minikube version
kubectl version --client
git --version
```

Documentacion oficial:

- Docker Desktop para Windows: https://docs.docker.com/desktop/setup/install/windows-install/
- Docker Desktop con WSL 2: https://docs.docker.com/docker-for-windows/wsl/
- Minikube: https://minikube.sigs.k8s.io/docs/start/
- kubectl en Windows: https://kubernetes.io/docs/tasks/tools/install-kubectl-windows/

## Clonar el proyecto

```powershell
git clone <URL_DEL_REPOSITORIO>
cd CONIITI
```

Si ya tienes el proyecto copiado en el PC, solo entra a la carpeta raiz donde esta `docker-compose.yml`.

## Opcion 1: arrancar rapido con Docker Compose

Esta es la forma mas simple para desarrollo local.

```powershell
docker compose up --build
```

Cuando termine de construir y levantar contenedores, abre:

```text
http://localhost
```

Servicios principales:

- Frontend: `http://localhost`
- API Gateway Traefik: `http://localhost/api/...`
- Auth: `http://localhost/api/auth`
- Users: `http://localhost/api/users`
- Agenda: `http://localhost/api/agenda`
- Files: `http://localhost/api/files`
- Payments: `http://localhost/api/payments`
- Analytics: `http://localhost/api/analytics`

Comandos utiles:

```powershell
docker compose ps
docker compose logs -f
docker compose down
```

Para borrar tambien volumenes de bases de datos y archivos locales:

```powershell
docker compose down -v
```

## Opcion 2: arrancar con Minikube usando Docker como driver

Usa esta opcion cuando quieras probar el despliegue Kubernetes local.

### 1. Iniciar Minikube

Asegurate de que Docker Desktop este abierto y ejecuta:

```powershell
minikube start --driver=docker --cpus=4 --memory=8192 --disk-size=20g
```

Verifica el cluster:

```powershell
kubectl get nodes
kubectl get pods
```

### 2. Conectar Docker al entorno de Minikube

Este paso es importante. Los manifiestos Kubernetes usan imagenes locales como `auth-service:latest`, `users-service:latest` y `frontend-app:latest`. Por eso hay que construirlas dentro del Docker daemon de Minikube.

En PowerShell:

```powershell
minikube -p minikube docker-env --shell powershell | Invoke-Expression
```

Confirma que Docker esta apuntando a Minikube:

```powershell
docker info
```

En la salida deberias ver que Docker esta usando el entorno de Minikube.

### 3. Construir las imagenes del proyecto

Desde la raiz del proyecto:

```powershell
docker build -t auth-service:latest ./microservices/auth-service
docker build -t users-service:latest ./microservices/users-service
docker build -t agenda-service:latest ./microservices/agenda-service
docker build -t notifications-service:latest ./microservices/notifications-service
docker build -t payments-service:latest ./microservices/payments-service
docker build -t analytics-service:latest ./microservices/analytics-service
docker build -t files-service:latest ./microservices/files-service
docker build -t frontend-app:latest ./Front-end
```

Verifica:

```powershell
docker images
```

### 4. Instalar CRDs de Traefik

El ingreso del proyecto usa recursos de Traefik como `IngressRoute` y `Middleware`, por eso el cluster necesita las CRDs antes de aplicar `Kubernetes/ingress/traefik-ingress.yaml`.

```powershell
kubectl apply -f https://raw.githubusercontent.com/traefik/traefik/v2.7/docs/content/reference/dynamic-configuration/kubernetes-crd-definition-v1.yml
```

Nota: los manifiestos actuales usan `apiVersion: traefik.containo.us/v1alpha1`. Si actualizas Traefik a versiones mas nuevas, puede que debas migrar esos `apiVersion` a `traefik.io/v1alpha1`.

### 5. Aplicar los manifiestos Kubernetes

Aplica primero infraestructura y bases de datos:

```powershell
kubectl apply -f Kubernetes/base-datos/
kubectl apply -f Kubernetes/mensajeria/
```

Espera a que bases de datos y RabbitMQ esten listos:

```powershell
kubectl get pods -w
```

Cuando esten en `Running`, aplica microservicios e ingress:

```powershell
kubectl apply -f Kubernetes/microservicios/
kubectl apply -f Kubernetes/ingress/
```

Verifica todo:

```powershell
kubectl get pods
kubectl get svc
kubectl get ingressroute
```

### 6. Abrir la aplicacion

El servicio de Traefik esta expuesto como NodePort `30080`.

Opcion recomendada:

```powershell
minikube service traefik-service --url
```

Abre la URL que entregue el comando. Normalmente sera algo parecido a:

```text
http://127.0.0.1:<PUERTO>
```

Tambien puedes consultar la IP de Minikube:

```powershell
minikube ip
```

Y entrar por:

```text
http://<MINIKUBE_IP>:30080
```

Rutas principales:

- Frontend: `/`
- Auth API: `/api/auth`
- Users API: `/api/users`
- Agenda API: `/api/agenda`
- Notifications API: `/api/notifications`
- Payments API: `/api/payments`
- Analytics API: `/api/analytics`
- Files API: `/api/files`

## Comandos utiles de Kubernetes

Ver pods:

```powershell
kubectl get pods
```

Ver servicios:

```powershell
kubectl get svc
```

Ver logs de un servicio:

```powershell
kubectl logs deployment/auth-service
kubectl logs deployment/users-service
kubectl logs deployment/frontend-app
```

Ver eventos cuando algo falla:

```powershell
kubectl get events --sort-by=.lastTimestamp
```

Describir un pod:

```powershell
kubectl describe pod <NOMBRE_DEL_POD>
```

Reiniciar un deployment:

```powershell
kubectl rollout restart deployment/auth-service
```

## Actualizar codigo y reconstruir

Cuando cambies codigo de un microservicio:

```powershell
minikube -p minikube docker-env --shell powershell | Invoke-Expression
docker build -t auth-service:latest ./microservices/auth-service
kubectl rollout restart deployment/auth-service
```

Para el frontend:

```powershell
minikube -p minikube docker-env --shell powershell | Invoke-Expression
docker build -t frontend-app:latest ./Front-end
kubectl rollout restart deployment/frontend-app
```

## Apagar el entorno

Docker Compose:

```powershell
docker compose down
```

Minikube:

```powershell
minikube stop
```

Eliminar completamente el cluster local:

```powershell
minikube delete
```

## Problemas comunes

### `ImagePullBackOff` o `ErrImagePull`

Significa que Kubernetes no encuentra la imagen local.

Solucion:

```powershell
minikube -p minikube docker-env --shell powershell | Invoke-Expression
docker images
docker build -t auth-service:latest ./microservices/auth-service
kubectl rollout restart deployment/auth-service
```

Repite con la imagen del servicio que este fallando.

### `no matches for kind "IngressRoute"` o `no matches for kind "Middleware"`

Faltan las CRDs de Traefik.

```powershell
kubectl apply -f https://raw.githubusercontent.com/traefik/traefik/v2.7/docs/content/reference/dynamic-configuration/kubernetes-crd-definition-v1.yml
kubectl apply -f Kubernetes/ingress/
```

### Docker no responde

Abre Docker Desktop y espera a que indique que esta corriendo. Luego prueba:

```powershell
docker ps
```

### Minikube no arranca por recursos

Prueba con menos memoria o CPU:

```powershell
minikube start --driver=docker --cpus=2 --memory=4096 --disk-size=20g
```

Si el proyecto queda lento o algunos pods no arrancan, vuelve a usar 8 GB de memoria para Minikube.

## Nota de seguridad

Los manifiestos actuales incluyen credenciales y secretos de desarrollo directamente en archivos YAML. Eso sirve para pruebas locales, pero no deberia usarse asi en produccion. Para un despliegue real hay que mover secretos a un gestor seguro, rotar credenciales y revisar tokens de correo, pagos y OAuth.
