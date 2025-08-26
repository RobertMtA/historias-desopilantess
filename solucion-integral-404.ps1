# Solución completa para errores 404 en comentarios
param (
    [switch]$SkipRailway = $false
)

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "   SOLUCIÓN INTEGRAL PARA ERRORES 404 EN COMENTARIOS" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# Directorios principales
$workspaceDir = "c:\Users\rober\Desktop\historias-desopilantes-react"
$apiRailwayDir = "$workspaceDir\api-railway"

# 1. VERIFICAR ARCHIVOS NECESARIOS
Write-Host "`n1. Verificando archivos necesarios..." -ForegroundColor Yellow

# Verificar existencia de archivo comments-routes.js
$commentsFilePath = "$apiRailwayDir\comments-routes.js"
if (-not (Test-Path $commentsFilePath)) {
    Write-Host "   Creando archivo de rutas de comentarios..." -ForegroundColor White
    
    # Contenido del archivo de rutas de comentarios
    $commentsRouteContent = @'
/**
 * ENDPOINTS DE COMENTARIOS PARA HISTORIAS DESOPILANTES
 */

// Importar módulos necesarios
const express = require('express');
const router = express.Router();

// Simular una base de datos de comentarios en memoria
const commentsDb = {
  // Comentarios organizados por ID de historia
  1: [
    { id: 1, storyId: 1, author: "Laura García", email: "laura@example.com", content: "¡Historia fascinante! Me encantó el giro final.", date: "2023-08-20T14:30:00Z", likes: 5 },
    { id: 2, storyId: 1, author: "Carlos Rodríguez", email: "carlos@example.com", content: "No podía parar de reír con esta historia. Muy bien narrada.", date: "2023-08-21T09:15:00Z", likes: 3 }
  ],
  2: [
    { id: 3, storyId: 2, author: "Ana Martínez", email: "ana@example.com", content: "Demasiado predecible el final, pero aún así entretenida.", date: "2023-08-19T18:45:00Z", likes: 1 }
  ],
  3: [
    { id: 4, storyId: 3, author: "Pedro Sánchez", email: "pedro@example.com", content: "¡Qué historia tan emocionante! La recomendaré a todos mis amigos.", date: "2023-08-22T11:20:00Z", likes: 8 },
    { id: 5, storyId: 3, author: "María López", email: "maria@example.com", content: "Me recordó a una anécdota similar que me ocurrió. ¡Genial narración!", date: "2023-08-23T16:10:00Z", likes: 4 }
  ]
};

// Contador para generar IDs únicos
let nextCommentId = 6;

// Añadir automáticamente algunos comentarios para historias que no los tienen
for (let i = 4; i <= 51; i++) {
  if (!commentsDb[i]) {
    commentsDb[i] = [];
    
    // Añadir 1-3 comentarios por historia
    const numComments = Math.floor(Math.random() * 3) + 1;
    
    const authors = [
      "Alejandro Torres", "Lucía Fernández", "Javier Ruiz", "Sofía Vega", 
      "Miguel Hernández", "Elena Gómez", "David Muñoz", "Carmen Díaz"
    ];
    
    const contents = [
      "Muy entretenida esta historia. Me hizo reír mucho.",
      "Creo que el protagonista podría haber tomado mejores decisiones.",
      "¡Vaya giro inesperado al final! No lo vi venir.",
      "Esta historia me recordó a mi infancia. Muy nostálgica.",
      "El autor tiene un estilo muy fresco y dinámico. Quiero leer más.",
      "Me encantó la descripción de los escenarios. Muy vívidos.",
      "Historia perfecta para leer un domingo por la tarde.",
      "El desarrollo de los personajes es excelente. Se sienten muy reales."
    ];
    
    for (let j = 0; j < numComments; j++) {
      const randomAuthor = authors[Math.floor(Math.random() * authors.length)];
      const randomContent = contents[Math.floor(Math.random() * contents.length)];
      const randomLikes = Math.floor(Math.random() * 10);
      const randomDaysAgo = Math.floor(Math.random() * 30);
      
      const date = new Date();
      date.setDate(date.getDate() - randomDaysAgo);
      
      commentsDb[i].push({
        id: nextCommentId++,
        storyId: i,
        author: randomAuthor,
        email: randomAuthor.toLowerCase().replace(' ', '.') + "@example.com",
        content: randomContent,
        date: date.toISOString(),
        likes: randomLikes
      });
    }
  }
}

// ENDPOINT: Obtener todos los comentarios de una historia
router.get('/stories/:storyId/comments', (req, res) => {
  const storyId = parseInt(req.params.storyId);
  console.log(`📝 Obteniendo comentarios para historia ${storyId}`);
  
  // Verificar si la historia existe
  const comments = commentsDb[storyId] || [];
  
  // Ordenar comentarios por fecha (más reciente primero)
  const sortedComments = [...comments].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  
  res.json(sortedComments);
});

// ENDPOINT: Añadir un comentario a una historia
router.post('/stories/:storyId/comments', (req, res) => {
  const storyId = parseInt(req.params.storyId);
  const { author, email, content } = req.body;
  
  console.log(`📝 Añadiendo comentario a historia ${storyId}`);
  
  // Validar datos requeridos
  if (!author || !email || !content) {
    return res.status(400).json({ 
      error: "Faltan datos requeridos (author, email, content)" 
    });
  }
  
  // Inicializar el array de comentarios si no existe
  if (!commentsDb[storyId]) {
    commentsDb[storyId] = [];
  }
  
  // Crear nuevo comentario
  const newComment = {
    id: nextCommentId++,
    storyId,
    author,
    email,
    content,
    date: new Date().toISOString(),
    likes: 0
  };
  
  // Añadir a la base de datos
  commentsDb[storyId].push(newComment);
  
  res.status(201).json(newComment);
});

// ENDPOINT: Obtener un comentario específico
router.get('/stories/:storyId/comments/:commentId', (req, res) => {
  const storyId = parseInt(req.params.storyId);
  const commentId = parseInt(req.params.commentId);
  
  console.log(`📝 Obteniendo comentario ${commentId} de historia ${storyId}`);
  
  // Verificar si la historia existe
  if (!commentsDb[storyId]) {
    return res.status(404).json({ error: "Historia no encontrada" });
  }
  
  // Buscar el comentario
  const comment = commentsDb[storyId].find(c => c.id === commentId);
  
  if (!comment) {
    return res.status(404).json({ error: "Comentario no encontrado" });
  }
  
  res.json(comment);
});

// ENDPOINT: Dar like a un comentario
router.post('/stories/:storyId/comments/:commentId/like', (req, res) => {
  const storyId = parseInt(req.params.storyId);
  const commentId = parseInt(req.params.commentId);
  
  console.log(`❤️ Dando like al comentario ${commentId} de historia ${storyId}`);
  
  // Verificar si la historia existe
  if (!commentsDb[storyId]) {
    return res.status(404).json({ error: "Historia no encontrada" });
  }
  
  // Buscar el comentario
  const commentIndex = commentsDb[storyId].findIndex(c => c.id === commentId);
  
  if (commentIndex === -1) {
    return res.status(404).json({ error: "Comentario no encontrado" });
  }
  
  // Incrementar likes
  commentsDb[storyId][commentIndex].likes += 1;
  
  res.json(commentsDb[storyId][commentIndex]);
});

// Exportar el router para usarlo en server.js
module.exports = function(app) {
  // Registrar rutas
  app.use('/api', router);
  
  console.log("📝 Endpoints de comentarios registrados:");
  console.log("   GET  /api/stories/:id/comments");
  console.log("   POST /api/stories/:id/comments");
  console.log("   GET  /api/stories/:id/comments/:commentId");
  console.log("   POST /api/stories/:id/comments/:commentId/like");
};
'@
    
    # Guardar el archivo
    Set-Content -Path $commentsFilePath -Value $commentsRouteContent
    Write-Host "   ✓ Archivo comments-routes.js creado correctamente" -ForegroundColor Green
} else {
    Write-Host "   ✓ Archivo comments-routes.js ya existe" -ForegroundColor Green
}

# Verificar server.js
$serverFilePath = "$apiRailwayDir\server.js"
if (-not (Test-Path $serverFilePath)) {
    Write-Host "   ❌ No se encontró el archivo server.js. No se puede continuar." -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ Archivo server.js encontrado" -ForegroundColor Green

# 2. ACTUALIZAR SERVER.JS
Write-Host "`n2. Actualizando server.js para añadir endpoints de comentarios..." -ForegroundColor Yellow

$serverContent = Get-Content -Path $serverFilePath -Raw
$serverUpdated = $false

# Verificar si ya tiene importado el módulo de comentarios
if (-not ($serverContent -match 'require\([''"]\.\/comments-routes[''"]')) {
    # Agregar importación después de express
    if ($serverContent -match 'const express = require\([''"]express[''"]') {
        $serverContent = $serverContent -replace '(const express = require\([''"]express[''"].*)', "`$1`nconst commentsRoutes = require('./comments-routes');"
        $serverUpdated = $true
        Write-Host "   ✓ Importación de comments-routes añadida" -ForegroundColor Green
    } else {
        # Si no encuentra express, añadir al inicio
        $serverContent = "const commentsRoutes = require('./comments-routes');" + "`n" + $serverContent
        $serverUpdated = $true
        Write-Host "   ✓ Importación añadida al inicio del archivo" -ForegroundColor Green
    }
} else {
    Write-Host "   ✓ Importación de commentsRoutes ya existe" -ForegroundColor Green
}

# Verificar si ya tiene inicializado el módulo
if (-not ($serverContent -match 'commentsRoutes\(app\)')) {
    # Buscar después de configuración de CORS o después de definir la app
    if ($serverContent -match 'app\.use\(cors\([^)]+\)\);') {
        $serverContent = $serverContent -replace '(app\.use\(cors\([^)]+\)\);)', "`$1`n`n// Añadir rutas de comentarios`ncommentsRoutes(app);"
        $serverUpdated = $true
        Write-Host "   ✓ Inicialización de rutas añadida después de CORS" -ForegroundColor Green
    } elseif ($serverContent -match 'const app = express\(\);') {
        $serverContent = $serverContent -replace '(const app = express\(\);.*)', "`$1`n`n// Añadir rutas de comentarios`ncommentsRoutes(app);"
        $serverUpdated = $true
        Write-Host "   ✓ Inicialización añadida después de definir app" -ForegroundColor Green
    } else {
        # Si todo lo demás falla, añadir antes del primer endpoint
        $serverContent = $serverContent -replace '(app\.(get|post|put|delete))', "// Añadir rutas de comentarios`ncommentsRoutes(app);`n`n`$1"
        $serverUpdated = $true
        Write-Host "   ✓ Inicialización añadida antes de la primera ruta" -ForegroundColor Green
    }
} else {
    Write-Host "   ✓ Inicialización de commentsRoutes ya existe" -ForegroundColor Green
}

# Guardar cambios si hubo modificaciones
if ($serverUpdated) {
    Set-Content -Path $serverFilePath -Value $serverContent
    Write-Host "   ✓ Archivo server.js actualizado correctamente" -ForegroundColor Green
} else {
    Write-Host "   ✓ Server.js ya está correctamente configurado" -ForegroundColor Green
}

# 3. SOLUCIÓN DEL LADO DEL CLIENTE
Write-Host "`n3. Implementando solución del lado del cliente..." -ForegroundColor Yellow

# Verificar si existe el script de parche para el cliente
$fixApiUrlPath = "$workspaceDir\public\fix-api-url.js"
if (-not (Test-Path $fixApiUrlPath)) {
    # Crear el script de parche
    $fixApiUrlContent = @'
/**
 * PARCHE AUTOMÁTICO PARA REDIRIGIR PETICIONES A LA API
 * No eliminar hasta que se resuelva el problema de URLs
 */
(function() {
  const oldUrl = 'historias-desopilantes-production.up.railway.app';
  const newUrl = 'historias-desopilantes-react-production.up.railway.app';
  
  console.log('🔄 Instalando redirección automática para peticiones API...');
  
  // Guardar la función fetch original
  const originalFetch = window.fetch;
  
  // Reemplazar con nuestra función que redirige URLs
  window.fetch = function(resource, options) {
    if (typeof resource === 'string' && resource.includes(oldUrl)) {
      console.log('🔀 Redirigiendo:', resource);
      resource = resource.replace(oldUrl, newUrl);
    }
    return originalFetch.call(this, resource, options);
  };
  
  // También parchear XMLHttpRequest para redirigir
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    if (typeof url === 'string' && url.includes(oldUrl)) {
      console.log('🔀 Redirigiendo XHR:', url);
      url = url.replace(oldUrl, newUrl);
    }
    return originalOpen.call(this, method, url, ...args);
  };
  
  console.log('✅ Parche de redirección instalado correctamente');
})();
'@

    # Crear directorio public si no existe
    if (-not (Test-Path "$workspaceDir\public")) {
        New-Item -Path "$workspaceDir\public" -ItemType Directory -Force | Out-Null
    }

    # Guardar el script
    Set-Content -Path $fixApiUrlPath -Value $fixApiUrlContent
    Write-Host "   ✓ Script de parche fix-api-url.js creado" -ForegroundColor Green

    # Incluir el script en index.html
    $indexHtmlPath = "$workspaceDir\index.html"
    if (Test-Path $indexHtmlPath) {
        $indexContent = Get-Content -Path $indexHtmlPath -Raw
        
        if (-not $indexContent.Contains("fix-api-url.js")) {
            $indexContent = $indexContent -replace "</head>", "  <script src=""%PUBLIC_URL%/fix-api-url.js""></script>`n  </head>"
            Set-Content -Path $indexHtmlPath -Value $indexContent
            Write-Host "   ✓ Script de parche añadido a index.html" -ForegroundColor Green
        } else {
            Write-Host "   ✓ Script ya está incluido en index.html" -ForegroundColor Green
        }
    } else {
        Write-Host "   ⚠️ No se encontró index.html" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ✓ Script de parche ya existe" -ForegroundColor Green
}

# 4. VERIFICAR SOLUCIÓN HTML INTERACTIVA
Write-Host "`n4. Verificando solución HTML interactiva..." -ForegroundColor Yellow

$htmlSolutionPath = "$workspaceDir\solucionar-404-comments.html"
if (-not (Test-Path $htmlSolutionPath)) {
    Write-Host "   ⚠️ No se encontró la solución HTML interactiva" -ForegroundColor Yellow
    Write-Host "      Se recomienda ejecutar: node aplicar-parche-404-comments.js" -ForegroundColor Yellow
} else {
    Write-Host "   ✓ Solución HTML interactiva encontrada" -ForegroundColor Green
    
    # Verificar si se ha ejecutado el script de aplicación del parche
    if (Test-Path "$workspaceDir\aplicar-parche-404-comments.js") {
        Write-Host "   ✓ Script aplicar-parche-404-comments.js encontrado" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ Script aplicar-parche-404-comments.js no encontrado" -ForegroundColor Yellow
    }
}

# 5. DESPLEGAR EN RAILWAY (OPCIONAL)
if (-not $SkipRailway) {
    Write-Host "`n5. Preparando despliegue en Railway..." -ForegroundColor Yellow
    
    Write-Host "   Esta parte requiere Railway CLI y autenticación." -ForegroundColor Yellow
    Write-Host "   Si encuentras problemas, puedes omitir este paso con el parámetro -SkipRailway." -ForegroundColor Yellow
    
    Write-Host "`n   ¿Deseas intentar desplegar en Railway ahora? (S/N)" -ForegroundColor Cyan
    $railwayRespuesta = Read-Host
    
    if ($railwayRespuesta -eq "S" -or $railwayRespuesta -eq "s") {
        Set-Location -Path $apiRailwayDir
        
        # Verificar si estamos autenticados
        try {
            $whoamiOutput = railway whoami 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   ✓ Usuario autenticado en Railway: $whoamiOutput" -ForegroundColor Green
            } else {
                Write-Host "   ❌ No has iniciado sesión en Railway" -ForegroundColor Red
                
                Write-Host "`n   Intento de inicio de sesión con modo sin navegador..." -ForegroundColor Yellow
                Write-Host "   Se te proporcionará un código y una URL. Abre la URL en tu navegador," -ForegroundColor Yellow
                Write-Host "   introduce el código y vuelve a esta consola cuando termines." -ForegroundColor Yellow
                
                railway login --browserless
                
                if ($LASTEXITCODE -ne 0) {
                    Write-Host "`n   ❌ Error al iniciar sesión en Railway" -ForegroundColor Red
                    Write-Host "   Puedes intentar manualmente con: railway login --browserless" -ForegroundColor Yellow
                    Write-Host "   O continuar sin desplegar en Railway" -ForegroundColor Yellow
                    
                    Set-Location -Path $workspaceDir
                    continue
                }
            }
            
            # Vincular proyecto
            Write-Host "`n   Vinculando proyecto Railway..." -ForegroundColor Yellow
            railway link
            
            if ($LASTEXITCODE -ne 0) {
                Write-Host "   ❌ Error al vincular proyecto" -ForegroundColor Red
                Write-Host "   Puedes intentar manualmente con: railway link" -ForegroundColor Yellow
                
                Set-Location -Path $workspaceDir
                continue
            }
            
            # Desplegar
            Write-Host "`n   Desplegando en Railway..." -ForegroundColor Yellow
            Write-Host "   Este proceso puede tardar varios minutos..." -ForegroundColor White
            
            railway up
            
            if ($LASTEXITCODE -ne 0) {
                Write-Host "   ❌ Error al desplegar en Railway" -ForegroundColor Red
            } else {
                Write-Host "   ✓ Despliegue en Railway exitoso" -ForegroundColor Green
            }
        }
        catch {
            Write-Host "   ❌ Error al interactuar con Railway: $_" -ForegroundColor Red
        }
        
        Set-Location -Path $workspaceDir
    }
} else {
    Write-Host "`n5. Despliegue en Railway omitido (parámetro -SkipRailway)" -ForegroundColor Yellow
}

# RESUMEN Y PRÓXIMOS PASOS
Write-Host "`n====================================================" -ForegroundColor Cyan
Write-Host "       SOLUCIÓN COMPLETADA" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan

Write-Host "`nPróximos pasos:" -ForegroundColor White

Write-Host "`n1. Ejecutar actualización completa:" -ForegroundColor Yellow
Write-Host "   .\actualizar-completo.ps1" -ForegroundColor White

Write-Host "`n2. Para desplegar manualmente en Railway:" -ForegroundColor Yellow
Write-Host "   cd $apiRailwayDir" -ForegroundColor White
Write-Host "   railway login --browserless" -ForegroundColor White
Write-Host "   railway link" -ForegroundColor White
Write-Host "   railway up" -ForegroundColor White

Write-Host "`n3. Para solucionar problemas en el navegador:" -ForegroundColor Yellow
Write-Host "   Abre el archivo solucionar-404-comments.html en tu navegador" -ForegroundColor White

Write-Host "`n4. Para diagnosticar problemas adicionales:" -ForegroundColor Yellow
Write-Host "   .\diagnostico-integral.ps1" -ForegroundColor White

Write-Host "`nURLs importantes:" -ForegroundColor White
Write-Host "- Frontend: https://histostorias-desopilantes.web.app/historias" -ForegroundColor Yellow
Write-Host "- API: https://historias-desopilantes-react-production.up.railway.app/api/routes" -ForegroundColor Yellow
Write-Host "- API Comentarios: https://historias-desopilantes-react-production.up.railway.app/api/stories/1/comments" -ForegroundColor Yellow

# Volver al directorio principal
Set-Location -Path $workspaceDir
