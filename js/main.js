/* Interactivity for the register2s page (popup, class dates, timeline, milestones,
   FAQ, slider, video).

   Shared by the Vercel site and the GHL custom-code build — scripts/build-ghl.mjs
   inlines this file — so both behave the same. In GHL the page sits inside
   <div class="fb-ghl"> alongside GHL's own elements, which is why every lookup goes
   through `root`; on the Vercel site there is no wrapper and root is the document. */
(function () {
  'use strict';

  var root = document.querySelector('.fb-ghl') || document;
  // true for this page's own elements; on the site every element is the page's own
  var inPage = function (el) { return root === document || root.contains(el); };
  // first element GHL rendered OUTSIDE this page (its native popup, its builder button)
  var hostEl = function (selector) {
    var all = document.querySelectorAll(selector);
    for (var i = 0; i < all.length; i++) if (!inPage(all[i])) return all[i];
    return null;
  };

  /* ---------- Class dates: always the next Wednesday & Thursday ----------
     Worked out in Malaysia time (GMT+8) so every visitor sees the same dates whatever
     their own timezone. Rolls to the following week at Wednesday 21:00 MYT — an hour
     into class, so latecomers see the next intake. The date written in the HTML is
     only a placeholder for the moment before this runs. */
  var MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  var classDays = function (nowMs) {
    var my = new Date(nowMs + 8 * 3600 * 1000); // read the UTC fields as MYT wall-clock
    var dow = my.getUTCDay();
    var off = (3 - dow + 7) % 7;
    if (dow === 3 && my.getUTCHours() >= 21) off = 7;
    var wed = new Date(Date.UTC(my.getUTCFullYear(), my.getUTCMonth(), my.getUTCDate() + off));
    var thu = new Date(wed.getTime() + 86400000);
    var wm = MON[wed.getUTCMonth()], tm = MON[thu.getUTCMonth()];
    var wd = wed.getUTCDate(), td = thu.getUTCDate();
    var end = (wm === tm ? '' : tm + ' ') + td;
    return {
      long: wm + ' ' + wd + ' & ' + tm + ' ' + td,           // OCT 21 & OCT 22 · SEP 30 & OCT 1
      short: wm + ' ' + wd + ' & ' + end,                     // OCT 21 & 22     · SEP 30 & OCT 1
      card: wm + ' ' + wd + ' & ' + end + '（三 & 四）',
      bar: wm + ' ' + wd + '–' + end + '（三 & 四）'
    };
  };
  var applyDates = function () {
    var days = classDays(Date.now());
    root.querySelectorAll('[data-class-date]').forEach(function (el) {
      var t = days[el.getAttribute('data-class-date')];
      if (t) el.textContent = t;
    });
    // and again at the next Wednesday 21:00 MYT, so a page left open rolls over too
    var now = Date.now();
    var my = new Date(now + 8 * 3600 * 1000);
    var next = Date.UTC(my.getUTCFullYear(), my.getUTCMonth(), my.getUTCDate() + (3 - my.getUTCDay() + 7) % 7, 21) - 8 * 3600 * 1000;
    if (next <= now) next += 7 * 86400000;
    setTimeout(applyDates, next - now + 1000);
  };
  applyDates();

  /* ---------- Ad tracking: carry the page's ad parameters into the form ---------- */
  var PASS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id',
    'fbclid', 'gclid', 'ttclid', 'ad_id', 'adset_id', 'campaign_id'];
  var withAdParams = function (src) {
    try {
      var url = new URL(src);
      var from = new URLSearchParams(window.location.search);
      var added = false;
      PASS.forEach(function (k) {
        if (from.get(k)) { url.searchParams.set(k, from.get(k)); added = true; }
      });
      return added ? url.toString() : src; // untouched when there is nothing to add
    } catch (err) {
      return src;
    }
  };
  // forms already on the page (the site's inline form) — reloads only when there are params
  root.querySelectorAll('iframe[src*="/widget/form/"]').forEach(function (f) {
    var src = f.getAttribute('src');
    var next = withAdParams(src);
    if (next !== src) f.setAttribute('src', next);
  });

  /* ---------- Signup popup ----------
     Opens ONLY when a visitor taps a button — never on load, exit-intent or a timer.

     Preferred (GHL): the page's native GHL popup holding a native Form element; only
     those submissions count as funnel opt-ins. The first tap is forwarded to the one
     hidden builder Button whose action is "Show Popup", so GHL itself opens it; after
     that the same popup is shown and hidden here. Never click that button twice: GHL
     still thinks the popup is open and a second click toggles it shut.

     Fallback (the Vercel site, or a GHL page with no native popup): this page's own
     popup with the GHL form in an iframe. Contacts are created, but not as opt-ins. */
  var fb = root.querySelector('#fbOverlay');
  var fbFrame = fb ? fb.querySelector('iframe[data-form-url]') : null;
  var fbOpen = false;
  var openedAt = 0; // last time any popup opened — see the double-tap guard below
  var recentlyOpened = function () { return Date.now() - openedAt < 400; };

  var openFallback = function () {
    if (!fb || fbOpen) return;
    if (fbFrame) {
      // load on first open, with the ad parameters; kept loaded so a reopen is instant
      var src = withAdParams(fbFrame.getAttribute('data-form-url'));
      if (fbFrame.getAttribute('src') !== src) fbFrame.setAttribute('src', src);
    }
    fbOpen = true;
    openedAt = Date.now();
    fb.style.display = 'block';
    requestAnimationFrame(function () { fb.classList.add('show'); }); // lets the fade run
    document.body.classList.add('popup-open');
    document.body.style.overflow = 'hidden';
  };
  var closeFallback = function () {
    if (!fb || !fbOpen) return false;
    fbOpen = false;
    fb.classList.remove('show');
    document.body.classList.remove('popup-open');
    document.body.style.overflow = '';
    setTimeout(function () { if (!fbOpen) fb.style.display = 'none'; }, 300);
    return true;
  };

  /* GHL's own close button deletes the whole popup node — and the form's styles with
     it — rather than hiding it. So the node, its parent and its #overlay backdrop are
     remembered here, and put back if GHL removes them. */
  var nativePopup = null;
  var nativeParent = null;
  var nativeOverlay = null;
  var rememberNative = function (el) {
    nativePopup = el;
    if (el.parentNode) nativeParent = el.parentNode;
    var ov = el.closest ? el.closest('#overlay') : null;
    if (!ov && el.parentElement && /overlay/i.test(el.parentElement.id || '')) ov = el.parentElement;
    if (ov) nativeOverlay = ov;
  };
  var findNative = function () {
    var live = hostEl('.hl_main_popup') || hostEl('.popup-body') || hostEl('#popup');
    if (live) rememberNative(live);
    return live || nativePopup; // the one on the page, else the one GHL removed
  };
  findNative();
  document.addEventListener('DOMContentLoaded', findNative);
  window.addEventListener('load', findNative);

  var isShown = function (el) { return !!el && document.contains(el) && el.style.display !== 'none'; };
  // the dimmed #overlay backdrop must go with the popup, or the page stays dark and
  // the full-screen layer swallows every tap
  var hideNative = function (el) {
    el.classList.remove('show');
    el.style.display = 'none';
    if (nativeOverlay) { nativeOverlay.classList.remove('show'); nativeOverlay.style.display = 'none'; }
    document.body.classList.remove('popup-open');
  };
  var openNative = function () {
    var el = findNative();
    if (!el) return false;
    if (!document.contains(el)) {
      if (nativeOverlay && !document.contains(nativeOverlay)) document.body.appendChild(nativeOverlay);
      var home = nativeParent && document.contains(nativeParent) ? nativeParent
        : nativeOverlay && document.contains(nativeOverlay) ? nativeOverlay : document.body;
      if (!home.contains(el)) home.appendChild(el);
    }
    el.style.display = '';
    el.classList.add('show');
    if (nativeOverlay) { nativeOverlay.style.display = ''; nativeOverlay.classList.add('show'); }
    document.body.classList.add('popup-open');
    openedAt = Date.now();
    return true;
  };
  var closeNative = function () {
    var el = findNative();
    if (!isShown(el)) return false;
    hideNative(el);
    return true;
  };

  // GHL's ✕ and a tap on its backdrop: hide the popup instead of letting GHL delete it
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest || inPage(t)) return; // this page's own popup handles itself
    var x = t.closest('.closeLPModal');
    var pop = x ? x.closest('.hl_main_popup, .popup-body') : null;
    var backdrop = false;
    if (!pop && /overlay/i.test(t.id || '')) {
      pop = t.querySelector('.hl_main_popup, .popup-body');
      backdrop = true;
    }
    if (!pop) return;
    e.stopPropagation();
    e.preventDefault();
    rememberNative(pop);
    // the second half of a double tap lands on the backdrop that just appeared: ignore it
    if (backdrop && recentlyOpened()) return;
    hideNative(pop);
  }, true);

  /* The hidden "Show Popup" builder button is clicked at most ONCE per page load: a
     second click would toggle GHL's popup shut. After that click we watch for GHL's
     popup; if none has appeared after 3s the button isn't set to Show Popup (or the
     page has no popup), so the visitor gets the fallback — and keeps getting it,
     without another wait. A GHL popup that turns up later than that is hidden again,
     so there is never more than one popup on screen. */
  var proxyState = 'untried'; // 'pending' -> 'works' | 'dead'
  var forwardToBuilder = function (proxy) {
    proxyState = 'pending';
    openedAt = Date.now();
    proxy.click();
    var t0 = Date.now();
    var watch = setInterval(function () {
      var el = hostEl('.hl_main_popup') || hostEl('.popup-body') || hostEl('#popup');
      if (el) {
        rememberNative(el);
        var late = proxyState === 'dead'; // the visitor was already given the fallback
        proxyState = 'works';             // from now on every tap shows GHL's popup
        clearInterval(watch);
        if (late && isShown(el)) hideNative(el); // never two popups, never one out of nowhere
        return;
      }
      if (proxyState === 'pending' && Date.now() - t0 > 3000) {
        proxyState = 'dead';
        openFallback();
      }
      if (Date.now() - t0 > 10000) clearInterval(watch);
    }, 100);
  };
  var openSignup = function () {
    if (openNative()) return; // GHL's popup is on the page (or we hid it): show it again
    if (proxyState === 'pending') return; // the first tap is still being answered
    if (proxyState === 'untried') {
      // the builder button GHL rendered — never one of this page's own CTAs
      var proxy = hostEl('.c-button button[id^="button-"][id$="_btn"]');
      if (proxy) { forwardToBuilder(proxy); return; }
    }
    openFallback();
  };

  // every signup button on the page: hero, each section, the signup section, the bottom bar
  root.querySelectorAll('.c-button').forEach(function (btn) {
    if (fb && fb.contains(btn)) return;
    btn.style.cursor = 'pointer';
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      openSignup();
    });
  });

  if (fb) {
    fb.addEventListener('click', function (e) {
      if (e.target === fb && !recentlyOpened()) closeFallback(); // tap outside the card
    });
    var fbX = fb.querySelector('.fbCloseModal');
    if (fbX) fbX.addEventListener('click', closeFallback);
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!closeFallback()) closeNative();
  });

  /* The page has no countdown any more — the bottom bar's 免费培训倒数剩下最后 column
     was removed on request, and the footer minute-timer before it, so the timer code
     that used to live here is gone with them. */

  /* ---------- Awards timeline: scroll progress fill along the dot-to-dot line ---------- */
  (function () {
    var rows = root.querySelectorAll('.timeline-row');
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
  var msCards = root.querySelectorAll('.ms-card');
  if (msCards.length) {
    // money figures count up as each card arrives
    var msFmt = function (v) {
      var s = v.toFixed(2).split('.');
      return '$' + s[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + s[1];
    };
    // remember each target before anything overwrites the printed value
    root.querySelectorAll('.ms-payamt').forEach(function (n) {
      n.setAttribute('data-ms-target', parseFloat(n.textContent.replace(/[^0-9.]/g, '')) || 0);
    });
    var msCount = function (node, delay) {
      var target = parseFloat(node.getAttribute('data-ms-target')) || 0;
      if (node._msRaf) cancelAnimationFrame(node._msRaf);
      clearTimeout(node._msTimer);
      node._msStopped = false;
      node._msTimer = setTimeout(function () {
        var t0 = null;
        var step = function (ts) {
          if (node._msStopped) return;
          if (!t0) t0 = ts;
          var p = Math.min(1, (ts - t0) / 1400);
          node.textContent = msFmt(target * (1 - Math.pow(1 - p, 3))); // easeOutCubic
          if (p < 1) node._msRaf = requestAnimationFrame(step);
          else node.textContent = msFmt(target);
        };
        node._msRaf = requestAnimationFrame(step);
      }, delay);
      // If animation frames are starved (background tab, low-power mode) the
      // rAF loop above never finishes and the figure would sit at $0.00 — worse
      // than no animation. Land it on the real value regardless.
      clearTimeout(node._msDone);
      node._msDone = setTimeout(function () {
        node._msStopped = true;
        if (node._msRaf) cancelAnimationFrame(node._msRaf);
        node.textContent = msFmt(target);
      }, delay + 1800);
    };
    var msShow = function (c) {
      c.classList.add('ms-in');
      c.classList.remove('ms-prep');
      // guard: the backstop calls this repeatedly, and restarting would stutter
      if (c._msPlayed) return;
      c._msPlayed = true;
      var amt = c.querySelector('.ms-payamt');
      var i = Array.prototype.indexOf.call(msCards, c);
      if (amt) msCount(amt, i * 120 + 200); // start just after this card's slide-in
    };
    var msHide = function (c) {
      c.classList.remove('ms-in');
      c.classList.add('ms-prep');
      c._msPlayed = false;
      var amt = c.querySelector('.ms-payamt');
      if (!amt) return;
      if (amt._msRaf) cancelAnimationFrame(amt._msRaf);
      clearTimeout(amt._msTimer);
      clearTimeout(amt._msDone);
      amt.textContent = msFmt(0);
    };

    if (!('IntersectionObserver' in window)) {
      msCards.forEach(msShow);
    } else {
      // Play each time the cards scroll into view and rewind once they leave, so
      // the reveal is never missed. (A play-once version plus a blind timer meant
      // anyone who took a few seconds to scroll down found it already finished.)
      msCards.forEach(function (c, i) {
        msHide(c);
        c.style.transitionDelay = (i * 0.12) + 's';
      });
      var msIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.intersectionRatio >= 0.2) msShow(entry.target);
          else if (entry.intersectionRatio === 0) msHide(entry.target);
        });
      }, { threshold: [0, 0.2] });
      msCards.forEach(function (c) { msIO.observe(c); });

      // Backstop if the observer never reports — checks real on-screen position
      // rather than firing blindly on a timer.
      var msBackstop = setInterval(function () {
        var shown = 0;
        msCards.forEach(function (c) {
          var r = c.getBoundingClientRect();
          var vh = window.innerHeight || 0;
          if (vh > 0 && r.top < vh * 0.85 && r.bottom > vh * 0.15) msShow(c);
          if (c.classList.contains('ms-in')) shown++;
        });
        if (shown === msCards.length) clearInterval(msBackstop);
      }, 700);
    }
  }

  /* ---------- FAQ accordion ---------- */
  root.querySelectorAll('.hl-faq-child-heading').forEach(function (head) {
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
  root.querySelectorAll('.img-comp-container').forEach(function (cont) {
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

    // page-wide move/up listeners exist only while dragging: a non-passive touchmove on
    // window would otherwise sit in front of every scroll of the whole (GHL) page
    function start(e) {
      dragging = true;
      e.preventDefault();
      window.addEventListener('mousemove', move);
      window.addEventListener('touchmove', move, { passive: false });
      window.addEventListener('mouseup', stop);
      window.addEventListener('touchend', stop);
    }

    function move(e) {
      if (!dragging) return;
      e.preventDefault();
      slide(offsetX(e));
    }

    function stop() {
      dragging = false;
      window.removeEventListener('mousemove', move);
      window.removeEventListener('touchmove', move, { passive: false });
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('touchend', stop);
    }

    slider.addEventListener('mousedown', start);
    slider.addEventListener('touchstart', start, { passive: false });

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
  var videoWrap = root.querySelector('.c-video .videobox');
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
    // GHL loads external scripts asynchronously, so hls.js may still be on its way:
    // give it a few seconds before settling for the (much heavier) progressive MP4
    (function waitForHls(tries) {
      if (video.canPlayType('application/vnd.apple.mpegurl') || window.Hls || tries <= 0) {
        attachSource();
        if (started) video.play().catch(function () {}); // it scrolled into view while we waited
      } else setTimeout(function () { waitForHls(tries - 1); }, 100);
    })(120);

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
