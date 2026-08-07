import { deviceClient } from './deviceClient.js';

export const printService = {
  printLabel: async (labelData, printerName = 'DEFAULT_PRINTER') => {
    const jobId = 'job-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now();

    try {
      const response = await deviceClient.post('/printer/print', {
        jobId,
        printerName,
        data: labelData
      });
      return { success: true, jobId, response };
    } catch (error) {
      throw error;
    }
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
