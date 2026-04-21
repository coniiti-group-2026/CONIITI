FROM traefik:v2.10

# Copiar la configuración estática
COPY traefik.azure.yml /etc/traefik/traefik.yml

# Copiar la configuración dinámica
COPY dynamic.azure.yml /etc/traefik/dynamic.azure.yml
