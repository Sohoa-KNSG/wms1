# Kế hoạch kiểm thử nghiệm thu toàn diện – UC04

## 1. Thông tin tài liệu

| Thuộc tính | Giá trị |
|---|---|
| Use case | UC04 – Xác nhận nhập kho chính thức |
| Phạm vi liên quan | UC04.1 – Nhập lẻ; UC04.2 – Hủy kết quả quét |
| Đối tượng thực hiện | QA/QC, Product Owner, Thủ kho, Kỹ thuật cơ sở dữ liệu |
| Mức kiểm thử | API, UI, phân quyền, tích hợp, cơ sở dữ liệu và tính toàn vẹn giao dịch |
| Kết quả | Pass / Fail / Blocked |

## 2. Mục tiêu

Xác nhận rằng quy trình nhập kho:

- Chỉ cho phép xác nhận khi số lượng hợp lệ khớp chứng từ.
- Tạo tồn kho vật lý hoặc thùng ảo đúng dữ liệu nguồn.
- Đồng bộ trạng thái với hệ thống Packaging.
- Ghi đầy đủ `stock_transaction_book`, `inventory_ledger`, `item_ledger` và `thung60_event`.
- Không tạo dữ liệu trùng khi người dùng bấm lại, gửi lại request hoặc thao tác đồng thời.
- Rollback toàn bộ khi bất kỳ bước nào thất bại.
- Chỉ cho phép đúng vai trò nghiệp vụ thực hiện xác nhận hoặc hủy.
- Lưu đủ audit trail để truy vết.

## 3. Phạm vi kiểm thử

### 3.1. Trong phạm vi

- Danh sách phiếu chờ xác nhận và chi tiết tiến độ.
- Xác nhận toàn phiếu và xác nhận theo dòng.
- Nhập lẻ một dòng và nhập lẻ hàng loạt.
- Hủy một lượt quét UC03 và hủy kết quả quét theo phiếu UC04.2.
- Đồng bộ Packaging, tồn kho và sổ cái kép.
- Phân quyền, validation, concurrency, idempotency, rollback và audit.

### 3.2. Ngoài phạm vi

- Quét nhập tạm UC03, ngoại trừ dữ liệu đầu vào dùng cho UC04.
- Palletizing, shelving, picking và xuất kho.
- Hiệu năng toàn hệ thống ngoài các phép thử đồng thời nêu trong tài liệu này.

## 4. Môi trường và tiền điều kiện

- Backend, frontend và SQL Server sử dụng cùng phiên bản build cần nghiệm thu.
- Cơ sở dữ liệu WMS và Packaging được sao lưu trước khi kiểm thử.
- Có tài khoản thuộc các nhóm `Storekeeper`, `Admin` và một tài khoản không có quyền xác nhận.
- Đồng hồ ứng dụng và SQL Server được đồng bộ.
- Có quyền đọc các bảng kiểm chứng nhưng không sửa trực tiếp trong thời gian chạy test.
- Đã bật log ứng dụng và có cách đối chiếu `request_id`/correlation ID.

## 5. Bộ dữ liệu chuẩn bị

| Mã dữ liệu | Mô tả |
|---|---|
| D01 | Phiếu một dòng, đã quét đủ 100%, tất cả thùng Packaging ở trạng thái `1` |
| D02 | Phiếu nhiều dòng, tất cả các dòng đã quét đủ |
| D03 | Phiếu quét thiếu số lượng |
| D04 | Phiếu quét vượt số lượng |
| D05 | Phiếu chứa thùng đã tồn tại trong `tbl_thung60_kho` |
| D06 | Phiếu có một thùng không tồn tại trong Packaging |
| D07 | Phiếu có một thùng Packaging sai trạng thái |
| D08 | Dòng phiếu còn thiếu số nguyên dương để nhập lẻ |
| D09 | Phiếu nhiều dòng cần nhập lẻ hàng loạt |
| D10 | Phiếu đã ghi sổ cái thành công |
| D11 | Phiếu chưa xác nhận, có nhiều bản ghi scan `VALID` |
| D12 | Dòng phiếu có lịch sử mapping OEM, chỉ một mapping active |

Mỗi lần chạy lại phải dùng phiếu/mã thùng mới hoặc khôi phục snapshot dữ liệu để kết quả độc lập.

## 6. Kịch bản UAT

### 6.1. Danh sách chờ và giao diện

| Mã | Kịch bản | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| UC04-UI-01 | Hiển thị danh sách phiếu chờ | Mở màn hình xác nhận bằng tài khoản Thủ kho | Hiển thị đúng mã phiếu, số dòng, số lượng yêu cầu, số lượng hợp lệ và tỷ lệ hoàn thành |
| UC04-UI-02 | Chi tiết từng dòng | Mở D02 | Tổng từng dòng và tổng toàn phiếu khớp dữ liệu scan, không cộng trùng |
| UC04-UI-03 | Phiếu chưa đủ | Mở D03 | Nút xác nhận bị khóa và hiển thị chính xác số lượng còn thiếu |
| UC04-UI-04 | Phiếu đủ | Mở D01 | Nút xác nhận được bật; modal tóm tắt đúng số thùng và SKU |
| UC04-UI-05 | Chống bấm lặp | Bấm xác nhận rồi bấm lại nhanh | Nút chuyển trạng thái loading; chỉ một request nghiệp vụ được xử lý |
| UC04-UI-06 | Phản hồi lỗi | Tạo lỗi Packaging rồi xác nhận D07 | Hiển thị thông báo nghiệp vụ dễ hiểu, không lộ stack trace hoặc câu SQL |

### 6.2. Xác nhận nhập kho chính thức

| Mã | Kịch bản | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| UC04-HP-01 | Xác nhận một dòng | Xác nhận dòng hợp lệ của D01 | Tồn kho, transaction book, hai ledger và event được ghi đúng; scan chuyển `CONFIRMED` |
| UC04-HP-02 | Xác nhận toàn phiếu | Xác nhận D02 | Tất cả dòng thành công trong một giao dịch; phiếu chuyển `COMPLETED` |
| UC04-HP-03 | Đồng bộ Packaging | Kiểm tra các thùng sau HP-02 | Tất cả thùng chuyển trạng thái `3`, có `BatNbr`, `RecordID` và OEM đúng |
| UC04-HP-04 | Tính tổng ledger | Đối chiếu D02 | Tổng `inventory_ledger` bằng tổng `item_ledger` và bằng tổng tồn kho phát sinh |
| UC04-ERR-01 | Thiếu số lượng | Xác nhận D03 | Bị từ chối; không bảng đích nào thay đổi |
| UC04-ERR-02 | Vượt số lượng | Xác nhận D04 | Bị từ chối; không bảng đích nào thay đổi |
| UC04-ERR-03 | Thùng trùng tồn kho | Xác nhận D05 | Bị từ chối và rollback toàn bộ |
| UC04-ERR-04 | Thiếu thùng Packaging | Xác nhận D06 | Bị từ chối; không sinh tồn kho hoặc ledger |
| UC04-ERR-05 | Sai trạng thái Packaging | Xác nhận D07 | Bị từ chối; Packaging và WMS giữ nguyên |
| UC04-ERR-06 | Không có scan hợp lệ | Xác nhận phiếu không có `VALID` | Trả lỗi nghiệp vụ; không phát sinh dữ liệu |
| UC04-ERR-07 | Phiếu không tồn tại | Gửi mã phiếu giả | API trả `404` hoặc mã lỗi chuẩn đã thống nhất |
| UC04-ERR-08 | Xác nhận lại phiếu hoàn tất | Gửi lại D10 | Không tạo transaction, tồn kho hoặc ledger thứ hai |

### 6.3. UC04.1 – Nhập lẻ và thùng ảo

| Mã | Kịch bản | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| UC04.1-HP-01 | Nhập đúng phần thiếu | Nhập lẻ D08 bằng đúng số còn thiếu | Tạo một thùng `VIR-*`, `is_virtual = 1`, đúng SKU/OEM/khách hàng và số lượng |
| UC04.1-HP-02 | Ghi sổ nhập lẻ | Đối chiếu sau HP-01 | Có transaction `RECEIPT_PARTIAL`, hai ledger, event và audit tương ứng |
| UC04.1-HP-03 | Cập nhật tiến độ | Làm mới chi tiết D08 | Tiến độ đạt 100%; thùng ảo không được tìm trong Packaging |
| UC04.1-ERR-01 | Số lượng bằng 0 | Gửi `looseQty = 0` | Bị từ chối, không phát sinh dữ liệu |
| UC04.1-ERR-02 | Số lượng âm | Gửi số âm | Bị từ chối, không phát sinh dữ liệu |
| UC04.1-ERR-03 | Số thập phân | Gửi `1.5` | Bị từ chối theo quy tắc số nguyên |
| UC04.1-ERR-04 | Không bằng phần thiếu | Gửi số nhỏ hơn/lớn hơn phần thiếu | Bị từ chối và giữ nguyên tiến độ |
| UC04.1-ERR-05 | Thiếu mapping OEM | Xóa/khóa mapping của dữ liệu test rồi nhập lẻ | Bị từ chối, không tạo thùng ảo thiếu nguồn gốc |
| UC04.1-ERR-06 | Trùng mã thùng ảo | Gửi hai request đồng thời cho cùng dòng | Chỉ một request thành công; không trùng `id_60` |
| UC04.1-BAT-01 | Batch thành công | Nhập lẻ toàn bộ D09 | Tất cả dòng thành công và thuộc cùng một giao dịch nghiệp vụ |
| UC04.1-BAT-02 | Batch lỗi giữa chừng | Làm dòng giữa của D09 không hợp lệ | Toàn bộ batch rollback; không dòng nào được ghi |

### 6.4. UC04.2 – Hủy kết quả quét

| Mã | Kịch bản | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| UC04.2-HP-01 | Hủy phiếu chưa xác nhận | Nhập lý do và hủy D11 | Các scan active chuyển `CANCELLED`, `IsDeleted = 1`; tiến độ về đúng giá trị |
| UC04.2-HP-02 | Audit hủy | Kiểm tra audit sau HP-01 | Có phiếu, lý do, user, thời gian, IP/device và request ID thực |
| UC04.2-ERR-01 | Thiếu lý do | Gửi lý do trống | API từ chối validation; dữ liệu không đổi |
| UC04.2-ERR-02 | Phiếu đã ghi ledger | Hủy D10 | Trả xung đột; không xóa scan hoặc ledger |
| UC04.2-ERR-03 | Phiếu không có scan active | Hủy phiếu rỗng | Trả lỗi phù hợp; không tạo audit “thành công” giả |
| UC04.2-ERR-04 | Hủy lại | Gửi lại request hủy đã thành công | Không tạo thay đổi lặp; kết quả idempotent hoặc trả xung đột rõ ràng |

### 6.5. Phân quyền và bảo mật

| Mã | Kịch bản | Kết quả mong đợi |
|---|---|---|
| UC04-SEC-01 | Không có token gọi endpoint xác nhận | HTTP `401` |
| UC04-SEC-02 | User thường gọi xác nhận | HTTP `403` |
| UC04-SEC-03 | User thường gọi nhập lẻ | HTTP `403` |
| UC04-SEC-04 | User thường gọi hủy phiếu | HTTP `403` |
| UC04-SEC-05 | Storekeeper thực hiện nghiệp vụ hợp lệ | Được phép |
| UC04-SEC-06 | Admin thực hiện nghiệp vụ hợp lệ | Được phép |
| UC04-SEC-07 | Payload dài hoặc ký tự đặc biệt | Được validate/parameterize; không SQL injection, không lỗi 500 ngoài dự kiến |

### 6.6. Đồng thời, retry và rollback

| Mã | Kịch bản | Kết quả mong đợi |
|---|---|---|
| UC04-CON-01 | Hai request xác nhận cùng phiếu đồng thời | Chỉ một transaction được ghi; request còn lại trả kết quả idempotent hoặc `409` |
| UC04-CON-02 | Retry cùng `request_id` sau timeout | Không tạo thêm tồn kho, ledger hoặc event |
| UC04-CON-03 | Hai request nhập lẻ cùng dòng | Chỉ một thùng ảo được tạo |
| UC04-RBK-01 | Lỗi khi cập nhật Packaging | Toàn bộ thay đổi WMS rollback |
| UC04-RBK-02 | Lỗi khi insert inventory ledger | Packaging, tồn kho, transaction book và các bảng còn lại rollback |
| UC04-RBK-03 | Lỗi khi ghi audit trong nghiệp vụ bắt buộc audit | Kết quả tuân theo quyết định thiết kế; không để giao dịch ở trạng thái không xác định |

## 7. Truy vấn đối chiếu sau kiểm thử

Thay `@SoPhieuNhap` bằng phiếu đang kiểm thử.

```sql
SELECT * FROM dbo.WMS_UC03_ScanLog
WHERE SoPhieuNhap = @SoPhieuNhap;

SELECT * FROM dbo.tbl_thung60_kho
WHERE receipt_session_no = @SoPhieuNhap;

SELECT * FROM dbo.stock_transaction_book
WHERE document_no = @SoPhieuNhap;

SELECT * FROM dbo.inventory_ledger
WHERE source_document_no = @SoPhieuNhap;

SELECT * FROM dbo.item_ledger
WHERE source_document_no = @SoPhieuNhap;

SELECT * FROM dbo.thung60_event
WHERE source_document_no = @SoPhieuNhap;

SELECT * FROM dbo.audit_log
WHERE object_id = @SoPhieuNhap;
```

Kiểm tra thêm trên Packaging theo danh sách `MaThung60` của phiếu.

## 8. Tiêu chí nghiệm thu

UC04 chỉ được nghiệm thu khi:

- 100% test mức Critical và High đạt Pass.
- Không còn lỗi tạo tồn kho/ledger trùng.
- Không có trường hợp WMS thành công nhưng Packaging thất bại hoặc ngược lại.
- Batch nhập lẻ bảo đảm tất cả thành công hoặc tất cả rollback.
- Kiểm thử đồng thời và retry không tạo dữ liệu lặp.
- Phân quyền trả đúng `401`/`403`.
- Audit chứa đúng người thao tác, thời gian, lý do và thông tin request thực tế.
- Tổng biến động hai ledger cân bằng với tồn kho phát sinh.
- Có bằng chứng kiểm thử cho từng trường hợp Fail hoặc Blocked.

## 9. Biên bản thực hiện

| Thuộc tính | Nội dung |
|---|---|
| Build/version | |
| Môi trường | |
| Người thực hiện | |
| Ngày thực hiện | |
| Tổng số test | |
| Pass | |
| Fail | |
| Blocked | |
| Ticket lỗi liên quan | |

### Kết luận

- [ ] Đạt yêu cầu nghiệm thu.
- [ ] Đạt có điều kiện, cần xử lý các lỗi được ghi nhận.
- [ ] Không đạt, chưa được phép triển khai production.

### Ghi chú

........................................................................................................

........................................................................................................
