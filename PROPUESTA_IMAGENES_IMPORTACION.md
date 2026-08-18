# 🖼️ Propuesta: manejo de imágenes de productos y carga masiva (CSV)

Hola,

Este documento propone cómo resolver dos cosas que están relacionadas y conviene definir juntas:

1. **Imágenes de productos** — hoy el frontend sube a Cloudinary y le manda la URL a la API.
2. **Carga masiva por CSV** — qué pasa cuando un mayorista con catálogo grande quiere subir cientos o miles de productos *con* sus imágenes.

Lo escribo ahora porque el recurso `Producto` todavía no tiene contrato definido (punto 1 de `ESTADO_INTEGRACION.md`). Es el momento más barato para decidirlo: una vez que haya datos cargados, cambiar el modelo de imágenes implica migración.

La idea es que sirva de base para discutir. Donde digo "propongo" es opinión, no requerimiento cerrado.

---

# 🧭 El principio que ordena todo

**El archivo binario nunca pasa por la API.**

El frontend sube el archivo directo al storage (Cloudinary / S3 / R2) y a la API le manda únicamente **referencias** (identificador + URL).

**Por qué:** si la API recibe `multipart/form-data`, hay que dimensionarla para el peor caso — timeouts, memoria, disco temporal, ancho de banda. Una importación de 2000 imágenes se convierte en 2000 requests pesados contra la API. Con upload directo al storage, la API mueve JSON de unos pocos KB y escala igual con 10 productos que con 10.000.

Esto ya es lo que hace hoy el frontend, así que **la propuesta no es cambiar ese flujo, es asegurarlo** (ver punto siguiente).

---

# 🔐 Paso 0 — Uploads firmados (base de todo lo demás)

## El problema actual

Hoy el frontend sube directo a Cloudinary. Para poder hacerlo necesita, o bien credenciales en el bundle, o bien tener habilitado *unsigned upload*. En los dos casos el resultado es el mismo: **cualquiera que abra las DevTools puede subir cualquier archivo a nuestra cuenta de Cloudinary**, sin estar logueado y sin límite. Es cuenta ajena pagando el almacenamiento.

## La solución

La API firma el upload; el frontend sube con esa firma.

```
POST /uploads/firma
Authorization: Bearer <jwt>

Request:
{
  "recurso": "producto",
  "producto_id": 123,          // opcional (puede no existir todavía)
  "content_type": "image/webp",
  "bytes": 184320
}

Response 200:
{
  "success": true,
  "data": {
    "api_key": "…",
    "timestamp": 1770000000,
    "signature": "…",
    "folder": "libremercado/dev/mayorista_7/productos",
    "public_id": "prod_123_a1b2c3",
    "upload_url": "https://api.cloudinary.com/v1_1/<cloud>/image/upload",
    "expira_en": 300
  }
}
```

Flujo completo:

1. Front pide la firma a la API.
2. Front sube el archivo a Cloudinary con esa firma (el binario no toca la API).
3. Front confirma a la API: `POST /productos/{id}/imagenes` con `{ public_id, url, orden, es_principal }`.

**Por qué así:**

* La API decide la carpeta, el `public_id`, el tamaño y los formatos permitidos. Nada de eso queda en manos del cliente.
* La firma vence (5 min) y sirve para un solo archivo.
* Sólo un usuario autenticado y con permiso sobre ese mayorista puede subir.
* No hay credenciales de Cloudinary en el bundle del frontend.
* Como la API generó el `public_id`, sabe qué archivo esperar y puede detectar uploads huérfanos.

Este endpoint es poco trabajo y **desbloquea todo el resto** (la carga individual, el CSV y el ZIP usan el mismo mecanismo). Propongo empezar por acá.

---

# 🗄️ Modelo de datos propuesto

Tabla aparte, **no** una columna `imagen_url` en `productos`:

```sql
producto_imagenes
  id             PK
  producto_id    FK → productos.id
  public_id      varchar   -- identificador en Cloudinary
  url            varchar   -- URL base, SIN transformaciones
  orden          int
  es_principal   bool
  estado         enum('pendiente','ok','error')
  error_detalle  text NULL
  created_at
```

Tres decisiones y su motivo:

**1. Tabla separada, no columna.** Muy probablemente en algún momento se pidan varias fotos por producto (galería). Si hoy es una columna, ese día hay que migrar datos en producción. La tabla desde el arranque no cuesta más y evita la migración.

**2. Guardar `public_id`, no sólo la URL.** Sin el `public_id` no se puede borrar ni transformar la imagen en Cloudinary más adelante. Si sólo guardamos la URL, cada producto borrado o cada imagen reemplazada deja un archivo huérfano que queda facturando para siempre y no hay forma programática de limpiarlo.

**3. Una sola URL base, sin transformaciones.** Los tamaños se piden desde el front (`w_400,q_auto,f_auto`), que es exactamente para lo que sirve Cloudinary. Si guardamos 3 o 4 URLs con tamaños fijos, el día que haga falta un tamaño nuevo hay que reprocesar la tabla entera.

El campo `estado` es el que permite la carga asíncrona: el producto se crea con la imagen en `pendiente` y un worker la completa después. El frontend puede mostrar un placeholder mientras tanto.

---

# 📥 La carga masiva: tres opciones

No son excluyentes. Propongo implementarlas en este orden, pero la decisión de cuáles entran es conjunta.

## Opción A — CSV con columna `imagen_url` ⭐ (la que más cubre)

El CSV trae una columna con la URL donde la imagen **ya está publicada**. El backend la descarga y la sube a Cloudinary.

```csv
sku,nombre,descripcion,rubro_id,precio,stock,unidad_medida,imagen_url
SKU-1001,Yerba 1kg,Yerba con palo,3,4500.00,120,unidad,https://sitio-del-mayorista.com/img/1001.jpg
SKU-1002,Azúcar 1kg,Azúcar común,3,1200.00,300,unidad,https://sitio-del-mayorista.com/img/1002.jpg|https://sitio-del-mayorista.com/img/1002b.jpg
```

Varias imágenes separadas por `|` → la primera es la principal.

**Por qué es la opción que más casos resuelve:** una empresa que "ya tiene mucho cargado" **ya tiene las fotos publicadas en algún lado** — su web actual, su ERP, su catálogo online, un Drive. Nadie va a volver a subir 3000 archivos a mano. Sólo tienen que agregar una columna a un export que ya generan.

**Por qué el backend y no el frontend:** son N descargas + N uploads. Hacerlo desde el browser significa que el usuario tiene que dejar la pestaña abierta 40 minutos y que un corte de red arruina la mitad. Desde un worker hay reintentos, backoff y continuidad. Además Cloudinary acepta directamente una URL remota como origen del upload, así que el worker es casi trivial: no hace falta ni bajar el archivo a disco.

### ⚠️ Seguridad: esto es SSRF y hay que blindarlo

Que el servidor haga requests a URLs que manda el usuario es un vector de SSRF. Antes de cada descarga:

* Sólo esquemas `http` y `https` (bloquear `file://`, `gopher://`, `ftp://`).
* Resolver el DNS y **rechazar IPs privadas, loopback y link-local**. En particular `169.254.169.254`, que es el endpoint de metadata de las nubes: por ahí se filtran credenciales del servidor.
* Revalidar la IP en **cada redirect** (máximo 3–5 redirects), no sólo en la URL original — si no, un redirect a `127.0.0.1` pasa el filtro.
* Timeout por descarga y límite de bytes (cortar el stream al superarlo, no confiar en `Content-Length`).
* Validar que sea imagen por **magic bytes**, no por el `Content-Type` que declara el servidor remoto.

---

## Opción B — ZIP con las imágenes + CSV que las referencia por nombre

El usuario sube un ZIP con las fotos y el CSV referencia el nombre del archivo:

```csv
sku,nombre,precio,stock,imagen_archivo
SKU-1001,Yerba 1kg,4500.00,120,SKU-1001.jpg
SKU-1002,Azúcar 1kg,1200.00,300,SKU-1002.jpg
```

Convención para galería: `SKU-1001.jpg` (principal), `SKU-1001_2.jpg`, `SKU-1001_3.jpg`.

El ZIP **también va directo al storage** con URL firmada (S3/R2, o Cloudinary como `raw`), nunca por la API. El front sube el ZIP, le pasa el identificador a la API, y un worker lo descomprime y procesa.

**Por qué sirve:** es el caso pyme más común — una carpeta de fotos exportada del ERP donde los archivos ya se llaman como el código de producto. No requiere que las imágenes estén publicadas en internet (a diferencia de la opción A).

### 🔑 Regla no negociable: el match es por SKU, nunca por posición

Nada de "la primera imagen del ZIP va a la primera fila del CSV". Si alguien reordena o filtra el CSV, 800 productos quedan con la foto de otro producto y **nadie se entera hasta que un cliente reclama**. El nombre del archivo tiene que contener el SKU.

### ⚠️ Seguridad del ZIP

* **Zip bomb:** limitar tamaño descomprimido total, cantidad de entradas, y ratio de compresión.
* **Zip slip / path traversal:** sanitizar las rutas internas. Una entrada llamada `../../etc/cron.d/x` escribe fuera del directorio de extracción si se extrae ingenuamente.
* Ignorar subdirectorios y basura de macOS (`__MACOSX`, `.DS_Store`).
* Validar cada entrada por magic bytes.

---

## Opción C — Completar imágenes después, desde la UI

El CSV crea los productos sin imagen. Después, en el panel, hay una vista **"Productos sin imagen (247)"**: una grilla donde el usuario arrastra fotos y el frontend las sube con URLs firmadas, con concurrencia limitada (6–8 en paralelo, no 247 requests simultáneos).

**Por qué esto tiene que existir igual, elijamos lo que elijamos:** siempre van a faltar imágenes, siempre va a haber una URL caída o un nombre mal escrito en el ZIP. Sin esta pantalla, el único arreglo posible es reimportar todo el CSV. Es la red de seguridad de las otras dos opciones, y es 100% frontend + el endpoint de firma del Paso 0.

---

# ⚙️ El punto más importante: la importación es un proceso, no un request

Independientemente de la opción que elijamos, **`POST /importaciones` no debe procesar el CSV en el request**.

**Por qué:** un request sincrónico se corta por timeout del proxy o del gateway, el usuario no ve progreso y no sabe si terminó, y si falla en la fila 900 de 1200 nadie sabe qué quedó escrito en la base. Es el error clásico de las importaciones y es muy caro de arreglar después, porque obliga a rehacer el endpoint y la pantalla.

## Contrato propuesto

```
POST /importaciones
  → 202 { success: true, data: { id: 55, estado: "validando" } }

GET /importaciones/55
  → 200 {
      "success": true,
      "data": {
        "id": 55,
        "estado": "procesando",
        "total_filas": 1200,
        "procesadas": 1150,
        "ok": 1100,
        "con_error": 50,
        "imagenes_pendientes": 300
      }
    }

POST /importaciones/55/confirmar     // el usuario acepta el preview
GET  /importaciones/55/errores.csv   // filas con error, para corregir y reimportar
```

Estados: `subido → validando → preview → procesando → completado | completado_con_errores | fallido`

El frontend hace polling sobre `GET /importaciones/{id}` y muestra la barra de progreso. Si más adelante quieren agregar SSE o websockets, el contrato no cambia.

## Cuatro requisitos que hacen la diferencia

**1. Preview / dry-run antes de escribir nada.** La API valida el archivo completo y devuelve el resumen: *"1200 filas — 1150 válidas, 50 con error: fila 3 rubro_id inexistente, fila 17 precio inválido, fila 22 SKU duplicado"*. El usuario confirma recién después. Sin esto, un CSV mal armado mete 1200 productos basura que hay que borrar a mano.

**2. Idempotencia: upsert por SKU + hash del archivo.** El SKU es la clave natural del producto para el mayorista. Con upsert por SKU, reimportar el mismo CSV corregido actualiza en lugar de duplicar. Y guardando el hash del archivo, si el usuario le da dos veces al botón se detecta que es la misma importación. **Esto es lo que hace que reintentar sea seguro — y sin reintentos seguros no existe carga masiva confiable.**

**3. Errores por fila, no todo-o-nada.** Que 3 filas malas no tiren abajo 1197 buenas. Con el CSV de errores descargable, el usuario corrige sólo esas 3 y las reimporta (y por el punto 2, eso no duplica nada).

**4. Las imágenes se procesan aparte de los productos.** El CSV crea/actualiza los productos rápido y encola un job por imagen. Así el usuario ve su catálogo cargado en segundos y las fotos van apareciendo. Si una imagen falla, el producto **igual existe** — queda con `estado = 'error'` y se resuelve desde la vista de la Opción C. Acoplarlas significaría que una URL caída impide crear el producto, que es lo que menos queremos.

---

# 🧩 División de responsabilidades

| | Frontend | API / Backend |
|---|---|---|
| Binarios | Sube directo al storage | Nunca los recibe |
| Credenciales de storage | No las tiene | Las tiene y firma uploads |
| CSV / ZIP | Sube al storage, avisa el identificador | Valida, procesa asincrónico |
| Progreso | Poll a `GET /importaciones/{id}` | Expone estado y contadores |
| Borrado en Cloudinary | Nunca | Único autorizado (usa `public_id`) |
| Validación | UX / feedback temprano | **Autoritativa** |

Igual que con el control de acceso por roles: lo que valida el frontend es experiencia de usuario, la validación que cuenta es la de la API.

---

# 🚦 Plan por fases propuesto

**Fase 1 — Base** (poco trabajo, desbloquea todo)
* `POST /uploads/firma`
* Tabla `producto_imagenes` + `POST/DELETE /productos/{id}/imagenes`
* Contrato del recurso `Producto` cerrado (con `sku` como clave natural)

Con esto ya funciona la carga individual y salen las credenciales del frontend.

**Fase 2 — CSV asíncrono con Opción A**
* `POST /importaciones` + `GET /importaciones/{id}` + preview + confirmar
* Worker de imágenes desde `imagen_url` (con las validaciones anti-SSRF)
* Upsert por SKU

Cubre la mayoría del caso "empresa con catálogo existente".

**Fase 3 — Cobertura completa**
* Opción B (ZIP con match por SKU)
* Opción C (vista "productos sin imagen") — casi todo frontend

---

# ❓ Lo que necesitamos definir juntos

1. ¿`sku` va como campo obligatorio y único por mayorista en `Producto`? La carga masiva idempotente depende de eso.
2. ¿Cloudinary se mantiene como storage único, o el ZIP y los CSV van a S3/R2? (Cloudinary sirve para los dos, pero conviene decidirlo antes de la Fase 2.)
3. ¿Hay infraestructura de jobs/colas disponible en el stack del backend, o hay que resolver el procesamiento asíncrono de otra forma? Esto condiciona bastante la Fase 2.
4. ¿Límites por importación? Propongo definir un máximo de filas y de tamaño de archivo desde el arranque, y que la API los exponga para que el frontend valide antes de subir.
5. Cantidad máxima de imágenes por producto (propongo 5–8) y tamaño máximo por archivo.

Cualquier punto que no cierre, lo discutimos. La única parte que sugiero no dejar para después es el Paso 0 y el modelo de datos: son los dos que obligan a migrar si se cambian más adelante.
