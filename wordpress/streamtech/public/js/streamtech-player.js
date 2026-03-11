/**
 * StreamTech front-end player — initialises HLS.js on <video data-streamtech-src>.
 */
(function () {
  'use strict';

  function initPlayers() {
    var videos = document.querySelectorAll('video[data-streamtech-src]');
    videos.forEach(function (video) {
      var src = video.getAttribute('data-streamtech-src');
      if (!src) return;

      video.removeAttribute('data-streamtech-src');

      if (src.indexOf('.m3u8') !== -1 && window.Hls && Hls.isSupported()) {
        var hls = new Hls({ enableWorker: true, startLevel: -1 });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, function (_, data) {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else {
        video.src = src;
      }
    });
  }

  function initPlaylists() {
    var playlists = document.querySelectorAll('.streamtech-playlist');
    playlists.forEach(function (container) {
      var video = container.querySelector('video');
      var tracks = container.querySelectorAll('.streamtech-playlist__track');
      if (!video || !tracks.length) return;

      var currentHls = null;

      function loadTrack(src) {
        if (currentHls) {
          currentHls.destroy();
          currentHls = null;
        }

        if (src.indexOf('.m3u8') !== -1 && window.Hls && Hls.isSupported()) {
          currentHls = new Hls({ enableWorker: true, startLevel: -1 });
          currentHls.loadSource(src);
          currentHls.attachMedia(video);
          currentHls.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play();
          });
        } else {
          video.src = src;
          video.play();
        }
      }

      tracks.forEach(function (btn) {
        btn.addEventListener('click', function () {
          tracks.forEach(function (b) {
            b.classList.remove('streamtech-playlist__track--active');
          });
          btn.classList.add('streamtech-playlist__track--active');
          loadTrack(btn.getAttribute('data-src'));
        });
      });

      // Auto-load first track
      var first = tracks[0];
      if (first) {
        var firstSrc = first.getAttribute('data-src');
        if (firstSrc) {
          if (firstSrc.indexOf('.m3u8') !== -1 && window.Hls && Hls.isSupported()) {
            currentHls = new Hls({ enableWorker: true, startLevel: -1 });
            currentHls.loadSource(firstSrc);
            currentHls.attachMedia(video);
          } else {
            video.src = firstSrc;
          }
        }
      }

      video.addEventListener('ended', function () {
        var active = container.querySelector('.streamtech-playlist__track--active');
        if (active && active.nextElementSibling) {
          active.nextElementSibling.click();
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initPlayers();
      initPlaylists();
    });
  } else {
    initPlayers();
    initPlaylists();
  }
})();
