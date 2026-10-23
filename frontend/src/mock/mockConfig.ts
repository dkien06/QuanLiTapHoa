// =======================================================
//  MOCK CONFIGURATION — Dành cho Developer
//  Chỉnh sửa file này để test frontend KHÔNG cần backend
// =======================================================
//
//  Hướng dẫn nhanh:
//    1. Đặt MOCK_MODE = true để bật chế độ giả lập
//    2. Đặt MOCK_ACTIVE_USER_INDEX để chọn tài khoản đăng nhập mặc định
//       (0 = Chủ tiệm OWNER, 1 = Nhân viên STAFF)
//    3. Thêm/sửa tài khoản trong MOCK_USERS nếu cần thêm kịch bản test
//
//  Trigger đặc biệt (dùng khi login trong MOCK_MODE):
//    username = "locked_user"   → Giả lập tài khoản bị khóa (403)
//    password = "wrong_password" → Giả lập sai mật khẩu (401)
//    username = "taken_user"    → Giả lập đăng ký trùng username (409)
// =======================================================

import type { User } from '../types/auth';
import type { BankConfig } from '../types/pos';

// ── Bật/tắt mock mode ─────────────────────────────────
/** true = dùng dữ liệu giả lập | false = gọi API thật */
export const MOCK_MODE = true;

/** Mock-only service guard: fail clearly instead of falling back to sample data. */
export const requireMockMode = (feature: string): void => {
  if (!MOCK_MODE) {
    throw new Error(`${feature} API chưa được triển khai. MOCK_MODE=false không sử dụng dữ liệu mẫu.`);
  }
};

// ── Chọn tài khoản active ─────────────────────────────
/** Index trong mảng MOCK_USERS dùng khi đăng nhập thành công */
export const MOCK_ACTIVE_USER_INDEX = 0;

export const MOCK_AUTH_TRIGGERS = {
  lockedUsername: 'locked_user',
  wrongPassword: 'wrong_password',
  takenUsername: 'taken_user',
};

// ── Độ trễ mạng giả lập ───────────────────────────────
/** Thời gian chờ (ms) mô phỏng latency API thực tế */
export const MOCK_DELAY_MS = 600;

// ── Danh sách tài khoản giả lập ───────────────────────
/**
 * Danh sách user để test các vai trò khác nhau.
 * Developer có thể thêm/sửa tùy ý theo kịch bản test.
 */
export const MOCK_USERS: User[] = [
  // ── Bộ 1: Chủ tiệm tạp hóa (OWNER) ─────────────────
  {
    id: '8d45950f-a79c-4891-a413-b8e80515c624',
    username: 'tiem_binh_an',
    fullName: 'Nguyễn Văn An',
    phone: '0901234567',
    role: 'OWNER',
    storeId: 'df935abc-4021-4c20-bad4-3241e85ca2b2',
    storeType: 'GROCERY',
    storeName: 'Tạp hóa Bình An',
    storeAddress: '123 Nguyễn Trãi, P.3, Q.5, TP.HCM',
  },

  // ── Bộ 2: Nhân viên tiệm (STAFF) ────────────────────
  {
    id: 'b1c2d3e4-f5a6-7890-abcd-ef1234567890',
    username: 'nhanvien_01',
    fullName: 'Trần Thị Bình',
    phone: '0912345678',
    role: 'STAFF',
    storeId: 'df935abc-4021-4c20-bad4-3241e85ca2b2',
    storeType: 'GROCERY',
    storeName: 'Tạp hóa Bình An',
    storeAddress: '123 Nguyễn Trãi, P.3, Q.5, TP.HCM',
  },
];

export const MOCK_DEFAULT_USER = MOCK_USERS[MOCK_ACTIVE_USER_INDEX];

/** Example values shown as placeholders in forms; they are not submitted data. */
export const MOCK_FORM_EXAMPLES = {
  fullName: 'Nguyễn Văn An',
  phone: '0901234567',
  groceryUsername: 'tiem_binh_an',
  supplierUsername: 'xuong_nong_san',
  groceryStoreName: 'Tạp hóa Bình An',
  supplierStoreName: 'Xưởng Nông Sản Việt',
  groceryAddress: '123 Nguyễn Trãi, Phường 2, Quận 5, TP.HCM',
  supplierAddress: 'Khu công nghiệp Tân Bình, TP.HCM',
};

// ── Cấu hình ngân hàng thụ hưởng ─────────────────────
/**
 * Thông tin tài khoản ngân hàng dùng để sinh QR thanh toán VietQR.
 * Thay đổi khi test với tài khoản ngân hàng khác.
 */
export const MOCK_BANK_CONFIG: BankConfig = {
  bankId: 'VCB',
  bankName: 'Vietcombank - TMCP Ngoại Thương VN',
  accountNo: '9893456313816',
  accountName: 'NGUYEN VAN AN - TIEM BINH AN',
};
