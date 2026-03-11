<?php defined( 'ABSPATH' ) || exit; ?>

<div class="wrap streamtech-wrap">
	<h1><?php esc_html_e( 'Upload Video', 'streamtech' ); ?></h1>

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
	$default_profile = get_option( 'streamtech_default_profile', 'default' );
	?>

	<!-- File Upload -->
	<div class="streamtech-card" id="streamtech-upload-card">
		<h2><?php esc_html_e( 'Upload from File', 'streamtech' ); ?></h2>

		<div class="streamtech-upload-zone" id="streamtech-dropzone">
			<div class="streamtech-upload-zone__inner">
				<span class="dashicons dashicons-upload"></span>
				<p><?php esc_html_e( 'Drag & drop a video file here, or click to browse', 'streamtech' ); ?></p>
				<input type="file" id="streamtech-file-input" accept="video/*,audio/*" style="display:none" />
				<button type="button" class="button button-primary" id="streamtech-browse-btn">
					<?php esc_html_e( 'Choose File', 'streamtech' ); ?>
				</button>
			</div>
		</div>

		<div class="streamtech-upload-fields" style="margin-top:16px;">
			<table class="form-table">
				<tr>
					<th><label for="st-upload-title"><?php esc_html_e( 'Title', 'streamtech' ); ?></label></th>
					<td><input type="text" id="st-upload-title" class="regular-text" placeholder="<?php esc_attr_e( 'Auto-detected from filename', 'streamtech' ); ?>" /></td>
				</tr>
				<tr>
					<th><label for="st-upload-folder"><?php esc_html_e( 'Folder', 'streamtech' ); ?></label></th>
					<td><input type="text" id="st-upload-folder" class="regular-text" placeholder="e.g. movies/action" /></td>
				</tr>
				<tr>
					<th><label for="st-upload-profile"><?php esc_html_e( 'Profile', 'streamtech' ); ?></label></th>
					<td>
						<select id="st-upload-profile">
							<option value="default" <?php selected( $default_profile, 'default' ); ?>>Default (H.264 720p)</option>
							<option value="hevc" <?php selected( $default_profile, 'hevc' ); ?>>HEVC (H.265)</option>
							<option value="mpeg2" <?php selected( $default_profile, 'mpeg2' ); ?>>MPEG-2</option>
							<option value="audio_mp3" <?php selected( $default_profile, 'audio_mp3' ); ?>>Audio MP3</option>
							<option value="audio_aac" <?php selected( $default_profile, 'audio_aac' ); ?>>Audio AAC</option>
						</select>
					</td>
				</tr>
			</table>
		</div>

		<div id="streamtech-upload-progress" style="display:none;margin-top:16px;">
			<div class="streamtech-progress">
				<div class="streamtech-progress__bar" id="streamtech-progress-bar"></div>
			</div>
			<p id="streamtech-progress-text"></p>
		</div>

		<div id="streamtech-upload-result" style="display:none;margin-top:16px;"></div>
	</div>

	<!-- URL Import -->
	<div class="streamtech-card" style="margin-top:24px;">
		<h2><?php esc_html_e( 'Import from URL', 'streamtech' ); ?></h2>

		<table class="form-table">
			<tr>
				<th><label for="st-import-url"><?php esc_html_e( 'Video URL', 'streamtech' ); ?></label></th>
				<td><input type="url" id="st-import-url" class="regular-text" placeholder="https://example.com/video.mp4" /></td>
			</tr>
			<tr>
				<th><label for="st-import-title"><?php esc_html_e( 'Title', 'streamtech' ); ?></label></th>
				<td><input type="text" id="st-import-title" class="regular-text" /></td>
			</tr>
		</table>

		<p>
			<button type="button" class="button button-primary" id="streamtech-import-btn">
				<?php esc_html_e( 'Import', 'streamtech' ); ?>
			</button>
			<span id="streamtech-import-result" style="margin-left:10px;"></span>
		</p>
	</div>
</div>
