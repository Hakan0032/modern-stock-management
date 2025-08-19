-- Check current admin user status
SELECT 
    id,
    username,
    email,
    role,
    is_active,
    created_at,
    updated_at
FROM users 
WHERE email = 'admin@test.com';

-- Check all users to see current state
SELECT 
    email,
    role,
    is_active
FROM users 
ORDER BY email;