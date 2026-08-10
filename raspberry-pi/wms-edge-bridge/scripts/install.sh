#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run this installer with sudo." >&2
  exit 1
fi

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="/opt/wms-edge-bridge"
APP_USER="wmsbridge"

if ! command -v node >/dev/null; then
  echo "Node.js 20 or newer is required." >&2
  exit 1
fi
NODE_MAJOR="$(node -p "Number(process.versions.node.split('.')[0])")"
if [[ "${NODE_MAJOR}" -lt 20 ]]; then
  echo "Node.js 20 or newer is required." >&2
  exit 1
fi

if ! id "${APP_USER}" >/dev/null 2>&1; then
  useradd --system --home-dir "${APP_DIR}" --shell /usr/sbin/nologin "${APP_USER}"
fi
usermod -a -G dialout,lp "${APP_USER}"

install -d -o "${APP_USER}" -g "${APP_USER}" "${APP_DIR}"
rm -rf "${APP_DIR}/src" "${APP_DIR}/node_modules"
cp -R "${SOURCE_DIR}/src" "${APP_DIR}/src"
install -m 0644 "${SOURCE_DIR}/package.json" "${APP_DIR}/package.json"
install -m 0644 "${SOURCE_DIR}/package-lock.json" "${APP_DIR}/package-lock.json"
chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}"

npm ci --omit=dev --prefix "${APP_DIR}"
install -m 0644 "${SOURCE_DIR}/deploy/wms-edge-bridge.service" /etc/systemd/system/wms-edge-bridge.service

if [[ ! -f /etc/wms-edge-bridge.env ]]; then
  install -m 0600 "${SOURCE_DIR}/.env.example" /etc/wms-edge-bridge.env
  echo "Created /etc/wms-edge-bridge.env. Edit hardware and security settings before starting the service."
fi

systemctl daemon-reload
systemctl enable wms-edge-bridge.service
echo "Installation complete. Run: sudo systemctl start wms-edge-bridge"
