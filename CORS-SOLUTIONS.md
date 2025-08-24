# Soluciones a Problemas de CORS en Historias Desopilantes API

Este documento detalla las soluciones implementadas para resolver los problemas de CORS (Cross-Origin Resource Sharing) que afectaban la comunicación entre el frontend y la API backend.

## Modificaciones Realizadas

### 1. Configuración CORS Global

Se ha implementado una configuración CORS robusta y centralizada:

```javascript
// Configuración CORS única y robusta
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir solicitudes sin origen (como aplicaciones móviles o curl)
    if (!origin) return callback(null, true);
    
    // Si el origen está en la lista de permitidos o estamos en desarrollo
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      // En producción, permitir el frontend principal
      if (origin === 'https://historias-desopilantes.web.app') {
        callback(null, true);
      } else {
        // Temporalmente permitir todos los orígenes para depuración
        callback(null, true);
      }
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400 // 24 horas
};
```

### 2. Múltiples Capas de Protección

Se han implementado varias capas de protección CORS para garantizar que las solicitudes funcionen correctamente:

1. **Middleware CORS global**: `app.use(cors(corsOptions))`
2. **Headers CORS explícitos**: En un middleware adicional para todas las rutas
3. **Headers CORS específicos por ruta**: En cada endpoint crítico de likes

### 3. Soporte para Rutas en Inglés y Español

Para las rutas de "likes", se han implementado headers CORS específicos tanto en las versiones en inglés como en español:

```javascript
// Endpoint para obtener likes de una historia - versión en inglés
app.get('/api/stories/:id/likes', async (req, res) => {
  // Establecer encabezados CORS específicos
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  const { id } = req.params;
  await getLikesForStory(id, res);
});

// Versión en español
app.get('/api/historias/:id/likes', async (req, res) => {
  // Configuración CORS similar...
});
```

### 4. Manejo Explícito de Solicitudes OPTIONS

Se ha implementado un manejo específico de las solicitudes OPTIONS (preflight requests) que los navegadores envían antes de realizar solicitudes reales:

```javascript
// Manejar solicitudes preflight OPTIONS
if (req.method === 'OPTIONS') {
  return res.status(200).end();
}
```

### 5. Headers CORS en Funciones Auxiliares

Se han agregado headers CORS adicionales en las funciones auxiliares que manejan las respuestas:

```javascript
// En la función getLikesForStory
res.header('Access-Control-Allow-Origin', '*');

// En la función addLikeToStory
res.header('Access-Control-Allow-Origin', '*');
```

## Próximos Pasos

1. **Monitoreo**: Observar el comportamiento de la aplicación para confirmar que los problemas CORS han sido resueltos.
2. **Ajuste de Seguridad**: Una vez que todo funcione correctamente, revisar la configuración CORS para hacerla más restrictiva y segura (por ejemplo, limitar orígenes permitidos solo a los dominios necesarios).
3. **Pruebas Exhaustivas**: Verificar todas las rutas de la API para asegurar un funcionamiento correcto.

## Notas Adicionales

Si continúan los problemas de CORS después de estas modificaciones, considerar:

1. Revisar las cabeceras de las solicitudes en las herramientas de desarrollo del navegador
2. Verificar que el frontend esté utilizando las URLs correctas para las solicitudes API
3. Confirmar que no hay proxies o servicios intermedios bloqueando o modificando los headers CORS
