-- Try a different bcrypt hash for admin123
-- Using a well-known bcrypt hash that should work

UPDATE users 
SET 
    password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- admin123
    updated_at = NOW()
WHERE email = 'admin@test.com';

-- Verify the update
SELECT 
    'FINAL ADMIN UPDATE' as status,
    id,
    username,
    email,
    role,
    is_active,
    password_hash,
    updated_at
FROM users 
WHERE email = 'admin@test.com';