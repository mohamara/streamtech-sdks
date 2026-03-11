# StreamTech Video Platform — WordPress Plugin

Integrate the **StreamTech** VOD platform into WordPress. Upload, manage, and embed adaptive-bitrate HLS/DASH video streams using shortcodes or the Gutenberg block editor.

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
  - [Upload Videos](#upload-videos)
  - [Asset Library](#asset-library)
  - [Shortcodes](#shortcodes)
  - [Gutenberg Block](#gutenberg-block)
  - [Playlists](#playlists)
- [API Reference](#api-reference)
- [Shortcode Reference](#shortcode-reference)
- [File Structure](#file-structure)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Upload Videos** — Upload files with drag-and-drop, progress tracking, or import from URL
- **Asset Library** — List, view status, copy shortcodes, and delete assets
- **HLS/DASH Player** — Responsive video player powered by [HLS.js](https://github.com/video-dev/hls.js/) with native iOS fallback
- **Playlist Support** — Create and manage playlists with auto-advance playback
- **Transcoding Profiles** — Default (H.264 720p), HEVC, MPEG-2, Audio MP3, Audio AAC
- **Gutenberg Block** — `StreamTech Player` block with sidebar controls
- **Shortcodes** — `[streamtech_player]` and `[streamtech_playlist]` for Classic Editor
- **REST API Proxy** — All admin AJAX operations use authenticated WP REST API endpoints
- **Connection Test** — Verify your API key and server connectivity from the settings page

## Requirements

- WordPress 5.8+
- PHP 7.4+
- A StreamTech platform instance with a valid tenant API key

## Installation

### Manual Upload

1. Download or clone this repository.
2. Copy the `streamtech` folder into `/wp-content/plugins/`.
3. Activate **StreamTech Video Platform** from the WordPress **Plugins** screen.

### From GitHub

```bash
cd wp-content/plugins/
git clone https://github.com/mohamara/streamtech-sdks.git streamtech-sdks
ln -s streamtech-sdks/wordpress/streamtech streamtech
```

## Configuration

1. Navigate to **StreamTech → Settings** in the WordPress admin.
2. Enter your **Platform URL** (e.g. `https://stream.example.com`).
3. Enter your **API Key** (starts with `sk_`).
4. Choose a **Default Transcoding Profile** for new uploads.
5. Click **Save Changes**.
6. Click **Test Connection** to verify everything works.

## Usage

### Upload Videos

1. Go to **StreamTech → Upload**.
2. **Drag & drop** a video file onto the upload zone, or click **Choose File**.
3. Optionally set a title, folder, and transcoding profile.
4. Monitor the progress bar — when complete, you'll see the asset ID and a ready-to-copy shortcode.

Alternatively, use **Import from URL** to have StreamTech download and transcode a video from a public URL.

### Asset Library

1. Go to **StreamTech → Assets**.
2. Browse your media assets with pagination.
3. Status badges show: `Ready`, `Processing`, `Pending`, or `Failed`.
4. Click the **shortcode icon** to copy the embed shortcode.
5. Click the **trash icon** to permanently delete an asset.

### Shortcodes

Embed a single video:

```
[streamtech_player id="asset-uuid"]
```

Embed by filename:

```
[streamtech_player filename="my-video.mp4" format="hls"]
```

Full options:

```
[streamtech_player id="asset-uuid" width="800" height="450" autoplay="true" muted="true" controls="true" poster="https://example.com/thumb.jpg" class="my-player"]
```

Embed a playlist:

```
[streamtech_playlist id="playlist-uuid" width="100%"]
```

### Gutenberg Block

1. In the block editor, click **+** and search for **StreamTech Player**.
2. Enter the **Asset ID** in the placeholder.
3. Use the **sidebar panel** to configure width, autoplay, muted, and controls.
4. The block is server-side rendered — a live preview appears on the front end.

### Playlists

1. Go to **StreamTech → Playlists**.
2. Click **Create Playlist** and enter a name.
3. Copy the shortcode to embed the playlist player with track list and auto-advance.
4. Manage playlists (add/remove assets) via the StreamTech platform or Node.js SDK.

## API Reference

The plugin registers WP REST API endpoints under `streamtech/v1/`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/assets` | List assets (params: `limit`, `offset`) |
| `GET` | `/assets/{id}` | Get a single asset |
| `DELETE` | `/assets/{id}` | Delete an asset |
| `GET` | `/assets/{id}/playback` | Get playback URLs |
| `POST` | `/upload` | Upload a file (multipart form) |
| `POST` | `/import-url` | Import from URL (JSON body: `url`, `title`) |
| `GET` | `/playlists` | List all playlists |
| `POST` | `/playlists` | Create a playlist (JSON body: `name`, `assetIds`) |
| `GET` | `/playlists/{id}` | Get playlist with playback URLs |
| `PATCH` | `/playlists/{id}` | Update playlist |
| `DELETE` | `/playlists/{id}` | Delete playlist |
| `POST` | `/playlists/{id}/assets/{assetId}` | Add asset to playlist |
| `DELETE` | `/playlists/{id}/assets/{assetId}` | Remove asset from playlist |

All endpoints require the `manage_options` capability and a valid WP REST nonce.

## Shortcode Reference

### `[streamtech_player]`

| Attribute | Default | Description |
|-----------|---------|-------------|
| `id` | — | Asset UUID (**required** unless `filename` is set) |
| `filename` | — | Original filename (alternative to `id`) |
| `format` | `hls` | Preferred format: `hls`, `dash`, or `original` |
| `width` | `100%` | CSS width value |
| `height` | `auto` | CSS height value |
| `autoplay` | `false` | Auto-start playback |
| `muted` | `false` | Start muted |
| `controls` | `true` | Show player controls |
| `poster` | — | Poster image URL |
| `class` | — | Additional CSS class |

### `[streamtech_playlist]`

| Attribute | Default | Description |
|-----------|---------|-------------|
| `id` | — | Playlist UUID (**required**) |
| `width` | `100%` | CSS width value |
| `class` | — | Additional CSS class |

## File Structure

```
streamtech/
├── streamtech.php                  # Main plugin file (singleton bootstrap)
├── readme.txt                      # WordPress.org plugin readme
├── README.md                       # GitHub documentation
├── LICENSE                         # MIT license
├── includes/
│   ├── class-streamtech-client.php     # API client (wp_remote_* wrapper)
│   ├── class-streamtech-admin.php      # Admin menus, settings, asset enqueue
│   ├── class-streamtech-rest-api.php   # WP REST API proxy endpoints
│   ├── class-streamtech-shortcodes.php # [streamtech_player] & [streamtech_playlist]
│   └── class-streamtech-block.php      # Gutenberg block registration
├── admin/
│   ├── css/streamtech-admin.css    # Admin styles
│   ├── js/streamtech-admin.js      # Admin JS (upload, delete, playlists, etc.)
│   └── views/
│       ├── page-settings.php       # Settings page template
│       ├── page-assets.php         # Asset library template
│       ├── page-upload.php         # Upload page template
│       └── page-playlists.php      # Playlists page template
├── public/
│   ├── css/streamtech-player.css   # Front-end player styles
│   └── js/streamtech-player.js     # Front-end HLS.js player init
└── block/
    ├── block.json                  # Block metadata
    ├── index.js                    # Block editor script
    └── editor.css                  # Block editor styles
```

## Contributing

1. Clone the repository:
   ```bash
   git clone https://github.com/mohamara/streamtech-sdks.git
   cd streamtech-sdks/wordpress/streamtech
   ```

2. Set up a local WordPress development environment (e.g. [wp-env](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-env/), Local, or Docker).

3. Symlink or copy the plugin into `wp-content/plugins/`.

4. Activate and configure with your StreamTech instance.

## License

[MIT](LICENSE)
