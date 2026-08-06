# Thiết kế Giao diện: SCR-OEM-01 (Quản lý Đơn hàng OEM)

**Tương ứng với Use Case:** UC07 - Khai báo và Theo dõi Đơn hàng OEM.

## 1. Bố cục Tổng thể (Layout Structure)

Màn hình được thiết kế theo dạng **Master-Detail Data Grid**, giúp người dùng dễ dàng lọc, tìm kiếm và thao tác với hàng loạt đơn hàng.

### 1.1. Thanh Công Cụ (Top Action Bar)
- **Breadcrumbs:** `Trang chủ > Quản lý Kế hoạch > Đơn hàng OEM`
- **Bộ lọc nhanh (Filters):**
  - Textbox: Tìm kiếm theo `Số ĐH` hoặc `Mã SP`.
  - Dropdown: Lọc theo `Trạng thái` (All, NEW, PROCESSING, COMPLETED, HOLD).
  - Date Picker: Lọc theo khoảng thời gian `Ngày yêu cầu HT`.
- **Nút Hành động (Action Buttons):**
  - `[ + Import Excel ]` (Nổi bật - Primary Button)
  - `[ Tải File Mẫu ]`
  - `[ Xuất Excel ]`

### 1.2. Bảng Dữ Liệu Chính (Main Data Grid)
Bảng dữ liệu liệt kê các đơn hàng với các cột sau:

1. **Checkbox:** Đánh dấu chọn nhiều dòng.
2. **Số ĐH (Order No):** Text in đậm.
3. **Mã SP (SKU):** Có gắn tooltip hiển thị tên đầy đủ của sản phẩm.
4. **Đợt:** (1, 2, 3...).
5. **Khách hàng:** Mã KH + Tên KH thu gọn.
6. **Tiến độ (Progress):** 
   - Hiển thị dạng thanh Progress Bar (Ví dụ: 🟩🟩🟩⬜⬜ 60%).
   - Text phụ: `Actual Qty / Target Qty` (VD: 600 / 1000).
7. **Ngày Yêu cầu:** Định dạng `dd/MM/yyyy`. Nếu sát deadline (còn < 3 ngày) thì text đổi sang màu Đỏ/Cam cảnh báo.
8. **Trạng thái:** Dạng UI Badge/Chip.
   - 🔵 `NEW` (Xanh biển)
   - 🟡 `PROCESSING` (Vàng)
   - 🟢 `COMPLETED` (Xanh lá)
   - 🔘 `HOLD` (Xám)
9. **Cột Action (Hành động):**
   - ✏️ Sửa (Chỉ hiện khi chưa COMPLETED).
   - 🔄 Xem lịch sử chuyển dư đơn (Log).

---

## 2. Thiết kế Popup: Import Excel (Import Modal)

Khi người dùng bấm `[ + Import Excel ]`, một Modal nổi lên giữa màn hình.

### Các thành phần của Modal:
1. **Khu vực Tải file (Upload Zone):**
   - Khung nét đứt, hỗ trợ kéo thả (Drag & Drop) hoặc click để chọn file từ máy tính.
   - Text hướng dẫn: *"Kéo thả file Excel vào đây hoặc click để duyệt file. Chỉ hỗ trợ định dạng .xlsx, tối đa 5MB."*
2. **Bảng Xem trước Dữ liệu (Preview Table):**
   - Sau khi tải file, màn hình chia đôi hoặc xổ xuống một bảng preview hiển thị 10 dòng đầu tiên.
   - **Tính năng Validate:** Nếu hệ thống phát hiện lỗi (Ví dụ: Cột SKU bị bỏ trống, định dạng Ngày sai), dòng đó sẽ bị bôi đỏ nền. Ô bị lỗi sẽ có viền đỏ và tooltip thông báo lỗi.
3. **Góc thông báo (Summary):**
   - *"Tìm thấy 150 dòng hợp lệ, 2 dòng lỗi."*
4. **Nút Xác nhận:**
   - `[ Hủy ]`
   - `[ Lưu Dữ Liệu ]` (Bị disable nếu có lỗi chưa được sửa).

---

## 3. Mockup Mô phỏng UI (Text-based Wireframe)

```text
+-----------------------------------------------------------------------------------+
|  [Hệ thống WMS]   Trang chủ > Kế hoạch > Đơn hàng OEM              👤 Admin ▼      |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  🔍 [ Nhập Số ĐH / Mã SP... ]   ▽ [Trạng thái: Tất cả]   📅 [1/7/23 - 30/7/23]   |
|                                                                                   |
|                                   [ Tải File Mẫu ] [ Xuất Excel ] [ + Import ]    |
|-----------------------------------------------------------------------------------|
| [ ] | Số ĐH    | Mã SP    | Đợt| Khách hàng   | Tiến độ (Nhập/Yêu cầu)| Trạng thái|
|-----------------------------------------------------------------------------------|
| [ ] | 110/23XK | KD3-0291 | 1  | 0006/LEBANON | 🟩🟩⬜⬜ 100 / 206  | 🟡 PROC   |
| [ ] | 110/23XK | KD3-0292 | 1  | 0006/LEBANON | 🟩🟩🟩🟩 265 / 265  | 🟢 COMP   |
| [ ] | 111/23XK | KD3-1115 | 1  | 0348/KOREA   | ⬜⬜⬜⬜   0 / 500  | 🔵 NEW    |
| [ ] | 111/23XK | KD3-1115 | 2  | 0348/KOREA   | ⬜⬜⬜⬜   0 / 500  | 🔘 HOLD   |
+-----------------------------------------------------------------------------------+
|  Hiển thị 1 - 4 trên tổng 150 bản ghi.                         [<] [1] [2] [3] [>]|
+-----------------------------------------------------------------------------------+
```
