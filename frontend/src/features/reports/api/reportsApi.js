import { httpClient } from '../../../api/httpClient.js';

export const reportsApi = {
  getMacroReport: (search) => httpClient.get('/reports/inventory/macro', { params: { search } }),
  getMicroReport: (params) => httpClient.get('/reports/inventory/micro', { params }),
  getLocationReport: (params) => httpClient.get('/reports/inventory/location', { params: typeof params === 'string' ? { search: params } : params }),
  
  // Smart Analytics (UC22.3 - UC22.6)
  getAbcXyzReport: () => httpClient.get('/reports/smart/abc-xyz'),
  getHeatmapReport: () => httpClient.get('/reports/smart/heatmap'),
  getPickingKpiReport: () => httpClient.get('/reports/smart/picking-kpi'),
  getAgingReport: () => httpClient.get('/reports/smart/aging'),
  getReconciliationReport: () => httpClient.get('/reports/smart/reconciliation')
};
