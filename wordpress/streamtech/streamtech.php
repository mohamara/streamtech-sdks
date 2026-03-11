<?php
/**
 * Plugin Name:       StreamTech Video Platform
 * Plugin URI:        https://github.com/mohamara/streamtech-sdks/tree/main/wordpress/streamtech
 * Description:       Integrate StreamTech VOD platform into WordPress. Upload, manage, and embed HLS/DASH video streams with shortcodes and Gutenberg blocks.
 * Version:           1.0.0
 * Requires at least: 5.8
 * Requires PHP:      7.4
 * Author:            StreamTech
 * Author URI:        https://github.com/mohamara
 * License:           MIT
 * License URI:       https://opensource.org/licenses/MIT
 * Text Domain:       streamtech
 * Domain Path:       /languages
 */

defined( 'ABSPATH' ) || exit;

define( 'STREAMTECH_VERSION', '1.0.0' );
define( 'STREAMTECH_PLUGIN_FILE', __FILE__ );
define( 'STREAMTECH_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'STREAMTECH_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'STREAMTECH_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

require_once STREAMTECH_PLUGIN_DIR . 'includes/class-streamtech-client.php';
require_once STREAMTECH_PLUGIN_DIR . 'includes/class-streamtech-admin.php';
require_once STREAMTECH_PLUGIN_DIR . 'includes/class-streamtech-shortcodes.php';
require_once STREAMTECH_PLUGIN_DIR . 'includes/class-streamtech-rest-api.php';
require_once STREAMTECH_PLUGIN_DIR . 'includes/class-streamtech-block.php';

/**
 * Main plugin class — singleton.
 */
final class StreamTech_Plugin {

    private static ?self $instance = null;

    public static function instance(): self {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action( 'init', [ $this, 'load_textdomain' ] );

        if ( is_admin() ) {
            new StreamTech_Admin();
        }

        new StreamTech_Shortcodes();
        new StreamTech_REST_API();
        new StreamTech_Block();
    }

    public function load_textdomain(): void {
        load_plugin_textdomain( 'streamtech', false, dirname( STREAMTECH_PLUGIN_BASENAME ) . '/languages' );
    }

    /**
     * Return a configured API client, or null when credentials are missing.
     */
    public static function client(): ?StreamTech_Client {
        $base_url = get_option( 'streamtech_base_url', '' );
        $api_key  = get_option( 'streamtech_api_key', '' );

        if ( empty( $base_url ) || empty( $api_key ) ) {
            return null;
        }

        return new StreamTech_Client( $base_url, $api_key );
    }
}

register_activation_hook( __FILE__, function () {
    add_option( 'streamtech_base_url', '' );
    add_option( 'streamtech_api_key', '' );
    add_option( 'streamtech_default_profile', 'default' );
    add_option( 'streamtech_player_theme', 'default' );
    flush_rewrite_rules();
} );

register_deactivation_hook( __FILE__, function () {
    flush_rewrite_rules();
} );

StreamTech_Plugin::instance();
