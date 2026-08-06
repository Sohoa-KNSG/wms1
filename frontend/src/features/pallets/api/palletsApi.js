import { httpClient } from '../../../api/httpClient.js';

export const palletsApi = {
  initPallet: (payload) => httpClient.post('/pallet/init', payload),
  addUnit: (palletId, payload) => httpClient.post(`/pallet/${palletId}/add-unit`, payload),
  completePallet: (palletId) => httpClient.post(`/pallet/${palletId}/complete`),
  removeUnit: (payload) => httpClient.post('/pallet/remove-unit', payload),
  transferUnit: (payload) => httpClient.post('/pallet/transfer-unit', payload),
  getPalletInfo: (palletId) => httpClient.get(`/pallet/${palletId}/info`),
  putawayPallet: (palletId, payload) => httpClient.post(`/pallet/${palletId}/putaway`, payload),
  letdownPallet: (palletId) => httpClient.post(`/pallet/${palletId}/letdown`)
};
