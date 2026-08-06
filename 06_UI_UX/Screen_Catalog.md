# Danh Mục Màn Hình Giao Diện (Screen Catalog WMS)

Tài liệu này thống kê toàn bộ danh mục các màn hình giao diện (UI) của hệ thống WMS, liên kết với các Use Case và phân hệ tương ứng.

---

## 1. Bảng Danh Mục Màn Hình Tổng Thể

| STT | Mã Màn Hình | Tên Màn Hình Giao Diện | Use Case Liên Kết | Phân Hệ | Trạng Thái Thiết Kế |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **1** | **SCR-AUTH-01** | Màn hình Đăng nhập & Xác thực | UC01 Authentication | System | 🟢 Hoàn thành |
| **2** | **SCR-REC-01** | Màn hình Bàn Giao & Nhập Kho Production | [UC01-UC05](../02_Process_UseCase/UC03_Receive_Product.md) | Inbound | 🟢 Hoàn thành |
| **3** | **SCR-REC-02** | Màn hình Nhập Lẻ & Tạo Thùng Ảo Đầu Vào | UC04 Inbound Loose | Inbound | 🟢 Hoàn thành |
| **4** | **SCR-PICK-01** | Màn hình Soạn Hàng & Gợi Ý FIFO | [UC16](../02_Process_UseCase/UC16_Picking.md) | Outbound | 🟢 Hoàn thành (Modern UI) |
| **5** | **SCR-PICK-02** | Màn hình Lấy Lẻ Thùng Gốc & Thùng Ảo | UC17 Split Box | Outbound | 🟢 Hoàn thành |
| **6** | **SCR-GATE-01** | Màn hình Kiểm Cổng & Xuất Bến Xe Tải | UC16 Gate-Out | Outbound | 🟢 Hoàn thành |
| **7** | **SCR-PACK-01** | Màn hình Đóng / Rã Kiện 360 | UC12 Repack | Inventory | 🟢 Hoàn thành |
| **8** | **SCR-OEM-01** | Màn hình Quản Lý Đơn Hàng OEM | UC07 OEM Management | Master | 🟢 Hoàn thành |
| **9** | **SCR-INV-01** | Màn hình Báo Cáo Nhập-Xuất-Tồn & Kệ Kho | UC08 Stock Report | Reports | 🟢 Hoàn thành |
| **10** | **SCR-MST-01** | Màn hình Quản Lý Danh Mục (Xe, Tài Xế, Bảo Vệ) | UC15 Master Data | Master | 🟢 Hoàn thành |

---

## 2. Mô Tả Chi Tiết Màn Hình Trọng Tâm (SCR-PICK-01)

- **Mục tiêu:** Cho phép thủ kho chọn phiếu xuất, xem danh sách mặt hàng, di chuyển tới vị trí kệ theo gợi ý FIFO và dùng máy quét PDA quét mã vạch thùng 60 / kiện 360.
- **Thành phần chính:**
  1. Header thông tin phiếu xuất & Thanh tiến độ hoàn thành (% Progress Bar).
  2. Khung **Gợi Ý Vị Trí Kho & Thùng Hàng FIFO**: Phân định rõ **1. Kiện lớn 360** và **2. Thùng 60 lẻ bên ngoài** với Badge vị trí kho `📍 C52/1` và mảng màu ưu tiên `⭐ Ưu tiên #1`.
  3. Khung Nhập/Quét Mã Vạch kích thước lớn, tự động xóa sạch nội dung sau khi gửi request.
  4. Nút bấm kích hoạt Modal **Lấy Lẻ từ Thùng Gốc (UC17)**.
  5. Bảng Lịch Sử Quét Real-time.
