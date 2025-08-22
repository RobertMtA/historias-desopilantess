# Usar Node.js 22 oficial
FROM node:22-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY api-railway/package*.json ./api-railway/
RUN cd api-railway && npm ci --only=production

# Copiar todos los archivos del servidor API
COPY api-railway/server.js ./api-railway/
COPY api-railway/Subscriber.js ./api-railway/
COPY api-railway/StoryInteraction.js ./api-railway/
COPY api-railway/.env ./api-railway/

# Exponer el puerto
EXPOSE 3009

# Comando para ejecutar el servidor limpio
CMD ["node", "api-railway/server.js"]
