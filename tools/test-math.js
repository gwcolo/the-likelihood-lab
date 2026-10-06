/*
 * test-math.js — math-correctness checks for The Likelihood Lab.
 *
 *   node tools/test-math.js
 *
 * Unit tests for the math layer (no browser): every dataset in the pool is
 * checked against its revealed MLE. Prints one PASS/FAIL line per
 * (model, check) with a count, and exits non-zero if anything fails.
 * Never prints parameter values, so challenge answers stay hidden.
 */

const path = require('path');
const D = require(path.join(__dirname, '..', 'js', 'distributions.js'));
const GP = require(path.join(__dirname, '..', 'js', 'gp.js'));
const DS = require(path.join(__dirname, '..', 'js', 'datasets.js'));

const { digamma } = D._internals;
const results = []; // [name, passed, total, failingIds]

/* Record one check across a list of datasets. `fn(ds)` returns true on pass. */
function check(name, datasets, fn) {
  const failing = datasets.filter(ds => !fn(ds)).map(ds => ds.id);
  results.push([name, datasets.length - failing.length, datasets.length, failing]);
}

const close = (a, b, tol) => Math.abs(a - b) <= tol;
const mean = xs => xs.reduce((s, v) => s + v, 0) / xs.length;
// MLE (n-denominator) standard deviation, computed independently of the app
const sdN = xs => { const m = mean(xs); return Math.sqrt(mean(xs.map(v => (v - m) ** 2))); };

// ------------------------------------------------ closed-form recomputation

check('normal closed-form (mean, n-sd)', DS.normal, ds => {
  const m = D.byKey.normal.mle(ds.data);
  return close(m.mean, mean(ds.data), 1e-9) && close(m.sd, sdN(ds.data), 1e-9);
});

check('lognormal closed-form (on log x)', DS.lognormal, ds => {
  const logs = ds.data.map(Math.log);
  const m = D.byKey.lognormal.mle(ds.data);
  return close(m.mu, mean(logs), 1e-9) && close(m.sigma, sdN(logs), 1e-9);
});

check('uniform closed-form (min, max)', DS.uniform, ds => {
  const m = D.byKey.uniform.mle(ds.data);
  return m.lower === Math.min(...ds.data) && m.upper === Math.max(...ds.data);
});

// Gamma: the shape solves log k − ψ(k) = log x̄ − mean(log x), and θ = x̄ / k
check('gamma score equation', DS.gamma, ds => {
  const m = D.byKey.gamma.mle(ds.data);
  const s = Math.log(mean(ds.data)) - mean(ds.data.map(Math.log));
  return close(Math.log(m.shape) - digamma(m.shape), s, 1e-8) &&
    close(m.scale, mean(ds.data) / m.shape, 1e-9);
});

// ------------------------------------------------ the MLE is a maximum

/* Nudging any single parameter up or down by `delta` must not raise the
   log-likelihood. Formula-free, so it also covers the numeric searches
   (Triangle, Gamma). TOL absorbs floating-point noise only. */
const DELTA = 1e-3;
const TOL = 1e-9;

for (const dist of D.list) {
  const datasets = DS[dist.key];
  check(`${dist.key} MLE finite`, datasets, ds =>
    isFinite(dist.logLik(ds.data, dist.mle(ds.data))));
  check(`${dist.key} MLE is a local max`, datasets, ds => {
    const m = dist.mle(ds.data);
    const best = dist.logLik(ds.data, m);
    return dist.params.every(p => [-DELTA, DELTA].every(d =>
      dist.logLik(ds.data, { ...m, [p.key]: m[p.key] + d }) <= best + TOL));
  });
}

// ------------------------------------------------ Gaussian Process

/* GP answers are precomputed offline as the best point on the slider grid,
   stored with the score rounded to 3 decimals. */
const gpScore = GP.model.score;

check('gp stored score matches recomputation', DS.gp, ds =>
  close(gpScore(ds, ds.mle), ds.mleLL, 5e-4 + 1e-9));

// best on the grid: one slider step in any direction (within range) is no better
check('gp MLE is a grid local max', DS.gp, ds => {
  const best = gpScore(ds, ds.mle);
  return GP.model.params.every(p => [-p.step, p.step].every(d => {
    const v = +(ds.mle[p.key] + d).toFixed(4);
    if (v < p.min || v > p.max) return true;
    return gpScore(ds, { ...ds.mle, [p.key]: v }) <= best + TOL;
  }));
});

// ------------------------------------------------ report

let failed = false;
for (const [name, pass, total, failing] of results) {
  const ok = pass === total;
  if (!ok) failed = true;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}: ${pass}/${total}` +
    (ok ? '' : `  (failing: ${failing.join(', ')})`));
}
if (failed) {
  console.error('MATH TESTS FAILED');
  process.exit(1);
}
console.log('MATH TESTS PASSED');
