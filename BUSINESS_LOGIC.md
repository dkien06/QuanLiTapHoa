# QUY TẮC NGHIỆP VỤ HỆ THỐNG (BUSINESS LOGIC)

Tài liệu quy định chi tiết các luồng xử lý dữ liệu, điều kiện ràng buộc giao dịch và sự biến động tồn kho, dòng tiền giữa Tạp hoá và Xưởng.

---

## 1. Xác thực & Phân quyền (Auth & Roles)

* **Phân định vai trò:**
  * `GROCERY_OWNER`: Chỉ truy cập dữ liệu và kho thuộc `stores` có `store_type = 'GROCERY'`.
  * `SUPPLIER_OWNER`: Chỉ truy cập dữ liệu và đơn xuất thuộc `stores` có `store_type = 'SUPPLIER'`.
* **Quan hệ sở hữu:** Mỗi `user` có thể sở hữu một hoặc nhiều `stores`, nhưng các phiên làm việc (Session/JWT) phải định danh rõ ràng `store_id` đang thao tác.

---

## 2. Bán lẻ tại quầy POS (Sales Flow - Tạp hoá)

* **Quét mã vạch:**
  * Quét `products.barcode`: Tra cứu `product_id` trong danh mục hệ thống, sau đó lấy thông tin tồn kho và `selling_price` từ `store_inventories` của tiệm.
  * Nếu sản phẩm chưa có mã vạch (hàng xá, rau củ có `barcode = NULL`), hỗ trợ tìm kiếm bằng `custom_name` hoặc `original_name`.
  * Quét trùng mã: Tự động cộng dồn số lượng mặt hàng trong giỏ hàng hiện tại.
* **Quy tắc trừ tồn kho & Chặn bán âm:**
  * Tại thời điểm bấm "Thanh toán", hệ thống bắt buộc kiểm tra điều kiện:
    `store_inventories.quantity >= cart_quantity`
  * Nếu không đủ hàng: Hủy giao dịch và trả về lỗi `400 Bad Request` kèm tên mặt hàng thiếu hụt.
  * Nếu đủ hàng: Thực hiện trừ kho ngay lập tức:
    `quantity_mới = quantity_cũ - cart_quantity`
* **Snapshot giá bán:**
  * Giá bán thực tế tại thời điểm giao dịch **bắt buộc** lưu vào `sales_order_items.unit_price`.
  * Việc thay đổi `selling_price` trong tương lai tuyệt đối không làm sai lệch doanh thu của các hoá đơn cũ.
* **Cập nhật quỹ tiền (`balance`):**
  * Tăng số dư của tiệm tạp hoá tương ứng với tổng tiền thu về:
    `stores.balance = stores.balance + sales_orders.total_amount`
* **Cảnh báo tồn kho tối thiểu (`LOW_STOCK`):**
  * Nếu sau khi trừ, `quantity <= min_stock_alert`, hệ thống tự động chèn một bản ghi vào bảng `notifications` với `type = 'LOW_STOCK'` để cảnh báo chủ tiệm.

---

## 3. Nhập hàng B2B qua ứng dụng (Tạp hoá <-> Xưởng liên kết)

Quy trình giao dịch khép kín qua các trạng thái của `purchase_orders`:
[PENDING]  ──(Xưởng duyệt)──>  [CONFIRMED]  ──(Xưởng gửi hàng)──>  [SHIPPING]  ──(Tạp hoá nhận)──>  [RECEIVED]
│                               │
└──(Huỷ đơn)──> [CANCELLED]     └──(Huỷ đơn)──> [CANCELLED] (Hoàn lại tồn kho xưởng)
1. **Tạo đơn đặt hàng (`PENDING`):**
   * Tiệm tạp hoá (`grocery_store_id`) chọn Xưởng (`supplier_store_id`) và danh sách sản phẩm.
   * Cả kho tiệm và kho xưởng đều **chưa thay đổi**.
2. **Xưởng duyệt đơn (`CONFIRMED`):**
   * Kiểm tra tồn kho xưởng: Bắt buộc tồn kho xưởng >= số lượng đặt.
   * Trừ tồn kho xưởng ngay lập tức trong bảng `store_inventories` để giữ chỗ (reserve stock).
   * Gửi thông báo `PO_STATUS_CHANGED` đến chủ tiệm.
3. **Xưởng giao hàng (`SHIPPING`):**
   * Cập nhật trạng thái đơn sang đang vận chuyển.
4. **Tạp hoá bấm xác nhận nhận hàng (`RECEIVED`):**
   * Thực hiện đồng thời trong 1 Transaction:
     1. Cộng số lượng vào kho tiệm: `quantity_tiệm = quantity_tiệm + item.quantity`.
     2. Cập nhật lại giá vốn `cost_price` trong `store_inventories` của tiệm dựa trên `purchase_order_items.unit_price`.
     3. Trừ tiền quỹ tiệm: `balance_tiệm = balance_tiệm - purchase_orders.total_amount`.
     4. Cộng tiền quỹ xưởng: `balance_xưởng = balance_xưởng + purchase_orders.total_amount`.
5. **Huỷ đơn (`CANCELLED`):**
   * Nếu huỷ khi đang `CONFIRMED` hoặc `SHIPPING`: Hệ thống phải hoàn lại (cộng trả) số lượng hàng vào kho của xưởng.

---

## 4. Nhập hàng thủ công từ nguồn ngoài (Manual Import)

* Áp dụng khi tiệm tạp hoá nhập hàng từ chợ đầu mối hoặc nhà cung cấp truyền thống không dùng app.
* **Đặc điểm bản ghi:**
  * `purchase_orders.supplier_store_id = NULL`.
  * Trạng thái khởi tạo và hoàn tất ngay lập tức là `RECEIVED`.
* **Xử lý tồn kho & dòng tiền:**
  * Cộng trực tiếp số lượng vào `store_inventories` của tiệm (nếu sản phẩm chưa có trong kho tiệm thì khởi tạo bản ghi mới).
  * Cập nhật lại giá vốn `cost_price` theo đơn giá nhập ghi nhận trên phiếu.
  * Trừ số dư quỹ của tiệm tạp hoá:
    `stores.balance = stores.balance - total_amount`
