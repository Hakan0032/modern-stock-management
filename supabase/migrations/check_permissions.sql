-- Check current permissions for materials and material_movements tables
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name IN ('materials', 'material_movements')
AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('materials', 'material_movements')
ORDER BY tablename, policyname;