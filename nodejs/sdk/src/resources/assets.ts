import { HttpClient } from '../http';
import type { Asset, AssetList, PaginationOptions } from '../types';

export class AssetsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * List all your media assets with pagination.
   *
   * @example
   * const { items, total } = await client.assets.list({ limit: 10, offset: 0 });
   */
  async list(options: PaginationOptions = {}): Promise<AssetList> {
    const { limit = 20, offset = 0 } = options;
    return this.http.get<AssetList>('/tenant/assets', { limit, offset });
  }

  /**
   * Get detailed information about a specific asset.
   *
   * @param id - Asset UUID
   */
  async get(id: string): Promise<Asset> {
    return this.http.get<Asset>(`/tenant/assets/${id}`);
  }

  /**
   * Delete an asset and all its associated files.
   *
   * @param id - Asset UUID
   */
  async delete(id: string): Promise<{ ok: boolean; deleted: string }> {
    return this.http.delete<{ ok: boolean; deleted: string }>(
      `/tenant/assets/${id}`,
    );
  }

  /**
   * Wait for an asset to finish transcoding.
   * Polls the asset status until it reaches 'ready' or 'failed'.
   *
   * @param id - Asset UUID
   * @param intervalMs - Polling interval in milliseconds (default: 3000)
   * @param timeoutMs - Maximum wait time in milliseconds (default: 600000 = 10 min)
   */
  async waitUntilReady(
    id: string,
    intervalMs = 3000,
    timeoutMs = 600_000,
  ): Promise<Asset> {
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      const asset = await this.get(id);
      if (asset.status === 'ready' || asset.status === 'failed') {
        return asset;
      }
      await new Promise((r) => setTimeout(r, intervalMs));
    }

    throw new Error(
      `Asset ${id} did not become ready within ${timeoutMs / 1000}s`,
    );
  }
}
