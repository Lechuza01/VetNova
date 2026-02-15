# Instrucciones para Limpiar la Base de Datos

## 🧹 Script de Limpieza

He creado el archivo `limpiar_bd.sql` que elimina todas las tablas, vistas, funciones y tipos de la base de datos.

---

## 📋 Pasos para Limpiar y Reinstalar

### Opción 1: Desde Vercel Dashboard (Recomendado)

1. **Ve a tu base de datos en Vercel Dashboard**
2. **Abre el SQL Editor**
3. **Ejecuta primero `limpiar_bd.sql`**:
   - Copia y pega el contenido de `BBDD/limpiar_bd.sql`
   - Ejecuta el script
   - Verifica que no haya errores
4. **Luego ejecuta `veterinaria_postgresql_v3.sql`**:
   - Copia y pega el contenido de `BBDD/veterinaria_postgresql_v3.sql`
   - Ejecuta el script
   - Verifica que se crearon las 36 tablas

### Opción 2: Desde línea de comandos (psql)

```bash
# Conectar a tu base de datos
psql $POSTGRES_URL

# O si tienes las credenciales separadas
psql -h host -U user -d database

# Ejecutar script de limpieza
\i BBDD/limpiar_bd.sql

# Ejecutar script v3
\i BBDD/veterinaria_postgresql_v3.sql
```

### Opción 3: Desde un cliente gráfico (DBeaver, pgAdmin, etc.)

1. Conecta a tu base de datos PostgreSQL
2. Abre `BBDD/limpiar_bd.sql` y ejecútalo
3. Verifica que se eliminaron todas las tablas
4. Abre `BBDD/veterinaria_postgresql_v3.sql` y ejecútalo
5. Verifica que se crearon las 36 tablas

---

## ⚠️ Advertencias Importantes

### ⚠️ **PÉRDIDA DE DATOS**
Este script **ELIMINARÁ TODOS LOS DATOS** de las tablas. Si tienes datos importantes:

1. **Haz un backup primero**:
   ```bash
   pg_dump $POSTGRES_URL > backup_antes_limpieza.sql
   ```

2. O exporta los datos manualmente desde Vercel Dashboard

### ✅ **Orden de Ejecución**
1. **PRIMERO**: Ejecuta `limpiar_bd.sql`
2. **DESPUÉS**: Ejecuta `veterinaria_postgresql_v3.sql`

---

## 🔍 Verificación

Después de ejecutar ambos scripts, verifica que:

1. **Todas las tablas se eliminaron** (después de limpiar_bd.sql):
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```
   Debería estar vacío (o solo mostrar tablas del sistema)

2. **Se crearon las 36 tablas** (después de v3.sql):
   ```sql
   SELECT COUNT(*) 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_type = 'BASE TABLE';
   ```
   Debería mostrar 36

3. **Verificar tipos ENUM**:
   ```sql
   SELECT typname 
   FROM pg_type 
   WHERE typtype = 'e';
   ```
   Debería mostrar los 14 ENUMs

---

## 🐛 Si hay Errores

### Error: "cannot drop because other objects depend on it"

**Causa**: Hay dependencias que no se eliminaron en el orden correcto.

**Solución**: 
- El script usa `CASCADE` para forzar la eliminación
- Si persiste, ejecuta el script de limpieza varias veces
- O elimina manualmente las tablas problemáticas

### Error: "relation does not exist"

**Causa**: La tabla/vista ya fue eliminada o nunca existió.

**Solución**: 
- Es normal, el script usa `IF EXISTS` para evitar errores
- Puedes ignorar estos mensajes

### Error: "permission denied"

**Causa**: El usuario no tiene permisos para eliminar objetos.

**Solución**: 
- Verifica que tienes permisos de superusuario o DROP
- En Vercel, normalmente tienes permisos completos

---

## 📝 Notas

- **Extensiones**: El script NO elimina las extensiones (`uuid-ossp`, `pg_trgm`) porque pueden ser usadas por otras bases de datos. Si quieres eliminarlas manualmente, puedes hacerlo después.

- **Esquemas**: El script asume que todo está en el esquema `public`. Si usas otro esquema, ajusta el script.

- **Backup**: Siempre haz backup antes de ejecutar scripts de limpieza.

---

## ✅ Checklist

- [ ] Backup de datos realizado
- [ ] Script `limpiar_bd.sql` ejecutado
- [ ] Verificación: tablas eliminadas
- [ ] Script `veterinaria_postgresql_v3.sql` ejecutado
- [ ] Verificación: 36 tablas creadas
- [ ] Verificación: 14 ENUMs creados
- [ ] APIs funcionando correctamente

---

**¿Listo para limpiar?** Ejecuta `limpiar_bd.sql` primero, luego `veterinaria_postgresql_v3.sql` y estarás listo para empezar de cero con todas las funcionalidades. 🚀
