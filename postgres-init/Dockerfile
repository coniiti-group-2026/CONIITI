FROM postgres:16-alpine

# Copiamos el script de inicialización al directorio donde Postgres
# lo ejecutará automáticamente al iniciar el contenedor por primera vez.
COPY init-db.sql /docker-entrypoint-initdb.d/

# Exponemos el puerto estándar
EXPOSE 5432
