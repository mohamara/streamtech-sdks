import { HttpClient } from '../http';
import type { Playlist, PlaylistWithPlayback } from '../types';

export class PlaylistsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Create a new playlist.
   *
   * @param name - Playlist name
   * @param assetIds - Optional initial list of asset UUIDs
   *
   * @example
   * const playlist = await client.playlists.create('My Playlist', ['asset-id-1', 'asset-id-2']);
   */
  async create(name: string, assetIds?: string[]): Promise<Playlist> {
    return this.http.post<Playlist>('/playlists', {
      name,
      assetIds: assetIds ?? [],
    });
  }

  /**
   * List all playlists.
   */
  async list(): Promise<Playlist[]> {
    return this.http.get<Playlist[]>('/playlists');
  }

  /**
   * Get a playlist by ID.
   */
  async get(id: string): Promise<Playlist> {
    return this.http.get<Playlist>(`/playlists/${id}`);
  }

  /**
   * Get a playlist with resolved playback URLs for each asset.
   *
   * @example
   * const playlist = await client.playlists.withPlayback('playlist-id');
   * playlist.assets.forEach(a => console.log(a.hls_url));
   */
  async withPlayback(id: string): Promise<PlaylistWithPlayback> {
    return this.http.get<PlaylistWithPlayback>(`/playlists/${id}/with-playback`);
  }

  /**
   * Update a playlist's name and/or asset list.
   */
  async update(
    id: string,
    name?: string,
    assetIds?: string[],
  ): Promise<Playlist> {
    const body: Record<string, unknown> = {};
    if (name !== undefined) body.name = name;
    if (assetIds !== undefined) body.assetIds = assetIds;
    return this.http.patch<Playlist>(`/playlists/${id}`, body);
  }

  /**
   * Add an asset to a playlist.
   */
  async addAsset(playlistId: string, assetId: string): Promise<Playlist> {
    return this.http.post<Playlist>(
      `/playlists/${playlistId}/assets/${assetId}`,
    );
  }

  /**
   * Remove an asset from a playlist.
   */
  async removeAsset(playlistId: string, assetId: string): Promise<Playlist> {
    return this.http.delete<Playlist>(
      `/playlists/${playlistId}/assets/${assetId}`,
    );
  }

  /**
   * Delete a playlist.
   */
  async delete(id: string): Promise<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`/playlists/${id}`);
  }
}
