-- Grant DELETE permissions to anon and authenticated roles for all tables
GRANT DELETE ON materials TO anon, authenticated;
GRANT DELETE ON machines TO anon, authenticated;
GRANT DELETE ON work_orders TO anon, authenticated;
GRANT DELETE ON material_movements TO anon, authenticated;
GRANT DELETE ON bom_items TO anon, authenticated;
GRANT DELETE ON suppliers TO anon, authenticated;
GRANT DELETE ON categories TO anon, authenticated;
GRANT DELETE ON users TO anon, authenticated;
GRANT DELETE ON system_logs TO anon, authenticated;

-- Create RLS policies for DELETE operations
-- Materials DELETE policy
DROP POLICY IF EXISTS "Allow delete for all users" ON materials;
CREATE POLICY "Allow delete for all users" ON materials
    FOR DELETE
    USING (true);

-- Machines DELETE policy
DROP POLICY IF EXISTS "Allow delete for all users" ON machines;
CREATE POLICY "Allow delete for all users" ON machines
    FOR DELETE
    USING (true);

-- Work Orders DELETE policy
DROP POLICY IF EXISTS "Allow delete for all users" ON work_orders;
CREATE POLICY "Allow delete for all users" ON work_orders
    FOR DELETE
    USING (true);

-- Material Movements DELETE policy
DROP POLICY IF EXISTS "Allow delete for all users" ON material_movements;
CREATE POLICY "Allow delete for all users" ON material_movements
    FOR DELETE
    USING (true);

-- BOM Items DELETE policy
DROP POLICY IF EXISTS "Allow delete for all users" ON bom_items;
CREATE POLICY "Allow delete for all users" ON bom_items
    FOR DELETE
    USING (true);

-- Suppliers DELETE policy
DROP POLICY IF EXISTS "Allow delete for all users" ON suppliers;
CREATE POLICY "Allow delete for all users" ON suppliers
    FOR DELETE
    USING (true);

-- Categories DELETE policy
DROP POLICY IF EXISTS "Allow delete for all users" ON categories;
CREATE POLICY "Allow delete for all users" ON categories
    FOR DELETE
    USING (true);

-- Users DELETE policy
DROP POLICY IF EXISTS "Allow delete for all users" ON users;
CREATE POLICY "Allow delete for all users" ON users
    FOR DELETE
    USING (true);

-- System Logs DELETE policy
DROP POLICY IF EXISTS "Allow delete for all users" ON system_logs;
CREATE POLICY "Allow delete for all users" ON system_logs
    FOR DELETE
    USING (true);

-- Verify permissions
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND grantee IN ('anon', 'authenticated')
    AND privilege_type = 'DELETE'
ORDER BY table_name, grantee;