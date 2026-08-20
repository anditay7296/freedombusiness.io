/* Animated USD conversion cards — replaces the three static Google-widget
   screenshots. Each card redraws its (pixel-traced) green line left to right and
   counts the rate up from zero when scrolled into view. Data below is traced from
   the original PNGs, so the line shapes match the real charts. */
(function () {
  'use strict';

  var CARDS = {"myr":{"num":"4.13","cur":"Malaysian Ringgit","title":"1 United States Dollar equals","meta":"27 Nov, 9:04 am UTC · From Morningstar · Disclaimer","tabs":["1D","5D","1M","1Y","5Y","Max"],"active":"5Y","ylab":["4.8","4.6","4.4","4.2","4.0"],"xlab":[["2023",41],["2025",81]],"share":"upload","pts":[[0.0,269.1],[10.3,273.3],[17.2,272.3],[20.7,280.6],[31.0,276.5],[34.4,268.1],[37.9,268.1],[44.8,275.4],[55.1,246.2],[58.5,248.2],[62.0,236.8],[82.6,253.5],[92.9,240.0],[103.3,246.2],[113.6,233.7],[127.4,207.6],[134.3,210.7],[137.7,205.5],[144.6,205.5],[151.5,231.6],[154.9,232.7],[161.8,221.2],[172.1,228.5],[179.0,237.9],[182.4,233.7],[185.9,233.7],[192.8,208.6],[196.2,204.4],[210.0,213.9],[213.4,221.2],[220.3,218.0],[223.8,224.3],[241.0,222.2],[244.4,217.0],[254.7,221.2],[268.5,207.6],[275.4,166.8],[285.7,145.0],[292.6,150.1],[299.5,146.0],[309.8,145.0],[320.1,128.3],[333.9,125.1],[337.3,118.9],[344.2,119.9],[351.1,102.1],[371.8,21.8],[382.1,20.7],[399.3,142.9],[402.8,137.7],[409.6,136.6],[416.5,145.0],[426.9,194.0],[437.2,134.5],[447.5,104.2],[450.9,104.2],[454.4,110.5],[461.3,139.8],[464.7,143.9],[475.0,122.0],[478.5,125.1],[488.8,75.0],[499.1,67.7],[506.0,43.7],[512.9,47.9],[516.4,46.8],[519.8,86.5],[526.7,88.5],[533.6,57.2],[537.0,52.0],[540.4,56.2],[547.3,44.8],[557.7,36.4],[561.1,27.0],[564.5,25.9],[568.0,13.4],[574.9,6.1],[585.2,41.6],[588.6,40.6],[595.5,46.8],[602.4,45.8],[609.3,56.2],[612.7,53.0],[619.6,29.1],[626.5,22.8],[633.4,7.1],[640.3,9.2],[647.2,32.2],[654.0,20.7],[657.5,22.8],[667.8,5.0],[671.3,6.1],[685.0,31.2],[695.4,34.3],[698.8,28.0],[712.6,33.3],[716.0,40.6],[719.4,38.5],[722.9,47.9],[729.8,120.9],[736.7,138.7],[743.5,171.0],[747.0,171.0],[750.4,181.5],[753.9,206.5],[757.3,211.8],[760.8,189.8],[774.5,154.3],[781.4,119.9],[788.3,122.0],[791.7,128.3],[795.2,128.3],[798.6,109.5],[812.4,110.5],[819.3,105.3],[822.7,128.3],[826.2,127.2],[833.0,133.5],[836.5,125.1],[839.9,125.1],[843.4,130.3],[860.6,133.5],[864.0,137.7],[870.9,152.2],[874.4,177.3],[877.8,183.6],[881.2,184.6],[888.1,200.3],[895.0,202.4],[901.9,199.2],[905.3,207.6],[908.8,201.3],[915.7,202.4],[922.5,193.0],[926.0,194.0],[929.4,206.5],[943.2,210.7],[946.6,215.9],[953.5,209.7],[957.0,212.8],[963.9,209.7],[970.7,211.8],[977.6,228.5],[998.3,241.0]]},"hkd":{"num":"7.78","cur":"Hong Kong Dollar","title":"1 United States Dollar equals","meta":"9 Nov, 7:38 pm UTC · From Morningstar · Disclaimer","tabs":["1D","5D","1M","1Y","5Y","Max"],"active":"5Y","ylab":["7.85","7.80","7.75","7.70"],"xlab":[["2023",41],["2025",81]],"share":"nodes","pts":[[0.0,194.6],[10.6,200.9],[21.2,192.5],[49.4,193.6],[52.9,190.5],[56.4,177.9],[63.5,173.8],[77.6,145.7],[81.1,146.7],[88.2,165.5],[91.7,167.5],[98.8,165.5],[109.3,182.1],[134.0,163.4],[148.1,123.8],[151.7,122.7],[155.2,126.9],[158.7,143.6],[162.3,143.6],[169.3,131.1],[179.9,136.3],[183.4,147.7],[197.5,120.7],[201.1,107.1],[208.1,108.1],[215.2,98.8],[229.3,111.3],[232.8,126.9],[236.3,116.5],[239.9,118.6],[246.9,101.9],[254.0,76.9],[257.5,48.8],[264.6,47.7],[275.1,21.7],[289.2,6.1],[299.8,9.2],[313.9,7.1],[321.0,10.3],[328.0,6.1],[331.6,8.1],[342.2,6.1],[345.7,14.4],[359.8,7.1],[370.4,9.2],[377.4,5.1],[384.5,8.1],[391.5,7.1],[409.2,125.9],[412.7,91.5],[416.2,79.0],[419.8,79.0],[426.8,42.5],[437.4,9.2],[440.9,5.1],[444.4,7.1],[448.0,5.1],[451.5,7.1],[490.3,7.1],[493.8,11.3],[497.4,36.3],[500.9,29.0],[507.9,25.9],[511.5,43.6],[515.0,33.2],[518.5,33.2],[532.6,76.9],[536.2,74.8],[546.7,17.5],[553.8,18.6],[560.8,43.6],[571.4,39.4],[578.5,55.1],[585.5,55.1],[589.1,59.2],[592.6,88.4],[596.1,95.7],[599.6,77.9],[606.7,83.2],[610.2,70.7],[613.8,70.7],[617.3,76.9],[620.8,66.5],[624.3,64.4],[627.9,68.6],[634.9,60.3],[638.4,62.3],[649.0,48.8],[652.6,48.8],[656.1,59.2],[666.7,43.6],[670.2,33.2],[673.7,33.2],[680.8,45.7],[691.4,80.1],[698.4,67.5],[701.9,67.5],[705.5,81.1],[709.0,83.2],[712.5,83.2],[716.0,75.9],[719.6,75.9],[723.1,81.1],[726.6,79.0],[730.2,86.3],[733.7,86.3],[740.7,110.3],[747.8,104.0],[751.3,107.1],[758.4,106.1],[769.0,163.4],[776.0,159.2],[779.5,146.7],[783.1,146.7],[790.1,131.1],[804.2,143.6],[811.3,157.1],[818.3,124.8],[825.4,126.9],[832.5,120.7],[839.5,126.9],[843.0,142.5],[850.1,147.7],[853.6,155.1],[860.7,136.3],[864.2,136.3],[871.3,174.8],[874.8,174.8],[878.3,179.0],[885.4,81.1],[892.4,26.9],[903.0,7.1],[913.6,7.1],[920.6,10.3],[934.7,5.1],[955.9,145.7],[966.5,137.3],[970.0,138.4],[973.5,147.7],[984.1,139.4],[998.2,144.6]]},"twd":{"num":"30.98","cur":"New Taiwan dollar","title":"1 United States Dollar equals","meta":"9 Nov, 9:19 am UTC · From Morningstar · Disclaimer","tabs":["1D","5D","1M","1Y","5Y","Max"],"active":"1M","ylab":["31.0","30.8","30.6","30.4"],"xlab":[["19 Oct",40],["31 Oct",72]],"share":"nodes","pts":[[0.0,200.4],[28.2,149.6],[31.7,148.5],[63.5,148.5],[95.2,166.9],[123.5,155.6],[134.0,155.6],[158.7,158.7],[162.3,160.8],[190.5,192.3],[194.0,193.3],[218.7,193.3],[250.4,188.3],[317.5,188.3],[331.6,192.3],[345.7,198.4],[349.2,197.4],[377.4,163.8],[412.7,129.2],[444.4,114.9],[476.2,87.4],[543.2,87.4],[575.0,197.4],[603.2,222.9],[634.9,166.9],[663.1,139.4],[698.4,111.9],[761.9,111.9],[793.7,54.8],[828.9,46.7],[857.1,57.9],[864.2,50.8],[888.9,19.2],[892.4,18.1],[924.2,24.2],[952.4,17.1],[973.5,17.1],[980.6,11.0],[987.7,10.0],[998.2,14.1]]}};

  var SHARE = {
    upload: '<svg viewBox="0 0 24 24" width="22" height="22" fill="#70757a"><path d="M12 3l4 4h-3v7h-2V7H8l4-4zm-7 9h2v7h10v-7h2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7z"/></svg>',
    nodes: '<svg viewBox="0 0 24 24" width="22" height="22" fill="#70757a"><path d="M18 16.1c-.8 0-1.5.3-2 .8l-7.1-4.2c.1-.2.1-.5.1-.7s0-.5-.1-.7L16 7.2c.5.5 1.2.8 2 .8a3 3 0 1 0-3-3c0 .2 0 .5.1.7L8 9.8a3 3 0 1 0 0 4.4l7.1 4.2c-.1.2-.1.4-.1.6a3 3 0 1 0 3-2.9z"/></svg>'
  };

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function buildChart(cfg) {
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 1000 300');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('class', 'fx-plot');

    var uid = 'fx' + Math.round(Math.random() * 1e9);

    // gridlines at each y label
    var n = cfg.ylab.length;
    for (var i = 0; i < n; i++) {
      var y = (300 / (n - 1)) * i;
      var line = document.createElementNS(NS, 'line');
      line.setAttribute('x1', 0); line.setAttribute('x2', 1000);
      line.setAttribute('y1', y); line.setAttribute('y2', y);
      line.setAttribute('class', 'fx-grid');
      svg.appendChild(line);
    }

    var defs = document.createElementNS(NS, 'defs');
    defs.innerHTML =
      '<linearGradient id="' + uid + 'g" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#34a853" stop-opacity=".28"/>' +
      '<stop offset="1" stop-color="#34a853" stop-opacity=".02"/></linearGradient>' +
      '<clipPath id="' + uid + 'c"><rect x="0" y="0" width="0" height="300"></rect></clipPath>';
    svg.appendChild(defs);

    var pts = cfg.pts;
    var lineStr = pts.map(function (p) { return p[0] + ',' + p[1]; }).join(' ');
    var areaStr = lineStr + ' ' + pts[pts.length - 1][0] + ',300 ' + pts[0][0] + ',300';

    var area = document.createElementNS(NS, 'polygon');
    area.setAttribute('points', areaStr);
    area.setAttribute('fill', 'url(#' + uid + 'g)');
    area.setAttribute('clip-path', 'url(#' + uid + 'c)');
    svg.appendChild(area);

    var path = document.createElementNS(NS, 'polyline');
    path.setAttribute('points', lineStr);
    path.setAttribute('class', 'fx-line');
    svg.appendChild(path);

    var end = pts[pts.length - 1];
    var dot = document.createElementNS(NS, 'circle');
    dot.setAttribute('cx', end[0]); dot.setAttribute('cy', end[1]);
    dot.setAttribute('r', 7);
    dot.setAttribute('class', 'fx-dot');
    svg.appendChild(dot);

    return { svg: svg, path: path, dot: dot, clipRect: defs.querySelector('rect') };
  }

  function build(mount, cfg) {
    var card = el('div', 'fx-card');

    var left = el('div', 'fx-left');
    left.appendChild(el('div', 'fx-eyebrow', cfg.title));
    var parts = cfg.num.split('.');
    left.appendChild(el('div', 'fx-big',
      '<span class="fx-count" data-target="' + cfg.num + '" data-dec="' + (parts[1] ? parts[1].length : 0) + '">0</span> ' + cfg.cur));
    left.appendChild(el('div', 'fx-meta',
      cfg.meta.replace('Disclaimer', '<span class="fx-dis">Disclaimer</span>')));
    left.appendChild(el('div', 'fx-box', '<span>1</span><span class="fx-cur">United States Dollar <i class="fx-caret"></i></span>'));
    left.appendChild(el('div', 'fx-box',
      '<span class="fx-count" data-target="' + cfg.num + '" data-dec="' + (parts[1] ? parts[1].length : 0) + '">0</span>' +
      '<span class="fx-cur">' + cfg.cur + ' <i class="fx-caret"></i></span>'));

    var right = el('div', 'fx-right');
    var tabs = el('div', 'fx-tabs');
    cfg.tabs.forEach(function (t) {
      tabs.appendChild(el('span', 'fx-tab' + (t === cfg.active ? ' fx-tab-on' : ''), t));
    });
    right.appendChild(tabs);

    var chartWrap = el('div', 'fx-chart');
    var ylabs = el('div', 'fx-ylabs');
    cfg.ylab.forEach(function (v) { ylabs.appendChild(el('span', null, v)); });
    chartWrap.appendChild(ylabs);
    var chart = buildChart(cfg);
    var plotBox = el('div', 'fx-plotbox');
    plotBox.appendChild(chart.svg);
    // x-axis date labels intentionally not rendered (removed at user request)
    chartWrap.appendChild(plotBox);
    right.appendChild(chartWrap);

    card.appendChild(el('div', 'fx-share', SHARE[cfg.share] || SHARE.nodes));
    card.appendChild(left);
    card.appendChild(right);
    mount.appendChild(card);

    return { card: card, chart: chart };
  }

  function countUp(node, dur) {
    var target = parseFloat(node.getAttribute('data-target'));
    var dec = parseInt(node.getAttribute('data-dec'), 10) || 0;
    var t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      node.textContent = (target * eased).toFixed(dec);
      if (p < 1) requestAnimationFrame(step);
      else node.textContent = target.toFixed(dec);
    }
    requestAnimationFrame(step);
  }

  function animate(built) {
    var path = built.chart.path;
    var len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;
    // force layout so the transition runs
    path.getBoundingClientRect();
    path.style.transition = 'stroke-dashoffset 2.2s linear';
    path.style.strokeDashoffset = '0';

    var rect = built.chart.clipRect;
    rect.setAttribute('width', 0);
    rect.style.transition = 'width 2.2s linear';
    // SVG attribute vs CSS: animate via CSS width on the rect (works for clipPath rects)
    requestAnimationFrame(function () { rect.style.width = '1000px'; });

    setTimeout(function () { built.chart.dot.classList.add('fx-dot-on'); }, 2150);

    built.card.querySelectorAll('.fx-count').forEach(function (n) { countUp(n, 1800); });
  }

  // Guarantee the finished state regardless of animation frames: if a card is
  // still mid-draw (or never got frames at all) it must not be left showing a
  // blank chart and a 0 rate.
  function settle(built) {
    var path = built.chart.path;
    path.style.transition = 'none';
    path.style.strokeDashoffset = '0';
    var rect = built.chart.clipRect;
    rect.style.transition = 'none';
    rect.style.width = '1000px';
    rect.setAttribute('width', 1000);
    built.chart.dot.classList.add('fx-dot-on');
    built.card.querySelectorAll('.fx-count').forEach(function (n) {
      var dec = parseInt(n.getAttribute('data-dec'), 10) || 0;
      n.textContent = parseFloat(n.getAttribute('data-target')).toFixed(dec);
    });
  }

  function init() {
    var mounts = document.querySelectorAll('.fx-mount');
    if (!mounts.length) return;
    var pending = [];
    mounts.forEach(function (m) {
      var cfg = CARDS[m.getAttribute('data-fx')];
      if (!cfg) return;
      pending.push(build(m, cfg));
    });
    if (!('IntersectionObserver' in window)) {
      pending.forEach(animate);
      return;
    }
    var seen = new WeakSet();
    var run = function (b) {
      if (seen.has(b.card)) return;
      seen.add(b.card);
      animate(b);
    };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        pending.forEach(function (b) { if (b.card === entry.target) run(b); });
        io.unobserve(entry.target);
      });
    }, { threshold: 0.35 });
    pending.forEach(function (b) { io.observe(b.card); });
    // Insurance: if the observer never fires — element inside a collapsed tab or
    // accordion, a zero-size viewport, an odd embed context — the cards would sit
    // forever with no line and a 0 rate, which reads as broken. Draw them anyway,
    // then hard-set the finished state so nothing can be left half-drawn.
    setTimeout(function () { pending.forEach(run); }, 5000);
    setTimeout(function () { pending.forEach(settle); }, 9000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
