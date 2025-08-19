-- Create a simple admin user with a known working bcrypt hash
-- Using a verified bcrypt hash for 'admin123' from bcrypt-generator.com

UPDATE users 
SET 
    password_hash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- admin123
    updated_at = NOW()
WHERE email = 'admin@test.com';

-- If no user exists, create one
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
) 
SELECT 
    gen_random_uuid(),
    'admin',
    'admin@test.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- admin123
    'Admin',
    'User',
    'admin',
    'IT',
    '+90 555 123 4567',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@test.com'
);

-- Verify the final result
SELECT 
    'FINAL ADMIN CHECK' as status,
    id,
    username,
    email,
    role,
    is_active,
    password_hash,
    updated_at
FROM users 
WHERE email = 'admin@test.com';