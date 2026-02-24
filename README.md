# Schedule Integrity Pro

Aplicación web profesional para verificación de integridad de cronogramas de proyectos según las mejores prácticas de planificación.

![Schedule Integrity Pro](https://img.shields.io/badge/Schedule%20Integrity%20Pro-v1.0-blue)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-06B6D4?logo=tailwindcss)

## ✨ Características

- **25+ Criterios Configurables** - Personaliza cada aspecto del análisis
- **8 Categorías de Análisis** - Cobertura completa de integridad de cronogramas
- **Múltiples Formatos** - Soporte para Primavera P6 (.xer) y MS Project (.xml)
- **Visualizaciones Avanzadas** - Gráficos de radar, barras, pastel y más
- **Comparación de Análisis** - Guarda y compara análisis históricos
- **Exportar/Importar Config** - Comparte configuraciones con tu equipo

## 🚀 Demo en Vivo

[Ver aplicación desplegada](https://wioahkl7ogjlc.ok.kimi.link)

## 📊 Categorías de Análisis

| Categoría | Peso | Descripción |
|-----------|------|-------------|
| Relaciones | 20% | Predecesores, sucesores, extremos abiertos |
| Restricciones | 15% | Duras, blandas, ALAP |
| Lógica/Red | 20% | Circulares, lag negativo |
| Duración | 10% | Cero, excesiva, inusual |
| Calendario | 10% | Asignaciones, consistencia |
| Camino Crítico | 10% | Longitud, flotante negativo |
| Calidad de Datos | 10% | Nombres, IDs, WBS |
| Progreso | 5% | Fuera de secuencia |

## 🛠️ Tecnologías

- **React 18** - Biblioteca UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **Tailwind CSS** - Estilos
- **shadcn/ui** - Componentes UI
- **Recharts** - Visualizaciones

## 📦 Instalación

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/schedule-integrity-pro.git
cd schedule-integrity-pro

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build
```

## 🌐 Despliegue

### Vercel (Recomendado)
```bash
npm install -g vercel
vercel --prod
```

### GitHub Pages
```bash
npm install --save-dev gh-pages
npm run deploy
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

## 📖 Uso

1. **Cargar Cronograma** - Importa archivos .xer (Primavera P6) o .xml (MS Project)
2. **Configurar Criterios** - Personaliza umbrales, pesos y activación
3. **Ejecutar Análisis** - Obtén resultados detallados
4. **Guardar y Comparar** - Almacena análisis para seguimiento

## 📝 Licencia

MIT License - Libre para uso personal y comercial

## 👤 Autor

Creado con ❤️ para la comunidad de planificación de proyectos
