-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON categories
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON categories
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON categories
    FOR DELETE USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL PRIVILEGES ON categories TO authenticated;
GRANT SELECT ON categories TO anon;

-- Insert some default categories
INSERT INTO categories (name, description) VALUES
('Elektronik', 'Elektronik malzemeler ve bileşenler'),
('Mekanik', 'Mekanik parçalar ve aksamlar'),
('Kimyasal', 'Kimyasal maddeler ve çözeltiler'),
('Plastik', 'Plastik malzemeler ve ürünler'),
('Metal', 'Metal malzemeler ve alaşımlar')
ON CONFLICT (name) DO NOTHING;