-- Fix admin user password with correct bcrypt hash
-- Password: admin123
-- Hash generated with bcrypt rounds=10

-- First, ensure admin user exists with correct data
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
    '550e8400-e29b-41d4-a716-446655440001',
    'admin',
    'admin@test.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- admin123
    'Admin',
    'User',
    'admin',
    'IT',
    '+90 555 123 4567',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role = 'admin',
    is_active = true,
    updated_at = NOW();

-- Also update by email in case ID doesn't match
UPDATE users 
SET 
    password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role = 'admin',
    is_active = true,
    updated_at = NOW()
WHERE email = 'admin@test.com';

-- Verify the update
SELECT 
    id,
    username,
    email,
    role,
    is_active,
    LENGTH(password_hash) as hash_length,
    SUBSTRING(password_hash, 1, 10) as hash_preview
FROM users 
WHERE email = 'admin@test.com';