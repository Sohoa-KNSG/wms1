import { describe, it, expect } from 'vitest';
import { getDeviceAgentUrl } from '../deviceConfig.js';
import { scaleService } from '../scaleService.js';
import { printService } from '../printService.js';

describe('Device Agent Integration Baseline Tests', () => {
  it('should resolve default device agent URL', () => {
    const url = getDeviceAgentUrl();
    expect(url).toBeDefined();
    expect(url).toContain('http');
  });

  it('should define scale and printer service methods', () => {
    expect(typeof scaleService.readWeight).toBe('function');
    expect(typeof scaleService.checkStatus).toBe('function');
    expect(typeof printService.printLabel).toBe('function');
    expect(typeof printService.checkPrinterStatus).toBe('function');
  });
});
