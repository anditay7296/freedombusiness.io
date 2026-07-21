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

  /* ---------- Webinar countdown (bottom bar) ---------- */
  // Evergreen: always counts down to the NEXT webinar rather than one fixed date, so it
  // never expires and needs no upkeep between cohorts. The page advertises 星期三 & 四,
  // 8PM-11PM (GMT+8), so the target is the next Wednesday 20:00 Malaysia time.
  // To move the webinar to a different day/time, change these two values.
  var WEBINAR_DAY_UTC = 3;   // 0=Sun. Wed 20:00 +08 is still Wednesday in UTC.
  var WEBINAR_HOUR_UTC = 12; // 20:00 in GMT+8 == 12:00 UTC

  // Working in UTC keeps this correct for visitors in any timezone, and sidesteps the
  // viewer's own DST/offset entirely. `nowMs` is injectable so the roll-over is testable.
  function nextWebinarStart(nowMs) {
    var now = typeof nowMs === 'number' ? nowMs : Date.now();
    var d = new Date(now);
    var t = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), WEBINAR_HOUR_UTC, 0, 0, 0);
    // advance to the target weekday
    t += ((WEBINAR_DAY_UTC - new Date(t).getUTCDay() + 7) % 7) * 864e5;
    // if that instant has already passed, roll to next week
    if (t <= now) t += 7 * 864e5;
    return t;
  }
  window.nextWebinarStart = nextWebinarStart; // exposed so the roll-over can be verified

  var countdownWrap = document.getElementById('countdown-DAHiXj0Kmd');
  if (countdownWrap) {
    var UNITS = ['days', 'hours', 'minutes', 'seconds'];

    // GHL renders this grid client-side, so build it (reusing GHL's own time-grid-4 /
    // timer-box classes, which the stylesheet already styles)
    if (!countdownWrap.querySelector('.timer-box')) {
      var inner = document.createElement('div');
      inner.className = 'ccountdown-DAHiXj0Kmd';
      inner.innerHTML = '<span><div id="countdown-DAHiXj0Kmd-timer-container" ' +
        'class="time-grid-4 ccountdown-DAHiXj0Kmd">' +
        UNITS.map(function (u) {
          return '<div class="timer-box"><div class="count">0</div><div class="label">' + u + '</div></div>';
        }).join('') +
        '</div></span>';
      countdownWrap.appendChild(inner);
    }

    var counts = countdownWrap.querySelectorAll('.timer-box .count');
    if (counts.length === 4) {
      var tick = function () {
        // resolve the target every tick: keeps a throttled/backgrounded tab accurate, and
        // rolls straight on to next week's webinar the moment this one starts
        var left = Math.max(0, Math.floor((nextWebinarStart() - Date.now()) / 1000));
        counts[0].textContent = Math.floor(left / 86400);
        counts[1].textContent = Math.floor((left % 86400) / 3600);
        counts[2].textContent = Math.floor((left % 3600) / 60);
        counts[3].textContent = left % 60;
      };
      tick();
      setInterval(tick, 1000);
    }
  }

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

  /* ---------- Ringgit/USD comparison slider ---------- */
  // The GHL runtime makes .img-comp-slider draggable; this reproduces it, including
  // the 1px offset that compensates for the overlay's border-right.
  document.querySelectorAll('.img-comp-container').forEach(function (cont) {
    var overlay = cont.querySelector('.img-comp-overlay');
    var slider = cont.querySelector('.img-comp-slider');
    var box = cont.querySelector('.img-comp-responsive') || cont;
    if (!overlay || !slider) return;

    var dragging = false;
    var ratio = null; // divider position as a fraction of the box, so it survives resize

    function slide(x) {
      var w = box.offsetWidth;
      if (!w) return; // not laid out yet (hidden/zero-width) — writing 0px would collapse it
      if (x < 0) x = 0;
      if (x > w) x = w;
      ratio = x / w;
      overlay.style.width = x + 'px';
      slider.style.left = (x - 1) + 'px';
    }

    function offsetX(e) {
      var pt = e.touches && e.touches.length ? e.touches[0] : e;
      return pt.pageX - (box.getBoundingClientRect().left + window.pageXOffset);
    }

    function start(e) {
      dragging = true;
      e.preventDefault();
    }

    function move(e) {
      if (!dragging) return;
      e.preventDefault();
      slide(offsetX(e));
    }

    function stop() { dragging = false; }

    slider.addEventListener('mousedown', start);
    slider.addEventListener('touchstart', start, { passive: false });
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchend', stop);

    // clicking anywhere on the image jumps the divider there, as on the live page
    box.addEventListener('click', function (e) {
      if (e.target === slider || slider.contains(e.target)) return;
      slide(offsetX(e));
    });

    // stop the browser's native image-drag ghost from hijacking the gesture
    cont.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('dragstart', function (e) { e.preventDefault(); });
    });

    // keep the divider where the user put it when the viewport changes (resize/rotate)
    window.addEventListener('resize', function () {
      if (ratio === null) return;
      var w = box.offsetWidth;
      if (!w) return;
      var x = ratio * w;
      overlay.style.width = x + 'px';
      slider.style.left = (x - 1) + 'px';
    });
  });

  /* ---------- Hosted video (HLS, autoplay muted, click to enable sound) ---------- */
  var HLS_SRC = 'https://content.apisystem.tech/hls/medias/7YOe2MHgM2XNDGbGVilt/media/transcoded_videos/cts-0fe6c8cb0df85a55_,360,480,720,1080,p.mp4.urlset/master.m3u8';
  // Direct progressive source, used if HLS is unavailable or fails to load
  var MP4_SRC = 'https://assets.cdn.filesafe.space/7YOe2MHgM2XNDGbGVilt/media/6a2ae08f8f3ec6e08aeeec37.mp4';
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
        hls.on(window.Hls.Events.ERROR, function (_evt, data) {
          if (data && data.fatal) {
            hls.destroy();
            video.src = MP4_SRC;
            if (started) video.play().catch(function () {});
          }
        });
      } else {
        video.src = MP4_SRC;
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
