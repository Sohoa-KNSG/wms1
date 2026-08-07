#!/bin/bash
echo "Installing systemd service for wms-edge-bridge..."
cat << EOF | sudo tee /etc/systemd/system/wms-edge-bridge.service
[Unit]
Description=WMS Edge Bridge Service
After=network.target

[Service]
ExecStart=/usr/bin/node $(pwd)/server.js
WorkingDirectory=$(pwd)
Restart=always
User=pi
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable wms-edge-bridge
sudo systemctl start wms-edge-bridge
echo "Service installed and started."
