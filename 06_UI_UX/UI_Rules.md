# Quy Tắc Thiết Kế UI/UX Hệ Thống WMS (UI/UX Design Guidelines)

Tài liệu này định nghĩa bộ quy tắc thiết kế giao diện người dùng (UI) và trải nghiệm người dùng (UX) cho hệ thống **WMS Kho Thành Phẩm Thông Minh**.

---

## 1. Nguyên Tắc Thiết Kế Cốt Lõi (Core UI Principles)

1. **Ưu Tiên Vị Trí Kho (Location Code First):**
   - Trong vận hành kho, thủ kho nhìn vào **Vị trí kệ kho** đầu tiên để di chuyển.
   - Tất cả mã vị trí kệ (`LocationCode` ví dụ: `📍 C52/1`, `📍 B41/2`) bắt buộc phải hiển thị dưới dạng **Huy hiệu Badge xanh dương đậm, font chữ đậm 950, có biểu tượng ghim vị trí 📍**.

2. **Dễ Đọc Mã Vạch (Monospaced & Break-Word Barcodes):**
   - Mã vạch thùng 60/kiện 360 rất dài (ví dụ: `K07/1/KM.604/EC/lspth/20/39`).
   - Bắt buộc hiển thị theo phông chữ đơn cách (`fontFamily: 'monospace'`), tự động ngắt dòng (`wordBreak: 'break-all'`), tuyệt đối không bị cắt chữ hoặc bắt cuộn ngang.

3. **Nổi Bật Hàng Ưu Tiên FIFO (`⭐ Ưu tiên #1`):**
   - Hàng hóa cần lấy trước hạn (FIFO) phải được tô nền vàng nhạt (`#fef9c3`), viền nổi bật (`#facc15`) và đính kèm Badge `⭐ Ưu tiên #1` để người thao tác bấm quét ngay lập tức mà không cần suy nghĩ.

4. **Trực Quan Trạng Thái Quét (Scan Status Badges):**
   - `✅ ĐÃ QUÉT`: Nền xanh lá tươi (`#bbf7d0`), chữ xanh lá đậm (`#15803d`).
   - `⏳ CHƯA QUÉT`: Nền xám nhạt (`#f1f5f9`), chữ xám trung tính (`#64748b`).

5. **Phòng Chống Thao Tác Trùng Lặp (Double-Submit & Idempotency Loading):**
   - Nút hành động (Button) và ô nhập mã vạch (Input) tự động khoá (`disabled`) trong thời gian chờ API phản hồi.
   - Tự động refocus lại ô nhập mã vạch sau mỗi lần quét thành công.

---

## 2. Bảng Màu Tiêu Chuẩn (Color Palette & Tokens)

| Thành Phần UI | Mã Màu Hex | Mô Tả & Mục Đích |
| :--- | :--- | :--- |
| **Primary Theme** | `#16a34a` / `#15803d` | Màu chủ đạo (Thành công, Nút xác nhận xuất kho) |
| **Location Badge** | `#e0f2fe` / `#0284c7` | Badge nổi bật Vị trí Kệ Kho (`📍 C52/1`) |
| **FIFO Priority Highlight** | `#fef9c3` / `#fde047` | Nền dòng hàng ưu tiên lấy trước hạn theo FIFO |
| **Scanned Status** | `#bbf7d0` / `#15803d` | Badge đánh dấu dòng/mã đã quét thành công |
| **Warning / Split Box** | `#f59e0b` / `#d97706` | Nút Lấy lẻ Thùng Ảo / Cảnh báo cần lưu ý |
| **Danger / Error Shake** | `#fef2f2` / `#dc2626` | Nền thông báo lỗi quét sai mã / Sai quy cách |

---

## 3. Quy Chuẩn Đáp Ứng Thiết Bị (Device Responsive Guidelines)

1. **Thiết Bị Cầm Tay PDA Quét Mã Vạch (Handheld Barcode Scanner):**
   - Màn hình nhỏ (4.7 - 6 inch): Tự động thu gọn bảng, phóng to ô nhập scanner (`font-size: 1.25rem`, `padding: 1rem`).
   - Tự động kích hoạt bàn phím ảo hoặc cho phép quét camera.

2. **Máy Tính Bảng (Tablet) / Màn Hình Xe Tải (Truck Display):**
   - Màn hình trung bình (8 - 11 inch): Hiển thị bảng dạng 2 cột (Cột trái: Danh sách mặt hàng; Cột phải: Khung quét & Gợi ý FIFO).

3. **Máy Tính Bàn Màn Hình Rộng (Desktop Workstation):**
   - Màn hình lớn ($> 1280\text{px}$): Phân bổ đầy đủ các bảng dữ liệu mà không xuất hiện thanh cuộn ngang.
