# Decision Tables - Kho thành phẩm sản xuất

## 1. Mục đích

Tài liệu này chuẩn hóa các bảng quyết định cho WMS kho thành phẩm. Các bảng này dùng để BA, Dev, Tester và quản lý kho kiểm tra nhanh điều kiện cho phép/từ chối trong các nghiệp vụ chính.

## 2. Quyết định: Quét nhập tạm thùng 60

| Điều kiện | Giá trị | Kết quả |
|---|---|---|
| Đã chọn phiếu giao kho | Không | Từ chối quét |
| Đã chọn dòng chi tiết | Không | Từ chối quét |
| QR tồn tại | Không | Từ chối, ghi lỗi `QR_NOT_FOUND` |
| QR đã quét trong phiên | Có | Từ chối, ghi lỗi `DUPLICATE_SCAN_IN_SESSION` |
| Thùng đã nhập chính thức | Có | Từ chối, ghi lỗi `ALREADY_RECEIVED` |
| Mã hàng thùng khác dòng phiếu | Có | Từ chối, ghi lỗi `PRODUCT_MISMATCH` |
| Số lượng vượt số còn lại | Có | Từ chối hoặc yêu cầu phê duyệt theo cấu hình |
| Tất cả hợp lệ | Có | Thêm vào phiên nhập tạm |

## 3. Quyết định: Xác nhận nhập chính thức

| Điều kiện | Kết quả |
|---|---|
| Người dùng không có quyền thủ kho/quản lý | Từ chối |
| Phiên nhập tạm không tồn tại | Từ chối |
| Phiên nhập tạm đã hủy | Từ chối |
| Phiên nhập tạm đã xác nhận chính thức | Từ chối thao tác lặp, trả kết quả cũ nếu cùng `request_id` |
| Có thùng lỗi trong phiên | Từ chối hoặc yêu cầu xử lý lỗi trước |
| Số lượng quét vượt số lượng giao | Từ chối hoặc yêu cầu phê duyệt vượt |
| Hợp lệ | Post nhập kho, cập nhật current state, ledger tăng tồn, audit |

## 4. Quyết định: Đóng Pack360 truyền thống

| Điều kiện | Kết quả |
|---|---|
| Pack360 không ở `OPEN` | Không cho thêm thùng |
| Thùng 60 không tồn tại | Từ chối |
| Thùng 60 đã thuộc Pack360 active khác | Từ chối |
| Thùng 60 `stock_type != UNRESTRICTED` | Từ chối |
| Thùng 60 đã `SHIPPED` hoặc `SCRAPPED` | Từ chối |
| Mã hàng khác rule chuẩn | Từ chối, trừ khi master rule cho phép |
| Chưa đủ slot/số lượng | Cho scan tiếp |
| Đủ rule chuẩn | Cho complete Pack360 |

## 5. Quyết định: Đóng Pack360 OEM

| Điều kiện | Kết quả |
|---|---|
| Không có OEM/PO/pack rule | Từ chối hoặc yêu cầu chọn rule |
| Thùng không thuộc danh sách được phép của OEM/PO | Từ chối |
| Thùng khác mã hàng nhưng rule OEM cho phép | Cho phép |
| Thùng khác mã hàng nhưng rule OEM không cho phép | Từ chối |
| Số lượng thùng chưa đủ theo packing list | Cho scan tiếp |
| Số lượng vượt rule OEM/PO | Từ chối hoặc yêu cầu phê duyệt |
| Đủ rule OEM/PO | Cho complete Pack360 |

## 6. Quyết định: Giải phóng Pack360

| Điều kiện | Kết quả |
|---|---|
| Pack360 không tồn tại | Từ chối |
| Pack360 đã `SHIPPED` | Từ chối |
| Pack360 đang thuộc phiếu xuất active | Từ chối hoặc yêu cầu hủy phân bổ trước |
| Pack360 đang `STAGED` | Từ chối |
| Người dùng không có quyền | Từ chối |
| Hợp lệ | Chuyển Pack360 `RELEASED`, thùng 60 về `WAITING_REPACK`/`AVAILABLE`, ghi event/audit |

## 7. Quyết định: Tách một/vài thùng 60 khỏi Pack360

| Điều kiện | Kết quả |
|---|---|
| Pack360 không active | Từ chối |
| Thùng được chọn không nằm trong Pack360 | Từ chối |
| Thùng đã allocated/picked/staged/shipped | Từ chối |
| Sau khi tách, Pack360 còn hợp lệ | Pack360 `COMPLETED_ADJUSTED` |
| Sau khi tách, Pack360 không còn đạt rule | Pack360 `NEED_REVIEW` |
| Sau khi tách không còn thùng nào | Pack360 `RELEASED` |
| Hợp lệ | Gỡ relation hiện tại, ghi relation history, event và audit |

## 8. Quyết định: Chuyển đơn OEM

| Điều kiện | Kết quả |
|---|---|
| Thùng/Pack360 đã shipped | Từ chối |
| Đang allocated/picked/staged | Từ chối hoặc yêu cầu hủy phân bổ trước |
| Đơn OEM/PO mới không tồn tại | Từ chối |
| Mã hàng/danh sách thùng không phù hợp đơn mới | Từ chối hoặc yêu cầu phê duyệt |
| Đơn mới có pack rule khác | Cập nhật pack rule và đánh dấu Pack360 `NEED_REVIEW` nếu đang trong Pack360 |
| Hợp lệ | Tạo request, duyệt, post chuyển OEM, ghi event/audit/ledger reclassification nếu cần |

## 9. Quyết định: Chuyển stock type sang BLOCKED

| Tình huống | Stock type mới | Block reason | Kết quả |
|---|---|---|---|
| Dư đơn OEM/dư kế hoạch | `BLOCKED` | `OEM_SURPLUS` | Không được phân bổ/xuất |
| Có vấn đề chất lượng phát hiện trong kho | `BLOCKED` | `QUALITY_ISSUE` | Không được phân bổ/xuất |
| Thùng gốc còn lại sau xuất lẻ | `BLOCKED` | `PARTIAL_REMAINING` | Không được xuất tiếp nếu chưa xử lý/release |
| Pack360 cần xem xét sau khi tách | `BLOCKED` hoặc giữ theo từng thùng | `PACK360_NEED_REVIEW` | Chờ quản lý xử lý |
| Sai lệch dữ liệu | `BLOCKED` | `DATA_EXCEPTION` | Chờ sửa lỗi có audit |

## 10. Quyết định: Release tồn BLOCKED

| Điều kiện | Kết quả |
|---|---|
| Người dùng không có quyền release | Từ chối |
| Lý do block là `QUALITY_ISSUE` nhưng chưa có xác nhận xử lý | Từ chối |
| Lý do block là `OEM_SURPLUS` nhưng chưa có quyết định dùng đơn mới | Từ chối hoặc giữ BLOCKED |
| Lý do block là `PARTIAL_REMAINING` nhưng chưa có phương án xử lý thùng thiếu chuẩn | Từ chối hoặc chuyển loại phù hợp |
| Hợp lệ | Đổi stock type về `UNRESTRICTED` hoặc stock type phù hợp, ghi event/audit/reclassification |

## 11. Quyết định: Xuất kho

| Điều kiện | Kết quả |
|---|---|
| `stock_type = UNRESTRICTED` | Có thể phân bổ nếu status hợp lệ |
| `stock_type = BLOCKED` | Từ chối xuất |
| `stock_type = TEMPORARY_ISSUE` | Từ chối xuất như hàng trong kho |
| `stock_type = SCRAP` | Từ chối xuất |
| `status = AVAILABLE` hoặc status được cấu hình cho phép | Cho phân bổ/pick |
| `status = TEMP_RECEIVED` | Từ chối, chưa nhập chính thức |
| `status = SHIPPED` hoặc `SCRAPPED` | Từ chối |

## 12. Quyết định: Xuất lẻ từ thùng 60

| Điều kiện | Kết quả |
|---|---|
| Thùng gốc không tồn tại | Từ chối |
| Thùng gốc `stock_type != UNRESTRICTED` | Từ chối |
| Thùng gốc đang trong Pack360 completed | Từ chối hoặc yêu cầu tách khỏi Pack360 trước theo rule |
| Số lượng lấy <= 0 | Từ chối |
| Số lượng lấy > current_qty | Từ chối |
| Số lượng lấy = current_qty | Xử lý xuất nguyên thùng, không tạo thùng ảo |
| Số lượng lấy < current_qty | Tạo bản ghi thùng 60 mới trong cùng bảng thùng 60 với `is_virtual = 1` |
| Thùng gốc còn lại < standard_qty | Cập nhật thùng gốc `stock_type = BLOCKED`, reason `PARTIAL_REMAINING` |
| Thùng ảo được tạo cho phiếu xuất | Cho đi tiếp luồng pick/stage/xuất |

## 13. Quyết định: Xuất tạm

| Điều kiện | Kết quả |
|---|---|
| Không có chứng từ xuất tạm | Từ chối |
| Không có người nhận hoặc ngày hẹn trả | Từ chối |
| Hàng không đủ điều kiện xuất tạm | Từ chối |
| Hợp lệ | Chuyển `stock_type = TEMPORARY_ISSUE` hoặc status `TEMP_ISSUED`, ghi chứng từ, event, audit |
| Hàng quay về | Hoàn nhập, cập nhật stock type/status phù hợp |
| Hàng không quay về | Tất toán bằng xuất thật/hủy/điều chỉnh có phê duyệt |
