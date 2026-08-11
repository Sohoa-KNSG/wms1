# Kế hoạch Hoàn Tất Chuyển Đổi sang Kiến Trúc ASP.NET

Dựa trên quá trình kiểm tra môi trường chạy thực tế của máy chủ, tôi phát hiện ra một sự thật thú vị: **Toàn bộ hệ thống WMS hiện tại ĐÃ ĐANG CHẠY trên backend ASP.NET (C#) từ trước.**

Cụ thể:
- **Port 5000:** Đang chạy tiến trình `Wms.Api` (ASP.NET).
- **Port 3001:** Tiến trình Node.js hoàn toàn không hoạt động (đã bị tắt).
- **Vite Proxy (`vite.config.js`):** Đang cấu hình chuyển hướng toàn bộ request `/api` sang `127.0.0.1:5000` (Tức là giao diện Frontend luôn gọi vào C# từ trước tới nay).

Do đó, các lỗi hay luồng nghiệp vụ chúng ta phân tích trước giờ ở UC04, UC05, UC06 đều đang được xử lý thực tế qua Controller của C#, sau đó gọi vào SQL Server Stored Procedure.

Vì bạn đã đồng ý "chuyển sang ASP.NET", công việc thực chất bây giờ là **Dọn Dẹp mã nguồn rác (Clean-up)** để tránh gây hiểu nhầm cho team phát triển và hoàn thiện kiến trúc.

## User Review Required

> [!WARNING]
> Kế hoạch này sẽ xóa bỏ toàn bộ thư mục `backend/` (chứa code Node.js cũ) khỏi repository. Xin bạn xác nhận trước khi tôi thực hiện xóa vĩnh viễn.

## Open Questions

Không có câu hỏi mới. Mọi thứ đã rõ ràng.

## Proposed Changes (Chi tiết phương án dọn dẹp)

### 1. Xóa bỏ Node.js (Legacy)
#### [DELETE] [backend/](file:///home/knsg-s3/WMS/backend/)
- Xóa toàn bộ thư mục `backend/` bao gồm các file `.js` cũ, `package.json` của Node.js, `server.js`. Lý do: Code này không còn được sử dụng và gây nhầm lẫn kiến trúc.

### 2. Cập nhật Tài liệu Kiến Trúc
#### [MODIFY] [05_Application_Design/System_Architecture.md](file:///home/knsg-s3/WMS/05_Application_Design/System_Architecture.md) (Hoặc file tương đương nếu có)
- Cập nhật sơ đồ kiến trúc ghi rõ Backend là ASP.NET Core Web API thay vì Node.js.

### 3. Cập nhật Frontend Configuration
#### [MODIFY] [frontend/vite.config.js](file:///home/knsg-s3/WMS/frontend/vite.config.js)
- Giữ nguyên Proxy tới `5000`, nhưng bổ sung comment rõ ràng `// Proxy to ASP.NET Core Wms.Api` để lập trình viên sau này không bị nhầm lẫn.

## Verification Plan

### Automated Checks
- Sau khi xóa, tiến hành build lại Frontend.
- Chạy lại dev server Vite.

### Manual Verification
- Kiểm tra mã nguồn trên Github xem thư mục `backend/` đã biến mất hoàn toàn chưa.
