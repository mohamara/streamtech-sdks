import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlaybackResource } from '../../src/resources/playback';
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

const samplePlayback = {
  asset_id: 'asset-1',
  status: 'ready',
  hls_url: 'https://cdn.example.com/hls/master.m3u8',
  dash_url: 'https://cdn.example.com/dash/manifest.mpd',
  original_url: 'https://cdn.example.com/original/video.mp4',
  original_filename: 'video.mp4',
};

describe('PlaybackResource', () => {
  let http: ReturnType<typeof mockHttp>;
  let playback: PlaybackResource;

  beforeEach(() => {
    http = mockHttp();
    playback = new PlaybackResource(http as unknown as HttpClient);
  });

  describe('get', () => {
    it('calls GET /tenant/assets/:id/playback', async () => {
      (http.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(samplePlayback);

      const result = await playback.get('asset-1');
      expect(http.get).toHaveBeenCalledWith('/tenant/assets/asset-1/playback');
      expect(result.hls_url).toBe('https://cdn.example.com/hls/master.m3u8');
      expect(result.dash_url).toBe('https://cdn.example.com/dash/manifest.mpd');
    });
  });

  describe('byFilename', () => {
    it('calls GET /tenant/playback/filename/:filename without format', async () => {
      (http.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(samplePlayback);

      const result = await playback.byFilename('video.mp4');
      expect(http.get).toHaveBeenCalledWith(
        '/tenant/playback/filename/video.mp4',
        {},
      );
      expect(result.asset_id).toBe('asset-1');
    });

    it('passes format as query param', async () => {
      (http.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ...samplePlayback,
        primary_url: samplePlayback.hls_url,
      });

      const result = await playback.byFilename('video.mp4', 'hls');
      expect(http.get).toHaveBeenCalledWith(
        '/tenant/playback/filename/video.mp4',
        { format: 'hls' },
      );
      expect(result.primary_url).toBeDefined();
    });

    it('encodes special characters in filename', async () => {
      (http.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(samplePlayback);

      await playback.byFilename('my video (1).mp4');
      expect(http.get).toHaveBeenCalledWith(
        '/tenant/playback/filename/my%20video%20(1).mp4',
        {},
      );
    });
  });
});
