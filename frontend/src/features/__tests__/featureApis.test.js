import { describe, it, expect } from 'vitest';
import { reportsApi } from '../reports/api/reportsApi.js';
import { masterDataApi } from '../masterData/api/masterDataApi.js';
import { receivingApi } from '../receiving/api/receivingApi.js';
import { packingApi } from '../packing/api/packingApi.js';
import { palletsApi } from '../pallets/api/palletsApi.js';
import { outboundApi } from '../outbound/api/outboundApi.js';
import { adminApi } from '../administration/api/adminApi.js';

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
});
