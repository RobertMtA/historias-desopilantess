# Usar Node.js 22 oficial
FROM node:22-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de paquetes
COPY package*.json ./

# Instalar dependencias con legacy peer deps
RUN npm ci --legacy-peer-deps

# Copiar el código fuente
COPY . .

# Construir la aplicación React
RUN npm run build

# Exponer el puerto
EXPOSE 8080

# Comando para ejecutar el servidor
CMD ["node", "server-simple.js"]
