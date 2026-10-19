-- =====================================================================
-- SCRIPT LÀM PHONG PHÚ DỮ LIỆU CỬA HÀNG: "Tạp hóa Messi Goat"
-- Store ID: c39e9ba4-0b8b-484e-8f56-90515e0cb0ac
-- Owner / Cashier ID: ce1c37e4-08d2-4c73-b3df-72bfca7a57f2
-- =====================================================================

BEGIN;
-- 1. TẠO CÁC DANH MỤC HỆ THỐNG (CATEGORIES) NẾU CHƯA CÓ
INSERT INTO categories (id, code, name) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'THUC_PHAM_KHO', 'Thực phẩm khô & Đóng gói'),
  ('a1000000-0000-0000-0000-000000000002', 'DO_UONG', 'Đồ uống & Giải khát'),
  ('a1000000-0000-0000-0000-000000000003', 'BO_SUA', 'Bơ sữa & Tráng miệng'),
  ('a1000000-0000-0000-0000-000000000004', 'GIA_VI', 'Gia vị & Dầu ăn'),
  ('a1000000-0000-0000-0000-000000000005', 'HOA_MY_PHAM', 'Hóa mỹ phẩm & Tẩy rửa'),
  ('a1000000-0000-0000-0000-000000000006', 'BANH_KEO', 'Bánh kẹo & Ăn vặt')
ON CONFLICT (code) DO NOTHING;

-- 2. TẠO CÁC NGÀNH HÀNG RIÊNG CHO TIỆM "Tạp hóa Messi Goat"
INSERT INTO store_categories (id, store_id, name, category_id) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'c39e9ba4-0b8b-484e-8f56-90515e0cb0ac', 'Thực phẩm khô & Đóng gói', 'a1000000-0000-0000-0000-000000000001'),
  ('b1000000-0000-0000-0000-000000000002', 'c39e9ba4-0b8b-484e-8f56-90515e0cb0ac', 'Đồ uống & Giải khát', 'a1000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000003', 'c39e9ba4-0b8b-484e-8f56-90515e0cb0ac', 'Bơ sữa & Tráng miệng', 'a1000000-0000-0000-0000-000000000003'),
  ('b1000000-0000-0000-0000-000000000004', 'c39e9ba4-0b8b-484e-8f56-90515e0cb0ac', 'Gia vị & Dầu ăn', 'a1000000-0000-0000-0000-000000000004'),
  ('b1000000-0000-0000-0000-000000000005', 'c39e9ba4-0b8b-484e-8f56-90515e0cb0ac', 'Hóa mỹ phẩm & Tẩy rửa', 'a1000000-0000-0000-0000-000000000005'),
  ('b1000000-0000-0000-0000-000000000006', 'c39e9ba4-0b8b-484e-8f56-90515e0cb0ac', 'Bánh kẹo & Ăn vặt', 'a1000000-0000-0000-0000-000000000006')
ON CONFLICT (store_id, name) DO NOTHING;

-- 3. TẠO DANH MỤC SẢN PHẨM HỆ THỐNG (PRODUCTS) VỚI BARCODE CHUẨN
INSERT INTO products (id, barcode, original_name, description) VALUES
  ('c1000000-0000-0000-0000-000000000001', '893456000001', 'Mì ăn liền Hảo Hảo tôm chua cay (Thùng 30 gói)', 'Thùng 30 gói x 75g Acecook'),
  ('c1000000-0000-0000-0000-000000000002', '893456000002', 'Nước ngọt Coca Cola lon 320ml (Lốc 6 lon)', 'Lốc 6 lon x 320ml Coca Cola'),
  ('c1000000-0000-0000-0000-000000000003', '893456000003', 'Sữa chua Vinamilk có đường (Vỉ 4 hộp)', 'Vỉ 4 hộp x 100g Vinamilk'),
  ('c1000000-0000-0000-0000-000000000004', '893456000004', 'Dầu ăn Simply đậu nành chai 1L', 'Chai 1 lít tinh luyện Simply'),
  ('c1000000-0000-0000-0000-000000000005', '893456000005', 'Bột giặt OMO Comfort tinh dầu thơm 3kg', 'Túi 3kg hương hoa tinh tế OMO'),
  ('c1000000-0000-0000-0000-000000000006', '893456000006', 'Nước tăng lực Redbull lon 250ml', 'Lon 250ml nắp đỏ nhập khẩu'),
  ('c1000000-0000-0000-0000-000000000007', '893456000007', 'Sữa tươi tiệt trùng Vinamilk 100% 180ml (Lốc 4 hộp)', 'Lốc 4 hộp x 180ml sữa tiệt trùng'),
  ('c1000000-0000-0000-0000-000000000008', '893456000008', 'Nước mắm Nam Ngư Đệ Nhị 900ml', 'Chai 900ml Chin-Su Nam Ngư'),
  ('c1000000-0000-0000-0000-000000000009', '893456000009', 'Nước rửa chén Sunlight Chanh 750g', 'Chai 750g hương chanh diệt khuẩn'),
  ('c1000000-0000-0000-0000-000000000010', '893456000010', 'Bánh Chocopie Orion (Hộp 12 cái)', 'Hộp 12 cái 396g mềm béo'),
  ('c1000000-0000-0000-0000-000000000011', '893456000011', 'Snack khoai tây Lay''s vị tự nhiên 95g', 'Gói 95g giòn rụm thơm ngon'),
  ('c1000000-0000-0000-0000-000000000012', '893456000012', 'Xúc xích tiệt trùng Vissan (Gói 5 cây)', 'Gói 5 cây x 35g bò heo dinh dưỡng')
ON CONFLICT (barcode) DO NOTHING;

-- 4. TẠO TỒN KHO CHO TIỆM "Tạp hóa Messi Goat" (CÓ CẢ HÀNG BÌNH THƯỜNG VÀ LOW STOCK)
INSERT INTO store_inventories (
  id, store_id, product_id, store_category_id, custom_name,
  quantity, cost_price, selling_price, low_stock_threshold
) VALUES
  -- 1. Mì Hảo Hảo Thùng (Bình thường: 58 thùng)
  (gen_random_uuid(), 'c39e9ba4-0b8b-484e-8f56-90515e0cb0ac', 'c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Mì ăn liền Hảo Hảo tôm chua cay (Thùng 30 gói)', 58, 92000.00, 110000.00, 15),
  
  -- 2. Coca Cola Lốc (Bình thường: 112 lốc)
  (gen_random_uuid(), 'c39e9ba4-0b8b-484e-8f56-90515e0cb0ac', 'c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 'Nước ngọt Coca Cola lon 320ml (Lốc 6 lon)', 112, 48000.00, 58000.00, 20),
  
  -- 3. Sữa chua Vinamilk Vỉ (Bình thường: 35 vỉ)
  (gen_random_uuid(), 'c39e9ba4-0b8b-484e-8f56-90515e0cb0ac', 'c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000003', 'Sữa chua Vinamilk có đường (Vỉ 4 hộp)', 35, 24000.00, 30000.00, 10),
  
  -- 4. Dầu ăn Simply (LOW STOCK: 12 chai <= ngưỡng 15)
  (gen_random_uuid(), 'c39e9ba4-0b8b-484e-8f56-90515e0cb0ac', 'c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000004', 'Dầu ăn Simply đậu nành chai 1L', 12, 53000.00, 65000.00, 15),
  
  -- 5. Bột giặt OMO (LOW STOCK: 6 túi <= ngưỡng 10)
  (gen_random_uuid(), 'c39e9ba4-0b8b-484e-8f56-90515e0cb0ac', 'c1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000005', 'Bột giặt OMO Comfort tinh dầu thơm 3kg', 6, 130000.00, 160000.00, 10),
  
  -- 6. Nước tăng lực Redbull (Bình thường: 85 lon)
  (gen_random_uuid(), 'c39e9ba4-0b8b-484e-8f56-90515e0cb0ac', 'c1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000002', 'Nước tăng lực Redbull lon 250ml', 85, 10000.00, 14000.00, 24),
  
  -- 7. Sữa tươi Vinamilk (Bình thường: 46 lốc)
  (gen_random_uuid(), 'c39e9ba4-0b8b-484e-8f56-90515e0cb0ac', 'c1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000003', 'Sữa tươi tiệt trùng Vinamilk 100% 180ml (Lốc 4 hộp)', 46, 28000.00, 35000.00, 15),
  
  -- 8. Nước mắm Nam Ngư (Bình thường: 40 chai)
  (gen_random_uuid(), 'c39e9ba4-0b8b-484e-8f56-90515e0cb0ac', 'c1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000004', 'Nước mắm Nam Ngư Đệ Nhị 900ml', 40, 22000.00, 29000.00, 10),
  
  -- 9. Nước rửa chén Sunlight (LOW STOCK: 3 chai <= ngưỡng 8)
  (gen_random_uuid(), 'c39e9ba4-0b8b-484e-8f56-90515e0cb0ac', 'c1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000005', 'Nước rửa chén Sunlight Chanh 750g', 3, 23000.00, 30000.00, 8),
  
  -- 10. Bánh Chocopie (Bình thường: 65 hộp)
  (gen_random_uuid(), 'c39e9ba4-0b8b-484e-8f56-90515e0cb0ac', 'c1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000006', 'Bánh Chocopie Orion (Hộp 12 cái)', 65, 42000.00, 52000.00, 15),
  
  -- 11. Snack Lay's (Bình thường: 90 gói)
  (gen_random_uuid(), 'c39e9ba4-0b8b-484e-8f56-90515e0cb0ac', 'c1000000-0000-0000-0000-000000000011', 'b1000000-0000-0000-0000-000000000006', 'Snack khoai tây Lay''s vị tự nhiên 95g', 90, 16000.00, 22000.00, 20),
  
  -- 12. Xúc xích Vissan (Bình thường: 55 gói)
  (gen_random_uuid(), 'c39e9ba4-0b8b-484e-8f56-90515e0cb0ac', 'c1000000-0000-0000-0000-000000000012', 'b1000000-0000-0000-0000-000000000001', 'Xúc xích tiệt trùng Vissan (Gói 5 cây)', 55, 18000.00, 25000.00, 15)
ON CONFLICT (store_id, product_id) DO UPDATE SET
  quantity = EXCLUDED.quantity,
  cost_price = EXCLUDED.cost_price,
  selling_price = EXCLUDED.selling_price,
  low_stock_threshold = EXCLUDED.low_stock_threshold;

-- 5. TẠO CÁC ĐƠN BÁN HÀNG MẪU (SALES ORDERS & ORDER ITEMS) TRONG THÁNG NÀY
-- Đơn hàng 1: Khách mua Mì Hảo Hảo + Coca + Sữa chua (Tổng: 406.000 đ)
INSERT INTO sales_orders (id, store_id, cashier_id, total_amount, payment_method, created_at)
VALUES ('d1000000-0000-0000-0000-000000000001', 'c39e9ba4-0b8b-484e-8f56-90515e0cb0ac', 'ce1c37e4-08d2-4c73-b3df-72bfca7a57f2', 406000.00, 'CASH', NOW() - INTERVAL '1 day 3 hours');

INSERT INTO sales_order_items (id, sales_order_id, product_id, quantity, unit_price, unit_cost) VALUES
  (gen_random_uuid(), 'd1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 2, 110000.00, 92000.00), -- 2 Thùng mì
  (gen_random_uuid(), 'd1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 2, 58000.00, 48000.00),   -- 2 Lốc Coca
  (gen_random_uuid(), 'd1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000003', 2, 35000.00, 28000.00);   -- 2 Vỉ sữa chua

-- Đơn hàng 2: Khách mua Bột giặt Omo + Dầu ăn Simply + Sunlight (Tổng: 255.000 đ)
INSERT INTO sales_orders (id, store_id, cashier_id, total_amount, payment_method, created_at)
VALUES ('d1000000-0000-0000-0000-000000000002', 'c39e9ba4-0b8b-484e-8f56-90515e0cb0ac', 'ce1c37e4-08d2-4c73-b3df-72bfca7a57f2', 255000.00, 'TRANSFER', NOW() - INTERVAL '2 days 5 hours');

INSERT INTO sales_order_items (id, sales_order_id, product_id, quantity, unit_price, unit_cost) VALUES
  (gen_random_uuid(), 'd1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000005', 1, 160000.00, 130000.00), -- 1 Túi OMO
  (gen_random_uuid(), 'd1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000004', 1, 65000.00, 53000.00),   -- 1 Chai Simply
  (gen_random_uuid(), 'd1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000009', 1, 30000.00, 23000.00);   -- 1 Chai Sunlight

-- Đơn hàng 3: Đơn số lượng lớn (Mì Hảo Hảo 25 thùng + Coca 20 lốc) (Tổng: 3.910.000 đ)
INSERT INTO sales_orders (id, store_id, cashier_id, total_amount, payment_method, created_at)
VALUES ('d1000000-0000-0000-0000-000000000003', 'c39e9ba4-0b8b-484e-8f56-90515e0cb0ac', 'ce1c37e4-08d2-4c73-b3df-72bfca7a57f2', 3910000.00, 'TRANSFER', NOW() - INTERVAL '3 days 1 hour');

INSERT INTO sales_order_items (id, sales_order_id, product_id, quantity, unit_price, unit_cost) VALUES
  (gen_random_uuid(), 'd1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', 25, 110000.00, 92000.00), -- 25 Thùng mì
  (gen_random_uuid(), 'd1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000002', 20, 58000.00, 48000.00);  -- 20 Lốc Coca

-- Đơn hàng 4: Khách mua Bánh Chocopie + Snack Lays + Xúc xích (Tổng: 146.000 đ)
INSERT INTO sales_orders (id, store_id, cashier_id, total_amount, payment_method, created_at)
VALUES ('d1000000-0000-0000-0000-000000000004', 'c39e9ba4-0b8b-484e-8f56-90515e0cb0ac', 'ce1c37e4-08d2-4c73-b3df-72bfca7a57f2', 146000.00, 'CASH', NOW() - INTERVAL '12 hours');

INSERT INTO sales_order_items (id, sales_order_id, product_id, quantity, unit_price, unit_cost) VALUES
  (gen_random_uuid(), 'd1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000010', 1, 52000.00, 42000.00), -- 1 Hộp Chocopie
  (gen_random_uuid(), 'd1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000011', 2, 22000.00, 16000.00), -- 2 Gói Lays
  (gen_random_uuid(), 'd1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000012', 2, 25000.00, 18000.00); -- 2 Gói Xúc xích

-- Đơn hàng 5: Khách mua Redbull + Sữa tươi Vinamilk + Nước mắm (Tổng: 177.000 đ)
INSERT INTO sales_orders (id, store_id, cashier_id, total_amount, payment_method, created_at)
VALUES ('d1000000-0000-0000-0000-000000000005', 'c39e9ba4-0b8b-484e-8f56-90515e0cb0ac', 'ce1c37e4-08d2-4c73-b3df-72bfca7a57f2', 177000.00, 'CASH', NOW() - INTERVAL '4 hours');

INSERT INTO sales_order_items (id, sales_order_id, product_id, quantity, unit_price, unit_cost) VALUES
  (gen_random_uuid(), 'd1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000006', 4, 14000.00, 10000.00), -- 4 Lon Redbull
  (gen_random_uuid(), 'd1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000007', 2, 35000.00, 28000.00), -- 2 Lốc Sữa tươi
  (gen_random_uuid(), 'd1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000008', 1, 29000.00, 22000.00), -- 1 Chai Nước mắm
  (gen_random_uuid(), 'd1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000003', 1, 30000.00, 24000.00); -- 1 Vỉ sữa chua

-- Đơn hàng 6: Đơn hôm nay (Bột giặt Omo + Mì Hảo Hảo + Coca) (Tổng: 386.000 đ)
INSERT INTO sales_orders (id, store_id, cashier_id, total_amount, payment_method, created_at)
VALUES ('d1000000-0000-0000-0000-000000000006', 'c39e9ba4-0b8b-484e-8f56-90515e0cb0ac', 'ce1c37e4-08d2-4c73-b3df-72bfca7a57f2', 386000.00, 'TRANSFER', NOW() - INTERVAL '1 hour');

INSERT INTO sales_order_items (id, sales_order_id, product_id, quantity, unit_price, unit_cost) VALUES
  (gen_random_uuid(), 'd1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000005', 1, 160000.00, 130000.00), -- 1 Túi OMO
  (gen_random_uuid(), 'd1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000001', 1, 110000.00, 92000.00),  -- 1 Thùng mì
  (gen_random_uuid(), 'd1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000002', 2, 58000.00, 48000.00);   -- 2 Lốc Coca

COMMIT;
