# Use Case Catalog - Kho thành phẩm sản xuất

**Dự án:** Hệ thống quản lý kho thành phẩm WMS  
**Nhóm tài liệu:** 02_Process_UseCase  
**File:** Use_Case_Catalog.md  
**Phiên bản:** 5.0  
**Ngày cập nhật:** 2026-07-07

---

## 1. Mục đích

Tài liệu này liệt kê các use case chính của hệ thống WMS kho thành phẩm, tập trung vào quản lý vòng đời **thùng 60**, **Pack360**, **pallet**, **stock type**, **OEM/PO**, **xuất lẻ** và **truy vết**.

---

## 2. Danh mục use case tổng hợp

| UC ID | Tên use case | Tác nhân chính | Ưu tiên | Ghi chú |
|---|---|---|---|---|
| UC01 | Đăng nhập và phân quyền | Người dùng, IT | Cao | Phân quyền theo vai trò. |
| UC02 | Nhận dữ liệu phiếu giao kho từ sản xuất | Hệ thống, sản xuất | Cao | Nguồn dữ liệu đầu vào cho nhập kho. |
| UC03 | Quét nhập tạm thùng 60 | Nhân viên kho | Cao | Chọn phiếu, dòng chi tiết, scan cùng mã. |
| UC04 | Xác nhận nhập chính thức | Thủ kho | Cao | Post receipt và ledger tăng tồn. |
| UC05 | Gán pallet / putaway / lưu kho | Nhân viên kho | Cao | Lưu kho, chờ đóng Pack360, chờ xuất. |
| UC06 | Đóng Pack360 hàng truyền thống | Nhân viên kho | Cao | Theo rule chuẩn SKU. |
| UC07 | Đóng Pack360 hàng OEM | Nhân viên kho | Cao | Theo rule OEM/PO, có thể khác mã và số lượng. |
| UC08 | Giải phóng Pack360 | Thủ kho, nhân viên kho | Trung bình | Giải phóng toàn bộ Pack360. |
| UC09 | Tách một/vài thùng 60 khỏi Pack360 | Thủ kho, nhân viên kho | Cao | Tách để đóng lại hoặc xử lý riêng. |
| UC10 | Đóng lại Pack360 mới | Nhân viên kho | Trung bình | Dùng thùng đã tách/giải phóng. |
| UC11 | Tra cứu hồ sơ thùng 60 / Pack360 / pallet | Nhân viên kho, quản lý kho | Cao | Current state + event history. |
| UC12 | Chuyển đơn OEM trong lưu kho | Quản lý kho | Cao | Chuyển OEM/PO/pack rule có kiểm soát. |
| UC13 | Chuyển stock type / khóa tồn | Quản lý kho | Cao | BLOCKED cho dư đơn/chất lượng/sai lệch. |
| UC14 | Release tồn bị khóa | Quản lý kho | Cao | Mở khóa sau xử lý. |
| UC15 | Tạo và phân bổ phiếu xuất | Kế hoạch, quản lý kho | Cao | Chỉ phân bổ stock type được phép. |
| UC16 | Xuất nguyên thùng 60 / Pack360 | Nhân viên kho | Cao | Pick, stage, xác nhận xuất. |
| UC17 | Xuất lẻ từ thùng 60 | Nhân viên kho, thủ kho | Cao | Sinh thùng 60 ảo trong bảng thùng 60. |
| UC18 | Xuất tạm | Quản lý kho | Trung bình | TEMPORARY_ISSUE. |
| UC19 | Hoàn nhập / tất toán xuất tạm | Nhân viên kho, quản lý kho | Trung bình | Đóng vòng đời xuất tạm. |
| UC20 | Kiểm kê / điều chỉnh / reversal | Nhân viên kho, quản lý kho | Cao | Không sửa tay sau post. |
| UC21 | Xử lý ngoại lệ | Nhân viên kho, quản lý kho, IT | Cao | Exception có audit. |
| UC22 | Báo cáo và truy vết vòng đời | Quản lý kho, Audit, IT | Cao | Báo cáo tồn, event, ledger, audit. |

---

## 3. Chi tiết use case

### UC01 - Đăng nhập và phân quyền

| Nội dung | Mô tả |
|---|---|
| Mục tiêu | Đảm bảo người dùng được xác thực và chỉ thao tác đúng quyền. |
| Tác nhân | Người dùng kho, thủ kho, quản lý kho, IT. |
| Điều kiện bắt đầu | Tài khoản đã được cấp. |
| Luồng chính | Đăng nhập → xác thực → tải role/permission → điều hướng màn hình → command gửi lên Orchestrator kèm user/role/request_id. |
| Ngoại lệ | Sai tài khoản, không có quyền, tài khoản bị khóa. |
| Dữ liệu | `sec_user`, `sec_role`, `sec_permission`, `AuditLog`. |

---

### UC02 - Nhận dữ liệu phiếu giao kho từ sản xuất

| Nội dung | Mô tả |
|---|---|
| Mục tiêu | Đồng bộ phiếu giao kho và dòng chi tiết từ sản xuất làm cơ sở nhập kho. |
| Tác nhân | Data sản xuất, WMS, IT. |
| Điều kiện bắt đầu | Sản xuất hoàn tất dữ liệu bàn giao. |
| Luồng chính | Nhận header/line → kiểm tra mã hàng, số lượng, OEM/PO, pack rule → lưu staging → sẵn sàng cho NV kho chọn. |
| Ngoại lệ | Thiếu mã hàng, sai pack rule, phiếu trùng, dòng phiếu đóng. |
| Dữ liệu | `production_handover_header`, `production_handover_line`, master SKU, OEM/PO, pack rule. |

---

### UC03 - Quét nhập tạm thùng 60

| Nội dung | Mô tả |
|---|---|
| Mục tiêu | Ghi nhận vật lý các thùng 60 theo một dòng chi tiết phiếu giao kho. |
| Tác nhân | Nhân viên kho. |
| Điều kiện bắt đầu | Có phiếu giao kho từ sản xuất và người dùng có quyền nhập tạm. |
| Luồng chính | Chọn phiếu giao kho → chọn dòng chi tiết → hệ thống khóa mã hàng/OEM/PO/pack rule → scan thùng 60 cùng mã → xác nhận nhập tạm. |
| Ngoại lệ | QR trùng, sai mã hàng, vượt số lượng còn lại, phiếu không còn hiệu lực. |
| Dữ liệu | `receipt_session_header`, `receipt_session_detail`, `tbl_thung60_kho`, `Thung60Event`, `AuditLog`. |
| Kết quả | Có phiên nhập tạm, chưa post ledger, chưa được xuất. |

---

### UC04 - Xác nhận nhập chính thức

| Nội dung | Mô tả |
|---|---|
| Mục tiêu | Thủ kho kiểm tra và post tồn chính thức. |
| Tác nhân | Thủ kho / quản lý kho. |
| Điều kiện bắt đầu | Có phiên nhập tạm chờ xác nhận. |
| Luồng chính | Mở danh sách nhập tạm → đối chiếu phiếu, dòng, số lượng, danh sách thùng → xác nhận → Orchestrator post receipt và ledger tăng tồn. |
| Ngoại lệ | Sai lệch số lượng, thiếu thùng, QR lỗi, hủy nhập tạm. |
| Dữ liệu | `receipt_session_*`, `InventoryLedger`, `StockTransactionBook`, `tbl_thung60_kho`, `AuditLog`. |
| Kết quả | Thùng 60 thành tồn chính thức. |

---

### UC05 - Gán pallet / putaway / lưu kho

| Nội dung | Mô tả |
|---|---|
| Mục tiêu | Đưa thùng 60 hoặc Pack360 vào pallet/vị trí/khu chờ. |
| Tác nhân | Nhân viên kho. |
| Luồng chính | Scan pallet/vị trí → scan thùng/Pack360 → Orchestrator kiểm tra hợp lệ → cập nhật vị trí/current state → ghi event/audit. |
| Ngoại lệ | Pallet/vị trí bị khóa, hàng đã allocated, sai khu vực. |
| Dữ liệu | `Pallet`, `Location`, `tbl_thung60_kho`, `Pack360Header`, `Thung60Event`. |

---

### UC06 - Đóng Pack360 hàng truyền thống

| Nội dung | Mô tả |
|---|---|
| Mục tiêu | Đóng Pack360 theo tiêu chuẩn SKU truyền thống. |
| Tác nhân | Nhân viên kho. |
| Luồng chính | Tạo Pack360 OPEN → scan thùng 60 → kiểm cùng mã/rule chuẩn → đủ slot thì complete → ghi event/audit. |
| Ngoại lệ | Sai mã, thùng đã thuộc Pack360 active, không đủ số lượng/slot. |
| Dữ liệu | `Pack360Header`, `Pack360Unit`, `tbl_thung60_kho`, `Pack360Event`. |

---

### UC07 - Đóng Pack360 hàng OEM

| Nội dung | Mô tả |
|---|---|
| Mục tiêu | Đóng Pack360 theo rule OEM/PO, cho phép khác mã và số lượng tùy đơn. |
| Tác nhân | Nhân viên kho, quản lý kho. |
| Luồng chính | Chọn OEM/PO hoặc pack rule → tạo Pack360 OPEN → scan các thùng được phép → kiểm danh sách/BOM/packing list → complete. |
| Ngoại lệ | Thùng không thuộc danh sách cho phép, sai PO, sai rule, chưa đủ điều kiện complete. |
| Dữ liệu | `Pack360Header`, `Pack360Unit`, `oem_po_line`, `packing_rule`, `Thung60Event`. |

---

### UC08 - Giải phóng Pack360

| Nội dung | Mô tả |
|---|---|
| Mục tiêu | Giải phóng toàn bộ Pack360 để các thùng 60 bên trong được chuyển về trạng thái sẵn sàng. |
| Tác nhân | Thủ kho, nhân viên kho được phân quyền. |
| Luồng chính | Chọn Pack360 → xem danh sách thùng → nhập lý do → xác nhận giải phóng (Không cần duyệt) → Hệ thống chuyển Pack360 thành `RELEASED`, chuyển các thùng 60 về trạng thái `AVAILABLE` tại vị trí `Repack Bin`. Hệ thống cảnh báo nhắc nhân viên kho gạch bỏ/bóc tem mã vạch Pack360 cũ. |
| Ngoại lệ | Pack360 đã xuất/stage/allocated, Pack360 đang bị khóa chất lượng (`BLOCKED` / `QC_HOLD`), không đủ quyền, thiếu lý do. |
| Dữ liệu | `Pack360Header`, `Pack360Unit`, `pack360_relation_history`, `AuditLog`. |

---

### UC09 - Tách một/vài thùng 60 khỏi Pack360

| Nội dung | Mô tả |
|---|---|
| Mục tiêu | Lấy một hoặc vài thùng 60 ra khỏi Pack360 để đóng lại hoặc xử lý riêng. |
| Tác nhân | Thủ kho, nhân viên kho. |
| Luồng chính | Chọn Pack360 → chọn thùng cần tách → kiểm Pack360 chưa xuất/stage → duyệt → gỡ quan hệ → cập nhật Pack360 cũ `COMPLETED_ADJUSTED` hoặc `NEED_REVIEW`. |
| Ngoại lệ | Thùng đã allocated/picked/staged, Pack360 không cho tách, thiếu lý do. |
| Dữ liệu | `Pack360Unit`, `pack360_unit_history`, `Thung60Event`, `AuditLog`. |

---

### UC10 - Đóng lại Pack360 mới

| Nội dung | Mô tả |
|---|---|
| Mục tiêu | Đóng Pack360 mới từ thùng 60 đã giải phóng/tách ra. |
| Tác nhân | Nhân viên kho. |
| Luồng chính | Tạo Pack360 mới → scan thùng `WAITING_REPACK`/`AVAILABLE` → kiểm rule chuẩn hoặc OEM → complete. |
| Ngoại lệ | Thùng đang blocked, sai rule, thùng thuộc Pack360 active khác. |
| Dữ liệu | `Pack360Header`, `Pack360Unit`, `tbl_thung60_kho`. |

---

### UC11 - Tra cứu hồ sơ thùng 60 / Pack360 / Pallet

| Nội dung | Mô tả |
|---|---|
| Mục tiêu | Tra cứu current state và event timeline. |
| Tác nhân | Nhân viên kho, quản lý kho, audit. |
| Luồng chính | Scan/tìm mã → hiển thị trạng thái, stock type, vị trí, pallet, Pack360, OEM/PO, parent/root nếu là thùng ảo, event timeline. |
| Ngoại lệ | Không tìm thấy, dữ liệu thiếu liên kết, object bị nghi ngờ. |
| Dữ liệu | `tbl_thung60_kho`, `Thung60Event`, `Pack360Event`, `AuditLog`. |

---

### UC12 - Chuyển đơn OEM trong lưu kho

| Nội dung | Mô tả |
|---|---|
| Mục tiêu | Chuyển thùng/Pallet/Pack360 từ đơn OEM này sang đơn OEM khác. |
| Tác nhân | Quản lý kho. |
| Luồng chính | Chọn đối tượng → chọn đơn OEM/PO mới → kiểm điều kiện → tạo request → duyệt → cập nhật OEM/PO/pack rule → ghi event/audit/reclassification nếu cần. |
| Ngoại lệ | Hàng đang xuất, đang blocked, PO mới không hợp lệ, Pack360 không cho chuyển một phần. |
| Dữ liệu | `oem_transfer_request_*`, `tbl_thung60_kho`, `InventoryLedger`. |

---

### UC13 - Chuyển stock type / khóa tồn

| Nội dung | Mô tả |
|---|---|
| Mục tiêu | Khóa tồn khi dư đơn, phát hiện vấn đề chất lượng trong kho, dữ liệu nghi ngờ hoặc chờ quyết định. |
| Tác nhân | Quản lý kho. |
| Luồng chính | Chọn đối tượng → chọn stock type `BLOCKED` → chọn reason → kiểm không allocated/picked/staged → duyệt → cập nhật stock type → ghi event/audit. |
| Ngoại lệ | Hàng đã xuất, đang thuộc phiếu xuất active, thiếu lý do, không đủ quyền. |
| Dữ liệu | `stock_type_change_request_*`, `tbl_thung60_kho`, `Thung60Event`, `AuditLog`. |

---

### UC14 - Release tồn bị khóa

| Nội dung | Mô tả |
|---|---|
| Mục tiêu | Mở khóa tồn sau khi đã xử lý lý do khóa. |
| Tác nhân | Quản lý kho hoặc người được ủy quyền. |
| Luồng chính | Chọn hàng `BLOCKED` → xem reason → nhập lý do release → duyệt → chuyển về `UNRESTRICTED` hoặc stock type phù hợp. |
| Ngoại lệ | Chưa đủ điều kiện release, thiếu quyền, lý do quality chưa được xác nhận. |
| Dữ liệu | `stock_type_change_request_*`, `tbl_thung60_kho`, `AuditLog`. |

---

### UC15 - Tạo và phân bổ phiếu xuất

| Nội dung | Mô tả |
|---|---|
| Mục tiêu | Tạo yêu cầu xuất và phân bổ tồn hợp lệ. |
| Tác nhân | Kế hoạch, quản lý kho. |
| Luồng chính | Tạo phiếu xuất → hệ thống gợi ý hàng → kiểm stock type/status → phân bổ. |
| Ngoại lệ | Hàng BLOCKED/TEMPORARY_ISSUE/SCRAP, không đủ tồn, đang khóa kiểm kê. |
| Dữ liệu | `issue_header`, `issue_line`, `allocation`, `tbl_thung60_kho`. |

---

### UC16 - Xuất nguyên thùng 60 / Pack360

| Nội dung | Mô tả |
|---|---|
| Mục tiêu | Pick, stage và xác nhận xuất nguyên thùng hoặc Pack360. |
| Tác nhân | Nhân viên kho, thủ kho. |
| Luồng chính | Chọn phiếu xuất → scan thùng/Pack360 → kiểm thuộc phiếu → pick → stage → xác nhận xuất → ledger giảm tồn. |
| Ngoại lệ | Sai phiếu, sai mã, sai stock type, scan trùng. |
| Dữ liệu | `issue_*`, `InventoryLedger`, `Thung60Event`, `Pack360Event`. |

---

### UC17 - Xuất lẻ từ thùng 60

| Nội dung | Mô tả |
|---|---|
| Mục tiêu | Xuất một phần số lượng từ thùng 60 và sinh bản ghi thùng 60 mới trong bảng thùng 60 hiện có. |
| Tác nhân | Nhân viên kho, thủ kho. |
| Luồng chính | Chọn phiếu xuất → chọn dòng → chọn thùng gốc → nhập số lượng lấy lẻ → Orchestrator sinh thùng mới `is_virtual=1` → cập nhật thùng gốc còn lại → thùng gốc `BLOCKED/PARTIAL_REMAINING` → thùng ảo đi pick/stage/xuất. |
| Ngoại lệ | Số lượng không hợp lệ, thùng gốc bị khóa, thùng thuộc Pack360 chưa được tách, lấy toàn bộ số lượng thì xuất nguyên thùng. |
| Dữ liệu | `tbl_thung60_kho`, `thung60_split_history`, `Thung60Event`, `InventoryLedger`, `AuditLog`. |
| Kết quả | Có thùng 60 mới trong cùng bảng, có parent/root, thùng gốc bị khóa. |

---

### UC18 - Xuất tạm

| Nội dung | Mô tả |
|---|---|
| Mục tiêu | Quản lý hàng rời kho tạm thời nhưng chưa xuất cuối cùng. |
| Tác nhân | Quản lý kho. |
| Luồng chính | Tạo chứng từ xuất tạm → chọn hàng → kiểm điều kiện → chuyển stock type `TEMPORARY_ISSUE` → ghi event/audit. |
| Ngoại lệ | Hàng blocked, không đủ quyền, thiếu người nhận/ngày hẹn trả. |
| Dữ liệu | `temporary_issue_*`, `tbl_thung60_kho`, `AuditLog`. |

---

### UC19 - Hoàn nhập / tất toán xuất tạm

| Nội dung | Mô tả |
|---|---|
| Mục tiêu | Đóng vòng đời xuất tạm bằng hoàn nhập hoặc tất toán. |
| Tác nhân | Nhân viên kho, quản lý kho. |
| Luồng chính | Scan hàng quay về → kiểm chứng từ → chuyển `RETURNED`/`UNRESTRICTED` hoặc tất toán sang xuất thật/điều chỉnh/hủy. |
| Ngoại lệ | Không tìm thấy chứng từ, quá hạn, hàng hư hỏng. |
| Dữ liệu | `temporary_issue_*`, `InventoryLedger`, `Thung60Event`. |

---

### UC20 - Kiểm kê / điều chỉnh / reversal

| Nội dung | Mô tả |
|---|---|
| Mục tiêu | Đối chiếu tồn thực tế, điều chỉnh hoặc đảo nghiệp vụ đã post. |
| Tác nhân | Nhân viên kho, quản lý kho, kế toán. |
| Luồng chính | Tạo phiên kiểm kê → scan/đếm → ghi chênh lệch → tạo adjustment/reversal → duyệt → post ledger/audit. |
| Ngoại lệ | Khu vực đang có giao dịch, thiếu lý do, không đủ quyền. |
| Dữ liệu | `count_session_*`, `adjustment_*`, `InventoryLedger`, `AuditLog`. |

---

### UC21 - Xử lý ngoại lệ

| Nội dung | Mô tả |
|---|---|
| Mục tiêu | Xử lý lỗi scan, thiếu liên kết, sai Pack360, sai pallet, dữ liệu nghi ngờ. |
| Tác nhân | Nhân viên kho, quản lý kho, IT. |
| Luồng chính | Phát hiện lỗi → tạo exception → khóa đối tượng nếu cần → phân công xử lý → cập nhật bằng orchestrator → ghi audit. |
| Ngoại lệ | Cố gắng sửa tay, thiếu phê duyệt, dữ liệu đã post ledger. |
| Dữ liệu | `exception_case`, `AuditLog`, `Thung60Event`. |

---

### UC22 - Báo cáo và truy vết vòng đời

| Nội dung | Mô tả |
|---|---|
| Mục tiêu | Cung cấp báo cáo quản lý và truy vết end-to-end. |
| Tác nhân | Quản lý kho, kế toán, audit, IT. |
| Luồng chính | Chọn báo cáo → lọc theo SKU/OEM/PO/thùng/Pack360/pallet/stock type → xem current state, event, ledger, audit. |
| Ngoại lệ | Thiếu quyền xem audit, dữ liệu chưa đồng bộ. |
| Dữ liệu | `tbl_thung60_kho`, `InventoryLedger`, `AuditLog`, `Thung60Event`. |
