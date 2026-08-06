# SQL Stored Procedure Catalog - WMS kho thành phẩm

## 1. Mục tiêu

Tài liệu này liệt kê danh mục Stored Procedure đề xuất cho hệ thống WMS kho thành phẩm. Đây là lớp xử lý nghiệp vụ chính. App/API chỉ gọi các Stored Procedure này bằng tham số chuẩn.

## 2. Quy ước đặt tên

| Prefix | Ý nghĩa |
|---|---|
| `usp_Receipt_` | Nghiệp vụ nhập kho |
| `usp_Pack360_` | Nghiệp vụ Pack360 |
| `usp_Pallet_` | Nghiệp vụ pallet/kệ |
| `usp_OEM_` | Nghiệp vụ chuyển đơn OEM |
| `usp_StockType_` | Nghiệp vụ chuyển loại tồn / khóa tồn |
| `usp_Outbound_` | Nghiệp vụ xuất kho |
| `usp_TempIssue_` | Nghiệp vụ xuất tạm |
| `usp_Trace_` | Nghiệp vụ truy vết |
| `usp_Admin_` | Quản trị master/config |

## 3. Stored Procedure chuẩn theo nghiệp vụ

### 3.1. Nhập kho

| Stored Procedure | Mục đích |
|---|---|
| `usp_Receipt_GetProductionHandoverLines` | Lấy phiếu giao kho và dòng chi tiết từ data sản xuất |
| `usp_Receipt_ScanThung60` | Ghi nhận từng thùng 60 vào phiên nhập tạm |
| `usp_Receipt_TempConfirm` | Nhân viên kho xác nhận nhập tạm |
| `usp_Receipt_ReturnForCheck` | Thủ kho trả lại phiên nhập tạm để kiểm tra |
| `usp_Receipt_CancelTempSession` | Hủy phiên nhập tạm |
| `usp_Receipt_OfficialConfirm` | Thủ kho xác nhận nhập chính thức, post ledger tăng tồn |

### 3.2. Pack360

| Stored Procedure | Mục đích |
|---|---|
| `usp_Pack360_Create` | Tạo Pack360 OPEN |
| `usp_Pack360_AddThung60` | Thêm thùng 60 vào Pack360 |
| `usp_Pack360_RemoveThung60` | Gỡ thùng 60 khỏi Pack360 OPEN |
| `usp_Pack360_Complete` | Hoàn tất Pack360 |
| `usp_Pack360_Release` | Giải phóng toàn bộ Pack360 |
| `usp_Pack360_SplitUnits` | Tách một/vài thùng 60 khỏi Pack360 completed |
| `usp_Pack360_Repack` | Đóng lại Pack360 mới từ thùng đã tách/giải phóng |

### 3.3. Pallet / Location

| Stored Procedure | Mục đích |
|---|---|
| `usp_Pallet_AttachUnit` | Gán thùng 60 hoặc Pack360 lên pallet |
| `usp_Pallet_DetachUnit` | Tách khỏi pallet |
| `usp_Pallet_PutawayToLocation` | Đưa pallet lên kệ/vị trí |
| `usp_Pallet_MoveLocation` | Chuyển vị trí pallet |
| `usp_Location_Lock` | Khóa vị trí |
| `usp_Location_Release` | Mở khóa vị trí |

### 3.4. Chuyển đơn OEM

| Stored Procedure | Mục đích |
|---|---|
| `usp_OEM_Transfer_RequestCreate` | Tạo yêu cầu chuyển đơn OEM |
| `usp_OEM_Transfer_Approve` | Duyệt yêu cầu chuyển đơn OEM |
| `usp_OEM_Transfer_Reject` | Từ chối yêu cầu |
| `usp_OEM_Transfer_Post` | Post chuyển đơn, cập nhật OEM/PO/pack rule |

### 3.5. Chuyển stock type / khóa tồn

| Stored Procedure | Mục đích |
|---|---|
| `usp_StockType_Change_RequestCreate` | Tạo yêu cầu đổi stock type |
| `usp_StockType_Change_Approve` | Duyệt yêu cầu đổi stock type |
| `usp_StockType_Change_Post` | Post đổi stock type, ghi reclassification ledger |
| `usp_StockType_Block` | Khóa tồn nhanh với lý do cụ thể |
| `usp_StockType_Release` | Release tồn bị khóa về `UNRESTRICTED` hoặc stock type phù hợp |

### 3.6. Xuất kho

| Stored Procedure | Mục đích |
|---|---|
| `usp_Outbound_CreateIssue` | Tạo phiếu xuất |
| `usp_Outbound_Allocate` | Phân bổ tồn cho phiếu xuất |
| `usp_Outbound_PickUnit` | Pick nguyên thùng 60/Pack360 |
| `usp_Outbound_PartialIssue` | Xuất lẻ từ thùng 60, tạo thùng 60 ảo trong cùng bảng |
| `usp_Outbound_Stage` | Đưa hàng ra khu staging |
| `usp_Outbound_ConfirmShip` | Xác nhận xuất, ledger giảm tồn |
| `usp_Outbound_CancelIssue` | Hủy phiếu xuất hoặc đảo phân bổ |

### 3.7. Xuất tạm

| Stored Procedure | Mục đích |
|---|---|
| `usp_TempIssue_Create` | Tạo chứng từ xuất tạm |
| `usp_TempIssue_Confirm` | Xác nhận xuất tạm, stock type `TEMPORARY_ISSUE` |
| `usp_TempIssue_Return` | Hoàn nhập hàng xuất tạm |
| `usp_TempIssue_Settle` | Tất toán xuất tạm thành xuất thật/hủy/điều chỉnh |

### 3.8. Truy vết và báo cáo

| Stored Procedure | Mục đích |
|---|---|
| `usp_Trace_Thung60Timeline` | Truy vết vòng đời thùng 60 |
| `usp_Trace_Pack360Timeline` | Truy vết Pack360 |
| `usp_Report_BlockedStock` | Danh sách tồn bị khóa |
| `usp_Report_PartialRemaining` | Danh sách thùng gốc bị lấy lẻ và đang BLOCKED |
| `usp_Report_TempReceiptPending` | Danh sách phiên nhập tạm chờ xác nhận |
| `usp_Report_LedgerByDate` | Sổ nhập xuất tồn theo ngày |

## 4. Tham số chuẩn bắt buộc

Mọi Stored Procedure làm thay đổi dữ liệu phải có:

```sql
@request_id NVARCHAR(100),
@user_code NVARCHAR(100),
@user_email NVARCHAR(255),
@device_id NVARCHAR(100) = NULL,
@source_screen NVARCHAR(100) = NULL,
@note NVARCHAR(500) = NULL
```

## 5. Kết quả trả về chuẩn

```sql
status
message
error_code
document_no
object_code
request_id
trace_id
```

## 6. Error code đề xuất

| Error Code | Ý nghĩa |
|---|---|
| `QR_NOT_FOUND` | QR không tồn tại |
| `INVALID_STATUS` | Trạng thái không hợp lệ cho nghiệp vụ |
| `INVALID_STOCK_TYPE` | Stock type không cho phép thao tác |
| `BLOCKED_STOCK` | Hàng đang bị khóa |
| `DUPLICATE_REQUEST` | Gửi lặp request |
| `PACK360_RULE_FAILED` | Không đạt rule đóng Pack360 |
| `OEM_RULE_FAILED` | Không đạt rule đơn OEM/PO |
| `PARTIAL_QTY_INVALID` | Số lượng xuất lẻ không hợp lệ |
| `OBJECT_CONFLICT` | Đối tượng đã bị thao tác bởi người khác |
| `PERMISSION_DENIED` | Không có quyền |
| `LEDGER_POST_FAILED` | Ghi ledger lỗi |
