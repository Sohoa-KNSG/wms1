# 05_Application_Design - Thiết kế ứng dụng WMS kho thành phẩm

## 1. Mục tiêu tài liệu

Nhóm tài liệu này mô tả thiết kế ứng dụng cho hệ thống WMS kho thành phẩm, trong đó **logic nghiệp vụ chính được xử lý bằng Stored Procedure trong SQL Server**.

Ứng dụng không cập nhật trực tiếp bảng nghiệp vụ. Ứng dụng chỉ thu thập dữ liệu từ người dùng, quét QR/barcode, gọi Stored Procedure với tham số chuẩn, nhận kết quả trả về và hiển thị cho người dùng.

## 2. Nguyên tắc thiết kế đã chốt

| Nguyên tắc | Mô tả |
|---|---|
| SQL Stored Procedure là Orchestrator nghiệp vụ | Stored Procedure kiểm tra rule, cập nhật current state, ghi event, ledger và audit |
| App không chứa business logic lõi | App chỉ validate cơ bản, truyền tham số và hiển thị kết quả |
| Không update trực tiếp từ UI | Không cho Power Apps/Web App/handheld cập nhật trực tiếp bảng nghiệp vụ |
| Một command = một nghiệp vụ rõ ràng | Ví dụ nhập tạm, xác nhận nhập chính thức, đóng Pack360, xuất lẻ, chuyển stock type |
| Có transaction | Stored Procedure dùng transaction để đảm bảo dữ liệu không bị cập nhật nửa chừng |
| Có request_id | Chống scan/gửi lặp, đảm bảo idempotency |
| Có event/ledger/audit | Mọi nghiệp vụ quan trọng phải có lịch sử, sổ tồn và audit |
| Trả về contract thống nhất | Stored Procedure trả `status`, `message`, `error_code`, `document_no`, `object_code`, `request_id` |

## 3. Các file trong nhóm

| File | Nội dung |
|---|---|
| `Component_Diagram.md` | Kiến trúc tổng thể App/API/SQL Stored Procedure/Data/Audit/Integration |
| `Orchestrator_Command_Design.md` | Thiết kế command và danh mục Stored Procedure nghiệp vụ |
| `SQL_Stored_Procedure_Catalog.md` | Danh mục Stored Procedure đề xuất, tham số chính và kết quả trả về |
| `Sequence_Diagrams.md` | Sequence diagram cho các nghiệp vụ lõi theo hướng App gọi Stored Procedure |
| `API_Specification.md` | Đặc tả API/Connector wrapper gọi Stored Procedure |
| `API_Specification.yaml` | OpenAPI YAML mẫu cho lớp API wrapper |
| `Integration_Specification.md` | Tích hợp data sản xuất, ERP, thiết bị, Power BI, Teams/Email |

## 4. Phạm vi nghiệp vụ được bao phủ

- Nhập tạm theo phiếu giao kho từ data sản xuất
- Thủ kho xác nhận nhập chính thức
- Gán pallet / lưu kho / lên kệ
- Đóng Pack360 truyền thống
- Đóng Pack360 OEM/PO linh hoạt theo đơn
- Giải phóng Pack360
- Tách một hoặc nhiều thùng 60 khỏi Pack360
- Đóng lại Pack360 mới
- Chuyển đơn OEM trong quá trình lưu kho
- Chuyển stock type: `UNRESTRICTED`, `BLOCKED`, `TEMPORARY_ISSUE`, `RETURNED`, `SCRAP`
- Khóa tồn `BLOCKED` cho dư đơn hoặc vấn đề chất lượng
- Release tồn bị khóa
- Xuất kho nguyên thùng / Pack360
- Xuất lẻ từ thùng 60, tạo bản ghi thùng 60 ảo trong cùng bảng thùng 60
- Xuất tạm, hoàn nhập/tất toán
- Truy vết vòng đời thùng 60

## 5. Vai trò của App

App có trách nhiệm:

1. Hiển thị màn hình và dữ liệu tham chiếu.
2. Nhận input từ người dùng.
3. Scan QR/barcode.
4. Kiểm tra cơ bản trên giao diện, ví dụ bắt buộc nhập trường, định dạng QR.
5. Sinh `request_id` cho mỗi thao tác nghiệp vụ.
6. Gọi API/connector hoặc Stored Procedure wrapper.
7. Hiển thị kết quả trả về từ Stored Procedure.
8. Không tự cập nhật bảng nghiệp vụ.

## 6. Vai trò của Stored Procedure

Stored Procedure có trách nhiệm:

1. Kiểm tra quyền và điều kiện nghiệp vụ.
2. Kiểm tra trạng thái hiện tại của thùng 60, Pack360, pallet, phiếu.
3. Kiểm tra `stock_type` và `status`.
4. Chống gửi lặp bằng `request_id`.
5. Thực hiện transaction.
6. Cập nhật current state.
7. Ghi event history.
8. Ghi inventory ledger hoặc reclassification ledger nếu cần.
9. Ghi audit log.
10. Rollback khi lỗi.
11. Trả kết quả chuẩn về App.

## 7. Contract trả về chuẩn

Mọi Stored Procedure nghiệp vụ nên trả về cùng một cấu trúc:

```sql
SELECT
    @Status AS status,
    @Message AS message,
    @ErrorCode AS error_code,
    @DocumentNo AS document_no,
    @ObjectCode AS object_code,
    @RequestId AS request_id,
    @TraceId AS trace_id;
```

Giá trị đề xuất cho `status`:

| Status | Ý nghĩa |
|---|---|
| `SUCCESS` | Xử lý thành công |
| `FAILED` | Lỗi nghiệp vụ hoặc dữ liệu không hợp lệ |
| `DUPLICATED` | Request đã xử lý trước đó, trả lại kết quả cũ |
| `CONFLICT` | Dữ liệu đã thay đổi bởi người khác hoặc trạng thái không còn phù hợp |
| `UNAUTHORIZED` | Người dùng không có quyền |

## 8. Khuyến nghị triển khai

Thiết kế này phù hợp với mô hình WMS chạy trên SQL Server, Power Apps/Web App/handheld và data sản xuất nội bộ. Đây là hướng thực dụng, dễ kiểm soát transaction, audit và rule nghiệp vụ trong môi trường nhà máy.
