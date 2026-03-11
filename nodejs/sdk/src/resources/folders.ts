import { HttpClient } from '../http';
import type { Folder, FolderListResult, FolderListOptions } from '../types';

export class FoldersResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * List folders and assets at a given level.
   * Omit `parent_id` to list root-level items.
   *
   * @example
   * // List root folders + assets
   * const root = await client.folders.list();
   *
   * // List contents of a specific folder
   * const sub = await client.folders.list({ parent_id: 'folder-uuid' });
   */
  async list(options: FolderListOptions = {}): Promise<FolderListResult> {
    const params: Record<string, string> = {};
    if (options.parent_id) params.parent_id = options.parent_id;
    if (options.limit !== undefined) params.limit = String(options.limit);
    if (options.offset !== undefined) params.offset = String(options.offset);
    return this.http.get<FolderListResult>('/tenant/folders', params);
  }

  /**
   * Get details of a specific folder.
   *
   * @param id - Folder UUID
   */
  async get(id: string): Promise<Folder> {
    return this.http.get<Folder>(`/tenant/folders/${id}`);
  }

  /**
   * Create a new folder.
   *
   * @param name - Folder name
   * @param parentId - Parent folder UUID (omit for root level)
   *
   * @example
   * const folder = await client.folders.create('Movies');
   * const sub = await client.folders.create('Action', folder.id);
   */
  async create(name: string, parentId?: string): Promise<Folder> {
    const body: Record<string, string> = { name };
    if (parentId) body.parent_id = parentId;
    return this.http.post<Folder>('/tenant/folders', body);
  }

  /**
   * Rename a folder.
   *
   * @param id - Folder UUID
   * @param name - New folder name
   */
  async update(id: string, name: string): Promise<{ ok: boolean }> {
    return this.http.put<{ ok: boolean }>(`/tenant/folders/${id}`, { name });
  }

  /**
   * Delete a folder and all its sub-folders.
   * Assets in deleted folders become unfoldered.
   *
   * @param id - Folder UUID
   */
  async delete(id: string): Promise<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`/tenant/folders/${id}`);
  }

  /**
   * Move a folder to a new parent, or to root level.
   *
   * @param id - Folder UUID to move
   * @param parentId - New parent folder UUID (omit or null to move to root)
   *
   * @example
   * // Move into another folder
   * await client.folders.move('folder-id', 'new-parent-id');
   *
   * // Move to root level
   * await client.folders.move('folder-id');
   */
  async move(id: string, parentId?: string): Promise<{ ok: boolean }> {
    const body: Record<string, string> = {};
    if (parentId) body.parent_id = parentId;
    return this.http.post<{ ok: boolean }>(`/tenant/folders/${id}/move`, body);
  }
}
