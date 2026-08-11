import { describe, it, expect, vi, afterEach } from 'vitest';
import { httpClient } from '../../api/httpClient.js';
import { reportsApi } from '../reports/api/reportsApi.js';
import { masterDataApi } from '../masterData/api/masterDataApi.js';
import { receivingApi } from '../receiving/api/receivingApi.js';
import { packingApi } from '../packing/api/packingApi.js';
import { palletsApi } from '../pallets/api/palletsApi.js';
import { outboundApi } from '../outbound/api/outboundApi.js';
import { adminApi } from '../administration/api/adminApi.js';
import { pickingApi } from '../picking/api/pickingApi.js';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Feature API Modules Baseline Tests', () => {
  it('should have all API endpoints defined as functions', () => {
    expect(typeof reportsApi.getMacroReport).toBe('function');
    expect(typeof masterDataApi.getTrucks).toBe('function');
    expect(typeof receivingApi.scanBarcode).toBe('function');
    expect(typeof packingApi.completePack).toBe('function');
    expect(typeof palletsApi.putawayPallet).toBe('function');
    expect(typeof outboundApi.gateOutDeliveryNote).toBe('function');
    expect(typeof adminApi.createUser).toBe('function');
  });

  it('should call the documented batch truck routes', async () => {
    const post = vi.spyOn(httpClient, 'post').mockResolvedValue({});

    await pickingApi.completeTruck('51C 123.45');
    await pickingApi.stageTruck('51C 123.45');

    expect(post).toHaveBeenNthCalledWith(1, '/picking/trucks/51C%20123.45/complete');
    expect(post).toHaveBeenNthCalledWith(2, '/picking/trucks/51C%20123.45/stage');
  });

  it('should not expose the destructive clear-test-data API', () => {
    expect(outboundApi.clearTestData).toBeUndefined();
  });
});
