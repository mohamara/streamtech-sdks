import { randomUUID } from 'crypto';
import FormData from 'form-data';
import { createReadStream, statSync } from 'fs';
import { basename } from 'path';
import { HttpClient } from '../http';
import type {
  UploadOptions,
  UploadResult,
  ImportUrlOptions,
  ImportUrlResult,
  ChunkProgress,
  ProgressCallback,
} from '../types';

const DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB

export class UploadResource {
  private readonly chunkSize: number;

  constructor(
    private readonly http: HttpClient,
    chunkSize?: number,
  ) {
    this.chunkSize = chunkSize ?? DEFAULT_CHUNK_SIZE;
  }

  /**
   * Upload a media file from a Buffer.
   *
   * @example
   * const result = await client.upload.buffer(fileBuffer, 'video.mp4', {
   *   title: 'My Video',
   *   profile: 'default',
   * });
   */
  async buffer(
    data: Buffer,
    filename: string,
    options: UploadOptions = {},
    onProgress?: ProgressCallback,
  ): Promise<UploadResult> {
    const form = new FormData();
    form.append('file', data, { filename });
    if (options.title) form.append('title', options.title);
    if (options.folder) form.append('folder', options.folder);
    if (options.profile) form.append('profile', options.profile);

    return this.http.post<UploadResult>('/tenant/upload', form, {
      headers: form.getHeaders(),
      onUploadProgress: onProgress
        ? (e: { loaded?: number; total?: number }) => {
            const loaded = e.loaded ?? 0;
            const total = e.total ?? data.length;
            onProgress({ loaded, total, percent: Math.round((loaded / total) * 100) });
          }
        : undefined,
    });
  }

  /**
   * Upload a media file from a local file path.
   *
   * @example
   * const result = await client.upload.file('/path/to/video.mp4', {
   *   title: 'My Video',
   *   profile: 'hevc',
   * });
   */
  async file(
    filePath: string,
    options: UploadOptions = {},
    onProgress?: ProgressCallback,
  ): Promise<UploadResult> {
    const stat = statSync(filePath);
    const filename = basename(filePath);

    if (stat.size > this.chunkSize) {
      return this.chunkedFile(filePath, options, onProgress);
    }

    const stream = createReadStream(filePath);
    const form = new FormData();
    form.append('file', stream, { filename, knownLength: stat.size });
    if (options.title) form.append('title', options.title);
    if (options.folder) form.append('folder', options.folder);
    if (options.profile) form.append('profile', options.profile);

    return this.http.post<UploadResult>('/tenant/upload', form, {
      headers: form.getHeaders(),
      onUploadProgress: onProgress
        ? (e: { loaded?: number; total?: number }) => {
            const loaded = e.loaded ?? 0;
            onProgress({ loaded, total: stat.size, percent: Math.round((loaded / stat.size) * 100) });
          }
        : undefined,
    });
  }

  /**
   * Upload a large file in chunks. Automatically splits the file and sends
   * each chunk sequentially. Returns the final result when all chunks are assembled.
   *
   * @example
   * const result = await client.upload.chunkedFile('/path/to/large-video.mp4', {
   *   title: 'Large Video',
   * }, (progress) => {
   *   console.log(`${progress.percent}%`);
   * });
   */
  async chunkedFile(
    filePath: string,
    options: UploadOptions = {},
    onProgress?: ProgressCallback,
  ): Promise<UploadResult> {
    const stat = statSync(filePath);
    const filename = basename(filePath);
    const totalSize = stat.size;
    const totalChunks = Math.ceil(totalSize / this.chunkSize);
    const uploadId = randomUUID();

    let lastResult: ChunkProgress | (ChunkProgress & UploadResult) | undefined;

    for (let i = 0; i < totalChunks; i++) {
      const start = i * this.chunkSize;
      const end = Math.min(start + this.chunkSize, totalSize);

      const stream = createReadStream(filePath, { start, end: end - 1 });
      const form = new FormData();
      form.append('chunk', stream, {
        filename,
        knownLength: end - start,
      });
      form.append('uploadId', uploadId);
      form.append('chunkIndex', String(i));
      form.append('totalChunks', String(totalChunks));
      form.append('filename', filename);
      if (options.title) form.append('title', options.title);
      if (options.folder) form.append('folder', options.folder);
      if (options.profile) form.append('profile', options.profile);

      lastResult = await this.http.post<ChunkProgress>('/tenant/upload-chunk', form, {
        headers: form.getHeaders(),
      });

      if (onProgress) {
        onProgress({
          loaded: end,
          total: totalSize,
          percent: Math.round((end / totalSize) * 100),
        });
      }
    }

    return lastResult as unknown as UploadResult;
  }

  /**
   * Upload a Buffer in chunks. Useful when you have the file in memory
   * but it's too large for a single request.
   */
  async chunkedBuffer(
    data: Buffer,
    filename: string,
    options: UploadOptions = {},
    onProgress?: ProgressCallback,
  ): Promise<UploadResult> {
    const totalSize = data.length;
    const totalChunks = Math.ceil(totalSize / this.chunkSize);
    const uploadId = randomUUID();

    let lastResult: ChunkProgress | undefined;

    for (let i = 0; i < totalChunks; i++) {
      const start = i * this.chunkSize;
      const end = Math.min(start + this.chunkSize, totalSize);
      const chunk = data.subarray(start, end);

      const form = new FormData();
      form.append('chunk', chunk, { filename });
      form.append('uploadId', uploadId);
      form.append('chunkIndex', String(i));
      form.append('totalChunks', String(totalChunks));
      form.append('filename', filename);
      if (options.title) form.append('title', options.title);
      if (options.folder) form.append('folder', options.folder);
      if (options.profile) form.append('profile', options.profile);

      lastResult = await this.http.post<ChunkProgress>('/tenant/upload-chunk', form, {
        headers: form.getHeaders(),
      });

      if (onProgress) {
        onProgress({
          loaded: end,
          total: totalSize,
          percent: Math.round((end / totalSize) * 100),
        });
      }
    }

    return lastResult as unknown as UploadResult;
  }

  /**
   * Import media from a public URL. The system downloads and transcodes it automatically.
   *
   * @example
   * const result = await client.upload.fromUrl({
   *   url: 'https://example.com/video.mp4',
   *   title: 'Imported Video',
   *   profile: 'default',
   * });
   */
  async fromUrl(options: ImportUrlOptions): Promise<ImportUrlResult> {
    return this.http.post<ImportUrlResult>('/tenant/import-url', {
      url: options.url,
      title: options.title,
      folder: options.folder,
      profile: options.profile,
    });
  }
}
