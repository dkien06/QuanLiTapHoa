# HỆ THỐNG QUẢN LÝ BÁN HÀNG TẠP HÓA & KẾT NỐI NHÀ CUNG CẤP (B2B)

Phần mềm quản lý bán lẻ tại quầy cho các tiệm tạp hóa nhỏ lẻ, kết hợp phân hệ đặt hàng tự động từ xưởng / nhà cung cấp thực phẩm.

---

## 🛠 Tech Stack

| Tầng | Công nghệ |
|---|---|
| **Backend** | Python 3.10+, FastAPI, SQLAlchemy (async), Pydantic, Uvicorn |
| **Database** | PostgreSQL |
| **Frontend** | React 19, TypeScript, Tailwind CSS, Vite, Axios |
| **Auth** | JWT (PyJWT + Passlib bcrypt) |

---

## 📋 Yêu cầu cài đặt trước (Prerequisites)

Trước khi bắt đầu, hãy đảm bảo máy đã có:

- **Python** `3.10+` → [python.org](https://www.python.org/downloads/)
- **Node.js** `18+` (kèm `npm`) → [nodejs.org](https://nodejs.org/)
- **PostgreSQL** `14+` đang chạy ở localhost → [postgresql.org](https://www.postgresql.org/download/)
- **Git** → [git-scm.com](https://git-scm.com/)

---

## 🚀 Hướng dẫn khởi chạy từ đầu (Quick Start)

### Bước 1: Clone dự án

```bash
git clone <URL_REPOSITORY>
cd FastAPIProject
```

---

### Bước 2: Thêm `psql` vào PATH (chỉ làm 1 lần)

Để dùng được lệnh `psql` trong terminal, cần thêm thư mục `bin` của PostgreSQL vào PATH.

Chạy lệnh sau trong **PowerShell** (không cần quyền Admin):

```powershell
# Tự tìm version PostgreSQL đang cài và thêm vào PATH
$pgVersion = (Get-ChildItem "C:\Program Files\PostgreSQL\" | Sort-Object Name -Descending | Select-Object -First 1).Name
$pgBin = "C:\Program Files\PostgreSQL\$pgVersion\bin"
[System.Environment]::SetEnvironmentVariable("Path", $env:Path + ";$pgBin", "User")
Write-Host "✅ Đã thêm: $pgBin vào PATH"
```

Sau đó **đóng PowerShell và mở lại**, kiểm tra:

```powershell
psql --version
# Kết quả mong muốn: psql (PostgreSQL) 18.x
```

---

### Bước 3: Tạo Database PostgreSQL

Có **2 cách** để tạo database, chọn 1 trong 2:

#### Cách A — Dùng pgAdmin (giao diện đồ họa, dễ hơn)
1. Mở **pgAdmin** → đăng nhập bằng password PostgreSQL của bạn
2. Ở cây bên trái: chuột phải vào **Databases** → chọn **Create → Database...**
3. Điền `pos_db` vào ô **Database** → bấm **Save**

#### Cách B — Dùng terminal (psql)
```powershell
psql -U postgres
```
Sau đó gõ lệnh SQL:
```sql
CREATE DATABASE pos_db;
```

---

Sau khi đã có database `pos_db`, mở **PowerShell hoặc CMD**, `cd` vào thư mục gốc của project (`FastAPIProject/`) rồi chạy:

```powershell
psql -U postgres -d pos_db -f backend/app/core/grocery_supplier_schema.sql
```

> ⚠️ Lệnh này phải chạy **từ thư mục `FastAPIProject/`** (không phải trong `backend/` hay chỗ khác), vì đường dẫn `backend/app/core/...` được tính từ đó.

Giải thích các flag:
- `-U postgres` → đăng nhập bằng user `postgres` (thay bằng username của bạn nếu khác)
- `-d pos_db` → chọn database vừa tạo
- `-f backend/app/core/grocery_supplier_schema.sql` → đọc và chạy file SQL có sẵn trong project

> ✅ Nếu thành công, terminal sẽ hiện một loạt `CREATE TYPE`, `CREATE TABLE`, `CREATE INDEX` — không có dòng `ERROR` nào là được.

---

### Bước 3: Cấu hình biến môi trường Backend

Tạo file `.env` trong thư mục `backend/`:

- **Windows (PowerShell):**
  ```powershell
  copy backend\.env.example backend\.env
  ```
- **Linux / macOS:**
  ```bash
  cp backend/.env.example backend/.env
  ```

Mở file `backend/.env` và điền thông tin thực tế:

```env
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_actual_password   # ← đổi thành password PostgreSQL của bạn
POSTGRES_DB=pos_db
SECRET_KEY=your_secret_key_here          # ← đổi thành chuỗi bí mật bất kỳ
```

---

### Bước 4: Cài đặt & chạy Backend

> ⚠️ **Các lệnh dưới đây phải chạy từ thư mục `FastAPIProject/` (thư mục gốc), trừ bước khởi chạy server phải `cd` vào `backend/` trước.**

```powershell
# 1. Tạo virtual environment (từ thư mục gốc FastAPIProject/)
python -m venv .venv

# 2. Kích hoạt venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# 3. Cài đặt thư viện
pip install -r backend/requirements.txt

# 4. Vào thư mục backend rồi khởi chạy server
cd backend
uvicorn app.main:app --reload --port 8000
```

> ✅ **Kiểm tra:** Mở trình duyệt tại `http://localhost:8000/docs` để xem Swagger UI.

---

### Bước 5: Cài đặt & chạy Frontend

Mở **terminal mới** (giữ nguyên terminal backend đang chạy):

```bash
cd frontend
npm install
npm run dev
```

> ✅ **Kiểm tra:** Mở trình duyệt tại `http://localhost:5173` để xem giao diện.

---

## 📁 Cấu trúc thư mục

```
FastAPIProject/
├── backend/
│   ├── app/
│   │   ├── core/           # Config, Database, Security, SQL schema
│   │   ├── models/         # SQLAlchemy ORM models
│   │   ├── routers/        # API endpoints (auth, inventory, pos)
│   │   ├── schemas/        # Pydantic request/response schemas
│   │   ├── services/       # Business logic
│   │   ├── repository/     # Database queries
│   │   └── main.py         # FastAPI app entry point
│   ├── .env.example        # Mẫu biến môi trường
│   └── requirements.txt    # Thư viện Python
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Các trang (Login, Register, Dashboard)
│   │   ├── services/       # Axios API client
│   │   └── types/          # TypeScript types
│   └── package.json
├── docs/                   # Tài liệu bổ sung
├── DATABASE_SCHEMA.md      # Mô tả chi tiết schema database
├── BUSINESS_LOGIC.md       # Mô tả logic nghiệp vụ
└── README.md
```

---

## 🔗 API Endpoints chính

| Method | Endpoint | Mô tả |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Đăng ký tài khoản + tạo cửa hàng |
| `POST` | `/api/v1/auth/login` | Đăng nhập, nhận JWT token |
| `GET` | `/api/v1/auth/me` | Lấy thông tin tài khoản hiện tại |

> Xem đầy đủ tại: `http://localhost:8000/docs`

---

## ❓ Xử lý lỗi thường gặp

**`ModuleNotFoundError: No module named 'app'`**
→ Đảm bảo chạy đúng lệnh với `PYTHONPATH`:
```powershell
$env:PYTHONPATH="backend"; uvicorn app.main:app --reload --port 8000
```

**`ValidationError: POSTGRES_PASSWORD field required`**
→ Chưa tạo file `backend/.env`. Xem lại **Bước 3**.

**`could not connect to server`**
→ PostgreSQL chưa chạy hoặc sai password. Kiểm tra lại dịch vụ PostgreSQL và thông tin trong `backend/.env`.
