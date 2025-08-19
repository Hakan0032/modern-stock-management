-- Update user passwords with correct bcrypt hashes

-- Update admin user password
UPDATE users 
SET password_hash = '$2a$10$36eJlMTCNlmn207gx3PM7Oet3keabzTFa.Lr1JHmT09Gneya7MLma'
WHERE email = 'admin@test.com';

-- Update user password
UPDATE users 
SET password_hash = '$2a$10$XXuFR5qwk.WzQoOsvoWsuuRu36ySLrgmcV2iD5s5/bbRVDtpm4.S6'
WHERE email = 'user@test.com';

-- Update other users with password123
UPDATE users 
SET password_hash = '$2a$10$wd0eZ9qvUPxqfbcwHosAUu69/Gn3wQE9Eus8mGW/cnowuyqXMvAIC'
WHERE email IN ('depo@mermermakinesi.com', 'teknisyen@mermermakinesi.com', 'planlama@mermermakinesi.com');