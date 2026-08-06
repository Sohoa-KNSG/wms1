# Custom Rules cho WMS Project

## Phân tích Thiết kế Use Case
Bất cứ khi nào người dùng yêu cầu phân tích, thiết kế, hoặc viết tài liệu cho một Use Case mới hoặc đang có trong hệ thống WMS, bạn **bắt buộc** phải tuân thủ nghiêm ngặt cấu trúc tài liệu mẫu được định nghĩa tại `/home/knsg-s3/WMS/02_Process_UseCase/_UseCase_Documentation_Template.md`.

Các yêu cầu đặc biệt khi viết:
- Phải chia rõ 5 phần chính: Business Logic, UI/UX Guidelines, Programming Logic, Data Logic, và Diagrams.
- Trong phần **Data Logic**, luôn phân tích kĩ Ma trận CRUD, mô hình định nghĩa trạng thái, và cách ghi hạch toán vào Sổ cái Kép (Dual Ledger).
- Trong phần **Diagrams**, luôn sử dụng cú pháp **Mermaid** để vẽ:
  1. `sequenceDiagram` hoặc `flowchart TD` cho Luồng Trạng thái.
  2. `flowchart TD` cho Data Layer Architecture (thể hiện rõ SQL Transaction, cơ chế Locking `UPDLOCK`, và nguyên tắc Fail-fast).
  3. `erDiagram` cho Entity Relationship & State Logic Map.

Mục tiêu là đảm bảo mọi tài liệu Use Case sinh ra đều có chất lượng chuyên sâu, nhất quán về cấu trúc như UC16 và UC17.

## Quy trình Phê duyệt Kế hoạch (Mandatory Approval Workflow)
Đối với mọi yêu cầu thay đổi, sửa lỗi, cải tiến hoặc phát triển tính năng mới trong dự án, AI assistant **bắt buộc** phải lập và gửi **Kế hoạch Thực thi (Implementation Plan)** chi tiết cho người dùng xem xét trước khi thực hiện bất kỳ thao tác chỉnh sửa mã nguồn hay tệp tin nào trong hệ thống. AI chỉ được phép thực thi sau khi có sự chấp thuận từ người dùng.

## Ghi chú lịch sử thay đổi (Changelog)
Sau khi hoàn thành bất kỳ một đầu việc, tính năng, hoặc milestone nào, Agent BẮT BUỘC phải ghi lại lịch sử thay đổi vào file `CHANGELOG.md` nằm ở thư mục gốc của dự án.

Mỗi bản ghi trong `CHANGELOG.md` cần có cấu trúc rõ ràng bao gồm:
- **Thời gian**: Ngày tháng thực hiện.
- **Tên Task/Milestone**: Tiêu đề công việc (ví dụ: Giai đoạn B - Thiết kế Domain & DB).
- **Nội dung thay đổi**: Liệt kê tóm tắt các tính năng đã thêm, sửa đổi kiến trúc, hoặc các lệnh quan trọng đã thực thi.

Ngoài ra, Agent cần sao chép các file `implementation_plan.md` và `walkthrough.md` của mỗi milestone vào thư mục `docs/history/` và đặt tên tương ứng (ví dụ: `Phase_C_implementation_plan.md`) để lưu trữ lâu dài.
