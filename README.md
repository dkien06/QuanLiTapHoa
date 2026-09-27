# HỆ THỐNG QUẢN LÝ BÁN HÀNG TẠP HÓA & KẾT NỐI NHÀ CUNG CẤP (B2B)

Dự án phát triển phần mềm quản lý bán lẻ tại quầy cho các tiệm tạp hóa nhỏ lẻ kết hợp phân hệ đặt hàng tự động từ xưởng / nhà cung cấp thực phẩm.

---

## 🛠 Tech Stack

* **Backend:** Python 3.10+, FastAPI, SQLAlchemy ORM, Pydantic, Uvicorn
* **Database:** SQLite (Development) / Microsoft SQL Server (Production)
* **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons, Axios, Vite
* **Kiến trúc:** RESTful API & Decoupled Client-Server

---

## 📋 Yêu cầu hệ thống (Prerequisites)

Trước khi khởi chạy, máy tính của bạn cần được cài đặt sẵn:
1. **Python:** version `3.10` trở lên.
2. **Node.js:** version `18.0` trở lên (kèm `npm`).
3. **Git:** để clone dự án.

---

## 🚀 Hướng Dẫn Khởi Chạy Dự Án Cho Người Mới (Quick Start)

### Bước 1: Clone dự án về máy
```bash
git clone <URL_REPOS_CỦA_BẠN>
cd FastAPIProject
```

### Bước 2: Cấu hình biến môi trường
Tạo file `.env` từ file mẫu `.env.example`:
- **Trên Linux/macOS:**
  ```bash
  cp .env.example .env
  ```
- **Trên Windows (CMD / PowerShell):**
  ```powershell
  copy .env.example .env
  ```

---

### Bước 3: Khởi chạy Backend (FastAPI)

1. **Tạo và kích hoạt môi trường ảo Python:**
   - **Windows:**
     ```powershell
     python -m venv .venv
     .venv\Scripts\activate
     ```
   - **Linux / macOS:**
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

2. **Cài đặt thư viện phụ thuộc:**
   ```bash
   pip install -r backend/requirements.txt
   ```

3. **Khởi chạy Server Backend:**
   ```bash
   uvicorn backend.app.main:app --reload --port 8000
   ```
   > 🌐 **API Documentation:** Sau khi chạy, mở trình duyệt truy cập `http://localhost:8000/docs` để xem tài liệu Swagger UI.

---

### Bước 4: Khởi chạy Frontend (React + TypeScript)

Mở một cửa sổ Terminal/Command Prompt mới:

1. **Di chuyển vào thư mục Frontend:**
   ```bash
   cd frontend
   ```

2. **Cài đặt thư viện Node.js:**
   ```bash
   npm install
   ```

3. **Khởi chạy Development Server:**
   ```bash
   npm run dev
   ```
   > 💻 **Giao diện Web:** Mở trình duyệt truy cập `http://localhost:3000` (hoặc URL hiển thị trên terminal) để trải nghiệm màn hình Đăng nhập.

---

