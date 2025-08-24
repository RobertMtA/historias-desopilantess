# Script PowerShell para desplegar API en Railway

# Colores para la terminal
$GREEN = [char]27 + "[0;32m"
$YELLOW = [char]27 + "[0;33m"
$RED = [char]27 + "[0;31m"
$BLUE = [char]27 + "[0;34m"
$NC = [char]27 + "[0m" # No Color

Write-Host "`n${BLUE}===== SCRIPT DE DESPLIEGUE A RAILWAY =====`n${NC}"

# Verificar que Railway CLI esté instalado
Write-Host "${YELLOW}>> Verificando Railway CLI...${NC}"
if (!(Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-Host "${RED}❌ Railway CLI no está instalado. Por favor instálelo primero:${NC}"
    Write-Host "npm i -g @railway/cli"
    exit 1
}

# Verificar que estemos logueados en Railway
Write-Host "`n${YELLOW}>> Verificando login en Railway...${NC}"
try {
    railway whoami
} catch {
    Write-Host "${RED}❌ No estás logueado en Railway. Iniciando login...${NC}"
    railway login
}

# Navegar al directorio de la API
Write-Host "`n${YELLOW}>> Navegando al directorio de la API...${NC}"
try {
    Push-Location api-railway
} catch {
    Write-Host "${RED}❌ No se pudo encontrar el directorio api-railway${NC}"
    exit 1
}

# Verificar el estado actual del proyecto
Write-Host "`n${YELLOW}>> Verificando estado del proyecto en Railway...${NC}"
railway status

# Preparar para despliegue
Write-Host "`n${YELLOW}>> Preparando para despliegue...${NC}"
Write-Host "Asegurándose que el server.js tiene los últimos cambios..."

# Ejecutar despliegue
Write-Host "`n${GREEN}>> Iniciando despliegue a Railway...${NC}"
railway up

# Verificar despliegue
Write-Host "`n${YELLOW}>> Verificando despliegue...${NC}"
railway status

# Mostrar URL de la API
Write-Host "`n${BLUE}>> URL de la API:${NC}"
railway domain

# Ejecutar verificación de la API
Write-Host "`n${YELLOW}>> Ejecutando verificación de la API...${NC}"
Write-Host "${YELLOW}Espere unos momentos para que el despliegue se complete...${NC}"
Start-Sleep -Seconds 10
node check-api-status.js

# Verificar base de datos
Write-Host "`n${YELLOW}>> Verificando base de datos...${NC}"
railway run node verify-database.js

Write-Host "`n${GREEN}===== DESPLIEGUE COMPLETADO =====`n${NC}"
Write-Host "${BLUE}Para probar todos los endpoints:${NC}"
Write-Host "node test-endpoints.js"
Write-Host "${BLUE}Para verificar el estado de la API:${NC}"
Write-Host "node check-api-status.js"
Write-Host "${BLUE}Para verificar la base de datos:${NC}"
Write-Host "railway run node verify-database.js`n"

# Volver al directorio original
Pop-Location
