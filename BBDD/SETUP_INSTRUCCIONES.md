# Instrucciones de Setup - Base de Datos y APIs

## 📋 Resumen

Este documento explica cómo configurar la base de datos PostgreSQL en Vercel y conectar la aplicación Next.js con las APIs creadas.

---

## 🚀 Paso 1: Configurar PostgreSQL en Vercel

### Opción A: Crear nueva base de datos en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Ve a la pestaña **"Storage"**
3. Haz clic en **"Create Database"**
4. Selecciona **"Postgres"**
5. Elige un plan (Hobby es gratuito para desarrollo)
6. Vercel creará automáticamente las variables de entorno:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`

### Opción B: Conectar base de datos existente

Si ya tienes una base de datos PostgreSQL:

1. Ve a **Settings** → **Environment Variables**
2. Agrega la variable `POSTGRES_URL` con tu connection string:
   ```
   postgresql://user:password@host:port/database?sslmode=require
   ```

---

## 🗄️ Paso 2: Ejecutar el Script SQL

### Opción A: Desde Vercel Dashboard

1. Ve a tu base de datos en Vercel Dashboard
2. Haz clic en **"Query"** o **"SQL Editor"**
3. Copia y pega el contenido de `BBDD/veterinaria_postgresql.sql`
4. Ejecuta el script completo

### Opción B: Desde línea de comandos (psql)

```bash
# Conectar a tu base de datos
psql $POSTGRES_URL

# O si tienes las credenciales separadas
psql -h host -U user -d database

# Ejecutar el script
\i BBDD/veterinaria_postgresql.sql
```

### Opción C: Desde un cliente gráfico (DBeaver, pgAdmin, etc.)

1. Conecta a tu base de datos PostgreSQL
2. Abre el archivo `BBDD/veterinaria_postgresql.sql`
3. Ejecuta el script completo

---

## 📦 Paso 3: Instalar Dependencias

```bash
npm install
# o
pnpm install
# o
yarn install
```

Esto instalará `@vercel/postgres` que ya está agregado al `package.json`.

---

## 🔧 Paso 4: Configurar Variables de Entorno

Crea o actualiza `.env.local` en la raíz del proyecto:

```env
# PostgreSQL Connection (Vercel lo proporciona automáticamente)
POSTGRES_URL=postgresql://user:password@host:port/database?sslmode=require

# Opcional: Para desarrollo local
# POSTGRES_URL=postgresql://localhost:5432/veterinaria_db
```

**Nota**: En producción en Vercel, estas variables se configuran automáticamente cuando creas la base de datos.

---

## ✅ Paso 5: Verificar la Conexión

Puedes verificar que la conexión funciona creando un endpoint de prueba:

```typescript
// app/api/test-db/route.ts
import { checkConnection } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  const connected = await checkConnection()
  return NextResponse.json({ connected })
}
```

Luego visita: `http://localhost:3000/api/test-db`

---

## 📡 Paso 6: Usar las APIs desde el Frontend

### Ejemplo 1: Usando los hooks personalizados

```typescript
import { useClients, usePets } from "@/lib/hooks/use-api"

export default function MyComponent() {
  const { data: clients, loading, error } = useClients()
  const { data: pets } = usePets("client-id-here")

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <h1>Clients</h1>
      {clients?.map(client => (
        <div key={client.id}>{client.name}</div>
      ))}
    </div>
  )
}
```

### Ejemplo 2: Llamadas directas a la API

```typescript
// Crear un cliente
const response = await fetch("/api/clients", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    firstName: "Juan",
    lastName: "Pérez",
    email: "juan@example.com",
    phone: "1234567890",
    dniCuit: "12345678",
    address: "Calle 123",
    city: "Buenos Aires",
    postalCode: "1000"
  })
})

const client = await response.json()
```

### Ejemplo 3: Actualizar datos

```typescript
// Actualizar un cliente
const response = await fetch(`/api/clients/${clientId}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    phone: "9876543210",
    address: "Nueva dirección 456"
  })
})

const updatedClient = await response.json()
```

---

## 🔄 Paso 7: Migración Gradual desde Mock Data

La aplicación actualmente usa `Context API` con datos mock. Puedes migrar gradualmente:

### Estrategia 1: Mantener ambos sistemas

```typescript
import { dbAvailable } from "@/lib/db"
import { useClients } from "@/lib/hooks/use-api"
import { useClinic } from "@/contexts/clinic-context"

export function useClientsData() {
  const { clients: mockClients } = useClinic()
  const { data: dbClients, loading } = useClients()

  if (!dbAvailable || loading) {
    return { clients: mockClients, loading: false }
  }

  return { clients: dbClients || mockClients, loading }
}
```

### Estrategia 2: Reemplazar Context API gradualmente

1. Empieza con las entidades más simples (Users, Clients)
2. Luego migra Pets, Appointments, etc.
3. Finalmente migra las más complejas (Medical Records, Orders)

---

## 🐛 Troubleshooting

### Error: "Database not available"

**Causa**: La variable `POSTGRES_URL` no está configurada.

**Solución**:
1. Verifica que `.env.local` existe y tiene `POSTGRES_URL`
2. Reinicia el servidor de desarrollo: `npm run dev`
3. En producción, verifica las variables de entorno en Vercel Dashboard

### Error: "relation does not exist"

**Causa**: El script SQL no se ejecutó completamente.

**Solución**:
1. Verifica que todas las tablas fueron creadas
2. Ejecuta el script SQL nuevamente
3. Verifica los logs de la base de datos

### Error: "permission denied"

**Causa**: El usuario de la base de datos no tiene permisos.

**Solución**:
1. Verifica los permisos del usuario en PostgreSQL
2. Asegúrate de que el usuario puede crear tablas y ejecutar queries

### La aplicación sigue usando mock data

**Causa**: `dbAvailable` es `false` porque no encuentra `POSTGRES_URL`.

**Solución**:
1. Verifica que `.env.local` tiene `POSTGRES_URL`
2. Reinicia el servidor
3. Verifica que la conexión funciona con `/api/test-db`

---

## 📚 APIs Disponibles

### Usuarios
- `GET /api/users` - Listar todos los usuarios
- `GET /api/users/[id]` - Obtener usuario por ID
- `POST /api/users` - Crear usuario
- `PUT /api/users/[id]` - Actualizar usuario
- `DELETE /api/users/[id]` - Eliminar usuario (soft delete)

### Clientes
- `GET /api/clients` - Listar todos los clientes
- `GET /api/clients/[id]` - Obtener cliente por ID
- `POST /api/clients` - Crear cliente
- `PUT /api/clients/[id]` - Actualizar cliente
- `DELETE /api/clients/[id]` - Eliminar cliente

### Mascotas
- `GET /api/pets` - Listar todas las mascotas
- `GET /api/pets?clientId=xxx` - Listar mascotas de un cliente
- `GET /api/pets/[id]` - Obtener mascota por ID
- `POST /api/pets` - Crear mascota
- `PUT /api/pets/[id]` - Actualizar mascota
- `DELETE /api/pets/[id]` - Eliminar mascota

### Más APIs (por crear)
- `/api/appointments` - Turnos
- `/api/emergencies` - Emergencias
- `/api/medical-records` - Historial clínico
- `/api/inventory` - Inventario
- `/api/orders` - Órdenes del marketplace
- etc.

---

## 🎯 Próximos Pasos

1. ✅ Configurar PostgreSQL en Vercel
2. ✅ Ejecutar script SQL
3. ✅ Instalar dependencias
4. ✅ Configurar variables de entorno
5. ⏭️ Crear más API routes (appointments, emergencies, etc.)
6. ⏭️ Migrar componentes del frontend para usar APIs
7. ⏭️ Implementar autenticación con hash de contraseñas
8. ⏭️ Agregar validación y manejo de errores mejorado

---

## 📝 Notas Importantes

1. **Desarrollo Local**: Puedes usar una base de datos PostgreSQL local o remota. Solo configura `POSTGRES_URL` en `.env.local`.

2. **Producción**: Vercel configura automáticamente las variables de entorno cuando creas la base de datos desde el dashboard.

3. **Fallback a Mock Data**: Si la base de datos no está disponible, la aplicación seguirá funcionando con los datos mock actuales.

4. **Seguridad**: 
   - Nunca commitees `.env.local` al repositorio
   - Usa variables de entorno en Vercel para producción
   - Implementa autenticación antes de desplegar a producción

---

**¿Necesitas ayuda?** Revisa los logs del servidor y de la base de datos para más detalles sobre errores específicos.
