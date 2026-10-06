/*
 * gp.js — Gaussian Process regression math layer for The Likelihood Lab.
 *
 * 1-D zero-mean GP with an RBF kernel plus independent Gaussian noise:
 *   k(x, x') = σf² · exp(−(x − x')² / (2ℓ²)),   cov(y) = K + σn² I
 * Sliders are in standard deviations (σf, σn), same units as y.
 *
 * The score shown to students is the LOG MARGINAL LIKELIHOOD:
 *   log p(y | x, θ) = −½ yᵀ(K+σn²I)⁻¹y − ½ log|K+σn²I| − (n/2) log 2π
 * It has no closed-form maximizer and is heavily NON-CONVEX in (ℓ, σf, σn) —
 * that is the teaching point of this tab. The reveal parameters and challenge
 * targets are precomputed offline by tools/generate-datasets.js and embedded
 * in js/datasets.js; this file contains no optimizer.
 *
 * All matrices are dense flat row-major arrays; n ≈ 30, so every operation
 * here is microseconds — cheap enough to run live on every slider movement.
 */

var MLEGaussianProcess = (function () {
  'use strict';

  var LN_2PI = Math.log(2 * Math.PI);
  var JITTER = 1e-8; // added to the diagonal so the Cholesky never breaks

  // ------------------------------------------------------- linear algebra

  /* Cholesky factor L (lower-triangular, flat row-major) of SPD matrix A. */
  function cholesky(A, n) {
    var L = new Array(n * n).fill(0);
    for (var i = 0; i < n; i++) {
      for (var j = 0; j <= i; j++) {
        var s = A[i * n + j];
        for (var k = 0; k < j; k++) s -= L[i * n + k] * L[j * n + k];
        if (i === j) {
          L[i * n + i] = Math.sqrt(Math.max(s, 1e-12));
        } else {
          L[i * n + j] = s / L[j * n + j];
        }
      }
    }
    return L;
  }

  /* Solve (L Lᵀ) x = b by forward then backward substitution. */
  function cholSolve(L, n, b) {
    var x = b.slice(), i, k;
    for (i = 0; i < n; i++) {
      for (k = 0; k < i; k++) x[i] -= L[i * n + k] * x[k];
      x[i] /= L[i * n + i];
    }
    for (i = n - 1; i >= 0; i--) {
      for (k = i + 1; k < n; k++) x[i] -= L[k * n + i] * x[k];
      x[i] /= L[i * n + i];
    }
    return x;
  }

  // ------------------------------------------------------- GP pieces

  /* RBF signal covariance at distance r (no noise term). */
  function kernel(r, p) {
    var z = r / p.lengthscale;
    return p.signal * p.signal * Math.exp(-0.5 * z * z);
  }

  /* Cholesky of the training covariance K + σn² I (+ jitter). */
  function trainChol(x, p) {
    var n = x.length;
    var A = new Array(n * n);
    var noise = p.noise * p.noise + JITTER;
    for (var i = 0; i < n; i++) {
      for (var j = 0; j <= i; j++) {
        var v = kernel(Math.abs(x[i] - x[j]), p);
        A[i * n + j] = v;
        A[j * n + i] = v;
      }
      A[i * n + i] += noise;
    }
    return cholesky(A, n);
  }

  function logMarginalLikelihood(x, y, p) {
    var n = x.length;
    var L = trainChol(x, p);
    var alpha = cholSolve(L, n, y);
    var quad = 0, logdet = 0;
    for (var i = 0; i < n; i++) {
      quad += y[i] * alpha[i];
      logdet += Math.log(L[i * n + i]); // ½ log|K| = Σ log L_ii
    }
    return -0.5 * quad - logdet - 0.5 * n * LN_2PI;
  }

  /* Posterior over a display grid. sd is PREDICTIVE (latent variance + σn²),
     so the ±2·sd band should visibly contain ~95% of the data when the fit is
     right — the confirmed band choice. */
  function posterior(x, y, p, grid) {
    var n = x.length;
    var L = trainChol(x, p);
    var alpha = cholSolve(L, n, y);
    var mean = new Array(grid.length), sd = new Array(grid.length);
    for (var g = 0; g < grid.length; g++) {
      var ks = new Array(n), i, k;
      for (i = 0; i < n; i++) ks[i] = kernel(Math.abs(grid[g] - x[i]), p);
      var m = 0;
      for (i = 0; i < n; i++) m += ks[i] * alpha[i];
      // latent variance = k(0) − vᵀv with v = L⁻¹ ks (forward solve only)
      var v = ks.slice();
      for (i = 0; i < n; i++) {
        for (k = 0; k < i; k++) v[i] -= L[i * n + k] * v[k];
        v[i] /= L[i * n + i];
      }
      var latentVar = p.signal * p.signal;
      for (i = 0; i < n; i++) latentVar -= v[i] * v[i];
      if (latentVar < 0) latentVar = 0;
      mean[g] = m;
      sd[g] = Math.sqrt(latentVar + p.noise * p.noise);
    }
    return { mean: mean, sd: sd };
  }

  // ------------------------------------------------------- model object

  var model = {
    key: 'gp',
    kind: 'regression',
    label: 'Gaussian Proces',
    /* Wide ranges are deliberate (confirmed): ℓ up to 20 lets students stretch
       the fit into a flat line through the mean, and σn down to 0.01 lets them
       go nearly noiseless — both make the non-convexity of the surface visible.
       σn = 0.01 keeps σn² = 1e-4, still 10,000× the Cholesky jitter. */
    params: [
      { key: 'lengthscale', label: 'Length-scale (ℓ)', min: 0.05, max: 20, step: 0.05, default: 1 },
      { key: 'signal', label: 'Signal sd (σf)', min: 0.1, max: 3, step: 0.05, default: 1 },
      { key: 'noise', label: 'Noise sd (σn)', min: 0.01, max: 1.5, step: 0.01, default: 0.3 }
    ],
    /* Score for a dataset entry ({x, y}) at hyperparams p. */
    score: function (ds, p) { return logMarginalLikelihood(ds.x, ds.y, p); },
    posterior: posterior,
    kernel: kernel
  };

  return {
    model: model,
    _internals: {
      cholesky: cholesky, cholSolve: cholSolve,
      logMarginalLikelihood: logMarginalLikelihood, posterior: posterior
    }
  };
})();

if (typeof module !== 'undefined') module.exports = MLEGaussianProcess;
