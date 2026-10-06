/*
 * generate-reference.js — builds references/distributions-reference.html,
 * a print-friendly review document for the math layer: each distribution's
 * parameterization, PDF, MLE facts, and the curated datasets with their
 * fitted MLE curves. All figures are computed from js/distributions.js and
 * js/datasets.js at generation time, so the document cannot drift from the code.
 *
 * Run with:  node tools/generate-reference.js
 * (Print the HTML to PDF from any browser, or use the headless command in the README.)
 */

'use strict';

const fs = require('fs');
const path = require('path');
const D = require(path.join(__dirname, '..', 'js', 'distributions.js'));
const GP = require(path.join(__dirname, '..', 'js', 'gp.js'));
const DS = require(path.join(__dirname, '..', 'js', 'datasets.js'));

// ------------------------------------------------------------ palette (validated)

const C = {
  series: ['#2a78d6', '#008300', '#e87ba4'], // categorical slots 1–3, light mode
  ink: '#0b0b0b',
  sec: '#52514e',
  muted: '#898781',
  grid: '#e1e0d9',
  axis: '#c3c2b7',
  surface: '#fcfcfb',
  page: '#f9f9f7',
  border: 'rgba(11,11,11,0.10)'
};

// ------------------------------------------------------------ small helpers

const fmt = (v, d = 2) => Number(v.toFixed(d)).toString();

function sample(pdf, p, xlo, xhi, n) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const x = xlo + (xhi - xlo) * (i / n);
    pts.push([x, pdf(x, p)]);
  }
  return pts;
}

/* Choose integer-ish x tick positions, ~6 ticks. */
function ticks(xlo, xhi) {
  const span = xhi - xlo;
  const step = span > 14 ? 4 : span > 7 ? 2 : 1;
  const t = [];
  for (let x = Math.ceil(xlo / step) * step; x <= xhi + 1e-9; x += step) t.push(x);
  return t;
}

// ------------------------------------------------------------ figure builders

/* Overview figure: 2–3 example PDF curves with direct labels. */
function curveFigure(dist, curves, xlo, xhi) {
  const W = 640, H = 230, L = 14, R = 14, T = 30, B = 30;
  const pw = W - L - R, ph = H - T - B;
  const all = curves.map(c => sample(dist.pdf, c.p, xlo, xhi, 1200));
  const ymax = Math.max(...all.map(pts => Math.max(...pts.map(q => q[1])))) * 1.14;
  const sx = x => L + ((x - xlo) / (xhi - xlo)) * pw;
  const sy = y => T + ph - (y / ymax) * ph;

  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${dist.label} density examples">`;
  // baseline + ticks
  s += `<line x1="${L}" y1="${T + ph}" x2="${L + pw}" y2="${T + ph}" stroke="${C.axis}" stroke-width="1"/>`;
  for (const t of ticks(xlo, xhi)) {
    s += `<line x1="${sx(t)}" y1="${T + ph}" x2="${sx(t)}" y2="${T + ph + 4}" stroke="${C.axis}"/>` +
      `<text x="${sx(t)}" y="${T + ph + 16}" text-anchor="middle" font-size="11" fill="${C.muted}">${t}</text>`;
  }
  // curves
  curves.forEach((c, i) => {
    const d = all[i].map(([x, y], j) => `${j ? 'L' : 'M'}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join('');
    s += `<path d="${d}" fill="none" stroke="${C.series[i]}" stroke-width="2"/>`;
  });
  // direct labels: swatch line + secondary-ink text at the given anchor
  curves.forEach((c, i) => {
    const ax = sx(c.labelAt[0]), ay = sy(c.labelAt[1]) - 8;
    s += `<line x1="${ax - 16}" y1="${ay - 4}" x2="${ax - 4}" y2="${ay - 4}" stroke="${C.series[i]}" stroke-width="3"/>` +
      `<text x="${ax}" y="${ay}" font-size="12" fill="${C.sec}">${c.label}</text>`;
  });
  return s + '</svg>';
}

/* Dataset thumbnail: rug of observations + fitted MLE curve.
   Pass mle = null (challenge rounds) to draw the data only — no answer. */
function datasetThumb(dist, data, mle) {
  const W = 300, H = 120, L = 8, R = 8, T = 12, B = 18;
  const pw = W - L - R, ph = H - T - B;
  const dlo = Math.min(...data), dhi = Math.max(...data);
  const pad = (dhi - dlo) * 0.12 + 0.2;
  // gamma support starts at 0 — never draw the curve into negative x
  const xlo = dist.key === 'gamma' ? Math.max(0.001, dlo - pad) : dlo - pad;
  const xhi = dhi + pad;
  const pts = mle ? sample(dist.pdf, mle, xlo, xhi, 500) : null;
  const ymax = pts ? Math.max(...pts.map(q => q[1])) * 1.1 : 1;
  const sx = x => L + ((x - xlo) / (xhi - xlo)) * pw;
  const sy = y => T + ph - (y / ymax) * ph;

  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${mle ? 'dataset with fitted curve' : 'dataset (challenge — answer withheld)'}">`;
  s += `<line x1="${L}" y1="${T + ph}" x2="${L + pw}" y2="${T + ph}" stroke="${C.axis}" stroke-width="1"/>`;
  for (const x of data) {
    s += `<line x1="${sx(x).toFixed(1)}" y1="${T + ph}" x2="${sx(x).toFixed(1)}" y2="${T + ph - 9}" stroke="${C.muted}" stroke-width="1" opacity="0.55"/>`;
  }
  if (pts) {
    const d = pts.map(([x, y], j) => `${j ? 'L' : 'M'}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join('');
    s += `<path d="${d}" fill="none" stroke="${C.series[0]}" stroke-width="2"/>`;
  }
  s += `<text x="${L}" y="${H - 4}" font-size="10" fill="${C.muted}">${fmt(xlo, 1)}</text>` +
    `<text x="${L + pw}" y="${H - 4}" text-anchor="end" font-size="10" fill="${C.muted}">${fmt(xhi, 1)}</text>`;
  return s + '</svg>';
}

// ------------------------------------------------------------ per-distribution copy

const SECTIONS = [
  {
    key: 'normal',
    formula: 'f(x; μ, σ) = 1 / (σ√(2π)) · exp( −(x − μ)² / (2σ²) )',
    support: 'All real x.',
    curves: [
      { p: { mean: 0, sd: 1 }, label: 'μ = 0, σ = 1', labelAt: [0.4, 0.40] },
      { p: { mean: 0, sd: 2 }, label: 'μ = 0, σ = 2', labelAt: [-3.4, 0.20] },
      { p: { mean: 2, sd: 1 }, label: 'μ = 2, σ = 1', labelAt: [3.1, 0.36] }
    ],
    xlo: -8, xhi: 8,
    mleText: `Closed form, and the calculus route works exactly as taught:
      <em>μ̂</em> = x̄ (the sample mean) and <em>σ̂²</em> = (1/n) Σ(xᵢ − x̄)²
      — note the <strong>n</strong> denominator, not n−1: the MLE of the variance
      is the biased version. The demo's reveal button reports these values.`
  },
  {
    key: 'uniform',
    formula: 'f(x; a, b) = 1 / (b − a)  for a ≤ x ≤ b,   0 otherwise',
    support: 'x in [a, b]; requires a &lt; b.',
    curves: [
      { p: { lower: -4, upper: 4 }, label: 'a = −4, b = 4', labelAt: [-2.5, 0.125] },
      { p: { lower: 0, upper: 2 }, label: 'a = 0, b = 2', labelAt: [0.6, 0.5] }
    ],
    xlo: -6, xhi: 6,
    mleText: `The signature "derivative isn't the whole story" case. The likelihood is
      (b − a)<sup>−n</sup> whenever the interval covers every observation, and exactly
      0 the moment any point falls outside. Shrinking the interval always raises the
      likelihood, so the maximum sits on the <strong>boundary</strong>:
      <em>â</em> = min xᵢ, <em>b̂</em> = max xᵢ. No derivative is ever zero —
      ∂/∂b of −n·log(b − a) is −n/(b − a), strictly negative. The answer comes from
      order statistics, not calculus.`
  },
  {
    key: 'triangle',
    formula: 'f(x; c, w) = (w − |x − c|) / w²  for |x − c| &lt; w,   0 otherwise',
    support: 'x in (c − w, c + w); peak height 1/w at x = c.',
    curves: [
      { p: { center: 0, width: 4 }, label: 'c = 0, w = 4', labelAt: [-1.9, 0.19] },
      { p: { center: 2, width: 1.5 }, label: 'c = 2, w = 1.5', labelAt: [2.8, 0.60] }
    ],
    xlo: -6, xhi: 6,
    mleText: `Symmetric triangle: peak location <em>c</em> and half-width <em>w</em>.
      The log-likelihood Σ log(w − |xᵢ − c|) − 2n·log w has a <strong>kink at every
      data point</strong> (|x − c| is not differentiable at c = xᵢ), so blindly setting
      the derivative to zero fails — the classroom point. The demo finds the MLE
      numerically: a fine grid over the peak position with a golden-section search
      over the width at each candidate, then two local refinement passes.
      <br/><br/><strong>Parameterization note (decision pending):</strong> (c, w) and
      (min, max) = (c − w, c + w) are one-to-one reparameterizations of the same
      family, so the fitted density and maximized likelihood are identical either
      way — MLE is invariant to reparameterization. The only difference is slider
      ergonomics and which quantities the trace plots put on their x-axes.`
  },
  {
    key: 'lognormal',
    formula: 'f(x; μ, σ) = 1 / (x·σ·√(2π)) · exp( −(ln x − μ)² / (2σ²) )',
    support: 'x &gt; 0. Always right-skewed (more so as σ grows) — like the Gamma, it can never lean left.',
    curves: [
      { p: { mu: 0, sigma: 0.5 }, label: 'μ = 0, σ = 0.5', labelAt: [1.8, 0.82] },
      { p: { mu: 1, sigma: 0.5 }, label: 'μ = 1, σ = 0.5', labelAt: [3.4, 0.30] },
      { p: { mu: 1, sigma: 1 }, label: 'μ = 1, σ = 1', labelAt: [6.0, 0.14] }
    ],
    xlo: 0, xhi: 10,
    mleText: `Closed form, by the same route as the Normal — because it <em>is</em> the
      Normal, on the log scale: <em>μ̂</em> = mean(ln xᵢ) and
      <em>σ̂²</em> = (1/n) Σ(ln xᵢ − μ̂)². Pedagogically this tab is the on-ramp to
      the Gamma: location and spread sliders students already understand from the
      Normal, now producing a right-skewed positive distribution.`
  },
  {
    key: 'gamma',
    formula: 'f(x; k, θ) = x^(k−1) · e^(−x/θ) / ( Γ(k) · θᵏ )',
    support: 'x &gt; 0. Skewness is 2/√k — always positive: a Gamma can never lean left.',
    curves: [
      { p: { shape: 1, scale: 1.5 }, label: 'k = 1, θ = 1.5', labelAt: [1.5, 0.52] },
      { p: { shape: 2, scale: 1 }, label: 'k = 2, θ = 1', labelAt: [2.6, 0.34] },
      { p: { shape: 9, scale: 0.5 }, label: 'k = 9, θ = 0.5', labelAt: [5.3, 0.28] }
    ],
    xlo: 0, xhi: 12,
    mleText: `No closed form. Profiling out the scale gives <em>θ̂</em> = x̄ / k̂,
      leaving one equation in the shape: log k − ψ(k) = log x̄ − mean(log xᵢ),
      where ψ is the digamma function. The right-hand side is ≥ 0 by Jensen's
      inequality. The demo solves it by Newton's method from the standard
      Minka/Choi–Wette starting value, using its own log-gamma (Lanczos),
      digamma, and trigamma implementations (verified against reference values
      to ~10⁻¹¹).`
  }
];

// ------------------------------------------------------------ Gaussian Process section

/* Kernel overview figure: k(x − x′) for a few hyperparameter settings, plotted
   symmetrically on both sides of zero (matches the demo's live kernel figure). */
function gpKernelFigure() {
  const W = 640, H = 230, L = 14, R = 14, T = 30, B = 30;
  const pw = W - L - R, ph = H - T - B;
  const curves = [
    { p: { lengthscale: 0.5, signal: 1 }, label: 'ℓ = 0.5, σf = 1', at: [0.8, 0.42] },
    { p: { lengthscale: 2, signal: 1 }, label: 'ℓ = 2, σf = 1', at: [2.7, 0.62] },
    { p: { lengthscale: 1, signal: 0.6 }, label: 'ℓ = 1, σf = 0.6', at: [1.5, 0.16] }
  ];
  const RMAX = 5, ymax = 1.15;
  const sx = r => L + ((r + RMAX) / (2 * RMAX)) * pw;
  const sy = k => T + ph - (k / ymax) * ph;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="RBF kernel examples">`;
  s += `<line x1="${L}" y1="${T + ph}" x2="${L + pw}" y2="${T + ph}" stroke="${C.axis}" stroke-width="1"/>`;
  for (let t = -RMAX; t <= RMAX; t++) {
    s += `<line x1="${sx(t)}" y1="${T + ph}" x2="${sx(t)}" y2="${T + ph + 4}" stroke="${C.axis}"/>` +
      `<text x="${sx(t)}" y="${T + ph + 16}" text-anchor="middle" font-size="11" fill="${C.muted}">${t}</text>`;
  }
  curves.forEach((c, i) => {
    let d = '';
    for (let j = 0; j <= 800; j++) {
      const r = -RMAX + 2 * RMAX * j / 800;
      d += `${j ? 'L' : 'M'}${sx(r).toFixed(1)},${sy(GP.model.kernel(Math.abs(r), c.p)).toFixed(1)}`;
    }
    s += `<path d="${d}" fill="none" stroke="${C.series[i]}" stroke-width="2"/>`;
    const ax = sx(c.at[0]), ay = sy(c.at[1]) - 8;
    s += `<line x1="${ax - 16}" y1="${ay - 4}" x2="${ax - 4}" y2="${ay - 4}" stroke="${C.series[i]}" stroke-width="3"/>` +
      `<text x="${ax}" y="${ay}" font-size="12" fill="${C.sec}">${c.label}</text>`;
  });
  return s + '</svg>';
}

/* Regression dataset thumbnail: scatter + (optionally) the MLE mean and band.
   Pass mle = null for challenge rounds — data only, no answer. */
function gpThumb(ds, mle) {
  const W = 300, H = 120, L = 8, R = 8, T = 10, B = 18;
  const pw = W - L - R, ph = H - T - B;
  const xlo = Math.min(...ds.x) - 0.25, xhi = Math.max(...ds.x) + 0.25;
  const grid = [];
  for (let i = 0; i <= 100; i++) grid.push(xlo + (xhi - xlo) * i / 100);
  const post = mle ? GP._internals.posterior(ds.x, ds.y, mle, grid) : null;
  let ylo = Math.min(...ds.y), yhi = Math.max(...ds.y);
  if (post) {
    for (let i = 0; i <= 100; i++) {
      ylo = Math.min(ylo, post.mean[i] - 2 * post.sd[i]);
      yhi = Math.max(yhi, post.mean[i] + 2 * post.sd[i]);
    }
  }
  const ypad = (yhi - ylo) * 0.08 + 0.05;
  ylo -= ypad; yhi += ypad;
  const sx = x => L + ((x - xlo) / (xhi - xlo)) * pw;
  const sy = y => T + ph - ((y - ylo) / (yhi - ylo)) * ph;

  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${mle ? 'dataset with GP fit' : 'dataset (challenge — answer withheld)'}">`;
  s += `<line x1="${L}" y1="${T + ph}" x2="${L + pw}" y2="${T + ph}" stroke="${C.axis}" stroke-width="1"/>`;
  if (post) {
    let d = '';
    for (let i = 0; i <= 100; i++) d += `${i ? 'L' : 'M'}${sx(grid[i]).toFixed(1)},${sy(post.mean[i] + 2 * post.sd[i]).toFixed(1)}`;
    for (let i = 100; i >= 0; i--) d += `L${sx(grid[i]).toFixed(1)},${sy(post.mean[i] - 2 * post.sd[i]).toFixed(1)}`;
    s += `<path d="${d}Z" fill="${C.series[0]}" fill-opacity="0.12" stroke="none"/>`;
    let dm = '';
    for (let i = 0; i <= 100; i++) dm += `${i ? 'L' : 'M'}${sx(grid[i]).toFixed(1)},${sy(post.mean[i]).toFixed(1)}`;
    s += `<path d="${dm}" fill="none" stroke="${C.series[0]}" stroke-width="1.6"/>`;
  }
  ds.x.forEach((x, i) => {
    s += `<circle cx="${sx(x).toFixed(1)}" cy="${sy(ds.y[i]).toFixed(1)}" r="2" fill="${C.muted}" opacity="0.75"/>`;
  });
  s += `<text x="${L}" y="${H - 4}" font-size="10" fill="${C.muted}">${fmt(xlo, 1)}</text>` +
    `<text x="${L + pw}" y="${H - 4}" text-anchor="end" font-size="10" fill="${C.muted}">${fmt(xhi, 1)}</text>`;
  return s + '</svg>';
}

function gpSectionHtml() {
  const m = GP.model;
  const paramRows = m.params.map(p =>
    `<tr><td>${p.label}</td><td>${p.min} to ${p.max}</td><td>${p.step}</td><td>${p.default}</td></tr>`
  ).join('');

  const cards = DS.gp.map(ds => {
    if (ds.challenge) {
      return `<div class="card">
      ${gpThumb(ds, null)}
      <div class="card-body">
        <h4>${ds.label} <span class="n">(n = ${ds.x.length})</span></h4>
        <p class="mle">Answer withheld — students chase a target score in the demo.</p>
        <p class="note">${ds.note}</p>
      </div>
    </div>`;
    }
    const mleStr = m.params.map(p => `${p.label.match(/\((.+)\)/)[1]} = ${fmt(ds.mle[p.key])}`).join(', ');
    return `<div class="card">
      ${gpThumb(ds, ds.mle)}
      <div class="card-body">
        <h4>${ds.label} <span class="n">(n = ${ds.x.length})</span></h4>
        <p class="mle">MLE: ${mleStr} &nbsp;·&nbsp; log marginal likelihood ${fmt(ds.mleLL, 1)}</p>
        <p class="note">${ds.note}</p>
      </div>
    </div>`;
  }).join('\n');

  return `<section>
    <h2>Gaussian Process (regression)</h2>
    <p class="formula">k(x, x′) = σf² · exp( −(x − x′)² / (2ℓ²) ),&nbsp;&nbsp; cov(y) = K + σn²·I</p>
    <p class="formula">log p(y | x, θ) = −½ · yᵀ(K + σn²I)⁻¹y − ½ · log|K + σn²I| − (n/2) · log 2π</p>
    <p class="support"><strong>Setup:</strong> 1-D zero-mean GP regression on centered data;
      sliders are standard deviations (same units as y). The demo plots the posterior mean
      with a ±2 sd <em>predictive</em> band (noise included, so ~95% of points should sit
      inside it when the fit is right), plus a live figure of the kernel showing the
      +σn² noise spike at distance 0. The score is the log <em>marginal</em> likelihood.</p>
    <div class="fig">${gpKernelFigure()}</div>
    <table class="params">
      <thead><tr><th>Parameter (slider)</th><th>Range</th><th>Step</th><th>Neutral start</th></tr></thead>
      <tbody>${paramRows}</tbody>
    </table>
    <h3>Maximum likelihood estimator</h3>
    <p>No closed form — and unlike every other tab, the log marginal likelihood is
      <strong>heavily non-convex</strong> in (ℓ, σf, σn): rival explanations ("fast wiggle,
      little noise" versus "slow drift, lots of noise") form separate local maxima, so
      coordinate-wise tuning can strand a student on the wrong hill. That is the capstone
      teaching point of this tab. The demo's answers are precomputed offline by an
      exhaustive coarse pass over the <em>entire</em> slider grid plus local refinement
      (tools/generate-datasets.js) — a search that cannot be trapped in the wrong basin —
      and the stored target is the best grid point, exactly reachable with the sliders.</p>
    <h3>Curated datasets</h3>
    <p class="thumbnote">Thumbnails show the data with the MLE fit (posterior mean ± 2 sd
      band). Challenge rounds show the data only; their answers are deliberately not in
      this document.</p>
    <div class="cards">${cards}</div>
  </section>`;
}

// ------------------------------------------------------------ assemble HTML

function sectionHtml(sec) {
  const dist = D.byKey[sec.key];
  const paramRows = dist.params.map(p =>
    `<tr><td>${p.label}</td><td>${p.min} to ${p.max}</td><td>${p.step}</td><td>${p.default}</td></tr>`
  ).join('');

  const cards = DS[sec.key].map(ds => {
    // challenge rounds: data only — no fitted curve, no MLE, no log-likelihood,
    // so this document never leaks a challenge answer
    if (ds.challenge) {
      return `<div class="card">
      ${datasetThumb(dist, ds.data, null)}
      <div class="card-body">
        <h4>${ds.label} <span class="n">(n = ${ds.data.length})</span></h4>
        <p class="mle">Answer withheld — students chase a target score in the demo.</p>
        <p class="note">${ds.note}</p>
      </div>
    </div>`;
    }
    const mle = dist.mle(ds.data);
    const ll = dist.logLik(ds.data, mle);
    const mleStr = dist.params.map(p => `${p.label.match(/\((.+)\)/)[1]} = ${fmt(mle[p.key])}`).join(', ');
    return `<div class="card">
      ${datasetThumb(dist, ds.data, mle)}
      <div class="card-body">
        <h4>${ds.label} <span class="n">(n = ${ds.data.length})</span></h4>
        <p class="mle">MLE: ${mleStr} &nbsp;·&nbsp; log-likelihood ${fmt(ll, 1)}</p>
        <p class="note">${ds.note}</p>
      </div>
    </div>`;
  }).join('\n');

  return `<section>
    <h2>${dist.label}</h2>
    <p class="formula">${sec.formula}</p>
    <p class="support"><strong>Support:</strong> ${sec.support}</p>
    <div class="fig">${curveFigure(dist, sec.curves, sec.xlo, sec.xhi)}</div>
    <table class="params">
      <thead><tr><th>Parameter (slider)</th><th>Range</th><th>Step</th><th>Neutral start</th></tr></thead>
      <tbody>${paramRows}</tbody>
    </table>
    <h3>Maximum likelihood estimator</h3>
    <p>${sec.mleText}</p>
    <h3>Curated datasets</h3>
    <p class="thumbnote">Each thumbnail shows the observations (rug marks) with the
      MLE-fitted density — i.e. what the reveal button will show for that dataset.
      Challenge rounds show the data only; their answers are deliberately not in
      this document.</p>
    <div class="cards">${cards}</div>
  </section>`;
}

const html = `<meta charset="utf-8">
<title>The Likelihood Lab — Distribution &amp; Dataset Reference</title>
<style>
  body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
         color: ${C.ink}; background: ${C.page}; margin: 0; }
  main { max-width: 760px; margin: 0 auto; padding: 32px 24px 64px; }
  h1 { font-size: 26px; margin: 0 0 4px; }
  h2 { font-size: 21px; margin: 40px 0 6px; border-bottom: 1px solid ${C.grid}; padding-bottom: 4px; }
  h3 { font-size: 15px; margin: 20px 0 6px; }
  h4 { font-size: 13.5px; margin: 0 0 3px; }
  p, td, th { font-size: 13.5px; line-height: 1.5; color: ${C.ink}; }
  .subtitle, .note, .thumbnote, .n { color: ${C.sec}; }
  .formula { font-family: ui-monospace, Menlo, monospace; font-size: 13px;
             background: ${C.surface}; border: 1px solid ${C.grid};
             padding: 8px 12px; border-radius: 6px; }
  .support { margin-top: 6px; }
  .fig svg { width: 100%; height: auto; background: ${C.surface};
             border: 1px solid ${C.border}; border-radius: 8px; }
  table.params { border-collapse: collapse; margin: 12px 0; }
  table.params th, table.params td { border: 1px solid ${C.grid}; padding: 4px 10px;
             text-align: left; font-variant-numeric: tabular-nums; }
  table.params th { background: ${C.surface}; font-weight: 600; }
  .cards { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .card { background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 8px;
          padding: 10px; break-inside: avoid; }
  .card svg { width: 100%; height: auto; }
  .card .mle { font-size: 12px; color: ${C.sec}; margin: 2px 0 6px;
               font-variant-numeric: tabular-nums; }
  .card .note { font-size: 12px; margin: 0; }
  .zero { background: ${C.surface}; border: 1px solid ${C.grid}; border-radius: 8px;
          padding: 4px 16px 8px; margin-top: 12px; }
  @media print {
    body { background: white; }
    section { break-inside: auto; }
    .cards { gap: 10px; }
  }
</style>
<main>
  <h1>The Likelihood Lab — Distribution &amp; Dataset Reference</h1>
  <p class="subtitle">Generated from <code>js/distributions.js</code> and
    <code>js/datasets.js</code> by <code>tools/generate-reference.js</code> — the
    figures are computed by the demo's own math layer, so this document always
    matches the code. Regenerate after any change.</p>

  <p>The demo scores every parameter setting by the <strong>log-likelihood</strong>
    ℓ(θ) = Σᵢ log f(xᵢ; θ). The maximum likelihood estimate is the θ that
    maximizes it — the parameter values that make the observed data most probable.</p>

  <div class="zero">
    <h3>Zero likelihood vs. invalid parameters</h3>
    <p>Two different situations both produce a non-finite score, and the demo will
      distinguish them. (1) <strong>Zero likelihood:</strong> the parameters define a
      perfectly valid distribution, but at least one observed point has density 0
      under it — e.g. a Uniform whose interval doesn't cover all the data. The
      likelihood is exactly 0, so the log-likelihood is −∞. Defined, honest, and a
      teaching moment. (2) <strong>Invalid parameterization:</strong> the parameters
      don't define a distribution at all (a Uniform with lower ≥ upper). There is no
      likelihood to evaluate; the demo will label this state "not a valid
      distribution" rather than showing a number.</p>
  </div>

  ${SECTIONS.map(sectionHtml).join('\n')}
  ${gpSectionHtml()}
</main>
`;

const target = path.join(__dirname, '..', 'references', 'distributions-reference.html');
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, html);
console.log(`Wrote ${target}`);
