# Historias Desopilantes - Backend

Backend API para la aplicación Historias Desopilantes.

## 🚀 Características

- API REST con Express.js
- Base de datos MongoDB Atlas
- Autenticación y autorización
- Sistema de comentarios con anti-spam
- Gestión de likes y interacciones
- Formulario de contacto con validación
- Sistema de suscripción newsletter

## 🛠️ Tecnologías

- **Node.js** - Runtime
- **Express.js** - Framework web
- **MongoDB Atlas** - Base de datos
- **Mongoose** - ODM para MongoDB
- **CORS** - Cross-origin resource sharing
- **dotenv** - Variables de entorno

## 📋 Variables de Entorno

```env
MONGODB_URI=mongodb+srv://...
PORT=3009
NODE_ENV=production
```

## 🚀 Despliegue

Este backend está configurado para desplegarse en Railway.app

### Pasos para desplegar en Railway:

1. Ve a [railway.app](https://railway.app)
2. Conecta tu cuenta GitHub
3. Importa este repositorio
4. Configura las variables de entorno
5. ¡Despliega!

## 📡 Endpoints

### Stories
- `GET /api/stories` - Obtener todas las historias
- `GET /api/stories/:id` - Obtener historia específica
- `POST /api/stories/:id/like` - Dar like a historia
- `POST /api/stories/:id/comment` - Agregar comentario

### Contact
- `POST /api/contact` - Enviar formulario de contacto

### Subscribers  
- `POST /api/subscribers` - Suscribirse al newsletter

## 🔧 Desarrollo Local

```bash
npm install
npm start
```

El servidor se ejecuta en `http://localhost:3009`
