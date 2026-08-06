# Báo Cáo Phân Tích Nghiệp Vụ - UC08: Giải phóng Pack360

## 1. Tổng Quan (Overview)
- **Mã Use Case:** UC08
- **Tên Use Case:** Giải phóng Pack360
- **Mục tiêu chính:** Giải phóng toàn bộ một Pack360 (Pallet/Master Carton) đã được đóng gói (`COMPLETED`), để tách các thùng 60 (thùng lẻ) bên trong ra nhằm mục đích xử lý lại, đóng gói lại, hoặc trả về tồn kho.
- **Tác nhân (Actors):** Thủ kho, Nhân viên kho được phân quyền, Quản lý kho (đối với phê duyệt).

## 2. Luồng Nghiệp Vụ Chính (Business Flow)
Dựa trên tài liệu Use Case Catalog, Business Rules, và Decision Tables, luồng xử lý chuẩn của UC08 như sau:
1. **Khởi tạo:** Người dùng (Thủ kho/NV kho) chọn một Pack360 cụ thể trên hệ thống.
2. **Kiểm tra điều kiện:** Hệ thống xác thực Pack360 phải tồn tại, đang ở trạng thái `COMPLETED` (không phải `OPEN` hay `SHIPPED`), không bị đưa vào vùng `STAGED`, và không bị gán (allocate) cho bất kỳ phiếu xuất kho đang active nào.
3. **Nhập thông tin:** Người dùng xem danh sách các thùng 60 bên trong và bắt buộc nhập **Lý do giải phóng**.
4. **Phê duyệt:** Yêu cầu giải phóng được xác nhận (có thể yêu cầu duyệt tùy theo thiết lập phân quyền).
5. **Thực thi (Orchestrator):** 
   - Đổi trạng thái `pack360_header` thành `RELEASED`.
   - Cập nhật các thùng 60 bên trong (`tbl_thung60_kho`) gỡ bỏ liên kết với Pack360 này, và chuyển trạng thái về `WAITING_REPACK` hoặc `AVAILABLE`.
6. **Lưu vết:** Ghi nhận sự kiện vào `Pack360Event`, `Thung60Event`, `pack360_relation_history`, và `AuditLog`.

---

## 3. Phân Tích Các Điểm Thiếu Sót, Mơ Hồ và Lỗ Hổng (Gaps & Edge Cases)

Qua quá trình rà soát đối chiếu chéo giữa Quy trình (Process), Luật nghiệp vụ (Business Rules), Thiết kế CSDL (Data Design) và Đặc tả API, hệ thống tồn tại các vấn đề sau cần được làm rõ và xử lý:

### 3.1. Sự mơ hồ về Trạng thái Thùng 60 sau khi giải phóng (G1)
- **Vấn đề:** Theo `BR-P360-REL-003`, sau khi giải phóng, thùng 60 được chuyển về trạng thái `WAITING_REPACK` hoặc `AVAILABLE` **"theo điều kiện"**. Tuy nhiên, "điều kiện" này hiện chưa được định nghĩa chi tiết trong bất kỳ tài liệu nào.
- **Đề xuất xử lý:**
  - Cần làm rõ quy tắc: Nếu mục đích giải phóng là để đóng lại kiện khác ngay lập tức, chuyển thành `WAITING_REPACK`. Nếu giải phóng để trả về kệ cất trữ (putaway) như hàng tồn kho độc lập, chuyển thành `AVAILABLE`.
  - Cần thêm tùy chọn trên UI để người dùng chọn hành động tiếp theo cho các thùng 60 này.

### 3.2. Lỗ hổng về Quản lý Vị trí (Location Management) sau khi giải phóng (G2)
- **Vấn đề:** Khi một Pack360 bị giải phóng, các thùng 60 bên trong sẽ nằm ở đâu trên hệ thống? Tài liệu chưa đề cập việc kế thừa vị trí (Location / Bin) của Pack360 hay phải chuyển về một Virtual Location / Repack Bin.
- **Đề xuất xử lý:** 
  - Mặc định gán Location của các thùng 60 bằng chính Location hiện tại của Pack360 vừa bị giải phóng.
  - Sinh ra task (nhiệm vụ) dời vị trí (Move Task) nếu quy trình yêu cầu dời hàng sang khu vực Repack.

### 3.3. Thiếu sót trong Triển khai Kỹ thuật (Technical Missing - Stored Procedure) (G3)
- **Vấn đề:** API Specification có định nghĩa endpoint `POST /api/v1/pack360/{pack360Id}/release` gọi đến SP `usp_Pack360_Release`. Tuy nhiên, kiểm tra file `02_Pack360_SPs.sql` cho thấy **chưa có SP này**. 
- **Lưu ý:** Hiện tại chỉ có đoạn code tương đương với `usp_Pack360_Reset` (áp dụng cho việc xóa Pack360 trạng thái `OPEN`), trong đó dữ liệu bị xóa vật lý (`DELETE FROM pack360_header...`). Điều này vi phạm quy tắc `BR-P360-REL-001` (Không được xóa vật lý Pack360 đã tạo).
- **Đề xuất xử lý:** Developer cần viết bổ sung `usp_Pack360_Release` theo đúng quy định: Chỉ thực hiện `UPDATE` trạng thái thành `RELEASED`, không `DELETE` dữ liệu.

### 3.4. Edge Case: Trạng thái Khóa tồn (Blocked / Hold) (G4)
- **Vấn đề:** Điều kiện chặn giải phóng (Decision Tables phần 6) mới chỉ bắt các case `SHIPPED`, `STAGED`, `Allocated`. Vậy nếu Pack360 đang bị khóa chất lượng (Stock Type = `BLOCKED` hoặc `QC_HOLD`), người dùng có được phép giải phóng không?
- **Đề xuất xử lý:** Cần bổ sung luật: Không cho phép giải phóng đối với Pack360 đang bị `BLOCKED` trừ khi người thực hiện có quyền hạn (Role) của QA/QC Manager để xử lý hàng lỗi.

### 3.5. Quy trình duyệt (Approval Workflow) chưa rõ ràng (G5)
- **Vấn đề:** Trong luồng chính có nhắc đến chữ "duyệt", nhưng không có quy trình workflow nào định nghĩa việc khi nào cần duyệt, ai duyệt (Quản lý kho hay Hệ thống tự duyệt).
- **Đề xuất xử lý:** Xác định rõ trên Data Model: Liệu việc giải phóng là đồng bộ (Synchronous - bấm là giải phóng ngay nếu có đủ quyền), hay bất đồng bộ (Asynchronous - sinh ra 1 Request Ticket để Quản lý kho duyệt).

### 3.6. Xử lý Tem Nhãn Vật Lý (Physical Labeling) (G6)
- **Vấn đề:** Khi Pack360 bị giải phóng trên hệ thống, tem nhãn mã vạch vật lý dán trên Pallet/Carton vẫn còn tồn tại ở kho thực tế. Nếu không gỡ/hủy tem này, có rủi ro nhân viên quét nhầm mã cũ ở các bước sau.
- **Đề xuất xử lý:** Bổ sung bước nghiệp vụ/cảnh báo trên màn hình HHT (Máy quét mã vạch): "Vui lòng gạch bỏ hoặc bóc tem mã vạch Pack360 cũ trước khi tiếp tục xử lý các thùng 60".

---
**Kết luận:** 
Tài liệu Use Case UC08 hiện tại đã vạch ra được khung sườn cơ bản. Tuy nhiên, để có thể code và áp dụng vận hành thực tế không bị lỗi dữ liệu, BA cần tổ chức một buổi workshop nhỏ để chốt với PO và Dev team về 6 lỗ hổng đã được liệt kê ở phần 3.
