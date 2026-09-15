# QUY ĐỊNH ĐÓNG GÓP & LÀM VIỆC NHÓM (CONTRIBUTING GUIDELINES)

Tài liệu này quy định quy trình phối hợp phát triển, quản lý mã nguồn qua Git và tiêu chuẩn code cho toàn bộ thành viên trong dự án Quản Lý Tạp Hoá (FastAPI + React/TS + SQL Server).

---

## 1. Nguyên Tắc Quản Lý Nhánh (Git Branching Strategy)

* **Nhánh `main`:** Chứa mã nguồn ổn định nhất, dùng để demo hoặc nộp bài. **Tuyệt đối không commit hoặc push code trực tiếp lên `main`**.
* **Nhánh chức năng (Feature branch):** Mọi tính năng, sửa lỗi đều phải thực hiện trên một nhánh riêng rẽ cắt ra từ `main`.

### Quy ước đặt tên nhánh
* Thêm tính năng mới: `feat/<ten-tinh-nang>`
  * Ví dụ: `feat/pos-barcode-scanner`, `feat/auth-jwt`, `feat/b2b-order-approval`
* Sửa lỗi: `fix/<ten-loi>`
  * Ví dụ: `fix/stock-negative-bug`, `fix/login-cors-error`
* Tối ưu/Tái cấu trúc code: `refactor/<ten-module>`
  * Ví dụ: `refactor/db-connection`, `refactor/cart-state`
* Viết tài liệu: `docs/<ten-tai-lieu>`
  * Ví dụ: `docs/api-specification`

---

## 2. Quy Chuẩn Commit (Commit Message Conventions)

Commit message cần viết bằng tiếng Việt không dấu hoặc tiếng Anh, súc tích và có tiền tố phân loại theo chuẩn:

* `feat:` Tính năng mới (vd: `feat: them api tao hoa don ban le`)
* `fix:` Sửa lỗi (vd: `fix: chan ban am kho khi thanh toan`)
* `docs:` Viết hoặc sửa tài liệu markdown (vd: `docs: cap nhat quy trinh b2b`)
* `refactor:` Tối ưu lại cấu trúc code nhưng không đổi logic (vd: `refactor: chia nho cac router fastapi`)
* `chore:` Cài đặt thư viện, cấu hình môi trường, sửa `.gitignore` (vd: `chore: them pyodbc vao requirements`)

---
## 3. Quy Chuẩn Đặt Tên (Naming Conventions - PEP 8)

| Đối tượng | Quy tắc | Ví dụ chuẩn | Không nên dùng |
| :--- | :--- | :--- | :--- |
| **Biến (Variables)** | `snake_case` (chữ thường, nối gạch dưới) | `total_amount`, `store_id` | `totalAmount`, `Total_Amount` |
| **Hàm / Phương thức** | `snake_case` (thường bắt đầu bằng động từ) | `get_inventory()`, `calculate_total()` | `GetInventory()`, `calculateTotal()` |
| **Lớp (Classes / Models)**| `PascalCase` (viết hoa chữ đầu mỗi từ) | `StoreInventory`, `SalesOrder` | `store_inventory`, `salesOrder` |
| **Hằng số (Constants)** | `UPPER_SNAKE_CASE` (in hoa toàn bộ) | `MAX_STOCK_ALERT`, `JWT_SECRET_KEY` | `maxStockAlert`, `Max_Stock_Alert` |
| **File / Module** | `snake_case` (chữ thường toàn bộ) | `database.py`, `sales_router.py` | `Database.py`, `salesRouter.py` |
| **Package / Thư mục** | `lowercase` (chữ thường ngắn gọn) | `routers/`, `schemas/`, `models/` | `Routers/`, `my_schemas/` |
| **Biến riêng tư (Private)**| `_snake_case` (tiền tố 1 dấu gạch dưới) | `_verify_token()`, `_db_conn` | `verify_token_private()` |
## 4. Quy Trình Làm Việc Hằng Ngày (Daily Workflow)

### Bước 1: Cập nhật code mới nhất từ nhóm
Trước khi bắt đầu code tính năng mới, luôn đồng bộ nhánh `main` về máy:
```bash
git checkout main
git pull origin main
