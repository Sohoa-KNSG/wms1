# Data Validation Rules - Kho thành phẩm sản xuất

## 1. Mục đích

Tài liệu định nghĩa các rule kiểm tra dữ liệu cho WMS kho thành phẩm, dùng cho Orchestrator, API, database constraint và test case.

## 2. Validation tổng quát

| Mã rule | Kiểm tra | Thông báo lỗi đề xuất |
|---|---|---|
| DVR-GEN-001 | `request_id` không được rỗng đối với command ghi dữ liệu. | `REQUEST_ID_REQUIRED` |
| DVR-GEN-002 | Cùng `request_id` và command type chỉ được post một lần. | `DUPLICATE_REQUEST` |
| DVR-GEN-003 | Người dùng phải có quyền với nghiệp vụ. | `PERMISSION_DENIED` |
| DVR-GEN-004 | Không cho update trực tiếp current state ngoài Orchestrator. | `DIRECT_UPDATE_NOT_ALLOWED` |
| DVR-GEN-005 | Mọi update nghiệp vụ phải ghi event và audit. | `EVENT_AUDIT_REQUIRED` |

## 3. Validation nhập tạm

| Mã rule | Kiểm tra | Lỗi |
|---|---|---|
| DVR-IN-001 | Phải chọn phiếu giao kho. | `HANDOVER_REQUIRED` |
| DVR-IN-002 | Phải chọn dòng chi tiết. | `HANDOVER_LINE_REQUIRED` |
| DVR-IN-003 | Phiếu giao kho phải ở trạng thái cho phép nhập. | `HANDOVER_NOT_OPEN` |
| DVR-IN-004 | QR thùng 60 phải tồn tại. | `QR_NOT_FOUND` |
| DVR-IN-005 | QR không được trùng trong cùng phiên. | `DUPLICATE_SCAN_IN_SESSION` |
| DVR-IN-006 | Mã hàng thùng phải khớp dòng phiếu. | `PRODUCT_MISMATCH` |
| DVR-IN-007 | Số lượng quét không vượt số lượng còn lại nếu không có phê duyệt. | `QTY_EXCEED_REMAINING` |
| DVR-IN-008 | Phiên nhập tạm đã xác nhận chính thức không được sửa. | `SESSION_ALREADY_POSTED` |

## 4. Validation thùng 60 current state

| Mã rule | Kiểm tra | Lỗi |
|---|---|---|
| DVR-60-001 | `id_60` bắt buộc và duy nhất. | `ID60_REQUIRED_OR_DUPLICATE` |
| DVR-60-002 | `qr_60` bắt buộc và duy nhất. | `QR60_REQUIRED_OR_DUPLICATE` |
| DVR-60-003 | `current_qty >= 0`. | `INVALID_CURRENT_QTY` |
| DVR-60-004 | `original_qty > 0`. | `INVALID_ORIGINAL_QTY` |
| DVR-60-005 | `stock_type` phải thuộc danh mục hợp lệ. | `INVALID_STOCK_TYPE` |
| DVR-60-006 | Nếu `stock_type = BLOCKED` thì `block_reason_code` bắt buộc. | `BLOCK_REASON_REQUIRED` |
| DVR-60-007 | Nếu `is_virtual = 1` thì `parent_id_60`, `root_id_60`, `unit_origin_type = SPLIT_VIRTUAL` bắt buộc. | `VIRTUAL_LINK_REQUIRED` |
| DVR-60-008 | Nếu `is_virtual = 0` thì `unit_origin_type` mặc định là `PHYSICAL`, trừ trường hợp adjustment. | `INVALID_ORIGIN_TYPE` |
| DVR-60-009 | Nếu `current_qty < standard_qty` sau split thì phải block reason `PARTIAL_REMAINING` hoặc có reason hợp lệ khác. | `PARTIAL_REMAINING_MUST_BE_BLOCKED` |
| DVR-60-010 | Thùng `SHIPPED` hoặc `SCRAPPED` không được cập nhật nghiệp vụ mới nếu không có reversal/adjustment. | `FINAL_STATUS_LOCKED` |

## 5. Validation Pack360

| Mã rule | Kiểm tra | Lỗi |
|---|---|---|
| DVR-P360-001 | Pack360 QR phải duy nhất. | `PACK360_QR_DUPLICATE` |
| DVR-P360-002 | Chỉ Pack360 `OPEN` mới được thêm thùng. | `PACK360_NOT_OPEN` |
| DVR-P360-003 | Một thùng 60 chỉ thuộc một Pack360 active. | `THUNG60_ALREADY_IN_ACTIVE_PACK360` |
| DVR-P360-004 | Thùng `SHIPPED`, `SCRAPPED`, `TEMP_ISSUED` không được đưa vào Pack360. | `INVALID_THUNG60_STATUS_FOR_PACK360` |
| DVR-P360-005 | Thùng `stock_type != UNRESTRICTED` không được đưa vào Pack360 nếu không có rule cho phép. | `INVALID_STOCK_TYPE_FOR_PACK360` |
| DVR-P360-006 | Hàng truyền thống phải đúng rule chuẩn. | `STANDARD_PACK_RULE_VIOLATED` |
| DVR-P360-007 | Hàng OEM phải đúng rule OEM/PO. | `OEM_PACK_RULE_VIOLATED` |
| DVR-P360-008 | Pack360 đã `SHIPPED` không được giải phóng/tách. | `PACK360_ALREADY_SHIPPED` |
| DVR-P360-009 | Tách Pack360 phải cập nhật relation history. | `PACK360_RELATION_HISTORY_REQUIRED` |

## 6. Validation chuyển đơn OEM

| Mã rule | Kiểm tra | Lỗi |
|---|---|---|
| DVR-OEM-001 | Đơn OEM/PO mới phải tồn tại. | `TARGET_OEM_NOT_FOUND` |
| DVR-OEM-002 | Thùng/Pack360 chưa shipped. | `ITEM_ALREADY_SHIPPED` |
| DVR-OEM-003 | Thùng không được allocated/picked/staged. | `ITEM_IN_OUTBOUND_FLOW` |
| DVR-OEM-004 | Nếu đơn mới có pack rule khác, phải cập nhật hoặc đánh dấu review. | `PACK_RULE_CHANGE_REQUIRES_REVIEW` |
| DVR-OEM-005 | Request chuyển OEM phải có reason. | `REASON_REQUIRED` |

## 7. Validation chuyển stock type

| Mã rule | Kiểm tra | Lỗi |
|---|---|---|
| DVR-STK-001 | `new_stock_type` thuộc danh mục hợp lệ. | `INVALID_NEW_STOCK_TYPE` |
| DVR-STK-002 | Nếu `new_stock_type = BLOCKED` thì reason bắt buộc. | `BLOCK_REASON_REQUIRED` |
| DVR-STK-003 | Reason `OEM_SURPLUS` chỉ dùng cho dư đơn/dư kế hoạch. | `INVALID_OEM_SURPLUS_REASON` |
| DVR-STK-004 | Reason `QUALITY_ISSUE` dùng cho vấn đề chất lượng phát hiện trong kho. | `INVALID_QUALITY_REASON` |
| DVR-STK-005 | Không cho dùng `TEMPORARY_ISSUE` để xử lý dư đơn hoặc vấn đề chất lượng. | `TEMP_ISSUE_NOT_FOR_BLOCK` |
| DVR-STK-006 | Release từ `BLOCKED` phải có quyền. | `RELEASE_PERMISSION_REQUIRED` |
| DVR-STK-007 | Hàng đang allocated/picked/staged không được chuyển stock type nếu chưa hủy nghiệp vụ xuất. | `OUTBOUND_FLOW_ACTIVE` |

## 8. Validation xuất lẻ từ thùng 60

| Mã rule | Kiểm tra | Lỗi |
|---|---|---|
| DVR-PARTIAL-001 | Thùng gốc phải tồn tại. | `SOURCE_THUNG60_NOT_FOUND` |
| DVR-PARTIAL-002 | Thùng gốc phải `stock_type = UNRESTRICTED`. | `SOURCE_STOCK_NOT_UNRESTRICTED` |
| DVR-PARTIAL-003 | Thùng gốc chưa shipped/scrapped/temp issued. | `SOURCE_STATUS_NOT_ALLOWED` |
| DVR-PARTIAL-004 | Số lượng lấy phải > 0. | `INVALID_SPLIT_QTY` |
| DVR-PARTIAL-005 | Số lượng lấy không vượt `current_qty`. | `SPLIT_QTY_EXCEED_CURRENT_QTY` |
| DVR-PARTIAL-006 | Nếu số lượng lấy = `current_qty`, không tạo thùng ảo. | `FULL_QTY_SHOULD_USE_FULL_ISSUE` |
| DVR-PARTIAL-007 | Nếu số lượng lấy < `current_qty`, phải tạo bản ghi mới trong `tbl_thung60_kho` với `is_virtual = 1`. | `VIRTUAL_THUNG60_REQUIRED` |
| DVR-PARTIAL-008 | Thùng ảo phải có `parent_id_60`, `root_id_60`, `source_split_event_id`. | `VIRTUAL_LINK_REQUIRED` |
| DVR-PARTIAL-009 | Thùng gốc phải cập nhật `current_qty = source_qty_before - split_qty`. | `SOURCE_QTY_UPDATE_REQUIRED` |
| DVR-PARTIAL-010 | Nếu thùng gốc không còn đủ chuẩn, phải `stock_type = BLOCKED`, reason `PARTIAL_REMAINING`. | `SOURCE_PARTIAL_MUST_BE_BLOCKED` |
| DVR-PARTIAL-011 | Phải ghi `thung60_split_history`. | `SPLIT_HISTORY_REQUIRED` |
| DVR-PARTIAL-012 | Phải ghi event `PARTIAL_ISSUE_SPLIT`, `VIRTUAL_THUNG60_CREATED`, `SOURCE_THUNG60_BLOCKED` nếu có block. | `SPLIT_EVENT_REQUIRED` |

## 9. Validation xuất kho

| Mã rule | Kiểm tra | Lỗi |
|---|---|---|
| DVR-OUT-001 | Chỉ xuất hàng `stock_type = UNRESTRICTED`. | `STOCK_TYPE_NOT_ALLOWED_FOR_ISSUE` |
| DVR-OUT-002 | Không xuất hàng `BLOCKED`. | `BLOCKED_STOCK_NOT_ALLOWED` |
| DVR-OUT-003 | Không xuất hàng `TEMPORARY_ISSUE` như tồn trong kho. | `TEMP_ISSUED_NOT_AVAILABLE` |
| DVR-OUT-004 | Không xuất vượt số lượng phiếu. | `ISSUE_QTY_EXCEEDED` |
| DVR-OUT-005 | Xác nhận xuất phải ghi ledger giảm tồn. | `ISSUE_LEDGER_REQUIRED` |

## 10. Validation ledger và audit

| Mã rule | Kiểm tra | Lỗi |
|---|---|---|
| DVR-LED-001 | Nghiệp vụ tăng/giảm tồn phải có ledger. | `LEDGER_REQUIRED` |
| DVR-LED-002 | Ledger đã post không được sửa/xóa. | `LEDGER_IMMUTABLE` |
| DVR-LED-003 | Reclassification stock type/OEM phải ghi ledger nếu tồn quản lý theo dimension đó. | `RECLASS_LEDGER_REQUIRED` |
| DVR-AUD-001 | Nghiệp vụ quan trọng phải có audit log. | `AUDIT_REQUIRED` |
| DVR-AUD-002 | Audit phải ghi old value/new value đối với thay đổi nhạy cảm. | `AUDIT_OLD_NEW_REQUIRED` |
