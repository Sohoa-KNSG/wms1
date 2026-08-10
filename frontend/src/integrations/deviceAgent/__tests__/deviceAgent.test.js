import { describe, it, expect } from 'vitest';
import { getDeviceAgentToken, getDeviceAgentUrl } from '../deviceConfig.js';
import { scaleService } from '../scaleService.js';
import { createPrintRequest, printService, resolveLabelData } from '../printService.js';

describe('Device Agent Integration Baseline Tests', () => {
  it('should resolve default device agent URL', () => {
    const url = getDeviceAgentUrl();
    expect(url).toBeDefined();
    expect(url).toContain('http');
    expect(getDeviceAgentToken()).toBe('');
  });

  it('should define scale and printer service methods', () => {
    expect(typeof scaleService.readWeight).toBe('function');
    expect(typeof scaleService.checkStatus).toBe('function');
    expect(typeof printService.printLabel).toBe('function');
    expect(typeof printService.checkPrinterStatus).toBe('function');
  });

  it('maps the API print payload to the installed bridge contract', () => {
    const apiPayload = {
      label_data: 'CLS\r\nPRINT 1,1\r\n',
      print_job_id: 'pack360-job-001'
    };

    const request = createPrintRequest(
      resolveLabelData(apiPayload),
      'DEFAULT_PRINTER',
      apiPayload.print_job_id
    );

    expect(request).toEqual({
      jobId: 'pack360-job-001',
      printerName: 'DEFAULT_PRINTER',
      data: 'CLS\r\nPRINT 1,1\r\n'
    });
  });
});
