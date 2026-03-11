import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BackupResource } from '../../src/resources/backup';
import { HttpClient } from '../../src/http';

vi.mock('fs', () => {
  const mockWriter = {
    on: vi.fn((event: string, cb: () => void) => {
      if (event === 'finish') setTimeout(cb, 0);
      return mockWriter;
    }),
  };
  const mockStream = {
    pipe: vi.fn(() => mockWriter),
  };
  return {
    createWriteStream: vi.fn(() => mockWriter),
    createReadStream: vi.fn(() => 'mock-stream'),
    statSync: vi.fn(() => ({ size: 2048 })),
  };
});

vi.mock('path', () => ({
  basename: (p: string) => p.split('/').pop(),
}));

function mockHttp() {
  const instance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    axios: {
      get: vi.fn(),
    },
    apiKey: 'sk_test',
  } as unknown as HttpClient;
  return instance;
}

describe('BackupResource', () => {
  let http: ReturnType<typeof mockHttp>;
  let backup: BackupResource;

  beforeEach(() => {
    http = mockHttp();
    backup = new BackupResource(http);
  });

  describe('info', () => {
    it('calls GET /tenant/backup/info', async () => {
      const infoResult = {
        bucket_name: 'tenant-bucket',
        key_name: 'backup.tar.gz',
        total_files: 42,
        total_size: 1_000_000,
      };
      (http.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(infoResult);

      const result = await backup.info();
      expect(http.get).toHaveBeenCalledWith('/tenant/backup/info');
      expect(result.total_files).toBe(42);
      expect(result.total_size).toBe(1_000_000);
    });
  });

  describe('download', () => {
    it('streams response to file via createWriteStream', async () => {
      const mockPipe = vi.fn();
      const mockWriter = {
        on: vi.fn((event: string, cb: () => void) => {
          if (event === 'finish') setTimeout(cb, 0);
          return mockWriter;
        }),
      };
      mockPipe.mockReturnValue(mockWriter);

      const mockResponseData = { pipe: mockPipe };
      (http.axios.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        data: mockResponseData,
      });

      await backup.download('/tmp/backup.tar.gz');

      expect(http.axios.get).toHaveBeenCalledWith('/tenant/backup/download', {
        responseType: 'stream',
        timeout: 0,
        headers: { 'X-API-Key': 'sk_test' },
      });
    });
  });

  describe('restore', () => {
    it('posts multipart form data to /tenant/backup/upload', async () => {
      const restoreResult = {
        ok: true,
        message: 'Restore complete',
        bucket_name: 'tenant-bucket',
        uploaded_files: 42,
        uploaded_size: 1_000_000,
        skipped: 0,
      };
      (http.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(restoreResult);

      const result = await backup.restore('/tmp/backup.tar.gz');

      expect(http.post).toHaveBeenCalledWith(
        '/tenant/backup/upload',
        expect.any(Object),
        expect.objectContaining({
          headers: expect.any(Object),
          timeout: 0,
        }),
      );
      expect(result.ok).toBe(true);
      expect(result.uploaded_files).toBe(42);
    });
  });
});
