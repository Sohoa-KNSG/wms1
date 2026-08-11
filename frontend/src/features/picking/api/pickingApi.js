import { httpClient } from '../../../api/httpClient.js';

export const pickingApi = {
  // GET /notes
  getDeliveryNotes: (status) => httpClient.get('/picking/notes', { params: { status } }),
  // GET /notes/:id
  getDeliveryNoteDetails: (noteNo) => httpClient.get(`/picking/notes/${noteNo}`),
  // GET /notes/:id/line/:pcode
  getLineScanHistory: (noteNo, productCode) =>
    httpClient.get(`/picking/notes/${noteNo}/line/${encodeURIComponent(productCode)}`),
  // GET /fifo-suggestions/:product_code
  getFifoSuggestions: (productCode) => httpClient.get(`/picking/fifo-suggestions/${encodeURIComponent(productCode)}`),
  // GET /available-boxes/:productCode
  getAvailableBoxes: (productCode) => httpClient.get(`/picking/available-boxes/${encodeURIComponent(productCode)}`),
  // GET /truck-summary/:license_plate
  getTruckSummary: (truckPlate) => httpClient.get(`/picking/truck-summary/${encodeURIComponent(truckPlate)}`),

  // POST /scan
  scanPickingUnit: (payload) => httpClient.post('/picking/scan', payload),
  // POST /split-box
  splitBox: (payload) => httpClient.post('/picking/split-box', payload),
  // POST /complete
  completePick: (payload) => httpClient.post('/picking/complete', payload),
  // POST /stage
  stageDeliveryNote: (payload) => httpClient.post('/picking/stage', payload),
  // POST /gate-check (Thủ kho / Bảo vệ) -> note: backend is /gate-check or /approve-storekeeper depending on logic
  gateOutDeliveryNote: (payload) => httpClient.post('/picking/gate-check', payload),

  // POST /trucks/:licensePlate/complete
  completeTruck: (licensePlate) => httpClient.post(`/picking/trucks/${encodeURIComponent(licensePlate)}/complete`),
  // POST /trucks/:licensePlate/stage
  stageTruck: (licensePlate) => httpClient.post(`/picking/trucks/${encodeURIComponent(licensePlate)}/stage`)
};
