# Kiến trúc Phân tầng Dữ liệu (Data Layer Architecture)

Hệ thống Quản trị Kho hàng (WMS) yêu cầu sự chính xác tuyệt đối về số liệu tồn kho, truy xuất nguồn gốc (traceability) và khả năng xử lý đồng thời (concurrency) cao khi có nhiều nhân viên kho cùng thao tác bằng máy quét mã vạch (RF Scanner). 

Để đáp ứng các yêu cầu khắt khe này, WMS được thiết kế với **Kiến trúc Phân tầng Dữ liệu (Data Layer Architecture)** xoay quanh mô hình **Sổ cái kép (Dual Ledger)** và **Cơ sở dữ liệu Quan hệ (RDBMS)** với các tiêu chuẩn ACID nghiêm ngặt.

---

## 1. Mô hình Sổ Cái Kép (Dual Ledger System)

Đây là "trái tim" của hệ thống kế toán kho. Bất kỳ sự thay đổi nào về số lượng hàng hóa (Nhập, Xuất, Điều chỉnh) đều không bao giờ ghi đè trực tiếp lên số liệu cũ, mà được hạch toán dưới dạng các bút toán cộng/trừ vào hệ thống Sổ cái. 

Mô hình sổ cái được phân cấp thành 3 bảng chính (Master-Detail):

### 1.1. Bảng `stock_transaction_book` (Sổ Giao Dịch Chức - Master Ledger)
Đóng vai trò là Header của mỗi phiên giao dịch. 
- Mọi thao tác làm thay đổi kho (ví dụ: Chốt một phiếu nhập, Xác nhận một phiếu xuất) đều sinh ra **DUY NHẤT 1 BẢN GHI** tại đây.
- Khóa chính: `transaction_id` (UUID).
- Theo dõi toàn bộ metadata: `transaction_type` (RECEIPT, DISPATCH, PARTIAL...), người thực hiện, thời gian thực hiện, và đối tác liên quan.

### 1.2. Bảng `item_ledger` (Sổ Cái Tổng Hợp Hàng Hóa)
Chịu trách nhiệm ghi nhận biến động tổng số lượng theo **Mã Sản Phẩm (SKU / Product Code)**.
- Phục vụ trực tiếp cho việc xuất Báo cáo Xuất - Nhập - Tồn (XNT) nhanh chóng mà không cần query cộng gộp phức tạp.
- Liên kết với Master thông qua `transaction_id`.
- Thể hiện sự biến thiên: `total_quantity_change` (Mang dấu `+` nếu nhập, `-` nếu xuất).

### 1.3. Bảng `inventory_ledger` (Sổ Cái Chi Tiết Vật Lý)
Chịu trách nhiệm ghi nhận biến động chi tiết đến từng **Mã vạch vật lý (Thùng 60 / Kiện 360 / Thùng Ảo)**.
- Phục vụ truy xuất nguồn gốc (Traceability) tới cấp độ vật lý nhỏ nhất. 
- Nếu một lô hàng lỗi, có thể truy xuất từ sổ cái này để biết chính xác Thùng hàng đó nhập ngày nào, thuộc chứng từ nào.
- Liên kết với Master thông qua `transaction_id`.
- Ghi nhận trạng thái: `old_stock_type` và `new_stock_type` (Ví dụ: Từ `AVAILABLE` sang `SHIPPED`).

---

## 2. Kiến Trúc Thực Thể Vật Lý (Physical Entities)

Bên cạnh Sổ cái, WMS theo dõi vòng đời của các thùng hàng thực tế chạy dưới kho:

- **Bảng `tbl_thung60_kho`:** Đại diện cho Thùng cấp 1 (Carton).
- **Bảng `pack360_header`:** Đại diện cho Kiện cấp 2 (Pallet / Master Pack) chứa nhiều Thùng 60.

**Vòng đời sự kiện (Event Sourcing):**
Hệ thống sử dụng các bảng Event (`thung60_event`, `pack360_event`) để log lại mọi sự kiện xảy ra với mã vạch.
Ví dụ: `RECEIPT_POSTED` -> `PUTAWAY` -> `PICK_60` -> `STAGE_60` -> `SHIP_60`.
Kiến trúc này giúp tái hiện (Playback) lại đường đi của 1 thùng hàng bất kỳ lúc nào.

---

## 3. Kiến Trúc Xử Lý Đồng Thời & An Toàn Dữ Liệu (Concurrency & ACID)

### 3.1. ACID Transactions (Giao Dịch Toàn Vẹn)
Sự kết hợp giữa thay đổi trạng thái Vật lý và Hạch toán Sổ cái đòi hỏi tính nguyên tử (Atomicity). 
- Các câu lệnh `INSERT` vào Sổ cái và `UPDATE` vào Tồn kho luôn được gói gọn trong khối `BEGIN TRAN ... COMMIT`.
- Nếu có bất kỳ lỗi nào (Code lỗi, Mất mạng, Lỗi ràng buộc DB), toàn bộ Transaction sẽ `ROLLBACK`. Không bao giờ có chuyện "Hàng đã xuất đi nhưng Sổ cái chưa ghi nhận" hoặc ngược lại.

### 3.2. Cơ Chế Khóa (Locking & Concurrency Control)
Để giải quyết bài toán Race Condition (2 người cùng thao tác trên 1 thùng hàng tại cùng 1 giây):
- **Khóa Mức Dòng (Row-level Locks - `UPDLOCK`):** Trước khi thao tác, hệ thống sẽ chạy lệnh `SELECT ... WITH (UPDLOCK, ROWLOCK)` trên mã vạch đó. 
- Khóa này sẽ chiếm quyền sở hữu (Exclusive) dòng dữ liệu đó trong suốt quá trình Transaction diễn ra. Nếu user B quét cùng mã vạch đó, Transaction của B sẽ phải xếp hàng chờ (Wait) hoặc Timeout, thay vì chạy đè lên dữ liệu của user A.

### 3.3. Nguyên Lý Xác Thực Nhanh (Fail-fast Validation)
Để bảo vệ DB khỏi tình trạng thắt cổ chai (Bottleneck) do khóa quá lâu:
- Hệ thống luôn thực hiện mọi validation (kiểm tra trạng thái, số lượng, quyền hạn) bằng lệnh `SELECT` (NOLOCK) ở ngay tầng đầu tiên của Logic.
- Chỉ khi tất cả validation đã Pass (Hợp lệ 100%), Transaction thực sự (`BEGIN TRAN` + `UPDLOCK`) mới được kích hoạt để `INSERT/UPDATE`. Thời gian khóa (Lock Duration) vì thế được giảm xuống chỉ còn vài mili-giây.
- Giảm thiểu Deadlock đến mức tối đa.

---

## 4. Đặc tả Thùng Ảo (Virtual Box Concept)
Để thích ứng với bài toán thực tế là "Hàng không nguyên đai nguyên kiện" (hàng lẻ), WMS áp dụng khái niệm **Thùng Ảo**.
- Thay vì thay đổi kiến trúc bảng tồn kho (Cho phép số lượng lẻ tẻ), WMS vẫn đóng gói hàng lẻ vào chung cấu trúc `tbl_thung60_kho`.
- Thùng ảo được gắn cờ `is_virtual = 1`.
- Quản lý tách/gộp (Split/Merge) thùng ảo sinh ra các ID ảo với tiền tố `VIR-...`. Kế thừa nguồn gốc từ `parent_id_60` và `root_id_60` để không bao giờ mất vết của hàng vật lý ban đầu. Đảm bảo tính minh bạch kế toán 100%.
