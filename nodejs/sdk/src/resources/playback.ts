import { HttpClient } from '../http';
import type { PlaybackInfo, PlaybackFormat } from '../types';

export class PlaybackResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Get playback URLs (HLS, DASH, original) for an asset.
   *
   * @param assetId - Asset UUID
   *
   * @example
   * const playback = await client.playback.get('asset-uuid');
   * console.log(playback.hls_url);
   */
  async get(assetId: string): Promise<PlaybackInfo> {
    return this.http.get<PlaybackInfo>(`/tenant/assets/${assetId}/playback`);
  }

  /**
   * Get playback URLs by original filename.
   * Convenient when you don't have the asset ID handy.
   *
   * @param filename - Original filename used during upload (e.g. "my-video.mp4")
   * @param format - Preferred format for the primary_url field
   *
   * @example
   * const playback = await client.playback.byFilename('intro.mp4', 'hls');
   */
  async byFilename(
    filename: string,
    format?: PlaybackFormat,
  ): Promise<PlaybackInfo> {
    const params: Record<string, string> = {};
    if (format) params.format = format;
    return this.http.get<PlaybackInfo>(
      `/tenant/playback/filename/${encodeURIComponent(filename)}`,
      params,
    );
  }
}
