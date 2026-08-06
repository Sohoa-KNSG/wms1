import { httpClient } from '../../../api/httpClient.js';

export const receivingApi = {
  getAllHandovers: () => httpClient.get('/receipt/handovers'),
  getHandoverDetails: (handoverNo) => httpClient.get(`/receipt/handover/${handoverNo}`),
  searchOrders: (keyword) => httpClient.get('/receipt/orders/search', { params: { keyword } }),
  mapOrder: (payload) => httpClient.post('/receipt/map-order', payload),
  unmapOrder: (payload) => httpClient.post('/receipt/unmap-order', payload),
  scanThung60: (payload) => httpClient.post('/receipt/scan-thung60', payload),
  scanBarcode: (payload) => httpClient.post('/receipt/scan', payload),
  confirmNhapKho: (payload) => httpClient.post('/receipt/confirm-nhap-kho', payload),
  confirmNhapLe: (payload) => httpClient.post('/receipt/confirm-nhap-le', payload),
  confirmNhapLeBatch: (payload) => httpClient.post('/receipt/confirm-nhap-le-batch', payload),
  cancelScan: (payload) => httpClient.post('/receipt/cancel-scan', payload),
  getConfirmList: () => httpClient.get('/receipt/confirm-list'),
  getConfirmHandoverLines: (handoverNo) => httpClient.get(`/receipt/confirm-handover/${handoverNo}/lines`),
  getPendingBoxes: (handoverNo, lineNo) => httpClient.get(`/receipt/confirm-detail/${handoverNo}/${lineNo}`)
};
