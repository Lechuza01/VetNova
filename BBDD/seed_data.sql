-- ============================================================================
-- SCRIPT DE DATOS INICIALES (SEED DATA)
-- Base de Datos Veterinaria - PostgreSQL v3
-- ============================================================================
-- Este script inserta datos iniciales para poder usar la aplicación
-- Incluye usuarios, sucursales, animales, razas, etc.
-- ============================================================================

-- Habilitar extensión para hashear contraseñas
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ANIMALES Y RAZAS
-- ============================================================================

-- Insertar animales básicos
INSERT INTO animals (name, observations) VALUES
    ('Perro', 'Canis lupus familiaris'),
    ('Gato', 'Felis catus')
ON CONFLICT (name) DO NOTHING;

-- Insertar razas comunes de perros
INSERT INTO breeds (animal_id, name, observations) VALUES
    ((SELECT id FROM animals WHERE name = 'Perro'), 'Labrador Retriever', 'Raza muy amigable y activa'),
    ((SELECT id FROM animals WHERE name = 'Perro'), 'Golden Retriever', 'Raza inteligente y leal'),
    ((SELECT id FROM animals WHERE name = 'Perro'), 'Bulldog Francés', 'Raza pequeña y cariñosa'),
    ((SELECT id FROM animals WHERE name = 'Perro'), 'Pastor Alemán', 'Raza inteligente y protectora'),
    ((SELECT id FROM animals WHERE name = 'Perro'), 'Beagle', 'Raza activa y curiosa'),
    ((SELECT id FROM animals WHERE name = 'Perro'), 'Poodle', 'Raza inteligente y elegante'),
    ((SELECT id FROM animals WHERE name = 'Perro'), 'Yorkshire Terrier', 'Raza pequeña y valiente'),
    ((SELECT id FROM animals WHERE name = 'Perro'), 'Chihuahua', 'Raza pequeña y alerta'),
    ((SELECT id FROM animals WHERE name = 'Perro'), 'Mestizo', 'Sin raza específica')
ON CONFLICT DO NOTHING;

-- Insertar razas comunes de gatos
INSERT INTO breeds (animal_id, name, observations) VALUES
    ((SELECT id FROM animals WHERE name = 'Gato'), 'Persa', 'Raza de pelo largo y tranquila'),
    ((SELECT id FROM animals WHERE name = 'Gato'), 'Siamés', 'Raza vocal y activa'),
    ((SELECT id FROM animals WHERE name = 'Gato'), 'Maine Coon', 'Raza grande y amigable'),
    ((SELECT id FROM animals WHERE name = 'Gato'), 'British Shorthair', 'Raza tranquila y robusta'),
    ((SELECT id FROM animals WHERE name = 'Gato'), 'Ragdoll', 'Raza dócil y cariñosa'),
    ((SELECT id FROM animals WHERE name = 'Gato'), 'Bengalí', 'Raza activa y juguetona'),
    ((SELECT id FROM animals WHERE name = 'Gato'), 'Mestizo', 'Sin raza específica')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PERSONAS
-- ============================================================================

-- Persona para Admin
INSERT INTO persons (first_name, last_name, dni_cuit, phone, email, address, city, postal_code, birth_date, gender)
VALUES
    ('María', 'González', '12345678', '+54 11 6000-1234', 'admin@vetnova.com', 'Av. Corrientes 1234', 'Buenos Aires', 'C1043', '1985-03-15', 'Femenino')
ON CONFLICT (dni_cuit) DO NOTHING;

-- Persona para Veterinario
INSERT INTO persons (first_name, last_name, dni_cuit, phone, email, address, city, postal_code, birth_date, gender)
VALUES
    ('Carlos', 'Ruiz', '23456789', '+54 11 6000-5678', 'vet@vetnova.com', 'Av. Santa Fe 2345', 'Buenos Aires', 'C1425', '1990-07-22', 'Masculino')
ON CONFLICT (dni_cuit) DO NOTHING;

-- Persona para Recepcionista
INSERT INTO persons (first_name, last_name, dni_cuit, phone, email, address, city, postal_code, birth_date, gender)
VALUES
    ('Laura', 'Martínez', '34567890', '+54 11 6000-9012', 'recepcion@vetnova.com', 'Av. Córdoba 3456', 'Buenos Aires', 'C1054', '1992-11-10', 'Femenino')
ON CONFLICT (dni_cuit) DO NOTHING;

-- Persona para Cliente
INSERT INTO persons (first_name, last_name, dni_cuit, phone, email, address, city, postal_code, birth_date, gender)
VALUES
    ('Ana', 'Martínez', '45678901', '+54 11 6000-3456', 'ana.martinez@email.com', 'Av. Cabildo 4567', 'Buenos Aires', 'C1428', '1992-05-20', 'Femenino')
ON CONFLICT (dni_cuit) DO NOTHING;

-- ============================================================================
-- EMPLEADOS
-- ============================================================================

-- Empleado Admin
INSERT INTO employees (person_id, employee_type, license_number, hire_date, status)
VALUES
    ((SELECT id FROM persons WHERE dni_cuit = '12345678'), 'admin', 'ADM-001', '2020-01-15', 'active')
ON CONFLICT DO NOTHING;

-- Empleado Veterinario
INSERT INTO employees (person_id, employee_type, license_number, hire_date, status)
VALUES
    ((SELECT id FROM persons WHERE dni_cuit = '23456789'), 'veterinarian', 'VET-001', '2021-03-01', 'active')
ON CONFLICT DO NOTHING;

-- Empleado Recepcionista
INSERT INTO employees (person_id, employee_type, license_number, hire_date, status)
VALUES
    ((SELECT id FROM persons WHERE dni_cuit = '34567890'), 'receptionist', 'REC-001', '2022-06-01', 'active')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CLIENTES
-- ============================================================================

-- Cliente
INSERT INTO clients (person_id, registration_date, notes)
VALUES
    ((SELECT id FROM persons WHERE dni_cuit = '45678901'), CURRENT_DATE, 'Cliente frecuente')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SUCURSALES
-- ============================================================================

-- Sucursal Centro (Shop)
INSERT INTO branches (name, address, city, postal_code, phone, email, branch_type, is_24_hours, chief_veterinarian_id)
VALUES
    ('Centro', 'Av. Corrientes 1500', 'Buenos Aires', 'C1043', '+54 11 4371-1234', 'centro@vetnova.com', 'veterinaria_shop', false, 
     (SELECT id FROM employees WHERE license_number = 'VET-001'))
ON CONFLICT DO NOTHING;

-- Sucursal Palermo (Shop)
INSERT INTO branches (name, address, city, postal_code, phone, email, branch_type, is_24_hours, chief_veterinarian_id)
VALUES
    ('Palermo', 'Av. Santa Fe 3000', 'Buenos Aires', 'C1425', '+54 11 4831-5678', 'palermo@vetnova.com', 'veterinaria_shop', false,
     (SELECT id FROM employees WHERE license_number = 'VET-001'))
ON CONFLICT DO NOTHING;

-- Sucursal Belgrano (Shop)
INSERT INTO branches (name, address, city, postal_code, phone, email, branch_type, is_24_hours, chief_veterinarian_id)
VALUES
    ('Belgrano', 'Av. Cabildo 2000', 'Buenos Aires', 'C1428', '+54 11 4781-9012', 'belgrano@vetnova.com', 'veterinaria_shop', false,
     (SELECT id FROM employees WHERE license_number = 'VET-001'))
ON CONFLICT DO NOTHING;

-- Sucursal Emergencias (Clínica 24hs)
INSERT INTO branches (name, address, city, postal_code, phone, email, branch_type, is_24_hours, chief_veterinarian_id)
VALUES
    ('Emergencias', 'Av. Libertador 5000', 'Buenos Aires', 'C1426', '+54 11 4700-0000', 'emergencias@vetnova.com', 'veterinaria_clinica', true,
     (SELECT id FROM employees WHERE license_number = 'VET-001'))
ON CONFLICT DO NOTHING;

-- ============================================================================
-- USUARIOS DEL SISTEMA
-- ============================================================================
-- Contraseñas hasheadas usando pgcrypto
-- Contraseñas en texto plano: admin123, vet123, recepcion123, cliente123

-- Usuario Admin
INSERT INTO users (username, email, name, password_hash, role, phone, address, birth_date, employee_id, is_active)
VALUES
    ('admin', 'admin@vetnova.com', 'Dr. María González', 
     crypt('admin123', gen_salt('bf')), 
     'admin', 
     '+54 11 6000-1234', 
     'Av. Corrientes 1234', 
     '1985-03-15',
     (SELECT id FROM employees WHERE license_number = 'ADM-001'),
     true)
ON CONFLICT (username) DO NOTHING;

-- Usuario Veterinario
INSERT INTO users (username, email, name, password_hash, role, phone, address, birth_date, employee_id, is_active)
VALUES
    ('veterinario', 'vet@vetnova.com', 'Dr. Carlos Ruiz', 
     crypt('vet123', gen_salt('bf')), 
     'veterinarian', 
     '+54 11 6000-5678', 
     'Av. Santa Fe 2345', 
     '1990-07-22',
     (SELECT id FROM employees WHERE license_number = 'VET-001'),
     true)
ON CONFLICT (username) DO NOTHING;

-- Usuario Recepcionista
INSERT INTO users (username, email, name, password_hash, role, phone, address, birth_date, employee_id, is_active)
VALUES
    ('recepcion', 'recepcion@vetnova.com', 'Laura Martínez', 
     crypt('recepcion123', gen_salt('bf')), 
     'receptionist', 
     '+54 11 6000-9012', 
     'Av. Córdoba 3456', 
     '1992-11-10',
     (SELECT id FROM employees WHERE license_number = 'REC-001'),
     true)
ON CONFLICT (username) DO NOTHING;

-- Usuario Cliente
INSERT INTO users (username, email, name, password_hash, role, phone, address, birth_date, client_id, is_active)
VALUES
    ('cliente', 'ana.martinez@email.com', 'Ana Martínez', 
     crypt('cliente123', gen_salt('bf')), 
     'cliente', 
     '+54 11 6000-3456', 
     'Av. Cabildo 4567', 
     '1992-05-20',
     (SELECT id FROM clients WHERE person_id = (SELECT id FROM persons WHERE dni_cuit = '45678901')),
     true)
ON CONFLICT (username) DO NOTHING;

-- ============================================================================
-- EMPLEADO-SUCURSAL (Asignar empleados a sucursales)
-- ============================================================================

-- Asignar veterinario a todas las sucursales
INSERT INTO employee_branches (employee_id, branch_id, work_schedule, start_date)
SELECT 
    e.id,
    b.id,
    'Lunes a Viernes 9:00-18:00',
    CURRENT_DATE
FROM employees e
CROSS JOIN branches b
WHERE e.license_number = 'VET-001'
ON CONFLICT DO NOTHING;

-- Asignar recepcionista a sucursales Shop
INSERT INTO employee_branches (employee_id, branch_id, work_schedule, start_date)
SELECT 
    e.id,
    b.id,
    'Lunes a Viernes 9:00-18:00, Sábados 9:00-13:00',
    CURRENT_DATE
FROM employees e
CROSS JOIN branches b
WHERE e.license_number = 'REC-001'
  AND b.branch_type = 'veterinaria_shop'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- MENSAJE FINAL
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DATOS INICIALES INSERTADOS CORRECTAMENTE';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Usuarios creados:';
    RAISE NOTICE '  - admin / admin123 (Admin)';
    RAISE NOTICE '  - veterinario / vet123 (Veterinario)';
    RAISE NOTICE '  - recepcion / recepcion123 (Recepcionista)';
    RAISE NOTICE '  - cliente / cliente123 (Cliente)';
    RAISE NOTICE '';
    RAISE NOTICE 'Sucursales creadas:';
    RAISE NOTICE '  - Centro (Shop)';
    RAISE NOTICE '  - Palermo (Shop)';
    RAISE NOTICE '  - Belgrano (Shop)';
    RAISE NOTICE '  - Emergencias (Clínica 24hs)';
    RAISE NOTICE '';
    RAISE NOTICE 'Animales y razas básicas insertadas';
    RAISE NOTICE '========================================';
END $$;
