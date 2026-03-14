-- Script para agregar la categoría 'toy' al enum inventory_category
-- Ejecutar este script en la base de datos PostgreSQL

-- Agregar el nuevo valor al enum existente
ALTER TYPE inventory_category ADD VALUE IF NOT EXISTS 'toy';

-- Nota: Si el enum ya tiene el valor 'toy', el comando no hará nada debido a IF NOT EXISTS
-- Si necesitas verificar los valores actuales del enum, puedes ejecutar:
-- SELECT enumlabel FROM pg_enum WHERE enumtypid = 'inventory_category'::regtype ORDER BY enumsortorder;
