**Proyecto**

Este repositorio contiene la API de Carescribe (backend Node/TypeScript) que expone endpoints para pacientes y notas, y usa PostgreSQL como base de datos.

**Requisitos**

- **Docker & Docker Compose** instalado en la máquina donde vas a ejecutar los containers.
- En el caso de ejecutar en EC2, Nginx ya está instalado en el host y será usado como proxy (puerto 80 → 3000).

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
