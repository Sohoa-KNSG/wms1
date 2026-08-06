# Kế Hoạch Vận Hành & Cutover Frontend React (Frontend Cutover & Operational Plan)

## 1. Tổng Quan
Tài liệu này hướng dẫn chi tiết quy trình kiểm thử UAT cuối cùng, bàn giao vận hành và cutover ứng dụng **React Frontend (`frontend/`)** đã chuẩn hóa kết nối với **ASP.NET Core 8 Web API (`src/Wms.Api/`)**.

---

## 2. Danh Mục Kiểm Kiểm Thử Nghiệm Thu (UAT & Quality Gate Verification)

| STT | Luồng Nghiệp Vụ Frontend | Kết Quả Kiểm Thử (Pass/Fail) | Ghi Chú Chuẩn Hóa |
| --- | --- | :---: | --- |
| 1 | **Login & Authentication** | 🟢 **PASS** | Tự động phát hành Bearer Token, kiểm tra tài khoản bị khóa 5 lần |
| 2 | **Forced Password Change** | 🟢 **PASS** | Bảo vệ 100% cờ `must_change_password` ngăn chặn bypass sau refresh F5 |
| 3 | **Receiving & Scan Thùng 60** | 🟢 **PASS** | Gửi lệnh scan qua `httpClient.js`, nhận thông điệp lỗi nghiệp vụ chuẩn |
| 4 | **Pack 360 & Repack** | 🟢 **PASS** | Tự động gắn `X-Request-Id` cho command đóng gói chống gửi trùng lặp |
| 5 | **Palletizing & Putaway** | 🟢 **PASS** | Lập Pallet, chuyển hàng và Putaway/Letdown qua Stored Procedure Gateway |
| 6 | **Outbound Picking & Gate Out** | 🟢 **PASS** | Phân quyền `Picking.Ship` cho Bảo vệ xuất bến với `WITH (UPDLOCK)` |
| 7 | **Realtime Inventory & Reports** | 🟢 **PASS** | Báo cáo Tồn kho Macro, Micro, Vị trí & Sổ cái Kép |
| 8 | **Device Agent (Cân & Máy In)** | 🟢 **PASS** | Tách biệt WMS JWT token, tự động sinh `jobId` chống in nhãn lặp |

---

## 3. Quy Trình Khởi Động & Build Production

1. **Bước 1: Cấu hình biến môi trường (`frontend/.env.production`)**
   ```env
   VITE_API_BASE_URL=/api/v1
   VITE_DEVICE_AGENT_URL=http://localhost:8080
   ```

2. **Bước 2: Đóng gói Ứng dụng (Build Bundle)**
   ```bash
   cd /home/knsg-s3/WMS/frontend
   npm run build
   ```
   *Thư mục kết quả đóng gói nằm tại `frontend/dist/`.*

3. **Bước 3: Cấu hình Nginx / Reverse Proxy phục vụ tĩnh dist & proxy API**
   ```nginx
   server {
       listen 80;
       server_name wms.company.com;

       location / {
           root /home/knsg-s3/WMS/frontend/dist;
           try_files $uri $uri/ /index.html;
       }

       location /api/ {
           proxy_pass http://localhost:5000/api/;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Request-Id $http_x_request_id;
       }
   }
   ```

---
*Kế hoạch Cutover React Frontend đã hoàn tất và sẵn sàng đưa vào vận hành.*
