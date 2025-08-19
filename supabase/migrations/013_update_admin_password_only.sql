-- Update admin user password only (don't delete due to foreign key constraints)
-- Using a verified bcrypt hash for 'admin123'

UPDATE users 
SET 
    password_hash = '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p02tr9Se/rVM6.nic54NAnGO', -- admin123
    role = 'admin',
    is_active = true,
    updated_at = NOW()
WHERE email = 'admin@test.com';

-- Verify the update
SELECT 
    'UPDATED ADMIN USER' as status,
    id,
    username,
    email,
    role,
    is_active,
    LENGTH(password_hash) as hash_length,
    SUBSTRING(password_hash, 1, 30) as hash_preview,
    updated_at
FROM users 
WHERE email = 'admin@test.com';