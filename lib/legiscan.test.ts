import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  diffHashes,
  getBillStatusDescription,
  getStatusColor,
  calculateProgress,
  formatBillNumber,
  lsFetch
} from './legiscan';

// Mock fetch for testing
global.fetch = vi.fn();

describe('LegiScan Utilities', () => {
  describe('diffHashes', () => {
    it('should identify changed bills based on hashes', () => {
      const newMasterList = {
        '1234': { change_hash: 'abc123' },
        '5678': { change_hash: 'def456' },
        '9012': { change_hash: 'xyz789' }
      };
      
      const oldHashes = {
        '1234': 'abc123', // unchanged
        '5678': 'old456', // changed
        // 9012 is new
      };
      
      const result = diffHashes(newMasterList, oldHashes);
      expect(result).toEqual([5678, 9012]);
    });
    
    it('should return empty array when nothing changed', () => {
      const newMasterList = {
        '1234': { change_hash: 'abc123' },
        '5678': { change_hash: 'def456' }
      };
      
      const oldHashes = {
        '1234': 'abc123',
        '5678': 'def456'
      };
      
      const result = diffHashes(newMasterList, oldHashes);
      expect(result).toEqual([]);
    });
    
    it('should handle empty old hashes', () => {
      const newMasterList = {
        '1234': { change_hash: 'abc123' },
        '5678': { change_hash: 'def456' }
      };
      
      const oldHashes = {};
      
      const result = diffHashes(newMasterList, oldHashes);
      expect(result).toEqual([1234, 5678]);
    });
  });
  
  describe('formatBillNumber', () => {
    it('should format bill number with a space', () => {
      expect(formatBillNumber('HB1234')).toBe('HB 1234');
      expect(formatBillNumber('SB5678')).toBe('SB 5678');
    });
    
    it('should handle already formatted numbers', () => {
      expect(formatBillNumber('HB 1234')).toBe('HB 1234');
    });
    
    it('should handle other formats gracefully', () => {
      expect(formatBillNumber('Resolution123')).toBe('Resolution123');
    });
  });
  
  describe('getBillStatusDescription', () => {
    it('should return correct status descriptions', () => {
      expect(getBillStatusDescription(1)).toBe('Introduced');
      expect(getBillStatusDescription(4)).toBe('Passed');
      expect(getBillStatusDescription(7)).toBe('Committee');
    });
    
    it('should handle unknown status IDs', () => {
      expect(getBillStatusDescription(999)).toBe('Unknown');
    });
  });
  
  describe('getStatusColor', () => {
    it('should return correct color classes for statuses', () => {
      expect(getStatusColor(1)).toBe('bg-blue-500');    // Introduced
      expect(getStatusColor(4)).toBe('bg-green-600');   // Passed
      expect(getStatusColor(5)).toBe('bg-red-600');     // Vetoed
    });
    
    it('should handle unknown status IDs', () => {
      expect(getStatusColor(999)).toBe('bg-gray-500');
    });
  });
  
  describe('calculateProgress', () => {
    it('should return correct progress percentages', () => {
      expect(calculateProgress(1)).toBe(10);  // Introduced
      expect(calculateProgress(3)).toBe(80);  // Enrolled
      expect(calculateProgress(4)).toBe(100); // Passed
      expect(calculateProgress(6)).toBe(0);   // Failed
    });
    
    it('should handle unknown status IDs', () => {
      expect(calculateProgress(999)).toBe(10);
    });
  });

  // Test for lsFetch would require more complex mocking and is not included here
});