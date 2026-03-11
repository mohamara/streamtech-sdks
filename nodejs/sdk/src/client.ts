import { HttpClient } from './http';
import { AssetsResource } from './resources/assets';
import { UploadResource } from './resources/upload';
import { PlaybackResource } from './resources/playback';
import { BucketResource } from './resources/bucket';
import { BackupResource } from './resources/backup';
import { PlaylistsResource } from './resources/playlists';
import type { StreamTechConfig } from './types';

/**
 * StreamTech SDK client for tenant API access.
 *
 * @example
 * ```ts
 * import { StreamTech } from '@streamtech/sdk';
 *
 * const client = new StreamTech({
 *   baseUrl: 'https://stream.example.com',
 *   apiKey: 'sk_your_api_key_here',
 * });
 *
 * // Upload a file
 * const result = await client.upload.file('/path/to/video.mp4', {
 *   title: 'My Video',
 * });
 *
 * // Wait for transcoding to finish
 * const asset = await client.assets.waitUntilReady(result.id);
 *
 * // Get playback URLs
 * const playback = await client.playback.get(asset.id);
 * console.log(playback.hls_url);
 * ```
 */
export class StreamTech {
  private readonly http: HttpClient;

  /** Manage your media assets (list, get, delete, wait for ready) */
  public readonly assets: AssetsResource;

  /** Upload media files or import from URL */
  public readonly upload: UploadResource;

  /** Get playback URLs for your assets */
  public readonly playback: PlaybackResource;

  /** Browse your storage bucket */
  public readonly bucket: BucketResource;

  /** Backup and restore your storage */
  public readonly backup: BackupResource;

  /** Manage playlists */
  public readonly playlists: PlaylistsResource;

  constructor(config: StreamTechConfig) {
    if (!config.baseUrl) throw new Error('baseUrl is required');
    if (!config.apiKey) throw new Error('apiKey is required');

    this.http = new HttpClient(config);
    this.assets = new AssetsResource(this.http);
    this.upload = new UploadResource(this.http, config.chunkSize);
    this.playback = new PlaybackResource(this.http);
    this.bucket = new BucketResource(this.http);
    this.backup = new BackupResource(this.http);
    this.playlists = new PlaylistsResource(this.http);
  }
}
