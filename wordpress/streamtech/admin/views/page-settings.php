<?php defined( 'ABSPATH' ) || exit; ?>

<div class="wrap streamtech-wrap">
	<h1><?php esc_html_e( 'StreamTech Settings', 'streamtech' ); ?></h1>

	<form method="post" action="options.php">
		<?php settings_fields( 'streamtech_settings' ); ?>

		<table class="form-table" role="presentation">
			<tr>
				<th scope="row">
					<label for="streamtech_base_url"><?php esc_html_e( 'Platform URL', 'streamtech' ); ?></label>
				</th>
				<td>
					<input type="url" id="streamtech_base_url" name="streamtech_base_url"
					       value="<?php echo esc_attr( get_option( 'streamtech_base_url' ) ); ?>"
					       class="regular-text" placeholder="https://stream.example.com" />
					<p class="description"><?php esc_html_e( 'Base URL of your StreamTech instance.', 'streamtech' ); ?></p>
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label for="streamtech_api_key"><?php esc_html_e( 'API Key', 'streamtech' ); ?></label>
				</th>
				<td>
					<input type="password" id="streamtech_api_key" name="streamtech_api_key"
					       value="<?php echo esc_attr( get_option( 'streamtech_api_key' ) ); ?>"
					       class="regular-text" placeholder="sk_..." autocomplete="off" />
					<p class="description"><?php esc_html_e( 'Your tenant API key (starts with sk_).', 'streamtech' ); ?></p>
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label for="streamtech_default_profile"><?php esc_html_e( 'Default Profile', 'streamtech' ); ?></label>
				</th>
				<td>
					<?php $profile = get_option( 'streamtech_default_profile', 'default' ); ?>
					<select id="streamtech_default_profile" name="streamtech_default_profile">
						<option value="default" <?php selected( $profile, 'default' ); ?>>Default (H.264 720p)</option>
						<option value="hevc" <?php selected( $profile, 'hevc' ); ?>>HEVC (H.265)</option>
						<option value="mpeg2" <?php selected( $profile, 'mpeg2' ); ?>>MPEG-2</option>
						<option value="audio_mp3" <?php selected( $profile, 'audio_mp3' ); ?>>Audio MP3</option>
						<option value="audio_aac" <?php selected( $profile, 'audio_aac' ); ?>>Audio AAC</option>
					</select>
					<p class="description"><?php esc_html_e( 'Transcoding profile used for new uploads.', 'streamtech' ); ?></p>
				</td>
			</tr>
			<tr>
				<th scope="row">
					<label for="streamtech_player_theme"><?php esc_html_e( 'Player Theme', 'streamtech' ); ?></label>
				</th>
				<td>
					<?php $theme = get_option( 'streamtech_player_theme', 'default' ); ?>
					<select id="streamtech_player_theme" name="streamtech_player_theme">
						<option value="default" <?php selected( $theme, 'default' ); ?>>Default</option>
						<option value="minimal" <?php selected( $theme, 'minimal' ); ?>>Minimal</option>
						<option value="dark" <?php selected( $theme, 'dark' ); ?>>Dark</option>
					</select>
				</td>
			</tr>
		</table>

		<?php submit_button(); ?>
	</form>

	<hr />
	<h2><?php esc_html_e( 'Connection Test', 'streamtech' ); ?></h2>
	<p>
		<button type="button" id="streamtech-test-connection" class="button button-secondary">
			<?php esc_html_e( 'Test Connection', 'streamtech' ); ?>
		</button>
		<span id="streamtech-test-result" style="margin-left:10px;"></span>
	</p>

	<hr />
	<h2><?php esc_html_e( 'Shortcode Reference', 'streamtech' ); ?></h2>
	<table class="widefat striped" style="max-width:700px">
		<thead>
			<tr><th>Shortcode</th><th>Description</th></tr>
		</thead>
		<tbody>
			<tr>
				<td><code>[streamtech_player id="UUID"]</code></td>
				<td>Embed a single video player by asset ID.</td>
			</tr>
			<tr>
				<td><code>[streamtech_player filename="video.mp4"]</code></td>
				<td>Embed by original filename.</td>
			</tr>
			<tr>
				<td><code>[streamtech_playlist id="UUID"]</code></td>
				<td>Embed a playlist with track list.</td>
			</tr>
		</tbody>
	</table>
</div>
