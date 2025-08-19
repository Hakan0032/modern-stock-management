-- Check admin user exists and get details
SELECT 
    id,
    username,
    email,
    role,
    is_active,
    password_hash,
    created_at
FROM users 
WHERE email = 'admin@test.com';

-- Also check all users to see what we have
SELECT 
    email,
    role,
    is_active,
    LEFT(password_hash, 10) as password_preview
FROM users 
ORDER BY email;