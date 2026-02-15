# Mejoras y Adecuaciones - Base de Datos PostgreSQL

## 📋 Resumen de Cambios

Este documento detalla las mejoras y adecuaciones realizadas al diseño original de SQL Server para adaptarlo a PostgreSQL y a las funcionalidades actuales de la aplicación VetNova.

---

## 🔄 Cambios Principales

### 1. **Migración de SQL Server a PostgreSQL**

#### Cambios de Sintaxis:
- ✅ `IDENTITY(1,1)` → `SERIAL` o `UUID DEFAULT uuid_generate_v4()`
- ✅ `[dbo].[TableName]` → `table_name` (nombres sin corchetes)
- ✅ `varchar(n)` → `VARCHAR(n)` (case-insensitive pero mantenido por consistencia)
- ✅ `datetime` → `TIMESTAMP WITH TIME ZONE`
- ✅ `date` → `DATE` (sin cambios)
- ✅ `decimal(10,2)` → `DECIMAL(10,2)` (sin cambios)

#### Mejoras de PostgreSQL:
- ✅ Uso de **UUIDs** en lugar de INT para IDs principales (mejor para distribución y seguridad)
- ✅ Uso de **ENUMs** para tipos predefinidos (mejor validación y performance)
- ✅ Extensiones: `uuid-ossp` para UUIDs y `pg_trgm` para búsquedas de texto
- ✅ Índices GIN para búsquedas de texto completo

---

### 2. **Nuevas Tablas Agregadas**

#### Tablas de Autenticación y Usuarios:
- ✅ **`users`**: Sistema de autenticación separado de `persons`
  - Campos: `username`, `email`, `password_hash`, `role`
  - Relación con `clients` y `employees` mediante FK

#### Tablas de Funcionalidades Nuevas:
- ✅ **`spa_grooming_appointments`**: Turnos especiales para spa y peluquería
- ✅ **`emergencies`**: Sistema de emergencias con prioridades y estados
- ✅ **`marketplace_products`**: Productos del e-commerce
- ✅ **`orders`** y **`order_items`**: Órdenes de compra del marketplace
- ✅ **`community_posts`**, **`post_likes`**, **`post_comments`**: Sistema de comunidad
- ✅ **`stories`** y **`story_views`**: Stories temporales
- ✅ **`notifications`**: Sistema de notificaciones
- ✅ **`role_permissions`**: Permisos granulares por rol y módulo

#### Tablas de Relaciones Mejoradas:
- ✅ **`service_inventory_items`**: Insumos utilizados en servicios médicos
- ✅ **`service_products`**: Productos utilizados en servicios médicos
- ✅ **`inventory_movements`**: Movimientos de inventario (ingresos/egresos)
- ✅ **`branch_hours`**: Horarios detallados por día de la semana
- ✅ **`branch_services`**: Servicios disponibles por sucursal
- ✅ **`vital_signs`**: Signos vitales durante hospitalizaciones

---

### 3. **Mejoras en Tablas Existentes**

#### Tabla `medical_records`:
- ✅ Agregado campo **`service_type`** (ENUM: 'consulta' | 'estudio')
- ✅ Agregado campo **`attachments`** (array de URLs)
- ✅ Mejorada relación con servicios

#### Tabla `pets`:
- ✅ Agregado campo **`photo_url`** para fotos de mascotas
- ✅ Agregado campo **`status`** (ENUM: 'active' | 'deceased' | 'transferred' | 'adopted')
- ✅ Agregados campos **`status_date`** y **`status_notes`**

#### Tabla `branches`:
- ✅ Agregado campo **`branch_type`** (ENUM: 'veterinaria_shop' | 'veterinaria_clinica')
- ✅ Agregado campo **`is_24_hours`** para sucursales 24hs
- ✅ Separados horarios en tabla **`branch_hours`**
- ✅ Separados servicios en tabla **`branch_services`**

#### Tabla `inventory_items`:
- ✅ Agregado campo **`category`** (ENUM: 'medicine' | 'supply' | 'equipment' | 'food')
- ✅ Agregado campo **`current_stock`** calculado automáticamente
- ✅ Mejorada gestión de movimientos con **`inventory_movements`**

---

### 4. **Estructura de Datos Mejorada**

#### Separación de Concerns:
- ✅ **`users`** (autenticación) separado de **`persons`** (datos personales)
- ✅ **`clients`** y **`employees`** comparten **`persons`** (evita duplicación)
- ✅ Relación N:M entre **`clients`** y **`pets`** mediante **`client_pets`**

#### Normalización:
- ✅ Horarios de sucursales normalizados en **`branch_hours`**
- ✅ Servicios de sucursales normalizados en **`branch_services`**
- ✅ Movimientos de inventario separados de la tabla principal

---

### 5. **Funcionalidades Automáticas**

#### Triggers Implementados:
- ✅ **`update_updated_at_column()`**: Actualiza automáticamente `updated_at` en todas las tablas
- ✅ **`update_post_like_count()`**: Actualiza contador de likes en posts
- ✅ **`update_post_comment_count()`**: Actualiza contador de comentarios
- ✅ **`update_inventory_stock()`**: Actualiza stock automáticamente al registrar movimientos

#### Vistas Útiles:
- ✅ **`clients_full`**: Clientes con información completa de persona
- ✅ **`pets_full`**: Mascotas con nombre de animal y raza
- ✅ **`appointments_full`**: Turnos con información completa de cliente, veterinario y sucursal

---

### 6. **Índices para Performance**

#### Índices Creados:
- ✅ Índices en campos de búsqueda frecuente (email, username, nombres)
- ✅ Índices en FKs para mejorar JOINs
- ✅ Índices en fechas para consultas temporales
- ✅ Índices en estados para filtros
- ✅ Índices GIN para búsquedas de texto completo en nombres

---

### 7. **Campos y Tipos Mejorados**

#### Campos Agregados:
- ✅ **`created_at`** y **`updated_at`** en todas las tablas principales
- ✅ **`is_active`** en tablas que requieren soft delete
- ✅ Campos de auditoría donde corresponde

#### Tipos Mejorados:
- ✅ Uso de **ENUMs** para estados y tipos (mejor validación)
- ✅ **JSONB** para datos flexibles (payment_details en orders)
- ✅ **TEXT[]** para arrays (attachments, images)

---

## 📊 Comparación: Diseño Original vs. Nuevo Diseño

### Tablas del Diseño Original (SQL Server):
1. ✅ ANIMAL → `animals`
2. ✅ Categoria_Insumo → `inventory_categories`
3. ✅ Categoria_Stock → (integrado en `marketplace_products.category`)
4. ✅ CLIENTE → `clients` + `persons`
5. ✅ CLIENTE_MASCOTA → `client_pets`
6. ✅ EMPLEADO → `employees` + `persons`
7. ✅ EMPLEADO_VETERINARIA → `employee_branches`
8. ✅ ESTADO_EMPLEADO → `employee_statuses`
9. ✅ INGRESO_INSUMO → `inventory_movements`
10. ✅ INGRESO_STOCK → `inventory_movements` (unificado)
11. ✅ INSUMO → `inventory_items`
12. ✅ MASCOTA → `pets`
13. ✅ PERSONA → `persons`
14. ✅ PRODUCTO → `marketplace_products`
15. ✅ RAZA → `breeds`
16. ✅ SERVICIO → `medical_records`
17. ✅ SERVICIO_INSUMO → `service_inventory_items`
18. ✅ SERVICIO_PRODUCTO → `service_products`
19. ✅ TIPO_SERVICIO → `service_types`
20. ✅ TIPO_VETERINARIA → (integrado en `branches.branch_type`)
21. ✅ TURNO → `appointments`
22. ✅ VETERINARIA → `branches`
23. ✅ VETERINARIA_SERVICIO → `branch_services`

### Tablas Nuevas Agregadas:
1. 🆕 `users` - Autenticación
2. 🆕 `spa_grooming_appointments` - Turnos spa/peluquería
3. 🆕 `emergencies` - Emergencias
4. 🆕 `hospitalizations` - Internaciones
5. 🆕 `studies` - Estudios médicos
6. 🆕 `vital_signs` - Signos vitales
7. 🆕 `orders` - Órdenes de compra
8. 🆕 `order_items` - Items de órdenes
9. 🆕 `community_posts` - Posts de comunidad
10. 🆕 `post_likes` - Likes de posts
11. 🆕 `post_comments` - Comentarios
12. 🆕 `stories` - Stories temporales
13. 🆕 `story_views` - Visualizaciones de stories
14. 🆕 `notifications` - Notificaciones
15. 🆕 `role_permissions` - Permisos por rol
16. 🆕 `branch_hours` - Horarios de sucursales
17. 🆕 `inventory_movements` - Movimientos de inventario

---

## 🎯 Funcionalidades Cubiertas

### ✅ Funcionalidades de la Aplicación Actual:

1. **Autenticación y Usuarios**
   - ✅ Sistema de usuarios con roles
   - ✅ Separación usuarios/clientes/empleados
   - ✅ Permisos granulares por rol

2. **Gestión de Clientes y Mascotas**
   - ✅ Clientes con información completa
   - ✅ Mascotas con múltiples dueños
   - ✅ Estados de mascotas (activa, fallecida, transferida, adoptada)

3. **Turnos y Citas**
   - ✅ Turnos médicos regulares
   - ✅ Turnos de spa y peluquería
   - ✅ Estados y gestión de turnos

4. **Emergencias**
   - ✅ Reporte de emergencias
   - ✅ Prioridades (low, medium, high, critical)
   - ✅ Asignación a veterinarios y sucursales

5. **Historial Clínico**
   - ✅ Registros médicos (consultas y estudios)
   - ✅ Insumos y productos utilizados en servicios
   - ✅ Diagnósticos y tratamientos

6. **Hospitalizaciones**
   - ✅ Internaciones con estudios médicos
   - ✅ Signos vitales
   - ✅ Estados de internación

7. **Inventario**
   - ✅ Insumos y productos
   - ✅ Movimientos de inventario
   - ✅ Control de stock mínimo

8. **Marketplace**
   - ✅ Productos del e-commerce
   - ✅ Órdenes de compra
   - ✅ Métodos de pago

9. **Comunidad**
   - ✅ Posts con imágenes
   - ✅ Likes y comentarios
   - ✅ Stories temporales

10. **Notificaciones**
    - ✅ Sistema de notificaciones
    - ✅ Estados de lectura

11. **Sucursales**
    - ✅ Tipos de sucursales (shop/clínica)
    - ✅ Horarios por día
    - ✅ Servicios disponibles
    - ✅ Sucursales 24hs

---

## 🚀 Próximos Pasos Recomendados

### 1. **Migración de Datos**
- Crear script de migración desde mock data actual
- Mapear tipos TypeScript a tipos PostgreSQL
- Validar integridad referencial

### 2. **Integración con Next.js**
- Configurar conexión a PostgreSQL (Vercel Postgres)
- Crear funciones de acceso a datos (API routes o Server Actions)
- Implementar ORM (Prisma, Drizzle, etc.) si es necesario

### 3. **Seguridad**
- Implementar hash de contraseñas (bcrypt)
- Validar permisos en cada endpoint
- Implementar rate limiting

### 4. **Optimizaciones**
- Agregar más índices según uso real
- Implementar caché para consultas frecuentes
- Optimizar consultas complejas

### 5. **Testing**
- Crear datos de prueba
- Validar triggers y funciones
- Probar integridad referencial

---

## 📝 Notas Importantes

1. **UUIDs vs. SERIAL**: Se usan UUIDs para IDs principales porque:
   - Mejor para distribución (no hay colisiones)
   - Más seguro (no expone información sobre cantidad de registros)
   - Compatible con Vercel Postgres

2. **ENUMs**: Se usan ENUMs para tipos predefinidos porque:
   - Validación a nivel de base de datos
   - Mejor performance que VARCHAR
   - Documentación implícita

3. **Timestamps**: Se usa `TIMESTAMP WITH TIME ZONE` para:
   - Manejo correcto de zonas horarias
   - Compatibilidad con aplicaciones distribuidas

4. **Arrays**: Se usan arrays PostgreSQL (`TEXT[]`) para:
   - Datos simples que no requieren relaciones
   - Mejor performance que tablas separadas para datos pequeños

---

## ✅ Checklist de Implementación

- [x] Script SQL creado
- [x] Tablas principales definidas
- [x] Relaciones (FKs) establecidas
- [x] Índices creados
- [x] Triggers implementados
- [x] Vistas útiles creadas
- [x] Documentación completa
- [ ] Script de migración de datos
- [ ] Pruebas de integridad
- [ ] Integración con aplicación Next.js

---

**Fecha de creación**: 2025-02-15  
**Versión**: 1.0  
**Compatible con**: PostgreSQL 12+, Vercel Postgres
