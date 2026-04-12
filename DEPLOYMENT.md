# Guía de Deployment en Render

## 📋 Preparación

Tu proyecto ya está configurado para Render con:
- ✅ `Dockerfile.prod` - Build multi-stage optimizado
- ✅ `nginx.conf` - Configuración de Nginx para SPA
- ✅ `render.yaml` - Configuración Infrastructure as Code
- ✅ Variables de entorno configurables

## 🚀 Pasos para Deployar

### Opción 1: Usando render.yaml (Recomendado)

1. **Sube tu código a GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Preparado para Render deployment"
   git push origin main
   ```

2. **Crea una cuenta en Render**
   - Ve a https://render.com
   - Crea una cuenta (puede ser con GitHub)

3. **Conecta tu repositorio**
   - En el Dashboard de Render, haz clic en **"New +"** → **"Blueprint"**
   - Conecta tu repositorio de GitHub/GitLab
   - Render detectará automáticamente el archivo `render.yaml`

4. **Configura las variables de entorno**
   - En la configuración del servicio, ve a **"Environment"**
   - Agrega:
     ```
     REACT_APP_API_URL=https://libremercadodev.daelsoft.com
     NODE_ENV=production
     ```

5. **Deploy automático**
   - Render comenzará a construir tu aplicación automáticamente
   - El proceso tomará unos 5-10 minutos la primera vez

### Opción 2: Deployment Manual (Sin render.yaml)

1. **Ve a Render Dashboard**
   - Haz clic en **"New +"** → **"Web Service"**

2. **Conecta tu repositorio**
   - Selecciona tu repositorio
   - Configura:
     - **Name**: `libremercado-frontend`
     - **Runtime**: Docker
     - **Dockerfile Path**: `./Dockerfile.prod`
     - **Region**: Ohio (o el más cercano)
     - **Plan**: Free

3. **Variables de entorno**
   - Agrega `REACT_APP_API_URL` con el valor de tu API

4. **Crear servicio**
   - Haz clic en "Create Web Service"

## 🔧 Configuración Avanzada

### Dominios Personalizados

1. En Render Dashboard, ve a tu servicio
2. Pestaña **"Settings"** → **"Custom Domain"**
3. Agrega tu dominio y configura los DNS según las instrucciones

### Auto-Deploy desde Git

Render despliega automáticamente cuando haces push a tu rama principal:
```bash
git push origin main  # Trigger automático de deploy
```

### Health Checks

El archivo `render.yaml` ya incluye un health check en `/`. 
Nginx responderá con tu index.html.

## 📊 Monitoreo

- **Logs en tiempo real**: Pestaña "Logs" en Render Dashboard
- **Métricas**: Pestaña "Metrics" (CPU, memoria, requests)
- **Eventos**: Pestaña "Events" (historial de deployments)

## 🆓 Plan Free - Limitaciones

- ✅ SSL/HTTPS gratis
- ✅ 750 horas/mes
- ✅ Deploy automático desde Git
- ⚠️ La instancia se "duerme" después de 15 min de inactividad
- ⚠️ Restart en ~30 segundos al recibir tráfico

### Upgrade a Plan Starter ($7/mes)
- Sin "sleep" automático
- Más recursos (RAM/CPU)
- Soporte prioritario

## 🐛 Troubleshooting

### Build falla
```bash
# Verifica localmente con Docker
docker build -f Dockerfile.prod -t libremercado-test .
docker run -p 8080:80 libremercado-test
```

### Variables de entorno no funcionan
- Asegúrate de que empiecen con `REACT_APP_`
- Re-deploya después de agregarlas

### Rutas de React no funcionan (404)
- El `nginx.conf` ya está configurado para SPA
- Verifica que el archivo esté siendo copiado correctamente en Dockerfile

## 🔗 URLs Útiles

- Dashboard: https://dashboard.render.com
- Documentación: https://render.com/docs
- Status: https://status.render.com

## 📝 Después del Deployment

Tu aplicación estará disponible en:
```
https://libremercado-frontend.onrender.com
```

Puedes configurar un dominio personalizado gratis.

## 🔄 Cambiar URL de API

Si necesitas cambiar la URL de la API en producción:

1. Ve a tu servicio en Render Dashboard
2. Pestaña **"Environment"**
3. Edita `REACT_APP_API_URL`
4. El servicio se re-deployará automáticamente

---

¿Tienes preguntas? Consulta la [documentación oficial de Render](https://render.com/docs)
