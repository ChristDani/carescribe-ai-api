FROM node:20-alpine

WORKDIR /app

# Dependencias
COPY package*.json ./
RUN npm install

# Código
COPY . .

# Build TS
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/server.js"]
