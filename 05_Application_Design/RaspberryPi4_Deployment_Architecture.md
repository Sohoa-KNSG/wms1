# Tài Liệu Thiết Kế & Triển Khai Edge Gateway Trên Raspberry Pi 4 (WMS IoT Hardware Bridge)

---

## 1. Tổng Quan Kiến Trúc Edge Computing (System Overview)

Trong hệ thống WMS Kho Thành Phẩm, **Raspberry Pi 4 Model B** đóng vai trò là một **Edge Gateway / Localhost Hardware Bridge** độc lập được đặt trực tiếp tại từng Trạm Đóng Gói (Pack360 Station), Trạm Nhập Kho (Inbound Station) và Trạm Soạn Hàng (Picking Station).

### 🎯 Phân Định Trách Nhiệm Kiến Trúc (Architecture Separation of Concerns)
1. **C# .NET Core 8.0 Web API Server (`src/Wms.Api`):**
   - Đảm nhận **100% Logic Nghiệp Vụ**, SQL ACID Transactions, Khóa hàng Concurrency `WITH (UPDLOCK, HOLDLOCK)`, Kiểm soát Idempotency `X-Request-Id`, Xác thực JWT và Hạch toán Sổ Cái Kép (`inventory_ledger` & `item_ledger`).
2. **Raspberry Pi 4 Edge Gateway Daemon (`wms-edge-bridge`):**
   - Đảm nhận **duy nhất vai trò Cầu Nối Phần Cứng (Hardware Bridge Daemon)**: Đọc số Kg từ Cân Điện Tử IoT qua cổng RS232/USB Serial và đẩy mã lệnh in TSPL xuống Máy in nhiệt qua USB hoặc Mạng TCP/IP Direct Socket (Port `9100`).
   - Lắng nghe tại cổng nội bộ `http://localhost:8080` (hoặc IP trạm), giúp ứng dụng Web React (trên Chrome PC/Tablet) giao tiếp mượt mà với thiết bị mà không phụ thuộc vào driver hệ điều hành.

```
   +-----------------------------------------------------------------------------------+
   |                          TRẠM ĐÓNG GÓI (PACKING STATION)                          |
   |                                                                                   |
   |   +-------------------+  HTTP REST API   +------------------------------------+   |
   |   |   Web App React   | ---------------> | C# .NET Core 8.0 API Server        |   |
   |   |   (Chrome Browser)|                  | (src/Wms.Api / Port 5000 / MSSQL)  |   |
   |   +---------+---------+                  +------------------------------------+   |
   |             |                                                                     |
   |             | Local REST API (http://localhost:8080)                              |
   |             v                                                                     |
   |   +------------------------+                                                      |
   |   |   Raspberry Pi 4 B     |                                                      |
   |   |   (Edge Gateway)       |                                                      |
   |   |  [wms-edge-bridge]     |                                                      |
   |   +-----------+------------+                                                      |
   |               |                                                                   |
   |               +----------------------------------+                                |
   |               |                                  |                                |
   |         RS232/Serial USB                   Network TCP/IP                         |
   |               v                                  v                                |
   |      +-----------------+                +------------------+                      |
   |      |   CÂN ĐIỆN TỬ   |                | MÁY IN TEM NHIỆT |                      |
   |      |   (Scale IoT)   |                | (TSPL Port 9100) |                      |
   |      +-----------------+                +------------------+                      |
   +-----------------------------------------------------------------------------------+
```

---

## 2. Yêu Cầu Cấu Hình Phần Cứng & Môi Trường Operating System

### 2.1. Yêu Cầu Phần Cứng (Hardware Requirements)
- **Bo mạch điều khiển:** Raspberry Pi 4 Model B (RAM 4GB hoặc 8GB).
- **Thẻ nhớ lưu trữ:** MicroSD Sandisk Industrial 32GB High-Endurance (Chuẩn Class 10 / U3).
- **Nguồn cấp:** Adapter chính hãng Raspberry Pi 5V 3A USB-C.
- **Cáp chuyển đổi Serial:** Cáp RS232-to-USB (Khuyến nghị Chipset **FTDI FT232RL** hoặc **Prolific PL2303** / **CH340**).
- **Thiết bị ngoại vi kết nối:**
  - Cân điện tử công nghiệp (Hỗ trợ ngõ ra RS232 Baud rate 9600).
  - Máy in tem nhãn nhiệt (Hỗ trợ ngôn ngữ lệnh TSPL / ESC-POS qua cổng USB).

### 2.2. Môi Trường Phần Mềm (Software Stack)
- **Hệ điều hành:** Raspberry Pi OS 64-bit (Debian Bookworm Headless hoặc Desktop).
- **Runtime:** Node.js v20.x LTS (ARM64 Architecture).
- **Process Manager:** `PM2` hoặc `systemd` daemon.
- **Thư viện kết nối phần cứng:** `node-serialport`, `express`, `cors`.

---

## 3. Kiến Trúc Chi Tiết Các Module Edge Daemon (`wms-edge-bridge`)

Dịch vụ Local Daemon chạy trên Raspberry Pi 4 lắng nghe tại cổng `8080` (`http://localhost:8080` hoặc IP nội bộ Trạm `http://192.168.1.x:8080`).

### 3.1. Module Đọc Cân Điện Tử IoT (Scale Bridge Module)
- **Tệp xử lý:** `services/scaleService.js`
- **Cấu hình Serial Port:**
  - Thiết bị: `/dev/ttyUSB0` (Linux) hoặc `/dev/ttyACM0`.
  - Baud Rate: `9600` bps, Data Bits: `8`, Stop Bits: `1`, Parity: `None`.
- **Cơ chế hoạt động:**
  - Lắng nghe liên tục dòng dữ liệu ASCII truyền từ cân (Ví dụ: `ST,GS,+0015.45kg\r\n`).
  - Parse dữ liệu ra số thực (Decimal) và lưu trạng thái ổn định vào bộ nhớ đệm (In-memory buffer).
  - **Tự động kết nối lại (Auto-reconnect):** Nếu tuột cáp USB Cân, service tự động thử kết nối lại sau mỗi 3 giây mà không cần khởi động lại Pi.
- **REST API Endpoint:**
  - **`GET /api/scale/current`**
  - **Response Sample:**
    ```json
    {
      "success": true,
      "weight": 15.45,
      "unit": "kg",
      "stable": true,
      "connected": true,
      "timestamp": "2026-07-27T15:25:30Z"
    }
    ```

### 3.2. Module Điều Khiển Máy In Tem Nhãn TSPL / ESC-POS (Printer Bridge Module)
- **Tệp xử lý:** `services/printService.js`
- **Phương Thức Kết Nối Hỗ Trợ:**
  1. **USB Local Printer:** Gửi lệnh qua tệp thiết bị `/dev/usb/lp0` hoặc hệ thống Spooler CUPS.
  2. **Network TCP/IP Printer (Khuyên Dùng Nhất):** Giao tiếp trực tiếp qua socket mạng TCP/IP tới địa chỉ IP Máy in (Ví dụ `192.168.1.200`) qua **Raw Port `9100`** mà KHÔNG CẦN cài đặt driver hệ điều hành.

- **Mã Nguồn Đẩy Lệnh In Trực Tiếp Qua Socket TCP/IP (Node.js `net` Module):**
  ```javascript
  const net = require('net');

  function printOverTcpIp(printerIp, printerPort = 9100, tsplCommand) {
      return new Promise((resolve, reject) => {
          const client = new net.Socket();
          client.setTimeout(5000); // 5s timeout

          client.connect(printerPort, printerIp, () => {
              console.log(`Đã kết nối thành công tới Máy In Tem IP: ${printerIp}:${printerPort}`);
              client.write(tsplCommand, 'utf-8', () => {
                  client.end();
                  resolve({ success: true, message: 'Đã truyền lệnh in TSPL thành công qua TCP/IP' });
              });
          });

          client.on('error', (err) => {
              console.error(`Lỗi kết nối Máy In IP ${printerIp}:`, err.message);
              client.destroy();
              reject(new Error(`Không thể kết nối máy in mạng ${printerIp}:${printerPort} - ${err.message}`));
          });

          client.on('timeout', () => {
              client.destroy();
              reject(new Error(`Hết thời gian chờ kết nối máy in IP ${printerIp}`));
          });
      });
  }
  ```

- **REST API Endpoint:**
  - **`POST /api/print`**
  - **Payload Sample (In Qua Mạng TCP/IP):**
    ```json
    {
      "connectionType": "TCPIP",
      "printerIp": "192.168.1.200",
      "printerPort": 9100,
      "copies": 1,
      "tsplCode": "SIZE 100 mm, 75 mm\nGAP 3 mm, 0 mm\nCLS\nTEXT 50,50,\"3\",0,1,1,\"PACK360-00129\"\nBARCODE 50,100,\"128\",100,1,0,2,4,\"PACK360-00129\"\nPRINT 1,1\n"
    }
    ```
  - **Response Sample:**
    ```json
    {
      "success": true,
      "message": "Đã gửi lệnh in TSPL qua mạng TCP/IP (192.168.1.200:9100) thành công."
    }
    ```

---

## 4. Hướng Dẫn Cài Đặt & Triển Khai Chi Tiết (Step-by-Step Installation)

### Bước 1: Chuẩn Bị Hệ Điều Hành Raspberry Pi OS
```bash
# 1. Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# 2. Cài đặt các gói bổ trợ phần cứng
sudo apt install -y build-essential git curl cu minicom setserial print-manager cups

# 3. Phân quyền truy cập cổng Serial và Máy in cho user pi
sudo usermod -a -G dialout,lp,tty pi
```

### Bước 2: Cài Đặt Node.js Runtime ARM64
```bash
# Cài đặt Node.js v20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Kiểm tra phiên bản
node -v   # v20.x.x
npm -v    # 10.x.x
```

### Bước 3: Triển Khai Mã Nguồn Local Daemon (`wms-edge-bridge`)
```bash
# 1. Tạo thư mục chứa app trên Raspberry Pi
mkdir -p /home/pi/wms-edge-bridge
cd /home/pi/wms-edge-bridge

# 2. Khởi tạo và cài đặt dependencies
npm init -y
npm install express cors serialport @serialport/parser-readline dotenv
```

### Bước 4: Tạo File Cấu Hình Dịch Vụ Systemd Auto-Start
Tạo file `/etc/systemd/system/wms-bridge.service`:

```ini
[Unit]
Description=WMS Edge Hardware Bridge Daemon (Raspberry Pi 4)
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/wms-edge-bridge
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=8080

[Install]
WantedBy=multi-user.target
```

Kích hoạt dịch vụ khởi động cùng hệ thống:
```bash
sudo systemctl daemon-reload
sudo systemctl enable wms-bridge.service
sudo systemctl start wms-bridge.service
sudo systemctl status wms-bridge.service
```

---

## 5. Giám Sát, Chẩn Đoán Lỗi & An Toàn Vận Hành (Diagnostics & Reliability)

### 5.1. Health Check Endpoint
- **`GET /health`**
- Trả về tình trạng sức khỏe của Raspberry Pi: CPU Temp, RAM Usage, Trạng thái kết nối Cân Serial, Trạng thái kết nối Máy in USB.
```json
{
  "status": "HEALTHY",
  "uptime": 86400,
  "cpuTemp": "45.2°C",
  "memoryFree": "3.1GB",
  "peripherals": {
    "scaleConnected": true,
    "scalePort": "/dev/ttyUSB0",
    "printerConnected": true,
    "printerPort": "/dev/usb/lp0"
  }
}
```

### 5.2. Xử Lý Sự Cố Thường Gặp (Troubleshooting)
1. **Lỗi Không Đọc Được Cân (`Permission Denied /dev/ttyUSB0`):**
   - Nguyên nhân: User `pi` chưa được cấp quyền `dialout`.
   - Khắc phục: Chạy `sudo usermod -a -G dialout pi` và khởi động lại Pi (`sudo reboot`).
2. **Lỗi Cân Trả Về Số Rác / Ký Tự Lạ:**
   - Nguyên nhân: Sai Baud Rate.
   - Khắc phục: Kiểm tra thông số Cân (thường là 9600 hoặc 4800) và điều chỉnh biến môi trường `SCALE_BAUD_RATE`.
3. **Lỗi Thẻ Nhớ Bị Crash Do Mất Điện Đột Ngột:**
   - Nguyên nhân: Ghi log liên tục làm hư thẻ SD.
   - Khắc phục: Bật chế độ Overlay File System (`sudo raspi-config` $\rightarrow$ `Performance Options` $\rightarrow$ `Overlay FS` $\rightarrow$ `Enable`).
