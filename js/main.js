/* Interactivity for the register2s static clone (popup, countdown, FAQ, video) */
(function () {
  'use strict';

  /* ---------- Popup (STEP #1 form) ---------- */
  var overlay = document.getElementById('overlay');

  function openPopup() {
    if (!overlay) return;
    overlay.style.display = 'block';
    // next frame so the opacity transition runs
    requestAnimationFrame(function () { overlay.classList.add('show'); });
    document.body.classList.add('popup-open');
  }

  function closePopup() {
    if (!overlay) return;
    overlay.classList.remove('show');
    document.body.classList.remove('popup-open');
    setTimeout(function () { overlay.style.display = 'none'; }, 300);
  }

  // Every CTA button on the page opens the popup (same as the GHL "openPopup" action)
  document.querySelectorAll('.c-button').forEach(function (btn) {
    if (overlay && overlay.contains(btn)) return;
    btn.style.cursor = 'pointer';
    btn.addEventListener('click', openPopup);
  });

  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closePopup();
    });
    var closeBtn = overlay.querySelector('.closeLPModal');
    if (closeBtn) closeBtn.addEventListener('click', closePopup);
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closePopup();
  });

  /* ---------- Countdown (GHL minute timer: 12s, hide on expire, auto-reset on revisit) ---------- */
  var TIMER_SECONDS = 12;
  document.querySelectorAll('.c-countdown').forEach(function (wrap) {
    // the timer grid is client-rendered in GHL, so build it if missing
    if (!wrap.querySelector('.timer-box')) {
      var innerClass = 'c' + wrap.id.replace(/-timer-container$/, '');
      var container = document.createElement('div');
      container.className = innerClass;
      container.innerHTML =
        '<span><div id="' + wrap.id + '-timer-container" class="time-grid-3 ' + innerClass + ' time-grid-3">' +
        '<div class="timer-box"><div class="count">0</div><div class="label">hours</div></div>' +
        '<div class="timer-box"><div class="count">0</div><div class="label">minutes</div></div>' +
        '<div class="timer-box"><div class="count">0</div><div class="label">seconds</div></div>' +
        '</div></span>';
      wrap.appendChild(container);
    }
    var boxes = wrap.querySelectorAll('.timer-box .count');
    if (boxes.length < 3) return;
    // The live GHL page displays this timer as a static 0h 0m 12s (it never ticks),
    // so the clone matches that observed behavior exactly.
    boxes[0].textContent = Math.floor(TIMER_SECONDS / 3600);
    boxes[1].textContent = Math.floor((TIMER_SECONDS % 3600) / 60);
    boxes[2].textContent = TIMER_SECONDS % 60;
  });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.hl-faq-child-heading').forEach(function (head) {
    head.style.cursor = 'pointer';
    head.addEventListener('click', function () {
      var item = head.closest('.hl-faq-child');
      var panel = item.querySelector('.hl-faq-child-panel');
      var isOpen = item.classList.contains('active');
      if (isOpen) {
        item.classList.remove('active');
        head.classList.remove('active');
        panel.style.height = '0';
        panel.style.padding = '0';
        panel.style.opacity = '0';
      } else {
        item.classList.add('active');
        head.classList.add('active');
        panel.style.height = 'auto';
        panel.style.padding = '';
        panel.style.opacity = '1';
      }
    });
  });

  /* ---------- Hosted video (HLS, autoplay muted, click to enable sound) ---------- */
  var HLS_SRC = 'https://content.apisystem.tech/hls/medias/7YOe2MHgM2XNDGbGVilt/media/transcoded_videos/cts-0fe6c8cb0df85a55_,360,480,720,1080,p.mp4.urlset/master.m3u8';
  var videoWrap = document.querySelector('.c-video .videobox');
  if (videoWrap) {
    var thumb = videoWrap.querySelector('.hosted-video-thumbnail');
    var poster = '';
    if (thumb) {
      var bg = getComputedStyle(thumb).backgroundImage;
      var m = bg && bg.match(/url\("?([^")]+)"?\)/);
      if (m) poster = m[1];
    }

    // overlay the player inside the existing aspect-ratio box (the thumbnail div
    // provides the 56.25% padding height, so the layout stays identical to live)
    var player = document.createElement('div');
    player.className = 'clone-video-player';
    player.innerHTML =
      '<video playsinline muted preload="metadata"' + (poster ? ' poster="' + poster + '"' : '') + '></video>' +
      '<button type="button" class="clone-enable-sound">🔊 点击开启声音</button>';
    videoWrap.style.position = 'relative';
    videoWrap.appendChild(player);

    var video = player.querySelector('video');
    var soundBtn = player.querySelector('.clone-enable-sound');

    function attachSource() {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = HLS_SRC;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(HLS_SRC);
        hls.attachMedia(video);
      }
    }
    attachSource();

    // autoplay muted when scrolled into view
    var started = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !started) {
          started = true;
          video.play().catch(function () {});
          io.disconnect();
        }
      });
    }, { threshold: 0.4 });
    io.observe(player);

    function enableSound() {
      video.muted = false;
      video.currentTime = 0;
      video.play().catch(function () {});
      soundBtn.style.display = 'none';
    }
    soundBtn.addEventListener('click', enableSound);
    video.addEventListener('click', function () {
      if (video.muted) {
        enableSound();
      } else if (video.paused) {
        video.play().catch(function () {});
      } else {
        video.pause();
      }
    });
  }
})();
