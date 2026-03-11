import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AssetsResource } from '../../src/resources/assets';
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

const sampleAsset = {
  id: 'asset-1',
  title: 'Test Video',
  slug: 'test-video',
  status: 'ready' as const,
  duration_sec: 120,
  original_filename: 'video.mp4',
  created_at: '2025-01-01T00:00:00Z',
  playbacks: [{ kind: 'hls' as const, url: 'https://cdn.example.com/hls/master.m3u8' }],
};

describe('AssetsResource', () => {
  let http: ReturnType<typeof mockHttp>;
  let assets: AssetsResource;

  beforeEach(() => {
    http = mockHttp();
    assets = new AssetsResource(http as unknown as HttpClient);
  });

  describe('list', () => {
    it('calls GET /tenant/assets with default pagination', async () => {
      (http.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        items: [sampleAsset],
        total: 1,
        limit: 20,
        offset: 0,
      });

      const result = await assets.list();
      expect(http.get).toHaveBeenCalledWith('/tenant/assets', { limit: 20, offset: 0 });
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('passes custom pagination options', async () => {
      (http.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        items: [],
        total: 0,
        limit: 5,
        offset: 10,
      });

      await assets.list({ limit: 5, offset: 10 });
      expect(http.get).toHaveBeenCalledWith('/tenant/assets', { limit: 5, offset: 10 });
    });
  });

  describe('get', () => {
    it('calls GET /tenant/assets/:id', async () => {
      (http.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(sampleAsset);

      const result = await assets.get('asset-1');
      expect(http.get).toHaveBeenCalledWith('/tenant/assets/asset-1');
      expect(result.id).toBe('asset-1');
    });
  });

  describe('delete', () => {
    it('calls DELETE /tenant/assets/:id', async () => {
      (http.delete as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        deleted: 'asset-1',
      });

      const result = await assets.delete('asset-1');
      expect(http.delete).toHaveBeenCalledWith('/tenant/assets/asset-1');
      expect(result.ok).toBe(true);
      expect(result.deleted).toBe('asset-1');
    });
  });

  describe('waitUntilReady', () => {
    it('returns immediately if asset is already ready', async () => {
      (http.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(sampleAsset);

      const result = await assets.waitUntilReady('asset-1');
      expect(result.status).toBe('ready');
      expect(http.get).toHaveBeenCalledTimes(1);
    });

    it('returns if asset has failed status', async () => {
      (http.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ...sampleAsset,
        status: 'failed',
      });

      const result = await assets.waitUntilReady('asset-1');
      expect(result.status).toBe('failed');
    });

    it('polls until ready', async () => {
      const pending = { ...sampleAsset, status: 'processing' as const };
      const ready = { ...sampleAsset, status: 'ready' as const };

      (http.get as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(pending)
        .mockResolvedValueOnce(pending)
        .mockResolvedValueOnce(ready);

      vi.useFakeTimers();
      const promise = assets.waitUntilReady('asset-1', 100);
      await vi.advanceTimersByTimeAsync(100);
      await vi.advanceTimersByTimeAsync(100);
      const result = await promise;
      vi.useRealTimers();

      expect(result.status).toBe('ready');
      expect(http.get).toHaveBeenCalledTimes(3);
    });

    it('throws on timeout', async () => {
      const processing = { ...sampleAsset, status: 'processing' as const };
      (http.get as ReturnType<typeof vi.fn>).mockResolvedValue(processing);

      await expect(
        assets.waitUntilReady('asset-1', 10, 50),
      ).rejects.toThrow('did not become ready');
    });
  });
});
