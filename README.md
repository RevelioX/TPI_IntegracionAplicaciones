## Diagramas C4

### 1. Context Diagram
Este diagrama muestra el **entorno del sistema y sus actores externos**. Permite identificar cómo los usuarios y sistemas externos interactúan con nuestra aplicación.  
<img width="1341" height="641" alt="C4_ContextDiagram drawio" src="https://github.com/user-attachments/assets/d79532dc-adab-40af-a415-21cd7c7e4086" />

**Descripción:**  
- Usuarios finales interactúan con el sistema a través del **Dashboard** y servicios web.  
- Sistemas externos incluyen servicios de autenticación y proveedores de notificaciones.  
- Este diagrama ayuda a definir los límites y responsabilidades de nuestro sistema.

---

### 2. Container Diagram
Muestra los **contenedores del sistema**, incluyendo servicios, bases de datos y API Gateway.  
<img width="651" height="731" alt="image" src="https://github.com/user-attachments/assets/b0737440-c22b-48d3-a8b5-8283cd2a4ef6" />

**Descripción:**  
- **API Gateway**: Punto de entrada unificado para los clientes.  
- **Servicios de Pedidos y Productos**: Gestionan la lógica de negocio principal.  
- **Servicio de Notificaciones**: Gestiona alertas en tiempo real a los usuarios.  
- **Dashboard**: Interfaz visual para los usuarios.  
- **Bases de datos MongoDB**: Almacenan información de productos y pedidos.  

---

### 3. Component Diagram
Detalle interno de cada contenedor, mostrando **componentes y sus interacciones**.  
<img width="1040" height="634" alt="image" src="https://github.com/user-attachments/assets/f82e32a8-0418-4119-95ec-43d2b276f992" />

**Descripción:**  
- Cada servicio se divide en componentes internos para gestionar lógica específica:  
  - Pedidos: Gestión de ordenes, inventario y estado de pedidos.  
  - Productos: CRUD de productos, actualización de stock.  
  - Dashboard: Suscripción a eventos, visualización de datos.  
  - Notificaciones: Envío de alertas, integración con broker de mensajería.

---

## ADR — Architectural Decision Records

### 1. Comunicación entre Pedidos y Productos: **gRPC**
**Decisión:** Usar gRPC para la comunicación entre servicios de Pedidos y Productos.  
**Motivo:**  
- Comunicación **rápida y eficiente** (protocolo binario).  
- Contratos fuertemente tipados que **evitan errores de integración**.  
- Soporta **streaming** para actualizaciones en tiempo real si fuese necesario.  

### 2. Base de datos: **MongoDB**
**Decisión:** Usar MongoDB para almacenar datos de Pedidos y Productos.  
**Motivo:**  
- Datos semi-estructurados y flexibles.  
- Escalabilidad horizontal sencilla para **alto volumen de pedidos**.  
- Facilita cambios rápidos en el esquema, útil para iteraciones rápidas de desarrollo.  

### 3. Seguridad: **Auth0 en API Gateway**
**Decisión:** Integrar Auth0 para autenticación y autorización.  
**Motivo:**  
- Gestión centralizada de usuarios y roles.  
- Facilita autenticación OAuth2/JWT, cumpliendo estándares de seguridad.  
- API Gateway protege los microservicios internos y garantiza que solo clientes autenticados accedan a la información.  

### 4. Servicio de Dashboard: **WebSockets**
**Decisión:** Dashboard recibe datos en tiempo real usando WebSockets.  
**Motivo:**  
- Permite **actualizaciones instantáneas** sin polling constante.  
- Mejora la experiencia de usuario mostrando cambios de pedidos o stock al instante.  

### 5. Broker de mensajería: **Publicación y consumo de eventos**
**Decisión:** Usar un broker de mensajería entre Pedidos, Notificaciones y Dashboard.  

---

**Motivo:**  
- Desacopla servicios, evitando dependencias directas.  
- Facilita **event-driven architecture**, donde los cambios en pedidos disparan notificaciones y actualizaciones del dashboard automáticamente.  
- Mejora escalabilidad y resiliencia del sistema.  

---

## Modelo de Datos 
Se utilizaran 2 bases de datos MongoDB, por lo tanto el esquema es en documentos

### Producto
 | Campo                | Tipo     | Explicación                                                                  |
| -------------------- | -------- | ---------------------------------------------------------------------------- |
| `_id`                | ObjectId | Identificador único generado por MongoDB.                                    |
| `nombre`             | String   | Nombre del producto. Debe ser único en la colección.                         |
| `descripcion`        | String   | Descripción del producto, ingredientes o preparación.                        |
| `precio`             | Number   | Precio unitario del producto en la moneda local.                             |
| `stock`              | Number   | Cantidad disponible en inventario. Se actualiza al confirmar pedidos.        |
| `fechaCreacion`      | ISODate  | Fecha de creación del producto en la base de datos.                          |

```js
{
  "_id": ObjectId("650c2f1a1f9f1a0012345678"),
  "nombre": "Pizza Margarita",
  "descripcion": "Pizza con tomate, mozzarella y albahaca",
  "precio": 1200,
  "stock": 10,
  "categoria": "Pizza",
  "fechaCreacion": ISODate("2025-10-26T00:00:00Z"),
  "fechaActualizacion": ISODate("2025-10-26T00:00:00Z")
}
```

### Pedido

| Campo                        | Tipo             | Explicación                                                                                 |
| ---------------------------- | ---------------- | ------------------------------------------------------------------------------------------- |
| `_id`                        | ObjectId         | Identificador único del pedido.                                                             |
| `cliente`                    | String           | Información del cliente.                                                             |
| `mesa`               | Number           | Número de mesa.                                                                             |
| `productos`                  | Array de objetos | Productos pedidos. Mantiene histórico de precios y cantidad.                                |
| `productos[].productoId`     | ObjectId         | Referencia al producto original.                                                            |
| `productos[].nombre`         | String           | Nombre del producto al momento del pedido.                                                  |
| `productos[].cantidad`       | Number           | Cantidad solicitada de ese producto.                                                        |
| `productos[].precioUnitario` | Number           | Precio del producto al momento del pedido.                                                  |
| `total`                      | Number           | Total del pedido calculado al confirmarlo.                                                  |
| `estado`                     | String           | Estado del pedido: `"pendiente"`, `"confirmado"`, `"preparando"`, `"listo"`, `"entregado"`. |
| `fechaPedido`                | ISODate          | Fecha de creación del pedido.                                                               |
| `fechaActualizacion`         | ISODate          | Fecha de última modificación del pedido.                                                    |

```js
{
  "_id": ObjectId("650c2f9a1f9f1a0098765432"),
  "cliente": "Rodolfo",
  "mesa": 12,
  "productos": [
    {
      "productoId": ObjectId("650c2f1a1f9f1a0012345678"),
      "nombre": "Pizza Margarita",
      "cantidad": 2,
      "precioUnitario": 1200
    },
    {
      "productoId": ObjectId("650c2f2b1f9f1a0012345679"),
      "nombre": "Ensalada César",
      "cantidad": 1,
      "precioUnitario": 800
    }
  ],
  "total": 3200,
  "estado": "pendiente",
  "fechaPedido": ISODate("2025-10-26T00:00:00Z"),
  "fechaActualizacion": ISODate("2025-10-26T00:00:00Z")
}

```

### Estrategía de Migraciones

Carpeta migrations/
Cada migración es un archivo numerado secuencialmente:

 ```
001_create_productos.js
002_create_pedidos.js
003_add_estado_to_pedidos.js
 ```

El prefijo numérico asegura el orden de ejecución.

Se puede incluir un descriptor corto en el nombre del archivo.

 ```
module.exports.up = async function(db) { ... }     // Aplica cambios
module.exports.down = async function(db) { ... }   // Reversa cambios
```

db: instancia de la base de datos MongoDB.
up() ejecuta la migración.
down() revierte la migración (opcional, pero recomendado para pruebas).

Registro de migraciones aplicadas
Crear colección migrations en MongoDB.
Cada vez que se aplica una migración, se registra el id, nombre, fechaAplicacion.
Esto evita re-ejecutar migraciones ya aplicadas.

