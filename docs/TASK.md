# DANH SÁCH NHIỆM VỤ FRONTEND (FRONTEND TASK BREAKDOWN)

> **Cập nhật ngày:** 05/10/2026  
> **Công nghệ:** React 19 + TypeScript + Vite + Tailwind CSS v4 + Lucide React + React Router v7  
> **Mục tiêu:** Xây dựng trọn vẹn giao diện và luồng tương tác người dùng cho cả 2 vai trò: **Chủ tiệm tạp hoá** (`GROCERY_OWNER`) và **Nhà cung cấp / Xưởng** (`SUPPLIER_OWNER`).

---

## 📊 TỔNG QUAN TIẾN ĐỘ HIỆN TẠI (CURRENT STATUS)

| Phân hệ / Module | Tiến độ | Tình trạng chi tiết |
| :--- | :---: | :--- |
| **Module 0: Auth & Phân quyền** | 90% | Đã hoàn thiện giao diện Đăng nhập, Đăng ký (2 role), AuthLayout, ProtectedRoute và Mock AuthService. |
| **Dashboard Tổng quan** | 40% | Đã có Header, Sidebar, các Card thống kê và biểu đồ mẫu (Mock static data). Chưa có switch view theo Role. |
| **Module 1: Bán hàng tại quầy (POS)** | 0% | Đang là Placeholder (`PosPlaceholder.tsx`). Chưa có luồng quét mã và giỏ hàng. |
| **Module 2: Quản lý Kho & Nhập hàng** | 0% | Đang là Placeholder (`InventoryPlaceholder.tsx`). Chưa có giao diện kho và đơn nhập. |
| **Module 3: Cung cấp / Xưởng (Supplier)** | 0% | Chưa có giao diện cho vai trò Xưởng (quản lý kho xưởng, duyệt đơn B2B). |
| **Module 4: Báo cáo & Lịch sử giao dịch** | 10% | Mới có card KPI sơ bộ trên dashboard, chưa có lịch sử hoá đơn chi tiết và biểu đồ lọc theo ngày. |
| **Notification & Profile** | 10% | Header có chuông thông báo tĩnh, chưa có popover xem thông báo biến động kho/đơn. |

---

## 📋 PHÂN RÃ NHIỆM VỤ CHI TIẾT (TASKS BREAKDOWN)

### GIAI ĐOẠN 1: BÁN HÀNG TẠI QUẦY & QUẢN LÝ KHO TẠP HOÁ (CORE GROCERY)

#### 🔹 Task FE-01: Giao diện POS - Ô quét mã vạch & Quản lý giỏ hàng bán lẻ
* **Module:** Module 1 (Bán hàng & Ghi nhận hoá đơn)
* **Người thực hiện đề xuất:** 1 Dev Frontend
* **Mô tả công việc:**
  * Dựng layout màn hình bán hàng POS chia làm 2 cột:
    * **Cột trái:** Danh sách mặt hàng trong giỏ (Tên, mã vạch, đơn giá, số lượng `+` / `-`, thành tiền, nút xoá dòng).
    * **Cột phải:** Khung quét mã vạch / tìm kiếm nhanh theo tên sản phẩm; Bảng tổng tiền to rõ ràng (Tổng phụ, Giảm giá nếu có, Tổng thanh toán); Nút "Thanh toán (F9)".
  * Hỗ trợ phím tắt: `F2` focus vào ô quét mã, `Enter` để thêm nhanh sản phẩm vào giỏ.
  * Tự động cộng dồn số lượng khi quét trùng mã barcode.
  * Hiển thị cảnh báo nếu số lượng quét vượt quá tồn kho thực tế của tiệm.
* **Files/Components cần tạo:**
  * `frontend/src/pages/PosPage.tsx`
  * `frontend/src/components/pos/BarcodeScannerInput.tsx`
  * `frontend/src/components/pos/CartTable.tsx`
  * `frontend/src/components/pos/CartSummary.tsx`
  * `frontend/src/types/pos.ts`
  * `frontend/src/services/posService.ts` (Mock data sản phẩm có sẵn)
* **Tiêu chí hoàn thành (DoD):**
  * Nhập barcode hoặc click sản phẩm mẫu -> tự thêm vào giỏ.
  * Tăng giảm số lượng, xoá món, tính lại tổng tiền chuẩn xác theo thời gian thực.
  * Gõ phím tắt hoạt động mượt mà.

---

#### 🔹 Task FE-02: Modal Thanh toán & In/Xem hoá đơn bán lẻ điện tử
* **Module:** Module 1 (Bán hàng & Ghi nhận hoá đơn)
* **Người thực hiện đề xuất:** 1 Dev Frontend
* **Mô tả công việc:**
  * Xây dựng Modal popup khi nhấn nút "Thanh toán" ở màn hình POS.
  * Cho phép chọn phương thức thanh toán: **Tiền mặt** (`CASH`) hoặc **Chuyển khoản QR** (`TRANSFER` - giả lập ảnh mã VietQR/MoMo).
  * Với Tiền mặt: Có ô nhập "Tiền khách đưa", các nút chọn nhanh mệnh giá (50k, 100k, 200k, 500k), tự động tính "Tiền thối lại".
  * Validate chặn thanh toán nếu tiền khách đưa nhỏ hơn tổng hoá đơn.
  * Sau khi bấm "Xác nhận thanh toán": Hiển thị hoá đơn điện tử thành công (Snapshot chi tiết hoá đơn, mã hoá đơn, ngày giờ) kèm nút "In hoá đơn (Ctrl+P)" và "Tạo đơn mới".
* **Files/Components cần tạo:**
  * `frontend/src/components/pos/CheckoutModal.tsx`
  * `frontend/src/components/pos/ReceiptPreviewModal.tsx`
  * Cập nhật `frontend/src/services/posService.ts` (Hàm `createSalesOrder`)
* **Tiêu chí hoàn thành (DoD):**
  * Luồng thanh toán từ giỏ hàng -> Modal chọn phương thức -> Xác nhận thành công -> Reset giỏ hàng hoạt động thông suốt.
  * Giao diện phiếu hoá đơn chuẩn kích thước in bill nhiệt (80mm) đẹp mắt.

---

#### 🔹 Task FE-03: Màn hình Quản lý tồn kho tạp hoá & Cảnh báo hết hàng
* **Module:** Module 2.1 (Kiểm tra & Quản lý kho tại quầy)
* **Người thực hiện đề xuất:** 1 Dev Frontend
* **Mô tả công việc:**
  * Dựng màn hình danh sách tồn kho cửa hàng dạng bảng dữ liệu:
    * Cột: Mã Barcode, Tên sản phẩm, Danh mục, Số lượng tồn, Giá vốn, Giá bán niêm yết, Trạng thái.
  * Thanh công cụ phía trên: Ô tìm kiếm (Tên/Mã vạch), Dropdown lọc theo Danh mục hàng hóa, Nút lọc nhanh "Sắp hết hàng".
  * Badge trạng thái tồn kho: Xanh lá (Còn nhiều > 10), Vàng (Còn ít <= 10), Đỏ (Sắp hết/Đạt ngưỡng `min_stock_alert`).
  * Modal/Drawer xem & chỉnh sửa thông tin giá bán lẻ và ngưỡng cảnh báo tồn tối thiểu (`min_stock_alert`) của mặt hàng.
  * Phân trang danh sách hàng hóa (Pagination) và hiển thị tổng số mặt hàng.
* **Files/Components cần tạo:**
  * `frontend/src/pages/InventoryPage.tsx`
  * `frontend/src/components/inventory/InventoryTable.tsx`
  * `frontend/src/components/inventory/InventoryFilterBar.tsx`
  * `frontend/src/components/inventory/EditProductModal.tsx`
  * `frontend/src/types/inventory.ts`
  * `frontend/src/services/inventoryService.ts`
* **Tiêu chí hoàn thành (DoD):**
  * Bảng hiển thị danh sách tồn kho rõ ràng, tìm kiếm và lọc danh mục tức thời (Client/Mock filter).
  * Chỉnh sửa giá bán hoặc ngưỡng cảnh báo cập nhật lại bảng dữ liệu.

---

### GIAI ĐOẠN 2: QUY TRÌNH NHẬP HÀNG & PHÂN HỆ XƯỞNG CUNG CẤP (B2B SUPPLY CHAIN)

#### 🔹 Task FE-04: Modal Tạo đơn nhập hàng (Đơn B2B xưởng & Nhập hàng thủ công)
* **Module:** Module 2.2 (Tạo đơn nhập hàng)
* **Người thực hiện đề xuất:** 1 Dev Frontend
* **Mô tả công việc:**
  * Dựng Modal tạo đơn nhập hàng gồm 2 Tab rõ rệt:
    * **Tab 1 - "Đặt hàng từ Xưởng liên kết" (B2B):**
      * Dropdown chọn Nhà cung cấp (danh sách Xưởng trên hệ thống).
      * Bảng chọn sản phẩm từ catalog của Xưởng được chọn (có giá sỉ niêm yết của xưởng).
      * Chọn số lượng cần nhập, hiển thị tổng tiền dự kiến.
      * Nút "Gửi đơn đặt hàng" -> Tạo đơn trạng thái `CHO_XAC_NHAN` (`PENDING`).
    * **Tab 2 - "Nhập hàng ngoài (Thủ công)":**
      * Form nhập tự do: Tên nhà cung cấp ngoài, Tên sản phẩm, Mã barcode, Số lượng, Đơn giá nhập, Giá bán lẻ đề xuất.
      * Nút "Xác nhận nhập kho" -> Tạo đơn hoàn tất ngay (`HOAN_THANH` / `RECEIVED`).
* **Files/Components cần tạo:**
  * `frontend/src/components/inventory/CreatePurchaseOrderModal.tsx`
  * `frontend/src/components/inventory/B2BOrderFormTab.tsx`
  * `frontend/src/components/inventory/ManualImportFormTab.tsx`
  * `frontend/src/types/purchaseOrder.ts`
* **Tiêu chí hoàn thành (DoD):**
  * Chuyển đổi qua lại giữa 2 tab mượt mà.
  * Tab B2B: Khi chọn xưởng khác thì danh mục hàng hóa tương ứng thay đổi theo.
  * Form validate đầy đủ các trường bắt buộc trước khi submit.

---

#### 🔹 Task FE-05: Màn hình Theo dõi đơn nhập hàng & Xác nhận nhận hàng
* **Module:** Module 2.3 (Theo dõi đơn nhập & Xác nhận nhận hàng)
* **Người thực hiện đề xuất:** 1 Dev Frontend
* **Mô tả công việc:**
  * Dựng màn hình / tab danh sách đơn nhập hàng của tiệm tạp hoá.
  * Bộ lọc trạng thái: Tất cả, Chờ duyệt (`PENDING`), Đã duyệt (`CONFIRMED`), Đang giao (`SHIPPING`), Đã nhận (`RECEIVED`), Đã huỷ (`CANCELLED`).
  * Hiển thị thông tin từng đơn: Mã đơn, Tên xưởng cung cấp, Ngày đặt, Tổng tiền, Trạng thái với màu sắc tương ứng.
  * Nút "Xem chi tiết đơn" -> Hiển thị Modal/Drawer danh sách các món hàng trong đơn.
  * Nút hành động "Đã nhận được hàng" (chỉ khả dụng khi đơn ở trạng thái `SHIPPING` hoặc `CONFIRMED`) -> Kích hoạt popup xác nhận nhận hàng và cập nhật đơn sang `RECEIVED`.
* **Files/Components cần tạo:**
  * `frontend/src/components/inventory/PurchaseOrderList.tsx`
  * `frontend/src/components/inventory/PurchaseOrderDetailModal.tsx`
  * Cập nhật `frontend/src/services/purchaseOrderService.ts` (Hàm `confirmReceivedOrder`)
* **Tiêu chí hoàn thành (DoD):**
  * Lọc danh sách đơn theo từng trạng thái chuẩn xác.
  * Bấm "Đã nhận được hàng" đổi trạng thái sang `RECEIVED` kèm thông báo toast/alert thành công.

---

#### 🔹 Task FE-06: Màn hình Quản lý & Điều chỉnh tồn kho Xưởng (Dành cho Nhà cung cấp)
* **Module:** Module 3.1 (Kiểm tra & Cập nhật kho thủ công phía Xưởng)
* **Người thực hiện đề xuất:** 1 Dev Frontend
* **Mô tả công việc:**
  * Dựng giao diện quản lý kho riêng cho tài khoản Nhà cung cấp (`SUPPLIER_OWNER`):
    * Danh sách sản phẩm của xưởng, số lượng tồn kho xưởng, giá sỉ bán cho tạp hoá.
  * Tính năng kiểm kê & điều chỉnh tồn kho thực tế:
    * Nút "Điều chỉnh số lượng" trên từng dòng hoặc modal điều chỉnh hàng loạt.
    * Form nhập: Số lượng chênh lệch/mới, Lý do điều chỉnh (Sản xuất lô mới, Hao hụt/Hỏng hóc, Kiểm kê lại).
    * Validate không cho phép tồn kho âm.
  * Tab / Drawer xem lịch sử các lần điều chỉnh số lượng gần nhất.
* **Files/Components cần tạo:**
  * `frontend/src/pages/supplier/SupplierInventoryPage.tsx`
  * `frontend/src/components/supplier/SupplierInventoryTable.tsx`
  * `frontend/src/components/supplier/StockAdjustmentModal.tsx`
  * `frontend/src/services/supplierService.ts`
* **Tiêu chí hoàn thành (DoD):**
  * Giao diện xưởng phân biệt rõ ràng với tiệm tạp hoá.
  * Chỉnh sửa số lượng kho xưởng thành công và hiển thị lịch sử ghi nhận lý do.

---

#### 🔹 Task FE-07: Màn hình Xử lý đơn đặt hàng B2B & Điều phối vận chuyển phía Xưởng
* **Module:** Module 3.2 & 3.3 (Tiếp nhận đơn, duyệt đơn & Cập nhật trạng thái đơn xuất)
* **Người thực hiện đề xuất:** 1 Dev Frontend
* **Mô tả công việc:**
  * Dựng giao diện tiếp nhận đơn đặt hàng từ các tiệm tạp hóa gửi đến Xưởng:
    * Danh sách các đơn chờ xử lý (`PENDING`): Hiển thị tên tiệm đặt, số điện thoại, danh sách mặt hàng, số lượng và tổng tiền.
  * Nút hành động xử lý đơn:
    * **"Duyệt đơn":** Kiểm tra tồn kho xưởng có đủ cung cấp không. Nếu đủ -> chuyển sang `CONFIRMED`. Nếu thiếu -> cảnh báo đỏ không thể duyệt.
    * **"Từ chối":** Nhập lý do huỷ đơn -> chuyển sang `CANCELLED`.
  * Giao diện quản lý tiến độ đơn xuất dạng **Bảng Kanban** hoặc Tab điều hướng:
    * Cột 1: Đã xác nhận / Đang chuẩn bị hàng (`CONFIRMED`)
    * Cột 2: Đang vận chuyển (`SHIPPING`)
    * Cột 3: Đã giao thành công (`RECEIVED`)
  * Cho phép bấm nút cập nhật trạng thái đơn từ "Chuẩn bị hàng" -> "Giao hàng".
* **Files/Components cần tạo:**
  * `frontend/src/pages/supplier/SupplierOrdersPage.tsx`
  * `frontend/src/components/supplier/PendingOrdersList.tsx`
  * `frontend/src/components/supplier/OrderKanbanBoard.tsx`
  * `frontend/src/components/supplier/RejectOrderModal.tsx`
* **Tiêu chí hoàn thành (DoD):**
  * Duyệt đơn hoặc từ chối đơn hoạt động trơn tru với dữ liệu mẫu.
  * Cập nhật trạng thái chuyển đơn giữa các cột Kanban mượt mà.

---

### GIAI ĐOẠN 3: BÁO CÁO DOANH THU, THÔNG BÁO & HOÀN THIỆN HỆ THỐNG

#### 🔹 Task FE-08: Màn hình Lịch sử hoá đơn bán lẻ & Chi tiết giao dịch
* **Module:** Module 4 (Báo cáo & Lịch sử giao dịch)
* **Người thực hiện đề xuất:** 1 Dev Frontend
* **Mô tả công việc:**
  * Dựng màn hình xem lịch sử toàn bộ các hoá đơn bán lẻ tại quầy của tiệm tạp hoá.
  * Bảng dữ liệu hoá đơn: Mã hoá đơn, Thời gian bán, Thu ngân thực hiện, Hình thức thanh toán (Tiền mặt / QR), Tổng tiền.
  * Bộ lọc dữ liệu: Khoảng ngày (Từ ngày - Đến ngày, Hôm nay, 7 ngày qua), Lọc theo phương thức thanh toán.
  * Click đúp hoặc nhấn nút "Chi tiết" để mở Modal xem lại danh sách chi tiết các mặt hàng đã mua của hoá đơn đó (kèm snapshot giá bán lúc lập đơn).
  * Nút "In lại hoá đơn" từ màn hình chi tiết.
* **Files/Components cần tạo:**
  * `frontend/src/pages/SalesHistoryPage.tsx`
  * `frontend/src/components/sales/SalesOrdersTable.tsx`
  * `frontend/src/components/sales/SalesOrderDetailModal.tsx`
  * `frontend/src/components/sales/SalesHistoryFilterBar.tsx`
* **Tiêu chí hoàn thành (DoD):**
  * Tìm kiếm, lọc theo ngày tháng hiển thị đúng danh sách hoá đơn.
  * Xem lại chi tiết từng đơn hàng chính xác số lượng và đơn giá snapshot.

---

#### 🔹 Task FE-09: Hoàn thiện Dashboard Thống kê & Biểu đồ doanh thu
* **Module:** Module 4 (Báo cáo & Lịch sử giao dịch) & Hoàn thiện Dashboard
* **Người thực hiện đề xuất:** 1 Dev Frontend
* **Mô tả công việc:**
  * Hoàn thiện trang `DashboardPage.tsx` với biểu đồ và chỉ số phân tích trực quan:
    * Thẻ KPI: Doanh thu kỳ chọn, Lợi nhuận ước tính, Tổng số đơn hàng, Số mặt hàng sắp hết.
    * Biểu đồ doanh thu theo thời gian (Hôm nay theo khung giờ, Tuần này theo ngày, Tháng này theo tuần/ngày).
    * Biểu đồ tròn hoặc thanh tỷ trọng doanh thu theo danh mục hàng hóa (Đồ uống, Bánh kẹo, Gia vị...).
    * Danh sách Top 5 sản phẩm bán chạy nhất kèm số lượng và doanh thu mang lại.
  * Đồng bộ bộ lọc thời gian: "Hôm nay", "Tuần này", "Tháng này" cập nhật lại dữ liệu biểu đồ và số liệu KPI.
* **Files/Components cần tạo:**
  * Nâng cấp `frontend/src/components/dashboard/RevenueBarChart.tsx`
  * Cập nhật `frontend/src/components/dashboard/StatsCards.tsx`
  * Cập nhật `frontend/src/components/dashboard/TopSellingProducts.tsx`
  * Cập nhật `frontend/src/components/dashboard/CategoryDistribution.tsx`
  * `frontend/src/services/dashboardService.ts`
* **Tiêu chí hoàn thành (DoD):**
  * Giao diện biểu đồ hiển thị mượt mà, responsive tốt trên các kích thước màn hình.
  * Bấm chuyển tab thời gian thì các chỉ số cập nhật tương ứng.

---

#### 🔹 Task FE-10: Trung tâm Thông báo (Notifications) & Điều hướng phân quyền đa vai trò
* **Module:** Module 0 (Phân quyền) & Header Notifications
* **Người thực hiện đề xuất:** 1 Dev Frontend
* **Mô tả công việc:**
  * **Trung tâm thông báo trên Header:**
    * Popover/Dropdown hiển thị danh sách thông báo khi click vào icon chuông trên `Header.tsx`.
    * Hiển thị badge số lượng thông báo chưa đọc.
    * Phân loại icon và màu sắc cho các loại thông báo: Cảnh báo hết hàng (`LOW_STOCK`), Đổi trạng thái đơn B2B (`PO_STATUS_CHANGED`).
    * Nút "Đánh dấu tất cả là đã đọc".
  * **Điều hướng Sidebar theo vai trò:**
    * Cập nhật `Sidebar.tsx` và `App.tsx`:
      * Nếu `user.storeType === 'GROCERY'`: Menu gồm Tổng quan, Bán hàng (POS), Quản lý kho, Nhập hàng B2B, Lịch sử bán hàng.
      * Nếu `user.storeType === 'SUPPLIER'`: Menu gồm Tổng quan xưởng, Quản lý kho xưởng, Tiếp nhận đơn hàng B2B.
* **Files/Components cần tạo:**
  * `frontend/src/components/notifications/NotificationDropdown.tsx`
  * Cập nhật `frontend/src/components/dashboard/Header.tsx`
  * Cập nhật `frontend/src/components/dashboard/Sidebar.tsx`
  * Cập nhật điều hướng trong `frontend/src/App.tsx`
  * `frontend/src/services/notificationService.ts`
* **Tiêu chí hoàn thành (DoD):**
  * Click chuông mở dropdown hiển thị danh sách thông báo, bấm đọc cập nhật badge.
  * Đăng nhập với tài khoản Tiệm tạp hóa hoặc Xưởng sẽ hiển thị đúng các menu chức năng tương ứng của vai trò đó.

