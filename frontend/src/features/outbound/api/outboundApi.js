import { httpClient } from '../../../api/httpClient.js';

export const outboundApi = {
  getRequirements: (params) => httpClient.get('/export/requirements', { params }),
  pasteData: (payload) => httpClient.post('/export/paste-data', payload),
  deleteRequirement: (payload) => httpClient.delete('/export/requirements', { data: payload }),
  createDeliveryNotes: (payload) => httpClient.post('/export/delivery-notes', payload),
  getDeliveryNotes: (params) => httpClient.get('/picking/notes', { params }),
  getDeliveryNoteDetails: (noteNo) => httpClient.get(`/picking/notes/${noteNo}`),
  stageDeliveryNote: (payload) => httpClient.post('/picking/stage', payload),
  gateOutDeliveryNote: (payload) => httpClient.post('/picking/gate-check', payload),
  getTruckSummary: (truckPlate) => httpClient.get(`/picking/truck-summary/${encodeURIComponent(truckPlate)}`),
  getFifoSuggestions: (pcode) => httpClient.get(`/picking/fifo-suggestions/${encodeURIComponent(pcode)}`),
  getLineScans: (noteNo, pcode) => httpClient.get(`/picking/notes/${noteNo}/line/${encodeURIComponent(pcode)}`),
  getAvailableBoxes: (pcode) => httpClient.get(`/picking/available-boxes/${encodeURIComponent(pcode)}`),
  splitBox: (payload) => httpClient.post('/picking/split-box', payload),
  scanPickingUnit: (payload) => httpClient.post('/picking/scan', payload),
  batchTruckAction: (endpoint, licensePlate) =>
    httpClient.post(`/picking/trucks/${encodeURIComponent(licensePlate)}/${endpoint}`),
  completePick: (payload) => httpClient.post('/picking/complete', payload)
};
