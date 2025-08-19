-- Ensure admin@test.com user has admin role
UPDATE users 
SET role = 'admin', 
    is_active = true,
    updated_at = now()
WHERE email = 'admin@test.com';

-- Verify the update
SELECT id, username, email, role, is_active 
FROM users 
WHERE email = 'admin@test.com';