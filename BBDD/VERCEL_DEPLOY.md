# Guía de Despliegue en Vercel con Base de Datos

## 🔗 Conexión Automática vs Manual

### ✅ **Si ya creaste la BD en Vercel:**
Las variables de entorno se configuran **automáticamente** cuando creas la base de datos PostgreSQL desde el dashboard de Vercel. Solo necesitas:

1. ✅ Crear la BD en Vercel (Storage → Create Database → Postgres)
2. ✅ Ejecutar el script SQL (`veterinaria_postgresql_v3.sql`)
3. ✅ Hacer push de los cambios
4. ✅ Vercel automáticamente usará `POSTGRES_URL` en el próximo deploy

### ⚠️ **Si NO has creado la BD aún:**
Después del deploy, la app seguirá funcionando con **datos mock** (fallback automático) hasta que configures la BD.

---

## 📋 Checklist Pre-Deploy

### Paso 1: Crear Base de Datos en Vercel
- [ ] Ve a tu proyecto en Vercel Dashboard
- [ ] Pestaña **"Storage"**
- [ ] Click en **"Create Database"**
- [ ] Selecciona **"Postgres"**
- [ ] Elige un plan (Hobby es gratuito)
- [ ] Vercel creará automáticamente:
  - ✅ `POSTGRES_URL`
  - ✅ `POSTGRES_PRISMA_URL` (opcional)
  - ✅ `POSTGRES_URL_NON_POOLING` (opcional)

### Paso 2: Ejecutar Script SQL
- [ ] Abre el **SQL Editor** de tu BD en Vercel
- [ ] Copia y pega el contenido de `BBDD/veterinaria_postgresql_v3.sql`
- [ ] Ejecuta el script
- [ ] Verifica que se crearon las 36 tablas

### Paso 3: Verificar Variables de Entorno
- [ ] Ve a **Settings** → **Environment Variables**
- [ ] Debe aparecer `POSTGRES_URL` (configurada automáticamente)
- [ ] Si no aparece, créala manualmente con tu connection string

### Paso 4: Hacer Deploy
- [ ] Haz push de los cambios a GitHub
- [ ] Vercel detectará el push y hará deploy automáticamente
- [ ] El deploy usará las variables de entorno configuradas

---

## 🔍 Verificación Post-Deploy

### 1. Verificar que la BD está conectada

Crea un endpoint de prueba temporal:

```typescript
// app/api/test-db/route.ts
import { checkConnection } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  const connected = await checkConnection()
  return NextResponse.json({ 
    connected,
    hasEnvVar: !!process.env.POSTGRES_URL 
  })
}
```

Visita: `https://tu-app.vercel.app/api/test-db`

Debería retornar:
```json
{
  "connected": true,
  "hasEnvVar": true
}
```

### 2. Probar una API

Visita: `https://tu-app.vercel.app/api/users`

- ✅ Si funciona → BD conectada correctamente
- ❌ Si retorna 503 "Database not available" → Variables no configuradas

---

## 🛡️ Fallback Automático

El código tiene un **fallback inteligente**:

```typescript
// lib/db.ts
if (!dbAvailable) {
  // La app seguirá funcionando con datos mock
  // No se romperá si la BD no está configurada
}
```

**Esto significa:**
- ✅ La app **NO se romperá** si la BD no está configurada
- ✅ Seguirá usando los datos mock actuales
- ✅ Cuando configures la BD, automáticamente empezará a usarla

---

## 🔧 Troubleshooting

### Problema: "Database not available" después del deploy

**Causa**: Variables de entorno no configuradas

**Solución**:
1. Ve a Vercel Dashboard → Tu Proyecto → Settings → Environment Variables
2. Verifica que existe `POSTGRES_URL`
3. Si no existe:
   - Ve a Storage → Tu BD → Settings
   - Copia el connection string
   - Créala manualmente en Environment Variables
4. Redesplega el proyecto

### Problema: Variables configuradas pero no funcionan

**Causa**: Variables solo en desarrollo, no en producción

**Solución**:
1. En Environment Variables, verifica que estén marcadas para:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
2. Redesplega

### Problema: "relation does not exist"

**Causa**: Script SQL no ejecutado

**Solución**:
1. Ejecuta `BBDD/veterinaria_postgresql_v3.sql` en el SQL Editor
2. Verifica que se crearon las 36 tablas

---

## 📝 Notas Importantes

1. **Variables Automáticas**: Cuando creas una BD Postgres en Vercel, las variables se configuran automáticamente para **todos los ambientes** (Production, Preview, Development).

2. **Sin BD = Sin Problemas**: La app tiene fallback a mock data, así que funcionará aunque no tengas BD configurada.

3. **Redespliegue**: Si agregas variables después del deploy, necesitas hacer un nuevo deploy para que se apliquen.

4. **Ambientes**: Las variables se pueden configurar por ambiente. Asegúrate de que estén en Production si quieres que funcionen en producción.

---

## ✅ Resumen Rápido

1. **Crear BD en Vercel** → Variables se configuran automáticamente ✅
2. **Ejecutar script SQL** → Crear las 36 tablas ✅
3. **Hacer push** → Vercel hace deploy automático ✅
4. **Verificar** → Probar `/api/test-db` o `/api/users` ✅

**Si sigues estos pasos, la app quedará conectada automáticamente a la BD después del deploy.** 🚀
