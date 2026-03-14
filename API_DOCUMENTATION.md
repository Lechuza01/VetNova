# Documentación de APIs - VetNova

Base URL: `http://localhost:3000` (desarrollo) o `https://vet-nova.vercel.app` (producción)

---

## 🔐 Autenticación

### POST `/api/auth/login`
Autenticar usuario con username/email y password.

**Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Respuesta exitosa (200):**
```json
{
  "id": "uuid",
  "username": "admin",
  "email": "admin@vetnova.com",
  "name": "Administrador",
  "role": "admin",
  "phone": "+1234567890",
  "address": "...",
  "birthDate": "1990-01-01"
}
```

---

## 👥 Usuarios

### GET `/api/users`
Obtener todos los usuarios.

**Respuesta:** Array de usuarios

---

### POST `/api/users`
Crear un nuevo usuario.

**Body:**
```json
{
  "username": "nuevo_usuario",
  "email": "usuario@example.com",
  "name": "Nombre Completo",
  "passwordHash": "hash_generado_con_pgcrypto",
  "role": "admin" | "veterinarian" | "assistant" | "client",
  "phone": "+1234567890",
  "address": "Dirección",
  "birthDate": "1990-01-01",
  "clientId": "uuid-opcional",
  "employeeId": "uuid-opcional"
}
```

**Campos requeridos:** `username`, `email`, `name`, `passwordHash`, `role`

---

### GET `/api/users/[id]`
Obtener usuario por ID.

**Parámetros:** `id` (UUID) en la URL

---

### PUT `/api/users/[id]`
Actualizar usuario.

**Parámetros:** `id` (UUID) en la URL

**Body:** Campos a actualizar (todos opcionales excepto los que quieras cambiar)

---

### DELETE `/api/users/[id]`
Eliminar usuario (soft delete - marca `is_active = false`).

**Parámetros:** `id` (UUID) en la URL

---

## 👤 Clientes

### GET `/api/clients`
Obtener todos los clientes.

**Respuesta:** Array de clientes

---

### POST `/api/clients`
Crear un nuevo cliente.

**Body:**
```json
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@example.com",
  "phone": "+1234567890",
  "dniCuit": "12345678",
  "address": "Calle 123",
  "city": "Buenos Aires",
  "postalCode": "1234",
  "birthDate": "1990-01-01",
  "gender": "male" | "female" | "other",
  "notes": "Notas adicionales"
}
```

**Campos requeridos:** `firstName`, `lastName`, `email`, `phone`, `dniCuit`

---

### GET `/api/clients/[id]`
Obtener cliente por ID.

**Parámetros:** `id` (UUID) en la URL

---

### PUT `/api/clients/[id]`
Actualizar cliente.

**Parámetros:** `id` (UUID) en la URL

**Body:** Campos a actualizar

---

### DELETE `/api/clients/[id]`
Eliminar cliente.

**Parámetros:** `id` (UUID) en la URL

---

## 🐾 Mascotas

### GET `/api/pets`
Obtener todas las mascotas.

**Query Parameters:**
- `clientId` (opcional): Filtrar por cliente

**Ejemplo:** `/api/pets?clientId=uuid-del-cliente`

---

### POST `/api/pets`
Crear una nueva mascota.

**Body:**
```json
{
  "name": "Firulais",
  "clientId": "uuid-del-cliente",
  "animalId": 1,
  "breedId": 5,
  "species": "Perro",
  "breed": "Labrador",
  "birthDate": "2020-01-15",
  "weight": 25.5,
  "color": "Dorado",
  "microchipNumber": "123456789",
  "photo": "url-de-foto",
  "notes": "Notas adicionales"
}
```

**Campos requeridos:** `name`, `clientId`

**Nota:** Puedes usar `species` y `breed` (strings) en lugar de `animalId` y `breedId` (números). La API los resolverá automáticamente.

---

### GET `/api/pets/[id]`
Obtener mascota por ID.

**Parámetros:** `id` (UUID) en la URL

---

### PUT `/api/pets/[id]`
Actualizar mascota.

**Parámetros:** `id` (UUID) en la URL

**Body:** Campos a actualizar

---

### DELETE `/api/pets/[id]`
Eliminar mascota.

**Parámetros:** `id` (UUID) en la URL

---

## 📅 Turnos (Appointments)

### GET `/api/appointments`
Obtener todos los turnos.

**Query Parameters:**
- `clientId` (opcional): Filtrar por cliente
- `veterinarianId` (opcional): Filtrar por veterinario
- `status` (opcional): `pending` | `confirmed` | `completed` | `cancelled`
- `branchId` (opcional): Filtrar por sucursal
- `dateFrom` (opcional): Fecha desde (YYYY-MM-DD)
- `dateTo` (opcional): Fecha hasta (YYYY-MM-DD)

**Ejemplo:** `/api/appointments?status=pending&dateFrom=2025-02-01`

---

### POST `/api/appointments`
Crear un nuevo turno.

**Body:**
```json
{
  "petId": "uuid-de-mascota",
  "clientId": "uuid-de-cliente",
  "veterinarianId": "uuid-de-veterinario",
  "branchId": "uuid-de-sucursal",
  "date": "2025-02-20",
  "time": "10:00",
  "reason": "Consulta general",
  "status": "pending" | "confirmed" | "completed" | "cancelled",
  "notes": "Notas adicionales"
}
```

**Campos requeridos:** `petId`, `clientId`, `branchId`, `date`, `time`

---

### GET `/api/appointments/[id]`
Obtener turno por ID.

**Parámetros:** `id` (UUID) en la URL

---

### PUT `/api/appointments/[id]`
Actualizar turno.

**Parámetros:** `id` (UUID) en la URL

**Body:** Campos a actualizar

---

### DELETE `/api/appointments/[id]`
Eliminar turno.

**Parámetros:** `id` (UUID) en la URL

---

## 🚨 Emergencias

### GET `/api/emergencies`
Obtener todas las emergencias.

**Query Parameters:**
- `clientId` (opcional): Filtrar por cliente
- `status` (opcional): `pending` | `in_progress` | `resolved` | `cancelled`
- `priority` (opcional): `low` | `medium` | `high` | `critical`
- `branchId` (opcional): Filtrar por sucursal

---

### POST `/api/emergencies`
Crear una nueva emergencia.

**Body:**
```json
{
  "petId": "uuid-de-mascota",
  "clientId": "uuid-de-cliente",
  "reportedBy": "uuid-de-usuario",
  "priority": "low" | "medium" | "high" | "critical",
  "description": "Descripción de la emergencia",
  "symptoms": "Síntomas observados",
  "assignedTo": "uuid-de-veterinario",
  "assignedBranchId": "uuid-de-sucursal",
  "notes": "Notas adicionales"
}
```

**Campos requeridos:** `petId`, `clientId`, `reportedBy`, `description`

---

### GET `/api/emergencies/[id]`
Obtener emergencia por ID.

**Parámetros:** `id` (UUID) en la URL

---

### PUT `/api/emergencies/[id]`
Actualizar emergencia.

**Parámetros:** `id` (UUID) en la URL

**Body:** Campos a actualizar

---

### DELETE `/api/emergencies/[id]`
Eliminar emergencia.

**Parámetros:** `id` (UUID) en la URL

---

## 📋 Historial Médico

### GET `/api/medical-records`
Obtener todos los registros médicos.

**Query Parameters:**
- `petId` (opcional): Filtrar por mascota
- `veterinarianId` (opcional): Filtrar por veterinario
- `serviceType` (opcional): Tipo de servicio
- `dateFrom` (opcional): Fecha desde (YYYY-MM-DD)
- `dateTo` (opcional): Fecha hasta (YYYY-MM-DD)

---

### POST `/api/medical-records`
Crear un nuevo registro médico.

**Body:**
```json
{
  "petId": "uuid-de-mascota",
  "veterinarianId": "uuid-de-veterinario",
  "serviceType": "consultation" | "surgery" | "vaccination" | "grooming" | "other",
  "reason": "Motivo de la consulta",
  "diagnosis": "Diagnóstico",
  "treatment": "Tratamiento aplicado",
  "observations": "Observaciones",
  "nextVisitDate": "2025-03-01",
  "attachments": ["url1", "url2"]
}
```

**Campos requeridos:** `petId`, `veterinarianId`

---

### GET `/api/medical-records/[id]`
Obtener registro médico por ID.

**Parámetros:** `id` (UUID) en la URL

---

### PUT `/api/medical-records/[id]`
Actualizar registro médico.

**Parámetros:** `id` (UUID) en la URL

**Body:** Campos a actualizar

---

### DELETE `/api/medical-records/[id]`
Eliminar registro médico.

**Parámetros:** `id` (UUID) en la URL

---

## 📦 Inventario

### GET `/api/inventory`
Obtener todos los items de inventario.

**Query Parameters:**
- `category` (opcional): `medicine` | `supply` | `equipment` | `food` | `toy`
- `search` (opcional): Búsqueda por nombre

**Ejemplo:** `/api/inventory?category=medicine&search=antibiotico`

---

### POST `/api/inventory`
Crear un nuevo item de inventario.

**Body:**
```json
{
  "name": "Antibiótico X",
  "category": "medicine" | "supply" | "equipment" | "food" | "toy",
  "description": "Descripción del producto",
  "inventoryCategoryId": 5,
  "unitOfMeasure": "unidades",
  "minStock": 10,
  "price": 25.50,
  "supplier": "Proveedor ABC",
  "expiryDate": "2025-12-31",
  "notes": "Notas adicionales"
}
```

**Campos requeridos:** `name`, `category`

**Nota:** `category` debe ser uno de los valores del enum: `'medicine'`, `'supply'`, `'equipment'`, `'food'`, `'toy'`

---

### GET `/api/inventory/[id]`
Obtener item de inventario por ID.

**Parámetros:** `id` (UUID) en la URL

---

### PUT `/api/inventory/[id]`
Actualizar item de inventario.

**Parámetros:** `id` (UUID) en la URL

**Body:** Campos a actualizar

---

### DELETE `/api/inventory/[id]`
Eliminar item de inventario.

**Parámetros:** `id` (UUID) en la URL

---

## 📊 Movimientos de Inventario

### GET `/api/inventory/[id]/movements`
Obtener movimientos de un item de inventario.

**Parámetros:** `id` (UUID del item) en la URL

---

### POST `/api/inventory/[id]/movements`
Crear un movimiento de inventario (ingreso/egreso/ajuste).

**Parámetros:** `id` (UUID del item) en la URL

**Body:**
```json
{
  "movementType": "ingreso" | "egreso" | "ajuste",
  "quantity": 10,
  "reason": "Compra inicial",
  "referenceId": "uuid-opcional",
  "referenceType": "order" | "appointment" | "other",
  "createdBy": "uuid-de-usuario",
  "notes": "Notas adicionales"
}
```

**Campos requeridos:** `movementType`, `quantity`

**Nota:** Los movimientos actualizan automáticamente el `current_stock` del item mediante triggers de la base de datos.

---

## 🛒 Órdenes (Marketplace)

### GET `/api/orders`
Obtener todas las órdenes.

**Query Parameters:**
- `clientId` (opcional): Filtrar por cliente
- `status` (opcional): Estado de la orden
- `dateFrom` (opcional): Fecha desde (YYYY-MM-DD)
- `dateTo` (opcional): Fecha hasta (YYYY-MM-DD)

---

### POST `/api/orders`
Crear una nueva orden.

**Body:**
```json
{
  "clientId": "uuid-de-cliente",
  "userId": "uuid-de-usuario",
  "items": [
    {
      "productId": "uuid-del-producto",
      "quantity": 2,
      "price": 15.99
    }
  ],
  "totalAmount": 31.98,
  "paymentMethod": "credit_card" | "debit_card" | "mercadopago",
  "paymentDetails": {
    "cardNumber": "****1234",
    "cardHolder": "Nombre"
  },
  "shippingAddress": "Dirección de envío",
  "notes": "Notas adicionales"
}
```

**Campos requeridos:** `userId`, `items` (array no vacío), `totalAmount`, `paymentMethod`

---

### GET `/api/orders/[id]`
Obtener orden por ID.

**Parámetros:** `id` (UUID) en la URL

---

### PUT `/api/orders/[id]`
Actualizar orden (principalmente estado).

**Parámetros:** `id` (UUID) en la URL

**Body:**
```json
{
  "status": "pending" | "processing" | "shipped" | "delivered" | "cancelled"
}
```

**Nota:** Solo se puede actualizar el `status` de la orden.

---

### DELETE `/api/orders/[id]`
Eliminar orden.

**Parámetros:** `id` (UUID) en la URL

---

## 🧪 Endpoints de Prueba

### GET `/api/test-db`
Verificar conexión a la base de datos.

**Respuesta:**
```json
{
  "connected": true,
  "hasEnvVar": true,
  "postgresUrl": "configured"
}
```

---

### GET `/api/test-login`
Información sobre el endpoint de prueba de login.

### POST `/api/test-login`
Probar login con credenciales de prueba.

**Body (opcional):**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

---

## 📝 Notas Generales

1. **Todos los endpoints requieren** que la base de datos esté disponible. Si no lo está, retornarán `503 Service Unavailable` con el mensaje `"Database not available"`.

2. **IDs**: Todos los IDs son UUIDs (excepto algunos campos de referencia como `animalId`, `breedId`, `inventoryCategoryId` que son enteros).

3. **Fechas**: Formato `YYYY-MM-DD` para fechas, `HH:mm` para horas.

4. **Enums**: Los valores de enum deben ser exactamente como se especifica (case-sensitive).

5. **Errores comunes:**
   - `400`: Campos requeridos faltantes o inválidos
   - `404`: Recurso no encontrado
   - `409`: Conflicto (duplicado, etc.)
   - `500`: Error del servidor
   - `503`: Base de datos no disponible

6. **Headers**: Todos los endpoints aceptan `Content-Type: application/json` para POST/PUT.

---

## 🚀 Ejemplos de Uso en Postman

### Colección de Postman

Puedes crear una colección con estos ejemplos:

1. **Autenticación:**
   - POST `{{baseUrl}}/api/auth/login`
   - Body: `{ "username": "admin", "password": "admin123" }`

2. **Obtener todos los clientes:**
   - GET `{{baseUrl}}/api/clients`

3. **Crear una mascota:**
   - POST `{{baseUrl}}/api/pets`
   - Body: `{ "name": "Firulais", "clientId": "...", "species": "Perro", "breed": "Labrador" }`

4. **Obtener turnos pendientes:**
   - GET `{{baseUrl}}/api/appointments?status=pending`

5. **Crear item de inventario:**
   - POST `{{baseUrl}}/api/inventory`
   - Body: `{ "name": "Antibiótico", "category": "medicine", "minStock": 10, "price": 25.50 }`

6. **Agregar movimiento de inventario:**
   - POST `{{baseUrl}}/api/inventory/{itemId}/movements`
   - Body: `{ "movementType": "ingreso", "quantity": 50, "reason": "Compra inicial" }`

---

¡Listo para usar! 🎉
