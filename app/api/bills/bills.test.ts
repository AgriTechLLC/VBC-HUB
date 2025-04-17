import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { createServer } from 'http';
import { apiResolver } from 'next/dist/server/api-utils/node';
import { GET } from './route';
import type { Server, IncomingMessage, ServerResponse } from 'http';

// Mock Redis
vi.mock('@upstash/redis', () => {
  return {
    Redis: vi.fn().mockImplementation(() => {
      return {
        get: vi.fn().mockImplementation((key: string) => {
          if (key === 'vbc:bills:all') {
            return null; // Simulate empty cache
          }
          return null;
        }),
        set: vi.fn().mockImplementation(() => true),
      };
    }),
  };
});

// Mock LegiScan module
vi.mock('@/lib/legiscan-redis', () => {
  return {
    currentVaSession: vi.fn().mockResolvedValue(1234),
    getMasterListRaw: vi.fn().mockResolvedValue({}),
    diffHashes: vi.fn().mockReturnValue([]),
    getBillStatusDescription: vi.fn().mockReturnValue('Test Status'),
    calculateProgress: vi.fn().mockReturnValue(50),
  };
});

describe('/api/bills endpoint', () => {
  let server: Server;
  let serverPromise: Promise<number>;

  beforeAll(() => {
    // Set up a test server
    server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
      // Make sure we're testing with mock param
      const url = req.url || '/api/bills';
      if (url.indexOf('mock=true') === -1) {
        req.url = url + (url.includes('?') ? '&' : '?') + 'mock=true';
      }
      
      await apiResolver(
        req,
        res,
        undefined,
        GET,
        {
          previewModeEncryptionKey: '',
          previewModeSigningKey: '',
          previewModeId: '',
        },
        false
      );
    });
    
    // Start the server on a random port
    serverPromise = new Promise<number>((resolve) => {
      server.listen(0, () => {
        const address = server.address();
        if (address && typeof address !== 'string') {
          resolve(address.port);
        } else {
          resolve(0);
        }
      });
    });
  });
  
  afterAll(() => {
    server.close();
  });
  
  it('should return mock bills data', async () => {
    const port = await serverPromise;
    const response = await fetch(`http://localhost:${port}/api/bills?mock=true`);
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('bills');
    expect(Array.isArray(data.bills)).toBe(true);
    expect(data.bills.length).toBeGreaterThan(0);
    
    // Verify bill structure
    const firstBill = data.bills[0];
    expect(firstBill).toHaveProperty('bill_id');
    expect(firstBill).toHaveProperty('bill_number');
    expect(firstBill).toHaveProperty('title');
    expect(firstBill).toHaveProperty('status');
    expect(firstBill).toHaveProperty('progress');
  });
});