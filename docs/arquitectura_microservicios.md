# Arquitectura de Microservicios - CONIITI 2026

## 1. Resumen ejecutivo

La solucion activa del proyecto se apoya en una arquitectura de microservicios detras de un API Gateway. El Front-end no conoce direcciones internas de los servicios: toda llamada entra por Traefik usando rutas `'/api/*'`.

El monolito legado ubicado en `Back-end/` permanece fuera del `docker-compose.yml` principal y no participa en el flujo activo de despliegue. La version entregable del sistema corre con servicios independientes, bases de datos separadas y comunicacion asincrona por eventos.

## 2. Dominios y responsabilidad

| Dominio | Servicio(s) | Persistencia | Responsabilidad principal |
| --- | --- | --- | --- |
| Usuarios / Autenticacion | `auth-service`, `users-service` | `auth-db`, `users-db` | Registro, login, OTP, OAuth, sesiones y perfiles |
| Ponencias / Agenda | `agenda-service` | `agenda-db` | CRUD de sesiones, agenda publica y preinscripciones |
| Notificaciones | `notifications-service` | `notifications-db` | Consumo asincrono de eventos y trazabilidad de notificaciones |
| Analitica | `analytics-service` | `analytics-mongo` | Captura flexible de eventos para estadisticas |
| Archivos / CMS | `files-service` | volumen `files_uploads` | Archivos, assets y contenido administrable |
| Pagos | `payments-service` | `payments-db` | Flujo de checkout y persistencia de pagos |
| Gateway | `traefik` | no aplica | Punto unico de entrada y enrutamiento |

## 3. Flujo general de informacion

1. El navegador consume el Front-end por `http://localhost/`.
2. El Front-end llama unicamente a `http://localhost/api/...`.
3. Traefik enruta cada prefijo a su microservicio correspondiente.
4. `auth-service` publica `usuario.registrado` cuando finaliza un registro.
5. `agenda-service` publica eventos como `ponencia.creada` y `agenda.sesion_actualizada`.
6. RabbitMQ recibe esos mensajes en el exchange `coniiti_events`.
7. `notifications-service` y `analytics-service` consumen los eventos sin bloquear al productor.
8. Cada consumidor persiste sus resultados en su propia base de datos.

## 4. Evidencia de desacoplamiento

- El Front-end usa una unica base relativa `'/api'` en `Front-end/src/services/apiConfig.js`.
- Traefik expone todas las rutas HTTP del sistema y aplica middlewares de CORS y `stripPrefix`.
- Cada servicio define su propia conexion de base de datos en variables de entorno separadas.
- Los eventos de integracion estan documentados en `docs/contracts_and_events.md`.

## 5. Justificacion tecnologica

### Gateway: Traefik

Se eligio Traefik porque encaja muy bien con una topologia basada en contenedores y porque permite separar configuracion estatica y dinamica sin meter otro stack de aplicacion. En este proyecto resulta suficiente como puerta de entrada, reverse proxy y capa de ruteo por prefijos.

Por que no Nginx:

- Nginx resuelve muy bien el reverse proxy, pero en este taller se requeria una puerta de entrada flexible para varios servicios y Traefik simplifica el ruteo dinamico y la recarga de configuracion.

Por que no Kong:

- Kong es una opcion potente para politicas avanzadas, plugins, rate limiting empresarial y gestion mas completa del gateway. Para este alcance agrega mas piezas operativas de las necesarias.

Por que no Spring Cloud Gateway:

- Spring Cloud Gateway es excelente cuando el ecosistema ya esta centrado en Spring. Aqui el back activo usa principalmente Python y React, asi que introducir Java solo para el gateway elevaba la complejidad sin aportar una ventaja proporcional.

### Mensajeria: RabbitMQ

Se eligio RabbitMQ porque el caso principal del taller no es event streaming masivo sino integracion asincrona confiable entre pocos servicios. RabbitMQ ofrece exchanges por topicos, colas durables y mensajes persistentes, que es justo lo necesario para que `notifications-service` pueda caerse y luego recuperar eventos pendientes.

Por que no Kafka:

- Kafka sobresale cuando se necesita alto volumen, retencion prolongada, replay y procesamiento de streams a gran escala. Para eventos de negocio discretos como registro de usuario o creacion de ponencia, ese poder adicional no era indispensable.

Por que no Redis Pub/Sub:

- Redis Pub/Sub tiene una semantica `at-most-once`; si el consumidor esta desconectado, el mensaje puede perderse. Eso choca con la prueba de resiliencia pedida en el taller.

Por que no AWS SQS:

- SQS seria una muy buena opcion si el despliegue objetivo fuera AWS administrado de punta a punta. En esta entrega se privilegio una solucion portable y reproducible localmente con `docker compose` sin depender de un proveedor externo.

### Persistencia: Postgres + MongoDB

- Postgres se usa en servicios transaccionales donde importa consistencia y modelo estructurado.
- MongoDB se usa en `analytics-service` porque los eventos pueden crecer o variar con menos friccion de esquema.
- La separacion de bases evita compartir tablas y reduce acoplamiento entre dominios.

### Contenedores y orquestacion

La entrega actual usa `docker compose` porque el taller exige levantar toda la solucion con un solo comando y Compose encaja exactamente con ese objetivo. Tambien facilita una puesta en marcha rapida en una VM o servidor remoto pequeno.

Comparacion resumida:

- Docker Compose: mejor opcion para la entrega por simplicidad operativa y reproducibilidad.
- Docker Swarm: agrega clustering, desired state y rolling updates, pero para este alcance introduce mas infraestructura de la necesaria.
- Kubernetes: es la mejor evolucion si el proyecto crece en replicas, observabilidad, autohealing y despliegues mas complejos, pero tiene una curva operativa mayor.
- Podman: es una alternativa valida por su modelo daemonless y rootless; aun asi, Docker Compose ofrece aqui mejor alineacion con el material del equipo y con la experiencia mas comun del taller.

## 6. Resiliencia observada

La prueba pedida por el taller se cumple asi:

- `auth-service` y `agenda-service` publican eventos en RabbitMQ.
- `notifications-service` consume desde una cola durable propia.
- Si `notifications-service` se apaga, los productores siguen funcionando y RabbitMQ conserva los mensajes.
- Cuando el consumidor regresa, reprocesa los mensajes pendientes y los persiste.

Eso significa que el fallo de notificaciones no tumba el registro ni la agenda.

## 7. Limitaciones actuales y mejora futura

- Si RabbitMQ cae durante el registro de usuarios, `auth-service` todavia depende del publish y devuelve error.
- La mejora recomendada es un patron Outbox con reintentos, para que la transaccion local y la publicacion de eventos queden desacopladas.
- Los logs ya son observables desde Traefik y `docker compose logs`, pero la siguiente evolucion profesional seria Loki/Grafana o ELK.
- Si el despliegue remoto necesita alta disponibilidad real, el siguiente paso natural es migrar de Compose a Kubernetes.

## 8. Referencias oficiales

Estas referencias respaldan la decision tecnologica y sirven para la sustentacion:

- Traefik, configuracion estatica y dinamica: https://doc.traefik.io/traefik/getting-started/configuration-overview/
- Traefik con Docker: https://doc.traefik.io/traefik/v2.11/providers/docker/
- Nginx como reverse proxy: https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/
- Kong Gateway y modelo de services/routes: https://docs.konghq.com/gateway/latest/get-started/services-and-routes/
- Spring Cloud Gateway: https://docs.spring.io/spring-cloud-gateway/reference/intro.html
- RabbitMQ exchanges: https://www.rabbitmq.com/docs/next/exchanges
- RabbitMQ queues durables: https://www.rabbitmq.com/docs/4.0/queues
- Apache Kafka introduction: https://kafka.apache.org/intro/
- Amazon SQS overview: https://aws.amazon.com/sqs/
- Redis Pub/Sub delivery semantics: https://redis.io/docs/latest/develop/pubsub/
- Docker Compose overview: https://docs.docker.com/guides/docker-compose/
- Docker Swarm mode: https://docs.docker.com/engine/swarm/
- Podman overview: https://docs.podman.io/
