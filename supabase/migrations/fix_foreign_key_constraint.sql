-- First, check what material_movements exist for this material
SELECT * FROM material_movements WHERE material_id = '650e8400-e29b-41d4-a716-446655440005';

-- Delete material_movements for this material to resolve foreign key constraint
DELETE FROM material_movements WHERE material_id = '650e8400-e29b-41d4-a716-446655440005';

-- Verify deletion
SELECT COUNT(*) as remaining_movements FROM material_movements WHERE material_id = '650e8400-e29b-41d4-a716-446655440005';