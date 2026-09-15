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

## 3. Quy Trình Làm Việc Hằng Ngày (Daily Workflow)

### Bước 1: Cập nhật code mới nhất từ nhóm
Trước khi bắt đầu code tính năng mới, luôn đồng bộ nhánh `main` về máy:
```bash
git checkout main
git pull origin main
