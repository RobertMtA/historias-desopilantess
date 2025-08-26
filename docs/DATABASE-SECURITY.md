# Configuración Segura de Bases de Datos

Este documento proporciona guías para configurar de forma segura las conexiones a bases de datos en tu aplicación.

## Manejo de Credenciales

### Variables de Entorno

**NO** incluyas credenciales directamente en el código. Utiliza variables de entorno:

1. En desarrollo local:
   - Crea un archivo `.env` en la raíz del proyecto (¡asegúrate de incluirlo en .gitignore!)
   - Almacena tus variables así:
   ```
   DATABASE_URL=tu_cadena_de_conexión
   MONGODB_URI=tu_cadena_de_conexión_mongo
   ```

2. En Railway:
   - Ve a la sección "Variables" de tu proyecto
   - Añade las variables de entorno necesarias
   - Railway las incluirá automáticamente en tu entorno de despliegue

### Acceso a Variables de Entorno

```javascript
// En tu archivo de conexión a MongoDB
const mongoose = require('mongoose');

// Obtener la URI de MongoDB de las variables de entorno
const mongoUri = process.env.MONGODB_URI;

// Conexión a MongoDB
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Conexión a MongoDB establecida'))
.catch(err => console.error('❌ Error al conectar a MongoDB:', err));
```

## Migración entre PostgreSQL y MongoDB

Si estás migrando de PostgreSQL a MongoDB, necesitarás:

1. Definir esquemas para tus modelos de datos en MongoDB
2. Migrar los datos existentes 
3. Actualizar los controladores para usar las nuevas operaciones de MongoDB

### Ejemplo de Modelo de Interacciones

```javascript
const mongoose = require('mongoose');

const storyInteractionSchema = new mongoose.Schema({
  historia_id: { 
    type: Number, 
    required: true,
    unique: true 
  },
  likes: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('StoryInteraction', storyInteractionSchema);
```

## Mejores Prácticas de Seguridad

1. **Nunca compartas credenciales** en repositorios, chats o conversaciones
2. **Limita el acceso** en tu base de datos sólo a lo necesario
3. **Utiliza contraseñas fuertes** y cámbialas regularmente
4. **Monitorea el acceso** a tu base de datos
5. **Habilita IP Whitelisting** cuando sea posible

## Recursos Adicionales

- [Documentación oficial de MongoDB](https://docs.mongodb.com/drivers/node/)
- [Mejores prácticas de seguridad para MongoDB](https://docs.mongodb.com/manual/administration/security-checklist/)
