import { HttpClient } from '../http';
import type { BrowseResult } from '../types';

export class BucketResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Browse files and folders in your dedicated storage bucket.
   * Navigate into subfolders by passing their prefix.
   *
   * @param prefix - Folder prefix to browse into (e.g. "movies/action/")
   *
   * @example
   * // List root
   * const root = await client.bucket.browse();
   *
   * // Navigate into a subfolder
   * const sub = await client.bucket.browse('movies/action/');
   */
  async browse(prefix?: string): Promise<BrowseResult> {
    const params: Record<string, string> = {};
    if (prefix) params.prefix = prefix;
    return this.http.get<BrowseResult>('/tenant/browse', params);
  }
}
