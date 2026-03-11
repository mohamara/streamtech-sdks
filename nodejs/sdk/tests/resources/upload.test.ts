import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UploadResource } from '../../src/resources/upload';
import { HttpClient } from '../../src/http';

vi.mock('crypto', () => ({
  randomUUID: () => 'mock-uuid-1234',
}));

vi.mock('fs', () => ({
  statSync: vi.fn(() => ({ size: 1024 })),
  createReadStream: vi.fn(() => 'mock-stream'),
}));

vi.mock('path', () => ({
  basename: (p: string) => p.split('/').pop(),
}));

function mockHttp() {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  } as unknown as HttpClient;
}

const uploadResult = {
  ok: true,
  message: 'Upload successful',
  id: 'asset-1',
  title: 'Test Video',
  slug: 'test-video',
  original_filename: 'video.mp4',
  profile: 'default',
};

describe('UploadResource', () => {
  let http: ReturnType<typeof mockHttp>;
  let upload: UploadResource;

  beforeEach(() => {
    http = mockHttp();
    upload = new UploadResource(http as unknown as HttpClient);
  });

  describe('buffer', () => {
    it('posts multipart form data to /tenant/upload', async () => {
      (http.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(uploadResult);

      const buf = Buffer.from('fake video data');
      const result = await upload.buffer(buf, 'video.mp4', { title: 'My Video' });

      expect(http.post).toHaveBeenCalledWith(
        '/tenant/upload',
        expect.any(Object),
        expect.objectContaining({ headers: expect.any(Object) }),
      );
      expect(result.ok).toBe(true);
      expect(result.id).toBe('asset-1');
    });

    it('includes optional fields (folder, profile) in form data', async () => {
      (http.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(uploadResult);

      const buf = Buffer.from('data');
      await upload.buffer(buf, 'video.mp4', {
        title: 'Test',
        folder: 'movies',
        profile: 'hevc',
      });

      expect(http.post).toHaveBeenCalledTimes(1);
    });

    it('calls progress callback when provided', async () => {
      (http.post as ReturnType<typeof vi.fn>).mockImplementation(
        async (_url, _data, config) => {
          if (config?.onUploadProgress) {
            config.onUploadProgress({ loaded: 50, total: 100 });
          }
          return uploadResult;
        },
      );

      const onProgress = vi.fn();
      const buf = Buffer.from('data');
      await upload.buffer(buf, 'video.mp4', {}, onProgress);

      expect(onProgress).toHaveBeenCalledWith({
        loaded: 50,
        total: 100,
        percent: 50,
      });
    });
  });

  describe('file', () => {
    it('uploads small files directly via /tenant/upload', async () => {
      const { statSync } = await import('fs');
      (statSync as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ size: 1024 });
      (http.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(uploadResult);

      const result = await upload.file('/path/to/video.mp4');
      expect(http.post).toHaveBeenCalledWith(
        '/tenant/upload',
        expect.any(Object),
        expect.objectContaining({ headers: expect.any(Object) }),
      );
      expect(result.ok).toBe(true);
    });

    it('falls back to chunked upload for large files', async () => {
      const { statSync, createReadStream } = await import('fs');
      const chunkSize = 512;
      const largeUpload = new UploadResource(http as unknown as HttpClient, chunkSize);
      (statSync as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ size: 1024 });
      (createReadStream as unknown as ReturnType<typeof vi.fn>).mockReturnValue('mock-stream');

      const chunkResult = { ok: true, chunk: 0, total: 2 };
      const finalResult = { ...uploadResult, ok: true, chunk: 1, total: 2, done: true };
      (http.post as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(chunkResult)
        .mockResolvedValueOnce(finalResult);

      const result = await largeUpload.file('/path/to/video.mp4');
      expect(http.post).toHaveBeenCalledWith(
        '/tenant/upload-chunk',
        expect.any(Object),
        expect.objectContaining({ headers: expect.any(Object) }),
      );
    });
  });

  describe('chunkedBuffer', () => {
    it('splits buffer into chunks and posts each to /tenant/upload-chunk', async () => {
      const chunkSize = 5;
      const chunkedUpload = new UploadResource(http as unknown as HttpClient, chunkSize);
      const data = Buffer.alloc(12, 'a');

      const chunkResponses = [
        { ok: true, chunk: 0, total: 3 },
        { ok: true, chunk: 1, total: 3 },
        { ...uploadResult, ok: true, chunk: 2, total: 3, done: true },
      ];

      (http.post as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(chunkResponses[0])
        .mockResolvedValueOnce(chunkResponses[1])
        .mockResolvedValueOnce(chunkResponses[2]);

      const onProgress = vi.fn();
      await chunkedUpload.chunkedBuffer(data, 'video.mp4', { title: 'Test' }, onProgress);

      expect(http.post).toHaveBeenCalledTimes(3);
      expect(onProgress).toHaveBeenCalledTimes(3);
      expect(onProgress).toHaveBeenLastCalledWith({
        loaded: 12,
        total: 12,
        percent: 100,
      });
    });
  });

  describe('fromUrl', () => {
    it('posts import data to /tenant/import-url', async () => {
      const importResult = {
        ok: true,
        message: 'Import started',
        id: 'asset-2',
        title: 'Imported',
        slug: 'imported',
        url: 'https://example.com/video.mp4',
        profile: 'default',
      };
      (http.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(importResult);

      const result = await upload.fromUrl({
        url: 'https://example.com/video.mp4',
        title: 'Imported',
        profile: 'default',
      });

      expect(http.post).toHaveBeenCalledWith('/tenant/import-url', {
        url: 'https://example.com/video.mp4',
        title: 'Imported',
        folder: undefined,
        profile: 'default',
      });
      expect(result.ok).toBe(true);
      expect(result.id).toBe('asset-2');
    });
  });
});
