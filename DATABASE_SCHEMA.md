# ĐẶC TẢ CƠ SỞ DỮ LIỆU (DATABASE SCHEMA)

* **Hệ quản trị CSDL mục tiêu:** Microsoft SQL Server (MSSQL)
* **Kiến trúc:** Phân tách Master Data dùng chung (`products`) và Tenant Data riêng biệt của từng cơ sở (`store_inventories`, `stores`).

---

## 1. Bảng `users` (Tài khoản người dùng)
Lưu thông tin đăng nhập và danh tính của các chủ cơ sở kinh doanh.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Ý nghĩa / Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK, IDENTITY | Khóa chính tự tăng |
| `username` | VARCHAR(50) | UNIQUE, NOT NULL | Tên đăng nhập |
| `password_hash` | VARCHAR(255) | NOT NULL | Mật khẩu băm (bcrypt) |
| `full_name` | NVARCHAR(100) | NULL | Họ và tên hiển thị |
| `phone` | VARCHAR(20) | NULL | Số điện thoại liên hệ |
| `role` | VARCHAR(20) | NOT NULL | `GROCERY_OWNER`, `SUPPLIER_OWNER` |
| `created_at` | DATETIME2 | DEFAULT GETDATE() | Thời điểm tạo tài khoản |

---

## 2. Bảng `stores` (Thông tin Cơ sở / Tiệm / Xưởng)
Quản lý thực thể kinh doanh và quỹ tiền mặt nội bộ.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Ý nghĩa / Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK, IDENTITY | Khóa chính tự tăng |
| `owner_id` | BIGINT | FK -> users(id), NOT NULL | Chủ sở hữu cửa hàng/xưởng |
| `name` | NVARCHAR(150) | NOT NULL | Tên tiệm hoặc tên xưởng |
| `store_type` | VARCHAR(20) | NOT NULL | `GROCERY` (Tạp hoá) hoặc `SUPPLIER` (Xưởng) |
| `phone` | VARCHAR(20) | NULL | Hotline cửa hàng |
| `address` | NVARCHAR(MAX) | NULL | Địa chỉ kinh doanh |
| `balance` | DECIMAL(18, 2) | DEFAULT 0, NOT NULL | Quỹ tiền mặt/số dư doanh thu của cơ sở |
| `created_at` | DATETIME2 | DEFAULT GETDATE() | Thời điểm tạo |

---

## 3. Bảng `store_categories` (Danh mục riêng của cơ sở)
Cho phép từng tiệm hoặc xưởng tự phân loại mặt hàng theo cách sắp xếp của mình.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Ý nghĩa / Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK, IDENTITY | Khóa chính tự tăng |
| `store_id` | BIGINT | FK -> stores(id), NOT NULL | Thuộc cơ sở nào |
| `name` | NVARCHAR(100) | NOT NULL | Tên danh mục (Đồ uống, Gia vị, Đồ khô...) |

---

## 4. Bảng `products` (Danh mục sản phẩm hệ thống)
Chứa thông tin dùng chung của hàng hóa trên toàn hệ thống.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Ý nghĩa / Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK, IDENTITY | Khóa chính tự tăng |
| `barcode` | VARCHAR(50) | UNIQUE, NULL | Mã vạch tra cứu; NULL đối với hàng không có barcode |
| `original_name` | NVARCHAR(255) | NOT NULL | Tên gốc của nhà sản xuất |
| `image_url` | NVARCHAR(MAX) | NULL | Đường dẫn ảnh minh hoạ |
| `description` | NVARCHAR(MAX) | NULL | Mô tả chi tiết |
| `created_at` | DATETIME2 | DEFAULT GETDATE() | Thời điểm tạo |

---

## 5. Bảng `store_inventories` (Tồn kho & Bảng giá cơ sở)
Quản lý số lượng tồn và chính sách giá riêng của từng tiệm/xưởng đối với từng mặt hàng.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Ý nghĩa / Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK, IDENTITY | Khóa chính tự tăng |
| `store_id` | BIGINT | FK -> stores(id), NOT NULL | Cửa hàng / Xưởng nắm giữ hàng |
| `product_id` | BIGINT | FK -> products(id), NOT NULL | Mã sản phẩm liên kết |
| `store_category_id`| BIGINT | FK -> store_categories(id), NULL | Phân loại riêng của cơ sở |
| `custom_name` | NVARCHAR(255) | NULL | Tên gọi ghi đè tại quầy nếu cần |
| `quantity` | INT | DEFAULT 0, NOT NULL | Số lượng tồn kho thực tế |
| `cost_price` | DECIMAL(18, 2) | DEFAULT 0, NOT NULL | Giá vốn nhập vào |
| `selling_price` | DECIMAL(18, 2) | DEFAULT 0, NOT NULL | Giá niêm yết bán lẻ |
| `min_stock_alert` | INT | DEFAULT 5, NOT NULL | Ngưỡng kích hoạt cảnh báo hết hàng |

* **Chỉ mục (Index):** `UNIQUE(store_id, product_id)` để đảm bảo mỗi cửa hàng chỉ có 1 bản ghi tồn kho cho mỗi sản phẩm.

---

## 6. Bảng `purchase_orders` & `purchase_order_items` (Giao dịch nhập hàng B2B)
Theo dõi các đơn nhập hàng từ xưởng hoặc nhập hàng thủ công ngoài hệ thống.

### `purchase_orders`
| Tên cột | Kiểu dữ liệu | Ràng buộc | Ý nghĩa / Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK, IDENTITY | Khóa chính đơn đặt hàng |
| `grocery_store_id` | BIGINT | FK -> stores(id), NOT NULL | Tiệm tạp hoá đặt hàng (Buyer) |
| `supplier_store_id`| BIGINT | FK -> stores(id), NULL | Xưởng cung ứng (NULL nếu nhập ngoài) |
| `status` | VARCHAR(30) | DEFAULT 'PENDING', NOT NULL | `PENDING`, `CONFIRMED`, `SHIPPING`, `RECEIVED`, `CANCELLED` |
| `total_amount` | DECIMAL(18, 2) | DEFAULT 0, NOT NULL | Tổng giá trị đơn nhập |
| `created_at` | DATETIME2 | DEFAULT GETDATE() | Ngày tạo đơn |

### `purchase_order_items`
| Tên cột | Kiểu dữ liệu | Ràng buộc | Ý nghĩa / Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK, IDENTITY | Khóa chính |
| `purchase_order_id`| BIGINT | FK -> purchase_orders(id), NOT NULL | Thuộc đơn nhập nào |
| `product_id` | BIGINT | FK -> products(id), NOT NULL | Sản phẩm nhập |
| `quantity` | INT | NOT NULL | Số lượng nhập |
| `unit_price` | DECIMAL(18, 2) | NOT NULL | Đơn giá sỉ chốt tại thời điểm đặt |

---

## 7. Bảng `sales_orders` & `sales_order_items` (Hóa đơn bán lẻ tại quầy)
Lưu trữ hóa đơn điện tử cho khách mua lẻ tại tiệm tạp hoá.

### `sales_orders`
| Tên cột | Kiểu dữ liệu | Ràng buộc | Ý nghĩa / Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK, IDENTITY | Mã hoá đơn |
| `store_id` | BIGINT | FK -> stores(id), NOT NULL | Tiệm tạp hoá bán hàng |
| `cashier_id` | BIGINT | FK -> users(id), NOT NULL | Người thực hiện thanh toán |
| `total_amount` | DECIMAL(18, 2) | NOT NULL | Tổng tiền khách phải trả |
| `payment_method` | VARCHAR(20) | DEFAULT 'CASH', NOT NULL | Phương thức: `CASH`, `TRANSFER` |
| `created_at` | DATETIME2 | DEFAULT GETDATE() | Thời gian bán |

### `sales_order_items`
| Tên cột | Kiểu dữ liệu | Ràng buộc | Ý nghĩa / Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK, IDENTITY | Khóa chính |
| `sales_order_id` | BIGINT | FK -> sales_orders(id), NOT NULL | Thuộc hoá đơn nào |
| `product_id` | BIGINT | FK -> products(id), NOT NULL | Sản phẩm đã bán |
| `quantity` | INT | NOT NULL | Số lượng bán |
| `unit_price` | DECIMAL(18, 2) | NOT NULL | Snapshot giá bán tại thời điểm lập đơn |

---

## 8. Bảng `notifications` (Thông báo hệ thống)
Lưu thông báo biến động đơn hàng và cảnh báo hết hàng cho người dùng.

| Tên cột | Kiểu dữ liệu | Ràng buộc | Ý nghĩa / Ghi chú |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK, IDENTITY | Khóa chính |
| `user_id` | BIGINT | FK -> users(id), NOT NULL | Người nhận thông báo |
| `title` | NVARCHAR(150) | NOT NULL | Tiêu đề thông báo |
| `content` | NVARCHAR(MAX) | NOT NULL | Nội dung chi tiết |
| `reference_id` | BIGINT | NULL | ID của đơn hàng hoặc hoá đơn liên quan |
| `type` | VARCHAR(50) | NULL | Phân loại: `PO_STATUS_CHANGED`, `LOW_STOCK` |
| `is_read` | BIT | DEFAULT 0, NOT NULL | Trạng thái đã đọc (0: Chưa đọc, 1: Đã đọc) |
| `created_at` | DATETIME2 | DEFAULT GETDATE() | Thời điểm gửi |
