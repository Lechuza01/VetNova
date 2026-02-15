# Compatibilidad con veterinaria_postgresql_v2.sql

## ✅ Cambios Realizados

### Queries Ajustadas
- ✅ `lib/db/queries/pets.ts` - Eliminadas referencias a `status_date` y `status_notes`

### APIs Compatibles
- ✅ `/api/users` - Totalmente compatible
- ✅ `/api/clients` - Totalmente compatible  
- ✅ `/api/pets` - Ajustada para v2 (sin `status_date` y `status_notes`)

---

## 📋 Resumen de Diferencias v1 vs v2

### Tablas que NO están en v2 (pero están en v1):
- ❌ `emergencies`
- ❌ `medical_records`
- ❌ `hospitalizations`
- ❌ `studies`
- ❌ `vital_signs`
- ❌ `marketplace_products`
- ❌ `orders`
- ❌ `order_items`
- ❌ `community_posts`
- ❌ `post_likes`
- ❌ `post_comments`
- ❌ `stories`
- ❌ `story_views`
- ❌ `notifications`
- ❌ `role_permissions`
- ❌ `spa_grooming_appointments`
- ❌ `service_inventory_items`
- ❌ `service_products`
- ❌ `employee_branches`
- ❌ `employee_statuses`
- ❌ `service_types`
- ❌ `inventory_categories`

### Campos Eliminados en v2:

**Tabla `pets`:**
- ❌ `status_date`
- ❌ `status_notes`

**Tabla `branches`:**
- ❌ `postal_code`
- ❌ `chief_veterinarian_id`

**Tabla `inventory_items`:**
- ❌ `description`
- ❌ `unit_of_measure`
- ❌ `min_stock`
- ❌ `supplier`
- ❌ `expiry_date`
- ❌ `notes`

### Mejoras en v2:

✅ **Índice único** para evitar turnos duplicados:
```sql
CREATE UNIQUE INDEX uq_vet_time 
ON appointments(veterinarian_id, appointment_date, appointment_time)
WHERE status IN ('pending','confirmed');
```

✅ **ENUM para tipos de empleados**:
```sql
CREATE TYPE employee_type_enum AS ENUM ('veterinarian', 'receptionist', 'admin');
```

✅ **Trigger mejorado** para validar stock antes de egresos:
```sql
IF NEW.movement_type = 'egreso' AND current_qty < NEW.quantity THEN
    RAISE EXCEPTION 'Stock insuficiente';
END IF;
```

---

## 🎯 Tablas Disponibles en v2

### Core:
- ✅ `persons`
- ✅ `clients`
- ✅ `employees`
- ✅ `users`

### Mascotas:
- ✅ `animals`
- ✅ `breeds`
- ✅ `pets`
- ✅ `client_pets`

### Sucursales:
- ✅ `branches`
- ✅ `branch_hours`
- ✅ `branch_services`

### Turnos:
- ✅ `appointments` (con índice único para evitar duplicados)

### Inventario:
- ✅ `inventory_items` (versión simplificada)
- ✅ `inventory_movements` (solo ingreso/egreso)

---

## 📝 Notas Importantes

1. **Tipos TypeScript**: Los tipos en `lib/types.ts` mantienen campos opcionales como `statusDate` y `statusNotes` en `Pet`, pero estos no se leerán de la BD en v2. Esto está bien porque son opcionales.

2. **Migración Futura**: Si más adelante quieres agregar las tablas eliminadas, puedes:
   - Ejecutar solo las partes del script v1 que necesites
   - O crear migraciones incrementales

3. **APIs Pendientes**: Las siguientes APIs aún no están creadas (porque las tablas no están en v2):
   - `/api/appointments` - ✅ Puede crearse (tabla existe)
   - `/api/emergencies` - ❌ No puede crearse (tabla no existe)
   - `/api/medical-records` - ❌ No puede crearse (tabla no existe)
   - `/api/inventory` - ✅ Puede crearse (tablas existen)

---

## 🚀 Próximos Pasos Recomendados

1. ✅ **APIs Básicas Creadas**: Users, Clients, Pets
2. ⏭️ **Crear API de Appointments** (tabla existe en v2)
3. ⏭️ **Crear API de Inventory** (tablas existen en v2)
4. ⏭️ **Agregar más tablas según necesidad** (emergencies, medical_records, etc.)

---

## ✅ Estado Actual

- ✅ Script SQL v2 listo para ejecutar
- ✅ Queries ajustadas para v2
- ✅ APIs básicas compatibles con v2
- ✅ Documentación actualizada

**¿Necesitas que cree las APIs para `appointments` e `inventory` que sí están en v2?**
