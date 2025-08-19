-- Delete existing admin user and create a new one with a simple password
-- This will ensure we have a clean admin user for testing

-- First delete any existing admin users
DELETE FROM users WHERE email = 'admin@test.com';

-- Create new admin user with bcrypt hash for 'admin123'
-- Using online bcrypt generator with salt rounds 10
INSERT INTO users (
    id,
    username,
    email,
    password_hash,
    first_name,
    last_name,
    role,
    department,
    phone,
    is_active,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'admin',
    'admin@test.com',
    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p02tr9Se/rVM6.nic54NAnGO', -- admin123
    'Admin',
    'User',
    'admin',
    'IT',
    '+90 555 123 4567',
    true,
    NOW(),
    NOW()
);

-- Verify the new user
SELECT 
    'NEW ADMIN USER' as status,
    id,
    username,
    email,
    role,
    is_active,
    LENGTH(password_hash) as hash_length,
    SUBSTRING(password_hash, 1, 30) as hash_preview
FROM users 
WHERE email = 'admin@test.com';