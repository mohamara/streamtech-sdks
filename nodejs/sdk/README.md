# @streamtech/sdk

[![npm version](https://img.shields.io/npm/v/@streamtech/sdk.svg)](https://www.npmjs.com/package/@streamtech/sdk)
[![license](https://img.shields.io/npm/l/@streamtech/sdk.svg)](https://github.com/AvaPlus/streamtech-sdks/blob/main/nodejs/sdk/LICENSE)
[![node](https://img.shields.io/node/v/@streamtech/sdk.svg)](https://nodejs.org)

Official Node.js / TypeScript client SDK for the **StreamTech** VOD infrastructure platform. Provides a simple, type-safe API for tenants to manage media assets, uploads, playback, storage, and playlists.

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [API Reference](#api-reference)
  - [Assets](#assets--clientassets)
  - [Upload](#upload--clientupload)
  - [Playback](#playback--clientplayback)
  - [Bucket](#bucket--clientbucket)
  - [Backup](#backup--clientbackup)
  - [Playlists](#playlists--clientplaylists)
- [Error Handling](#error-handling)
- [Transcoding Profiles](#transcoding-profiles)
- [TypeScript](#typescript)
- [Contributing](#contributing)
- [License](#license)

## Requirements

- **Node.js** >= 16.0.0
- A StreamTech platform instance with a valid tenant API key

## Installation

```bash
npm install @streamtech/sdk
```

```bash
yarn add @streamtech/sdk
```

```bash
pnpm add @streamtech/sdk
```

## Quick Start

```typescript
import { StreamTech } from '@streamtech/sdk';

const client = new StreamTech({
  baseUrl: 'https://stream.example.com',
  apiKey: 'sk_your_api_key_here',
});

// Upload a video
const result = await client.upload.file('./video.mp4', {
  title: 'My Video',
  profile: 'default',
});

// Wait for transcoding to finish
const asset = await client.assets.waitUntilReady(result.id);

// Get playback URLs
const playback = await client.playback.get(asset.id);
console.log(playback.hls_url);
```

## Configuration

```typescript
const client = new StreamTech({
  baseUrl: 'https://stream.example.com',  // StreamTech server URL (required)
  apiKey: 'sk_...',                        // Your tenant API key (required)
  timeout: 60000,                          // Request timeout in ms (default: 60000)
  retries: 3,                              // Retry attempts for failed requests (default: 3)
  chunkSize: 5 * 1024 * 1024,             // Chunk size for large uploads (default: 5MB)
});
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `baseUrl` | `string` | — | StreamTech server URL (**required**) |
| `apiKey` | `string` | — | Tenant API key (**required**) |
| `timeout` | `number` | `60000` | Request timeout in milliseconds |
| `retries` | `number` | `3` | Number of retry attempts for transient failures |
| `chunkSize` | `number` | `5242880` | Chunk size in bytes for large file uploads |

The SDK automatically retries requests that fail with status codes `408`, `429`, `500`, `502`, `503`, or `504` using exponential backoff.

## API Reference

### Assets — `client.assets`

```typescript
// List assets with pagination
const { items, total } = await client.assets.list({ limit: 10, offset: 0 });

// Get a single asset by ID
const asset = await client.assets.get('asset-uuid');

// Delete an asset and all its associated files
await client.assets.delete('asset-uuid');

// Wait for transcoding to finish (polls automatically)
const ready = await client.assets.waitUntilReady('asset-uuid');
// Optional: custom polling interval (ms) and timeout (ms)
const ready = await client.assets.waitUntilReady('asset-uuid', 5000, 300_000);
```

### Upload — `client.upload`

```typescript
// Upload from file path (auto-detects large files for chunked upload)
const result = await client.upload.file('/path/to/video.mp4', {
  title: 'My Video',
  folder: 'movies/action',
  profile: 'default',
});

// Upload from Buffer
import { readFileSync } from 'fs';
const buf = readFileSync('./video.mp4');
const result = await client.upload.buffer(buf, 'video.mp4', {
  title: 'My Video',
});

// Upload with progress tracking
const result = await client.upload.file('./large-video.mp4', {}, (progress) => {
  console.log(`${progress.percent}% (${progress.loaded}/${progress.total} bytes)`);
});

// Explicit chunked upload (for very large files)
const result = await client.upload.chunkedFile('./huge-video.mp4', {
  title: 'Huge Video',
}, (progress) => {
  console.log(`${progress.percent}%`);
});

// Upload a large Buffer in chunks
const result = await client.upload.chunkedBuffer(largeBuffer, 'video.mp4', {
  title: 'Chunked Buffer Upload',
});

// Import from a public URL
const result = await client.upload.fromUrl({
  url: 'https://example.com/video.mp4',
  title: 'Imported Video',
  profile: 'hevc',
});
```

### Playback — `client.playback`

```typescript
// Get playback URLs by asset ID
const playback = await client.playback.get('asset-uuid');
console.log(playback.hls_url);       // HLS manifest URL
console.log(playback.dash_url);      // DASH manifest URL
console.log(playback.original_url);  // Direct link to original file

// Get playback by original filename
const playback = await client.playback.byFilename('intro.mp4', 'hls');
console.log(playback.primary_url);   // Preferred URL based on requested format
```

### Bucket — `client.bucket`

```typescript
// Browse root of your storage bucket
const root = await client.bucket.browse();
console.log(root.folders); // [{ name: 'movies', prefix: 'movies/' }]
console.log(root.files);   // [{ key: 'intro.mp4', name: 'intro.mp4', size: 1234567, ... }]

// Browse a subfolder
const sub = await client.bucket.browse('movies/action/');
```

### Backup — `client.backup`

```typescript
// Get storage info (file count, total size)
const info = await client.backup.info();
console.log(`${info.total_files} files, ${info.total_size} bytes`);

// Download full backup as tar.gz archive
await client.backup.download('/tmp/backup.tar.gz');

// Restore from a backup archive
const result = await client.backup.restore('/tmp/backup.tar.gz');
console.log(`Restored ${result.uploaded_files} files (${result.skipped} skipped)`);
```

### Playlists — `client.playlists`

```typescript
// Create a playlist
const playlist = await client.playlists.create('My Playlist', ['asset-1', 'asset-2']);

// List all playlists
const playlists = await client.playlists.list();

// Get a single playlist
const pl = await client.playlists.get('playlist-id');

// Get playlist with resolved playback URLs for each asset
const withUrls = await client.playlists.withPlayback('playlist-id');
withUrls.assets.forEach(a => console.log(a.hls_url));

// Update playlist name and/or asset list
await client.playlists.update('playlist-id', 'New Name', ['asset-2', 'asset-3']);

// Add / remove individual assets
await client.playlists.addAsset('playlist-id', 'asset-3');
await client.playlists.removeAsset('playlist-id', 'asset-1');

// Delete a playlist
await client.playlists.delete('playlist-id');
```

## Error Handling

The SDK throws typed errors that you can catch and handle granularly:

```typescript
import {
  StreamTechError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '@streamtech/sdk';

try {
  const asset = await client.assets.get('non-existent-id');
} catch (err) {
  if (err instanceof NotFoundError) {
    // 404 — asset does not exist
    console.log('Asset not found');
  } else if (err instanceof AuthenticationError) {
    // 401 — invalid or missing API key
    console.log('Invalid API key');
  } else if (err instanceof ForbiddenError) {
    // 403 — asset belongs to another tenant
    console.log('Access denied');
  } else if (err instanceof ValidationError) {
    // 400 — bad request data
    console.log('Validation error:', err.message);
  } else if (err instanceof StreamTechError) {
    // Any other API error
    console.log(`Error ${err.status}: ${err.message}`);
    console.log('Response data:', err.data);
  }
}
```

| Error Class | HTTP Status | When |
|-------------|-------------|------|
| `AuthenticationError` | 401 | Invalid or missing API key |
| `ForbiddenError` | 403 | Resource belongs to another tenant |
| `NotFoundError` | 404 | Resource does not exist |
| `ValidationError` | 400 | Invalid request data |
| `StreamTechError` | Any | Base class for all API errors |

## Transcoding Profiles

| Profile | Video Codec | Audio Codec | Output Formats |
|---------|-------------|-------------|----------------|
| `default` | H.264 720p | AAC | HLS, DASH |
| `hevc` | H.265 | AAC | HLS, DASH |
| `mpeg2` | MPEG-2 | AAC | HLS |
| `audio_mp3` | — | MP3 | HLS |
| `audio_aac` | — | AAC | HLS, DASH |

## TypeScript

The SDK is written in TypeScript and ships with full type definitions. All request/response types are exported:

```typescript
import type {
  // Configuration
  StreamTechConfig,
  TranscodeProfile,

  // Assets
  Asset,
  AssetList,
  AssetStatus,
  PaginationOptions,
  PlaybackEntry,

  // Upload
  UploadOptions,
  UploadResult,
  ChunkProgress,
  ImportUrlOptions,
  ImportUrlResult,
  UploadProgressEvent,
  ProgressCallback,

  // Playback
  PlaybackFormat,
  PlaybackInfo,

  // Bucket
  BucketFolder,
  BucketFile,
  BrowseResult,

  // Backup
  BackupInfo,
  RestoreResult,

  // Playlists
  Playlist,
  PlaylistWithPlayback,
} from '@streamtech/sdk';
```

## Contributing

1. Clone the repository:
   ```bash
   git clone https://github.com/AvaPlus/streamtech-sdks.git
   cd streamtech-sdks/nodejs/sdk
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run tests:
   ```bash
   npm test
   ```

4. Run tests in watch mode:
   ```bash
   npm run test:watch
   ```

5. Build:
   ```bash
   npm run build
   ```

6. Type-check without emitting:
   ```bash
   npm run typecheck
   ```

## License

[MIT](LICENSE)
