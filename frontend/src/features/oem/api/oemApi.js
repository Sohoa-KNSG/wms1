import { httpClient } from '../../../api/httpClient.js';

export const oemApi = {
  getOrders: (params) => httpClient.get('/oem-orders', { params }),
  getProducts: () => httpClient.get('/oem-orders/products'),
  createOrder: (orderData) => httpClient.post('/oem-orders', orderData),
  updateOrder: (orderNo, productCode, batchNo, orderData) =>
    httpClient.put(`/oem-orders/${encodeURIComponent(orderNo)}/${encodeURIComponent(productCode)}/${batchNo}`, orderData),
  getHistory: (orderNo, productCode, batchNo) =>
    httpClient.get(`/oem-orders/${encodeURIComponent(orderNo)}/${encodeURIComponent(productCode)}/${batchNo}/history`),
  importOrders: (payload) => httpClient.post('/oem-orders/import', payload)
};
