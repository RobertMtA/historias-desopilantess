# Usar Node.js 18 oficial (más estable para producción)
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar servidor definitivo y package.json
COPY servidor-definitivo.js .
COPY package*.json ./

# Instalar dependencias
RUN npm install --production

# Exponer el puerto que Railway utilizará
EXPOSE 8080

# Comando para ejecutar el servidor definitivo
CMD ["node", "servidor-definitivo.js"]
