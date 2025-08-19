-- Check admin user role in database
SELECT id, username, email, role, is_active, created_at 
FROM users 
WHERE email = 'admin@test.com';