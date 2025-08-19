-- Check current permissions for materials table
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'materials' 
AND grantee IN ('anon', 'authenticated', 'service_role') 
ORDER BY table_name, grantee;

-- Grant DELETE permission to authenticated role
GRANT DELETE ON materials TO authenticated;

-- Grant DELETE permission to service_role (should already have it)
GRANT DELETE ON materials TO service_role;

-- Check permissions again
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'materials' 
AND grantee IN ('anon', 'authenticated', 'service_role') 
ORDER BY table_name, grantee;