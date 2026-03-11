<?php
/**
 * StreamTech API client — thin wrapper around wp_remote_*().
 *
 * @package StreamTech
 */

defined( 'ABSPATH' ) || exit;

class StreamTech_Client {

	private string $base_url;
	private string $api_key;
	private int    $timeout;

	public function __construct( string $base_url, string $api_key, int $timeout = 60 ) {
		$this->base_url = untrailingslashit( $base_url );
		$this->api_key  = $api_key;
		$this->timeout  = $timeout;
	}

	/* ───────── Assets ───────── */

	public function list_assets( int $limit = 20, int $offset = 0 ): array {
		return $this->get( '/tenant/assets', compact( 'limit', 'offset' ) );
	}

	public function get_asset( string $id ): array {
		return $this->get( "/tenant/assets/{$id}" );
	}

	public function delete_asset( string $id ): array {
		return $this->delete( "/tenant/assets/{$id}" );
	}

	/* ───────── Upload ───────── */

	/**
	 * Upload a file from a local path.
	 *
	 * @param string $file_path  Absolute path to the file.
	 * @param array  $options    Optional keys: title, folder, profile.
	 */
	public function upload_file( string $file_path, array $options = [] ): array {
		$boundary = wp_generate_password( 24, false );
		$filename = basename( $file_path );

		$body  = '';
		$body .= $this->multipart_field( $boundary, 'file', file_get_contents( $file_path ), $filename );
		foreach ( [ 'title', 'folder', 'profile' ] as $key ) {
			if ( ! empty( $options[ $key ] ) ) {
				$body .= $this->multipart_text( $boundary, $key, $options[ $key ] );
			}
		}
		$body .= "--{$boundary}--\r\n";

		return $this->request( 'POST', '/tenant/upload', $body, [
			'Content-Type' => "multipart/form-data; boundary={$boundary}",
		] );
	}

	/**
	 * Import a video from a public URL.
	 */
	public function import_url( string $url, array $options = [] ): array {
		return $this->post( '/tenant/import-url', array_merge( [ 'url' => $url ], $options ) );
	}

	/* ───────── Playback ───────── */

	public function get_playback( string $asset_id ): array {
		return $this->get( "/tenant/assets/{$asset_id}/playback" );
	}

	public function get_playback_by_filename( string $filename, string $format = '' ): array {
		$params = [];
		if ( $format ) {
			$params['format'] = $format;
		}
		return $this->get( '/tenant/playback/filename/' . rawurlencode( $filename ), $params );
	}

	/* ───────── Bucket ───────── */

	public function browse_bucket( string $prefix = '' ): array {
		$params = [];
		if ( $prefix ) {
			$params['prefix'] = $prefix;
		}
		return $this->get( '/tenant/browse', $params );
	}

	/* ───────── Backup ───────── */

	public function backup_info(): array {
		return $this->get( '/tenant/backup/info' );
	}

	/* ───────── Playlists ───────── */

	public function create_playlist( string $name, array $asset_ids = [] ): array {
		return $this->post( '/playlists', [
			'name'     => $name,
			'assetIds' => $asset_ids,
		] );
	}

	public function list_playlists(): array {
		return $this->get( '/playlists' );
	}

	public function get_playlist( string $id ): array {
		return $this->get( "/playlists/{$id}" );
	}

	public function get_playlist_with_playback( string $id ): array {
		return $this->get( "/playlists/{$id}/with-playback" );
	}

	public function update_playlist( string $id, array $data ): array {
		return $this->patch( "/playlists/{$id}", $data );
	}

	public function add_asset_to_playlist( string $playlist_id, string $asset_id ): array {
		return $this->post( "/playlists/{$playlist_id}/assets/{$asset_id}" );
	}

	public function remove_asset_from_playlist( string $playlist_id, string $asset_id ): array {
		return $this->delete( "/playlists/{$playlist_id}/assets/{$asset_id}" );
	}

	public function delete_playlist( string $id ): array {
		return $this->delete( "/playlists/{$id}" );
	}

	/* ───────── HTTP helpers ───────── */

	private function get( string $endpoint, array $params = [] ): array {
		$url = $this->base_url . $endpoint;
		if ( $params ) {
			$url = add_query_arg( $params, $url );
		}
		return $this->request( 'GET', $url );
	}

	private function post( string $endpoint, $body = null ): array {
		return $this->request( 'POST', $endpoint, $body ? wp_json_encode( $body ) : null, [
			'Content-Type' => 'application/json',
		] );
	}

	private function patch( string $endpoint, $body = null ): array {
		return $this->request( 'PATCH', $endpoint, $body ? wp_json_encode( $body ) : null, [
			'Content-Type' => 'application/json',
		] );
	}

	private function delete( string $endpoint ): array {
		return $this->request( 'DELETE', $endpoint );
	}

	private function request( string $method, string $url_or_path, $body = null, array $extra_headers = [] ): array {
		$url = str_starts_with( $url_or_path, 'http' ) ? $url_or_path : $this->base_url . $url_or_path;

		$args = [
			'method'  => $method,
			'timeout' => $this->timeout,
			'headers' => array_merge( [
				'X-API-Key' => $this->api_key,
			], $extra_headers ),
		];

		if ( null !== $body ) {
			$args['body'] = $body;
		}

		$response = wp_remote_request( $url, $args );

		if ( is_wp_error( $response ) ) {
			return [
				'error'   => true,
				'message' => $response->get_error_message(),
			];
		}

		$code = wp_remote_retrieve_response_code( $response );
		$data = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( $code >= 400 ) {
			return [
				'error'   => true,
				'status'  => $code,
				'message' => $data['error'] ?? $data['message'] ?? "HTTP {$code}",
				'data'    => $data,
			];
		}

		return $data ?? [];
	}

	/* ───────── Multipart helpers ───────── */

	private function multipart_field( string $boundary, string $name, string $content, string $filename ): string {
		$out  = "--{$boundary}\r\n";
		$out .= "Content-Disposition: form-data; name=\"{$name}\"; filename=\"{$filename}\"\r\n";
		$out .= "Content-Type: application/octet-stream\r\n\r\n";
		$out .= $content . "\r\n";
		return $out;
	}

	private function multipart_text( string $boundary, string $name, string $value ): string {
		$out  = "--{$boundary}\r\n";
		$out .= "Content-Disposition: form-data; name=\"{$name}\"\r\n\r\n";
		$out .= $value . "\r\n";
		return $out;
	}
}
