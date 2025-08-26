#!/bin/bash
# Script para desplegar API en Railway

# Colores para la terminal
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "\n${BLUE}===== SCRIPT DE DESPLIEGUE A RAILWAY =====\n${NC}"

# Verificar que Railway CLI esté instalado
echo -e "${YELLOW}>> Verificando Railway CLI...${NC}"
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI no está instalado. Por favor instálelo primero:${NC}"
    echo "npm i -g @railway/cli"
    exit 1
fi

# Verificar que estemos logueados en Railway
echo -e "\n${YELLOW}>> Verificando login en Railway...${NC}"
railway whoami || {
    echo -e "${RED}❌ No estás logueado en Railway. Iniciando login...${NC}"
    railway login
}

# Navegar al directorio de la API
echo -e "\n${YELLOW}>> Navegando al directorio de la API...${NC}"
cd api-railway || {
    echo -e "${RED}❌ No se pudo encontrar el directorio api-railway${NC}"
    exit 1
}

# Verificar el estado actual del proyecto
echo -e "\n${YELLOW}>> Verificando estado del proyecto en Railway...${NC}"
railway status

# Preparar para despliegue
echo -e "\n${YELLOW}>> Preparando para despliegue...${NC}"
echo -e "Asegurándose que el server.js tiene los últimos cambios..."

# Ejecutar despliegue
echo -e "\n${GREEN}>> Iniciando despliegue a Railway...${NC}"
railway up

# Verificar despliegue
echo -e "\n${YELLOW}>> Verificando despliegue...${NC}"
railway status

# Mostrar URL de la API
echo -e "\n${BLUE}>> URL de la API:${NC}"
railway domain

# Ejecutar verificación de la API
echo -e "\n${YELLOW}>> Ejecutando verificación de la API...${NC}"
echo -e "${YELLOW}Espere unos momentos para que el despliegue se complete...${NC}"
sleep 10
node check-api-status.js

# Verificar base de datos
echo -e "\n${YELLOW}>> Verificando base de datos...${NC}"
railway run node verify-database.js

echo -e "\n${GREEN}===== DESPLIEGUE COMPLETADO =====\n${NC}"
echo -e "${BLUE}Para probar todos los endpoints:${NC}"
echo -e "node test-endpoints.js"
echo -e "${BLUE}Para verificar el estado de la API:${NC}"
echo -e "node check-api-status.js"
echo -e "${BLUE}Para verificar la base de datos:${NC}"
echo -e "railway run node verify-database.js\n"
