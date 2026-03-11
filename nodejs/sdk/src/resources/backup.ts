import { createWriteStream } from 'fs';
import FormData from 'form-data';
import { createReadStream, statSync } from 'fs';
import { basename } from 'path';
import { HttpClient } from '../http';
import type { BackupInfo, RestoreResult } from '../types';

export class BackupResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Get info about your storage bucket (file count, total size).
   *
   * @example
   * const info = await client.backup.info();
   * console.log(`${info.total_files} files, ${info.total_size} bytes`);
   */
  async info(): Promise<BackupInfo> {
    return this.http.get<BackupInfo>('/tenant/backup/info');
  }

  /**
   * Download your entire bucket as a tar.gz archive to a local file.
   *
   * @param outputPath - Local path to save the archive
   *
   * @example
   * await client.backup.download('/tmp/my-backup.tar.gz');
   */
  async download(outputPath: string): Promise<void> {
    const response = await this.http.axios.get('/tenant/backup/download', {
      responseType: 'stream',
      timeout: 0,
      headers: { 'X-API-Key': this.http.apiKey },
    });

    const writer = createWriteStream(outputPath);
    return new Promise((resolve, reject) => {
      response.data.pipe(writer);
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }

  /**
   * Restore your bucket from a tar.gz backup archive.
   *
   * @param archivePath - Path to the tar.gz file to restore
   *
   * @example
   * const result = await client.backup.restore('/tmp/my-backup.tar.gz');
   * console.log(`Restored ${result.uploaded_files} files`);
   */
  async restore(archivePath: string): Promise<RestoreResult> {
    const stat = statSync(archivePath);
    const stream = createReadStream(archivePath);
    const form = new FormData();
    form.append('file', stream, {
      filename: basename(archivePath),
      knownLength: stat.size,
    });

    return this.http.post<RestoreResult>('/tenant/backup/upload', form, {
      headers: form.getHeaders(),
      timeout: 0,
    });
  }
}
