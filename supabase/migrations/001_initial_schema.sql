-- Initial database schema for Mermer Makinesi Stock Management System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'manager', 'planner', 'operator', 'viewer')),
    department VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suppliers table
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Materials table
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    current_stock DECIMAL(10,2) DEFAULT 0,
    min_stock_level DECIMAL(10,2) DEFAULT 0,
    max_stock_level DECIMAL(10,2) DEFAULT 0,
    unit_price DECIMAL(10,2) DEFAULT 0,
    supplier VARCHAR(255),
    location VARCHAR(100),
    barcode VARCHAR(100),
    image_path VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Machines table
CREATE TABLE machines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    model VARCHAR(100),
    manufacturer VARCHAR(255),
    year INTEGER,
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'maintenance', 'inactive')),
    location VARCHAR(100),
    specifications TEXT,
    maintenance_schedule VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BOM Items table (Bill of Materials)
CREATE TABLE bom_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    material_code VARCHAR(50) NOT NULL,
    material_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    unit_price DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Work Orders table
CREATE TABLE work_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    machine_id UUID NOT NULL REFERENCES machines(id),
    machine_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    planned_start_date TIMESTAMP WITH TIME ZONE,
    planned_end_date TIMESTAMP WITH TIME ZONE,
    actual_start_date TIMESTAMP WITH TIME ZONE,
    actual_end_date TIMESTAMP WITH TIME ZONE,
    customer_name VARCHAR(255),
    customer_contact VARCHAR(255),
    assigned_to VARCHAR(255),
    estimated_hours DECIMAL(8,2),
    actual_hours DECIMAL(8,2),
    estimated_duration DECIMAL(8,2),
    actual_duration DECIMAL(8,2),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Material Movements table
CREATE TABLE material_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID NOT NULL REFERENCES materials(id),
    material_code VARCHAR(50) NOT NULL,
    material_name VARCHAR(255) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('IN', 'OUT')),
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    unit_price DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2) DEFAULT 0,
    reason VARCHAR(255),
    reference VARCHAR(100),
    location VARCHAR(100),
    performed_by VARCHAR(255),
    work_order_id UUID REFERENCES work_orders(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Logs table
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    level VARCHAR(20) NOT NULL CHECK (level IN ('info', 'warning', 'error')),
    category VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    user_id UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    details JSONB,
    error_details TEXT
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_materials_code ON materials(code);
CREATE INDEX idx_materials_category ON materials(category);
CREATE INDEX idx_materials_current_stock ON materials(current_stock);
CREATE INDEX idx_machines_code ON machines(code);
CREATE INDEX idx_machines_status ON machines(status);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_orders_machine_id ON work_orders(machine_id);
CREATE INDEX idx_material_movements_material_id ON material_movements(material_id);
CREATE INDEX idx_material_movements_type ON material_movements(type);
CREATE INDEX idx_material_movements_created_at ON material_movements(created_at);
CREATE INDEX idx_bom_items_machine_id ON bom_items(machine_id);
CREATE INDEX idx_bom_items_material_id ON bom_items(material_id);
CREATE INDEX idx_system_logs_timestamp ON system_logs(timestamp);
CREATE INDEX idx_system_logs_level ON system_logs(level);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_machines_updated_at BEFORE UPDATE ON machines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bom_items_updated_at BEFORE UPDATE ON bom_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON work_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE bom_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow all operations for authenticated users (simplified for development)
CREATE POLICY "Allow all for authenticated users" ON users FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated suppliers" ON suppliers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated materials" ON materials FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated machines" ON machines FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated bom_items" ON bom_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated work_orders" ON work_orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated material_movements" ON material_movements FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated system_logs" ON system_logs FOR ALL USING (auth.role() = 'authenticated');

-- Allow read access for anon users
CREATE POLICY "Allow read for anon users" ON users FOR SELECT USING (auth.role() = 'anon');
CREATE POLICY "Allow read for anon suppliers" ON suppliers FOR SELECT USING (auth.role() = 'anon');
CREATE POLICY "Allow read for anon materials" ON materials FOR SELECT USING (auth.role() = 'anon');
CREATE POLICY "Allow read for anon machines" ON machines FOR SELECT USING (auth.role() = 'anon');
CREATE POLICY "Allow read for anon bom_items" ON bom_items FOR SELECT USING (auth.role() = 'anon');
CREATE POLICY "Allow read for anon work_orders" ON work_orders FOR SELECT USING (auth.role() = 'anon');
CREATE POLICY "Allow read for anon material_movements" ON material_movements FOR SELECT USING (auth.role() = 'anon');
CREATE POLICY "Allow read for anon system_logs" ON system_logs FOR SELECT USING (auth.role() = 'anon');

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON users TO anon;
GRANT ALL PRIVILEGES ON users TO authenticated;
GRANT ALL PRIVILEGES ON suppliers TO authenticated;
GRANT ALL PRIVILEGES ON materials TO authenticated;
GRANT ALL PRIVILEGES ON machines TO authenticated;
GRANT ALL PRIVILEGES ON bom_items TO authenticated;
GRANT ALL PRIVILEGES ON work_orders TO authenticated;
GRANT ALL PRIVILEGES ON material_movements TO authenticated;
GRANT ALL PRIVILEGES ON system_logs TO authenticated;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;