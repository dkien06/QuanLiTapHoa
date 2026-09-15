# HỆ THỐNG QUẢN LÝ BÁN HÀNG TẠP HÓA & KẾT NỐI NHÀ CUNG CẤP (B2B)

Dự án phát triển phần mềm quản lý bán lẻ tại quầy cho các tiệm tạp hóa nhỏ lẻ kết hợp phân hệ đặt hàng tự động từ xưởng / nhà cung cấp thực phẩm.

## 🛠 Tech Stack
* **Backend:** Python, FastAPI, SQLAlchemy ORM, Pydantic, Uvicorn
* **Database:** Microsoft SQL Server (MSSQL) qua `pyodbc`
* **Frontend:** React, TypeScript, Tailwind CSS / Ant Design, Axios
* **Kiến trúc:** RESTful API & Decoupled Client-Server

## 👥 Phân quyền người dùng
1. **Chủ tiệm tạp hóa (`GROCERY_OWNER`):** Quét mã vạch bán hàng, theo dõi tồn kho tại quầy, tạo đơn nhập hàng (tự động/thủ công), ghi nhận hóa đơn điện tử và theo dõi quỹ tiền (`balance`).
2. **Nhà cung cấp / Xưởng (`SUPPLIER_OWNER`):** Tiếp nhận đơn đặt hàng từ tạp hóa, duyệt đơn (tự động trừ kho xưởng), cập nhật tiến độ giao hàng và điều chỉnh tồn kho sản xuất.

## 🚀 Khởi chạy hệ thống (Local Development)

### Yêu cầu tiên quyết
* Python 3.10+
* SQL Server & ODBC Driver 17/18 for SQL Server
* Node.js 18+ (Dành cho Frontend)

### Cài đặt Backend (FastAPI)
```bash
# 1. Tạo và kích hoạt môi trường ảo
python -m venv .venv
.venv\Scripts\activate  # Trên Windows

# 2. Cài đặt thư viện
pip install -r requirements.txt

# 3. Khởi chạy Backend Server
uvicorn app.main:app --reload
