# LibreMercado - Aplicación React Dockerizada

Aplicación web React completamente dockerizada con entornos de desarrollo y producción optimizados.

## 🚀 Características

- ⚛️ React 18
- 🐳 Docker para desarrollo y producción
- 🔥 Hot reload en desarrollo
- 🚀 Build optimizado con multi-stage
- 🌐 Nginx para servir estáticos en producción
- 📦 Escalable y modular

## 📁 Estructura del Proyecto

```
libremercado/
├── src/
│   ├── api/                # Cliente HTTP (Axios)
│   ├── components/         # Componentes reutilizables
│   ├── hooks/              # Custom hooks
│   ├── pages/              # Páginas de la aplicación
│   ├── services/           # Servicios de API
│   ├── App.js              # Componente principal
│   └── index.js            # Punto de entrada
├── public/
│   └── index.html          # HTML base
├── Dockerfile.dev          # Dockerfile para desarrollo
├── Dockerfile.prod         # Dockerfile para producción
├── docker-compose.yml      # Orquestación de servicios
├── nginx.conf              # Configuración de Nginx
├── render.yaml             # Configuración para Render
├── DEPLOYMENT.md           # Guía de deployment
├── .env.example            # Variables de entorno ejemplo
└── package.json            # Dependencias del proyecto
```

## 🛠️ Requisitos

- Docker
- Docker Compose

## 🔧 Instalación y Uso

### Desarrollo (con hot reload)

```bash
# Levantar el entorno de desarrollo
docker-compose up frontend-dev

# O en segundo plano
docker-compose up -d frontend-dev
```

La aplicación estará disponible en: http://localhost:3000

**Características del entorno de desarrollo:**
- Hot reload habilitado
- Volúmenes montados para cambios en tiempo real
- Polling activado para compatibilidad con Windows/Docker

### Producción (con Nginx)

```bash
# Construir y levantar el entorno de producción
docker-compose up --build frontend-prod

# O en segundo plano
docker-compose up -d --build frontend-prod
```

La aplicación estará disponible en: http://localhost:8080

**Características del entorno de producción:**
- Build optimizado y minificado
- Servido con Nginx
- Imagen liviana basada en Alpine
- Headers de seguridad configurados
- Compresión gzip habilitada
- Caching de archivos estáticos

## 📦 Escalabilidad

Para levantar múltiples instancias de producción:

```bash
docker-compose up -d --scale frontend-prod=3
```

**Nota:** Para balanceo de carga entre instancias, necesitarás configurar un load balancer (nginx, traefik, etc.).

## 🐳 Comandos Docker Útiles

### Ver contenedores activos
```bash
docker-compose ps
```

### Ver logs
```bash
# Desarrollo
docker-compose logs -f frontend-dev

# Producción
docker-compose logs -f frontend-prod
```

### Detener servicios
```bash
docker-compose down
```

### Reconstruir imágenes
```bash
docker-compose build --no-cache
```

### Limpiar todo
```bash
docker-compose down -v --rmi all
```

## 🔨 Build Manual

### Desarrollo
```bash
docker build -f Dockerfile.dev -t libremercado-dev .
docker run -p 3000:3000 -v ${PWD}/src:/app/src libremercado-dev
```

### Producción
```bash
docker build -f Dockerfile.prod -t libremercado-prod .
docker run -p 8080:80 libremercado-prod
```

## 📝 Variables de Entorno

Copia el archivo `.env.example` a `.env` y configura las variables:

```bash
cp .env.example .env
```

Variables disponibles:
```env
REACT_APP_API_URL=https://api.tudominio.com
NODE_ENV=production
```

**Nota:** Las variables deben empezar con `REACT_APP_` para estar disponibles en React.

## ☁️ Deployment en Render

Este proyecto está pre-configurado para deployar en Render. Consulta la guía completa en [DEPLOYMENT.md](DEPLOYMENT.md).

**Inicio rápido:**
1. Sube tu código a GitHub
2. Crea una cuenta en [Render](https://render.com)
3. Conecta tu repositorio (Render detectará `render.yaml`)
4. Configura `REACT_APP_API_URL` en variables de entorno
5. ¡Deploy automático!

Tu app estará disponible en `https://tu-app.onrender.com` con SSL gratis.

## 🎨 Personalización

### Modificar estilos
Edita los archivos en `src/`:
- `App.css` - Estilos del componente principal
- `index.css` - Estilos globales

### Agregar dependencias
```bash
# Localmente
npm install <paquete>

# Reconstruir contenedor
docker-compose build frontend-dev
```

### Configurar Nginx
Edita `nginx.conf` y reconstruye la imagen de producción:
```bash
docker-compose build frontend-prod
```

## 🔒 Seguridad

La configuración de Nginx incluye:
- Headers de seguridad (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)
- Ocultamiento de versión del servidor
- Compresión gzip
- Caching inteligente

## 🚀 Despliegue

### Docker Hub
```bash
# Tag de la imagen
docker tag libremercado-prod usuario/libremercado:latest

# Push a Docker Hub
docker push usuario/libremercado:latest
```
### Kubernetes
Puedes usar la imagen de producción para crear deployments en Kubernetes con múltiples réplicas.

**Hecho con React y Docker**
