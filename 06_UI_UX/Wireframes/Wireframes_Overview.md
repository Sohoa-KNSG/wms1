# Tổng Quan Thiết Kế Wireframes (UI Wireframes Overview)

Tài liệu này tổng hợp danh mục các bản thiết kế phác thảo khung giao diện (Wireframes) của hệ thống **WMS Kho Thành Phẩm**.

---

## 1. Danh Mục Các File Wireframes Chi Tiết

| STT | File Wireframe | Màn Hình Tương Ứng | Phân Hệ | Trạng Thái |
| :---: | :--- | :--- | :--- | :---: |
| **1** | [UI_UC16_Picking_Screen.md](UI_UC16_Picking_Screen.md) | **SCR-PICK-01**: Màn hình Soạn Hàng & Gợi Ý FIFO<br>**SCR-PICK-02**: Modal Lấy Lẻ Thùng Ảo (UC17)<br>**SCR-GATE-01**: Màn hình Kiểm Cổng & Xuất Bến | Outbound Picking | 🟢 Hoàn thành |
| **2** | [UI_UC07_OEM_Order.md](UI_UC07_OEM_Order.md) | **SCR-OEM-01**: Màn hình Quản Lý Đơn Hàng OEM | Master / OEM | 🟢 Hoàn thành |

---

## 2. Quy Chuẩn Đóng Khung Giao Diện (Layout Standards)

Tất cả các bản thiết kế Wireframes đều tuân thủ các quy tắc sau:

1. **Header Thanh Điều Hướng (Top Navigation Bar):**
   - Hiển thị logo WMS, thông tin người dùng đăng nhập (`Thủ Kho / Bảo Vệ`), vị trí kho hoạt động và Nút Đăng xuất.

2. **Khu Vực Thông Tin Nghiệp Vụ Chính (Main Action Zone):**
   - Hiển thị tiêu đề Use Case, thanh tiến độ hoàn thành (% Progress Bar) và các nút thao tác nhanh.

3. **Khung Quét Mã Vạch Kích Thước Lớn (Big Scanner Input Zone):**
   - Ô nhập text cỡ lớn (`1.25rem`), tự động lấy nét (Focus), nằm ở vị trí trung tâm thao tác.

4. **Khung Gợi Ý FIFO Cao Cấp (FIFO Suggestions Container):**
   - Hiển thị **Vị Trí Kệ Kho (`📍 C52/1`)** dưới dạng Huy hiệu Badge nổi bật.
   - Phân biệt rõ **1. Kiện lớn 360** và **2. Thùng 60 lẻ bên ngoài** có gắn nhãn `⭐ Ưu tiên #1`.
