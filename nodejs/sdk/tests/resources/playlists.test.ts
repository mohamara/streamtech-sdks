import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlaylistsResource } from '../../src/resources/playlists';
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

const samplePlaylist = {
  id: 'pl-1',
  name: 'My Playlist',
  assetIds: ['asset-1', 'asset-2'],
  createdAt: '2025-01-01T00:00:00Z',
};

describe('PlaylistsResource', () => {
  let http: ReturnType<typeof mockHttp>;
  let playlists: PlaylistsResource;

  beforeEach(() => {
    http = mockHttp();
    playlists = new PlaylistsResource(http as unknown as HttpClient);
  });

  describe('create', () => {
    it('posts to /playlists with name and assetIds', async () => {
      (http.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(samplePlaylist);

      const result = await playlists.create('My Playlist', ['asset-1', 'asset-2']);
      expect(http.post).toHaveBeenCalledWith('/playlists', {
        name: 'My Playlist',
        assetIds: ['asset-1', 'asset-2'],
      });
      expect(result.id).toBe('pl-1');
    });

    it('defaults assetIds to empty array', async () => {
      (http.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ...samplePlaylist,
        assetIds: [],
      });

      await playlists.create('Empty Playlist');
      expect(http.post).toHaveBeenCalledWith('/playlists', {
        name: 'Empty Playlist',
        assetIds: [],
      });
    });
  });

  describe('list', () => {
    it('calls GET /playlists', async () => {
      (http.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce([samplePlaylist]);

      const result = await playlists.list();
      expect(http.get).toHaveBeenCalledWith('/playlists');
      expect(result).toHaveLength(1);
    });
  });

  describe('get', () => {
    it('calls GET /playlists/:id', async () => {
      (http.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(samplePlaylist);

      const result = await playlists.get('pl-1');
      expect(http.get).toHaveBeenCalledWith('/playlists/pl-1');
      expect(result.name).toBe('My Playlist');
    });
  });

  describe('withPlayback', () => {
    it('calls GET /playlists/:id/with-playback', async () => {
      const withPlayback = {
        ...samplePlaylist,
        assets: [
          {
            id: 'asset-1',
            title: 'Video 1',
            slug: 'video-1',
            status: 'ready',
            hls_url: 'https://cdn.example.com/hls/1.m3u8',
          },
        ],
      };
      (http.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(withPlayback);

      const result = await playlists.withPlayback('pl-1');
      expect(http.get).toHaveBeenCalledWith('/playlists/pl-1/with-playback');
      expect(result.assets).toHaveLength(1);
      expect(result.assets[0].hls_url).toBeDefined();
    });
  });

  describe('update', () => {
    it('patches /playlists/:id with name and assetIds', async () => {
      const updated = { ...samplePlaylist, name: 'Updated' };
      (http.patch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(updated);

      const result = await playlists.update('pl-1', 'Updated', ['asset-3']);
      expect(http.patch).toHaveBeenCalledWith('/playlists/pl-1', {
        name: 'Updated',
        assetIds: ['asset-3'],
      });
      expect(result.name).toBe('Updated');
    });

    it('only sends provided fields', async () => {
      (http.patch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(samplePlaylist);

      await playlists.update('pl-1', 'New Name');
      expect(http.patch).toHaveBeenCalledWith('/playlists/pl-1', { name: 'New Name' });
    });
  });

  describe('addAsset', () => {
    it('posts to /playlists/:id/assets/:assetId', async () => {
      const updated = { ...samplePlaylist, assetIds: ['asset-1', 'asset-2', 'asset-3'] };
      (http.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(updated);

      const result = await playlists.addAsset('pl-1', 'asset-3');
      expect(http.post).toHaveBeenCalledWith('/playlists/pl-1/assets/asset-3');
      expect(result.assetIds).toContain('asset-3');
    });
  });

  describe('removeAsset', () => {
    it('deletes /playlists/:id/assets/:assetId', async () => {
      const updated = { ...samplePlaylist, assetIds: ['asset-2'] };
      (http.delete as ReturnType<typeof vi.fn>).mockResolvedValueOnce(updated);

      const result = await playlists.removeAsset('pl-1', 'asset-1');
      expect(http.delete).toHaveBeenCalledWith('/playlists/pl-1/assets/asset-1');
      expect(result.assetIds).not.toContain('asset-1');
    });
  });

  describe('delete', () => {
    it('deletes /playlists/:id', async () => {
      (http.delete as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true });

      const result = await playlists.delete('pl-1');
      expect(http.delete).toHaveBeenCalledWith('/playlists/pl-1');
      expect(result.ok).toBe(true);
    });
  });
});
