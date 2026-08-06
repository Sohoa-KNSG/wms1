# Data Dictionary - Kho thành phẩm sản xuất

## 1. Thông tin tài liệu

| Thuộc tính | Giá trị |
|---|---|
| Tên tài liệu | Data Dictionary - Kho thành phẩm sản xuất |
| Phạm vi | WMS kho thành phẩm, thùng 60, Pack360, stock type, ledger, audit |
| Phiên bản nội dung | Cập nhật theo nghiệp vụ xuất lẻ và thùng 60 ảo trong cùng bảng thùng 60 |

## 2. Danh sách bảng

| Bảng | Nhóm | Ý nghĩa |
|---|---|---|
| `vw_WMS_Product` / `tbl_items` | Master | Danh mục sản phẩm/mặt hàng master (Mã SP, tên SP, ĐVT, nhóm hàng, quy cách). |
| `production_handover_header` | Inbound | Phiếu giao kho từ data sản xuất. |
| `production_handover_line` | Inbound | Dòng chi tiết phiếu giao kho. |
| `receipt_session_header` | Inbound | Phiên nhập tạm. |
| `receipt_session_detail` | Inbound | Danh sách QR thùng 60 quét trong phiên nhập tạm. |
| `tbl_thung60_kho` | Core | Current state của thùng 60, gồm cả thùng vật lý và thùng ảo. |
| `delivery_note_header` | Outbound | Header phiếu xuất kho (UC16), chứa xe tải, tài xế, bảo vệ, địa điểm giao và trạng thái xuất bến. |
| `delivery_note_detail` | Outbound | Chi tiết phiếu xuất kho theo sản phẩm (số lượng yêu cầu, số lượng đã soạn, quy cách kiện/thùng). |
| `delivery_note_barcode` | Outbound | Danh sách mã vạch thùng 60/kiện 360 đã được quét vào phiếu xuất kho. |
| `processed_request` | Technical | Bảng kiểm soát Idempotency (X-Request-Id), ngăn chặn trùng lặp giao dịch khi retry API. |
| `tbl_trucks` | Master | Danh mục xe tải xuất kho (Biển số xe, trọng tải tối đa, thể tích tối đa). |
| `tbl_drivers` | Master | Danh mục tài xế lái xe vận tải. |
| `tbl_guards` | Master | Danh mục bảo vệ kiểm cổng xuất bến. |
| `tbl_customers` | Master | Danh mục khách hàng nhận hàng. |
| `thung60_event` | Event | Lịch sử event thùng 60. |
| `thung60_split_history` | Event | Lịch sử xuất lẻ tạo thùng 60 ảo. |
| `thung60_relation_history` | Event | Lịch sử quan hệ cha-con của thùng 60. |
| `pack360_header` | Pack360 | Header Pack360. |
| `pack360_unit` | Pack360 | Danh sách thùng 60 hiện tại trong Pack360. |
| `pack360_unit_history` | Pack360 | Lịch sử thùng 60 thuộc Pack360. |
| `pack360_event` | Pack360 | Lịch sử event Pack360. |
| `pallet` | Storage | Pallet. |
| `pallet_unit` | Storage | Thành phần trên pallet. |
| `location` | Storage | Vị trí/kệ/bin. |
| `pallet_location_history` | Storage | Lịch sử pallet ở vị trí. |
| `oem_transfer_request_header` | Control | Header yêu cầu chuyển đơn OEM. |
| `oem_transfer_request_detail` | Control | Chi tiết thùng 60 chuyển đơn OEM. |
| `stock_type_change_request_header` | Control | Header yêu cầu đổi stock type/block/release. |
| `stock_type_change_request_detail` | Control | Chi tiết thùng 60 đổi stock type. |
| `pack360_repack_request_header` | Control | Header yêu cầu giải phóng/tách/đóng lại Pack360. |
| `pack360_repack_request_detail` | Control | Chi tiết thùng 60 trong yêu cầu Pack360. |
| `stock_transaction_book` | Ledger | Sổ nghiệp vụ kho (Ghi nhận sự kiện giao dịch phát sinh). |
| `item_ledger` | Ledger | Sổ cái chi tiết từng mặt hàng và mã thùng 60/360. |
| `inventory_ledger` | Ledger | Sổ cái tồn kho tổng hợp (Hạch toán Nợ/Có số lượng tồn kho). |
| `audit_log` | Audit | Nhật ký thao tác. |
| `command_request_log` | Technical | Log command/request_id chống gửi lặp. |

## 3. Field Dictionary

### 3.1. `production_handover_header`

| Field | Type | Required | Mô tả |
|---|---|---:|---|
| `handover_no` | string | Yes | Mã phiếu giao kho từ sản xuất. |
| `production_area` | string | No | Khu vực/chuyền sản xuất. |
| `handover_date` | date | Yes | Ngày giao kho. |
| `status` | string | Yes | `OPEN`, `PARTIAL_RECEIVED`, `RECEIVED`, `CANCELLED`. |
| `created_by` | string | No | Người/tích hợp tạo phiếu. |
| `created_at` | datetime | Yes | Thời điểm tạo. |

### 3.2. `production_handover_line`

| Field | Type | Required | Mô tả |
|---|---|---:|---|
| `handover_no` | string | Yes | FK đến header. |
| `handover_line_no` | int | Yes | Số dòng. |
| `product_code` | string | Yes | Mã hàng. |
| `product_name` | string | No | Tên hàng. |
| `planned_qty` | decimal | Yes | Số lượng sản xuất giao. |
| `temp_received_qty` | decimal | No | Số lượng đã nhập tạm. |
| `official_received_qty` | decimal | No | Số lượng đã nhập chính thức. |
| `remaining_qty` | decimal | No | Số lượng còn lại. |
| `oem_order_no` | string | No | Mã đơn OEM nếu có. |
| `po_no` | string | No | Mã PO nếu có. |
| `po_line_no` | string | No | Dòng PO. |
| `customer_code` | string | No | Khách hàng OEM. |
| `pack_rule_code` | string | No | Rule đóng gói áp dụng. |
| `packing_standard_type` | string | Yes | `STANDARD` hoặc `OEM`. |
| `status` | string | Yes | Trạng thái dòng phiếu. |

### 3.3. `receipt_session_header`

| Field | Type | Required | Mô tả |
|---|---|---:|---|
| `receipt_session_no` | string | Yes | Mã phiên nhập tạm. |
| `handover_no` | string | Yes | Phiếu giao kho. |
| `handover_line_no` | int | Yes | Dòng chi tiết được chọn. |
| `product_code` | string | Yes | Mã hàng khóa theo dòng phiếu. |
| `oem_order_no` | string | No | Tự động lấy từ dòng phiếu. |
| `po_no` | string | No | Tự động lấy từ dòng phiếu. |
| `pack_rule_code` | string | No | Tự động lấy từ dòng phiếu. |
| `status` | string | Yes | `DRAFT`, `SCANNING`, `TEMP_CONFIRMED`, `OFFICIALLY_CONFIRMED`, `CANCELLED`. |
| `scanned_qty` | decimal | Yes | Tổng số lượng đã scan. |
| `temp_confirmed_by` | string | No | Người xác nhận nhập tạm. |
| `temp_confirmed_at` | datetime | No | Thời điểm nhập tạm. |
| `official_confirmed_by` | string | No | Thủ kho xác nhận chính thức. |
| `official_confirmed_at` | datetime | No | Thời điểm xác nhận chính thức. |

### 3.4. `receipt_session_detail`

| Field | Type | Required | Mô tả |
|---|---|---:|---|
| `receipt_session_no` | string | Yes | Mã phiên nhập. |
| `line_no` | int | Yes | Số dòng scan. |
| `id_60` | string | Yes | Mã thùng 60. |
| `qr_60` | string | Yes | QR thùng 60. |
| `product_code` | string | Yes | Mã hàng từ QR/master. |
| `quantity` | decimal | Yes | Số lượng thùng. |
| `scan_result` | string | Yes | `ACCEPTED`, `REJECTED`. |
| `error_code` | string | No | Mã lỗi nếu bị từ chối. |
| `scanned_by` | string | Yes | Người scan. |
| `scanned_at` | datetime | Yes | Thời điểm scan. |
| `device_id` | string | No | Thiết bị scan. |
| `request_id` | string | Yes | Chống gửi lặp. |

### 3.5. `tbl_thung60_kho`

| Field | Type | Required | Mô tả |
|---|---|---:|---|
| `id_60` | string | Yes | Mã định danh thùng 60. |
| `qr_60` | string | Yes | QR/barcode thùng 60. |
| `product_code` | string | Yes | Mã hàng. |
| `product_name` | string | No | Tên hàng. |
| `standard_qty` | decimal | No | Số lượng chuẩn của thùng đầy. |
| `original_qty` | decimal | Yes | Số lượng ban đầu của bản ghi. |
| `current_qty` | decimal | Yes | Số lượng hiện tại. |
| `uom` | string | Yes | Đơn vị tính. |
| `status` | string | Yes | Trạng thái vận hành. |
| `stock_type` | string | Yes | `UNRESTRICTED`, `BLOCKED`, `TEMPORARY_ISSUE`, v.v. |
| `block_reason_code` | string | No | Lý do block nếu `stock_type = BLOCKED`. |
| `is_virtual` | boolean | Yes | `1` nếu là thùng 60 ảo sinh ra từ split/xuất lẻ. |
| `unit_origin_type` | string | Yes | `PHYSICAL`, `SPLIT_VIRTUAL`, `ADJUSTMENT_CREATED`. |
| `parent_id_60` | string | No | Thùng 60 cha trực tiếp nếu là thùng ảo. |
| `root_id_60` | string | No | Thùng 60 gốc ban đầu. |
| `source_split_event_id` | string | No | Event tạo thùng ảo. |
| `split_qty_total` | decimal | No | Tổng số lượng đã tách từ thùng này. |
| `is_full_box` | boolean | Yes | Còn đủ số lượng chuẩn hay không. |
| `production_handover_no` | string | No | Phiếu giao kho nguồn. |
| `production_handover_line_no` | int | No | Dòng phiếu giao kho. |
| `receipt_session_no` | string | No | Phiên nhập tạm. |
| `official_receipt_no` | string | No | Chứng từ nhập chính thức. |
| `current_oem_order_no` | string | No | Đơn OEM hiện tại. |
| `current_po_no` | string | No | PO hiện tại. |
| `current_po_line_no` | string | No | Dòng PO hiện tại. |
| `current_pack_rule_code` | string | No | Rule đóng gói hiện tại. |
| `customer_code` | string | No | Khách hàng OEM. |
| `current_pack360_id` | string | No | Pack360 hiện tại nếu có. |
| `current_pallet_id` | string | No | Pallet hiện tại nếu có. |
| `current_location_code` | string | No | Vị trí/kệ hiện tại. |
| `created_from_issue_no` | string | No | Phiếu xuất tạo ra thùng ảo nếu có. |
| `created_from_issue_line_no` | string | No | Dòng phiếu xuất tạo ra thùng ảo. |
| `last_event_type` | string | No | Event cuối. |
| `last_event_at` | datetime | No | Thời điểm event cuối. |
| `last_event_by` | string | No | Người thao tác cuối. |
| `created_at` | datetime | Yes | Ngày tạo. |
| `updated_at` | datetime | Yes | Ngày cập nhật. |

### 3.6. `thung60_split_history`

| Field | Type | Required | Mô tả |
|---|---|---:|---|
| `split_id` | string | Yes | Mã nghiệp vụ split. |
| `source_id_60` | string | Yes | Thùng gốc bị lấy lẻ. |
| `generated_id_60` | string | Yes | Thùng 60 mới sinh ra trong bảng thùng 60. |
| `product_code` | string | Yes | Mã hàng. |
| `split_qty` | decimal | Yes | Số lượng lấy ra. |
| `source_qty_before` | decimal | Yes | Số lượng thùng gốc trước split. |
| `source_qty_after` | decimal | Yes | Số lượng thùng gốc sau split. |
| `issue_no` | string | No | Phiếu xuất liên quan. |
| `issue_line_no` | string | No | Dòng phiếu xuất. |
| `reason_code` | string | Yes | `PARTIAL_ISSUE`. |
| `performed_by` | string | Yes | Người thực hiện. |
| `performed_at` | datetime | Yes | Thời điểm. |
| `device_id` | string | No | Thiết bị. |
| `request_id` | string | Yes | Chống gửi lặp. |

### 3.7. `thung60_event`

| Field | Type | Required | Mô tả |
|---|---|---:|---|
| `event_id` | string | Yes | Mã event. |
| `id_60` | string | Yes | Thùng 60. |
| `event_type` | string | Yes | Loại event. |
| `old_status` | string | No | Status trước. |
| `new_status` | string | No | Status sau. |
| `old_stock_type` | string | No | Stock type trước. |
| `new_stock_type` | string | No | Stock type sau. |
| `old_qty` | decimal | No | Số lượng trước. |
| `new_qty` | decimal | No | Số lượng sau. |
| `old_location_code` | string | No | Vị trí trước. |
| `new_location_code` | string | No | Vị trí sau. |
| `source_document_no` | string | No | Chứng từ nguồn. |
| `request_id` | string | Yes | Idempotency key. |
| `performed_by` | string | Yes | Người thực hiện. |
| `performed_at` | datetime | Yes | Thời điểm. |
| `message` | string | No | Ghi chú. |

### 3.8.1. `inventory_ledger` (Sổ Chi Tiết Tồn Kho Theo Thùng / Kiện)

| Field | Type | Required | Mô tả |
|---|---|---:|---|
| `ledger_id` | bigint / string | Yes | Mã định danh bút toán sổ cái chi tiết (Tự tăng/GUID). |
| `ledger_date` | date | Yes | Ngày hạch toán sổ cái (YYYY-MM-DD). |
| `id_60` | string | Yes | Mã định danh thùng 60 / kiện 360 biến động. |
| `product_code` | string | Yes | Mã mặt hàng / SKU (Khóa ngoại liên kết `vw_WMS_Product`). |
| `product_name` | string | No | Tên mặt hàng / sản phẩm. |
| `uom` | string | No | Đơn vị tính mặt hàng (Thùng/Cái/Kg). |
| `customer_code` | string | No | Mã Khách Hàng / Đối tác nhận hàng hoặc đơn vị giao hàng. |
| `customer_name` | string | No | Tên Khách Hàng / Bên Nhận Hàng / Người Mượn. |
| `transaction_id` | string | Yes | Mã chứng từ giao dịch tổng (`stock_transaction_book`). |
| `source_document_no` | string | Yes | Mã phiếu nghiệp vụ gốc (Số phiếu nhập, phiếu xuất, phiếu xuất tạm). |
| `quantity_change` | decimal | Yes | Số lượng biến động (Dương: Tăng tồn kho, Âm: Giảm tồn kho). |
| `old_stock_type` | string | No | Stock type ban đầu trước giao dịch (`UNRESTRICTED`, `BLOCKED`, `TEMPORARY_ISSUE`). |
| `new_stock_type` | string | No | Stock type mới sau giao dịch (`UNRESTRICTED`, `BLOCKED`, `TEMPORARY_ISSUE`). |
| `created_at` | datetime | Yes | Thời điểm ghi bút toán hạch toán sổ cái. |

### 3.8.2. `item_ledger` (Sổ Tổng Hợp Tồn Kho Theo Mã Hàng & Số Lượng)

| Field | Type | Required | Mô tả |
|---|---|---:|---|
| `item_ledger_id` | int | Yes | Mã định danh bút toán tổng hợp SKU (Tự tăng). |
| `ledger_date` | date | Yes | Ngày hạch toán sổ cái. |
| `product_code` | string | Yes | Mã mặt hàng / SKU (Khóa ngoại liên kết `vw_WMS_Product`). |
| `customer_code` | string | No | Mã Khách Hàng / Đối tác nhận hàng hoặc giao hàng. |
| `customer_name` | string | No | Tên Khách Hàng / Bên Nhận Hàng / Người Mượn. |
| `transaction_id` | string | Yes | Mã chứng từ giao dịch tổng (`stock_transaction_book`). |
| `source_document_no` | string | Yes | Mã phiếu nghiệp vụ gốc. |
| `total_quantity_change` | decimal | Yes | Tổng số lượng biến động theo mã SP. |
| `created_at` | datetime | Yes | Thời điểm ghi sổ. |

### 3.9. `pack360_header`

| Field | Type | Required | Mô tả |
|---|---|---:|---|
| `pack360_id` | string | Yes | Mã Pack360. |
| `pack360_qr` | string | Yes | QR Pack360. |
| `packing_standard_type` | string | Yes | `STANDARD` hoặc `OEM`. |
| `pack_rule_code` | string | No | Rule đóng gói. |
| `oem_order_no` | string | No | Đơn OEM nếu có. |
| `po_no` | string | No | PO nếu có. |
| `status` | string | Yes | `OPEN`, `COMPLETED`, `NEED_REVIEW`, `RELEASED`, v.v. |
| `target_unit_count` | int | No | Số thùng mục tiêu theo rule. |
| `actual_unit_count` | int | No | Số thùng thực tế. |
| `weight` | decimal | No | Trọng lượng nếu có. |
| `created_by` | string | Yes | Người tạo. |
| `created_at` | datetime | Yes | Ngày tạo. |
| `completed_by` | string | No | Người complete. |
| `completed_at` | datetime | No | Ngày complete. |

### 3.9. `stock_type_change_request_header`

| Field | Type | Required | Mô tả |
|---|---|---:|---|
| `request_no` | string | Yes | Mã yêu cầu. |
| `change_type` | string | Yes | `BLOCK`, `RELEASE`, `RECLASSIFY`. |
| `reason_code` | string | Yes | `OEM_SURPLUS`, `QUALITY_ISSUE`, `PARTIAL_REMAINING`, v.v. |
| `status` | string | Yes | `DRAFT`, `SUBMITTED`, `APPROVED`, `POSTED`, `CANCELLED`. |
| `requested_by` | string | Yes | Người yêu cầu. |
| `requested_at` | datetime | Yes | Thời điểm yêu cầu. |
| `approved_by` | string | No | Người duyệt. |
| `approved_at` | datetime | No | Thời điểm duyệt. |
| `posted_by` | string | No | Người post. |
| `posted_at` | datetime | No | Thời điểm post. |

### 3.10. `stock_type_change_request_detail`

| Field | Type | Required | Mô tả |
|---|---|---:|---|
| `request_no` | string | Yes | Mã yêu cầu. |
| `line_no` | int | Yes | Số dòng. |
| `id_60` | string | Yes | Thùng 60. |
| `product_code` | string | Yes | Mã hàng. |
| `qty` | decimal | Yes | Số lượng. |
| `old_stock_type` | string | Yes | Stock type cũ. |
| `new_stock_type` | string | Yes | Stock type mới. |
| `old_block_reason_code` | string | No | Lý do block cũ. |
| `new_block_reason_code` | string | No | Lý do block mới. |

## 4. Code lists

### 4.1. `unit_origin_type`

| Code | Ý nghĩa |
|---|---|
| `PHYSICAL` | Thùng vật lý. |
| `SPLIT_VIRTUAL` | Thùng 60 ảo sinh ra từ xuất lẻ. |
| `RECEIPT_VIRTUAL` | Thùng 60 ảo sinh ra từ nhập lẻ (hàng rời) đầu vào. |
| `ADJUSTMENT_CREATED` | Bản ghi tạo từ điều chỉnh có kiểm soát. |

### 4.2. `event_type`

| Code | Ý nghĩa |
|---|---|
| `TEMP_RECEIPT_SCAN` | Quét nhập tạm. |
| `OFFICIAL_RECEIPT_POSTED` | Nhập chính thức. |
| `PALLETIZED` | Gán pallet. |
| `PACK360_CREATED` | Tạo Pack360. |
| `PACK360_COMPLETED` | Complete Pack360. |
| `PACK360_RELEASED` | Giải phóng Pack360. |
| `PACK360_PARTIAL_SPLIT` | Tách một phần Pack360. |
| `OEM_TRANSFER` | Chuyển đơn OEM. |
| `STOCK_TYPE_CHANGE` | Chuyển stock type. |
| `BLOCK_STOCK` | Khóa tồn. |
| `RELEASE_STOCK` | Release tồn. |
| `PARTIAL_ISSUE_SPLIT` | Xuất lẻ tạo thùng 60 ảo. |
| `VIRTUAL_THUNG60_CREATED` | Tạo thùng 60 ảo. |
| `SOURCE_THUNG60_BLOCKED` | Khóa thùng gốc sau split. |
| `ISSUED` | Xuất kho. |
| `TEMPORARY_ISSUED` | Xuất tạm. |
| `RETURNED` | Hoàn nhập/trả về. |
| `ADJUSTED` | Điều chỉnh. |

## 5. Relationships chính

| Quan hệ | Mô tả |
|---|---|
| `production_handover_header` 1-n `production_handover_line` | Một phiếu giao kho có nhiều dòng. |
| `production_handover_line` 1-n `receipt_session_header` | Một dòng có thể có nhiều phiên nhập tạm. |
| `receipt_session_header` 1-n `receipt_session_detail` | Một phiên có nhiều QR scan. |
| `receipt_session_detail.id_60` n-1 `tbl_thung60_kho.id_60` | Dòng scan tham chiếu thùng 60. |
| `tbl_thung60_kho.parent_id_60` n-1 `tbl_thung60_kho.id_60` | Thùng ảo liên kết thùng cha. |
| `tbl_thung60_kho.root_id_60` n-1 `tbl_thung60_kho.id_60` | Thùng ảo liên kết thùng gốc ban đầu. |
| `pack360_unit.id_60` n-1 `tbl_thung60_kho.id_60` | Pack360 chứa thùng 60. |
| `thung60_split_history.generated_id_60` 1-1 `tbl_thung60_kho.id_60` | Bản ghi thùng 60 được sinh ra từ split. |
