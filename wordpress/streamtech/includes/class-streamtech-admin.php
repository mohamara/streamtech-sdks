<?php
/**
 * Admin menus, settings registration, and page rendering.
 *
 * @package StreamTech
 */

defined( 'ABSPATH' ) || exit;

class StreamTech_Admin {

	public function __construct() {
		add_action( 'admin_menu', [ $this, 'register_menus' ] );
		add_action( 'admin_init', [ $this, 'register_settings' ] );
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_assets' ] );
		add_filter( 'plugin_action_links_' . STREAMTECH_PLUGIN_BASENAME, [ $this, 'action_links' ] );
	}

	/* ───────── Menus ───────── */

	public function register_menus(): void {
		add_menu_page(
			__( 'StreamTech', 'streamtech' ),
			__( 'StreamTech', 'streamtech' ),
			'manage_options',
			'streamtech',
			[ $this, 'render_assets_page' ],
			'dashicons-video-alt3',
			26
		);

		add_submenu_page(
			'streamtech',
			__( 'Assets', 'streamtech' ),
			__( 'Assets', 'streamtech' ),
			'manage_options',
			'streamtech',
			[ $this, 'render_assets_page' ]
		);

		add_submenu_page(
			'streamtech',
			__( 'Upload', 'streamtech' ),
			__( 'Upload', 'streamtech' ),
			'manage_options',
			'streamtech-upload',
			[ $this, 'render_upload_page' ]
		);

		add_submenu_page(
			'streamtech',
			__( 'Playlists', 'streamtech' ),
			__( 'Playlists', 'streamtech' ),
			'manage_options',
			'streamtech-playlists',
			[ $this, 'render_playlists_page' ]
		);

		add_submenu_page(
			'streamtech',
			__( 'Settings', 'streamtech' ),
			__( 'Settings', 'streamtech' ),
			'manage_options',
			'streamtech-settings',
			[ $this, 'render_settings_page' ]
		);
	}

	/* ───────── Settings ───────── */

	public function register_settings(): void {
		register_setting( 'streamtech_settings', 'streamtech_base_url', [
			'type'              => 'string',
			'sanitize_callback' => 'esc_url_raw',
		] );
		register_setting( 'streamtech_settings', 'streamtech_api_key', [
			'type'              => 'string',
			'sanitize_callback' => 'sanitize_text_field',
		] );
		register_setting( 'streamtech_settings', 'streamtech_default_profile', [
			'type'              => 'string',
			'sanitize_callback' => 'sanitize_text_field',
			'default'           => 'default',
		] );
		register_setting( 'streamtech_settings', 'streamtech_player_theme', [
			'type'              => 'string',
			'sanitize_callback' => 'sanitize_text_field',
			'default'           => 'default',
		] );
	}

	/* ───────── Assets ───────── */

	public function enqueue_assets( string $hook ): void {
		if ( strpos( $hook, 'streamtech' ) === false ) {
			return;
		}

		wp_enqueue_style(
			'streamtech-admin',
			STREAMTECH_PLUGIN_URL . 'admin/css/streamtech-admin.css',
			[],
			STREAMTECH_VERSION
		);

		wp_enqueue_script(
			'streamtech-admin',
			STREAMTECH_PLUGIN_URL . 'admin/js/streamtech-admin.js',
			[ 'jquery' ],
			STREAMTECH_VERSION,
			true
		);

		wp_localize_script( 'streamtech-admin', 'streamtechAdmin', [
			'restUrl'  => rest_url( 'streamtech/v1/' ),
			'nonce'    => wp_create_nonce( 'wp_rest' ),
			'adminUrl' => admin_url( 'admin.php' ),
		] );
	}

	/* ───────── Action links ───────── */

	public function action_links( array $links ): array {
		$settings = sprintf(
			'<a href="%s">%s</a>',
			admin_url( 'admin.php?page=streamtech-settings' ),
			__( 'Settings', 'streamtech' )
		);
		array_unshift( $links, $settings );
		return $links;
	}

	/* ───────── Page renderers ───────── */

	public function render_settings_page(): void {
		include STREAMTECH_PLUGIN_DIR . 'admin/views/page-settings.php';
	}

	public function render_assets_page(): void {
		include STREAMTECH_PLUGIN_DIR . 'admin/views/page-assets.php';
	}

	public function render_upload_page(): void {
		include STREAMTECH_PLUGIN_DIR . 'admin/views/page-upload.php';
	}

	public function render_playlists_page(): void {
		include STREAMTECH_PLUGIN_DIR . 'admin/views/page-playlists.php';
	}
}
