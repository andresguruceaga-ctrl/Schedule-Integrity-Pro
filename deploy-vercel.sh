#!/bin/bash

# Script de despliegue para Schedule Integrity Pro
# Este script prepara y despliega la aplicación en Vercel

echo "🚀 Preparando despliegue de Schedule Integrity Pro..."
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar si Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI no encontrado. Instalando...${NC}"
    npm install -g vercel
fi

# Ir al directorio del proyecto
cd /mnt/okcomputer/output/app

echo -e "${BLUE}📦 Construyendo aplicación...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "❌ Error en la construcción"
    exit 1
fi

echo -e "${GREEN}✅ Construcción exitosa!${NC}"
echo ""

echo -e "${BLUE}🌐 Desplegando en Vercel...${NC}"
echo -e "${YELLOW}💡 Si es tu primera vez, se te pedirá autenticarte${NC}"
echo ""

# Desplegar
vercel --prod dist

echo ""
echo -e "${GREEN}✅ Despliegue completado!${NC}"
echo -e "${BLUE}📝 Tu aplicación estará disponible en la URL proporcionada${NC}"
