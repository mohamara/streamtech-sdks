<?php defined( 'ABSPATH' ) || exit; ?>

<div class="wrap streamtech-wrap">
	<h1 class="wp-heading-inline"><?php esc_html_e( 'Playlists', 'streamtech' ); ?></h1>
	<button type="button" class="page-title-action" id="streamtech-create-playlist-btn">
		<?php esc_html_e( 'Create Playlist', 'streamtech' ); ?>
	</button>
	<hr class="wp-header-end" />

	<?php
	$client = StreamTech_Plugin::client();
	if ( ! $client ) {
		printf(
			'<div class="notice notice-warning"><p>%s <a href="%s">%s</a></p></div>',
			esc_html__( 'StreamTech is not configured.', 'streamtech' ),
			esc_url( admin_url( 'admin.php?page=streamtech-settings' ) ),
			esc_html__( 'Go to Settings', 'streamtech' )
		);
		return;
	}

	$playlists = $client->list_playlists();
	if ( ! empty( $playlists['error'] ) ) {
		printf( '<div class="notice notice-error"><p>%s</p></div>', esc_html( $playlists['message'] ) );
		$playlists = [];
	}
	// list_playlists returns an array directly (not wrapped in a key)
	if ( isset( $playlists['error'] ) ) {
		$playlists = [];
	}
	?>

	<!-- Create playlist modal -->
	<div id="streamtech-playlist-modal" class="streamtech-modal" style="display:none;">
		<div class="streamtech-modal__backdrop"></div>
		<div class="streamtech-modal__content">
			<h2><?php esc_html_e( 'Create Playlist', 'streamtech' ); ?></h2>
			<table class="form-table">
				<tr>
					<th><label for="st-pl-name"><?php esc_html_e( 'Name', 'streamtech' ); ?></label></th>
					<td><input type="text" id="st-pl-name" class="regular-text" /></td>
				</tr>
			</table>
			<p>
				<button type="button" class="button button-primary" id="streamtech-playlist-save"><?php esc_html_e( 'Create', 'streamtech' ); ?></button>
				<button type="button" class="button streamtech-modal-close"><?php esc_html_e( 'Cancel', 'streamtech' ); ?></button>
			</p>
		</div>
	</div>

	<table class="wp-list-table widefat fixed striped" id="streamtech-playlists-table">
		<thead>
			<tr>
				<th style="width:30%"><?php esc_html_e( 'Name', 'streamtech' ); ?></th>
				<th style="width:15%"><?php esc_html_e( 'Assets', 'streamtech' ); ?></th>
				<th style="width:20%"><?php esc_html_e( 'Created', 'streamtech' ); ?></th>
				<th style="width:20%"><?php esc_html_e( 'Shortcode', 'streamtech' ); ?></th>
				<th style="width:15%"><?php esc_html_e( 'Actions', 'streamtech' ); ?></th>
			</tr>
		</thead>
		<tbody>
			<?php if ( empty( $playlists ) ) : ?>
				<tr>
					<td colspan="5"><?php esc_html_e( 'No playlists found.', 'streamtech' ); ?></td>
				</tr>
			<?php else : ?>
				<?php foreach ( $playlists as $pl ) : ?>
					<tr data-id="<?php echo esc_attr( $pl['id'] ); ?>">
						<td>
							<strong><?php echo esc_html( $pl['name'] ); ?></strong>
							<div class="row-actions">
								<span class="id" style="color:#999;font-size:11px;"><?php echo esc_html( $pl['id'] ); ?></span>
							</div>
						</td>
						<td><?php echo count( $pl['assetIds'] ?? [] ); ?></td>
						<td><?php echo esc_html( date_i18n( get_option( 'date_format' ), strtotime( $pl['createdAt'] ) ) ); ?></td>
						<td>
							<code class="streamtech-shortcode-text">[streamtech_playlist id="<?php echo esc_attr( $pl['id'] ); ?>"]</code>
						</td>
						<td>
							<button type="button" class="button button-small streamtech-copy-shortcode"
							        data-shortcode='[streamtech_playlist id="<?php echo esc_attr( $pl['id'] ); ?>"]'
							        title="<?php esc_attr_e( 'Copy Shortcode', 'streamtech' ); ?>">
								<span class="dashicons dashicons-clipboard"></span>
							</button>
							<button type="button" class="button button-small button-link-delete streamtech-delete-playlist"
							        data-id="<?php echo esc_attr( $pl['id'] ); ?>"
							        title="<?php esc_attr_e( 'Delete', 'streamtech' ); ?>">
								<span class="dashicons dashicons-trash"></span>
							</button>
						</td>
					</tr>
				<?php endforeach; ?>
			<?php endif; ?>
		</tbody>
	</table>
</div>
