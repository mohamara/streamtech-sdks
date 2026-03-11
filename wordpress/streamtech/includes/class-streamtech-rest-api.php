<?php
/**
 * WP REST API endpoints — proxy between admin JS and the StreamTech platform.
 *
 * @package StreamTech
 */

defined( 'ABSPATH' ) || exit;

class StreamTech_REST_API {

	private const NAMESPACE = 'streamtech/v1';

	public function __construct() {
		add_action( 'rest_api_init', [ $this, 'register_routes' ] );
	}

	public function register_routes(): void {
		/* ── Assets ── */
		register_rest_route( self::NAMESPACE, '/assets', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'list_assets' ],
			'permission_callback' => [ $this, 'can_manage' ],
		] );

		register_rest_route( self::NAMESPACE, '/assets/(?P<id>[a-zA-Z0-9\-]+)', [
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'get_asset' ],
				'permission_callback' => [ $this, 'can_manage' ],
			],
			[
				'methods'             => 'DELETE',
				'callback'            => [ $this, 'delete_asset' ],
				'permission_callback' => [ $this, 'can_manage' ],
			],
		] );

		/* ── Playback ── */
		register_rest_route( self::NAMESPACE, '/assets/(?P<id>[a-zA-Z0-9\-]+)/playback', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'get_playback' ],
			'permission_callback' => [ $this, 'can_manage' ],
		] );

		/* ── Upload ── */
		register_rest_route( self::NAMESPACE, '/upload', [
			'methods'             => 'POST',
			'callback'            => [ $this, 'upload_file' ],
			'permission_callback' => [ $this, 'can_manage' ],
		] );

		register_rest_route( self::NAMESPACE, '/import-url', [
			'methods'             => 'POST',
			'callback'            => [ $this, 'import_url' ],
			'permission_callback' => [ $this, 'can_manage' ],
		] );

		/* ── Folders ── */
		register_rest_route( self::NAMESPACE, '/folders', [
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'list_folders' ],
				'permission_callback' => [ $this, 'can_manage' ],
			],
			[
				'methods'             => 'POST',
				'callback'            => [ $this, 'create_folder' ],
				'permission_callback' => [ $this, 'can_manage' ],
			],
		] );

		register_rest_route( self::NAMESPACE, '/folders/(?P<id>[a-zA-Z0-9\-]+)', [
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'get_folder' ],
				'permission_callback' => [ $this, 'can_manage' ],
			],
			[
				'methods'             => 'PUT',
				'callback'            => [ $this, 'update_folder' ],
				'permission_callback' => [ $this, 'can_manage' ],
			],
			[
				'methods'             => 'DELETE',
				'callback'            => [ $this, 'delete_folder' ],
				'permission_callback' => [ $this, 'can_manage' ],
			],
		] );

		register_rest_route( self::NAMESPACE, '/folders/(?P<id>[a-zA-Z0-9\-]+)/move', [
			'methods'             => 'POST',
			'callback'            => [ $this, 'move_folder' ],
			'permission_callback' => [ $this, 'can_manage' ],
		] );

		register_rest_route( self::NAMESPACE, '/assets/(?P<id>[a-zA-Z0-9\-]+)/move', [
			'methods'             => 'POST',
			'callback'            => [ $this, 'move_asset' ],
			'permission_callback' => [ $this, 'can_manage' ],
		] );

		/* ── Playlists ── */
		register_rest_route( self::NAMESPACE, '/playlists', [
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'list_playlists' ],
				'permission_callback' => [ $this, 'can_manage' ],
			],
			[
				'methods'             => 'POST',
				'callback'            => [ $this, 'create_playlist' ],
				'permission_callback' => [ $this, 'can_manage' ],
			],
		] );

		register_rest_route( self::NAMESPACE, '/playlists/(?P<id>[a-zA-Z0-9\-]+)', [
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'get_playlist' ],
				'permission_callback' => [ $this, 'can_manage' ],
			],
			[
				'methods'             => 'PATCH',
				'callback'            => [ $this, 'update_playlist' ],
				'permission_callback' => [ $this, 'can_manage' ],
			],
			[
				'methods'             => 'DELETE',
				'callback'            => [ $this, 'delete_playlist' ],
				'permission_callback' => [ $this, 'can_manage' ],
			],
		] );

		register_rest_route( self::NAMESPACE, '/playlists/(?P<id>[a-zA-Z0-9\-]+)/assets/(?P<asset_id>[a-zA-Z0-9\-]+)', [
			[
				'methods'             => 'POST',
				'callback'            => [ $this, 'add_asset_to_playlist' ],
				'permission_callback' => [ $this, 'can_manage' ],
			],
			[
				'methods'             => 'DELETE',
				'callback'            => [ $this, 'remove_asset_from_playlist' ],
				'permission_callback' => [ $this, 'can_manage' ],
			],
		] );
	}

	/* ───────── Permission ───────── */

	public function can_manage(): bool {
		return current_user_can( 'manage_options' );
	}

	/* ───────── Handlers ───────── */

	public function list_assets( WP_REST_Request $req ): WP_REST_Response {
		$client = $this->client();
		if ( ! $client ) {
			return $this->config_error();
		}

		$limit  = absint( $req->get_param( 'limit' ) ?: 20 );
		$offset = absint( $req->get_param( 'offset' ) ?: 0 );

		return new WP_REST_Response( $client->list_assets( $limit, $offset ) );
	}

	public function get_asset( WP_REST_Request $req ): WP_REST_Response {
		$client = $this->client();
		if ( ! $client ) {
			return $this->config_error();
		}
		return new WP_REST_Response( $client->get_asset( $req['id'] ) );
	}

	public function delete_asset( WP_REST_Request $req ): WP_REST_Response {
		$client = $this->client();
		if ( ! $client ) {
			return $this->config_error();
		}
		return new WP_REST_Response( $client->delete_asset( $req['id'] ) );
	}

	public function get_playback( WP_REST_Request $req ): WP_REST_Response {
		$client = $this->client();
		if ( ! $client ) {
			return $this->config_error();
		}
		return new WP_REST_Response( $client->get_playback( $req['id'] ) );
	}

	public function upload_file( WP_REST_Request $req ): WP_REST_Response {
		$client = $this->client();
		if ( ! $client ) {
			return $this->config_error();
		}

		$files = $req->get_file_params();
		if ( empty( $files['file'] ) ) {
			return new WP_REST_Response( [ 'error' => true, 'message' => 'No file provided.' ], 400 );
		}

		$file    = $files['file'];
		$options = [
			'title'   => $req->get_param( 'title' ) ?: $file['name'],
			'folder'  => $req->get_param( 'folder' ) ?: '',
			'profile' => $req->get_param( 'profile' ) ?: get_option( 'streamtech_default_profile', 'default' ),
		];

		$result = $client->upload_file( $file['tmp_name'], $options );
		$status = ! empty( $result['error'] ) ? 400 : 200;

		return new WP_REST_Response( $result, $status );
	}

	public function import_url( WP_REST_Request $req ): WP_REST_Response {
		$client = $this->client();
		if ( ! $client ) {
			return $this->config_error();
		}

		$url = $req->get_param( 'url' );
		if ( empty( $url ) ) {
			return new WP_REST_Response( [ 'error' => true, 'message' => 'URL is required.' ], 400 );
		}

		$options = array_filter( [
			'title'   => $req->get_param( 'title' ),
			'folder'  => $req->get_param( 'folder' ),
			'profile' => $req->get_param( 'profile' ) ?: get_option( 'streamtech_default_profile', 'default' ),
		] );

		return new WP_REST_Response( $client->import_url( $url, $options ) );
	}

	/* ── Folders ── */

	public function list_folders( WP_REST_Request $req ): WP_REST_Response {
		$client = $this->client();
		if ( ! $client ) {
			return $this->config_error();
		}
		$parent_id = $req->get_param( 'parent_id' ) ?: '';
		$limit     = absint( $req->get_param( 'limit' ) ?: 50 );
		$offset    = absint( $req->get_param( 'offset' ) ?: 0 );
		return new WP_REST_Response( $client->list_folders( $parent_id, $limit, $offset ) );
	}

	public function get_folder( WP_REST_Request $req ): WP_REST_Response {
		$client = $this->client();
		if ( ! $client ) {
			return $this->config_error();
		}
		return new WP_REST_Response( $client->get_folder( $req['id'] ) );
	}

	public function create_folder( WP_REST_Request $req ): WP_REST_Response {
		$client = $this->client();
		if ( ! $client ) {
			return $this->config_error();
		}
		$name      = sanitize_text_field( $req->get_param( 'name' ) ?: '' );
		$parent_id = $req->get_param( 'parent_id' ) ?: '';
		if ( empty( $name ) ) {
			return new WP_REST_Response( [ 'error' => true, 'message' => 'Name is required.' ], 400 );
		}
		return new WP_REST_Response( $client->create_folder( $name, $parent_id ) );
	}

	public function update_folder( WP_REST_Request $req ): WP_REST_Response {
		$client = $this->client();
		if ( ! $client ) {
			return $this->config_error();
		}
		$name = sanitize_text_field( $req->get_param( 'name' ) ?: '' );
		if ( empty( $name ) ) {
			return new WP_REST_Response( [ 'error' => true, 'message' => 'Name is required.' ], 400 );
		}
		return new WP_REST_Response( $client->update_folder( $req['id'], $name ) );
	}

	public function delete_folder( WP_REST_Request $req ): WP_REST_Response {
		$client = $this->client();
		if ( ! $client ) {
			return $this->config_error();
		}
		return new WP_REST_Response( $client->delete_folder( $req['id'] ) );
	}

	public function move_folder( WP_REST_Request $req ): WP_REST_Response {
		$client = $this->client();
		if ( ! $client ) {
			return $this->config_error();
		}
		$parent_id = $req->get_param( 'parent_id' ) ?: '';
		return new WP_REST_Response( $client->move_folder( $req['id'], $parent_id ) );
	}

	public function move_asset( WP_REST_Request $req ): WP_REST_Response {
		$client = $this->client();
		if ( ! $client ) {
			return $this->config_error();
		}
		$folder_id = $req->get_param( 'folder_id' ) ?: '';
		return new WP_REST_Response( $client->move_asset( $req['id'], $folder_id ) );
	}

	/* ── Playlists ── */

	public function list_playlists(): WP_REST_Response {
		$client = $this->client();
		if ( ! $client ) {
			return $this->config_error();
		}
		return new WP_REST_Response( $client->list_playlists() );
	}

	public function get_playlist( WP_REST_Request $req ): WP_REST_Response {
		$client = $this->client();
		if ( ! $client ) {
			return $this->config_error();
		}
		return new WP_REST_Response( $client->get_playlist_with_playback( $req['id'] ) );
	}

	public function create_playlist( WP_REST_Request $req ): WP_REST_Response {
		$client = $this->client();
		if ( ! $client ) {
			return $this->config_error();
		}

		$name      = sanitize_text_field( $req->get_param( 'name' ) ?: '' );
		$asset_ids = $req->get_param( 'assetIds' ) ?: [];

		if ( empty( $name ) ) {
			return new WP_REST_Response( [ 'error' => true, 'message' => 'Name is required.' ], 400 );
		}

		return new WP_REST_Response( $client->create_playlist( $name, $asset_ids ) );
	}

	public function update_playlist( WP_REST_Request $req ): WP_REST_Response {
		$client = $this->client();
		if ( ! $client ) {
			return $this->config_error();
		}

		$data = array_filter( [
			'name'     => $req->get_param( 'name' ),
			'assetIds' => $req->get_param( 'assetIds' ),
		], fn( $v ) => $v !== null );

		return new WP_REST_Response( $client->update_playlist( $req['id'], $data ) );
	}

	public function delete_playlist( WP_REST_Request $req ): WP_REST_Response {
		$client = $this->client();
		if ( ! $client ) {
			return $this->config_error();
		}
		return new WP_REST_Response( $client->delete_playlist( $req['id'] ) );
	}

	public function add_asset_to_playlist( WP_REST_Request $req ): WP_REST_Response {
		$client = $this->client();
		if ( ! $client ) {
			return $this->config_error();
		}
		return new WP_REST_Response( $client->add_asset_to_playlist( $req['id'], $req['asset_id'] ) );
	}

	public function remove_asset_from_playlist( WP_REST_Request $req ): WP_REST_Response {
		$client = $this->client();
		if ( ! $client ) {
			return $this->config_error();
		}
		return new WP_REST_Response( $client->remove_asset_from_playlist( $req['id'], $req['asset_id'] ) );
	}

	/* ───────── Helpers ───────── */

	private function client(): ?StreamTech_Client {
		return StreamTech_Plugin::client();
	}

	private function config_error(): WP_REST_Response {
		return new WP_REST_Response(
			[ 'error' => true, 'message' => 'StreamTech is not configured. Set Base URL and API Key in Settings.' ],
			400
		);
	}
}
