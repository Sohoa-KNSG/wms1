# UC05 WMS Edge Bridge cho Raspberry Pi 4

Service này chỉ kết nối phần cứng tại trạm đóng gói: đọc cân RS232/USB Serial và gửi TSPL tới máy in. Toàn bộ luật nghiệp vụ UC05, JWT người dùng và transaction SQL vẫn nằm ở WMS API.

## API cung cấp

| Endpoint | Công dụng |
| --- | --- |
| `GET /health` | Tình trạng Pi, cân và máy in |
| `GET /scale/weight` | Payload tương thích `scaleService.js` của frontend |
| `GET /scale/status` | Trạng thái cổng Serial |
| `POST /printer/print` | In TSPL, có chống lặp theo `jobId` |
| `GET /printer/status` | Kiểm tra máy in |
| `GET /api/scale/current` | Endpoint tương thích tài liệu cũ |
| `POST /api/print` | Endpoint tương thích tài liệu cũ |

## Chạy thử không cần phần cứng

```bash
cp .env.example .env
sed -i 's/MOCK_SCALE=false/MOCK_SCALE=true/' .env
sed -i 's/MOCK_PRINTER=false/MOCK_PRINTER=true/' .env
npm ci
npm test
npm start
curl http://127.0.0.1:8080/health
curl http://127.0.0.1:8080/scale/weight
```

## Cài trên Raspberry Pi OS 64-bit

```bash
sudo apt update
sudo apt install -y git curl build-essential
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

cd /duong-dan/repository/raspberry-pi/wms-edge-bridge
npm ci
npm test
sudo bash ./install.sh
sudo nano /etc/wms-edge-bridge.env
sudo systemctl start wms-edge-bridge
sudo systemctl status wms-edge-bridge
journalctl -u wms-edge-bridge -f
```

Sau khi thay cổng cân hoặc máy in, chạy:

```bash
sudo systemctl restart wms-edge-bridge
```

## Kết nối cân

Kiểm tra thiết bị:

```bash
ls -l /dev/ttyUSB* /dev/ttyACM*
sudo -u wmsbridge test -r /dev/ttyUSB0 && echo OK
```

Cấu hình thường dùng: `9600 baud`, 8 data bits, 1 stop bit, parity none. Parser nhận các chuỗi như `ST,GS,+0015.45kg`; tiền tố `ST` được hiểu là cân ổn định và `US` là chưa ổn định.

## Kết nối máy in

Khuyến nghị máy in TSPL mạng:

```dotenv
PRINTER_MODE=tcp
PRINTER_HOST=192.168.1.200
PRINTER_PORT=9100
```

Máy in USB:

```dotenv
PRINTER_MODE=usb
PRINTER_DEVICE=/dev/usb/lp0
```

Bridge chỉ in tới máy đã cấu hình trong `/etc/wms-edge-bridge.env`; request từ trình duyệt không được phép thay đổi IP máy in.

## Trình duyệt chạy ở máy khác

Mặc định bridge chỉ nghe `127.0.0.1`, phù hợp khi Chrome chạy ngay trên Pi. Nếu trình duyệt chạy trên một PC khác trong LAN:

1. Đặt `HOST=0.0.0.0`.
2. Tạo `DEVICE_AGENT_TOKEN` ngẫu nhiên tối thiểu 32 ký tự.
3. Chỉ thêm URL frontend thật vào `CORS_ALLOWED_ORIGINS`.
4. Đặt URL bridge trong frontend: `localStorage.setItem('wms_device_agent_url', 'http://IP-CUA-PI:8080')`.
5. Đặt token: `localStorage.setItem('wms_device_agent_token', 'TOKEN-DA-TAO')`.

Không mở port 8080 ra Internet. Nên giới hạn firewall chỉ cho IP trạm đóng gói truy cập.

## Payload in từ frontend

```json
{
  "jobId": "pack360-20260807-0001",
  "printerName": "DEFAULT_PRINTER",
  "data": "SIZE 100 mm,75 mm\nCLS\nQRCODE 20,60,M,5,A,0,\"PACK360-001\"\nPRINT 1\n"
}
```

`jobId` đã in được giữ trong bộ nhớ theo `PRINT_JOB_CACHE_MS`, giúp thao tác retry không in trùng trong cùng phiên chạy service.
