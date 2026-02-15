-- ============================================================================
-- BASE DE DATOS VETERINARIA - PostgreSQL
-- Script adaptado desde SQL Server con mejoras y funcionalidades adicionales
-- Compatible con Vercel PostgreSQL
-- ============================================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para búsquedas de texto

-- ============================================================================
-- ENUMS (Tipos enumerados)
-- ============================================================================

-- Roles de usuario
CREATE TYPE user_role AS ENUM ('admin', 'veterinarian', 'receptionist', 'cliente');

-- Estados de turnos y citas
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

-- Estados de emergencias
CREATE TYPE emergency_status AS ENUM ('pending', 'in_progress', 'resolved', 'cancelled');
CREATE TYPE emergency_priority AS ENUM ('low', 'medium', 'high', 'critical');

-- Estados de mascotas
CREATE TYPE pet_status AS ENUM ('active', 'deceased', 'transferred', 'adopted');

-- Estados de hospitalización
CREATE TYPE hospitalization_status AS ENUM ('active', 'discharged', 'transferred');

-- Tipos de servicio
CREATE TYPE service_type AS ENUM ('consulta', 'estudio');

-- Tipos de veterinaria
CREATE TYPE branch_type AS ENUM ('veterinaria_shop', 'veterinaria_clinica');

-- Categorías de inventario
CREATE TYPE inventory_category AS ENUM ('medicine', 'supply', 'equipment', 'food');

-- Categorías de productos del marketplace
CREATE TYPE product_category AS ENUM ('food', 'toys', 'accessories', 'medicine', 'hygiene', 'other');

-- Métodos de pago
CREATE TYPE payment_method AS ENUM ('credit_card', 'debit_card', 'mercadopago');

-- Estados de órdenes
CREATE TYPE order_status AS ENUM ('completed', 'pending', 'cancelled');

-- Tipos de estudios médicos
CREATE TYPE study_type AS ENUM ('blood_test', 'xray', 'ultrasound', 'ecg', 'biopsy', 'other');

-- ============================================================================
-- TABLAS PRINCIPALES
-- ============================================================================

-- Tabla de Usuarios (Sistema de autenticación)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Hash de contraseña
    role user_role NOT NULL DEFAULT 'cliente',
    phone VARCHAR(50),
    address VARCHAR(200),
    birth_date DATE,
    client_id UUID, -- FK a clients si es cliente
    employee_id UUID, -- FK a employees si es empleado
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Tabla de Personas (Información personal compartida)
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
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Clientes
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id UUID REFERENCES persons(id) ON DELETE CASCADE,
    registration_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Empleados
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id UUID REFERENCES persons(id) ON DELETE CASCADE,
    employee_type VARCHAR(100), -- 'veterinarian', 'receptionist', etc.
    license_number VARCHAR(50), -- Matrícula para veterinarios
    hire_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Estados de Empleado
CREATE TABLE employee_statuses (
    id SERIAL PRIMARY KEY,
    status_name VARCHAR(50) UNIQUE NOT NULL
);

-- Tabla de Animales (Especies)
CREATE TABLE animals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Razas
CREATE TABLE breeds (
    id SERIAL PRIMARY KEY,
    animal_id INTEGER REFERENCES animals(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(animal_id, name)
);

-- Tabla de Mascotas
CREATE TABLE pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    animal_id INTEGER REFERENCES animals(id),
    breed_id INTEGER REFERENCES breeds(id),
    birth_date DATE,
    weight DECIMAL(5, 2),
    color VARCHAR(50),
    microchip_number VARCHAR(50) UNIQUE,
    photo_url TEXT,
    status pet_status DEFAULT 'active',
    status_date DATE,
    status_notes TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de relación Cliente-Mascota
CREATE TABLE client_pets (
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    ownership_start_date DATE DEFAULT CURRENT_DATE,
    ownership_end_date DATE,
    is_primary_owner BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (client_id, pet_id)
);

-- Tabla de Sucursales/Veterinarias
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    address VARCHAR(200),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    phone VARCHAR(50),
    email VARCHAR(100),
    branch_type branch_type NOT NULL,
    is_24_hours BOOLEAN DEFAULT FALSE,
    chief_veterinarian_id UUID REFERENCES employees(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Horarios de Sucursales
CREATE TABLE branch_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Lunes, 6=Domingo
    opening_time TIME,
    closing_time TIME,
    is_closed BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (branch_id, day_of_week)
);

-- Tabla de Servicios de Sucursales
CREATE TABLE branch_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    service_name VARCHAR(100) NOT NULL, -- 'consulta', 'shop', 'internacion', 'urgencias'
    is_available BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (branch_id, service_name)
);

-- Tabla de Tipos de Servicio Médico
CREATE TABLE service_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    base_price DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de relación Empleado-Veterinaria
CREATE TABLE employee_branches (
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    work_schedule TEXT, -- Horario laboral
    status_id INTEGER REFERENCES employee_statuses(id),
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    PRIMARY KEY (employee_id, branch_id)
);

-- Tabla de Turnos
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Turnos Spa y Peluquería
CREATE TABLE spa_grooming_appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    service_type VARCHAR(20) CHECK (service_type IN ('spa', 'grooming')),
    reason TEXT,
    status appointment_status DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Emergencias
CREATE TABLE emergencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    reported_by UUID REFERENCES users(id),
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    priority emergency_priority DEFAULT 'medium',
    description TEXT NOT NULL,
    symptoms TEXT,
    status emergency_status DEFAULT 'pending',
    assigned_to UUID REFERENCES employees(id),
    assigned_branch_id UUID REFERENCES branches(id),
    notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Registros Médicos (Historial Clínico)
CREATE TABLE medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    veterinarian_id UUID REFERENCES employees(id),
    record_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    service_type service_type DEFAULT 'consulta', -- 'consulta' o 'estudio'
    reason TEXT,
    diagnosis TEXT,
    treatment TEXT,
    observations TEXT,
    next_visit_date DATE,
    attachments TEXT[], -- Array de URLs de archivos adjuntos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Hospitalizaciones
CREATE TABLE hospitalizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    veterinarian_id UUID REFERENCES employees(id),
    branch_id UUID REFERENCES branches(id),
    admission_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    discharge_date TIMESTAMP WITH TIME ZONE,
    reason TEXT,
    diagnosis TEXT,
    treatment TEXT,
    status hospitalization_status DEFAULT 'active',
    room VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Estudios Médicos (relacionados con hospitalizaciones)
CREATE TABLE studies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospitalization_id UUID REFERENCES hospitalizations(id) ON DELETE CASCADE,
    study_type study_type NOT NULL,
    name VARCHAR(200) NOT NULL,
    study_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    results TEXT,
    performed_by UUID REFERENCES employees(id),
    attachments TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Signos Vitales
CREATE TABLE vital_signs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospitalization_id UUID REFERENCES hospitalizations(id) ON DELETE CASCADE,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    temperature DECIMAL(4, 2),
    heart_rate INTEGER,
    respiratory_rate INTEGER,
    weight DECIMAL(5, 2),
    notes TEXT,
    recorded_by UUID REFERENCES employees(id)
);

-- Tabla de Categorías de Insumos
CREATE TABLE inventory_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Insumos
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category inventory_category NOT NULL,
    inventory_category_id INTEGER REFERENCES inventory_categories(id),
    unit_of_measure VARCHAR(20),
    current_stock DECIMAL(10, 2) DEFAULT 0,
    min_stock DECIMAL(10, 2) DEFAULT 0,
    price DECIMAL(10, 2),
    supplier VARCHAR(200),
    expiry_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Movimientos de Insumos (Ingresos/Egresos)
CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    movement_type VARCHAR(20) CHECK (movement_type IN ('ingreso', 'egreso', 'ajuste')),
    quantity DECIMAL(10, 2) NOT NULL,
    movement_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reason TEXT,
    reference_id UUID, -- ID de servicio, orden, etc. que generó el movimiento
    reference_type VARCHAR(50), -- 'service', 'order', 'adjustment', etc.
    created_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Productos del Marketplace
CREATE TABLE marketplace_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category product_category NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Órdenes del Marketplace
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id),
    user_id UUID REFERENCES users(id), -- Usuario que realizó la compra
    order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method payment_method NOT NULL,
    payment_details JSONB, -- Detalles del pago (número de tarjeta enmascarado, etc.)
    status order_status DEFAULT 'pending',
    shipping_address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Items de Órdenes
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES marketplace_products(id),
    product_name VARCHAR(200) NOT NULL, -- Snapshot del nombre al momento de la compra
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Insumos/Productos utilizados en Servicios
CREATE TABLE service_inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medical_record_id UUID REFERENCES medical_records(id) ON DELETE CASCADE,
    inventory_item_id UUID REFERENCES inventory_items(id),
    quantity_used DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Productos utilizados en Servicios
CREATE TABLE service_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medical_record_id UUID REFERENCES medical_records(id) ON DELETE CASCADE,
    product_id UUID REFERENCES marketplace_products(id),
    quantity_used INTEGER NOT NULL,
    unit_price DECIMAL(10, 2),
    subtotal DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Posts de la Comunidad
CREATE TABLE community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    images TEXT[],
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Likes de Posts
CREATE TABLE post_likes (
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id)
);

-- Tabla de Comentarios de Posts
CREATE TABLE post_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Stories
CREATE TABLE stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Visualizaciones de Stories
CREATE TABLE story_views (
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (story_id, user_id)
);

-- Tabla de Notificaciones
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50), -- 'appointment', 'emergency', 'order', 'system', etc.
    reference_id UUID, -- ID del recurso relacionado
    reference_type VARCHAR(50), -- Tipo de recurso
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE
);

-- Tabla de Permisos de Roles
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role user_role NOT NULL,
    module VARCHAR(100) NOT NULL, -- 'pets', 'appointments', 'inventory', etc.
    can_read BOOLEAN DEFAULT FALSE,
    can_write BOOLEAN DEFAULT FALSE,
    can_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role, module)
);

-- ============================================================================
-- ÍNDICES PARA MEJORAR PERFORMANCE
-- ============================================================================

-- Índices en usuarios
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_client_id ON users(client_id) WHERE client_id IS NOT NULL;
CREATE INDEX idx_users_employee_id ON users(employee_id) WHERE employee_id IS NOT NULL;

-- Índices en clientes
CREATE INDEX idx_clients_person_id ON clients(person_id);

-- Índices en empleados
CREATE INDEX idx_employees_person_id ON employees(person_id);
CREATE INDEX idx_employees_status ON employees(status);

-- Índices en mascotas
CREATE INDEX idx_pets_client_id ON pets(id); -- Para búsquedas por cliente (vía client_pets)
CREATE INDEX idx_pets_animal_id ON pets(animal_id);
CREATE INDEX idx_pets_breed_id ON pets(breed_id);
CREATE INDEX idx_pets_status ON pets(status);
CREATE INDEX idx_client_pets_client_id ON client_pets(client_id);
CREATE INDEX idx_client_pets_pet_id ON client_pets(pet_id);

-- Índices en turnos
CREATE INDEX idx_appointments_pet_id ON appointments(pet_id);
CREATE INDEX idx_appointments_client_id ON appointments(client_id);
CREATE INDEX idx_appointments_veterinarian_id ON appointments(veterinarian_id);
CREATE INDEX idx_appointments_branch_id ON appointments(branch_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_date_time ON appointments(appointment_date, appointment_time);

-- Índices en emergencias
CREATE INDEX idx_emergencies_pet_id ON emergencies(pet_id);
CREATE INDEX idx_emergencies_client_id ON emergencies(client_id);
CREATE INDEX idx_emergencies_status ON emergencies(status);
CREATE INDEX idx_emergencies_priority ON emergencies(priority);
CREATE INDEX idx_emergencies_reported_at ON emergencies(reported_at);

-- Índices en registros médicos
CREATE INDEX idx_medical_records_pet_id ON medical_records(pet_id);
CREATE INDEX idx_medical_records_veterinarian_id ON medical_records(veterinarian_id);
CREATE INDEX idx_medical_records_date ON medical_records(record_date);
CREATE INDEX idx_medical_records_service_type ON medical_records(service_type);

-- Índices en hospitalizaciones
CREATE INDEX idx_hospitalizations_pet_id ON hospitalizations(pet_id);
CREATE INDEX idx_hospitalizations_client_id ON hospitalizations(client_id);
CREATE INDEX idx_hospitalizations_status ON hospitalizations(status);
CREATE INDEX idx_hospitalizations_admission_date ON hospitalizations(admission_date);

-- Índices en inventario
CREATE INDEX idx_inventory_items_category ON inventory_items(category);
CREATE INDEX idx_inventory_items_name ON inventory_items USING gin(name gin_trgm_ops); -- Búsqueda de texto
CREATE INDEX idx_inventory_movements_item_id ON inventory_movements(inventory_item_id);
CREATE INDEX idx_inventory_movements_date ON inventory_movements(movement_date);

-- Índices en órdenes
CREATE INDEX idx_orders_client_id ON orders(client_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_orders_status ON orders(status);

-- Índices en notificaciones
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Índices en posts de comunidad
CREATE INDEX idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX idx_community_posts_created_at ON community_posts(created_at DESC);

-- ============================================================================
-- FUNCIONES Y TRIGGERS
-- ============================================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_persons_updated_at BEFORE UPDATE ON persons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON pets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emergencies_updated_at BEFORE UPDATE ON emergencies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON medical_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hospitalizations_updated_at BEFORE UPDATE ON hospitalizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketplace_products_updated_at BEFORE UPDATE ON marketplace_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar contadores de posts
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE community_posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE community_posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_post_like_count_trigger
    AFTER INSERT OR DELETE ON post_likes
    FOR EACH ROW EXECUTE FUNCTION update_post_like_count();

-- Función para actualizar contador de comentarios
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE community_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE community_posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_post_comment_count_trigger
    AFTER INSERT OR DELETE ON post_comments
    FOR EACH ROW EXECUTE FUNCTION update_post_comment_count();

-- Función para actualizar stock de inventario
CREATE OR REPLACE FUNCTION update_inventory_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.movement_type = 'ingreso' THEN
            UPDATE inventory_items SET current_stock = current_stock + NEW.quantity WHERE id = NEW.inventory_item_id;
        ELSIF NEW.movement_type = 'egreso' THEN
            UPDATE inventory_items SET current_stock = current_stock - NEW.quantity WHERE id = NEW.inventory_item_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Revertir movimiento anterior
        IF OLD.movement_type = 'ingreso' THEN
            UPDATE inventory_items SET current_stock = current_stock - OLD.quantity WHERE id = OLD.inventory_item_id;
        ELSIF OLD.movement_type = 'egreso' THEN
            UPDATE inventory_items SET current_stock = current_stock + OLD.quantity WHERE id = OLD.inventory_item_id;
        END IF;
        -- Aplicar nuevo movimiento
        IF NEW.movement_type = 'ingreso' THEN
            UPDATE inventory_items SET current_stock = current_stock + NEW.quantity WHERE id = NEW.inventory_item_id;
        ELSIF NEW.movement_type = 'egreso' THEN
            UPDATE inventory_items SET current_stock = current_stock - NEW.quantity WHERE id = NEW.inventory_item_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.movement_type = 'ingreso' THEN
            UPDATE inventory_items SET current_stock = current_stock - OLD.quantity WHERE id = OLD.inventory_item_id;
        ELSIF OLD.movement_type = 'egreso' THEN
            UPDATE inventory_items SET current_stock = current_stock + OLD.quantity WHERE id = OLD.inventory_item_id;
        END IF;
        RETURN OLD;
    END IF;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_inventory_stock_trigger
    AFTER INSERT OR UPDATE OR DELETE ON inventory_movements
    FOR EACH ROW EXECUTE FUNCTION update_inventory_stock();

-- ============================================================================
-- VISTAS ÚTILES
-- ============================================================================

-- Vista de Clientes con información completa
CREATE OR REPLACE VIEW clients_full AS
SELECT 
    c.id,
    c.registration_date,
    p.first_name,
    p.last_name,
    p.dni_cuit,
    p.phone,
    p.email,
    p.address,
    p.city,
    p.postal_code,
    p.birth_date,
    p.gender,
    c.notes,
    c.created_at,
    c.updated_at
FROM clients c
JOIN persons p ON c.person_id = p.id;

-- Vista de Mascotas con información completa
CREATE OR REPLACE VIEW pets_full AS
SELECT 
    p.id,
    p.name,
    a.name AS animal_name,
    b.name AS breed_name,
    p.birth_date,
    p.weight,
    p.color,
    p.microchip_number,
    p.photo_url,
    p.status,
    p.status_date,
    p.status_notes,
    p.notes,
    p.created_at,
    p.updated_at
FROM pets p
LEFT JOIN animals a ON p.animal_id = a.id
LEFT JOIN breeds b ON p.breed_id = b.id;

-- Vista de Turnos con información completa
CREATE OR REPLACE VIEW appointments_full AS
SELECT 
    a.id,
    a.appointment_date,
    a.appointment_time,
    a.reason,
    a.status,
    a.notes,
    p.name AS pet_name,
    c.id AS client_id,
    pe.first_name || ' ' || pe.last_name AS client_name,
    e.id AS veterinarian_id,
    pe2.first_name || ' ' || pe2.last_name AS veterinarian_name,
    b.name AS branch_name,
    b.address AS branch_address,
    a.created_at,
    a.updated_at
FROM appointments a
JOIN pets p ON a.pet_id = p.id
JOIN client_pets cp ON p.id = cp.pet_id AND cp.is_primary_owner = TRUE
JOIN clients c ON cp.client_id = c.id
JOIN persons pe ON c.person_id = pe.id
LEFT JOIN employees e ON a.veterinarian_id = e.id
LEFT JOIN persons pe2 ON e.person_id = pe2.id
JOIN branches b ON a.branch_id = b.id;

-- ============================================================================
-- COMENTARIOS EN TABLAS (Documentación)
-- ============================================================================

COMMENT ON TABLE users IS 'Usuarios del sistema con autenticación y roles';
COMMENT ON TABLE persons IS 'Información personal compartida entre clientes y empleados';
COMMENT ON TABLE clients IS 'Clientes de la veterinaria';
COMMENT ON TABLE employees IS 'Empleados de la veterinaria (veterinarios, recepcionistas, etc.)';
COMMENT ON TABLE pets IS 'Mascotas registradas en el sistema';
COMMENT ON TABLE appointments IS 'Turnos para consultas médicas';
COMMENT ON TABLE spa_grooming_appointments IS 'Turnos para servicios de spa y peluquería';
COMMENT ON TABLE emergencies IS 'Emergencias reportadas por clientes o personal';
COMMENT ON TABLE medical_records IS 'Historial clínico de las mascotas';
COMMENT ON TABLE hospitalizations IS 'Internaciones de mascotas';
COMMENT ON TABLE inventory_items IS 'Insumos y productos del inventario';
COMMENT ON TABLE marketplace_products IS 'Productos del marketplace para venta online';
COMMENT ON TABLE orders IS 'Órdenes de compra del marketplace';
COMMENT ON TABLE community_posts IS 'Posts de la comunidad de usuarios';
COMMENT ON TABLE notifications IS 'Notificaciones para usuarios';

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
