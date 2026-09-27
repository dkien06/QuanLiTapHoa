# KIẾN TRÚC & CẤU TRÚC DỰ ÁN - QUẢN LÝ TẠP HÓA B2B

## 1. Mô hình Kiến trúc
Hệ thống phát triển theo mô hình **Client - Server (Decoupled)**:
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v4.
- **Backend:** FastAPI (Python 3.13+) + SQLAlchemy 2.0 Async + PostgreSQL.
- **Giao tiếp:** RESTful API (JSON).

---

## 2. Cấu trúc Thư mục Dự án (Project Structure)

```text
FastAPIProject/
│
├── backend/                              # [MÃ NGUỒN BACKEND - FASTAPI]
│   ├── app/
│   │   ├── core/                         # Cấu hình cốt lõi
│   │   │   ├── config.py                 # Đọc cấu hình & biến môi trường (.env)
│   │   │   └── database.py               # Kết nối CSDL & Quản lý AsyncSession (get_db)
│   │   ├── routers/                      # Các API Endpoints
│   │   │   ├── inventory.py              # API Quản lý kho, kiểm kê, cảnh báo tồn
│   │   │   └── pos.py                    # API Bán hàng tại quầy (POS, quét mã vạch)
│   │   ├── models.py                     # Thực thể CSDL (SQLAlchemy Models)
│   │   ├── schemas.py                    # Định dạng dữ liệu Request / Response (Pydantic)
│   │   └── main.py                       # Khởi chạy FastAPI, cấu hình CORS & Router
│   ├── .env.example                      # File mẫu biến môi trường Backend
│   └── requirements.txt                  # Danh sách thư viện Python cần cài đặt
│
├── frontend/                             # [MÃ NGUỒN FRONTEND - REACT + TYPESCRIPT]
│   ├── public/                           # Tài nguyên tĩnh (Icon SVG, Favicon)
│   ├── src/
│   │   ├── assets/                       # Hình ảnh minh họa, logo
│   │   ├── components/                   # Các UI Components tái sử dụng
│   │   │   └── auth/                     # Form Đăng nhập (LoginForm), Đăng ký (RegisterForm)
│   │   ├── pages/                        # Các màn hình chính (LoginPage...)
│   │   ├── services/                     # Tầng gọi API Backend (Axios instance, AuthService)
│   │   ├── styles/                       # Hệ thống CSS dùng chung
│   │   │   ├── index.css                 # Master CSS import tất cả các file style
│   │   │   ├── variables.css             # Biến màu sắc POS, font chữ, bo góc, dark mode
│   │   │   ├── base.css                  # Reset CSS mặc định, custom scrollbar
│   │   │   ├── components.css            # Style nút (.btn), thẻ (.card), bảng (.table), badge
│   │   │   ├── animations.css            # Hiệu ứng chuyển động (Fade-in, Pulse, Skeleton)
│   │   │   └── utilities.css             # Tiện ích (Kính mờ glass, định dạng giá tiền)
│   │   ├── types/                        # Khai báo kiểu TypeScript (User, Role, Order...)
│   │   ├── App.tsx                       # Component gốc điều hướng giao diện
│   │   ├── main.tsx                      # Điểm gắn kết React vào DOM
│   │   └── index.css                     # Import Tailwind CSS và thư mục styles
│   ├── package.json                      # Danh sách dependencies & scripts Node.js
│   ├── tsconfig.json                     # Cấu hình TypeScript
│   └── vite.config.ts                    # Cấu hình Vite build tool
│
├── docs/                                 # [TÀI LIỆU DỰ ÁN]
│   ├── ARCHITECHTURE.md                  # Cấu trúc dự án & Kiến trúc (File này)
│   ├── REQUIREMENTS.md                   # Đặc tả yêu cầu & luồng người dùng
│   └── TASK.md                           # Danh sách nhiệm vụ thực hiện
│
├── BUSINESS_LOGIC.md                     # Quy tắc nghiệp vụ lõi (Tính tiền, trừ kho B2B)
├── DATABASE_SCHEMA.md                    # Thiết kế chi tiết bảng CSDL
├── CONTRIBUTING.md                       # Hướng dẫn đóng góp mã nguồn
└── README.md                             # Hướng dẫn cài đặt & chạy dự án
```