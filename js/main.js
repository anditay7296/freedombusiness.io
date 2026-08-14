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

  /* The page has no countdown any more — the bottom bar's 免费培训倒数剩下最后 column
     was removed on request, and the footer minute-timer before it, so the timer code
     that used to live here is gone with them. */

  /* ---------- Awards timeline: scroll progress fill along the dot-to-dot line ---------- */
  (function () {
    var rows = document.querySelectorAll('.timeline-row');
    if (!rows.length) return;
    var firstC = rows[0].querySelector('.timeline_centre');
    var lastC = rows[rows.length - 1].querySelector('.timeline_centre');
    var section = rows[0].closest('.c-section');
    if (!firstC || !lastC || !section) return;

    var fill = document.createElement('div');
    fill.className = 'tl-fill';
    section.style.position = 'relative';
    section.appendChild(fill);

    var ticking = false;
    function update() {
      ticking = false;
      var secBox = section.getBoundingClientRect();
      var fBox = firstC.getBoundingClientRect();
      var lBox = lastC.getBoundingClientRect();
      // track runs from the first diamond's resting point to the last column's end
      var trackTop = fBox.top - secBox.top + 26;
      var trackBottom = lBox.bottom - secBox.top - 26;
      var x = fBox.left - secBox.left + fBox.width / 2;
      // the diamonds pin at 48% viewport height; the fill's tip meets them there
      var tip = window.innerHeight * 0.48 + 14 - secBox.top;
      var height = Math.max(0, Math.min(tip, trackBottom) - trackTop);
      fill.style.left = (x - 1.5) + 'px';
      fill.style.top = trackTop + 'px';
      fill.style.height = height + 'px';
    }
    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    // belt-and-braces: lazy images shift layout and the odd scroll event gets
    // dropped on some browsers — a slow refresh keeps the fill honest
    setInterval(update, 300);
  })();

  /* ---------- 30 天计划的里程碑: staggered card reveal on scroll ---------- */
  var msCards = document.querySelectorAll('.ms-card');
  if (msCards.length && 'IntersectionObserver' in window) {
    var msReveal = function (c) {
      c.classList.add('ms-in');
      c.classList.remove('ms-prep');
    };
    var msIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        msReveal(entry.target);
        msIO.unobserve(entry.target);
      });
    }, { threshold: 0.2 });
    msCards.forEach(function (c, i) {
      c.classList.add('ms-prep'); // hidden state only once JS is in charge of revealing
      c.style.transitionDelay = (i * 0.12) + 's';
      msIO.observe(c);
    });
    // insurance: whatever happens with the observer, nothing stays hidden
    setTimeout(function () { msCards.forEach(msReveal); }, 4000);
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
