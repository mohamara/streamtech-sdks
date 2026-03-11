=== StreamTech Video Platform ===
Contributors: streamtech
Tags: video, streaming, hls, dash, vod, transcoding, media, player
Requires at least: 5.8
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.0.0
License: MIT
License URI: https://opensource.org/licenses/MIT

Integrate StreamTech VOD platform into WordPress. Upload, manage, and embed HLS/DASH video streams.

== Description ==

**StreamTech Video Platform** connects your WordPress site to a StreamTech VOD infrastructure instance. Upload videos directly from the WordPress admin, manage your media library, and embed adaptive-bitrate HLS/DASH players in posts and pages using shortcodes or the Gutenberg block.

= Features =

* **Upload Videos** — Upload media files from the admin dashboard or import from a URL.
* **Asset Library** — Browse, search, and manage all your transcoded video assets.
* **HLS/DASH Player** — Embed a responsive video player powered by HLS.js with a simple shortcode or Gutenberg block.
* **Playlist Support** — Create playlists, manage tracks, and embed playlist players with auto-advance.
* **Transcoding Profiles** — Choose from Default (H.264), HEVC, MPEG-2, Audio MP3, or Audio AAC.
* **Gutenberg Block** — Native block editor support for embedding videos.
* **Shortcodes** — `[streamtech_player]` and `[streamtech_playlist]` for classic editor users.
* **REST API** — All admin operations go through WP REST API endpoints with nonce authentication.

= Requirements =

* A running StreamTech platform instance
* A valid tenant API key

== Installation ==

1. Upload the `streamtech` folder to `/wp-content/plugins/`.
2. Activate the plugin through the **Plugins** menu.
3. Go to **StreamTech → Settings** and enter your Platform URL and API Key.
4. Start uploading videos and embedding players!

== Frequently Asked Questions ==

= Where do I get an API key? =

Your StreamTech platform administrator provides tenant API keys. They typically start with `sk_`.

= What video formats are supported? =

StreamTech accepts most common video and audio formats. Uploaded files are automatically transcoded into HLS and/or DASH streams based on the selected profile.

= Can I customize the player? =

Yes. The shortcode supports attributes for `width`, `height`, `autoplay`, `muted`, `controls`, `poster`, and a custom CSS `class`. You can also override styles via your theme's CSS.

= Does the player work on mobile? =

Yes. On iOS Safari, native HLS playback is used. On all other browsers, HLS.js provides adaptive streaming.

== Changelog ==

= 1.0.0 =
* Initial release.
* Asset management (list, delete).
* File upload with drag-and-drop and progress bar.
* URL import.
* HLS.js-powered video player shortcode.
* Playlist shortcode with auto-advance.
* Gutenberg block for embedding videos.
* Settings page with connection test.
* WP REST API proxy endpoints.

== Screenshots ==

1. Settings page with connection test.
2. Asset library with status badges and shortcode copy.
3. Upload page with drag-and-drop zone.
4. Video player embedded via shortcode.
