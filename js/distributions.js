/*
 * distributions.js — math layer for The Likelihood Lab.
 *
 * Each distribution is a self-contained object:
 *   key      — internal id
 *   label    — display name
 *   params   — slider definitions: {key, label, min, max, step, default}
 *   pdf(x, p)        — density at x given params object p (keyed by param key)
 *   logLik(data, p)  — sum of log densities; -Infinity if any point has density 0
 *   mle(data)        — empirical maximum likelihood estimate for this dataset,
 *                      returned as a params object (exact, not snapped to slider steps)
 *
 * No UI code lives here. The UI layer consumes this via the global
 * MLEDistributions (browser) or module.exports (Node, used by tools/).
 */

var MLEDistributions = (function () {
  'use strict';

  var LN_SQRT_2PI = 0.5 * Math.log(2 * Math.PI);

  // ---------------------------------------------------------------- helpers

  function mean(xs) {
    var s = 0;
    for (var i = 0; i < xs.length; i++) s += xs[i];
    return s / xs.length;
  }

  /* Log-gamma via the Lanczos approximation (g = 7, 9 coefficients).
     Accurate to ~15 significant digits for z > 0. */
  var LANCZOS = [
    676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012,
    9.9843695780195716e-6, 1.5056327351493116e-7
  ];

  function lgamma(z) {
    if (z < 0.5) {
      // reflection formula, needed only for z in (0, 0.5)
      return Math.log(Math.PI / Math.sin(Math.PI * z)) - lgamma(1 - z);
    }
    z -= 1;
    var x = 0.99999999999980993;
    for (var i = 0; i < LANCZOS.length; i++) x += LANCZOS[i] / (z + i + 1);
    var t = z + LANCZOS.length - 0.5;
    return LN_SQRT_2PI + (z + 0.5) * Math.log(t) - t + Math.log(x);
  }

  /* Digamma (psi) via recurrence up to x >= 10, then asymptotic series. */
  function digamma(x) {
    var r = 0;
    while (x < 10) { r -= 1 / x; x += 1; }
    var inv = 1 / x, inv2 = inv * inv;
    return r + Math.log(x) - 0.5 * inv -
      inv2 * (1 / 12 - inv2 * (1 / 120 - inv2 * (1 / 252)));
  }

  /* Trigamma (psi'), same recurrence-then-asymptotic scheme. */
  function trigamma(x) {
    var r = 0;
    while (x < 10) { r += 1 / (x * x); x += 1; }
    var inv = 1 / x, inv2 = inv * inv;
    return r + inv * (1 + inv * (0.5 + inv * (1 / 6 - inv2 * (1 / 30 - inv2 * (1 / 42)))));
  }

  /* Generic log-likelihood: sum of log pdf. Returns -Infinity as soon as any
     point has zero density — this is the honest answer for bounded-support
     distributions (Uniform, Triangle) and is a deliberate teaching moment. */
  function makeLogLik(pdf) {
    return function (data, p) {
      var ll = 0;
      for (var i = 0; i < data.length; i++) {
        var d = pdf(data[i], p);
        if (d <= 0) return -Infinity;
        ll += Math.log(d);
      }
      return ll;
    };
  }

  /* Golden-section search for the maximum of a 1-D function on [lo, hi].
     Assumes unimodality on the bracket; iters=80 gives far more precision
     than the demo needs. */
  function goldenMax(f, lo, hi, iters) {
    var phi = (Math.sqrt(5) - 1) / 2;
    var a = lo, b = hi;
    var x1 = b - phi * (b - a), x2 = a + phi * (b - a);
    var f1 = f(x1), f2 = f(x2);
    for (var i = 0; i < iters; i++) {
      if (f1 < f2) {
        a = x1; x1 = x2; f1 = f2;
        x2 = a + phi * (b - a); f2 = f(x2);
      } else {
        b = x2; x2 = x1; f2 = f1;
        x1 = b - phi * (b - a); f1 = f(x1);
      }
    }
    var xm = (a + b) / 2;
    return { x: xm, fx: f(xm) };
  }

  // ---------------------------------------------------------------- Normal

  var normal = {
    key: 'normal',
    label: 'Normal',
    params: [
      { key: 'mean', label: 'Mean (μ)', min: -10, max: 10, step: 0.1, default: 0 },
      { key: 'sd', label: 'Std. dev. (σ)', min: 0.1, max: 6, step: 0.1, default: 2 }
    ],
    pdf: function (x, p) {
      var z = (x - p.mean) / p.sd;
      return Math.exp(-0.5 * z * z) / (p.sd * Math.sqrt(2 * Math.PI));
    },
    /* Closed form: mu-hat = sample mean, sigma-hat = sqrt of the *n*-denominator
       variance (the MLE, not the unbiased estimator). */
    mle: function (data) {
      var m = mean(data);
      var ss = 0;
      for (var i = 0; i < data.length; i++) {
        var d = data[i] - m;
        ss += d * d;
      }
      return { mean: m, sd: Math.sqrt(ss / data.length) };
    }
  };
  normal.logLik = makeLogLik(normal.pdf);

  // ---------------------------------------------------------------- Uniform

  var uniform = {
    key: 'uniform',
    label: 'Uniform',
    params: [
      { key: 'lower', label: 'Lower bound (a)', min: -10, max: 10, step: 0.1, default: -5 },
      { key: 'upper', label: 'Upper bound (b)', min: -10, max: 10, step: 0.1, default: 5 }
    ],
    /* Density 1/(b-a) on [a, b], endpoints included so the MLE (a = min, b = max)
       has finite likelihood. lower >= upper is not a distribution: density 0
       everywhere, so the log-likelihood honestly reads -Infinity. */
    pdf: function (x, p) {
      if (p.lower >= p.upper) return 0;
      return (x >= p.lower && x <= p.upper) ? 1 / (p.upper - p.lower) : 0;
    },
    /* The textbook boundary case: the likelihood increases as the interval
       shrinks, so the MLE sits exactly at the sample min and max — no
       derivative is ever zero. */
    mle: function (data) {
      return { lower: Math.min.apply(null, data), upper: Math.max.apply(null, data) };
    }
  };
  uniform.logLik = makeLogLik(uniform.pdf);

  // ---------------------------------------------------------------- Triangle

  /* Symmetric triangle: peak at `center`, support [center - width, center + width]
     (`width` is the half-width). Density (width - |x - center|) / width^2.
     NOTE FOR REVIEW: this is the 2-parameter symmetric version; if Glen's
     signature example uses a different parameterization (e.g. free mode), the
     pdf/mle here are the only things that change. */
  var triangle = {
    key: 'triangle',
    label: 'Triangle',
    params: [
      { key: 'center', label: 'Peak (c)', min: -10, max: 10, step: 0.1, default: 0 },
      { key: 'width', label: 'Half-width (w)', min: 0.2, max: 10, step: 0.1, default: 4 }
    ],
    pdf: function (x, p) {
      var dev = Math.abs(x - p.center);
      return dev >= p.width ? 0 : (p.width - dev) / (p.width * p.width);
    },
    /* No closed form — the likelihood has kinks at every data point, so
       differentiating blindly fails (the teaching point). Numeric search:
       a grid over the peak position, with a golden-section search over the
       half-width at each candidate peak, then two local refinement passes. */
    mle: function (data) {
      var n = data.length;
      var lo = Math.min.apply(null, data);
      var hi = Math.max.apply(null, data);

      // profile log-likelihood: best width (and LL) for a fixed center
      function profile(c) {
        var maxDev = 0;
        for (var i = 0; i < n; i++) {
          var d = Math.abs(data[i] - c);
          if (d > maxDev) maxDev = d;
        }
        function ll(w) {
          var s = 0;
          for (var i = 0; i < n; i++) {
            s += Math.log(w - Math.abs(data[i] - c));
          }
          return s - 2 * n * Math.log(w);
        }
        // width must strictly exceed the farthest point's deviation
        var res = goldenMax(ll, maxDev + 1e-6, maxDev * 6 + 1, 80);
        return { width: res.x, ll: res.fx };
      }

      // coarse grid over the data range, then refine around the best center
      var best = { center: lo, width: 1, ll: -Infinity };
      function scan(from, to, steps) {
        for (var i = 0; i <= steps; i++) {
          var c = from + (to - from) * (i / steps);
          var r = profile(c);
          if (r.ll > best.ll) best = { center: c, width: r.width, ll: r.ll };
        }
      }
      scan(lo, hi, 200);
      var span = (hi - lo) / 200;
      scan(best.center - span, best.center + span, 40);
      span = 2 * span / 40;
      scan(best.center - span, best.center + span, 40);

      return { center: best.center, width: best.width };
    }
  };
  triangle.logLik = makeLogLik(triangle.pdf);

  // ---------------------------------------------------------------- Lognormal

  /* Pedagogical stepping stone before Gamma: a Normal on the log scale, so the
     location/spread intuition from the Normal tab carries over directly. */
  var lognormal = {
    key: 'lognormal',
    label: 'Lognormal',
    params: [
      { key: 'mu', label: 'Log-mean (μ)', min: -2, max: 3, step: 0.05, default: 1 },
      { key: 'sigma', label: 'Log-sd (σ)', min: 0.05, max: 2, step: 0.05, default: 0.6 }
    ],
    /* Support is x > 0; density is the Normal density applied to ln x, with the
       1/x Jacobian. */
    pdf: function (x, p) {
      if (x <= 0) return 0;
      var z = (Math.log(x) - p.mu) / p.sigma;
      return Math.exp(-0.5 * z * z) / (x * p.sigma * Math.sqrt(2 * Math.PI));
    },
    /* Closed form: exactly the Normal MLE computed on ln x — mu-hat is the mean
       of the logs, sigma-hat the n-denominator sd of the logs. */
    mle: function (data) {
      var n = data.length, m = 0, i;
      for (i = 0; i < n; i++) m += Math.log(data[i]);
      m /= n;
      var ss = 0;
      for (i = 0; i < n; i++) {
        var d = Math.log(data[i]) - m;
        ss += d * d;
      }
      return { mu: m, sigma: Math.sqrt(ss / n) };
    }
  };
  lognormal.logLik = makeLogLik(lognormal.pdf);

  // ---------------------------------------------------------------- Gamma

  var gamma = {
    key: 'gamma',
    label: 'Gamma',
    params: [
      { key: 'shape', label: 'Shape (k)', min: 0.2, max: 15, step: 0.1, default: 2 },
      { key: 'scale', label: 'Scale (θ)', min: 0.05, max: 5, step: 0.05, default: 1 }
    ],
    /* Support is x > 0; non-positive x has density 0 (log-likelihood -Infinity). */
    pdf: function (x, p) {
      if (x <= 0) return 0;
      return Math.exp(
        (p.shape - 1) * Math.log(x) - x / p.scale -
        lgamma(p.shape) - p.shape * Math.log(p.scale)
      );
    },
    /* Profile out the scale (theta-hat = xbar / k), leaving one equation in the
       shape: log(k) - digamma(k) = log(xbar) - mean(log x). Solved by Newton
       from the standard Minka/Choi-Wette starting value. */
    mle: function (data) {
      var xbar = mean(data);
      var meanLog = 0;
      for (var i = 0; i < data.length; i++) meanLog += Math.log(data[i]);
      meanLog /= data.length;

      var s = Math.log(xbar) - meanLog; // > 0 unless all points are equal
      if (s <= 0) return { shape: 15, scale: xbar / 15 }; // degenerate: no spread

      var k = (3 - s + Math.sqrt((s - 3) * (s - 3) + 24 * s)) / (12 * s);
      for (var it = 0; it < 30; it++) {
        k -= (Math.log(k) - digamma(k) - s) / (1 / k - trigamma(k));
        if (k < 1e-3) k = 1e-3;
      }
      return { shape: k, scale: xbar / k };
    }
  };
  gamma.logLik = makeLogLik(gamma.pdf);

  // ---------------------------------------------------------------- exports

  // Lognormal sits directly before Gamma: its location/scale sliders are the
  // on-ramp to Gamma's less intuitive shape/scale pair.
  var list = [normal, uniform, triangle, lognormal, gamma];
  var byKey = {};
  for (var i = 0; i < list.length; i++) byKey[list[i].key] = list[i];

  return {
    list: list,
    byKey: byKey,
    // exposed for the dataset generator and sanity tests
    _internals: { lgamma: lgamma, digamma: digamma, trigamma: trigamma, goldenMax: goldenMax, mean: mean }
  };
})();

if (typeof module !== 'undefined') module.exports = MLEDistributions;
