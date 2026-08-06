# Tiêu Chuẩn & Cấu Trúc Bắt Buộc Cho Tài Liệu Use Case (WMS)

Tất cả các tài liệu Phân tích và Thiết kế Use Case trong dự án WMS bắt buộc phải tuân theo cấu trúc tối thiểu dưới đây. Cấu trúc này đảm bảo đầy đủ từ nghiệp vụ, lập trình, đến an toàn dữ liệu và sổ cái kế toán kho.

---

# Phân tích Thiết kế Logic [Mã UC] - [Tên Use Case]

## 1. Business Logic (Logic Nghiệp Vụ)
- **Mục tiêu cốt lõi:** Mô tả ngắn gọn ý nghĩa của Use case.
- **Các quy tắc nghiệp vụ (Business Rules):** Đánh mã `BR-[Mã UC]-01`, `02`... Liệt kê các ràng buộc, kiểm tra số lượng, quyền hạn, logic hạch toán.
- **Quy trình tương tác (Interaction Flow):** Liệt kê các bước đối đáp giữa Người dùng (Actor) và Hệ thống. (Ví dụ: Bước 1: Nhân viên thao tác... Bước 2: Hệ thống phản hồi...).

## 2. Tiêu chuẩn Thiết kế Giao diện (UI/UX Guidelines)
- Thiết bị đích (Desktop / Tablet / Máy quét RF).
- Yêu cầu trải nghiệm (Focus tự động, phản hồi màu sắc Xanh/Đỏ, chặn luồng bằng Modal, hiển thị thanh tiến trình...).

## 3. Programming Logic (Logic Lập Trình)
### 3.1. Frontend (Tên Component)
- Các State chính cần quản lý.
- Luồng xử lý giao diện (Validate trước khi gửi, Async call, Refresh dữ liệu không gián đoạn).
### 3.2. Backend API
- Endpoint và Payload.
- Trình tự Validation nhiều tầng.
- Lệnh gọi Stored Procedure hoặc ORM Transaction.

## 4. Data Logic (Thiết kế Dữ Liệu)
### 4.1. Ma trận phân quyền CRUD
- Lập bảng liệt kê các Table bị ảnh hưởng (Create, Read, Update, Delete) kèm mô tả ngắn gọn ý nghĩa trong bối cảnh UC này.
### 4.2. Định nghĩa Trạng thái (State Definitions / Conceptual Model)
- Bảng liệt kê các biến / cờ (flags) quan trọng bị gán cứng. (Ví dụ: `is_virtual = 1`, `status = 'PICKED'`).
### 4.3. Cập nhật Sổ Cái Kép (Dual Ledger Logic)
- Giải thích cách giao dịch này hạch toán vào `stock_transaction_book`, `item_ledger`, `inventory_ledger`.

## 5. Biểu Đồ Thiết Kế (Diagrams)
> **Bắt buộc sử dụng cú pháp Mermaid để vẽ biểu đồ trực quan.**

### 5.1. Sequence Diagram / Data Flow Diagram (Luồng Trạng Thái)
- Vẽ `sequenceDiagram` mô phỏng API Call hoặc `flowchart TD` mô phỏng sự chuyển đổi trạng thái của thực thể.
### 5.2. Cấu trúc Phân tầng Dữ liệu (Data Layer Architecture)
- Vẽ `flowchart TD` (Graph TD) thể hiện luồng Transaction.
- Yêu cầu chỉ rõ: ACID Transaction, Locking Mechanisms (`UPDLOCK`), Fail-fast validation.
### 5.3. Entity Relationship & Logic Trạng thái (State Logic Map)
- Vẽ `erDiagram` thể hiện mối liên hệ giữa các bảng. Đặc biệt chú trọng bảng Mapping, Bảng Lịch sử (Event/History), và các trường liên kết gia phả (`parent_id`, `root_id`).
