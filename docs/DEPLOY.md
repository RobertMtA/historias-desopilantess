# Deployment Script

## 1. Actualizar URL del backend
# Reemplazar en src/config/api.js:
# production: 'https://TU-URL-DE-RAILWAY.railway.app'

## 2. Build del proyecto
npm run build

## 3. Deploy a Firebase
firebase deploy

## 4. Verificar conexión
# Probar las APIs desde el frontend en producción
