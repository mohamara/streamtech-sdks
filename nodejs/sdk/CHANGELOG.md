# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-03-11

### Added

- **Assets**: List, get, delete, and poll assets until ready (`waitUntilReady`).
- **Upload**: Upload files from path, Buffer, or URL. Auto-chunked uploads for large files with progress tracking.
- **Playback**: Retrieve HLS, DASH, and original playback URLs by asset ID or filename.
- **Bucket**: Browse storage bucket folders and files.
- **Backup**: Download full bucket backup as tar.gz archive and restore from archive.
- **Playlists**: Full CRUD for playlists with asset management and playback URL resolution.
- **HTTP layer**: Automatic retry with exponential backoff for transient errors (408, 429, 5xx).
- **Error handling**: Typed error classes (`AuthenticationError`, `ForbiddenError`, `NotFoundError`, `ValidationError`).
- **TypeScript**: Full type definitions for all request/response shapes.
