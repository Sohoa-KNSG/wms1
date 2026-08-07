const fs = require('fs');
const path = require('path');

const projectRoot = '/home/knsg-s3/.gemini/antigravity/worktrees/WMS/verify-uat-test-plan';
const configPath = path.join(projectRoot, 'frontend/src/integrations/deviceAgent/deviceConfig.js');
const clientPath = path.join(projectRoot, 'frontend/src/integrations/deviceAgent/deviceClient.js');
const scalePath = path.join(projectRoot, 'frontend/src/integrations/deviceAgent/scaleService.js');
const printPath = path.join(projectRoot, 'frontend/src/integrations/deviceAgent/printService.js');
const screenPath = path.join(projectRoot, 'frontend/src/components/Pack360Screen.jsx');

// 1. Update deviceConfig.js
fs.writeFileSync(configPath, `export const getDeviceAgentUrl = () => {
  const localUrl = typeof window !== 'undefined' && window.localStorage ? localStorage.getItem('wms_device_agent_url') : null;
  const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const envUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_DEVICE_AGENT_URL : null;
  return localUrl || envUrl || (isLocalhost ? 'http://localhost:8080' : \`http://\${window.location.hostname}:8080\`);
};

export const getDeviceAgentToken = () => {
  return typeof window !== 'undefined' && window.localStorage ? localStorage.getItem('X-Device-Agent-Token') : null;
};
`);

// 2. Update deviceClient.js
fs.writeFileSync(clientPath, `import axios from 'axios';
import { getDeviceAgentUrl, getDeviceAgentToken } from './deviceConfig.js';

export const deviceClient = axios.create({
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

deviceClient.interceptors.request.use((config) => {
  config.baseURL = getDeviceAgentUrl();
  const token = getDeviceAgentToken();
  if (token) {
    config.headers['X-Device-Agent-Token'] = token;
  }
  return config;
});

deviceClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const isOffline = !error.response || error.code === 'ECONNABORTED';
    const message = isOffline ? 'Trạm Device Agent không phản hồi hoặc đang Offline.' : error.message;
    return Promise.reject({ isOffline, message, status: error.response?.status || 0 });
  }
);
`);

// 3. Update scaleService.js
fs.writeFileSync(scalePath, `import { deviceClient } from './deviceClient.js';

export const scaleService = {
  readWeight: async () => {
    const data = await deviceClient.get('/scale/weight');
      return {
        weight: data.weight || 0,
        unit: data.unit || 'KG',
        isStable: !!data.isStable,
        stale: !!data.stale
      };
  },

  checkStatus: async () => {
    try {
      await deviceClient.get('/scale/status');
      return true;
    } catch {
      return false;
    }
  }
};
`);

// 4. Update printService.js
let printContent = fs.readFileSync(printPath, 'utf8');
printContent = printContent.replace(
  /const response = await deviceClient\.post\('\/printer\/print', \{\s*jobId,\s*printerName,\s*data: labelData\s*\}\);\s*return \{ success: true, jobId, response \};/,
  `try {
      const response = await deviceClient.post('/printer/print', {
        jobId,
        printerName,
        data: labelData
      });
      return { success: true, jobId, response };
    } catch (error) {
      throw error;
    }`
);
fs.writeFileSync(printPath, printContent);

// 5. Update Pack360Screen.jsx
let screenContent = fs.readFileSync(screenPath, 'utf8');

// Add scaleStatus state
screenContent = screenContent.replace(
  /const \[manualWeightValue, setManualWeightValue\] = useState\(''\);/,
  `const [manualWeightValue, setManualWeightValue] = useState('');\n  const [scaleStatus, setScaleStatus] = useState({ state: 'OFFLINE', isStable: false, stale: true });`
);

// Add useEffect for polling scale
screenContent = screenContent.replace(
  /const fetchOemOrders = async \(\) => \{/,
  `useEffect(() => {
    let interval;
    if (!isManualWeight) {
      interval = setInterval(async () => {
        try {
          const data = await scaleService.readWeight();
          setWeight(data.weight);
          let state = 'CONNECTED';
          if (data.stale) state = 'STALE';
          else if (!data.isStable) state = 'UNSTABLE';
          else state = 'STABLE';
          setScaleStatus({ state, isStable: !!data.isStable, stale: !!data.stale });
        } catch (error) {
          setScaleStatus({ state: 'OFFLINE', isStable: false, stale: true });
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isManualWeight]);

  const fetchOemOrders = async () => {`
);

// Update getWeightFromScale
screenContent = screenContent.replace(
  /const getWeightFromScale = async \(\) => \{[\s\S]*?return null;\n    \}\n  \};/,
  `const getWeightFromScale = async () => {
    try {
      setStatusMsg({ text: 'Đang kết nối cân...', type: 'info' });
      const data = await scaleService.readWeight();
      const scaleWeight = data.weight || 0;
      setWeight(scaleWeight);
      if (data.stale) {
        setStatusMsg({ text: 'Dữ liệu cân bị cũ (STALE).', type: 'error' });
        return null;
      }
      if (!data.isStable) {
        setStatusMsg({ text: 'Cân chưa ổn định (UNSTABLE).', type: 'error' });
        return null;
      }
      setStatusMsg({ text: \`Đã lấy cân nặng: \${scaleWeight} kg\`, type: 'success' });
      return scaleWeight;
    } catch (error) {
      setStatusMsg({ text: 'Lỗi kết nối cân IoT. Vui lòng kiểm tra Local Bridge.', type: 'error' });
      return null;
    }
  };`
);

// Replace generateTSPL
screenContent = screenContent.replace(
  /const generateTSPL = \(data\) => \{[\s\S]*?return tspl;\n  \};/,
  `const generateTSPL = (data) => {
    return data.label_tspl || '';
  };`
);

// Update handlePrint
screenContent = screenContent.replace(
  /const handlePrint = async \(dataToPrint\) => \{[\s\S]*?\}\n  \};/,
  `const handlePrint = async (dataToPrint) => {
    try {
      const tsplCommand = generateTSPL(dataToPrint);
      if (!tsplCommand) throw new Error("Không có dữ liệu TSPL");
      await printService.printLabel(tsplCommand);
      setStatusMsg({ text: 'Đã gửi lệnh in 2 tem thành công.', type: 'success' });
    } catch (error) {
      throw error;
    }
  };`
);

// Update handleComplete
screenContent = screenContent.replace(
  /const handleComplete = async \(\) => \{[\s\S]*?\}\n  \};/,
  `const handleComplete = async () => {
    if (!pack360Id) return;
    
    let scaleWeight = null;
    let weightSource = 'SCALE';
    let manualReason = '';
    
    if (isManualWeight) {
      scaleWeight = parseFloat(manualWeightValue);
      if (isNaN(scaleWeight) || scaleWeight <= 0) {
        setStatusMsg({ text: 'Vui lòng nhập trọng lượng hợp lệ!', type: 'error' });
        return;
      }
      weightSource = 'MANUAL';
      manualReason = window.prompt("Vui lòng nhập lý do nhập tay trọng lượng:");
      if (!manualReason) {
         setStatusMsg({ text: 'Bắt buộc nhập lý do khi cân thủ công!', type: 'error' });
         return;
      }
    } else {
      scaleWeight = await getWeightFromScale();
      if (scaleWeight === null) {
        return;
      }
    }

    try {
      setStatusMsg({ text: 'Đang chốt thùng...', type: 'info' });

      const res = await packingApi.completePack({
        pack360_id: pack360Id,
        weight: scaleWeight,
        weight_source: weightSource,
        manual_weight_reason: manualReason
      });

      const payload = res?.data !== undefined ? res.data : res;
      setPrintData(payload);
      
      try {
        await handlePrint(payload);
        setPack360Id(null);
        setScannedUnits([]);
        setWeight(null);
      } catch (printError) {
        setStatusMsg({ text: 'Pack360 completed but print failed', type: 'warning' });
      }
    } catch (error) {
      setStatusMsg({ text: \`Lỗi: \${error.message}\`, type: 'error' });
    }
  };

  const handleReprint = async () => {
    if (!printData || (!pack360Id && !printData.pack360_id)) return;
    const reason = window.prompt("Nhập lý do in lại:");
    if (!reason) return;
    try {
      setStatusMsg({ text: 'Đang gửi yêu cầu in lại...', type: 'info' });
      const idToReprint = pack360Id || printData.pack360_id;
      const res = await packingApi.reprintPack({ pack360_id: idToReprint, reason });
      const payload = res?.data !== undefined ? res.data : res;
      setPrintData(payload);
      await handlePrint(payload);
    } catch (err) {
      setStatusMsg({ text: \`Lỗi in lại: \${err.message}\`, type: 'error' });
    }
  };`
);

// Disable 'Complete' button if scale is unstable/stale
screenContent = screenContent.replace(
  /disabled=\{\!pack360Id\}/,
  `disabled={!pack360Id || (!isManualWeight && (scaleStatus.stale || !scaleStatus.isStable || scaleStatus.state === 'OFFLINE'))}`
);
screenContent = screenContent.replace(
  /background: \!pack360Id \? '#ced4da' : 'var\(--success-color\)'/,
  `background: (!pack360Id || (!isManualWeight && (scaleStatus.stale || !scaleStatus.isStable || scaleStatus.state === 'OFFLINE'))) ? '#ced4da' : 'var(--success-color)'`
);
screenContent = screenContent.replace(
  /cursor: \!pack360Id \? 'not-allowed' : 'pointer'/,
  `cursor: (!pack360Id || (!isManualWeight && (scaleStatus.stale || !scaleStatus.isStable || scaleStatus.state === 'OFFLINE'))) ? 'not-allowed' : 'pointer'`
);

// Update Reprint button
screenContent = screenContent.replace(
  /onClick=\{\(\) => handlePrint\(printData\)\}/,
  `onClick={handleReprint}`
);

// Update UI to show scaleStatus
const oldWeightUI = `{weight !== null ? \`\${weight}\` : '0.00'} <span style={{ fontSize: '16px', color: '#adb5bd' }}>kg</span>
                    </div>
                  )}
                </div>`;
const newWeightUI = `{weight !== null ? \`\${weight}\` : '0.00'} <span style={{ fontSize: '16px', color: '#adb5bd' }}>kg</span>
                      </div>
                      <div style={{ marginTop: '5px', fontSize: '12px', fontWeight: 'bold', color: scaleStatus.state === 'STABLE' ? 'var(--success-color)' : 'var(--error-color)' }}>
                        Trạng thái cân: {scaleStatus.state}
                      </div>
                    </div>
                  )}
                </div>`;
screenContent = screenContent.replace(oldWeightUI, newWeightUI);

fs.writeFileSync(screenPath, screenContent);

console.log("All files updated successfully.");
