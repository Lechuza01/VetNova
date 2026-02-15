-- ============================================================================
-- SCRIPT DE LIMPIEZA - Elimina todas las tablas, vistas, funciones y tipos
-- Ejecutar ANTES de ejecutar el script v3 para una instalación limpia
-- ============================================================================

-- =========================
-- ELIMINAR TRIGGERS
-- =========================
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_persons_updated_at ON persons;
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
DROP TRIGGER IF EXISTS update_pets_updated_at ON pets;
DROP TRIGGER IF EXISTS update_branches_updated_at ON branches;
DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
DROP TRIGGER IF EXISTS update_emergencies_updated_at ON emergencies;
DROP TRIGGER IF EXISTS update_medical_records_updated_at ON medical_records;
DROP TRIGGER IF EXISTS update_hospitalizations_updated_at ON hospitalizations;
DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON inventory_items;
DROP TRIGGER IF EXISTS update_marketplace_products_updated_at ON marketplace_products;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
DROP TRIGGER IF EXISTS update_role_permissions_updated_at ON role_permissions;
DROP TRIGGER IF EXISTS update_post_like_count_trigger ON post_likes;
DROP TRIGGER IF EXISTS update_post_comment_count_trigger ON post_comments;
DROP TRIGGER IF EXISTS update_inventory_stock_trigger ON inventory_movements;
DROP TRIGGER IF EXISTS trg_inventory_stock ON inventory_movements;

-- =========================
-- ELIMINAR VISTAS
-- =========================
DROP VIEW IF EXISTS appointments_full CASCADE;
DROP VIEW IF EXISTS pets_full CASCADE;
DROP VIEW IF EXISTS clients_full CASCADE;

-- =========================
-- ELIMINAR TABLAS (en orden inverso de dependencias)
-- =========================

-- Tablas que dependen de otras (con FKs)
DROP TABLE IF EXISTS story_views CASCADE;
DROP TABLE IF EXISTS stories CASCADE;
DROP TABLE IF EXISTS post_comments CASCADE;
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS community_posts CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS marketplace_products CASCADE;
DROP TABLE IF EXISTS service_products CASCADE;
DROP TABLE IF EXISTS service_inventory_items CASCADE;
DROP TABLE IF EXISTS inventory_movements CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS inventory_categories CASCADE;
DROP TABLE IF EXISTS vital_signs CASCADE;
DROP TABLE IF EXISTS studies CASCADE;
DROP TABLE IF EXISTS hospitalizations CASCADE;
DROP TABLE IF EXISTS medical_records CASCADE;
DROP TABLE IF EXISTS emergencies CASCADE;
DROP TABLE IF EXISTS spa_grooming_appointments CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS employee_branches CASCADE;
DROP TABLE IF EXISTS branch_services CASCADE;
DROP TABLE IF EXISTS branch_hours CASCADE;
DROP TABLE IF EXISTS branches CASCADE;
DROP TABLE IF EXISTS client_pets CASCADE;
DROP TABLE IF EXISTS pets CASCADE;
DROP TABLE IF EXISTS breeds CASCADE;
DROP TABLE IF EXISTS animals CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS employee_statuses CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS persons CASCADE;

-- =========================
-- ELIMINAR FUNCIONES
-- =========================
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_post_like_count() CASCADE;
DROP FUNCTION IF EXISTS update_post_comment_count() CASCADE;
DROP FUNCTION IF EXISTS update_inventory_stock() CASCADE;

-- =========================
-- ELIMINAR ÍNDICES (si existen independientes)
-- =========================
DROP INDEX IF EXISTS uq_vet_time CASCADE;

-- =========================
-- ELIMINAR TIPOS ENUM
-- =========================
DROP TYPE IF EXISTS employee_type_enum CASCADE;
DROP TYPE IF EXISTS study_type CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS product_category CASCADE;
DROP TYPE IF EXISTS inventory_category CASCADE;
DROP TYPE IF EXISTS branch_type CASCADE;
DROP TYPE IF EXISTS service_type CASCADE;
DROP TYPE IF EXISTS hospitalization_status CASCADE;
DROP TYPE IF EXISTS pet_status CASCADE;
DROP TYPE IF EXISTS emergency_priority CASCADE;
DROP TYPE IF EXISTS emergency_status CASCADE;
DROP TYPE IF EXISTS appointment_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- =========================
-- NOTA: Las extensiones NO se eliminan
-- (uuid-ossp y pg_trgm pueden ser usadas por otras bases de datos)
-- Si quieres eliminarlas manualmente:
-- DROP EXTENSION IF EXISTS "pg_trgm" CASCADE;
-- DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;
-- =========================

-- ============================================================================
-- FIN DEL SCRIPT DE LIMPIEZA
-- ============================================================================
