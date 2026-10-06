# The Likelihood Lab

An interactive, single-page teaching demo for maximum likelihood estimation.
Pick a distribution, see a dataset, and drag the parameter sliders to fit the
probability density function over the data — the log-likelihood readout and
per-parameter trace plots show how good your fit is and how your attempts
stack up. A reveal button marks the true (empirical) MLE so you can compare
your best manual fit to the answer.

The teaching point: MLE is not an algebra exercise — it is finding the
parameter values that make the observed data most probable, which you can
*see* as fitting the shape of the PDF over the data. Some datasets are
deliberately mismatched to their distribution (bimodal data under a Normal,
for example), because real data never comes with its true distribution
attached — the distribution is a modeling choice.

## Running it

Everything is client-side HTML + JavaScript with no dependencies and no build
step. Open `index.html` in a browser, or serve the directory with any static
file server:

```
python -m http.server
```

Deployed via GitHub Pages.

## Structure

- `index.html` — the page
- `css/style.css` — styling
- `js/distributions.js` — math layer: PDFs, log-likelihoods, empirical MLE
- `js/datasets.js` — curated, labeled teaching datasets
- `js/app.js` — UI layer: SVG rendering, sliders, attempt tracking

## Local Development

This project uses Claude Code. Shared settings live in `.claude/settings.json`
(committed). Machine-specific settings — anything containing an absolute local
path, such as `additionalDirectories` — belong in `.claude/settings.local.json`,
which is gitignored; create your own copy if you need local overrides.
