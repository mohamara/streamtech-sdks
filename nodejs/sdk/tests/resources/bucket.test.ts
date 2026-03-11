import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BucketResource } from '../../src/resources/bucket';
import { HttpClient } from '../../src/http';

function mockHttp() {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  } as unknown as HttpClient;
}

const sampleBrowse = {
  bucket_name: 'tenant-bucket',
  prefix: '',
  folders: [{ name: 'movies', prefix: 'movies/' }],
  files: [{ key: 'intro.mp4', name: 'intro.mp4', size: 1234567, last_modified: '2025-06-01T12:00:00Z' }],
};

describe('BucketResource', () => {
  let http: ReturnType<typeof mockHttp>;
  let bucket: BucketResource;

  beforeEach(() => {
    http = mockHttp();
    bucket = new BucketResource(http as unknown as HttpClient);
  });

  describe('browse', () => {
    it('calls GET /tenant/browse without prefix', async () => {
      (http.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(sampleBrowse);

      const result = await bucket.browse();
      expect(http.get).toHaveBeenCalledWith('/tenant/browse', {});
      expect(result.folders).toHaveLength(1);
      expect(result.files).toHaveLength(1);
    });

    it('passes prefix as query param', async () => {
      (http.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ...sampleBrowse,
        prefix: 'movies/',
      });

      const result = await bucket.browse('movies/');
      expect(http.get).toHaveBeenCalledWith('/tenant/browse', { prefix: 'movies/' });
      expect(result.prefix).toBe('movies/');
    });
  });
});
