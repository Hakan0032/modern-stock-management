-- Check all users in the database
SELECT 
    id,
    username,
    email,
    role,
    is_active,
    LENGTH(password_hash) as hash_length,
    SUBSTRING(password_hash, 1, 20) as hash_preview,
    created_at,
    updated_at
FROM users 
ORDER BY created_at;

-- Specifically check admin user
SELECT 
    'ADMIN USER CHECK' as check_type,
    id,
    username,
    email,
    role,
    is_active,
    password_hash,
    created_at,
    updated_at
FROM users 
WHERE email = 'admin@test.com';