-- Fix admin user role
UPDATE users 
SET role = 'admin'
WHERE email = 'admin@test.com';

-- Verify the update
SELECT 
    email,
    role,
    is_active
FROM users 
WHERE email = 'admin@test.com';