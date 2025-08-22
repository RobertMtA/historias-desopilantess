# Usar Node.js 22 oficial
FROM node:22-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar solo los archivos del servidor API limpio
COPY api-railway/package*.json ./api-railway/
RUN cd api-railway && npm ci --only=production

# Copiar el servidor
COPY api-railway/server.js ./api-railway/

# Exponer el puerto
EXPOSE 3009

# Comando para ejecutar el servidor limpio
CMD ["node", "api-railway/server.js"]
