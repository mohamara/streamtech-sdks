<?php defined( 'ABSPATH' ) || exit; ?>

<div class="wrap streamtech-wrap">
	<h1 class="wp-heading-inline"><?php esc_html_e( 'Assets', 'streamtech' ); ?></h1>
	<a href="<?php echo esc_url( admin_url( 'admin.php?page=streamtech-upload' ) ); ?>" class="page-title-action">
		<?php esc_html_e( 'Upload New', 'streamtech' ); ?>
	</a>
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

	$limit  = 20;
	$paged  = max( 1, absint( $_GET['paged'] ?? 1 ) );
	$offset = ( $paged - 1 ) * $limit;

	$response = $client->list_assets( $limit, $offset );
	if ( ! empty( $response['error'] ) ) {
		printf( '<div class="notice notice-error"><p>%s</p></div>', esc_html( $response['message'] ) );
		return;
	}

	$items = $response['items'] ?? [];
	$total = $response['total'] ?? 0;
	$pages = max( 1, ceil( $total / $limit ) );
	?>

	<p class="streamtech-summary">
		<?php printf( esc_html__( '%d total assets', 'streamtech' ), $total ); ?>
	</p>

	<table class="wp-list-table widefat fixed striped" id="streamtech-assets-table">
		<thead>
			<tr>
				<th style="width:30%"><?php esc_html_e( 'Title', 'streamtech' ); ?></th>
				<th style="width:15%"><?php esc_html_e( 'Status', 'streamtech' ); ?></th>
				<th style="width:20%"><?php esc_html_e( 'Filename', 'streamtech' ); ?></th>
				<th style="width:10%"><?php esc_html_e( 'Duration', 'streamtech' ); ?></th>
				<th style="width:15%"><?php esc_html_e( 'Created', 'streamtech' ); ?></th>
				<th style="width:10%"><?php esc_html_e( 'Actions', 'streamtech' ); ?></th>
			</tr>
		</thead>
		<tbody>
			<?php if ( empty( $items ) ) : ?>
				<tr>
					<td colspan="6"><?php esc_html_e( 'No assets found.', 'streamtech' ); ?></td>
				</tr>
			<?php else : ?>
				<?php foreach ( $items as $asset ) : ?>
					<tr data-id="<?php echo esc_attr( $asset['id'] ); ?>">
						<td>
							<strong><?php echo esc_html( $asset['title'] ); ?></strong>
							<div class="row-actions">
								<span class="id" style="color:#999;font-size:11px;"><?php echo esc_html( $asset['id'] ); ?></span>
							</div>
						</td>
						<td>
							<?php
							$status_class = 'streamtech-status--' . $asset['status'];
							printf(
								'<span class="streamtech-status %s">%s</span>',
								esc_attr( $status_class ),
								esc_html( ucfirst( $asset['status'] ) )
							);
							?>
						</td>
						<td><?php echo esc_html( $asset['original_filename'] ?? '—' ); ?></td>
						<td>
							<?php
							if ( $asset['duration_sec'] ) {
								$m = floor( $asset['duration_sec'] / 60 );
								$s = $asset['duration_sec'] % 60;
								printf( '%d:%02d', $m, $s );
							} else {
								echo '—';
							}
							?>
						</td>
						<td><?php echo esc_html( date_i18n( get_option( 'date_format' ), strtotime( $asset['created_at'] ) ) ); ?></td>
						<td>
							<div class="streamtech-actions">
								<?php if ( 'ready' === $asset['status'] ) : ?>
									<button type="button" class="button button-small streamtech-copy-shortcode"
									        data-shortcode='[streamtech_player id="<?php echo esc_attr( $asset['id'] ); ?>"]'
									        title="<?php esc_attr_e( 'Copy Shortcode', 'streamtech' ); ?>">
										<span class="dashicons dashicons-shortcode"></span>
									</button>
								<?php endif; ?>
								<button type="button" class="button button-small button-link-delete streamtech-delete-asset"
								        data-id="<?php echo esc_attr( $asset['id'] ); ?>"
								        title="<?php esc_attr_e( 'Delete', 'streamtech' ); ?>">
									<span class="dashicons dashicons-trash"></span>
								</button>
							</div>
						</td>
					</tr>
				<?php endforeach; ?>
			<?php endif; ?>
		</tbody>
	</table>

	<?php if ( $pages > 1 ) : ?>
		<div class="tablenav bottom">
			<div class="tablenav-pages">
				<?php
				echo paginate_links( [
					'base'      => add_query_arg( 'paged', '%#%' ),
					'format'    => '',
					'current'   => $paged,
					'total'     => $pages,
					'prev_text' => '&laquo;',
					'next_text' => '&raquo;',
				] );
				?>
			</div>
		</div>
	<?php endif; ?>
</div>
