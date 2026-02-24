# 🚀 Guía de Despliegue - Schedule Integrity Pro

Esta guía te explica cómo publicar tu aplicación web en diferentes plataformas.

---

## 📁 Estructura del Proyecto

Después de construir (`npm run build`), tu aplicación está en:
```
/mnt/okcomputer/output/app/dist/
├── index.html          # Punto de entrada
├── assets/
│   ├── index-xxx.js    # JavaScript compilado
│   └── index-xxx.css   # Estilos compilados
```

**Solo necesitas la carpeta `dist/` para desplegar.**

---

## 🥇 Opción 1: Vercel (Recomendada)

### Paso 1: Crear cuenta
1. Ve a [vercel.com](https://vercel.com)
2. Regístrate con GitHub, GitLab o email

### Paso 2: Instalar Vercel CLI
```bash
npm install -g vercel
```

### Paso 3: Desplegar
```bash
# Ir al directorio del proyecto
cd /mnt/okcomputer/output/app

# Login (solo la primera vez)
vercel login

# Desplegar
vercel --prod
```

### Paso 4: Configurar dominio personalizado (opcional)
1. En el dashboard de Vercel, selecciona tu proyecto
2. Ve a "Settings" → "Domains"
3. Agrega tu dominio personalizado

**✅ Ventajas:**
- Gratuito ilimitado para proyectos personales
- HTTPS automático
- Despliegue en segundos
- Previsualización de cambios

---

## 🥈 Opción 2: Netlify

### Método A: Drag & Drop (Más fácil)
1. Ve a [netlify.com](https://netlify.com)
2. Arrastra la carpeta `dist/` al área indicada
3. ¡Listo! Tu sitio estará online en segundos

### Método B: Netlify CLI
```bash
# Instalar CLI
npm install -g netlify-cli

# Desplegar
netlify deploy --prod --dir=/mnt/okcomputer/output/app/dist
```

### Método C: Git Integration
1. Sube tu código a GitHub
2. Conecta tu repositorio en Netlify
3. Configura:
   - Build command: `npm run build`
   - Publish directory: `dist`

---

## 🥉 Opción 3: GitHub Pages

### Paso 1: Crear repositorio
```bash
# En GitHub, crea un nuevo repositorio llamado schedule-integrity-pro
```

### Paso 2: Configurar package.json
```json
{
  "homepage": "https://TU_USUARIO.github.io/schedule-integrity-pro",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "devDependencies": {
    "gh-pages": "^6.1.0"
  }
}
```

### Paso 3: Desplegar
```bash
npm install
npm run deploy
```

---

## 🌐 Opción 4: Firebase Hosting

### Paso 1: Instalar Firebase CLI
```bash
npm install -g firebase-tools
```

### Paso 2: Inicializar proyecto
```bash
cd /mnt/okcomputer/output/app

firebase login
firebase init hosting
```

**Configuración:**
- ¿Seleccionar proyecto? → "Create a new project"
- ¿Public directory? → `dist`
- ¿Single-page app? → `Yes`
- ¿GitHub workflows? → Opcional

### Paso 3: Desplegar
```bash
firebase deploy
```

---

## ☁️ Opción 5: Cloudflare Pages

### Paso 1: Sube código a Git
```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

### Paso 2: Conectar en Cloudflare
1. Ve a [pages.cloudflare.com](https://pages.cloudflare.com)
2. "Create a project" → "Connect to Git"
3. Selecciona tu repositorio
4. Configuración:
   - Framework preset: `Create React App`
   - Build command: `npm run build`
   - Build output directory: `dist`

---

## 🏢 Opción 6: AWS S3 + CloudFront (Empresarial)

### Paso 1: Crear bucket S3
```bash
aws s3 mb s3://schedule-integrity-pro --region us-east-1
```

### Paso 2: Configurar bucket para hosting estático
```bash
# Política del bucket
aws s3api put-bucket-policy --bucket schedule-integrity-pro --policy '{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::schedule-integrity-pro/*"
  }]
}'
```

### Paso 3: Subir archivos
```bash
aws s3 sync /mnt/okcomputer/output/app/dist s3://schedule-integrity-pro \
  --acl public-read \
  --cache-control "max-age=31536000"
```

### Paso 4: Configurar CloudFront (CDN)
1. Ve a AWS Console → CloudFront
2. "Create Distribution"
3. Origin domain: `schedule-integrity-pro.s3.amazonaws.com`
4. Habilitar HTTPS con certificado gratuito

---

## 🔧 Configuración de Dominio Personalizado

### Para cualquier plataforma:

1. **Compra tu dominio** en:
   - Namecheap
   - GoDaddy
   - Google Domains
   - Cloudflare

2. **Configura DNS:**
   - Tipo: `CNAME`
   - Nombre: `www` o `@`
   - Valor: URL de tu app (ej: `cname.vercel-dns.com`)

3. **En la plataforma:**
   - Agrega el dominio en la configuración
   - Verifica la propiedad (generalmente con registro TXT)

---

## 📊 Comparación de Plataformas

| Plataforma | Precio | HTTPS | CDN | Dominio Personalizado | Dificultad |
|------------|--------|-------|-----|----------------------|------------|
| **Vercel** | Gratis | ✅ | ✅ | ✅ | ⭐ Fácil |
| **Netlify** | Gratis | ✅ | ✅ | ✅ | ⭐ Fácil |
| **GitHub Pages** | Gratis | ✅ | ✅ | ✅ | ⭐⭐ Medio |
| **Firebase** | Gratis | ✅ | ✅ | ✅ | ⭐⭐ Medio |
| **Cloudflare** | Gratis | ✅ | ✅✅✅ | ✅ | ⭐⭐ Medio |
| **AWS S3** | ~$1/mes | ✅ | ✅✅✅ | ✅ | ⭐⭐⭐ Difícil |

---

## 🚀 Despliegue Rápido (Script Automatizado)

He creado un script para Vercel:

```bash
# Dar permisos de ejecución
chmod +x /mnt/okcomputer/output/deploy-vercel.sh

# Ejecutar
/mnt/okcomputer/output/deploy-vercel.sh
```

---

## ✅ Checklist Pre-Despliegue

Antes de publicar, verifica:

- [ ] `npm run build` se ejecuta sin errores
- [ ] La carpeta `dist/` contiene `index.html`
- [ ] Has probado la app localmente (`npm run dev`)
- [ ] Configuraste las variables de entorno (si aplica)
- [ ] Has optimizado imágenes y assets

---

## 🆘 Solución de Problemas

### Error: "command not found: vercel"
```bash
npm install -g vercel
# o
npx vercel
```

### Error: "Build failed"
```bash
# Verificar errores de TypeScript
npm run build 2>&1 | head -50
```

### Error: "404 Not Found" en rutas
- Asegúrate de que el servidor esté configurado para SPA (Single Page Application)
- En Netlify: crea `_redirects` con `/* /index.html 200`
- En Vercel: configura `vercel.json` con rewrites

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs de build en la plataforma
2. Consulta la documentación oficial
3. Verifica que `dist/index.html` exista

---

**¡Tu aplicación está lista para el mundo! 🌍**
