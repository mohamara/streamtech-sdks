<?php
/**
 * Front-end shortcodes for embedding StreamTech video players.
 *
 * Usage:
 *   [streamtech_player id="asset-uuid"]
 *   [streamtech_player id="asset-uuid" width="800" height="450" autoplay="true"]
 *   [streamtech_player filename="my-video.mp4" format="hls"]
 *   [streamtech_playlist id="playlist-uuid"]
 *
 * @package StreamTech
 */

defined( 'ABSPATH' ) || exit;

class StreamTech_Shortcodes {

	private bool $assets_enqueued = false;

	public function __construct() {
		add_shortcode( 'streamtech_player', [ $this, 'render_player' ] );
		add_shortcode( 'streamtech_playlist', [ $this, 'render_playlist' ] );
	}

	/**
	 * [streamtech_player] — single video player.
	 */
	public function render_player( $atts ): string {
		$atts = shortcode_atts( [
			'id'       => '',
			'filename' => '',
			'format'   => 'hls',
			'width'    => '100%',
			'height'   => 'auto',
			'autoplay' => 'false',
			'muted'    => 'false',
			'controls' => 'true',
			'poster'   => '',
			'class'    => '',
		], $atts, 'streamtech_player' );

		$client = StreamTech_Plugin::client();
		if ( ! $client ) {
			return '<!-- StreamTech: plugin not configured -->';
		}

		if ( $atts['id'] ) {
			$playback = $client->get_playback( $atts['id'] );
		} elseif ( $atts['filename'] ) {
			$playback = $client->get_playback_by_filename( $atts['filename'], $atts['format'] );
		} else {
			return '<!-- StreamTech: id or filename required -->';
		}

		if ( ! empty( $playback['error'] ) ) {
			return '<!-- StreamTech: ' . esc_html( $playback['message'] ?? 'playback error' ) . ' -->';
		}

		$this->enqueue_player_assets();

		$src = '';
		if ( 'dash' === $atts['format'] && ! empty( $playback['dash_url'] ) ) {
			$src = $playback['dash_url'];
		} elseif ( ! empty( $playback['hls_url'] ) ) {
			$src = $playback['hls_url'];
		}

		if ( ! $src ) {
			return '<!-- StreamTech: no playback URL available -->';
		}

		$uid       = 'st-' . wp_unique_id();
		$autoplay  = filter_var( $atts['autoplay'], FILTER_VALIDATE_BOOLEAN );
		$muted     = filter_var( $atts['muted'], FILTER_VALIDATE_BOOLEAN );
		$controls  = filter_var( $atts['controls'], FILTER_VALIDATE_BOOLEAN );
		$css_class = 'streamtech-player' . ( $atts['class'] ? ' ' . esc_attr( $atts['class'] ) : '' );

		$width_style  = is_numeric( $atts['width'] ) ? $atts['width'] . 'px' : $atts['width'];
		$height_style = is_numeric( $atts['height'] ) ? $atts['height'] . 'px' : $atts['height'];

		$video_attrs  = sprintf( 'id="%s"', esc_attr( $uid ) );
		$video_attrs .= $controls ? ' controls' : '';
		$video_attrs .= $autoplay ? ' autoplay' : '';
		$video_attrs .= $muted ? ' muted' : '';
		$video_attrs .= ' playsinline';
		if ( $atts['poster'] ) {
			$video_attrs .= sprintf( ' poster="%s"', esc_url( $atts['poster'] ) );
		}

		$html  = sprintf( '<div class="%s" style="max-width:%s">', esc_attr( $css_class ), esc_attr( $width_style ) );
		$html .= sprintf(
			'<video %s style="width:100%%;height:%s" data-streamtech-src="%s"></video>',
			$video_attrs,
			esc_attr( $height_style ),
			esc_url( $src )
		);
		$html .= '</div>';

		return $html;
	}

	/**
	 * [streamtech_playlist] — renders a playlist with a player and track list.
	 */
	public function render_playlist( $atts ): string {
		$atts = shortcode_atts( [
			'id'    => '',
			'width' => '100%',
			'class' => '',
		], $atts, 'streamtech_playlist' );

		if ( ! $atts['id'] ) {
			return '<!-- StreamTech: playlist id required -->';
		}

		$client = StreamTech_Plugin::client();
		if ( ! $client ) {
			return '<!-- StreamTech: plugin not configured -->';
		}

		$playlist = $client->get_playlist_with_playback( $atts['id'] );
		if ( ! empty( $playlist['error'] ) || empty( $playlist['assets'] ) ) {
			return '<!-- StreamTech: playlist not found or empty -->';
		}

		$this->enqueue_player_assets();

		$uid       = 'st-pl-' . wp_unique_id();
		$css_class = 'streamtech-playlist' . ( $atts['class'] ? ' ' . esc_attr( $atts['class'] ) : '' );
		$width     = is_numeric( $atts['width'] ) ? $atts['width'] . 'px' : $atts['width'];

		$html  = sprintf( '<div class="%s" style="max-width:%s" id="%s">', esc_attr( $css_class ), esc_attr( $width ), esc_attr( $uid ) );
		$html .= '<video id="' . esc_attr( $uid ) . '-video" controls playsinline style="width:100%"></video>';
		$html .= '<div class="streamtech-playlist__tracks">';

		foreach ( $playlist['assets'] as $i => $asset ) {
			$src = $asset['hls_url'] ?? $asset['dash_url'] ?? '';
			if ( ! $src ) {
				continue;
			}
			$active = 0 === $i ? ' streamtech-playlist__track--active' : '';
			$html  .= sprintf(
				'<button class="streamtech-playlist__track%s" data-src="%s">%s</button>',
				$active,
				esc_url( $src ),
				esc_html( $asset['title'] ?? $asset['slug'] ?? "Track " . ( $i + 1 ) )
			);
		}

		$html .= '</div></div>';

		return $html;
	}

	private function enqueue_player_assets(): void {
		if ( $this->assets_enqueued ) {
			return;
		}
		$this->assets_enqueued = true;

		wp_enqueue_script(
			'hls-js',
			'https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js',
			[],
			null,
			true
		);

		wp_enqueue_style(
			'streamtech-player',
			STREAMTECH_PLUGIN_URL . 'public/css/streamtech-player.css',
			[],
			STREAMTECH_VERSION
		);

		wp_enqueue_script(
			'streamtech-player',
			STREAMTECH_PLUGIN_URL . 'public/js/streamtech-player.js',
			[ 'hls-js' ],
			STREAMTECH_VERSION,
			true
		);
	}
}
