# KIẾN TRÚC HỆ THỐNG - QUẢN LÝ TẠP HÓA B2B

## 1. Mô hình kiến trúc: Client - Server (Decoupled Architecture)
Dự án được tổ chức theo mô hình tách biệt hoàn toàn giữa giao diện và xử lý nghiệp vụ, giao tiếp với nhau thông qua HTTP RESTful API.

- **Frontend (Tầng hiển thị):** Sử dụng React và TypeScript để quản lý giao diện, tương tác người dùng tại quầy.
- **Backend (Tầng nghiệp vụ & Dữ liệu):** Sử dụng FastAPI (Python) để xử lý logic tính toán, trừ kho, đồng bộ đơn hàng B2B.
- **Data Access Layer (Tầng truy cập dữ liệu):** Sử dụng SQLAlchemy kết hợp `pyodbc` để tương tác trực tiếp với cơ sở dữ liệu Microsoft SQL Server.
- **Model Layer:** Định nghĩa thực thể bằng SQLAlchemy (ánh xạ bảng CSDL) và Pydantic (kiểm tra tính hợp lệ của dữ liệu đầu vào/ra).

## 2. Cấu trúc thư mục (Monorepo Structure)
```text
QuanLiTapHoa/
├── README.md                 <-- Hướng dẫn cài đặt, chạy dự án
├── requirements.txt          <-- Quản lý thư viện Python (FastAPI, SQLAlchemy, pyodbc)
├── .gitignore                <-- Quy định các file/thư mục không đẩy lên Git
├── frontend/                 <-- [FRONTEND CODE]
│   ├── package.json          <-- Quản lý thư viện Node.js (React, Axios)
│   ├── src/
│   │   ├── components/       <-- UI Components dùng chung (Button, Table, Modal)
│   │   ├── features/         <-- Chia module nghiệp vụ (POS, Kho, Đơn hàng B2B)
│   │   ├── services/         <-- Gọi API (Axios instance để giao tiếp với Backend)
│   │   └── types/            <-- Định nghĩa các TypeScript Interface
└── app/                      <-- [BACKEND CODE]
    ├── main.py               <-- Điểm khởi chạy FastAPI, cấu hình CORS
    ├── database.py           <-- Cấu hình kết nối SQL Server & Quản lý Session
    ├── models/               <-- Các Entities SQLAlchemy (User, Store, Product...)
    ├── schemas/              <-- Các Pydantic Models (Validate Request/Response)
    ├── routers/              <-- Các API Endpoints (Nhận request từ Frontend)
    └── utils/                <-- Các hàm tiện ích (Băm mật khẩu, xử lý JWT Token)