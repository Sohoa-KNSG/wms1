import { describe, it, expect } from 'vitest';
import { ConfirmDialog } from '../Dialog/ConfirmDialog.jsx';

describe('ConfirmDialog Component Tests', () => {
  it('should export ConfirmDialog function component', () => {
    expect(typeof ConfirmDialog).toBe('function');
  });
});
