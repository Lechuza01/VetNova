# Instrucciones para Ejecutar Datos Iniciales (Seed Data)

## 📋 Resumen

Este script inserta datos iniciales en la base de datos para que puedas iniciar sesión y usar la aplicación.

## ✅ Usuarios que se crearán:

- **admin** / **admin123** (Administrador)
- **veterinario** / **vet123** (Veterinario)
- **recepcion** / **recepcion123** (Recepcionista)
- **cliente** / **cliente123** (Cliente)

## 🚀 Pasos para Ejecutar el Seed

### Opción 1: Desde Vercel Dashboard (Recomendado)

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Ve a la pestaña **"Storage"**
3. Selecciona tu base de datos PostgreSQL
4. Haz clic en **"Query"** o **"SQL Editor"**
5. Copia y pega el contenido completo de `BBDD/seed_data.sql`
6. Haz clic en **"Run"** o **"Execute"**
7. Verifica que aparezca el mensaje de éxito al final

### Opción 2: Desde DBeaver o pgAdmin

1. Conecta a tu base de datos PostgreSQL
2. Abre el archivo `BBDD/seed_data.sql`
3. Ejecuta el script completo
4. Verifica que no haya errores

### Opción 3: Desde línea de comandos (psql)

```bash
# Conectar a tu base de datos
psql $POSTGRES_URL

# O si tienes las credenciales separadas
psql -h host -U user -d database

# Ejecutar el script
\i BBDD/seed_data.sql
```

## 🔍 Verificación

Después de ejecutar el script, puedes verificar que los datos se insertaron correctamente:

### 1. Verificar usuarios creados

```sql
SELECT username, email, role, is_active FROM users;
```

Deberías ver 4 usuarios:
- admin
- veterinario
- recepcion
- cliente

### 2. Verificar sucursales

```sql
SELECT name, branch_type, is_24_hours FROM branches;
```

Deberías ver 4 sucursales:
- Centro (Shop)
- Palermo (Shop)
- Belgrano (Shop)
- Emergencias (Clínica 24hs)

### 3. Verificar animales y razas

```sql
SELECT a.name as animal, b.name as raza 
FROM animals a 
LEFT JOIN breeds b ON a.id = b.animal_id 
ORDER BY a.name, b.name;
```

## 🔐 Iniciar Sesión

Una vez ejecutado el seed, puedes iniciar sesión en la aplicación con cualquiera de estos usuarios:

- **Usuario:** `admin` | **Contraseña:** `admin123`
- **Usuario:** `veterinario` | **Contraseña:** `vet123`
- **Usuario:** `recepcion` | **Contraseña:** `recepcion123`
- **Usuario:** `cliente` | **Contraseña:** `cliente123`

## ⚠️ Notas Importantes

1. **Contraseñas Hasheadas**: Las contraseñas están hasheadas usando `pgcrypto` con bcrypt. Son seguras y no se pueden leer en texto plano.

2. **Ejecutar solo una vez**: Este script está diseñado para ejecutarse solo una vez. Si lo ejecutas múltiples veces, algunos datos pueden duplicarse (aunque el script tiene `ON CONFLICT DO NOTHING` para evitar errores).

3. **Si ya tienes datos**: Si ya tienes usuarios en la base de datos, el script intentará insertar los nuevos pero no sobrescribirá los existentes.

4. **Dependencias**: Asegúrate de haber ejecutado primero `veterinaria_postgresql_v3.sql` para crear las tablas necesarias.

## 🐛 Troubleshooting

### Error: "extension pgcrypto does not exist"

**Solución**: El script intenta crear la extensión automáticamente. Si falla, ejecuta manualmente:

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Error: "relation does not exist"

**Solución**: Asegúrate de haber ejecutado primero `veterinaria_postgresql_v3.sql` para crear todas las tablas.

### Los usuarios no aparecen después de ejecutar

**Solución**: Verifica que no haya errores en la ejecución. Revisa los mensajes de error en la consola de SQL.

## ✅ Checklist

- [ ] Ejecuté `veterinaria_postgresql_v3.sql` primero
- [ ] Ejecuté `seed_data.sql`
- [ ] Verifiqué que se crearon los 4 usuarios
- [ ] Verifiqué que se crearon las 4 sucursales
- [ ] Puedo iniciar sesión con uno de los usuarios
