/**
 * StreamTech Admin JS — handles upload, delete, import, playlists, and shortcode copy.
 */
(function ($) {
  'use strict';

  var api = streamtechAdmin.restUrl;
  var nonce = streamtechAdmin.nonce;

  function headers() {
    return { 'X-WP-Nonce': nonce };
  }

  /* ═══════════════════════════════════════════
     Connection Test
     ═══════════════════════════════════════════ */

  $('#streamtech-test-connection').on('click', function () {
    var $btn = $(this);
    var $result = $('#streamtech-test-result');
    $btn.prop('disabled', true);
    $result.text('Testing...').removeClass('streamtech-notice--success streamtech-notice--error');

    $.ajax({
      url: api + 'assets',
      method: 'GET',
      headers: headers(),
      data: { limit: 1 },
    })
      .done(function (data) {
        if (data.error) {
          $result.text('Failed: ' + data.message).addClass('streamtech-notice--error');
        } else {
          $result.text('Connected! ' + (data.total || 0) + ' assets found.').addClass('streamtech-notice--success');
        }
      })
      .fail(function (xhr) {
        var msg = xhr.responseJSON ? xhr.responseJSON.message : 'Connection failed';
        $result.text('Error: ' + msg).addClass('streamtech-notice--error');
      })
      .always(function () {
        $btn.prop('disabled', false);
      });
  });

  /* ═══════════════════════════════════════════
     Copy Shortcode
     ═══════════════════════════════════════════ */

  $(document).on('click', '.streamtech-copy-shortcode', function () {
    var code = $(this).data('shortcode');
    if (!code) return;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(function () {
        showToast('Shortcode copied!');
      });
    } else {
      var $tmp = $('<textarea>').val(code).appendTo('body').select();
      document.execCommand('copy');
      $tmp.remove();
      showToast('Shortcode copied!');
    }
  });

  /* ═══════════════════════════════════════════
     Delete Asset
     ═══════════════════════════════════════════ */

  $(document).on('click', '.streamtech-delete-asset', function () {
    var $btn = $(this);
    var id = $btn.data('id');
    if (!confirm('Delete this asset permanently? This cannot be undone.')) return;

    $btn.prop('disabled', true);

    $.ajax({
      url: api + 'assets/' + id,
      method: 'DELETE',
      headers: headers(),
    })
      .done(function () {
        $btn.closest('tr').fadeOut(300, function () {
          $(this).remove();
        });
        showToast('Asset deleted.');
      })
      .fail(function (xhr) {
        alert('Delete failed: ' + (xhr.responseJSON ? xhr.responseJSON.message : 'Unknown error'));
        $btn.prop('disabled', false);
      });
  });

  /* ═══════════════════════════════════════════
     File Upload
     ═══════════════════════════════════════════ */

  var $dropzone = $('#streamtech-dropzone');
  var $fileInput = $('#streamtech-file-input');

  $dropzone.on('click', function () {
    $fileInput.trigger('click');
  });
  $('#streamtech-browse-btn').on('click', function (e) {
    e.stopPropagation();
    $fileInput.trigger('click');
  });

  $dropzone
    .on('dragover', function (e) {
      e.preventDefault();
      $dropzone.addClass('dragover');
    })
    .on('dragleave drop', function () {
      $dropzone.removeClass('dragover');
    })
    .on('drop', function (e) {
      e.preventDefault();
      var files = e.originalEvent.dataTransfer.files;
      if (files.length) uploadFile(files[0]);
    });

  $fileInput.on('change', function () {
    if (this.files.length) uploadFile(this.files[0]);
  });

  function uploadFile(file) {
    var fd = new FormData();
    fd.append('file', file);

    var title = $('#st-upload-title').val() || '';
    var folder = $('#st-upload-folder').val() || '';
    var profile = $('#st-upload-profile').val() || 'default';

    if (title) fd.append('title', title);
    if (folder) fd.append('folder', folder);
    fd.append('profile', profile);

    var $progress = $('#streamtech-upload-progress');
    var $bar = $('#streamtech-progress-bar');
    var $text = $('#streamtech-progress-text');
    var $result = $('#streamtech-upload-result');

    $progress.show();
    $result.hide().empty();
    $bar.css('width', '0%');
    $text.text('Uploading ' + file.name + '...');

    $.ajax({
      url: api + 'upload',
      method: 'POST',
      headers: headers(),
      data: fd,
      processData: false,
      contentType: false,
      xhr: function () {
        var xhr = new XMLHttpRequest();
        xhr.upload.addEventListener('progress', function (e) {
          if (e.lengthComputable) {
            var pct = Math.round((e.loaded / e.total) * 100);
            $bar.css('width', pct + '%');
            $text.text('Uploading ' + file.name + '... ' + pct + '%');
          }
        });
        return xhr;
      },
    })
      .done(function (data) {
        if (data.error) {
          $result.html('<div class="notice notice-error inline"><p>' + data.message + '</p></div>').show();
        } else {
          $bar.css('width', '100%');
          $text.text('Upload complete!');
          var shortcode = '[streamtech_player id="' + data.id + '"]';
          $result.html(
            '<div class="notice notice-success inline"><p>' +
              'Uploaded <strong>' + (data.title || file.name) + '</strong>. ' +
              'Asset ID: <code>' + data.id + '</code><br/>' +
              'Shortcode: <code>' + shortcode + '</code> ' +
              '<button type="button" class="button button-small streamtech-copy-shortcode" data-shortcode=\'' + shortcode + "'>Copy</button>" +
              '</p></div>'
          ).show();
        }
      })
      .fail(function (xhr) {
        var msg = xhr.responseJSON ? xhr.responseJSON.message : 'Upload failed';
        $result.html('<div class="notice notice-error inline"><p>' + msg + '</p></div>').show();
      });
  }

  /* ═══════════════════════════════════════════
     URL Import
     ═══════════════════════════════════════════ */

  $('#streamtech-import-btn').on('click', function () {
    var $btn = $(this);
    var $result = $('#streamtech-import-result');
    var url = $('#st-import-url').val();
    var title = $('#st-import-title').val();

    if (!url) {
      $result.text('URL is required.').addClass('streamtech-notice--error');
      return;
    }

    $btn.prop('disabled', true);
    $result.text('Importing...').removeClass('streamtech-notice--success streamtech-notice--error');

    $.ajax({
      url: api + 'import-url',
      method: 'POST',
      headers: headers(),
      contentType: 'application/json',
      data: JSON.stringify({ url: url, title: title }),
    })
      .done(function (data) {
        if (data.error) {
          $result.text('Failed: ' + data.message).addClass('streamtech-notice--error');
        } else {
          $result
            .text('Import started! Asset ID: ' + data.id)
            .addClass('streamtech-notice--success');
          $('#st-import-url').val('');
          $('#st-import-title').val('');
        }
      })
      .fail(function (xhr) {
        var msg = xhr.responseJSON ? xhr.responseJSON.message : 'Import failed';
        $result.text('Error: ' + msg).addClass('streamtech-notice--error');
      })
      .always(function () {
        $btn.prop('disabled', false);
      });
  });

  /* ═══════════════════════════════════════════
     Playlists
     ═══════════════════════════════════════════ */

  $('#streamtech-create-playlist-btn').on('click', function () {
    $('#streamtech-playlist-modal').show();
    $('#st-pl-name').val('').focus();
  });

  $(document).on('click', '.streamtech-modal-close, .streamtech-modal__backdrop', function () {
    $(this).closest('.streamtech-modal').hide();
  });

  $('#streamtech-playlist-save').on('click', function () {
    var name = $('#st-pl-name').val().trim();
    if (!name) return;

    var $btn = $(this);
    $btn.prop('disabled', true);

    $.ajax({
      url: api + 'playlists',
      method: 'POST',
      headers: headers(),
      contentType: 'application/json',
      data: JSON.stringify({ name: name }),
    })
      .done(function () {
        window.location.reload();
      })
      .fail(function (xhr) {
        alert('Failed: ' + (xhr.responseJSON ? xhr.responseJSON.message : 'Unknown error'));
        $btn.prop('disabled', false);
      });
  });

  $(document).on('click', '.streamtech-delete-playlist', function () {
    var $btn = $(this);
    var id = $btn.data('id');
    if (!confirm('Delete this playlist?')) return;

    $btn.prop('disabled', true);

    $.ajax({
      url: api + 'playlists/' + id,
      method: 'DELETE',
      headers: headers(),
    })
      .done(function () {
        $btn.closest('tr').fadeOut(300, function () {
          $(this).remove();
        });
        showToast('Playlist deleted.');
      })
      .fail(function (xhr) {
        alert('Delete failed: ' + (xhr.responseJSON ? xhr.responseJSON.message : 'Unknown error'));
        $btn.prop('disabled', false);
      });
  });

  /* ═══════════════════════════════════════════
     Toast
     ═══════════════════════════════════════════ */

  function showToast(msg) {
    var $toast = $('<div class="notice notice-success is-dismissible streamtech-toast"><p>' + msg + '</p></div>');
    $toast.css({
      position: 'fixed',
      top: '40px',
      right: '20px',
      zIndex: 100002,
      minWidth: '220px',
      boxShadow: '0 2px 8px rgba(0,0,0,.15)',
    });
    $('body').append($toast);
    setTimeout(function () {
      $toast.fadeOut(400, function () {
        $toast.remove();
      });
    }, 2500);
  }
})(jQuery);
