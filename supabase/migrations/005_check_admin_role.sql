-- Check admin user role and details
SELECT 
    id,
    username,
    email,
    role,
    is_active,
    first_name,
    last_name,
    created_at
FROM users 
WHERE email = 'admin@test.com';

-- Also check all users to see their roles
SELECT 
    email,
    role,
    is_active
FROM users 
ORDER BY email;