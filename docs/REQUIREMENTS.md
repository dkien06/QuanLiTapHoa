# ĐẶC TẢ YÊU CẦU HỆ THỐNG (SYSTEM REQUIREMENTS)

## TỔNG QUAN HỆ THỐNG
* **Công nghệ dự kiến:** FastAPI (Backend), React/TypeScript (Frontend), SQL Server (Database).
* **Tác nhân (Actors):**
  * **Chủ tiệm tạp hoá:** Quản lý kho tại quầy, bán lẻ hàng hóa, tạo và theo dõi đơn nhập hàng, ghi nhận doanh thu và lưu trữ hóa đơn điện tử.
  * **Nhà cung cấp (Xưởng):** Quản lý tồn kho xưởng, tiếp nhận đơn đặt hàng từ tiệm tạp hóa, xác nhận và cập nhật trạng thái vận chuyển.
  * **Admin hệ thống:** Quản lý tài khoản và duyệt yêu cầu tạo kho (Bổ sung sau).

---

## MODULE 0: XÁC THỰC & PHÂN QUYỀN (Auth)

* **User Story:** 
  Là người dùng (Chủ tiệm tạp hoá hoặc Nhà cung cấp), tôi muốn đăng ký, đăng nhập và đăng xuất khỏi hệ thống để truy cập vào đúng không gian làm việc tương ứng với vai trò của mình.

* **Input:**
  * **Đăng ký:** Họ tên, Số điện thoại, email, username, password, loại tài khoản (Chủ tiệm/Chủ xưởng), thông tin kho (Tên kho, SĐT, Địa chỉ).
  * **Đăng nhập:** Username, password.

* **Process:** 
  Kiểm tra tính hợp lệ và trùng lặp của dữ liệu (email, username, SĐT); gửi request chờ admin duyệt kho; xác thực thông tin đăng nhập.

* **Output/Error:** 
  Đăng nhập thành công chuyển hướng sang Dashboard và lưu Session; Thất bại hiện Alert báo lỗi sai thông tin hoặc tài khoản tồn tại.

* **UI/UX:** 
  Màn hình đăng nhập/đăng ký căn giữa, chuyển tab qua lại mượt mà, gán sự kiện phím Enter để submit nhanh.

---

## MODULE 1: BÁN HÀNG & GHI NHẬN HÓA ĐƠN (POS & Sales)

* **User Story:** 
  Là Chủ tiệm tạp hoá, tôi muốn quét mã vạch sản phẩm để tạo đơn bán lẻ, hệ thống tự động trừ kho, tính doanh thu và lưu hóa đơn điện tử.

* **Input:** 
  Barcode (từ máy quét), Số lượng (mặc định là 1), Hình thức thanh toán (Tiền mặt / Chuyển khoản QR).

* **Process:** 
  Truy vấn mã vạch để lấy đơn giá; tự động cộng dồn tiền giỏ hàng; kiểm tra tồn kho không được âm khi bấm thanh toán; trừ số lượng tồn thực tế; lưu hóa đơn và chi tiết hóa đơn (snapshot giá); cập nhật doanh thu.

* **Output/Error:** 
  Alert thanh toán thành công; Báo lỗi nếu "Số lượng trong kho không đủ" hoặc "Mã sản phẩm không tồn tại".

* **UI/UX:** 
  Giao diện POS chia 2 cột: Trái là giỏ hàng (TableView có nút xóa/tăng giảm), Phải là thông tin quét mã, tổng tiền hiển thị số to nổi bật và nút "Thanh toán" lớn; Hỗ trợ phím tắt focus nhanh vào ô quét mã.

---

## MODULE 2: QUẢN LÝ KHO TẠP HOÁ & NHẬP HÀNG

### 2.1 Kiểm tra & Quản lý kho tại quầy

* **User Story:** 
  Là Chủ tiệm tạp hoá, tôi muốn kiểm tra tồn kho, giá nhập, giá bán để kiểm soát và nhận cảnh báo khi hàng sắp hết.

* **Input:** 
  SearchBar (Tìm theo Tên hoặc Barcode), Filter theo danh mục hàng hóa.

* **Process:** 
  Truy vấn danh sách và lọc điều kiện; tự động highlight các mặt hàng có số lượng dưới ngưỡng cảnh báo.

* **Output/Error:** 
  Trả về danh sách tồn kho trực quan.

* **UI/UX:** 
  TableView có phân trang; Dữ liệu hiển thị trạng thái bằng Badge màu (Xanh: Còn hàng, Đỏ: Sắp hết/Hết hàng).

### 2.2 Tạo đơn nhập hàng (Tự động & Thủ công)

* **User Story:** 
  Là Chủ tiệm tạp hoá, tôi muốn tạo đơn đặt hàng từ Xưởng liên kết trên app hoặc nhập thủ công từ các nguồn ngoài.

* **Input:**
  * **Tự động:** Chọn Nhà cung cấp (ComboBox), chọn sản phẩm từ catalog xưởng, số lượng nhập, ngày hẹn giao.
  * **Thủ công:** Tên NCC tự do, Tên sản phẩm, Mã vạch, Số lượng, Đơn giá nhập, Giá bán lẻ đề xuất.

* **Process:**
  * **Tự động:** Tạo bản ghi đơn nhập trạng thái `CHO_XAC_NHAN`, gửi thông báo đến Xưởng (tồn kho tiệm chưa đổi).
  * **Thủ công:** Tạo đơn trạng thái `HOAN_THANH`, cộng ngay số lượng vào kho tiệm (khởi tạo sản phẩm nếu chưa có).

* **Output/Error:** 
  Thông báo tạo đơn thành công chờ duyệt, hoặc báo lỗi nếu thiếu trường thông tin bắt buộc.

* **UI/UX:** 
  Modal pop-up form chia 2 Tab rõ ràng: "Đặt hàng qua hệ thống" và "Nhập hàng ngoài (Thủ công)".

### 2.3 Theo dõi đơn nhập & Xác nhận nhận hàng

* **User Story:** 
  Là Chủ tiệm tạp hoá, tôi muốn theo dõi tiến độ đơn hàng và bấm xác nhận khi hàng về để hệ thống tự động cộng kho.

* **Input:** 
  Mã đơn nhập, Nút hành động "Đã nhận được hàng".

* **Process:** 
  Khi bấm nhận, đổi trạng thái đơn thành `HOAN_THANH`; chạy database transaction cộng dồn số lượng mặt hàng tương ứng vào kho tạp hóa.

* **Output/Error:** 
  Alert xác nhận: "Đã hoàn tất đơn nhập và cập nhật số lượng tồn kho!".

* **UI/UX:** 
  TableView theo dõi đơn hàng với các thẻ trạng thái: Chờ xác nhận, Đang chuẩn bị, Đang giao, Đã nhận.

---

## MODULE 3: DÀNH CHO BÊN CUNG CẤP / XƯỞNG

### 3.1 Kiểm tra & Cập nhật kho thủ công

* **User Story:** 
  Là Quản lý xưởng, tôi muốn kiểm tra và tự điều chỉnh số lượng tồn kho sản phẩm bằng tay sau khi kiểm đếm thực tế.

* **Input:** 
  Mã/Tên sản phẩm, Số lượng điều chỉnh, Lý do (Sản xuất mới/Xuất hao hụt/Kiểm kê lại).

* **Process:** 
  Validate số lượng không âm; cập nhật trực tiếp trường tồn kho xưởng; ghi log lịch sử điều chỉnh.

* **Output/Error:** 
  Thông báo cập nhật thành công; Báo lỗi nếu nhập số âm hoặc sai định dạng.

* **UI/UX:** 
  TableView danh sách sản phẩm xưởng; Hỗ trợ chỉnh sửa số lượng trực tiếp trên dòng (Editable TableCell) hoặc Modal pop-up.

### 3.2 Tiếp nhận đơn đặt hàng & Đồng bộ tồn kho

* **User Story:** 
  Là Quản lý xưởng, tôi muốn tiếp nhận đơn từ tiệm tạp hóa, duyệt đơn và hệ thống tự động trừ kho xưởng.

* **Input:** 
  Mã đơn hàng, Nút hành động: "Xác nhận duyệt" hoặc "Từ chối".

* **Process:** 
  Nếu duyệt, kiểm tra điều kiện tồn kho xưởng đủ hàng; chạy transaction trừ kho xưởng giữ chỗ; đổi trạng thái đơn sang `DA_XAC_NHAN`. Nếu từ chối, đổi trạng thái sang `DA_HUY` và ghi lý do.

* **Output/Error:** 
  Báo lỗi "Kho không đủ số lượng để cung cấp" hoặc thông báo duyệt đơn thành công.

* **UI/UX:** 
  Badge thông báo số lượng đơn mới; Danh sách chi tiết hiển thị kèm thông tin tiệm tạp hóa đang đặt.

### 3.3 Quản lý & Cập nhật trạng thái đơn xuất

* **User Story:** 
  Là Quản lý xưởng, tôi muốn cập nhật tiến độ vận chuyển đơn hàng để phía tạp hoá nắm bắt được thời gian giao.

* **Input:** 
  Mã đơn xuất, Trạng thái mới (Đang chuẩn bị hàng / Đang giao / Đã giao tới nơi).

* **Process:** 
  Cập nhật trạng thái đơn hàng; gửi thông báo trạng thái theo thời gian thực tới tài khoản tiệm tạp hoá.

* **Output/Error:** 
  Thông báo cập nhật trạng thái thành công.

* **UI/UX:** 
  Giao diện danh sách hoặc bảng Kanban kéo thả theo các cột trạng thái xử lý đơn.

---

## MODULE 4: BÁO CÁO & LỊCH SỬ GIAO DỊCH

* **User Story:** 
  Là Chủ tiệm tạp hoá, tôi muốn xem lại lịch sử hóa đơn và thống kê doanh thu theo thời gian để nắm bắt tình hình kinh doanh.

* **Input:** 
  Bộ lọc thời gian (Hôm nay / 7 ngày qua / Từ ngày - Đến ngày).

* **Process:** 
  Dùng SQL Aggregate (SUM, COUNT) gom nhóm dữ liệu hóa đơn theo ngày; tính tổng doanh thu và lượt bán trong kỳ.

* **Output/Error:** 
  Trả về biểu đồ doanh thu và danh sách chi tiết; Thông báo "Không có giao dịch" nếu dữ liệu rỗng.

* **UI/UX:** 
  Dashboard hiển thị Thẻ thống kê (Card View) và Biểu đồ cột (BarChart) xu hướng dòng tiền; TableView liệt kê hóa đơn (click đúp để xem lại chi tiết giỏ hàng của hóa đơn đó).