-- Initial data for Mermer Makinesi Stock Management System

-- Insert initial users (passwords are hashed versions of 'admin123', 'user123', etc.)
INSERT INTO users (id, username, email, password_hash, first_name, last_name, role, department, phone, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin', 'admin@test.com', '$2a$10$36eJlMTCNlmn207gx3PM7Oet3keabzTFa.Lr1JHmT09Gneya7MLma', 'Admin', 'User', 'admin', 'IT', '+90 555 123 4567', true),
('550e8400-e29b-41d4-a716-446655440002', 'user', 'user@test.com', '$2a$10$XXuFR5qwk.WzQoOsvoWsuuRu36ySLrgmcV2iD5s5/bbRVDtpm4.S6', 'Test', 'User', 'operator', 'Production', '+90 555 123 4568', true),
('550e8400-e29b-41d4-a716-446655440003', 'depo_sorumlusu', 'depo@mermermakinesi.com', '$2a$10$wd0eZ9qvUPxqfbcwHosAUu69/Gn3wQE9Eus8mGW/cnowuyqXMvAIC', 'Depo', 'Sorumlusu', 'operator', 'Depo', '+90 555 123 4569', true),
('550e8400-e29b-41d4-a716-446655440004', 'teknisyen_ali', 'teknisyen@mermermakinesi.com', '$2a$10$wd0eZ9qvUPxqfbcwHosAUu69/Gn3wQE9Eus8mGW/cnowuyqXMvAIC', 'Ali', 'Teknisyen', 'operator', 'Teknik', '+90 555 123 4570', true),
('550e8400-e29b-41d4-a716-446655440005', 'planlama_uzmani', 'planlama@mermermakinesi.com', '$2a$10$wd0eZ9qvUPxqfbcwHosAUu69/Gn3wQE9Eus8mGW/cnowuyqXMvAIC', 'Planlama', 'Uzmanı', 'planner', 'Planlama', '+90 555 123 4571', true);

-- Insert suppliers
INSERT INTO suppliers (id, name, contact_person, email, phone, address) VALUES
(1, 'Elektrik Malzemeleri A.Ş.', 'Mehmet Yılmaz', 'info@elektrikmalzeme.com', '+90 212 555 0001', 'İstanbul, Türkiye'),
(2, 'Pano Sistemleri Ltd.', 'Ayşe Kaya', 'satis@panosistem.com', '+90 312 555 0002', 'Ankara, Türkiye'),
(3, 'Mekanik Parça Tedarik', 'Fatih Özkan', 'siparis@mekanikparca.com', '+90 232 555 0003', 'İzmir, Türkiye');

-- Insert materials
INSERT INTO materials (id, code, name, description, category, unit, current_stock, min_stock_level, max_stock_level, unit_price, supplier, location, barcode) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'ELK001', 'Sigorta 16A', 'Elektrik panoları için 16A sigorta', 'electrical', 'piece', 100, 20, 200, 5.50, 'Elektrik Malzemeleri A.Ş.', 'A-01-01', '1234567890123'),
('650e8400-e29b-41d4-a716-446655440002', 'ELK002', 'Kontaktör 25A', 'Motor kontrol için 25A kontaktör', 'electrical', 'piece', 15, 10, 50, 45.00, 'Elektrik Malzemeleri A.Ş.', 'A-01-02', '1234567890124'),
('650e8400-e29b-41d4-a716-446655440003', 'PAN001', 'Pano Kapısı 400x600', 'Elektrik panosu kapısı 400x600mm', 'panel', 'piece', 25, 5, 30, 120.00, 'Pano Sistemleri Ltd.', 'B-01-01', '1234567890125'),
('650e8400-e29b-41d4-a716-446655440004', 'MEK001', 'Vida M8x20', 'Altı köşe başlı vida M8x20mm', 'mechanical', 'piece', 500, 100, 1000, 0.25, 'Mekanik Parça Tedarik', 'C-01-01', '1234567890126'),
('650e8400-e29b-41d4-a716-446655440005', 'ELK003', 'Kablo 2.5mm²', 'Elektrik kablosu 2.5mm² kesit', 'electrical', 'meter', 8, 50, 500, 3.20, 'Elektrik Malzemeleri A.Ş.', 'A-02-01', '1234567890127');

-- Insert machines
INSERT INTO machines (id, code, name, category, model, manufacturer, year, status, location, specifications, maintenance_schedule) VALUES
('750e8400-e29b-41d4-a716-446655440001', 'SM-2000', 'Silim Makinesi SM-2000', 'Silim', 'SM-2000', 'Mermer Makineleri A.Ş.', 2023, 'active', 'Üretim Sahası A', 'Mermer silim işlemleri için kullanılan makine - v2.1', 'Aylık'),
('750e8400-e29b-41d4-a716-446655440002', 'TM-1500', 'Tırmık Makinesi TM-1500', 'Tırmık', 'TM-1500', 'Mermer Makineleri A.Ş.', 2022, 'active', 'Üretim Sahası B', 'Mermer yüzey tırmıklama makinesi - v1.8', 'Aylık'),
('750e8400-e29b-41d4-a716-446655440003', 'YM-3000', 'Yarma Makinesi YM-3000', 'Yarma', 'YM-3000', 'Mermer Makineleri A.Ş.', 2024, 'active', 'Üretim Sahası C', 'Mermer yarma ve kesim makinesi - v3.0', 'Aylık');

-- Insert BOM items
INSERT INTO bom_items (id, machine_id, material_id, material_code, material_name, quantity, unit, unit_price, notes) VALUES
-- Silim Makinesi BOM
('850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'ELK001', 'Sigorta 16A', 4, 'piece', 5.50, 'Ana güç sigortası'),
('850e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', 'ELK002', 'Kontaktör 25A', 2, 'piece', 45.00, 'Motor kontaktörü'),
('850e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003', 'PAN001', 'Pano Kapısı 400x600', 1, 'piece', 120.00, 'Elektrik panosu'),
('850e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440004', 'MEK001', 'Vida M8x20', 20, 'piece', 0.25, 'Montaj vidaları'),
('850e8400-e29b-41d4-a716-446655440005', '750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440005', 'ELK003', 'Kablo 2.5mm²', 15, 'meter', 3.20, 'Güç kablosu'),
-- Tırmık Makinesi BOM
('850e8400-e29b-41d4-a716-446655440006', '750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', 'ELK001', 'Sigorta 16A', 2, 'piece', 5.50, 'Güç sigortası'),
('850e8400-e29b-41d4-a716-446655440007', '750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', 'ELK002', 'Kontaktör 25A', 1, 'piece', 45.00, 'Kontaktör'),
('850e8400-e29b-41d4-a716-446655440008', '750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440004', 'MEK001', 'Vida M8x20', 15, 'piece', 0.25, 'Montaj vidaları'),
('850e8400-e29b-41d4-a716-446655440009', '750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440005', 'ELK003', 'Kablo 2.5mm²', 10, 'meter', 3.20, 'Kablo bağlantısı'),
-- Yarma Makinesi BOM
('850e8400-e29b-41d4-a716-446655440010', '750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001', 'ELK001', 'Sigorta 16A', 6, 'piece', 5.50, 'Ana güç sigortası'),
('850e8400-e29b-41d4-a716-446655440011', '750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440002', 'ELK002', 'Kontaktör 25A', 3, 'piece', 45.00, 'Motor kontaktörü'),
('850e8400-e29b-41d4-a716-446655440012', '750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440003', 'PAN001', 'Pano Kapısı 400x600', 2, 'piece', 120.00, 'Elektrik panosu'),
('850e8400-e29b-41d4-a716-446655440013', '750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440004', 'MEK001', 'Vida M8x20', 30, 'piece', 0.25, 'Montaj vidaları'),
('850e8400-e29b-41d4-a716-446655440014', '750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440005', 'ELK003', 'Kablo 2.5mm²', 25, 'meter', 3.20, 'Güç kablosu');

-- Insert work orders
INSERT INTO work_orders (id, order_number, title, description, machine_id, machine_name, quantity, status, priority, planned_start_date, planned_end_date, actual_start_date, customer_name, customer_contact, assigned_to, estimated_hours, actual_hours, notes, created_by) VALUES
('950e8400-e29b-41d4-a716-446655440001', 'WO-2024-001', 'Silim Makinesi Üretimi', 'ABC Mermer Ltd. için 2 adet silim makinesi üretimi', '750e8400-e29b-41d4-a716-446655440001', 'Silim Makinesi SM-2000', 2, 'IN_PROGRESS', 'HIGH', '2024-01-15T08:00:00Z', '2024-01-25T17:00:00Z', '2024-01-15T08:30:00Z', 'ABC Mermer Ltd.', 'Ahmet Yılmaz', 'Mehmet Demir', 80, 45, 'Müşteri özel renk talebi var', '550e8400-e29b-41d4-a716-446655440002'),
('950e8400-e29b-41d4-a716-446655440002', 'WO-2024-002', 'Tırmık Makinesi Bakımı', 'XYZ Taş İşleri için tırmık makinesi periyodik bakımı', '750e8400-e29b-41d4-a716-446655440002', 'Tırmık Makinesi TM-1500', 1, 'PLANNED', 'MEDIUM', '2024-01-20T09:00:00Z', '2024-01-28T16:00:00Z', NULL, 'XYZ Taş İşleri', 'Fatma Kaya', 'Ali Veli', 40, NULL, 'Yedek parça tedariki bekleniyor', '550e8400-e29b-41d4-a716-446655440002'),
('950e8400-e29b-41d4-a716-446655440003', 'WO-2024-003', 'Yarma Makinesi Kurulumu', 'DEF Mermer A.Ş. için yeni yarma makinesi kurulumu', '750e8400-e29b-41d4-a716-446655440003', 'Yarma Makinesi YM-3000', 1, 'PLANNED', 'LOW', '2024-02-01T08:00:00Z', '2024-02-10T17:00:00Z', NULL, 'DEF Mermer A.Ş.', 'Hasan Özkan', 'Ayşe Yıldız', 60, NULL, 'Saha hazırlığı tamamlanmalı', '550e8400-e29b-41d4-a716-446655440001');

-- Insert material movements
INSERT INTO material_movements (id, material_id, material_code, material_name, type, quantity, unit, unit_price, total_price, reason, reference, location, performed_by, work_order_id) VALUES
('a50e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'ELK001', 'Sigorta 16A', 'IN', 50, 'piece', 5.50, 275.00, 'Satın Alma', 'F2024001', 'A-01-01', 'Ayşe Yılmaz', NULL),
('a50e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', 'ELK002', 'Kontaktör 25A', 'OUT', 4, 'piece', 45.00, 180.00, 'Üretim', 'WO-2024-001', 'A-01-02', 'Mehmet Demir', '950e8400-e29b-41d4-a716-446655440001'),
('a50e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440005', 'ELK003', 'Kablo 2.5mm²', 'OUT', 30, 'meter', 3.20, 96.00, 'Üretim', 'WO-2024-001', 'A-02-01', 'Mehmet Demir', '950e8400-e29b-41d4-a716-446655440001'),
('a50e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440003', 'PAN001', 'Pano Kapısı 400x600', 'IN', 10, 'piece', 120.00, 1200.00, 'Satın Alma', 'F2024002', 'B-01-01', 'Ayşe Yılmaz', NULL),
('a50e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440004', 'MEK001', 'Vida M8x20', 'OUT', 40, 'piece', 0.25, 10.00, 'Üretim', 'WO-2024-001', 'C-01-01', 'Mehmet Demir', '950e8400-e29b-41d4-a716-446655440001');

-- Insert some system logs
INSERT INTO system_logs (id, level, category, message, user_id, details) VALUES
('b50e8400-e29b-41d4-a716-446655440001', 'info', 'Authentication', 'User logged in successfully', '550e8400-e29b-41d4-a716-446655440001', '{"ip": "192.168.1.100", "userAgent": "Mozilla/5.0"}'),
('b50e8400-e29b-41d4-a716-446655440002', 'info', 'Material', 'Material stock updated', '550e8400-e29b-41d4-a716-446655440002', '{"materialId": "650e8400-e29b-41d4-a716-446655440001", "oldStock": 50, "newStock": 100}'),
('b50e8400-e29b-41d4-a716-446655440003', 'warning', 'Stock', 'Low stock alert triggered', NULL, '{"materialId": "650e8400-e29b-41d4-a716-446655440005", "currentStock": 8, "minLevel": 50}');

-- Update sequences to avoid conflicts
SELECT setval('suppliers_id_seq', 10, true);