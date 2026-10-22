# ĐẶC TẢ CƠ SỞ DỮ LIỆU (DATABASE SCHEMA)

* **Hệ quản trị CSDL mục tiêu:** PostgreSQL (15+)
* **Kiến trúc:** Multi-tenant chia sẻ cơ sở dữ liệu (Shared Database, Shared Schema).
* **Cơ chế định danh:** Chuẩn **UUID v4** (`gen_random_uuid()`) cho toàn bộ bảng.
* **Nguyên tắc bảo vệ dữ liệu:** Áp dụng ràng buộc toàn vẹn đa tầng (Composite Foreign Keys, Check Constraints, Partial Unique Indexes).

---

## 📑 Danh sách Kiểu ENUM (Custom Types)

Hệ thống sử dụng các kiểu `ENUM` nguyên bản của PostgreSQL:

| Tên Type ENUM | Các giá trị hợp lệ | Mục đích sử dụng |
| :--- | :--- | :--- |
| `store_type` | `'GROCERY'`, `'SUPPLIER'` | Phân loại cơ sở: Tạp hóa bán lẻ hoặc Xưởng/Nhà cung cấp |
| `user_role` | `'OWNER'`, `'STAFF'` | Vai trò tài khoản trong cơ sở: Chủ cơ sở hoặc Nhân viên |
| `purchase_order_status` | `'PENDING'`, `'CONFIRMED'`, `'SHIPPING'`, `'RECEIVED'`, `'CANCELLED'` | Vòng đời đơn đặt hàng nhập sỉ B2B |
| `payment_method` | `'CASH'`, `'TRANSFER'` | Hình thức thanh toán đơn bán lẻ tại quầy POS |
| `notification_type` | `'PO_STATUS_CHANGED'`, `'LOW_STOCK'`, `'GENERAL'` | Phân loại thông báo hệ thống |
| `category_mapping_status` | `'PENDING'`, `'APPROVED'`, `'REJECTED'` | Trạng thái xét duyệt ánh xạ danh mục |

---

## 1. Bảng `stores` (Cơ sở kinh doanh: Tiệm tạp hóa hoặc Xưởng)
Quản lý thông tin pháp lý và định danh của từng cửa hàng tạp hóa hoặc kho xưởng nhà cung cấp.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Ý nghĩa / Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, DEFAULT `gen_random_uuid()` | Khóa chính duy nhất |
| `name` | VARCHAR(150) | NOT NULL | Tên cửa hàng hoặc tên xưởng |
| `store_type` | `store_type` | NOT NULL | Loại hình: `'GROCERY'` hoặc `'SUPPLIER'` |
| `phone` | VARCHAR(20) | NULL | Số hotline liên hệ của cơ sở |
| `address` | TEXT | NULL | Địa chỉ hoạt động kinh doanh |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `now()` | Thời điểm tạo cơ sở |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `now()` | Thời điểm cập nhật thông tin |

---

## 2. Bảng `users` (Tài khoản người dùng thuộc Cơ sở)
Lưu thông tin đăng nhập và quyền hạn của chủ tiệm (`OWNER`) và nhân viên bán hàng (`STAFF`) thuộc cơ sở.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Ý nghĩa / Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, DEFAULT `gen_random_uuid()` | Khóa chính |
| `store_id` | UUID | FK -> `stores(id)`, NOT NULL | Trực thuộc cơ sở nào |
| `username` | VARCHAR(50) | UNIQUE, NOT NULL | Tên đăng nhập |
| `password_hash` | VARCHAR(255) | NOT NULL | Mật khẩu đã băm bằng Bcrypt |
| `full_name` | VARCHAR(100) | NOT NULL | Họ và tên đầy đủ |
| `phone` | VARCHAR(20) | NULL | Số điện thoại cá nhân |
| `role` | `user_role` | NOT NULL | Vai trò: `'OWNER'` hoặc `'STAFF'` |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT `true` | Trạng thái hoạt động (`false` = Khóa tài khoản) |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `now()` | Thời điểm tạo tài khoản |

* **Ràng buộc & Chỉ mục:**
  * `CONSTRAINT uq_users_store_id_id UNIQUE (store_id, id)`: Hỗ trợ tạo khóa ngoại phức hợp (Composite FK) kiểm tra tính cùng tenant.
  * `CREATE INDEX idx_users_store_id ON users(store_id)`: Tối ưu truy vấn danh sách nhân viên theo cửa hàng.
  * `CREATE UNIQUE INDEX uq_one_owner_per_store ON users(store_id) WHERE role = 'OWNER'`: Đảm bảo **mỗi cơ sở chỉ có duy nhất 1 tài khoản chủ sở hữu (OWNER)**.

---

## 3. Bảng `admin_users` (Quản trị viên nền tảng)
Lưu trữ tài khoản nội bộ cấp cao quản trị toàn bộ hệ sinh thái, phê duyệt danh mục và quản lý dữ liệu Master.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Ý nghĩa / Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, DEFAULT `gen_random_uuid()` | Khóa chính |
| `username` | VARCHAR(50) | UNIQUE, NOT NULL | Tên đăng nhập quản trị viên |
| `password_hash` | VARCHAR(255) | NOT NULL | Mật khẩu băm Bcrypt |
| `full_name` | VARCHAR(100) | NOT NULL | Họ tên người quản trị |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT `true` | Trạng thái hoạt động |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `now()` | Thời điểm tạo |

---

## 4. Bảng `categories` (Danh mục ngành hàng chuẩn hệ thống)
Danh mục phân loại sản phẩm chuẩn dùng chung trên toàn bộ sàn giao dịch B2B, do Admin quản lý.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Ý nghĩa / Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, DEFAULT `gen_random_uuid()` | Khóa chính |
| `code` | VARCHAR(50) | UNIQUE, NOT NULL | Mã danh mục chuẩn (ví dụ: `BEVERAGE`, `SNACK`) |
| `name` | VARCHAR(100) | NOT NULL | Tên hiển thị (ví dụ: Đồ uống, Bánh kẹo) |

---

## 5. Bảng `store_categories` (Danh mục riêng của từng Cơ sở)
Mỗi tiệm tạp hóa hoặc xưởng được tự do đặt danh mục nội bộ theo cách phân loại riêng tại quầy.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Ý nghĩa / Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, DEFAULT `gen_random_uuid()` | Khóa chính |
| `store_id` | UUID | FK -> `stores(id)`, NOT NULL | Cửa hàng sở hữu danh mục này |
| `name` | VARCHAR(100) | NOT NULL | Tên danh mục nội bộ của tiệm |
| `category_id` | UUID | FK -> `categories(id)`, NULL | Liên kết tới danh mục chuẩn hệ thống (nếu đã map) |

* **Ràng buộc & Chỉ mục:**
  * `CONSTRAINT uq_store_category_name UNIQUE (store_id, name)`: Không được trùng tên danh mục trong cùng một tiệm.
  * `CONSTRAINT uq_store_categories_store_id_id UNIQUE (store_id, id)`: Hỗ trợ Composite FK liên kết bảng kho.
  * `CREATE INDEX idx_store_categories_category_id ON store_categories(category_id)`

---

## 6. Bảng `category_mapping_requests` (Yêu cầu duyệt ánh xạ danh mục)
Chủ tiệm gửi yêu cầu đề xuất ánh xạ danh mục nội bộ (`store_categories`) sang danh mục chuẩn hệ sinh thái (`categories`) để Admin duyệt.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Ý nghĩa / Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, DEFAULT `gen_random_uuid()` | Khóa chính |
| `store_category_id` | UUID | FK -> `store_categories(id)`, NOT NULL | Danh mục của cửa hàng cần ánh xạ |
| `proposed_category_id` | UUID | FK -> `categories(id)`, NOT NULL | Danh mục hệ thống muốn map vào |
| `status` | `category_mapping_status` | NOT NULL, DEFAULT `'PENDING'` | `'PENDING'`, `'APPROVED'`, `'REJECTED'` |
| `requested_by` | UUID | FK -> `users(id)`, NOT NULL | Chủ cơ sở gửi yêu cầu |
| `reviewed_by` | UUID | FK -> `admin_users(id)`, NULL | Admin thực hiện duyệt |
| `review_note` | TEXT | NULL | Ghi chú hoặc lý do từ chối |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `now()` | Thời gian gửi yêu cầu |
| `reviewed_at` | TIMESTAMPTZ | NULL | Thời gian Admin xử lý |

* **Ràng buộc & Chỉ mục:**
  * `CONSTRAINT ck_mapping_review_state CHECK (...)`: Đảm bảo khi `PENDING` thì chưa có người duyệt; khi `APPROVED` hoặc `REJECTED` thì bắt buộc phải có `reviewed_by` và `reviewed_at`.
  * `CREATE UNIQUE INDEX uq_pending_mapping_per_store_category ON category_mapping_requests(store_category_id) WHERE status = 'PENDING'`: Mỗi danh mục chỉ có duy nhất 1 yêu cầu chờ duyệt tại một thời điểm.
  * `CREATE INDEX idx_mapping_requests_status_created ON category_mapping_requests(status, created_at)`

---

## 7. Bảng `products` (Master Data sản phẩm dùng chung)
Kho sản phẩm dùng chung toàn sàn, định danh duy nhất qua mã vạch (Barcode) chuẩn GS1/EAN.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Ý nghĩa / Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, DEFAULT `gen_random_uuid()` | Khóa chính |
| `barcode` | VARCHAR(50) | UNIQUE, NOT NULL | Mã vạch tra cứu sản phẩm |
| `original_name` | VARCHAR(255) | NOT NULL | Tên chuẩn từ nhà sản xuất |
| `image_url` | TEXT | NULL | Đường dẫn ảnh sản phẩm |
| `description` | TEXT | NULL | Thông tin mô tả chi tiết |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `now()` | Thời điểm tạo sản phẩm |

---

## 8. Bảng `store_inventories` (Tồn kho & Bảng giá riêng của Cơ sở)
Lưu số lượng tồn kho, giá vốn và giá bán thực tế của từng cửa hàng/xưởng đối với từng mặt hàng.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Ý nghĩa / Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, DEFAULT `gen_random_uuid()` | Khóa chính bản ghi kho |
| `store_id` | UUID | FK -> `stores(id)`, NOT NULL | Cửa hàng nắm giữ kho hàng |
| `product_id` | UUID | FK -> `products(id)`, NOT NULL | Sản phẩm trong kho |
| `store_category_id` | UUID | NULL | Phân loại danh mục riêng tại tiệm |
| `custom_name` | VARCHAR(255) | NULL | Tên gọi tùy biến tại tiệm nếu có |
| `quantity` | INTEGER | NOT NULL, DEFAULT 0, CHECK (`quantity >= 0`) | Số lượng tồn kho thực tế |
| `cost_price` | NUMERIC(14, 2) | NOT NULL, DEFAULT 0, CHECK (`cost_price >= 0`) | Giá vốn nhập vào |
| `selling_price` | NUMERIC(14, 2) | NOT NULL, DEFAULT 0, CHECK (`selling_price >= 0`) | Giá niêm yết bán lẻ |
| `low_stock_threshold`| INTEGER | NOT NULL, DEFAULT 0, CHECK (`>= 0`) | Ngưỡng báo động sắp hết hàng |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `now()` | Thời gian cập nhật biến động gần nhất |

* **Ràng buộc & Chỉ mục:**
  * `CONSTRAINT uq_inventory_store_product UNIQUE (store_id, product_id)`: Mỗi cửa hàng chỉ có 1 dòng tồn kho cho mỗi sản phẩm.
  * `CONSTRAINT fk_inventory_category_same_store FOREIGN KEY (store_id, store_category_id) REFERENCES store_categories(store_id, id)`: **Toàn vẹn Tenant** — Đảm bảo danh mục gán vào sản phẩm phải thuộc sở hữu của chính cửa hàng đó.
  * `CREATE INDEX idx_store_inventories_category_id ON store_inventories(store_category_id)`

---

## 9. Bảng `purchase_orders` & `purchase_order_items` (Giao dịch Đặt hàng sỉ B2B)
Theo dõi hợp đồng đặt hàng từ tiệm tạp hóa gửi tới nhà cung cấp/xưởng.

### `purchase_orders`
| Tên cột | Kiểu dữ liệu | Ràng buộc | Ý nghĩa / Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, DEFAULT `gen_random_uuid()` | Mã đơn đặt sỉ |
| `grocery_store_id` | UUID | FK -> `stores(id)`, NOT NULL | Tiệm tạp hóa mua hàng (Buyer) |
| `supplier_store_id` | UUID | FK -> `stores(id)`, NOT NULL | Xưởng/Nhà cung cấp (Supplier) |
| `status` | `purchase_order_status`| NOT NULL, DEFAULT `'PENDING'` | Trạng thái: `PENDING`, `CONFIRMED`, `SHIPPING`, `RECEIVED`, `CANCELLED` |
| `total_amount` | NUMERIC(14, 2) | NOT NULL, DEFAULT 0, CHECK (`total_amount >= 0`) | Tổng giá trị đơn sỉ |
| `created_by` | UUID | NOT NULL | User tạo đơn |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `now()` | Thời điểm tạo đơn |
| `received_at` | TIMESTAMPTZ | NULL | Thời điểm tiệm tạp hóa nhận hàng và nhập kho |

* **Ràng buộc & Chỉ mục:**
  * `CONSTRAINT ck_purchase_different_stores CHECK (grocery_store_id <> supplier_store_id)`: Cơ sở không thể tự đặt hàng từ chính mình.
  * `CONSTRAINT fk_purchase_creator_same_grocery FOREIGN KEY (grocery_store_id, created_by) REFERENCES users(store_id, id)`: Người tạo đơn phải là thành viên hợp lệ của chính tiệm mua hàng.
  * `CREATE INDEX idx_purchase_grocery_created ON purchase_orders(grocery_store_id, created_at DESC)`
  * `CREATE INDEX idx_purchase_supplier_created ON purchase_orders(supplier_store_id, created_at DESC)`

### `purchase_order_items`
| Tên cột | Kiểu dữ liệu | Ràng buộc | Ý nghĩa / Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, DEFAULT `gen_random_uuid()` | Khóa chính chi tiết đơn |
| `purchase_order_id`| UUID | FK -> `purchase_orders(id)`, NOT NULL | Thuộc đơn đặt hàng sỉ nào |
| `product_id` | UUID | FK -> `products(id)`, NOT NULL | Mặt hàng nhập |
| `quantity` | INTEGER | NOT NULL, CHECK (`quantity > 0`) | Số lượng đặt mua |
| `unit_price` | NUMERIC(14, 2) | NOT NULL, CHECK (`unit_price >= 0`) | Đơn giá sỉ cam kết tại thời điểm đặt |

* **Ràng buộc:**
  * `CONSTRAINT uq_purchase_item_product UNIQUE (purchase_order_id, product_id)`: Không lặp lại cùng 1 mặt hàng trong cùng đơn sỉ.

---

## 10. Bảng `sales_orders` & `sales_order_items` (Hóa đơn Bán lẻ tại quầy POS)
Lưu giao dịch bán hàng trực tiếp tại quầy tiệm tạp hóa.

### `sales_orders`
| Tên cột | Kiểu dữ liệu | Ràng buộc | Ý nghĩa / Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, DEFAULT `gen_random_uuid()` | Mã hóa đơn POS |
| `store_id` | UUID | FK -> `stores(id)`, NOT NULL | Cửa hàng thực hiện giao dịch |
| `cashier_id` | UUID | NOT NULL | Thu ngân lập hóa đơn |
| `total_amount` | NUMERIC(14, 2) | NOT NULL, CHECK (`total_amount >= 0`) | Tổng số tiền khách thanh toán |
| `payment_method` | `payment_method`| NOT NULL, DEFAULT `'CASH'` | Hình thức: `'CASH'` (Tiền mặt) hoặc `'TRANSFER'` (Chuyển khoản) |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `now()` | Thời điểm hoàn tất hóa đơn |

* **Ràng buộc:**
  * `CONSTRAINT fk_sale_cashier_same_store FOREIGN KEY (store_id, cashier_id) REFERENCES users(store_id, id)`: Thu ngân phải thuộc biên chế của chính tiệm bán lẻ.
  * `CREATE INDEX idx_sales_store_created ON sales_orders(store_id, created_at DESC)`

### `sales_order_items`
| Tên cột | Kiểu dữ liệu | Ràng buộc | Ý nghĩa / Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, DEFAULT `gen_random_uuid()` | Khóa chính dòng hóa đơn |
| `sales_order_id` | UUID | FK -> `sales_orders(id)`, NOT NULL | Thuộc hóa đơn nào |
| `product_id` | UUID | FK -> `products(id)`, NOT NULL | Sản phẩm bán |
| `quantity` | INTEGER | NOT NULL, CHECK (`quantity > 0`) | Số lượng bán ra |
| `unit_price` | NUMERIC(14, 2) | NOT NULL, CHECK (`unit_price >= 0`) | Giá bán tại thời điểm quét đơn |
| `unit_cost` | NUMERIC(14, 2) | NOT NULL, CHECK (`unit_cost >= 0`) | Snapshot giá vốn tại thời điểm bán (để tính lãi gộp tức thì) |

* **Ràng buộc:**
  * `CONSTRAINT uq_sales_item_product UNIQUE (sales_order_id, product_id)`: Không lặp sản phẩm trong hóa đơn.

---

## 11. Bảng `notifications` (Hệ thống Thông báo)
Lưu thông báo gửi cho người dùng về trạng thái đơn nhập hoặc cảnh báo tồn kho thấp.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Ý nghĩa / Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, DEFAULT `gen_random_uuid()` | Khóa chính |
| `user_id` | UUID | FK -> `users(id)`, NOT NULL | Người nhận thông báo |
| `type` | `notification_type` | NOT NULL | `'PO_STATUS_CHANGED'`, `'LOW_STOCK'`, `'GENERAL'` |
| `title` | VARCHAR(150) | NOT NULL | Tiêu đề thông báo |
| `content` | TEXT | NOT NULL | Nội dung chi tiết |
| `purchase_order_id`| UUID | FK -> `purchase_orders(id)`, NULL | Khóa ngoại tới đơn sỉ (nếu type là PO) |
| `store_inventory_id`| UUID | FK -> `store_inventories(id)`, NULL | Khóa ngoại tới mục kho (nếu type là LOW_STOCK) |
| `is_read` | BOOLEAN | NOT NULL, DEFAULT `false` | Trạng thái đã xem (`false` = Chưa đọc) |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT `now()` | Thời điểm thông báo được tạo |

* **Ràng buộc Kiểm tra Toàn vẹn Tham chiếu:**
  * `CONSTRAINT ck_notification_reference CHECK (...)`:
    * Nếu `type = 'PO_STATUS_CHANGED'` ➔ `purchase_order_id` bắt buộc có giá trị, `store_inventory_id` bắt buộc NULL.
    * Nếu `type = 'LOW_STOCK'` ➔ `store_inventory_id` bắt buộc có giá trị, `purchase_order_id` bắt buộc NULL.
    * Nếu `type = 'GENERAL'` ➔ Cả 2 khóa ngoại đều phải NULL.
  * `CREATE INDEX idx_notifications_user_read_created ON notifications(user_id, is_read, created_at DESC)`: Tối ưu bộ lọc thông báo chưa đọc theo người dùng.
