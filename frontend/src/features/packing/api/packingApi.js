import { httpClient } from '../../../api/httpClient.js';

export const packingApi = {
  getPackInfo: (packId) => httpClient.get(`/pack360/${encodeURIComponent(packId)}`),
  scanUnit: (payload) => httpClient.post('/pack360/scan-unit', payload),
  completePack: (payload) => httpClient.post('/pack360/complete', payload),
  cancelPack: (payload) => httpClient.post('/pack360/cancel', payload),
  releasePack: (payload) => httpClient.post('/pack360/release', payload),
  detachUnits: (payload) => httpClient.post('/pack360/detach-units', payload),
  completeRepack: (payload) => httpClient.post('/pack360/complete-repack', payload),
  transferOrder: (payload) => httpClient.post('/pack360/transfer-order', payload)
};
