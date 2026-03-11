// ─── Client Configuration ────────────────────────────────────────────────────

export interface StreamTechConfig {
  /** Base URL of the StreamTech platform (e.g. "https://stream.example.com") */
  baseUrl: string;
  /** Your tenant API key (starts with "sk_") */
  apiKey: string;
  /** Request timeout in milliseconds (default: 60000) */
  timeout?: number;
  /** Number of retry attempts for failed requests (default: 3) */
  retries?: number;
  /** Chunk size in bytes for chunked uploads (default: 5MB) */
  chunkSize?: number;
}

// ─── Transcoding Profiles ────────────────────────────────────────────────────

export type TranscodeProfile =
  | 'default'
  | 'hevc'
  | 'mpeg2'
  | 'audio_mp3'
  | 'audio_aac';

// ─── Asset ───────────────────────────────────────────────────────────────────

export type AssetStatus = 'pending' | 'processing' | 'ready' | 'failed';

export interface PlaybackEntry {
  kind: 'hls' | 'dash';
  url: string;
}

export interface Asset {
  id: string;
  title: string;
  slug: string;
  status: AssetStatus;
  duration_sec: number | null;
  original_filename: string;
  original_url?: string;
  created_at: string;
  playbacks: PlaybackEntry[];
}

export interface AssetList {
  items: Asset[];
  total: number;
  limit: number;
  offset: number;
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

// ─── Upload ──────────────────────────────────────────────────────────────────

export interface UploadOptions {
  title?: string;
  folder?: string;
  profile?: TranscodeProfile;
}

export interface UploadResult {
  ok: boolean;
  message: string;
  id: string;
  title: string;
  slug: string;
  original_filename?: string;
  profile: string;
  bucket_name?: string;
}

export interface ChunkProgress {
  ok: boolean;
  chunk: number;
  total: number;
  done?: boolean;
  id?: string;
}

export interface ImportUrlOptions {
  url: string;
  title?: string;
  folder?: string;
  profile?: TranscodeProfile;
}

export interface ImportUrlResult {
  ok: boolean;
  message: string;
  id: string;
  title: string;
  slug: string;
  url: string;
  profile: string;
}

// ─── Playback ────────────────────────────────────────────────────────────────

export type PlaybackFormat = 'hls' | 'dash' | 'original';

export interface PlaybackInfo {
  asset_id: string;
  status: string;
  hls_url: string;
  dash_url: string;
  original_url?: string;
  original_filename?: string;
  primary_url?: string;
}

// ─── Bucket / Browse ─────────────────────────────────────────────────────────

export interface BucketFolder {
  name: string;
  prefix: string;
}

export interface BucketFile {
  key: string;
  name: string;
  size: number;
  last_modified: string;
}

export interface BrowseResult {
  bucket_name: string;
  prefix: string;
  folders: BucketFolder[];
  files: BucketFile[];
}

// ─── Backup ──────────────────────────────────────────────────────────────────

export interface BackupInfo {
  bucket_name: string;
  key_name: string;
  total_files: number;
  total_size: number;
}

export interface RestoreResult {
  ok: boolean;
  message: string;
  bucket_name: string;
  uploaded_files: number;
  uploaded_size: number;
  skipped: number;
}

// ─── Playlist ────────────────────────────────────────────────────────────────

export interface Playlist {
  id: string;
  name: string;
  assetIds: string[];
  createdAt: string;
}

export interface PlaylistWithPlayback extends Playlist {
  assets: Array<{
    id: string;
    title: string;
    slug: string;
    status: string;
    hls_url?: string;
    dash_url?: string;
  }>;
}

// ─── Errors ──────────────────────────────────────────────────────────────────

export interface StreamTechErrorData {
  status: number;
  message: string;
  data?: unknown;
}

// ─── Events ──────────────────────────────────────────────────────────────────

export interface UploadProgressEvent {
  /** Bytes sent so far */
  loaded: number;
  /** Total bytes to send */
  total: number;
  /** Progress percentage (0-100) */
  percent: number;
}

export type ProgressCallback = (progress: UploadProgressEvent) => void;
