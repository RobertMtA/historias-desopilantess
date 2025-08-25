Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "Actualización Completa: Firebase, GitHub y Railway" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# Variables de configuración
$workspaceDir = "c:\Users\rober\Desktop\historias-desopilantes-react"
$apiRailwayDir = "$workspaceDir\api-railway"
$frontendBuildDir = "$workspaceDir\build"
$railwayUrl = "historias-desopilantes-react-production.up.railway.app"

# 1. VERIFICAR REQUISITOS
Write-Host "`n1. Verificando requisitos..." -ForegroundColor Yellow

# Verificar git
try {
    $gitVersion = git --version
    Write-Host "   ✓ Git instalado: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Git no está instalado o no está en el PATH" -ForegroundColor Red
    exit 1
}

# Verificar railway CLI
try {
    $railwayVersion = railway --version
    Write-Host "   ✓ Railway CLI instalado: $railwayVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Railway CLI no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host "      Instálalo con: npm i -g @railway/cli" -ForegroundColor Yellow
    exit 1
}

# Verificar firebase CLI
try {
    $firebaseVersion = firebase --version
    Write-Host "   ✓ Firebase CLI instalado: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Firebase CLI no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host "      Instálalo con: npm i -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

# 2. COMPILAR FRONTEND
Write-Host "`n2. Compilando el frontend..." -ForegroundColor Yellow
Set-Location -Path $workspaceDir

# Instalar dependencias si es necesario
if (-not (Test-Path "$workspaceDir\node_modules")) {
    Write-Host "   Instalando dependencias del frontend..." -ForegroundColor White
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ❌ Error al instalar dependencias del frontend" -ForegroundColor Red
        exit 1
    }
}

# Compilar el frontend
Write-Host "   Compilando frontend con npm run build..." -ForegroundColor White
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Error al compilar el frontend" -ForegroundColor Red
    exit 1
}

Write-Host "   ✓ Frontend compilado exitosamente" -ForegroundColor Green

# 3. SUBIR CAMBIOS A GITHUB
Write-Host "`n3. Subiendo cambios a GitHub..." -ForegroundColor Yellow
Set-Location -Path $workspaceDir

# Verificar estado de git
Write-Host "   Estado actual de Git:" -ForegroundColor White
git status

# Preguntar si desea continuar con el commit
Write-Host "`n   ¿Deseas hacer commit y push de estos cambios? (S/N)" -ForegroundColor Yellow
$commitRespuesta = Read-Host
if ($commitRespuesta -ne "S" -and $commitRespuesta -ne "s") {
    Write-Host "   Operación de commit/push cancelada por el usuario" -ForegroundColor Yellow
} else {
    # Agregar todos los cambios
    git add .
    
    # Hacer commit con mensaje descriptivo
    $commitMessage = "Fix: Corrige URL de API y agrega IDs a campos de formulario"
    git commit -m $commitMessage
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ⚠️ Advertencia al hacer commit" -ForegroundColor Yellow
    } else {
        Write-Host "   ✓ Commit creado exitosamente" -ForegroundColor Green
    }
    
    # Push a GitHub
    git push
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ❌ Error al hacer push a GitHub" -ForegroundColor Red
    } else {
        Write-Host "   ✓ Push a GitHub exitoso" -ForegroundColor Green
    }
}

# 4. DESPLEGAR EN RAILWAY
Write-Host "`n4. Desplegando backend en Railway..." -ForegroundColor Yellow
Set-Location -Path $apiRailwayDir

# Verificar si estamos en el proyecto correcto de Railway
Write-Host "   Verificando proyecto de Railway..." -ForegroundColor White
railway status
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ⚠️ No estás conectado a Railway o no tienes acceso al proyecto" -ForegroundColor Yellow
    Write-Host "   Por favor, ejecuta 'railway login' y 'railway link' antes de continuar" -ForegroundColor Yellow
    
    # Preguntar si desea continuar con el despliegue
    Write-Host "`n   ¿Deseas intentar el despliegue de Railway de todos modos? (S/N)" -ForegroundColor Yellow
    $railwayRespuesta = Read-Host
    if ($railwayRespuesta -ne "S" -and $railwayRespuesta -ne "s") {
        Write-Host "   Operación de despliegue de Railway cancelada" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ✓ Proyecto de Railway verificado" -ForegroundColor Green
}

# Desplegar en Railway
Write-Host "   Desplegando en Railway..." -ForegroundColor White
railway up
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Error al desplegar en Railway" -ForegroundColor Red
} else {
    Write-Host "   ✓ Despliegue en Railway exitoso" -ForegroundColor Green
}

# 5. DESPLEGAR FRONTEND EN FIREBASE
Write-Host "`n5. Desplegando frontend en Firebase..." -ForegroundColor Yellow
Set-Location -Path $workspaceDir

# Verificar si el usuario está autenticado en Firebase
Write-Host "   Verificando estado de Firebase..." -ForegroundColor White
firebase projects:list
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ⚠️ No estás autenticado en Firebase" -ForegroundColor Yellow
    Write-Host "   Por favor, ejecuta 'firebase login' antes de continuar" -ForegroundColor Yellow
    
    # Preguntar si desea continuar con el despliegue
    Write-Host "`n   ¿Deseas intentar el despliegue de Firebase de todos modos? (S/N)" -ForegroundColor Yellow
    $firebaseRespuesta = Read-Host
    if ($firebaseRespuesta -ne "S" -and $firebaseRespuesta -ne "s") {
        Write-Host "   Operación de despliegue de Firebase cancelada" -ForegroundColor Yellow
        exit 0
    }
}

# Desplegar en Firebase
Write-Host "   Desplegando en Firebase..." -ForegroundColor White
firebase deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Error al desplegar en Firebase" -ForegroundColor Red
} else {
    Write-Host "   ✓ Despliegue en Firebase exitoso" -ForegroundColor Green
}

# 6. VERIFICAR DESPLIEGUES
Write-Host "`n6. Verificando despliegues..." -ForegroundColor Yellow

# Verificar API en Railway
Write-Host "   Verificando API en Railway..." -ForegroundColor White
try {
    $response = Invoke-WebRequest -Uri "https://$railwayUrl/api/routes" -Method GET -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✓ API en Railway responde correctamente (status: $($response.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ API en Railway responde con código: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Error al verificar API en Railway: $_" -ForegroundColor Red
}

# Verificar frontend en Firebase
Write-Host "   Verificando frontend en Firebase..." -ForegroundColor White
try {
    $response = Invoke-WebRequest -Uri "https://histostorias-desopilantes.web.app/" -Method GET -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✓ Frontend en Firebase responde correctamente (status: $($response.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ Frontend en Firebase responde con código: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Error al verificar frontend en Firebase: $_" -ForegroundColor Red
}

# 7. LIMPIAR CACHÉ DEL NAVEGADOR (INSTRUCCIONES)
Write-Host "`n7. Implementando solución para errores 404 en comentarios..." -ForegroundColor Yellow

# Verificar si existe el script de parche
if (Test-Path -Path "$workspaceDir\aplicar-parche-404-comments.js") {
    Write-Host "   Ejecutando script de parche para redirigir peticiones API..." -ForegroundColor White
    
    # Ejecutar el script de aplicación del parche
    node "$workspaceDir\aplicar-parche-404-comments.js"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ⚠️ Advertencia: El script de parche devolvió un código de error: $LASTEXITCODE" -ForegroundColor Yellow
    } else {
        Write-Host "   ✓ Script de parche ejecutado exitosamente" -ForegroundColor Green
    }
} else {
    Write-Host "   ⚠️ No se encontró el script de parche" -ForegroundColor Yellow
    
    # Preguntar si desea crear el archivo de parche
    Write-Host "`n   ¿Deseas crear el script de parche para solucionar errores 404? (S/N)" -ForegroundColor Yellow
    $parcheSolucion = Read-Host
    if ($parcheSolucion -eq "S" -or $parcheSolucion -eq "s") {
        # Código para crear el script de parche y el HTML de solución
        $patchContent = @"
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
"@
        
        # Crear script en la carpeta public
        if (-not (Test-Path -Path "$workspaceDir\public")) {
            New-Item -Path "$workspaceDir\public" -ItemType Directory -Force | Out-Null
        }
        
        Set-Content -Path "$workspaceDir\public\fix-api-url.js" -Value $patchContent
        Write-Host "   ✓ Script de parche creado en public/fix-api-url.js" -ForegroundColor Green
        
        # Actualizar index.html para incluir el script
        if (Test-Path -Path "$workspaceDir\index.html") {
            $indexContent = Get-Content -Path "$workspaceDir\index.html" -Raw
            
            if (-not $indexContent.Contains("fix-api-url.js")) {
                $indexContent = $indexContent -replace "</head>", "  <script src=""%PUBLIC_URL%/fix-api-url.js""></script>`n  </head>"
                Set-Content -Path "$workspaceDir\index.html" -Value $indexContent
                Write-Host "   ✓ Script de parche añadido a index.html" -ForegroundColor Green
            }
        } else {
            Write-Host "   ⚠️ No se encontró index.html en la raíz" -ForegroundColor Yellow
        }
    }
}

Write-Host "`n8. Instrucciones para limpiar la caché del navegador:" -ForegroundColor Yellow
Write-Host "   1. Abre el archivo 'solucionar-404-comments.html' en tu navegador" -ForegroundColor White
Write-Host "   2. Sigue las instrucciones para aplicar el parche o limpiar la caché" -ForegroundColor White
Write-Host "   3. Verificar en modo incógnito: https://histostorias-desopilantes.web.app/historias" -ForegroundColor White

# RESUMEN FINAL
Write-Host "`n====================================================" -ForegroundColor Cyan
Write-Host "Proceso de actualización completado" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan

Write-Host "`nURLs importantes:" -ForegroundColor White
Write-Host "- Frontend: https://histostorias-desopilantes.web.app/historias" -ForegroundColor Yellow
Write-Host "- API: https://$railwayUrl/api/routes" -ForegroundColor Yellow
Write-Host "`nSi encuentras algún problema, ejecuta el script de diagnóstico:" -ForegroundColor White
Write-Host ".\diagnostico-integral.ps1" -ForegroundColor Yellow

# Volver al directorio principal
Set-Location -Path $workspaceDir
