<?php
/**
 * Gutenberg block: streamtech/video-player.
 *
 * @package StreamTech
 */

defined( 'ABSPATH' ) || exit;

class StreamTech_Block {

	public function __construct() {
		add_action( 'init', [ $this, 'register_block' ] );
	}

	public function register_block(): void {
		if ( ! function_exists( 'register_block_type' ) ) {
			return;
		}

		wp_register_script(
			'streamtech-block-editor',
			STREAMTECH_PLUGIN_URL . 'block/index.js',
			[ 'wp-blocks', 'wp-element', 'wp-components', 'wp-block-editor', 'wp-i18n' ],
			STREAMTECH_VERSION,
			true
		);

		wp_register_style(
			'streamtech-block-editor',
			STREAMTECH_PLUGIN_URL . 'block/editor.css',
			[ 'wp-edit-blocks' ],
			STREAMTECH_VERSION
		);

		register_block_type( STREAMTECH_PLUGIN_DIR . 'block', [
			'editor_script'   => 'streamtech-block-editor',
			'editor_style'    => 'streamtech-block-editor',
			'render_callback' => [ $this, 'render_block' ],
		] );
	}

	/**
	 * Server-side render: reuses the shortcode renderer.
	 */
	public function render_block( array $attributes ): string {
		$atts = [
			'id'       => $attributes['assetId'] ?? '',
			'width'    => $attributes['width'] ?? '100%',
			'autoplay' => ! empty( $attributes['autoplay'] ) ? 'true' : 'false',
			'muted'    => ! empty( $attributes['muted'] ) ? 'true' : 'false',
			'controls' => ( $attributes['controls'] ?? true ) ? 'true' : 'false',
		];

		$shortcodes = new StreamTech_Shortcodes();
		return $shortcodes->render_player( $atts );
	}
}
