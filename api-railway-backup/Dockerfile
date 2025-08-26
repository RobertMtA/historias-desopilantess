FROM node:18-alpine

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install --production

# Copiar código fuente
COPY . .

# Exponer puerto (Railway configura PORT automáticamente)
EXPOSE 8080

# Comando para iniciar la aplicación
CMD ["node", "server.js"]
