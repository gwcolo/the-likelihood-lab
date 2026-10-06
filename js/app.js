/*
 * app.js — UI layer for The Likelihood Lab.
 *
 * Consumes the math layer (MLEDistributions) and the curated datasets
 * (MLEDatasets); owns all rendering and interaction state. Per-distribution
 * state (slider values, chosen dataset, attempts, reveal) is kept in memory
 * for the whole session, so switching distributions never loses work.
 *
 * Attempt rule: one attempt is recorded per slider *release* ('change' event);
 * live dragging ('input' event) only updates the curve and readout.
 */

(function () {
  'use strict';

  var D = MLEDistributions;
  var DS = MLEDatasets;

  /* Model registry: the density distributions plus the Gaussian Process
     (kind: 'regression'). Everything downstream keys off model.kind. */
  var MODELS = D.list.concat([MLEGaussianProcess.model]);
  var MODEL_BY_KEY = {};
  MODELS.forEach(function (m) { MODEL_BY_KEY[m.key] = m; });

  /* Marker semantics: blue = the student (their curve, their best attempt),
     orange = the current slider setting, green = the revealed MLE answer,
     red = impossible, gray = past attempts. */
  var COL = {
    curve: '#2a78d6', mle: '#008300', best: '#2a78d6', bad: '#d03b3b',
    now: '#eb6834', good: '#0ca30c',
    ink: '#0b0b0b', sec: '#52514e', muted: '#898781',
    grid: '#e1e0d9', axis: '#c3c2b7', hist: '#eceae4', histEdge: '#dcdad2'
  };

  /* Student-facing slider guidance, shown in the readout panel. */
  var GUIDES = {
    normal: 'μ slides the peak; σ widens or narrows it. The curve stays symmetric no matter what.',
    uniform: 'Every point inside [a, b] gets the same density, 1/(b − a) — only the endpoints matter. A tighter interval is taller, right up until a point falls outside.',
    triangle: 'c places the peak; w is how far the density reaches before hitting zero. Points near the edges are barely probable — and outside, impossible.',
    lognormal: 'A Normal fitted to log(x): μ is the center and σ the spread, both on the log scale. Small σ looks almost symmetric; large σ throws a long right tail.',
    gamma: 'The tricky one — neither slider moves the peak directly. Shape k sets the form: k ≤ 1 piles density against zero; larger k grows a hump that drifts right and looks ever more Normal. Scale θ stretches the whole curve horizontally. Handy anchors: the mean is k·θ, and for k > 1 the peak sits at (k − 1)·θ.',
    gp: 'Three dials on one machine. ℓ sets how far apart two x’s can be and still move together (the wiggle length); σf is how far the function itself ranges; σn is how much vertical scatter you write off as noise. Fair warning: unlike the other tabs, this score has multiple hills — tuning one slider at a time can strand you on the wrong one. If you get stuck, jump somewhere far away and climb again.'
  };

  // ------------------------------------------------------------ DOM helpers

  var SVGNS = 'http://www.w3.org/2000/svg';

  function svgEl(tag, attrs, parent) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  function htmlEl(tag, cls, parent, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }

  var fmt = function (v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString(); };

  // ------------------------------------------------------------ session state

  var state = {};
  MODELS.forEach(function (dist) {
    var params = {};
    dist.params.forEach(function (p) { params[p.key] = p.default; });
    state[dist.key] = {
      datasetIdx: 0,
      params: params,
      reveal: false,
      attempts: {},    // datasetIdx -> [{params, ll}]
      mleCache: {},    // datasetIdx -> {params, ll}
      targetCache: {}  // datasetIdx -> best log-likelihood reachable on the slider grid
    };
  });
  var activeKey = MODELS[0].key;

  function dist() { return MODEL_BY_KEY[activeKey]; }
  function isReg() { return dist().kind === 'regression'; }
  function st() { return state[activeKey]; }
  function dataset() { return DS[activeKey][st().datasetIdx]; }

  function attempts() {
    var s = st();
    if (!s.attempts[s.datasetIdx]) s.attempts[s.datasetIdx] = [];
    return s.attempts[s.datasetIdx];
  }

  function mleInfo() {
    // GP answers are precomputed offline (non-convex surface, no closed form)
    // and embedded in the dataset entry by tools/generate-datasets.js
    if (isReg()) return { params: dataset().mle, ll: dataset().mleLL };
    var s = st();
    if (!s.mleCache[s.datasetIdx]) {
      var m = dist().mle(dataset().data);
      s.mleCache[s.datasetIdx] = { params: m, ll: dist().logLik(dataset().data, m) };
    }
    return s.mleCache[s.datasetIdx];
  }

  /* Challenge target: the best log-likelihood actually reachable with the
     sliders' discrete steps. The exact MLE usually sits between steps, so the
     target is computed by snapping the MLE to the grid and searching ±3 steps
     in each parameter — every candidate is a settable slider position, which
     guarantees students can reach the target exactly. */
  var TARGET_TOL = 0.5;

  function targetLL() {
    // GP: the embedded MLE is already the best grid point (exhaustive offline
    // search over the slider grid), so it IS the reachable target.
    if (isReg()) return dataset().mleLL;
    var s = st();
    if (s.targetCache[s.datasetIdx] == null) {
      var ps = dist().params;
      var m = mleInfo().params;
      var grids = ps.map(function (p) {
        var snapped = p.min + Math.round((m[p.key] - p.min) / p.step) * p.step;
        var vals = [];
        for (var k = -3; k <= 3; k++) {
          var v = +(snapped + k * p.step).toFixed(4);
          if (v >= p.min - 1e-9 && v <= p.max + 1e-9) vals.push(v);
        }
        return vals;
      });
      var best = -Infinity;
      grids[0].forEach(function (v0) {
        grids[1].forEach(function (v1) {
          var pp = {};
          pp[ps[0].key] = v0;
          pp[ps[1].key] = v1;
          var ll = dist().logLik(dataset().data, pp);
          if (ll > best) best = ll;
        });
      });
      s.targetCache[s.datasetIdx] = best;
    }
    return s.targetCache[s.datasetIdx];
  }

  /* Score the current params, with diagnostics for the readout.
     invalid = the params don't define a distribution at all (Uniform a >= b);
     zeroCount = observed points with density exactly 0 (the -Infinity case). */
  function llStatus(params) {
    if (isReg()) {
      // GP score is always finite (σn is bounded away from 0): no invalid or
      // impossible states exist on this tab
      return { invalid: false, ll: dist().score(dataset(), params), zeroCount: 0 };
    }
    if (activeKey === 'uniform' && params.lower >= params.upper) {
      return { invalid: true, ll: -Infinity, zeroCount: 0 };
    }
    var data = dataset().data, zero = 0;
    for (var i = 0; i < data.length; i++) {
      if (dist().pdf(data[i], params) <= 0) zero++;
    }
    return { invalid: false, ll: dist().logLik(data, params), zeroCount: zero };
  }

  function bestAttempt() {
    var best = null;
    attempts().forEach(function (a) {
      if (isFinite(a.ll) && (best === null || a.ll > best.ll)) best = a;
    });
    return best;
  }

  // ------------------------------------------------------------ axis helpers

  function niceTicks(lo, hi) {
    var span = hi - lo;
    var step = span > 14 ? 4 : span > 7 ? 2 : span > 3 ? 1 : 0.5;
    var t = [];
    for (var x = Math.ceil(lo / step) * step; x <= hi + 1e-9; x += step) t.push(x);
    return t;
  }

  // ------------------------------------------------------------ main plot

  var mainRefs = null; // {svg, curvePath, mlePath, geom} rebuilt per dataset

  /* Fixed geometry per dataset: x-range padded around the data, y-range from the
     histogram and the MLE curve — so the scale never jumps while dragging. */
  function mainGeometry() {
    var data = dataset().data;
    var dlo = Math.min.apply(null, data), dhi = Math.max.apply(null, data);
    var pad = (dhi - dlo) * 0.15 + 0.3;
    var xlo = activeKey === 'gamma' ? Math.max(0.001, dlo - pad) : dlo - pad;
    var xhi = dhi + pad;

    // histogram: ~sqrt(n) bins, density scale
    var nBins = Math.max(6, Math.round(Math.sqrt(data.length)));
    var bw = (dhi - dlo) / nBins || 1;
    var bins = new Array(nBins).fill(0);
    data.forEach(function (x) {
      var b = Math.min(nBins - 1, Math.floor((x - dlo) / bw));
      bins[b]++;
    });
    var dens = bins.map(function (c) { return c / (data.length * bw); });

    // y-max: whichever is taller of the histogram and the MLE curve
    var mleP = mleInfo().params, mleMax = 0;
    for (var i = 0; i <= 400; i++) {
      var x = xlo + (xhi - xlo) * i / 400;
      mleMax = Math.max(mleMax, dist().pdf(x, mleP));
    }
    var ymax = Math.max(Math.max.apply(null, dens), mleMax) * 1.3;

    return { xlo: xlo, xhi: xhi, ymax: ymax, dlo: dlo, bw: bw, dens: dens };
  }

  function curvePathD(params, g, sx, sy) {
    var d = '';
    for (var i = 0; i <= 600; i++) {
      var x = g.xlo + (g.xhi - g.xlo) * i / 600;
      var y = Math.min(dist().pdf(x, params), g.ymax * 1.5); // clip runaway spikes
      d += (i ? 'L' : 'M') + sx(x).toFixed(1) + ',' + sy(y).toFixed(1);
    }
    return d;
  }

  /* Regression main plot: scatter of (x, y), the student's GP posterior mean
     with a translucent ±2 sd predictive band, and the (revealable) MLE fit. */
  var GP_GRID_N = 160;

  function drawMainRegression() {
    var wrap = document.getElementById('main-plot');
    wrap.textContent = '';
    var W = 720, H = 360, L = 16, R = 16, T = 18, B = 30;
    var pw = W - L - R, ph = H - T - B;
    var ds = dataset();

    // fixed geometry per dataset — the scale never jumps mid-drag
    var xlo = Math.min.apply(null, ds.x), xhi = Math.max.apply(null, ds.x);
    var xpad = (xhi - xlo) * 0.04 + 0.1;
    xlo -= xpad; xhi += xpad;
    var ylo = Math.min.apply(null, ds.y), yhi = Math.max.apply(null, ds.y);
    var ypad = (yhi - ylo) * 0.35 + 0.3; // headroom so bands stay visible
    ylo -= ypad; yhi += ypad;

    var sx = function (x) { return L + (x - xlo) / (xhi - xlo) * pw; };
    var sy = function (y) { return T + ph - (y - ylo) / (yhi - ylo) * ph; };
    var grid = [];
    for (var i = 0; i <= GP_GRID_N; i++) grid.push(xlo + (xhi - xlo) * i / GP_GRID_N);

    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img',
      'aria-label': dist().label + ' fit over the ' + ds.label + ' dataset' }, wrap);

    // y = 0 reference hairline (data are centered), baseline + x ticks
    svgEl('line', { x1: L, y1: sy(0), x2: L + pw, y2: sy(0), stroke: COL.grid }, svg);
    svgEl('line', { x1: L, y1: T + ph, x2: L + pw, y2: T + ph, stroke: COL.axis }, svg);
    niceTicks(xlo, xhi).forEach(function (t) {
      svgEl('line', { x1: sx(t), y1: T + ph, x2: sx(t), y2: T + ph + 4, stroke: COL.axis }, svg);
      svgEl('text', { x: sx(t), y: T + ph + 17, 'text-anchor': 'middle',
        'font-size': 11.5, fill: COL.muted }, svg).textContent = fmt(t, 1);
    });

    // path builders shared with updateCurve via mainRefs
    function meanD(post) {
      var d = '';
      for (var j = 0; j <= GP_GRID_N; j++) {
        d += (j ? 'L' : 'M') + sx(grid[j]).toFixed(1) + ',' + sy(post.mean[j]).toFixed(1);
      }
      return d;
    }
    function bandD(post) {
      var d = '';
      for (var j = 0; j <= GP_GRID_N; j++) {
        d += (j ? 'L' : 'M') + sx(grid[j]).toFixed(1) + ',' + sy(post.mean[j] + 2 * post.sd[j]).toFixed(1);
      }
      for (var k = GP_GRID_N; k >= 0; k--) {
        d += 'L' + sx(grid[k]).toFixed(1) + ',' + sy(post.mean[k] - 2 * post.sd[k]).toFixed(1);
      }
      return d + 'Z';
    }

    // MLE fit (revealed on demand), under the student's
    var mlePost = dist().posterior(ds.x, ds.y, mleInfo().params, grid);
    var mleGroup = svgEl('g', {}, svg);
    svgEl('path', { d: bandD(mlePost), fill: 'none', stroke: COL.mle,
      'stroke-width': 1, 'stroke-dasharray': '3 4', opacity: 0.7 }, mleGroup);
    svgEl('path', { d: meanD(mlePost), fill: 'none', stroke: COL.mle,
      'stroke-width': 2, 'stroke-dasharray': '7 5' }, mleGroup);
    mleGroup.style.display = st().reveal ? '' : 'none';

    // student's fit — band + mean, updated live during a drag
    var post = dist().posterior(ds.x, ds.y, st().params, grid);
    var bandPath = svgEl('path', { d: bandD(post), fill: COL.curve,
      'fill-opacity': 0.12, stroke: 'none' }, svg);
    var meanPath = svgEl('path', { d: meanD(post), fill: 'none',
      stroke: COL.curve, 'stroke-width': 2.5 }, svg);

    // data points on top
    ds.x.forEach(function (x, j) {
      svgEl('circle', { cx: sx(x).toFixed(1), cy: sy(ds.y[j]).toFixed(1), r: 3,
        fill: COL.muted, opacity: 0.75 }, svg);
    });

    mainRefs = { kind: 'reg', bandPath: bandPath, meanPath: meanPath,
      mleEl: mleGroup, grid: grid, meanD: meanD, bandD: bandD };
  }

  function drawMain() {
    if (isReg()) { drawMainRegression(); return; }
    var wrap = document.getElementById('main-plot');
    wrap.textContent = '';
    var W = 720, H = 360, L = 16, R = 16, T = 18, B = 30;
    var pw = W - L - R, ph = H - T - B;
    var g = mainGeometry();
    var sx = function (x) { return L + (x - g.xlo) / (g.xhi - g.xlo) * pw; };
    var sy = function (y) { return T + ph - Math.min(y / g.ymax, 1.02) * ph; };

    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img',
      'aria-label': dist().label + ' fit over the ' + dataset().label + ' dataset' }, wrap);

    // histogram (density scale) behind everything
    g.dens.forEach(function (dv, i) {
      if (!dv) return;
      var x0 = sx(g.dlo + i * g.bw), x1 = sx(g.dlo + (i + 1) * g.bw);
      svgEl('rect', { x: x0.toFixed(1), y: sy(dv).toFixed(1),
        width: Math.max(0, x1 - x0 - 1).toFixed(1),
        height: (T + ph - sy(dv)).toFixed(1),
        fill: COL.hist, stroke: COL.histEdge, 'stroke-width': 0.5 }, svg);
    });

    // baseline + ticks
    svgEl('line', { x1: L, y1: T + ph, x2: L + pw, y2: T + ph, stroke: COL.axis }, svg);
    niceTicks(g.xlo, g.xhi).forEach(function (t) {
      svgEl('line', { x1: sx(t), y1: T + ph, x2: sx(t), y2: T + ph + 4, stroke: COL.axis }, svg);
      svgEl('text', { x: sx(t), y: T + ph + 17, 'text-anchor': 'middle',
        'font-size': 11.5, fill: COL.muted }, svg).textContent = fmt(t, 1);
    });

    // rug of observations
    dataset().data.forEach(function (x) {
      svgEl('line', { x1: sx(x).toFixed(1), y1: T + ph, x2: sx(x).toFixed(1), y2: T + ph - 11,
        stroke: COL.muted, 'stroke-width': 1, opacity: 0.55 }, svg);
    });

    // MLE curve (revealed on demand) under the student's curve
    var mlePath = svgEl('path', { fill: 'none', stroke: COL.mle, 'stroke-width': 2,
      'stroke-dasharray': '7 5', d: curvePathD(mleInfo().params, g, sx, sy) }, svg);
    mlePath.style.display = st().reveal ? '' : 'none';

    // the student's curve — the only element updated during a drag
    var curvePath = svgEl('path', { fill: 'none', stroke: COL.curve, 'stroke-width': 2.5,
      d: curvePathD(st().params, g, sx, sy) }, svg);

    mainRefs = { kind: 'den', curvePath: curvePath, mleEl: mlePath, g: g, sx: sx, sy: sy };
  }

  function updateCurve() {
    var r = mainRefs;
    if (r.kind === 'reg') {
      var post = dist().posterior(dataset().x, dataset().y, st().params, r.grid);
      r.bandPath.setAttribute('d', r.bandD(post));
      r.meanPath.setAttribute('d', r.meanD(post));
      return;
    }
    r.curvePath.setAttribute('d', curvePathD(st().params, r.g, r.sx, r.sy));
  }

  // ------------------------------------------------------------ readout

  function updateReadout() {
    var box = document.getElementById('readout');
    box.textContent = '';
    var s = llStatus(st().params);
    var isChallenge = !!dataset().challenge;
    var target = isChallenge ? targetLL() : null;
    // "won" tracks the CURRENT setting, so the highlight follows the sliders live
    var wonNow = isChallenge && !s.invalid && isFinite(s.ll) && s.ll >= target - TARGET_TOL;

    htmlEl('p', 'score-label', box,
      isReg() ? 'Current log marginal likelihood' : 'Current log-likelihood');
    if (s.invalid) {
      htmlEl('p', 'score bad', box, 'not a valid distribution');
      htmlEl('p', 'why', box, 'The lower bound must be below the upper bound.');
    } else if (!isFinite(s.ll)) {
      htmlEl('p', 'score bad', box, '−∞ (impossible)');
      htmlEl('p', 'why', box, s.zeroCount + ' of ' + dataset().data.length +
        ' points have probability zero under this curve.');
    } else {
      htmlEl('p', 'score' + (wonNow ? ' won' : ''), box, fmt(s.ll, 1));
      htmlEl('p', 'why', box, wonNow ? 'This setting hits the target.'
        : 'Higher (closer to zero) is better.');
    }

    var best = bestAttempt();
    var rowB = htmlEl('p', 'row', box);
    rowB.appendChild(htmlEl('span', 'dot best'));
    rowB.appendChild(document.createTextNode('Best attempt: '));
    htmlEl('b', null, rowB, best ? fmt(best.ll, 1) : '—');
    if (best) {
      // remind the student WHICH setting was their best — one line per
      // parameter (confirmed: scannable, especially with the GP's three)
      dist().params.forEach(function (p) {
        htmlEl('p', 'row param-line', box, p.label + ' = ' + fmt(best.params[p.key]));
      });
    }

    if (isChallenge) {
      var rowT = htmlEl('p', 'row', box);
      rowT.appendChild(document.createTextNode('Target score: '));
      htmlEl('b', null, rowT, fmt(target, 1));
      if (best && best.ll >= target - TARGET_TOL) {
        htmlEl('p', 'row target-hit', box,
          'Target reached — you found the maximum likelihood fit yourself.');
      } else {
        htmlEl('p', 'row', box, 'Get within ' + TARGET_TOL +
          ' of the target — it is reachable with these sliders.');
      }
    }

    if (st().reveal) {
      var rowM = htmlEl('p', 'row', box);
      rowM.appendChild(htmlEl('span', 'dot mle'));
      rowM.appendChild(document.createTextNode('MLE (the answer): '));
      htmlEl('b', null, rowM, fmt(mleInfo().ll, 1));
      var m = mleInfo().params;
      dist().params.forEach(function (p) {
        htmlEl('p', 'row param-line', box, p.label + ' = ' + fmt(m[p.key]));
      });
    }

    updateInfoStrip();
  }

  /* Guide text + (GP only) the live kernel figure, in a full-width strip below
     the plot — moved out of the readout column so a tall commentary can never
     push the attempt panels down (confirmed layout fix). Rebuilt with every
     readout update, so the kernel figure stays live. */
  function updateInfoStrip() {
    var strip = document.getElementById('info-strip');
    strip.textContent = '';
    var guide = htmlEl('p', 'guide', strip);
    htmlEl('b', null, guide, 'What the sliders do. ');
    guide.appendChild(document.createTextNode(GUIDES[activeKey]));
    if (isReg()) drawKernelFigure(strip);
  }

  /* Live kernel figure (GP only): covariance k(x − x′) plotted on BOTH sides of
     zero (confirmed design — symmetric display reads as a real covariance
     function and makes the central noise spike clearer). Rebuilt on every
     readout update, so it tracks the sliders live. */
  function drawKernelFigure(box) {
    var wrap = htmlEl('div', 'kernel-fig', box);
    htmlEl('p', 'kf-title', wrap, 'The kernel: covariance vs x − x′');
    var W = 260, H = 116, L = 10, R = 10, T = 14, B = 20;
    var pw = W - L - R, ph = H - T - B;
    var p = st().params;
    var sf2 = p.signal * p.signal, sn2 = p.noise * p.noise;
    var ymax = (sf2 + sn2) * 1.18;
    var RMAX = 5; // domain is [−RMAX, RMAX]
    var sx = function (r) { return L + ((r + RMAX) / (2 * RMAX)) * pw; };
    var sy = function (k) { return T + ph - (k / ymax) * ph; };

    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img',
      'aria-label': 'kernel function at the current settings' }, wrap);
    svgEl('line', { x1: L, y1: T + ph, x2: L + pw, y2: T + ph, stroke: COL.axis }, svg);
    [-RMAX, 0, RMAX].forEach(function (t, i) {
      svgEl('text', { x: sx(t), y: H - 6, 'font-size': 10, fill: COL.muted,
        'text-anchor': i === 0 ? 'start' : (i === 2 ? 'end' : 'middle') }, svg)
        .textContent = t === 0 ? '0' : fmt(t, 0);
    });

    // signal covariance curve (blue, like the student's fit), symmetric in r
    var d = '';
    for (var i = 0; i <= 240; i++) {
      var r = -RMAX + 2 * RMAX * i / 240;
      d += (i ? 'L' : 'M') + sx(r).toFixed(1) + ',' + sy(dist().kernel(Math.abs(r), p)).toFixed(1);
    }
    svgEl('path', { d: d, fill: 'none', stroke: COL.curve, 'stroke-width': 2 }, svg);

    // the noise spike at x = x′: k(0) jumps from σf² to σf² + σn²
    svgEl('line', { x1: sx(0), y1: sy(sf2), x2: sx(0), y2: sy(sf2 + sn2),
      stroke: COL.sec, 'stroke-width': 2 }, svg);
    svgEl('circle', { cx: sx(0), cy: sy(sf2 + sn2), r: 3, fill: COL.sec }, svg);
    svgEl('text', { x: sx(0) + 6, y: sy(sf2 + sn2) + 3, 'font-size': 10.5,
      fill: COL.sec }, svg).textContent = '+σn²  (k(0) = ' + fmt(sf2 + sn2) + ')';
    svgEl('text', { x: sx(-0.35) - 4, y: sy(dist().kernel(0.35, p)) + 12, 'text-anchor': 'end',
      'font-size': 10.5, fill: COL.sec }, svg).textContent = 'σf² = ' + fmt(sf2);
  }

  // ------------------------------------------------------------ trace plots

  /* Adaptive y-window: anchored at the best finite attempt, floored so a few
     terrible attempts can't crush the scale (the confirmed display decision).
     Attempts below the floor — including -Infinity — are pinned at the floor
     line as open circles. */
  function traceWindow() {
    var fin = attempts().filter(function (a) { return isFinite(a.ll); })
      .map(function (a) { return a.ll; }).sort(function (a, b) { return b - a; });
    if (!fin.length) return null;
    var best = fin[0];
    var q90 = fin[Math.min(fin.length - 1, Math.floor(fin.length * 0.9))];
    var floor = Math.min(Math.max(best - 200, q90 - 2), best - 10);
    return { floor: floor, best: best };
  }

  /* Trace geometry shared by drawTraces, the live guides, and click-to-set. */
  var TR = { W: 340, H: 200, L: 12, R: 12, T: 12, B: 26 };
  TR.pw = TR.W - TR.L - TR.R;
  TR.ph = TR.H - TR.T - TR.B;

  var traceCtx = {}; // p.key -> {line, dot, sy, win} for live marker updates

  function drawTraces() {
    var win = traceWindow();
    var list = attempts();
    var best = bestAttempt();
    traceCtx = {};

    // low-key progress note (deliberately not in the score panel — this is a
    // tracker, not a grade)
    var n = list.length;
    document.getElementById('attempt-count').textContent =
      n ? n + (n === 1 ? ' attempt' : ' attempts') + ' so far on this dataset.' : '';

    dist().params.forEach(function (p) {
      var holder = panelRefs[p.key].holder;
      holder.textContent = '';

      var L = TR.L, T = TR.T, pw = TR.pw, ph = TR.ph;
      var svg = svgEl('svg', { viewBox: '0 0 ' + TR.W + ' ' + TR.H, role: 'img',
        'aria-label': 'attempts for ' + p.label + ' — click or drag to set it' }, holder);

      var sx = function (v) { return L + (v - p.min) / (p.max - p.min) * pw; };

      // clicking or dragging inside the panel sets the parameter directly
      attachTracePointer(svg, p);

      // axes
      svgEl('line', { x1: L, y1: T + ph, x2: L + pw, y2: T + ph, stroke: COL.axis }, svg);
      [p.min, p.max].forEach(function (v, i) {
        svgEl('text', { x: sx(v), y: T + ph + 15, 'font-size': 10.5, fill: COL.muted,
          'text-anchor': i ? 'end' : 'start' }, svg).textContent = fmt(v, 2);
      });

      // MLE marker when revealed
      if (st().reveal) {
        var mx = sx(mleInfo().params[p.key]);
        svgEl('line', { x1: mx, y1: T, x2: mx, y2: T + ph, stroke: COL.mle,
          'stroke-dasharray': '5 4', 'stroke-width': 1.2 }, svg);
        // label sits left of the line (attempts cluster to its right at the top)
        var onLeft = mx > L + pw * 0.15;
        svgEl('text', { x: onLeft ? mx - 5 : mx + 5, y: T + 10, 'font-size': 10.5,
          fill: COL.mle, 'text-anchor': onLeft ? 'end' : 'start' }, svg)
          .textContent = 'MLE';
      }

      // current setting: orange line, plus a dot at its live score (added below
      // once the y-scale exists)
      var guideLine = svgEl('line', { x1: sx(st().params[p.key]), y1: T,
        x2: sx(st().params[p.key]), y2: T + ph,
        stroke: COL.now, 'stroke-width': 1.2, opacity: 0.7 }, svg);
      traceCtx[p.key] = { line: guideLine, dot: null, sx: sx, sy: null, win: win };

      if (!win) {
        var msg = list.length
          ? ['Every attempt so far was impossible —', 'widen the curve and try again']
          : ['Move a slider — or click here — and release', 'to record your first attempt'];
        msg.forEach(function (t, i) {
          svgEl('text', { x: TR.W / 2, y: T + ph / 2 - 8 + i * 17, 'text-anchor': 'middle',
            'font-size': 12, fill: COL.muted }, svg).textContent = t;
        });
        return;
      }

      var span = (win.best - win.floor) || 1;
      var sy = function (ll) { return T + 8 + (win.best - ll) / span * (ph - 16); };

      // y labels: best (top) and floor (bottom)
      svgEl('text', { x: L + 2, y: sy(win.best) - 6, 'font-size': 10.5, fill: COL.muted }, svg)
        .textContent = fmt(win.best, 1);
      svgEl('text', { x: L + 2, y: sy(win.floor) - 5, 'font-size': 10.5, fill: COL.muted }, svg)
        .textContent = fmt(win.floor, 1) + ' and below';

      list.forEach(function (a) {
        var x = sx(a.params[p.key]);
        var pinned = !isFinite(a.ll) || a.ll < win.floor;
        var isBest = best && a === best;
        var mark;
        if (pinned) {
          // impossible (or far-below-floor) attempts: red X pinned at the floor
          var y = sy(win.floor), r = 3.5;
          mark = svgEl('path', {
            d: 'M' + (x - r) + ' ' + (y - r) + 'L' + (x + r) + ' ' + (y + r) +
               'M' + (x + r) + ' ' + (y - r) + 'L' + (x - r) + ' ' + (y + r),
            stroke: COL.bad, 'stroke-width': 1.8, fill: 'none'
          }, svg);
        } else {
          mark = svgEl('circle', {
            cx: x.toFixed(1), cy: sy(a.ll).toFixed(1),
            r: isBest ? 5 : 3.5,
            fill: isBest ? COL.best : COL.muted,
            stroke: isBest ? COL.best : 'none', 'stroke-width': 2,
            'fill-opacity': isBest ? 1 : 0.75
          }, svg);
          if (isBest) {
            svgEl('circle', { cx: x.toFixed(1), cy: sy(a.ll).toFixed(1), r: 8,
              fill: 'none', stroke: COL.best, 'stroke-width': 1, opacity: 0.6 }, svg);
          }
        }
        svgEl('title', {}, mark).textContent =
          dist().params.map(function (q) { return q.label + ' = ' + fmt(a.params[q.key]); }).join(', ') +
          ' → ' + (isFinite(a.ll) ? fmt(a.ll, 1) : '−∞ (impossible)');
      });

      // the live current-setting dot rides on top of everything
      var ctx = traceCtx[p.key];
      ctx.sy = sy;
      ctx.dot = svgEl('circle', { r: 4.5, fill: COL.now, stroke: '#fff',
        'stroke-width': 1.5 }, svg);
      svgEl('title', {}, ctx.dot).textContent = 'your current setting';
    });
    updateTraceGuides();
  }

  /* Cheap live update while dragging: move the orange line to the current
     parameter value and the orange dot to the current score (pinned at the
     floor when the score is impossible or below the window). */
  function updateTraceGuides() {
    var s = llStatus(st().params);
    dist().params.forEach(function (p) {
      var ctx = traceCtx[p.key];
      if (!ctx) return;
      var x = ctx.sx(st().params[p.key]);
      ctx.line.setAttribute('x1', x);
      ctx.line.setAttribute('x2', x);
      if (ctx.dot) {
        var win = ctx.win;
        var y = (isFinite(s.ll) && s.ll >= win.floor) ? ctx.sy(s.ll) : ctx.sy(win.floor);
        ctx.dot.setAttribute('cx', x);
        ctx.dot.setAttribute('cy', y);
        ctx.dot.style.display = s.invalid ? 'none' : '';
      }
    });
  }

  /* Click or drag inside a trace panel to set its parameter; releasing records
     an attempt, exactly like releasing the slider. */
  function attachTracePointer(svg, p) {
    var dragging = false;
    function apply(e) {
      var rect = svg.getBoundingClientRect();
      var xView = (e.clientX - rect.left) / rect.width * TR.W;
      var v = p.min + (xView - TR.L) / TR.pw * (p.max - p.min);
      v = Math.max(p.min, Math.min(p.max, v));
      v = +(p.min + Math.round((v - p.min) / p.step) * p.step).toFixed(2);
      setParam(p, v);
    }
    svg.addEventListener('pointerdown', function (e) {
      dragging = true;
      try { svg.setPointerCapture(e.pointerId); } catch (err) { /* no live pointer */ }
      apply(e);
      e.preventDefault();
    });
    svg.addEventListener('pointermove', function (e) {
      if (dragging) apply(e);
    });
    ['pointerup', 'pointercancel'].forEach(function (ev) {
      svg.addEventListener(ev, function () {
        if (!dragging) return;
        dragging = false;
        recordAttempt();
      });
    });
  }

  // ------------------------------------------------------------ controls

  var panelRefs = {}; // p.key -> {holder, input, val}

  /* Set a parameter from any control (slider or trace-panel click) and sync
     every view live. */
  function setParam(p, v) {
    st().params[p.key] = v;
    panelRefs[p.key].input.value = v;
    panelRefs[p.key].val.textContent = fmt(v);
    updateCurve();
    updateReadout();
    updateTraceGuides();
  }

  /* One attempt per release — shared by slider 'change' and trace pointer-up. */
  function recordAttempt() {
    var s = llStatus(st().params);
    if (s.invalid) return; // "not a distribution" isn't an attempt
    attempts().push({ params: Object.assign({}, st().params), ll: s.ll });
    drawTraces();
    updateReadout();
  }

  /* One card per parameter: the slider on top, its attempts plot directly
     below — the control and its trace read as a single connected object. */
  function buildParamPanels() {
    var wrap = document.getElementById('param-panels');
    wrap.textContent = '';
    panelRefs = {};
    dist().params.forEach(function (p) {
      var cell = htmlEl('div', 'param-panel', wrap);
      var row = htmlEl('div', 'slider-row', cell);
      var label = htmlEl('label', null, row, p.label + ': ');
      var val = htmlEl('span', 'val', label, fmt(st().params[p.key]));
      var input = document.createElement('input');
      input.type = 'range';
      input.min = p.min; input.max = p.max; input.step = p.step;
      input.value = st().params[p.key];
      input.setAttribute('aria-label', p.label);
      row.appendChild(input);
      var holder = htmlEl('div', 'trace-holder', cell);
      panelRefs[p.key] = { holder: holder, input: input, val: val };

      input.addEventListener('input', function () {
        st().params[p.key] = +input.value;
        val.textContent = fmt(+input.value);
        updateCurve();
        updateReadout();
        updateTraceGuides();
      });
      input.addEventListener('change', recordAttempt);
    });
  }

  function buildDatasetSelect() {
    var sel = document.getElementById('dataset-select');
    sel.textContent = '';
    DS[activeKey].forEach(function (ds, i) {
      var opt = document.createElement('option');
      opt.value = i;
      opt.textContent = (i + 1) + '. ' + ds.label + ' (n = ' + (ds.data || ds.x).length + ')';
      sel.appendChild(opt);
    });
    sel.value = st().datasetIdx;
    document.getElementById('dataset-note').textContent = dataset().note;
  }

  function buildTabs() {
    var nav = document.getElementById('dist-tabs');
    nav.textContent = '';
    MODELS.forEach(function (d) {
      var b = htmlEl('button', null, nav, d.label);
      b.type = 'button';
      b.setAttribute('aria-pressed', d.key === activeKey);
      b.addEventListener('click', function () {
        if (activeKey === d.key) return;
        activeKey = d.key;
        renderAll();
      });
    });
  }

  function updateRevealButton() {
    var b = document.getElementById('btn-reveal');
    b.textContent = st().reveal ? 'Hide the MLE answer' : 'Show the MLE answer';
    b.setAttribute('aria-pressed', st().reveal);
  }

  function buildLegend() {
    var lg = document.getElementById('legend');
    lg.textContent = '';
    var items = isReg()
      ? [['var(--curve)', 'your fit (mean ± 2 sd band)'],
         ['var(--mle)', 'MLE answer (when revealed)'],
         ['var(--muted)', 'data points']]
      : [['var(--curve)', 'your curve'],
         ['var(--mle)', 'MLE answer (when revealed)'],
         ['var(--grid)', 'data (histogram and rug)']];
    items.forEach(function (pair) {
      var sw = htmlEl('span', 'swatch', lg);
      sw.style.background = pair[0];
      lg.appendChild(document.createTextNode(' ' + pair[1]));
    });
  }

  /* Full redraw: distribution or dataset changed. */
  function renderAll() {
    buildTabs();
    buildDatasetSelect();
    buildLegend();
    buildParamPanels();
    drawMain();
    drawTraces();
    updateReadout();
    // challenge datasets have no reveal — the target score replaces it
    document.getElementById('btn-reveal').style.display =
      dataset().challenge ? 'none' : '';
    updateRevealButton();
  }

  // ------------------------------------------------------------ wire up + init

  /* A fresh dataset starts clean: sliders back to the neutral start (so the
     curve is never stranded off-plot) and the answer hidden. */
  function gotoDataset(idx) {
    st().datasetIdx = idx;
    st().reveal = false;
    dist().params.forEach(function (p) { st().params[p.key] = p.default; });
    renderAll();
  }

  document.getElementById('dataset-select').addEventListener('change', function (e) {
    gotoDataset(+e.target.value);
  });

  document.getElementById('btn-next').addEventListener('click', function () {
    gotoDataset((st().datasetIdx + 1) % DS[activeKey].length);
  });

  document.getElementById('btn-reveal').addEventListener('click', function () {
    st().reveal = !st().reveal;
    mainRefs.mleEl.style.display = st().reveal ? '' : 'none';
    drawTraces();
    updateReadout();
    updateRevealButton();
    updateTraceGuides();
  });

  document.getElementById('btn-reset').addEventListener('click', function () {
    dist().params.forEach(function (p) { st().params[p.key] = p.default; });
    st().attempts[st().datasetIdx] = [];
    st().reveal = false;
    renderAll();
  });

  renderAll();
})();
