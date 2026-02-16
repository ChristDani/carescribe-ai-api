**Proyecto**

Este repositorio contiene la API de Carescribe (backend Node/TypeScript) que expone endpoints para pacientes y notas, y usa PostgreSQL como base de datos.

**Requisitos**

- **Docker & Docker Compose** instalado en la máquina donde vas a ejecutar los containers.
- En el caso de ejecutar en EC2, Nginx ya está instalado en el host y será usado como proxy (puerto 80 → 3000).

- **Instancia de PostgreSQL**: Debes disponer de una instancia de PostgreSQL accesible por la aplicación. Puedes usar el servicio `db` definido en `docker-compose.yml` (se levantará un contenedor PostgreSQL) o conectar a una base de datos externa. Si usas una instancia externa, ajusta las variables `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` y `DB_NAME` en el archivo `.env` para que apunten a esa instancia y asegúrate de que el host/puerto sean accesibles desde donde corre la aplicación.

**Archivos relevantes**

- [docker-compose.yml](docker-compose.yml): define los servicios `api` y `db`.
- [.env](.env): variables de entorno necesarias (DB credentials, API keys, etc.).
- [nginx.conf](nginx.conf): configuración de ejemplo para Nginx (si quieres usar una imagen Nginx dentro de Docker). En tu caso el Nginx del host actuará como proxy.
- [Dockerfile](Dockerfile): Dockerfile del servicio `api`.

**Variables de entorno (ejemplo desde .env)**

- `NODE_ENV` (development|production)
- `PORT` (3000)
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_PORT`, `DB_HOST`
- `OPENAI_API_KEY`, `AWS_REGION`, `S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`

Comprueba y adapta `.env` antes de levantar los servicios.

Pasos para levantar el proyecto con Docker (recomendado)

1. Desde la raíz del proyecto, parar cualquier stack previo y (re)construir:

```bash
docker-compose down
docker-compose up -d --build
```

2. Ver logs del servicio API para comprobar que arranca correctamente:

```bash
docker-compose logs -f api
```

3. Verificar que la base de datos está accesible desde el contenedor API (opcional):

```bash
docker-compose exec api sh -c 'apk add --no-cache postgresql-client >/dev/null 2>&1 || true; psql "host=db port=5432 user=$DB_USER dbname=$DB_NAME password=$DB_PASSWORD" -c "SELECT 1;"'
```

Configuración de Nginx en EC2 (host) — proxy 80 → 3000

En EC2, crea un archivo de sitio Nginx, por ejemplo `/etc/nginx/sites-available/carescribe` con este contenido (reemplaza server_name si tienes dominio):

```nginx
server {
    listen 80;
    server_name _;

    access_log /var/log/nginx/carescribe.access.log;
    error_log  /var/log/nginx/carescribe.error.log;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
        proxy_buffers 16 4k;
        proxy_buffer_size 2k;
    }
}
```

Habilita y recarga Nginx (Ubuntu/Debian):

```bash
sudo ln -sf /etc/nginx/sites-available/carescribe /etc/nginx/sites-enabled/carescribe
sudo nginx -t
sudo systemctl reload nginx
```

Notas sobre puertos y docker-compose

- El servicio `api` expone el puerto 3000 en el host (`3000:3000`). El Nginx del host debe reenviar las peticiones entrantes en el puerto 80 hacia `http://127.0.0.1:3000`.
- El servicio `db` es accesible desde `api` mediante `DB_HOST=db` dentro de la red creada por Docker Compose.

Red Docker entre contenedores

Para asegurar comunicación fiable entre el contenedor de la base de datos y el backend, crea y usa una red Docker dedicada. Opciones:

- Usar Docker Compose (recomendado): `docker-compose` crea automáticamente una red aislada por proyecto y conecta los servicios definidos en `docker-compose.yml`. Asegúrate de levantar ambos servicios con `docker-compose up -d`.
- Crear manualmente una red y arrancar contenedores individuales:

```bash
docker network create carescribe-net
docker run -d --name db --network carescribe-net -e POSTGRES_USER=$DB_USER -e POSTGRES_PASSWORD=$DB_PASSWORD -e POSTGRES_DB=$DB_NAME postgres:16-alpine
docker run -d --name api --network carescribe-net --env-file .env -p 3000:3000 carescribe-ai-api
```

En este caso, dentro del contenedor `api` la variable `DB_HOST` debe apuntar al nombre del contenedor `db` (ej. `db`).

Nota: si usas `docker-compose`, no es necesario crear la red manualmente; Compose usará por defecto una red del tipo `project_default` que conecta todos los servicios del archivo.

Ejecutar localmente sin Docker

1. Instalar dependencias:

```bash
npm install
```

2. Compilar TypeScript (si tienes problemas de memoria, ver nota):

```bash
NODE_OPTIONS="--max-old-space-size=2048" npm run build:prod
```

3. Ejecutar:

```bash
npm run start
```

Notas y troubleshooting

- Si `tsc` falla por falta de memoria en el build (Error: JavaScript heap out of memory), aumenta la memoria con `NODE_OPTIONS="--max-old-space-size=3072"` al ejecutar el build.
- Si el API no se conecta a la base de datos revisa que las variables en `.env` coincidan con las usadas por `docker-compose.yml` y que el contenedor `db` esté levantado.
- Logs útiles:

```bash
docker-compose logs api
docker-compose logs db
sudo journalctl -u nginx -e
```

Soporte

Si quieres, puedo:

- Añadir un healthcheck en `docker-compose.yml` para el servicio `api`.
- Ajustar el `Dockerfile` para una imagen multi-stage que deje artefactos estáticos listos para Nginx.
- Generar el archivo de sitio Nginx ya con tu dominio.

---

Archivo generado automáticamente: sigue los pasos y pega aquí cualquier error de los logs para ayudarte a resolverlo.

Problemas de conexión desde contenedores Docker

En algunos entornos los contenedores Docker pueden tener problemas no resueltos para conectar a instancias externas (por ejemplo, bases de datos gestionadas fuera de la VPC, servicios que requieren IPs permitidas, o restricciones de DNS/NAT). Si detectas fallos de conexión desde el contenedor `api`, prueba lo siguiente:

- Probar conexión desde el contenedor:

```bash
docker-compose exec api sh -c 'apk add --no-cache curl >/dev/null 2>&1 || true; curl -v http://EXTERNAL_HOST:PORT'
```

- Comprobar resolución DNS dentro del contenedor:

```bash
docker-compose exec api sh -c 'nslookup example.com || true'
```

- Revisar firewall y reglas de red:
    - En EC2: security groups y NACLs deben permitir salida hacia el host/puerto destino.
    - En el host: `ufw` o `firewalld` pueden bloquear salidas.

- Si la DB es externa (ej. RDS), asegúrate de permitir la IP pública del host EC2 (no la del contenedor) en la lista de acceso de la DB.

- Como diagnóstico, prueba ejecutar el contenedor en `network_mode: host` (temporal) para ver si el problema es de la red bridge de Docker:

```yaml
services:
    api:
        network_mode: host
```

Nota: `network_mode: host` no es recomendado en producción porque comparte la red del host.

- Si persiste, revisa los logs del host Docker y la configuración de Docker daemon (DNS, iptables, NAT). En entornos con políticas de red estrictas (VPC privadas), puede ser necesario crear rutas o usar una NAT Gateway.

Si quieres, puedo añadir una sección más detallada con comandos específicos según tu proveedor (AWS, GCP, Azure) o sugerir una solución (ej. usar una instancia bastión o NAT Gateway).
