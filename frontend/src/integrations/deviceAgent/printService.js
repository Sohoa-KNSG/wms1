import { deviceClient } from './deviceClient.js';

export const resolveLabelData = (payload) => payload?.label_tspl || payload?.label_data || '';

const createFallbackJobId = () => globalThis.crypto?.randomUUID?.()
  || `job-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

export const createPrintRequest = (labelData, printerName = 'DEFAULT_PRINTER', requestedJobId = null) => ({
  jobId: requestedJobId || createFallbackJobId(),
  printerName,
  data: labelData
});

export const printService = {
  printLabel: async (labelData, printerName = 'DEFAULT_PRINTER', requestedJobId = null) => {
    if (!labelData || !String(labelData).trim()) {
      throw new Error('Không có dữ liệu TSPL để in.');
    }

    const request = createPrintRequest(labelData, printerName, requestedJobId);
    const response = await deviceClient.post('/printer/print', request);
    return { success: true, jobId: request.jobId, response };
  },

  printPackLabel: async (payload, printerName = 'DEFAULT_PRINTER') => {
    return printService.printLabel(
      resolveLabelData(payload),
      printerName,
      payload?.print_job_id || null
    );
  },

  checkPrinterStatus: async (printerName = 'DEFAULT_PRINTER') => {
    try {
      const data = await deviceClient.get('/printer/status', { params: { printerName } });
      return data;
    } catch {
      return { isReady: false, status: 'OFFLINE' };
    }
  }
};
