import { deviceClient } from './deviceClient.js';

export const scaleService = {
  readWeight: async () => {
    const data = await deviceClient.get('/scale/weight');
      return {
        weight: data.weight || 0,
        unit: data.unit || 'KG',
        isStable: !!data.isStable
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
