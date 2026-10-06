/*
 * generate-datasets.js — regenerates js/datasets.js from the specs below.
 *
 * Run with:  node tools/generate-datasets.js
 *
 * Every dataset is drawn with a fixed seed, so re-running reproduces the same
 * values. To curate: edit the SPECS (seed, size, generator, label, note) and
 * re-run. Values are rounded to 2 decimals for readability — a deliberate,
 * harmless coarsening at the resolution of the demo.
 *
 * The script also computes each dataset's empirical MLE via js/distributions.js
 * and fails loudly if any MLE falls outside its parameter's slider range.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const D = require(path.join(__dirname, '..', 'js', 'distributions.js'));
const GP = require(path.join(__dirname, '..', 'js', 'gp.js'));

// ------------------------------------------------------------ seeded RNG

/* mulberry32: tiny, good-enough PRNG with a 32-bit seed. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ------------------------------------------------------------ samplers

/* Standard normal via Box-Muller (fresh pair each call; second value unused). */
function rnorm(r, mean, sd) {
  const u1 = Math.max(r(), 1e-12);
  const u2 = r();
  return mean + sd * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function runif(r, lo, hi) {
  return lo + (hi - lo) * r();
}

/* Gamma via Marsaglia-Tsang; shape < 1 handled by the boost trick. */
function rgamma(r, shape, scale) {
  if (shape < 1) {
    return rgamma(r, shape + 1, scale) * Math.pow(Math.max(r(), 1e-12), 1 / shape);
  }
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  for (;;) {
    const x = rnorm(r, 0, 1);
    const v = Math.pow(1 + c * x, 3);
    if (v <= 0) continue;
    const u = r();
    if (Math.log(Math.max(u, 1e-12)) < 0.5 * x * x + d - d * v + d * Math.log(v)) {
      return d * v * scale;
    }
  }
}

/* Lognormal: exp of a normal draw. */
function rlognorm(r, mu, sigma) {
  return Math.exp(rnorm(r, mu, sigma));
}

/* Symmetric triangle (peak at center, support center ± width) via inverse CDF. */
function rtriangle(r, center, width) {
  const u = r();
  return u < 0.5
    ? center - width * (1 - Math.sqrt(2 * u))
    : center + width * (1 - Math.sqrt(2 * (1 - u)));
}

/* n draws from a sampler, with an optional accept predicate (used to keep
   normal draws positive for the gamma page — a truncation, noted per spec). */
function draws(n, sample, accept) {
  const out = [];
  while (out.length < n) {
    const x = sample();
    if (!accept || accept(x)) out.push(x);
  }
  return out;
}

// ------------------------------------------------------------ dataset specs
//
// label — student-facing name; note — student-facing hint shown with the
// dataset. Notes are honest about how the data were made: the mismatched
// cases are the teaching point, not a trick.

const SPECS = {
  normal: [
    {
      id: 'normal-clean', seed: 101, label: 'Well-behaved sample',
      note: 'Drawn from a Normal distribution. A clean warm-up: center the peak on the data, then match the spread.',
      gen: r => draws(60, () => rnorm(r, 2, 1.5))
    },
    {
      id: 'normal-tight', seed: 102, label: 'Tight cluster',
      note: 'A Normal sample with a small spread. Watch how quickly the likelihood collapses when the curve is too wide — or too narrow.',
      gen: r => draws(50, () => rnorm(r, -3, 0.5))
    },
    {
      id: 'normal-wide', seed: 103, label: 'Wide spread',
      note: 'A Normal sample with a large spread. The best σ is bigger than it looks.',
      gen: r => draws(60, () => rnorm(r, 0, 3))
    },
    {
      id: 'normal-bimodal', seed: 104, label: 'Bimodal (two humps)',
      note: 'This data has two clusters — no single Normal can capture both. Where does the best-fitting Normal put its peak, and what does it do with σ?',
      gen: r => draws(30, () => rnorm(r, -3, 1)).concat(draws(30, () => rnorm(r, 3, 1)))
    },
    {
      id: 'normal-outliers', seed: 105, label: 'Outliers on the right',
      note: 'Mostly a tight Normal sample, plus a few far-out points. See how much a handful of outliers drags the fit.',
      gen: r => draws(52, () => rnorm(r, 1, 1)).concat([7.5, 8.2, 9.0])
    },
    {
      id: 'normal-challenge-1', seed: 106, label: 'Challenge round 1', challenge: true,
      note: 'No answer button from here on. Set the curve, watch the score, and chase the target on the right — it is reachable with these sliders.',
      gen: r => draws(60, () => rnorm(r, -1.2, 2.2))
    },
    {
      id: 'normal-challenge-2', seed: 107, label: 'Challenge round 2', challenge: true,
      note: 'Blind round: nobody tells you where this data came from. Fit it as well as the sliders allow.',
      gen: r => draws(50, () => rnorm(r, 3.2, 0.8))
    },
    {
      id: 'normal-challenge-3', seed: 108, label: 'Challenge round 3', challenge: true,
      note: 'Keep an eye on both parameters — the target will not fall to one slider alone.',
      gen: r => draws(60, () => rnorm(r, 0.5, 3.5))
    },
    {
      id: 'normal-challenge-4', seed: 109, label: 'Challenge round 4', challenge: true,
      note: 'Real data rarely comes from the distribution you are fitting. Do the best you can and hit the target.',
      gen: r => draws(30, () => rnorm(r, -2, 0.8)).concat(draws(30, () => rnorm(r, 2, 0.8)))
    },
    {
      id: 'normal-challenge-5', seed: 110, label: 'Challenge round 5', challenge: true,
      note: 'Last one. Trust what the attempt panels have taught you about where the score peaks.',
      gen: r => draws(53, () => rnorm(r, -4, 1.2)).concat([5.5, 6.2])
    }
  ],

  uniform: [
    {
      id: 'uniform-clean', seed: 201, label: 'Well-behaved sample',
      note: 'Drawn from a Uniform distribution. Notice the best fit hugs the smallest and largest points exactly — no calculus will find this one.',
      gen: r => draws(60, () => runif(r, -4, 4))
    },
    {
      id: 'uniform-narrow', seed: 202, label: 'Narrow band',
      note: 'A Uniform sample over a short interval. Shrinking the interval raises the likelihood — until a point falls outside.',
      gen: r => draws(50, () => runif(r, 1, 3))
    },
    {
      id: 'uniform-skewed', seed: 203, label: 'Skewed (not uniform at all)',
      note: 'This data is piled up near the left (it was drawn from a Gamma distribution). The Uniform fit only cares about the smallest and largest points — everything in between is invisible to it.',
      gen: r => draws(60, () => rgamma(r, 2, 0.8))
    },
    {
      id: 'uniform-straggler', seed: 204, label: 'One straggler',
      note: 'A tidy Uniform sample plus one point far to the right. One single point sets the upper bound — how much likelihood does it cost?',
      gen: r => draws(49, () => runif(r, -2, 2)).concat([5.0])
    },
    {
      id: 'uniform-humped', seed: 205, label: 'Humped in the middle',
      note: 'This data clusters in the center (it was drawn from a Normal distribution). The Uniform cannot express the hump — its best fit still runs edge to edge.',
      gen: r => draws(60, () => rnorm(r, 0, 1.2))
    },
    {
      id: 'uniform-challenge-1', seed: 206, label: 'Challenge round 1', challenge: true,
      note: 'No answer button from here on. Set the curve, watch the score, and chase the target on the right — it is reachable with these sliders.',
      gen: r => draws(55, () => runif(r, -3.5, 1.5))
    },
    {
      id: 'uniform-challenge-2', seed: 207, label: 'Challenge round 2', challenge: true,
      note: 'Blind round: nobody tells you where this data came from. Fit it as well as the sliders allow.',
      gen: r => draws(60, () => runif(r, 0.5, 6.5))
    },
    {
      id: 'uniform-challenge-3', seed: 208, label: 'Challenge round 3', challenge: true,
      note: 'Keep an eye on both parameters — the target will not fall to one slider alone.',
      gen: r => draws(50, () => runif(r, -6, -1))
    },
    {
      id: 'uniform-challenge-4', seed: 209, label: 'Challenge round 4', challenge: true,
      note: 'Real data rarely comes from the distribution you are fitting. Do the best you can and hit the target.',
      gen: r => draws(60, () => rtriangle(r, 1, 2.5))
    },
    {
      id: 'uniform-challenge-5', seed: 210, label: 'Challenge round 5', challenge: true,
      note: 'Last one. Trust what the attempt panels have taught you about where the score peaks.',
      gen: r => draws(40, () => runif(r, -1, 1))
    }
  ],

  triangle: [
    {
      id: 'triangle-clean', seed: 301, label: 'Well-behaved sample',
      note: 'Drawn from a Triangle distribution. The likelihood has a kink at every data point — the peak parameter cannot be found by setting a derivative to zero.',
      gen: r => draws(60, () => rtriangle(r, 0, 4))
    },
    {
      id: 'triangle-offcenter', seed: 302, label: 'Off-center peak',
      note: 'A Triangle sample whose peak is not at zero. Slide the peak first, then tighten the width.',
      gen: r => draws(50, () => rtriangle(r, 3, 2))
    },
    {
      id: 'triangle-flat', seed: 303, label: 'Flat (uniform data)',
      note: 'This data is spread evenly (drawn from a Uniform distribution). The Triangle wants a peak the data does not have — where does it put it?',
      gen: r => draws(60, () => runif(r, -3, 3))
    },
    {
      id: 'triangle-bell', seed: 304, label: 'Bell-shaped (normal data)',
      note: 'This data was drawn from a Normal distribution. A triangle is a decent stand-in for a bell — but the tails cost it.',
      gen: r => draws(60, () => rnorm(r, 0, 1.5))
    },
    {
      id: 'triangle-skewed', seed: 305, label: 'Skewed (gamma data)',
      note: 'This data is piled up on the left with a long tail to the right (drawn from a Gamma distribution). A symmetric triangle has to compromise — watch the trade-off between covering the tail and centering the mass.',
      gen: r => draws(60, () => rgamma(r, 2, 1))
    },
    {
      id: 'triangle-challenge-1', seed: 306, label: 'Challenge round 1', challenge: true,
      note: 'No answer button from here on. Set the curve, watch the score, and chase the target on the right — it is reachable with these sliders.',
      gen: r => draws(60, () => rtriangle(r, -1, 3))
    },
    {
      id: 'triangle-challenge-2', seed: 307, label: 'Challenge round 2', challenge: true,
      note: 'Blind round: nobody tells you where this data came from. Fit it as well as the sliders allow.',
      gen: r => draws(60, () => rtriangle(r, 2, 3))
    },
    {
      id: 'triangle-challenge-3', seed: 308, label: 'Challenge round 3', challenge: true,
      note: 'Keep an eye on both parameters — the target will not fall to one slider alone.',
      gen: r => draws(50, () => rtriangle(r, -3, 1.5))
    },
    {
      id: 'triangle-challenge-4', seed: 309, label: 'Challenge round 4', challenge: true,
      note: 'Real data rarely comes from the distribution you are fitting. Do the best you can and hit the target.',
      gen: r => draws(60, () => runif(r, -2, 4))
    },
    {
      id: 'triangle-challenge-5', seed: 310, label: 'Challenge round 5', challenge: true,
      note: 'Last one. Trust what the attempt panels have taught you about where the score peaks.',
      gen: r => draws(60, () => rgamma(r, 3, 0.7))
    }
  ],

  lognormal: [
    {
      id: 'lognormal-clean', seed: 501, label: 'Well-behaved sample',
      note: 'Drawn from a Lognormal distribution. Think of it as a Normal fitted to log(x): μ slides the bulk left and right, σ controls the spread — on the log scale.',
      gen: r => draws(60, () => rlognorm(r, 1, 0.5))
    },
    {
      id: 'lognormal-heavytail', seed: 502, label: 'Long right tail',
      note: 'A Lognormal with a large σ: most points sit near zero, but a few reach far to the right. Watch how much that tail dictates the fit.',
      // the very largest draws are excluded to keep the plot readable
      gen: r => draws(60, () => rlognorm(r, 0.5, 0.9), x => x < 25)
    },
    {
      id: 'lognormal-symmetric', seed: 503, label: 'Nearly symmetric',
      note: 'Also a true Lognormal sample — with a small σ it looks almost Normal. Distributions can impersonate each other.',
      gen: r => draws(60, () => rlognorm(r, 1.5, 0.25))
    },
    {
      id: 'lognormal-gammadata', seed: 504, label: 'Gamma data',
      note: 'This data was drawn from a Gamma distribution. The Lognormal also handles skewed positive data — fit it here, then try the same kind of data on the Gamma tab and compare.',
      gen: r => draws(60, () => rgamma(r, 2, 1), x => x >= 0.005)
    },
    {
      id: 'lognormal-leftskew', seed: 505, label: 'Skewed the wrong way (left tail)',
      note: 'This data leans left: the long tail points toward zero, with the mass piled up on the right. Like the Gamma, a Lognormal always leans right — it can never match this shape.',
      // reflected gamma, same construction as the Gamma tab's left-skew case
      gen: r => draws(60, () => 6 - rgamma(r, 2, 0.9), x => x > 0.2)
    },
    {
      id: 'lognormal-challenge-1', seed: 506, label: 'Challenge round 1', challenge: true,
      note: 'No answer button from here on. Set the curve, watch the score, and chase the target on the right — it is reachable with these sliders.',
      gen: r => draws(60, () => rlognorm(r, 0.8, 0.6))
    },
    {
      id: 'lognormal-challenge-2', seed: 507, label: 'Challenge round 2', challenge: true,
      note: 'Blind round: nobody tells you where this data came from. Fit it as well as the sliders allow.',
      gen: r => draws(60, () => rlognorm(r, 0, 0.4))
    },
    {
      id: 'lognormal-challenge-3', seed: 508, label: 'Challenge round 3', challenge: true,
      note: 'Keep an eye on both parameters — the target will not fall to one slider alone.',
      gen: r => draws(60, () => rlognorm(r, 1.8, 0.35))
    },
    {
      id: 'lognormal-challenge-4', seed: 509, label: 'Challenge round 4', challenge: true,
      note: 'Real data rarely comes from the distribution you are fitting. Do the best you can and hit the target.',
      gen: r => draws(60, () => rgamma(r, 4, 0.5), x => x >= 0.005)
    },
    {
      id: 'lognormal-challenge-5', seed: 510, label: 'Challenge round 5', challenge: true,
      note: 'Last one. Trust what the attempt panels have taught you about where the score peaks.',
      gen: r => draws(60, () => rlognorm(r, 0.3, 1.1), x => x < 20)
    }
  ],

  gamma: [
    {
      id: 'gamma-clean', seed: 401, label: 'Well-behaved sample',
      note: 'Drawn from a Gamma distribution. Skewed to the right: the peak sits left of the mean.',
      gen: r => draws(60, () => rgamma(r, 2, 1))
    },
    {
      id: 'gamma-symmetric', seed: 402, label: 'Nearly symmetric',
      note: 'Also a true Gamma sample — but with a large shape parameter it looks almost Normal. Distributions can impersonate each other.',
      gen: r => draws(60, () => rgamma(r, 9, 0.5))
    },
    {
      id: 'gamma-exponential', seed: 403, label: 'Exponential-like',
      note: 'A Gamma sample with shape 1 is an Exponential: the density is highest at zero and only falls. Try shapes above and below 1 and watch the left edge flip.',
      // values that would round to 0.00 fall off Gamma support; keep anything ≥ 0.005
      gen: r => draws(60, () => rgamma(r, 1, 1.5), x => x >= 0.005)
    },
    {
      id: 'gamma-leftskew', seed: 404, label: 'Skewed the wrong way (left tail)',
      note: 'This data leans left: the long tail points toward zero, with the mass piled up on the right. A Gamma’s tail always points right — it can never lean this way. Watch the best fit crank the shape up and go nearly symmetric instead.',
      // reflected gamma: x = 6 - Gamma(2, 0.9), kept above 0.2 so all values are
      // safely inside Gamma support after rounding
      gen: r => draws(60, () => 6 - rgamma(r, 2, 0.9), x => x > 0.2)
    },
    {
      id: 'gamma-bimodal', seed: 405, label: 'Bimodal (two humps)',
      note: 'Two clusters of positive values. Like the Normal, the Gamma has one hump to give — see where it surrenders.',
      gen: r => draws(30, () => rgamma(r, 3, 0.4)).concat(draws(30, () => rnorm(r, 7, 0.7)))
    },
    {
      id: 'gamma-challenge-1', seed: 406, label: 'Challenge round 1', challenge: true,
      note: 'No answer button from here on. Set the curve, watch the score, and chase the target on the right — it is reachable with these sliders.',
      gen: r => draws(60, () => rgamma(r, 3, 0.8))
    },
    {
      id: 'gamma-challenge-2', seed: 407, label: 'Challenge round 2', challenge: true,
      note: 'Blind round: nobody tells you where this data came from. Fit it as well as the sliders allow.',
      gen: r => draws(60, () => rgamma(r, 1.5, 1.2), x => x >= 0.005)
    },
    {
      id: 'gamma-challenge-3', seed: 408, label: 'Challenge round 3', challenge: true,
      note: 'Keep an eye on both parameters — the target will not fall to one slider alone.',
      gen: r => draws(60, () => rgamma(r, 8, 0.3))
    },
    {
      id: 'gamma-challenge-4', seed: 409, label: 'Challenge round 4', challenge: true,
      note: 'Real data rarely comes from the distribution you are fitting. Do the best you can and hit the target.',
      gen: r => draws(60, () => rlognorm(r, 1, 0.5))
    },
    {
      id: 'gamma-challenge-5', seed: 410, label: 'Challenge round 5', challenge: true,
      note: 'Last one. Trust what the attempt panels have taught you about where the score peaks.',
      gen: r => draws(60, () => rgamma(r, 2, 2), x => x >= 0.005)
    }
  ]
};

// ------------------------------------------------------------ Gaussian Process

/* n jittered-grid x points on [0, 10], sorted. */
function gpX(r, n) {
  const xs = [];
  for (let i = 0; i < n; i++) xs.push(i * 10 / (n - 1) + runif(r, -0.12, 0.12));
  return xs.map(v => Math.min(10, Math.max(0, v))).sort((a, b) => a - b);
}

/* Draw y ~ N(0, K + σn²I) at points xs, via the GP module's own Cholesky. */
function gpDraw(r, xs, p) {
  const n = xs.length;
  const A = new Array(n * n);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      const v = GP.model.kernel(Math.abs(xs[i] - xs[j]), p);
      A[i * n + j] = v; A[j * n + i] = v;
    }
    A[i * n + i] += p.noise * p.noise + 1e-8;
  }
  const L = GP._internals.cholesky(A, n);
  const z = xs.map(() => rnorm(r, 0, 1));
  const y = new Array(n).fill(0);
  for (let i = 0; i < n; i++) for (let k = 0; k <= i; k++) y[i] += L[i * n + k] * z[k];
  return y;
}

/* Best hyperparameters ON THE SLIDER GRID, by exhaustive coarse pass over the
   whole grid (every 4th step) + two local refinement rounds. The coarse pass
   spans the entire grid, so the non-convex surface's multiple modes cannot
   trap the search in the wrong basin. Every candidate is a settable slider
   position, so the stored target is exactly reachable by students. */
function gpGridSearch(ds) {
  const ps = GP.model.params;
  const axes = ps.map(p => {
    const a = [];
    for (let v = p.min; v <= p.max + 1e-9; v += p.step) a.push(+v.toFixed(4));
    return a;
  });
  let best = { ll: -Infinity, p: null };
  function evalAt(l, f, nz) {
    const ll = GP.model.score(ds, { lengthscale: l, signal: f, noise: nz });
    if (ll > best.ll) best = { ll, p: { lengthscale: l, signal: f, noise: nz } };
  }
  const coarse = axes.map(a => a.filter((_, i) => i % 4 === 0 || i === a.length - 1));
  for (const l of coarse[0]) for (const f of coarse[1]) for (const nz of coarse[2]) evalAt(l, f, nz);
  for (let round = 0; round < 2; round++) {
    const local = axes.map((a, d) => {
      const idx = a.indexOf(+best.p[ps[d].key].toFixed(4));
      return a.slice(Math.max(0, idx - 5), idx + 6);
    });
    for (const l of local[0]) for (const f of local[1]) for (const nz of local[2]) evalAt(l, f, nz);
  }
  return best;
}

// Notes are student-facing. Teaching sets say what they are; challenges stay blind.
const GP_SPECS = [
  {
    id: 'gp-clean', seed: 601, label: 'Well-behaved sample',
    note: 'Drawn from a Gaussian Process with moderate smoothness and a little noise. Match the wiggle length first, then split what remains between signal and noise.',
    gen: r => { const x = gpX(r, 30); return { x, y: gpDraw(r, x, { lengthscale: 1.5, signal: 1, noise: 0.2 }) }; }
  },
  {
    id: 'gp-wiggle', seed: 602, label: 'Nearly noiseless wiggle',
    note: 'A fast-wiggling function measured almost perfectly. The wiggles are real signal — how short does the length-scale have to go before the band hugs the points?',
    gen: r => { const x = gpX(r, 30); return { x, y: gpDraw(r, x, { lengthscale: 0.4, signal: 1, noise: 0.1 }) }; }
  },
  {
    id: 'gp-noise', seed: 603, label: 'Mostly noise',
    note: 'A weak, slow signal buried under strong noise. Resist the urge to chase every point — here the noise slider should do most of the work.',
    gen: r => { const x = gpX(r, 30); return { x, y: gpDraw(r, x, { lengthscale: 2, signal: 0.6, noise: 0.75 }) }; }
  },
  {
    id: 'gp-twostories', seed: 604, label: 'Two stories',
    note: 'This data supports two rival explanations: a fast wiggle with little noise, or a slow drift with a lot of noise. Both feel locally best — try approaching from both extremes and compare scores. You cannot tune one slider at a time to the top here.',
    gen: r => { const x = gpX(r, 30); return { x, y: gpDraw(r, x, { lengthscale: 0.35, signal: 0.8, noise: 0.35 }) }; }
  },
  {
    id: 'gp-step', seed: 605, label: 'Step (mismatched)',
    note: 'A sudden jump — not something a smooth Gaussian Process can do. Watch it compromise: a short length-scale wiggles near the step, or a longer one smooths right through it.',
    gen: r => { const x = gpX(r, 30); return { x, y: x.map(v => (v < 5 ? -1 : 1) + rnorm(r, 0, 0.15)) }; }
  },
  {
    id: 'gp-challenge-1', seed: 606, label: 'Challenge round 1', challenge: true,
    note: 'No answer button from here on. Set the fit, watch the score, and chase the target on the right — it is reachable with these sliders.',
    gen: r => { const x = gpX(r, 30); return { x, y: gpDraw(r, x, { lengthscale: 1, signal: 1.2, noise: 0.3 }) }; }
  },
  {
    id: 'gp-challenge-2', seed: 607, label: 'Challenge round 2', challenge: true,
    note: 'Blind round: nobody tells you where this data came from. Fit it as well as the sliders allow.',
    gen: r => { const x = gpX(r, 30); return { x, y: gpDraw(r, x, { lengthscale: 0.6, signal: 0.7, noise: 0.15 }) }; }
  },
  {
    id: 'gp-challenge-3', seed: 608, label: 'Challenge round 3', challenge: true,
    note: 'Keep an eye on all three parameters — the target will not fall to one slider alone.',
    gen: r => { const x = gpX(r, 30); return { x, y: gpDraw(r, x, { lengthscale: 3, signal: 1.5, noise: 0.5 }) }; }
  },
  {
    id: 'gp-challenge-4', seed: 609, label: 'Challenge round 4', challenge: true,
    note: 'Real data rarely comes from the model you are fitting. Do the best you can and hit the target.',
    gen: r => { const x = gpX(r, 30); return { x, y: x.map(v => 0.3 * (v - 5) + rnorm(r, 0, 0.3)) }; }
  },
  {
    id: 'gp-challenge-5', seed: 610, label: 'Challenge round 5', challenge: true,
    note: 'Last one. Remember: this score has multiple hills — if you are stuck, jump somewhere far away and climb again.',
    gen: r => { const x = gpX(r, 30); return { x, y: gpDraw(r, x, { lengthscale: 0.25, signal: 0.5, noise: 0.6 }) }; }
  }
];

// ------------------------------------------------------------ generate + check

const round2 = x => Math.round(x * 100) / 100;

const out = {};
const report = [];
let failed = false;

for (const [distKey, specs] of Object.entries(SPECS)) {
  const dist = D.byKey[distKey];
  out[distKey] = specs.map(spec => {
    const r = mulberry32(spec.seed);
    const data = spec.gen(r).map(round2);
    const mle = dist.mle(data);
    const ll = dist.logLik(data, mle);

    // every MLE must be reachable within its slider range, with headroom
    for (const p of dist.params) {
      const v = mle[p.key];
      if (v < p.min || v > p.max) {
        failed = true;
        console.error(`RANGE FAIL: ${spec.id} ${p.key}=${v} outside [${p.min}, ${p.max}]`);
      }
    }
    if (!isFinite(ll)) {
      failed = true;
      console.error(`LL FAIL: ${spec.id} log-likelihood at MLE is not finite`);
    }

    report.push({
      dataset: spec.id, n: data.length,
      min: Math.min(...data), max: Math.max(...data),
      mle: Object.fromEntries(dist.params.map(p => [p.key, +mle[p.key].toFixed(3)])),
      logLik: +ll.toFixed(2)
    });

    // challenge datasets hide the reveal button and show a target score instead
    const entry = { id: spec.id, label: spec.label, note: spec.note, data };
    if (spec.challenge) entry.challenge = true;
    return entry;
  });
}

// GP datasets: center y (zero-mean GP assumption made honest), round to 2dp,
// then precompute the best-on-slider-grid hyperparameters and score so the
// browser never has to optimize the (non-convex) marginal likelihood.
out.gp = GP_SPECS.map(spec => {
  const r = mulberry32(spec.seed);
  const raw = spec.gen(r);
  const my = raw.y.reduce((a, b) => a + b, 0) / raw.y.length;
  const x = raw.x.map(round2);
  const y = raw.y.map(v => round2(v - my));
  const ds = { x, y };
  const best = gpGridSearch(ds);
  if (!isFinite(best.ll)) {
    failed = true;
    console.error(`GP LL FAIL: ${spec.id} best log marginal likelihood is not finite`);
  }
  report.push({
    dataset: spec.id, n: x.length,
    min: Math.min(...y), max: Math.max(...y),
    mle: { l: best.p.lengthscale, sf: best.p.signal, sn: best.p.noise },
    logLik: +best.ll.toFixed(2)
  });
  const entry = { id: spec.id, label: spec.label, note: spec.note, x, y,
    mle: best.p, mleLL: +best.ll.toFixed(3) };
  if (spec.challenge) entry.challenge = true;
  return entry;
});

// diagnostic for the non-convexity showcase: score the two rival explanations
{
  const ds = out.gp.find(d => d.id === 'gp-twostories');
  const short = GP.model.score(ds, { lengthscale: 0.35, signal: 0.8, noise: 0.35 });
  const long = GP.model.score(ds, { lengthscale: 2.5, signal: 0.45, noise: 0.7 });
  console.log(`two-stories check: short-wiggle LL ${short.toFixed(2)} vs slow-drift LL ${long.toFixed(2)} (grid best ${ds.mleLL})`);
}

console.table(report);
if (failed) {
  console.error('\nGeneration failed — fix specs or slider ranges. datasets.js NOT written.');
  process.exit(1);
}

// ------------------------------------------------------------ emit datasets.js

const banner = `/*
 * datasets.js — curated teaching datasets for The Likelihood Lab.
 *
 * GENERATED FILE — do not edit by hand. Edit the specs in
 * tools/generate-datasets.js and re-run: node tools/generate-datasets.js
 * All draws are seeded; values are rounded to 2 decimals.
 */

var MLEDatasets = `;

const body = JSON.stringify(out, null, 2)
  // keep each dataset's numeric arrays (data, and GP x/y) on one line for readability
  .replace(/"(data|x|y)": \[([^\]]+)\]/g, (m, key, nums) => `"${key}": [${nums.replace(/\s+/g, ' ').trim()}]`);

const target = path.join(__dirname, '..', 'js', 'datasets.js');
fs.writeFileSync(target, banner + body + `;

if (typeof module !== 'undefined') module.exports = MLEDatasets;
`);
console.log(`\nWrote ${target}`);
