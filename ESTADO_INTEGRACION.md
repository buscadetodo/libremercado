# 📨 Asunto: Estado de integración Frontend + Requerimientos pendientes para la API

Hola equipo,

Terminamos una nueva ronda de integración del frontend contra el ambiente **DEV** (`libremercadodev.daelsoft.com`).

En líneas generales la integración viene muy bien y ya pudimos conectar la mayor parte de la aplicación con la API real. A continuación les compartimos el estado actual del frontend y los puntos pendientes que necesitamos del backend para continuar.

---

# ✅ Estado actual del Frontend

Todos los cambios realizados corresponden exclusivamente al frontend (**React**) y fueron probados correctamente contra la API de desarrollo.

La aplicación compila sin errores y se verificó su funcionamiento mediante `docker-compose`.

## 🎨 Interfaz y experiencia de usuario

* Se rediseñó completamente el Dashboard con el nuevo estilo visual ("Dashboard 2.0"), incorporando:

  * Header blanco con identidad visual.
  * Sidebar oscuro.
  * Hero principal con gradiente.
  * Cards y componentes unificados.

* Se implementó una barra de progreso del perfil que ahora calcula un porcentaje real según la información completada por el usuario (nombre, apellido, DNI, email, email verificado y perfil asignado).

* Se eliminó la restricción de ancho del contenido para aprovechar mejor el espacio disponible en pantallas grandes.

* Se rediseñó completamente la pantalla **Agregar Perfil**, reemplazando el diseño heredado del login por una vista integrada al panel con:

  * selección mediante cards,
  * formulario en grilla,
  * mejoras de accesibilidad y usabilidad.

* Se mejoró la visualización de las cards de **Explorar Mayoristas**, unificando alturas y manteniendo los botones alineados correctamente.

---

## 🔐 Autenticación y manejo de sesión

* Se implementó un **AuthContext** compartido para centralizar el estado de autenticación.

* El hook `useAuth` ahora expone automáticamente la información del usuario (`id`, `email`, `id_rol`) decodificando el JWT.

* Se restauró el funcionamiento de `PerfilContext` y `PerfilSelector`, que anteriormente no detectaban correctamente el login hasta recargar la página.

---

## 🐛 Correcciones realizadas

Se corrigieron distintos problemas detectados durante la integración:

* Corrección de la redirección posterior al login.
* Corrección de la lectura de respuestas provenientes de la API (`{ success, data }`).
* Corrección de los IDs de perfiles utilizados durante el alta de usuarios.
* Implementación de la pantalla y ruta de detalle de mayoristas, evitando pantallas en blanco.

---

## 👥 Control de acceso (Frontend)

Se implementó control de acceso a nivel de interfaz:

* Rutas exclusivas para administradores mediante `PrivateRoute`.
* Sidebar y Navbar dinámicos según el rol.
* Acciones de crear, editar y eliminar visibles únicamente para administradores.

> **Importante:** este control es únicamente visual (UX). La seguridad definitiva debe implementarse en la API mediante validación de permisos.

---

## 🚀 Flujo de registro

El proceso de alta ahora incluye la selección y creación del perfil correspondiente:

* Mayorista
* Minorista
* Comprador
* Transportista

De esta manera los usuarios ya no quedan registrados sin un perfil asociado.

---

## 🏪 Home conectado con la API

La pantalla principal ya consume datos reales del backend.

Actualmente muestra:

* Razón social.
* Rubro.
* Pedido mínimo.
* Retiro en local.

Además incorpora:

* Estados de carga.
* Estado vacío.
* Buscador.
* Filtro por rubros obtenidos desde la API.

Se eliminó la información ficticia de ubicación y distancia, ya que actualmente esos datos no existen en el backend.

---

## 📦 Productos (integrado ✅)

El módulo **Productos** quedó integrado contra el CRUD real de `/productos/`. El feature flag `FEATURE_PRODUCTOS` ya está en `true` (se mantiene solo como interruptor de emergencia por ambiente).

Lo que se implementó siguiendo el contrato:

* **Un solo oferente por producto.** El formulario envía `mayorista_id` **o** `minorista_id`, nunca los dos, evitando el 422.
* **Selector de comercio limitado a los comercios del usuario.** Antes el formulario listaba todos los mayoristas, lo que llevaba directo al 403 "No autorizado para este mayorista". Ahora se resuelven los comercios propios con `GET /mayoristas/?id_usuario=` y `GET /minorista/?id_usuario=`. El administrador sigue viendo todos.
* **`sku`** incorporado como campo obligatorio del alta y visible en el listado.
* **`imagen_url`** incorporado, con vista previa en el formulario y degradación a placeholder si la URL está caída.
* **`unidad_medida` eliminado** del formulario: no existe en el contrato.
* **Errores mapeados** a mensajes entendibles (403 comercio ajeno, 404 comercio inexistente, 422 validación).
* **Acciones de editar/eliminar** visibles solo sobre productos de un comercio propio (o todos, si es administrador).
* **Catálogo del mayorista** en su pantalla de detalle, resuelto con `GET /productos/?mayorista_id=`.
* **Productos destacados del Home** ahora con datos reales (nombre, precio, rubro, stock) en lugar de los datos de muestra.

---

# 🔄 Pendientes para continuar la integración

## 1. Endpoints de Productos ✅ RESUELTO

El CRUD de `/productos/` ya está publicado y el frontend lo consume. Gracias.

Dos aclaraciones sobre el contrato, para que quede registrado:

* **No existe `GET /mayoristas/{id}/productos/`.** No hace falta: lo resolvimos con `GET /productos/?mayorista_id=`. Lo dejamos anotado para que nadie lo espere.
* **`unidad_medida` no existe** en el recurso. Lo teníamos en el formulario y lo quitamos. Si en algún momento se agrega, avisen y lo reincorporamos.

### Consultas abiertas sobre Producto

1. **¿`sku` es obligatorio y único por comercio?** Lo estamos enviando siempre como obligatorio. Necesitamos saber si la API valida unicidad, porque de eso depende que una carga masiva idempotente sea posible más adelante (ver `PROPUESTA_IMAGENES_IMPORTACION.md`).
2. **¿Hay un endpoint público de productos?** Hoy `GET /productos/` exige token, así que el landing para visitantes sin sesión no puede mostrar productos reales. Si el catálogo debe ser visible sin login (que es lo habitual en un marketplace), necesitaríamos que el listado y el detalle sean públicos.
3. **`precio` viene como string** (`"4500.00"`) y lo enviamos como número. Confirmar que está bien así.

### Catálogos públicos (afecta al registro) 🔴

`GET /rubros/`, `GET /dias/` y `GET /horarios/` requieren token. El problema es el **formulario de registro**: pide los datos del comercio *antes* de que el usuario exista, así que no puede poblar esos selects.

Hoy lo resolvimos así: el rubro se elige de una lista fija en el registro, y los horarios/días **no se piden** — se resuelven después del login automático con un valor inicial (Lunes a Viernes de 08:00 a 18:00) que el usuario ajusta luego desde su panel.

Si esos tres catálogos fueran públicos (son datos de referencia, no información sensible), el registro podría mostrar los rubros reales y pedir el horario en el momento correcto.

---

## 2. Paginación 🔴 (sigue pendiente y ahora pega más fuerte)

Los endpoints de listado (`/productos/`, `/mayoristas/`, `/users/`, etc.) devuelven únicamente:

```json
{
  "success": true,
  "data": [...]
}
```

Sin el total de registros no se puede calcular la cantidad de páginas. En Productos lo resolvimos pidiendo un ítem extra (`limit + 1`) para saber si existe página siguiente, así que por ahora hay solo botones **Anterior / Siguiente**, sin numeración ni "página 3 de 12".

Con esto alcanza para volver a la paginación numerada:

```json
{
  "success": true,
  "data": [...],
  "total": 128,
  "limit": 10,
  "offset": 0
}
```

---

## 3. Autorización por Roles 🔒

Actualmente cualquier usuario autenticado puede acceder a endpoints administrativos.

Ejemplo:

* Usuario con `id_rol = 2`
* Acceso a `GET /users/`
* La API responde correctamente.

Necesitamos que el backend valide permisos y responda **403 Forbidden** cuando corresponda.

---

## 4. Ubicación / Geolocalización

Actualmente Mayoristas (y Minoristas) no poseen información de ubicación.

Para implementar búsqueda por cercanía y filtros geográficos sería ideal incorporar:

* Dirección.
* Ciudad.
* Provincia.
* Código Postal.
* Latitud.
* Longitud.

Y permitir filtros en:

`GET /mayoristas/`

como por ejemplo:

* ciudad,
* provincia,
* código postal,
* distancia,
* coordenadas.

---

## 5. Imágenes de producto y carga masiva

El recurso `Producto` quedó con una única columna `imagen_url`, y así lo integramos: el formulario acepta una sola imagen por producto.

Dos cosas a definir, detalladas en `PROPUESTA_IMAGENES_IMPORTACION.md`:

* **Upload firmado (`POST /uploads/firma`).** Hoy el frontend sube directo a Cloudinary, lo que obliga a tener credenciales o *unsigned upload* expuestos en el bundle. Es el punto que más urge del documento.
* **Galería y carga masiva.** Si en algún momento se piden varias fotos por producto o una importación CSV de catálogos grandes, conviene decidirlo antes de que haya datos cargados: con `imagen_url` como columna, ese cambio implica migración.

Mientras eso se define, el frontend funciona con `imagen_url` sin bloqueos.

---

## 6. Documentación

A medida que se publiquen nuevos endpoints nos sería de mucha ayuda contar con la documentación (Swagger/OpenAPI o similar) para reducir tiempos de integración.

La colección de Postman con los **Examples** de respuesta (OK y errores) nos resultó muy útil para integrar Productos sin ida y vuelta. Si se mantiene ese formato para lo que venga, alcanza perfectamente.

---

# Información ya validada

### Roles

* `1` → Administrador
* `2` → Usuario

### Perfiles

* `1` → Mayorista
* `2` → Minorista
* `3` → Transportista
* `4` → Comprador

El endpoint:

`GET /usuario-perfiles/{id}`

devuelve correctamente:

```json
[
  {
    "id_usuario": 1,
    "id_perfil": 4,
    "perfil": "comprador"
  }
]
```

Actualmente el frontend utiliza el campo `perfil` para mostrar la información correspondiente.

---

# Datos de prueba

En el ambiente DEV dejamos algunos registros para facilitar las pruebas:

* Mayorista **Distribuidora Demo** (`id = 1`).
* Perfil **Comprador** asignado al usuario de prueba (`id = 1`).

Si prefieren mantener el ambiente limpio, nos avisan y los eliminamos.

---

Con este estado, el frontend quedó completo y conectado a la API, incluido el módulo de Productos, que era el bloqueante principal.

Los pendientes que quedan son todos del lado del backend y ninguno bloquea el uso de la aplicación:

| Pendiente | Impacto hoy |
|---|---|
| `total` en los listados | Paginación sin numeración (solo Anterior/Siguiente) |
| Autorización por roles | El control es solo visual; la API no responde 403 |
| Productos públicos (sin token) | El landing para visitantes no puede mostrar catálogo real |
| Unicidad de `sku` | Condiciona una futura importación masiva idempotente |
| `POST /uploads/firma` | Credenciales de Cloudinary expuestas en el frontend |
| Catálogos públicos (rubros/días/horarios) | El registro no puede mostrar los rubros reales |
| Ubicación / geolocalización | Sin búsqueda por cercanía |
