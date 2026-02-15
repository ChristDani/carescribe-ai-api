FROM node:20-alpine

WORKDIR /app

# Dependencias
COPY package*.json ./
RUN npm install

# Código
COPY . .

# # Certificado SSL de AWS
RUN mkdir -p /certs
COPY global-bundle.pem /certs/global-bundle.pem

# Build TS
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/server.js"]
