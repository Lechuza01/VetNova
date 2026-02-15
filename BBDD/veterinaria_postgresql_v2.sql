-- =========================
-- EXTENSIONES
-- =========================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =========================
-- ENUMS
-- =========================
CREATE TYPE user_role AS ENUM ('admin', 'veterinarian', 'receptionist', 'cliente');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE emergency_status AS ENUM ('pending', 'in_progress', 'resolved', 'cancelled');
CREATE TYPE emergency_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE pet_status AS ENUM ('active', 'deceased', 'transferred', 'adopted');
CREATE TYPE hospitalization_status AS ENUM ('active', 'discharged', 'transferred');
CREATE TYPE service_type AS ENUM ('consulta', 'estudio');
CREATE TYPE branch_type AS ENUM ('veterinaria_shop', 'veterinaria_clinica');
CREATE TYPE inventory_category AS ENUM ('medicine', 'supply', 'equipment', 'food');
CREATE TYPE product_category AS ENUM ('food', 'toys', 'accessories', 'medicine', 'hygiene', 'other');
CREATE TYPE payment_method AS ENUM ('credit_card', 'debit_card', 'mercadopago');
CREATE TYPE order_status AS ENUM ('completed', 'pending', 'cancelled');
CREATE TYPE study_type AS ENUM ('blood_test', 'xray', 'ultrasound', 'ecg', 'biopsy', 'other');
CREATE TYPE employee_type_enum AS ENUM ('veterinarian', 'receptionist', 'admin');

-- =========================
-- PERSONAS / USUARIOS
-- =========================
CREATE TABLE persons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    dni_cuit VARCHAR(20) UNIQUE NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(100),
    address VARCHAR(200),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    birth_date DATE,
    gender VARCHAR(15),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id UUID REFERENCES persons(id) ON DELETE CASCADE,
    registration_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id UUID REFERENCES persons(id) ON DELETE CASCADE,
    employee_type employee_type_enum NOT NULL,
    license_number VARCHAR(50),
    hire_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'cliente',
    phone VARCHAR(50),
    address VARCHAR(200),
    birth_date DATE,
    client_id UUID REFERENCES clients(id),
    employee_id UUID REFERENCES employees(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE
);

-- =========================
-- ANIMALES
-- =========================
CREATE TABLE animals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    observations TEXT
);

CREATE TABLE breeds (
    id SERIAL PRIMARY KEY,
    animal_id INTEGER REFERENCES animals(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    observations TEXT,
    UNIQUE(animal_id, name)
);

CREATE TABLE pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    animal_id INTEGER REFERENCES animals(id),
    breed_id INTEGER REFERENCES breeds(id),
    birth_date DATE,
    weight DECIMAL(5,2),
    color VARCHAR(50),
    microchip_number VARCHAR(50) UNIQUE,
    photo_url TEXT,
    status pet_status DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE client_pets (
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    is_primary_owner BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (client_id, pet_id)
);

-- =========================
-- SUCURSALES
-- =========================
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    address VARCHAR(200),
    city VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(100),
    branch_type branch_type NOT NULL,
    is_24_hours BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE branch_hours (
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
    opening_time TIME,
    closing_time TIME,
    is_closed BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (branch_id, day_of_week)
);

CREATE TABLE branch_services (
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    service_name VARCHAR(100) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (branch_id, service_name)
);

-- =========================
-- TURNOS
-- =========================
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    veterinarian_id UUID REFERENCES employees(id),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    reason TEXT,
    status appointment_status DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX uq_vet_time 
ON appointments(veterinarian_id, appointment_date, appointment_time)
WHERE status IN ('pending','confirmed');

-- =========================
-- INVENTARIO
-- =========================
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    category inventory_category NOT NULL,
    current_stock DECIMAL(10,2) DEFAULT 0,
    price DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    movement_type VARCHAR(20) CHECK (movement_type IN ('ingreso','egreso')),
    quantity DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- TRIGGERS
-- =========================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION update_inventory_stock()
RETURNS TRIGGER AS $$
DECLARE current_qty DECIMAL;
BEGIN
    SELECT current_stock INTO current_qty FROM inventory_items WHERE id = NEW.inventory_item_id;

    IF NEW.movement_type = 'egreso' AND current_qty < NEW.quantity THEN
        RAISE EXCEPTION 'Stock insuficiente';
    END IF;

    IF NEW.movement_type = 'ingreso' THEN
        UPDATE inventory_items SET current_stock = current_stock + NEW.quantity WHERE id = NEW.inventory_item_id;
    ELSE
        UPDATE inventory_items SET current_stock = current_stock - NEW.quantity WHERE id = NEW.inventory_item_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_inventory_stock
AFTER INSERT ON inventory_movements
FOR EACH ROW EXECUTE FUNCTION update_inventory_stock();

-- =========================
-- VISTAS
-- =========================
CREATE OR REPLACE VIEW clients_full AS
SELECT c.id, p.first_name, p.last_name, p.email
FROM clients c
JOIN persons p ON c.person_id = p.id;

CREATE OR REPLACE VIEW pets_full AS
SELECT p.id, p.name, a.name AS animal_name, b.name AS breed_name
FROM pets p
LEFT JOIN animals a ON p.animal_id = a.id
LEFT JOIN breeds b ON p.breed_id = b.id;
