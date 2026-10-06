/*
 * datasets.js — curated teaching datasets for The Likelihood Lab.
 *
 * GENERATED FILE — do not edit by hand. Edit the specs in
 * tools/generate-datasets.js and re-run: node tools/generate-datasets.js
 * All draws are seeded; values are rounded to 2 decimals.
 */

var MLEDatasets = {
  "normal": [
    {
      "id": "normal-clean",
      "label": "Well-behaved sample",
      "note": "Drawn from a Normal distribution. A clean warm-up: center the peak on the data, then match the spread.",
      "data": [2.28, 0.96, 1.28, 3.51, 4.28, 2.57, 3.46, 3.41, -1.08, 3.34, 1.85, -0.16, -1.18, -1.35, 1.24, 3.01, 3.32, 3.75, 3.73, 3.01, 4.71, 1.6, 2.37, 2.04, -0.6, 2.35, 0.1, 1.56, 2.16, 3.52, 0.71, 3.35, 2.4, 0.51, 1.13, 4.53, 2.76, 1.35, 2.01, 1.46, 2.64, 4.05, 1.38, 0.62, 0.41, 2.87, 3.6, 1.08, 3.37, 3.35, -0.54, 0.59, 3.99, 4.57, 2.62, 0.5, 1.49, 3.49, 1.57, 0.43]
    },
    {
      "id": "normal-tight",
      "label": "Tight cluster",
      "note": "A Normal sample with a small spread. Watch how quickly the likelihood collapses when the curve is too wide — or too narrow.",
      "data": [-3.42, -2.63, -3.05, -2.86, -2.68, -2.5, -2.88, -2.85, -3.62, -4.02, -2.67, -3.66, -2.99, -2.6, -3.09, -2.26, -2.59, -2.97, -2.47, -4.05, -3.55, -3.11, -3.07, -2.92, -3.26, -2.87, -2.37, -3.02, -3.17, -2.61, -3.31, -3.6, -3.41, -3.02, -3.18, -2.59, -3.41, -2.52, -3.11, -2.31, -3.7, -3.2, -3.25, -2.75, -1.65, -2.39, -3.53, -3.4, -3.29, -2.41]
    },
    {
      "id": "normal-wide",
      "label": "Wide spread",
      "note": "A Normal sample with a large spread. The best σ is bigger than it looks.",
      "data": [4.48, 4.48, 1.12, 3.6, 1.38, 6.4, -5.14, 3.95, -2.42, -1.72, -1.18, -2.57, 1.82, 5.82, 3.79, -3.65, 0.2, 2.75, 4.46, -0.86, -0.79, 2.26, 0.41, 2.14, 2.64, -0.35, -3.55, -3.43, -0.47, -1, -3.62, -1.9, -0.6, 4.42, 3.02, -2.53, -2.88, -3.83, -0.3, 0.94, 3.09, -6.4, -1.31, 3.1, 1.75, 1.95, 0.06, 4.03, -1.83, -0.83, -3.6, 1.79, -1.69, 1.25, 1.69, -0.26, -0.36, -1.08, -2.14, 2.15]
    },
    {
      "id": "normal-bimodal",
      "label": "Bimodal (two humps)",
      "note": "This data has two clusters — no single Normal can capture both. Where does the best-fitting Normal put its peak, and what does it do with σ?",
      "data": [-2.89, -2.9, -1.76, -3.55, -1.29, -3.19, -3.71, -2.04, -1.75, -4.22, -2.11, -2.66, -3.13, -2.97, -2.08, -2.82, -3.52, -2.49, -2.44, -4.93, -1.87, -2.83, -2.9, -1, -1.99, -2.4, -1.23, -2.39, -1.71, -4.95, 4.96, 3.75, 2.54, 1.85, 3.26, 2.58, 2.61, 2.58, 2.8, 1.7, 2.54, 3.65, 4.82, 1.28, 3.82, 4.6, 3.21, 2.8, 3.29, 4.41, 1.58, 1.87, 3.82, 4.45, 4.68, 4.09, 3.44, 5.08, 1.52, 1.92]
    },
    {
      "id": "normal-outliers",
      "label": "Outliers on the right",
      "note": "Mostly a tight Normal sample, plus a few far-out points. See how much a handful of outliers drags the fit.",
      "data": [0.25, 1.01, 0.63, 1.5, 0.86, 0.54, 0.47, 1.46, 1.45, 1.41, 0.93, -1.08, 1.29, -0.51, 1.28, -0.01, 2.91, 1.22, 1.71, 1.11, 2.66, 1.82, 0.48, 1.47, 0.26, -0.04, 2.05, 0.86, -0.3, 0.8, -0.1, 1.24, 0.95, 0.4, 0.93, 1.29, 2.96, -0.51, 1.05, 1.66, 2.34, 3.8, 0.96, 0.61, 2, 0.64, 3.03, 2.21, 0.54, 0.3, 1.65, 0.68, 7.5, 8.2, 9]
    },
    {
      "id": "normal-challenge-1",
      "label": "Challenge round 1",
      "note": "No answer button from here on. Set the curve, watch the score, and chase the target on the right — it is reachable with these sliders.",
      "data": [-3.39, 0.11, -4.55, -0.73, 3.23, 1.02, -5.25, -3.73, -1.99, -1.61, -5.27, -0.16, -3.25, 1.83, -0.93, -4.24, -2.24, -1.37, -1.17, -2.87, -3.15, -0.66, -2.71, -2.13, 1.94, -2.77, -1.79, -3.07, -3.28, -4.05, -3.9, 1.3, 1.55, -5.29, -1.14, 1.29, -0.71, -3.44, 4.59, -1.64, 1.53, -2.86, -0.65, 4.77, -1.61, -2.8, -2.85, -3.54, -1.53, -3.91, -0.09, -3.68, -1.19, -2.59, -2.11, -0.68, -0.52, -0.11, -0.49, -1.94],
      "challenge": true
    },
    {
      "id": "normal-challenge-2",
      "label": "Challenge round 2",
      "note": "Blind round: nobody tells you where this data came from. Fit it as well as the sliders allow.",
      "data": [3.04, 2.52, 3.11, 4.39, 2.4, 1.38, 2.8, 2.65, 2.6, 2.53, 3.75, 1.89, 3.97, 2.37, 3.32, 3.66, 2.88, 3.53, 3.65, 2.69, 1.36, 2.01, 3, 3.86, 3.58, 3.25, 3.44, 2.09, 3.28, 3.44, 2.69, 3.39, 2.47, 2.83, 2.96, 1.53, 3.11, 4.14, 2.76, 4.2, 3.94, 3.6, 4.47, 2.96, 3.64, 2.24, 4.13, 2.82, 3.41, 3.22],
      "challenge": true
    },
    {
      "id": "normal-challenge-3",
      "label": "Challenge round 3",
      "note": "Keep an eye on both parameters — the target will not fall to one slider alone.",
      "data": [-2.52, 1.8, -0.28, -3.8, 3.33, 3.44, -1.96, 3.35, -3.87, -1.39, 1.58, 4.86, -4.37, -3.01, -1.15, 0.39, 6.23, -6.99, -2.45, -4.32, 1.33, -2.08, -4, 3.63, 0.98, 0.3, 8.98, 0.85, -2.13, 3.52, 1.36, -6.33, 6.97, -0.21, 0.89, 2.69, -1.44, -5.36, -3, -3.53, 2.24, -1.2, 8.51, 0.39, -1.24, 2.84, 0.99, -4.55, 5.49, 2.1, -0.44, 8.56, -1.13, 2.88, -1.96, -0.81, -3.41, 0.38, -1.44, 1.44],
      "challenge": true
    },
    {
      "id": "normal-challenge-4",
      "label": "Challenge round 4",
      "note": "Real data rarely comes from the distribution you are fitting. Do the best you can and hit the target.",
      "data": [-1.88, -1.54, -3.2, -1.31, -1.85, -1.1, -3.2, -3.29, -1.96, -2.36, -2.31, -2.01, -1.7, -1.98, -2.39, -1.49, -2.51, -1.34, -2.22, -0.83, -2.58, -1.32, -2.5, -1.18, -2.33, -1.68, -2.93, -2.18, -2.16, -1.74, 3.03, 3.29, 2.24, 1.49, 2.41, 1.72, 1.99, -0.57, 2.35, 1.1, 0.69, 2.55, 2.02, 1.29, 3.07, 3.39, 1.76, 2.75, 2.13, 2.42, 2.66, 1.92, 2.23, 2.41, 0.87, 1.47, 1.75, 1.14, 2.31, 3.16],
      "challenge": true
    },
    {
      "id": "normal-challenge-5",
      "label": "Challenge round 5",
      "note": "Last one. Trust what the attempt panels have taught you about where the score peaks.",
      "data": [-3.71, -3.97, -5.47, -3.12, -4.39, -1.87, -2.84, -4.01, -4.24, -5.32, -4.1, -4.19, -5.28, -2.04, -3.07, -6.33, -4.28, -2.02, -3.9, -2.59, -4.1, -3.52, -5.4, -4.93, -3.33, -4.69, -2.59, -4.21, -3.32, -3.06, -2.65, -4.99, -5.62, -6.11, -4.76, -2.42, -5.15, -3.57, -4.47, -4.93, -4.17, -4.52, -2.89, -1.8, -4.43, -4.14, -2.22, -2.39, -4.34, -5.87, -3.53, -4.2, -2.6, 5.5, 6.2],
      "challenge": true
    }
  ],
  "uniform": [
    {
      "id": "uniform-clean",
      "label": "Well-behaved sample",
      "note": "Drawn from a Uniform distribution. Notice the best fit hugs the smallest and largest points exactly — no calculus will find this one.",
      "data": [-0.49, -0.54, -0.99, 2.74, -3.59, -2.69, -0.46, -0.98, 0.02, 3.1, 3.3, 2.66, 3.27, -2.11, -3.14, -1.21, -3.61, -0.22, 1.16, -0.77, 1.96, -2.53, 2.86, -3.55, 0.67, -0.55, -2.64, 2.05, -1.2, 3.81, -0.85, -0.91, -2.64, -2.36, 2.19, -1.62, -1.63, -1.29, 1.32, -2.02, -3.8, -3.37, 0.81, 1.57, 3.18, 1.59, 2.66, -2.11, 1.11, -0.52, 1.02, 0.5, -3.11, 1.93, 0.53, 0.22, 1.15, 0.03, -2.13, 2.41]
    },
    {
      "id": "uniform-narrow",
      "label": "Narrow band",
      "note": "A Uniform sample over a short interval. Shrinking the interval raises the likelihood — until a point falls outside.",
      "data": [1.26, 2.93, 1.44, 1.99, 1.73, 1.59, 1.97, 1.72, 1.55, 1.22, 1.4, 2.34, 2.24, 2.38, 1.54, 2.01, 1.23, 2.89, 1.69, 1.38, 2.54, 1.2, 1.96, 1.9, 2.44, 1.2, 2.77, 2.64, 2.29, 2.76, 1.32, 2.12, 1.58, 2.94, 1.23, 1.61, 1.73, 2.91, 2.62, 2.26, 2.58, 2, 1.49, 1.13, 2.35, 2.09, 2.88, 2.78, 1.3, 2.65]
    },
    {
      "id": "uniform-skewed",
      "label": "Skewed (not uniform at all)",
      "note": "This data is piled up near the left (it was drawn from a Gamma distribution). The Uniform fit only cares about the smallest and largest points — everything in between is invisible to it.",
      "data": [1.28, 0.49, 2.07, 2.27, 1.7, 1.7, 4, 1.74, 1.39, 0.36, 0.72, 1.57, 1.74, 1.81, 0.76, 1.92, 0.89, 1.55, 1.86, 1.35, 0.84, 2.52, 2.05, 3.26, 1.74, 0.81, 0.19, 1.64, 1.23, 1.15, 3.85, 0.99, 0.5, 0.73, 3.54, 2.25, 4.08, 1.2, 8.08, 2.68, 1.05, 2.2, 0.2, 0.57, 3.54, 0.51, 3.71, 0.78, 3.01, 1.24, 0.64, 1.18, 0.99, 1.7, 1.58, 0.31, 4.07, 1.66, 0.79, 3.29]
    },
    {
      "id": "uniform-straggler",
      "label": "One straggler",
      "note": "A tidy Uniform sample plus one point far to the right. One single point sets the upper bound — how much likelihood does it cost?",
      "data": [0.36, -0.19, -0.81, -1.05, -0.79, 1.1, -0.5, 1.63, -0.16, -1.96, -0.34, 0.35, -0.17, -0.45, 1.53, 0.9, -1.51, -0.05, -0.09, 1.28, -1.67, 1.11, 0.46, -0.32, 0.37, 0.56, 0.91, -1.1, -1.71, 1.02, 1.34, 1.08, 1.89, -0.45, 1.02, -0.14, 0.7, 0.03, 0.95, 1.12, -0.89, -1.36, -0.89, -0.71, 0.45, 0.61, 0.81, -1.32, -1.31, 5]
    },
    {
      "id": "uniform-humped",
      "label": "Humped in the middle",
      "note": "This data clusters in the center (it was drawn from a Normal distribution). The Uniform cannot express the hump — its best fit still runs edge to edge.",
      "data": [1.66, -1.39, -1.58, 0.55, -1.31, -0.28, -2.03, -0.24, 0.58, -0.42, 0.48, 1.88, 0.28, 1.1, -2.32, 0.66, 0.5, -1.12, 0.44, 0.78, 0.89, 0.09, -0.74, 0.1, -0.67, 0.81, -0.83, -0.38, -0.28, 0.61, 1.73, 1.05, 0.05, -0.83, 2.11, -1.31, 0.95, -0.57, -0.61, 2.35, -0.58, -1.34, 0.63, 1.25, -0.95, 0.94, 0.79, 0.89, 0.53, 1.36, -0.8, 2.43, -0.51, 1.21, 0.09, 1.32, -1.44, 0.62, 0.73, -0.29]
    },
    {
      "id": "uniform-challenge-1",
      "label": "Challenge round 1",
      "note": "No answer button from here on. Set the curve, watch the score, and chase the target on the right — it is reachable with these sliders.",
      "data": [-0.18, 1.05, 1.01, -2.17, -0.48, 1.3, -1.52, 1.3, -1.15, 1.23, -1.61, -2.6, 0.25, 0.63, -1.23, -3.32, -0.56, -3.29, -0.82, -2.22, 0.18, -3.36, -0.89, -0.29, -2.35, 0, 0.09, -2.23, -1.28, 1.33, 1.5, -0.64, -0.46, -0.23, -3.31, -2.78, 0.5, 0.22, -1.7, -1.09, -1.88, 0.34, 0.15, -1.46, 0.71, 0.96, 0.89, -2.32, -2.17, 0, -0.8, -0.68, -3.21, 0.91, -1.58],
      "challenge": true
    },
    {
      "id": "uniform-challenge-2",
      "label": "Challenge round 2",
      "note": "Blind round: nobody tells you where this data came from. Fit it as well as the sliders allow.",
      "data": [1.2, 5.9, 5.5, 5, 1.33, 6.03, 3.34, 2.11, 3.35, 6.12, 1.87, 4.73, 6.44, 2.22, 1.27, 3.27, 1.44, 3.33, 4.25, 0.56, 0.88, 3.56, 5.55, 1.03, 3.82, 5.11, 2.55, 1.56, 2.52, 2.1, 0.94, 4.15, 4.3, 2.36, 5.79, 6.2, 0.67, 4.96, 5.29, 4.22, 4.85, 1.41, 5.68, 3.67, 4.21, 6.06, 0.93, 1.57, 0.56, 1.66, 3.63, 3.41, 5.53, 3.66, 2.17, 2.72, 4.4, 3.76, 2.81, 3.27],
      "challenge": true
    },
    {
      "id": "uniform-challenge-3",
      "label": "Challenge round 3",
      "note": "Keep an eye on both parameters — the target will not fall to one slider alone.",
      "data": [-4.57, -2.3, -2.67, -1.88, -1.04, -5.35, -2.7, -4.37, -5.2, -2.3, -2.17, -4.21, -4.06, -4.05, -2.96, -4.22, -6, -5.45, -1.93, -1.28, -1.39, -5.17, -3.33, -2.49, -3.41, -2.54, -1.49, -3.3, -4.6, -1.26, -3.15, -3.51, -1.38, -4.57, -5.63, -2.8, -3.1, -1.14, -1.49, -4.02, -2.19, -1.51, -1.4, -1.32, -1.49, -5.89, -4.53, -3.16, -2.95, -2.25],
      "challenge": true
    },
    {
      "id": "uniform-challenge-4",
      "label": "Challenge round 4",
      "note": "Real data rarely comes from the distribution you are fitting. Do the best you can and hit the target.",
      "data": [-0.27, 3.13, 2.09, -0.43, 0.58, -0.35, 0.22, 0.91, 1.68, 0.12, 2.59, 1.6, 1.64, 0.5, -0.83, 0.6, -0.1, 0.75, 0.25, 2.86, 0.51, 0.08, -0.49, 0.93, 2.34, 1.03, 1.45, 0.76, 1.93, 2.57, 0.67, -0.17, 0.2, -1.24, 1.69, 2.1, 1.38, 1.81, 2.78, 2.68, 0.76, -0.51, 1.41, 1.56, 2.56, 0.91, 0.6, 1.71, 1.53, 0.96, 1.44, 2.75, 1.21, 2.48, 0.7, 0.78, 2.82, 2.79, 2.88, 0.47],
      "challenge": true
    },
    {
      "id": "uniform-challenge-5",
      "label": "Challenge round 5",
      "note": "Last one. Trust what the attempt panels have taught you about where the score peaks.",
      "data": [0.92, -0.56, -0.99, -0.04, 0.46, -0.87, -0.43, -0.72, -0.22, 0.42, 0.79, -0.34, -0.95, -0.55, -0.35, 0.65, 0.96, -0.17, -0.57, 0.52, -0.5, 0.19, -0.47, -0.26, 0.4, 0.24, 0.71, -0.25, 0.09, -0.08, -0.34, 0.35, -0.88, 0.7, 0.75, -0.07, -0.75, 0.63, -0.75, -0.23],
      "challenge": true
    }
  ],
  "triangle": [
    {
      "id": "triangle-clean",
      "label": "Well-behaved sample",
      "note": "Drawn from a Triangle distribution. The likelihood has a kink at every data point — the peak parameter cannot be found by setting a derivative to zero.",
      "data": [-0.02, -1.08, 1.43, 3.78, 0.52, 1.73, -3.25, 2.05, -1.02, -1.86, -0.68, 0.73, -2.1, -3.58, -2.37, 0.49, -0.29, 1.44, -1.75, -2.1, -1.09, 1.54, -1.41, 0.94, 2.35, -0.2, 1.27, -0.41, -2.45, -1.26, 1.21, 0.11, 0.84, 0.73, -0.13, -0.86, -0.38, 2.31, 1.2, -1.79, -0.53, -0.28, -3.3, 0.83, -0.61, -2.14, -1.32, 0.67, -0.96, -1.91, 0.19, -0.32, 0.34, 2.4, -0.86, -2.07, -2.23, -1.28, 1.53, -1.77]
    },
    {
      "id": "triangle-offcenter",
      "label": "Off-center peak",
      "note": "A Triangle sample whose peak is not at zero. Slide the peak first, then tighten the width.",
      "data": [3.85, 4.64, 2.27, 2.11, 1.13, 3.43, 2.89, 4.17, 4.19, 3.7, 2.96, 3.07, 4.19, 1.8, 3.51, 3.58, 3.15, 4.02, 2.72, 2.31, 2.66, 3.65, 1.93, 2.46, 4.37, 2.13, 1.77, 4.2, 2.85, 2.2, 2.67, 3.22, 3.09, 3.05, 3.5, 3.33, 4.17, 2.7, 4.78, 3.31, 3.81, 2.65, 3.81, 3.58, 2.39, 3.12, 3.32, 3.94, 4.28, 3.61]
    },
    {
      "id": "triangle-flat",
      "label": "Flat (uniform data)",
      "note": "This data is spread evenly (drawn from a Uniform distribution). The Triangle wants a peak the data does not have — where does it put it?",
      "data": [2.59, 1.82, -0.92, 0.07, -0.85, 0.93, -1.09, -0.85, -1.96, -0.21, 0.49, -0.03, 1, -0.03, -1.65, 2.6, -2.9, 0.27, 0.46, -0.28, -0.64, 1.37, -0.34, 2.73, -1.41, -1.21, 1.49, -0.03, -2.71, -2.72, 0.19, 1.27, 1.38, 2.95, 0.78, -0.58, -1.54, -0.07, 2.64, 2.36, -2.15, -2.64, -1.98, 2.26, 1.94, -0.23, 2.59, 1.87, 2.77, -2.46, 0.12, -0.76, 0.83, 1.33, 0.55, 0.82, 2.46, 0.51, 2.49, 2.93]
    },
    {
      "id": "triangle-bell",
      "label": "Bell-shaped (normal data)",
      "note": "This data was drawn from a Normal distribution. A triangle is a decent stand-in for a bell — but the tails cost it.",
      "data": [-1.19, -1.07, -1.04, -1.46, -2.75, -1.99, -1.75, -1.44, -0.07, -1.16, -1.23, -0.32, 2.19, -0.18, -1.03, -0.13, 0.12, 2.44, -0.58, 0.64, -1.88, 0.11, -3.15, 1.5, -0.99, -0.37, 0.57, -1.26, 1.49, 1.45, 0.76, 1.5, -1.75, 1.04, -1.01, -0.55, 1.89, 0.81, 2.82, -2.43, 0.81, 0.33, -0.71, -1.18, -0.21, -3.14, 1.82, 1.91, 0.69, -2.51, 0.32, -0.75, 3.03, 0.56, -0.03, -4.22, -2.15, 1.98, 3.3, 0.45]
    },
    {
      "id": "triangle-skewed",
      "label": "Skewed (gamma data)",
      "note": "This data is piled up on the left with a long tail to the right (drawn from a Gamma distribution). A symmetric triangle has to compromise — watch the trade-off between covering the tail and centering the mass.",
      "data": [0.71, 0.85, 0.05, 2.88, 1.34, 2.41, 0.9, 1.49, 2.93, 1.87, 1.48, 1.88, 1.04, 1.35, 5.88, 1.07, 3.46, 1.71, 1.92, 1.69, 1.54, 0.47, 4.27, 4.6, 1, 1.87, 3.66, 2.07, 1.26, 0.61, 2.99, 2.97, 0.13, 2.69, 1.04, 2.67, 1.37, 1.73, 3.04, 2.08, 2.83, 2.41, 0.9, 1.78, 1.42, 2.83, 0.38, 1.27, 0.27, 2.65, 0.59, 2.73, 2.44, 1.61, 3.52, 0.42, 1.44, 2.4, 2.15, 4.45]
    },
    {
      "id": "triangle-challenge-1",
      "label": "Challenge round 1",
      "note": "No answer button from here on. Set the curve, watch the score, and chase the target on the right — it is reachable with these sliders.",
      "data": [-0.63, -2.46, -1.94, -2.23, -1.44, -2.5, -0.11, 0.27, -0.48, -0.03, -2.72, 0.57, -1.89, -0.39, -0.71, -1.57, -2.34, -1.98, -2.1, -2.61, -2.3, -2.08, -1.02, -3.09, -0.94, -1.42, -0.26, -2.46, -1.12, -0.36, 0.15, -1.45, -0.33, -1.97, -2.53, -2.17, -1.42, -1.32, -1.23, -1.67, 0.42, -0.48, -1.6, -1.09, -1.45, 0.34, -0.85, 1.1, 1.02, -0.98, -2.74, -2.61, -3.69, -1.58, 1.43, -1.07, -1.97, -2.1, -1.75, -1.55],
      "challenge": true
    },
    {
      "id": "triangle-challenge-2",
      "label": "Challenge round 2",
      "note": "Blind round: nobody tells you where this data came from. Fit it as well as the sliders allow.",
      "data": [-0.8, 3.42, 1.9, 2.13, 3.39, 2.76, 4.39, 2.92, 1.4, 0.29, 3.22, 0.95, 0.96, 1.19, 1.57, 2.99, 0.75, 3.62, 2.57, 1.39, 3.07, 3.32, 3.37, 3.3, 1.19, 2.85, 2.55, 2.25, 0.03, 0.52, 2.48, 2.91, 1.87, 4.3, 2.15, 2.66, 3.97, 2.69, 2.6, 2.46, 1.39, 4.04, 1.68, 2.5, 3.61, 2.79, 1.03, -0.47, 1.75, 2.46, 4.23, 1.93, 2.54, 2.36, 2.94, 3.65, 4.84, 3.09, 1.61, 3.61],
      "challenge": true
    },
    {
      "id": "triangle-challenge-3",
      "label": "Challenge round 3",
      "note": "Keep an eye on both parameters — the target will not fall to one slider alone.",
      "data": [-1.82, -2.48, -4.23, -2.49, -3.47, -2.84, -2.99, -3.77, -2.44, -2.85, -2.41, -3.16, -4.04, -2.76, -3.16, -2.42, -2.78, -2.24, -3.18, -2.96, -3.27, -3.16, -3.1, -2.76, -2.9, -1.81, -2.29, -3.17, -2, -3.63, -2.15, -2.72, -2.75, -1.88, -3.66, -3.54, -3.68, -2.24, -2.99, -3.95, -2.48, -2.23, -2.61, -2.04, -3.86, -1.64, -2.94, -2.66, -2.04, -2.34],
      "challenge": true
    },
    {
      "id": "triangle-challenge-4",
      "label": "Challenge round 4",
      "note": "Real data rarely comes from the distribution you are fitting. Do the best you can and hit the target.",
      "data": [-1.89, 3.57, 0.8, 2.62, 3.15, 1.38, -0.77, 2.7, 3.99, -0.76, 1.47, 2.6, 1.2, -0.02, -0.76, -1.25, -0.72, 0.68, 2.34, 2.64, -0.48, 0.42, 3.28, 0.5, 2.36, -0.53, 2.27, 2.56, 1.86, -1.49, 2.73, 1.18, 2.71, 1.51, -0.15, -0.47, -0.34, -0.49, 1.63, 2.36, -1.85, 3.65, -1.98, -0.68, 2.98, 3.53, 0.06, 3.92, -1.02, -0.17, 1.07, -1.9, 1.03, 0.26, 1.82, 1.94, -0.96, -1.04, 1.07, 0.81],
      "challenge": true
    },
    {
      "id": "triangle-challenge-5",
      "label": "Challenge round 5",
      "note": "Last one. Trust what the attempt panels have taught you about where the score peaks.",
      "data": [2.45, 2.95, 0.47, 3.61, 1.6, 0.91, 1.01, 2.78, 2.66, 2.01, 0.61, 2.81, 1.82, 1.6, 2.98, 1.71, 1.91, 2.32, 3.39, 4.44, 0.49, 1.7, 0.67, 0.64, 2.58, 1.64, 5.3, 3.33, 2.56, 2.11, 2.22, 0.88, 2.53, 1.7, 2.28, 1.62, 1.95, 1.33, 1.82, 5.29, 0.38, 1, 1.82, 3.14, 1.83, 1.45, 1.05, 1.65, 1.33, 1.46, 1.43, 1.63, 3.69, 2.64, 3.23, 3.33, 3.21, 2.2, 1.57, 1.12],
      "challenge": true
    }
  ],
  "lognormal": [
    {
      "id": "lognormal-clean",
      "label": "Well-behaved sample",
      "note": "Drawn from a Lognormal distribution. Think of it as a Normal fitted to log(x): μ slides the bulk left and right, σ controls the spread — on the log scale.",
      "data": [3.04, 3.81, 1.5, 2.95, 4.13, 1.09, 2.35, 2.7, 2.98, 2.06, 1.9, 1.87, 2.2, 1.52, 2.54, 2.02, 1.74, 4.4, 1.26, 3.14, 1.32, 5.6, 1.97, 1.75, 4.53, 4.09, 2.02, 2.84, 0.94, 2.43, 0.7, 1.09, 2.75, 5.59, 3.46, 4.1, 2.93, 2.03, 3.9, 2.53, 1.82, 2.31, 5.18, 3.3, 3.27, 1.2, 2.05, 5.68, 2.88, 2.19, 2.79, 2.76, 4.02, 2.56, 4.49, 2.14, 2.27, 2.36, 2.93, 4.61]
    },
    {
      "id": "lognormal-heavytail",
      "label": "Long right tail",
      "note": "A Lognormal with a large σ: most points sit near zero, but a few reach far to the right. Watch how much that tail dictates the fit.",
      "data": [5.78, 5.54, 4.81, 1.43, 0.22, 0.61, 1.59, 0.56, 2.68, 1.07, 1.9, 1.25, 3.17, 1.51, 2.59, 5.27, 2.1, 1.74, 5.01, 3.35, 1.84, 2.78, 0.82, 1.75, 1.19, 0.7, 1.6, 3.76, 4.75, 0.16, 9.85, 1.35, 1.78, 1.37, 2.09, 1.84, 3.09, 1.34, 1.27, 1.15, 0.9, 0.43, 0.94, 7.15, 1.12, 1.62, 4.65, 2.33, 0.77, 0.61, 2.06, 1.68, 1.59, 0.94, 0.8, 0.65, 0.68, 0.97, 1.36, 1.05]
    },
    {
      "id": "lognormal-symmetric",
      "label": "Nearly symmetric",
      "note": "Also a true Lognormal sample — with a small σ it looks almost Normal. Distributions can impersonate each other.",
      "data": [4.02, 3.67, 6.67, 8.31, 4.76, 2.14, 4.71, 7.34, 3.49, 4.42, 3.11, 2.73, 4.04, 4.87, 4.63, 3.49, 5.54, 3.6, 5.42, 5.89, 4.85, 3.98, 4.22, 4.97, 4.02, 4.83, 4.3, 3.81, 3.35, 3.75, 3.28, 4.23, 3.94, 2.97, 8.55, 6.48, 4.1, 7.08, 3.87, 3.82, 8.01, 4.73, 4.37, 4.54, 3.24, 4.64, 2.64, 5.78, 4.45, 3.95, 4.59, 5.95, 3.76, 3.62, 3.91, 3.99, 5.09, 5.31, 4.73, 3.41]
    },
    {
      "id": "lognormal-gammadata",
      "label": "Gamma data",
      "note": "This data was drawn from a Gamma distribution. The Lognormal also handles skewed positive data — fit it here, then try the same kind of data on the Gamma tab and compare.",
      "data": [1.88, 0.5, 4, 0.41, 4.26, 3.48, 2.38, 0.37, 0.87, 2.68, 5.84, 1.48, 1.51, 0.38, 0.79, 7.79, 2.05, 3.48, 6.04, 1.38, 7.18, 1.49, 0.55, 2.53, 2.23, 0.91, 1.53, 3.7, 1.25, 1.36, 0.79, 2.75, 0.83, 4.2, 0.82, 4.38, 0.78, 1.82, 3.93, 3.31, 0.87, 1.3, 1.55, 2.6, 0.32, 2.85, 1.54, 2.87, 1.34, 4.83, 1.51, 5.97, 0.78, 2.8, 0.53, 3.86, 0.38, 0.68, 2.4, 0.75]
    },
    {
      "id": "lognormal-leftskew",
      "label": "Skewed the wrong way (left tail)",
      "note": "This data leans left: the long tail points toward zero, with the mass piled up on the right. Like the Gamma, a Lognormal always leans right — it can never match this shape.",
      "data": [1.41, 1.96, 5.31, 4.1, 3.58, 5.6, 4.29, 4.88, 5.42, 5.54, 4.44, 3.83, 5.3, 5.58, 5.48, 5.61, 4.47, 4.83, 4.94, 5.58, 4.77, 3.87, 5.35, 3.18, 1.35, 1.74, 4.45, 3.64, 3.58, 4.24, 1.69, 3.66, 4.76, 5.86, 3.03, 4.6, 4.25, 5.38, 5.12, 5.32, 1.31, 5.11, 5, 3.88, 4.4, 3.64, 4.9, 4.09, 5.07, 4.11, 5.59, 3.56, 3.69, 4.54, 4.07, 5.5, 5.66, 5.71, 4.97, 5.66]
    },
    {
      "id": "lognormal-challenge-1",
      "label": "Challenge round 1",
      "note": "No answer button from here on. Set the curve, watch the score, and chase the target on the right — it is reachable with these sliders.",
      "data": [9.05, 2.99, 1.54, 2.64, 3.07, 4.98, 4.5, 1.47, 1.23, 1.94, 6.18, 1.03, 1.57, 2.61, 2.5, 3.63, 3.03, 1.26, 2.25, 1.85, 0.92, 1.02, 2.49, 1.84, 2.85, 2.7, 1.04, 2.13, 0.51, 2.82, 1.67, 2.13, 4.87, 1.59, 2.4, 2.33, 3.49, 1.62, 3.35, 1.69, 4, 1.52, 6.85, 3.9, 0.6, 3.52, 3.89, 1.48, 2.64, 0.85, 2.85, 5.17, 0.64, 2.61, 3.3, 1.47, 1.92, 1.99, 1.41, 5.55],
      "challenge": true
    },
    {
      "id": "lognormal-challenge-2",
      "label": "Challenge round 2",
      "note": "Blind round: nobody tells you where this data came from. Fit it as well as the sliders allow.",
      "data": [1.13, 1.76, 0.55, 0.69, 1.47, 0.75, 0.63, 1.89, 1.45, 1.51, 0.46, 1.22, 1.11, 0.94, 1.01, 1.64, 0.6, 1.88, 1.71, 0.9, 1.45, 0.62, 1.62, 0.59, 0.92, 0.8, 0.83, 0.99, 1.22, 0.99, 0.88, 1.44, 1.16, 0.68, 1.13, 0.86, 1.49, 0.82, 0.62, 0.84, 1.85, 0.38, 1.36, 1.73, 1.06, 1.26, 0.95, 0.8, 2.89, 0.91, 0.42, 0.79, 0.99, 0.59, 0.84, 0.94, 1.38, 0.62, 1.21, 0.48],
      "challenge": true
    },
    {
      "id": "lognormal-challenge-3",
      "label": "Challenge round 3",
      "note": "Keep an eye on both parameters — the target will not fall to one slider alone.",
      "data": [5.01, 6.68, 5.32, 3.17, 7.52, 7.87, 4.82, 4.98, 6.22, 7.46, 11.64, 7.03, 4.54, 4.5, 4.53, 3.18, 3.37, 7.57, 7.29, 5.91, 4.16, 8.88, 5.15, 3.36, 6.5, 4.6, 5.27, 6.86, 11.06, 8.13, 4.95, 7.39, 5.89, 3.89, 7.87, 4.73, 7.3, 3.99, 4.06, 7.72, 3.49, 4.87, 3.69, 6.86, 3.53, 9.38, 9.05, 8.24, 4.93, 4.64, 7.82, 8.52, 3.73, 7.84, 5.53, 6.36, 7.01, 5.25, 6.99, 3.85],
      "challenge": true
    },
    {
      "id": "lognormal-challenge-4",
      "label": "Challenge round 4",
      "note": "Real data rarely comes from the distribution you are fitting. Do the best you can and hit the target.",
      "data": [0.56, 5.87, 1.17, 1.45, 4.73, 2.74, 1.67, 4.14, 1.97, 0.58, 1.1, 1.87, 1.27, 1.17, 1, 1.62, 6.25, 3.06, 2.26, 1.75, 3.42, 2.05, 2.24, 1.55, 2.43, 1.97, 1.81, 2, 2.17, 2.91, 1.1, 0.81, 4.73, 1.43, 3.11, 1.45, 1.93, 0.54, 2.12, 1.02, 5.01, 2.03, 2.97, 1.44, 3.31, 3.37, 2.99, 1.22, 0.92, 2.97, 1.46, 3.06, 1.7, 1.45, 4.68, 1.86, 1.7, 2.65, 3.43, 1.42],
      "challenge": true
    },
    {
      "id": "lognormal-challenge-5",
      "label": "Challenge round 5",
      "note": "Last one. Trust what the attempt panels have taught you about where the score peaks.",
      "data": [1.02, 0.46, 3.4, 0.87, 0.24, 4.2, 1.8, 5.56, 5.92, 1.32, 5.07, 0.66, 1, 0.64, 0.74, 0.92, 3.03, 0.42, 0.49, 2.55, 0.71, 0.28, 0.8, 1.08, 17.53, 1.04, 0.46, 0.4, 0.57, 1.49, 4.76, 8.76, 4.18, 4.08, 0.28, 0.19, 4.27, 2.81, 0.82, 0.66, 0.58, 5.32, 0.8, 0.83, 2.02, 1.11, 2.53, 1.82, 5.08, 2.83, 0.25, 1.23, 3.5, 0.22, 5.89, 0.31, 0.56, 2.43, 1.16, 3.99],
      "challenge": true
    }
  ],
  "gamma": [
    {
      "id": "gamma-clean",
      "label": "Well-behaved sample",
      "note": "Drawn from a Gamma distribution. Skewed to the right: the peak sits left of the mean.",
      "data": [1.77, 2.14, 5.66, 3.94, 0.5, 10.36, 0.76, 0.96, 4.17, 2.75, 2.72, 1.4, 1.47, 0.96, 1.79, 2.01, 1.46, 2.38, 3.57, 3.71, 1.3, 3.2, 0.58, 3.99, 1.78, 3.24, 1.27, 0.78, 0.85, 4.28, 1.31, 1.81, 2.52, 0.59, 0.41, 2.53, 1.95, 1.53, 0.23, 1.48, 1.52, 0.25, 2.29, 0.79, 1.26, 3.02, 3.38, 1.45, 1.19, 1.52, 2.01, 3.69, 3.46, 1.85, 0.5, 0.88, 1.48, 2.07, 1.24, 0.7]
    },
    {
      "id": "gamma-symmetric",
      "label": "Nearly symmetric",
      "note": "Also a true Gamma sample — but with a large shape parameter it looks almost Normal. Distributions can impersonate each other.",
      "data": [5.08, 4.59, 4.4, 2.65, 4.9, 5.03, 4.78, 4.81, 3.99, 5.02, 4.21, 4.95, 4.86, 4.18, 5.06, 5.29, 1.7, 5.57, 5.5, 3.49, 0.96, 5.88, 5.51, 3.7, 3.85, 3.65, 1.41, 2.81, 4.37, 5.54, 4.54, 4.05, 3.74, 4.12, 4.87, 4.46, 3.99, 5.1, 2.72, 2.29, 3.41, 4.7, 2.14, 3.76, 5.99, 3.7, 2.94, 3.61, 5.28, 3.33, 6.63, 4.32, 3.92, 6.5, 6.43, 3.93, 4.39, 4.2, 4.79, 4.66]
    },
    {
      "id": "gamma-exponential",
      "label": "Exponential-like",
      "note": "A Gamma sample with shape 1 is an Exponential: the density is highest at zero and only falls. Try shapes above and below 1 and watch the left edge flip.",
      "data": [2.13, 0.08, 0.06, 2.31, 0.83, 0.52, 3.15, 0.85, 0.98, 1.32, 0.13, 0.59, 1.26, 1.58, 1.23, 1.02, 1.34, 1.77, 0.03, 0.96, 0.05, 0.77, 3.52, 0.04, 0.76, 0.78, 1.79, 1.68, 1.7, 4.13, 0.16, 1.42, 1.01, 1.25, 1.91, 1.08, 1.15, 3.2, 0.05, 0.12, 1.41, 2.27, 1.21, 7.52, 0.62, 2.5, 2.78, 0.45, 3.12, 5.04, 0.51, 1.72, 0.25, 0.32, 1.47, 1.07, 0.39, 4.42, 1.27, 0.07]
    },
    {
      "id": "gamma-leftskew",
      "label": "Skewed the wrong way (left tail)",
      "note": "This data leans left: the long tail points toward zero, with the mass piled up on the right. A Gamma’s tail always points right — it can never lean this way. Watch the best fit crank the shape up and go nearly symmetric instead.",
      "data": [2.72, 5.81, 4.98, 1.91, 4.66, 4.58, 4.56, 5.45, 5.69, 3.72, 5.58, 5.03, 2.06, 5.42, 4.53, 5.78, 5.13, 5.86, 4.9, 2.73, 4.26, 3.61, 2.27, 5.4, 5.83, 3.98, 4.73, 5.55, 1.72, 4.54, 1.87, 1.24, 4.96, 5.73, 3.25, 4.01, 5.06, 3.74, 5.03, 3, 5.03, 4.57, 4.84, 0.88, 5.49, 4.12, 4.52, 4.85, 2.49, 4.36, 4.19, 5.56, 5.15, 3.18, 3.94, 4.42, 5, 3.99, 4.32, 5.09]
    },
    {
      "id": "gamma-bimodal",
      "label": "Bimodal (two humps)",
      "note": "Two clusters of positive values. Like the Normal, the Gamma has one hump to give — see where it surrenders.",
      "data": [1.08, 2.18, 1.05, 2.24, 0.79, 0.48, 1.06, 1.14, 1.49, 0.58, 1.66, 0.52, 1.75, 1.4, 1.08, 1.73, 1.24, 1.52, 2.86, 1.42, 0.86, 0.5, 2.11, 0.98, 0.36, 2.26, 0.42, 1.78, 2.85, 1.53, 8.09, 6.81, 6.31, 7, 7.01, 5.99, 7.21, 5.83, 7.36, 6.72, 7.73, 8.2, 7.01, 6.29, 6.29, 6.83, 6.87, 6.11, 7.05, 7, 7.82, 6.75, 6.55, 6.93, 6.19, 7.01, 7.47, 5.8, 6.82, 9.2]
    },
    {
      "id": "gamma-challenge-1",
      "label": "Challenge round 1",
      "note": "No answer button from here on. Set the curve, watch the score, and chase the target on the right — it is reachable with these sliders.",
      "data": [3.39, 2.03, 2.18, 1.98, 0.87, 0.95, 2.83, 3.08, 1.44, 3.42, 3.46, 3.16, 4.2, 1.33, 3.27, 4.53, 1.96, 1.29, 0.8, 2.58, 2.24, 1.34, 1.61, 1.25, 2.08, 2.21, 1.7, 1.06, 0.74, 0.67, 1.37, 1.48, 2.55, 3.19, 3.48, 1.15, 1.44, 0.94, 2.32, 0.9, 2.35, 1.12, 2.8, 2.11, 2.84, 2.42, 1.6, 4, 2.24, 2.22, 2.04, 1.28, 2.08, 0.68, 1.52, 1.39, 2.02, 1, 3.93, 2.62],
      "challenge": true
    },
    {
      "id": "gamma-challenge-2",
      "label": "Challenge round 2",
      "note": "Blind round: nobody tells you where this data came from. Fit it as well as the sliders allow.",
      "data": [1.23, 0.56, 0.37, 1.95, 0.31, 2.54, 0.36, 0.53, 2.82, 0.95, 0.53, 1.08, 1.97, 0.76, 4.94, 0.8, 0.07, 1.17, 2.07, 1.5, 0.44, 3.24, 1.26, 0.75, 2.1, 1.54, 0.53, 2.91, 2.23, 0.11, 1.18, 0.14, 2.64, 0.59, 1.03, 0.36, 0.07, 0.09, 1.84, 0.68, 0.77, 0.22, 0.6, 3, 0.88, 2.91, 0.73, 1.45, 0.33, 7.95, 1.56, 2.26, 1.24, 1.21, 1.52, 0.4, 1.59, 0.15, 3.53, 0.57],
      "challenge": true
    },
    {
      "id": "gamma-challenge-3",
      "label": "Challenge round 3",
      "note": "Keep an eye on both parameters — the target will not fall to one slider alone.",
      "data": [3.26, 1.93, 2.44, 2.04, 3.41, 3.63, 2.59, 1.63, 1.26, 1.76, 1.68, 1.87, 4.44, 2.74, 1.93, 1.61, 2.52, 4.79, 2.37, 3.36, 1.53, 3.2, 1.9, 2.4, 2.84, 3.48, 1.9, 2.39, 2.65, 2.23, 4.12, 1.11, 5.06, 1.47, 4.13, 2, 3.04, 1.92, 2.2, 1.55, 1.04, 3.41, 1.64, 2.35, 1.65, 1.9, 3.16, 1.15, 4.51, 2.86, 2.25, 2.64, 2.55, 1.87, 1.46, 3.57, 2.36, 2.15, 1.93, 2.37],
      "challenge": true
    },
    {
      "id": "gamma-challenge-4",
      "label": "Challenge round 4",
      "note": "Real data rarely comes from the distribution you are fitting. Do the best you can and hit the target.",
      "data": [1.55, 1.76, 2.69, 1.85, 1.1, 2.64, 2.66, 3.09, 2.57, 2.61, 4.54, 2.94, 2.6, 1.47, 11.87, 3.04, 2.79, 2.61, 2.97, 2.05, 2.72, 4.13, 4.78, 2.33, 2.11, 2.86, 2.6, 2.35, 1.36, 2.6, 2.97, 4.42, 1.1, 3.17, 2.63, 1.21, 2.47, 2.74, 1.38, 1.43, 1.85, 3.7, 4.59, 2.25, 3.32, 2.89, 1.72, 1.91, 4.03, 3.61, 3.64, 4.52, 1.44, 1.36, 1.48, 3.82, 2.58, 1.81, 3.05, 1.98],
      "challenge": true
    },
    {
      "id": "gamma-challenge-5",
      "label": "Challenge round 5",
      "note": "Last one. Trust what the attempt panels have taught you about where the score peaks.",
      "data": [3.34, 7.93, 1.55, 1.86, 1.39, 6.5, 6.92, 3.74, 2.01, 13.05, 3.92, 0.21, 1.43, 2.54, 7.96, 6.43, 9.69, 3.39, 2.69, 7.57, 2.43, 0.69, 3.29, 4.24, 9.06, 2.09, 1.52, 1.29, 3.52, 8.96, 2, 2.22, 0.62, 10.23, 3.74, 8.37, 9.14, 3.89, 5.46, 6.95, 1.45, 4.7, 8.01, 7.41, 3.03, 9.12, 3.17, 8.06, 1.97, 0.87, 1.65, 1.74, 0.35, 3.03, 4.96, 1.89, 4.75, 6.1, 1.63, 6.28],
      "challenge": true
    }
  ],
  "gp": [
    {
      "id": "gp-clean",
      "label": "Well-behaved sample",
      "note": "Drawn from a Gaussian Process with moderate smoothness and a little noise. Match the wiggle length first, then split what remains between signal and noise.",
      "x": [0.11, 0.4, 0.78, 0.95, 1.38, 1.65, 2.13, 2.47, 2.64, 3.12, 3.36, 3.7, 4.22, 4.56, 4.77, 5.1, 5.42, 5.97, 6.12, 6.49, 6.94, 7.22, 7.63, 7.95, 8.32, 8.65, 8.93, 9.35, 9.56, 9.96],
      "y": [-0.53, -0.69, -0.36, -0.28, -0.73, -0.66, -1.41, -1.36, -0.86, -0.81, -0.76, 0.03, 0.12, 0.34, 0.46, 0.27, 0.29, -0.47, -0.32, -0.02, -0.61, 0.04, -0.05, 0.3, 0.89, 1.03, 1.32, 1.55, 1.63, 1.62],
      "mle": {
        "lengthscale": 1.4,
        "signal": 0.9,
        "noise": 0.2
      },
      "mleLL": -9.816
    },
    {
      "id": "gp-wiggle",
      "label": "Nearly noiseless wiggle",
      "note": "A fast-wiggling function measured almost perfectly. The wiggles are real signal — how short does the length-scale have to go before the band hugs the points?",
      "x": [0, 0.43, 0.64, 0.93, 1.44, 1.75, 2.13, 2.37, 2.85, 3.07, 3.49, 3.69, 4.22, 4.45, 4.84, 5.13, 5.42, 5.82, 6.15, 6.67, 7.02, 7.19, 7.52, 8, 8.33, 8.73, 8.88, 9.29, 9.69, 9.98],
      "y": [-1.13, -1.54, -1.82, -2.23, -1.9, -1.63, -0.17, 0.96, 0.64, 0.37, 0.96, 1.46, 1.13, -0.18, -1.08, -0.02, 0.94, 0.79, 0.87, 0.1, 0.55, 1.69, 2.23, 0.32, -1.12, -0.44, -0.01, -0.27, -0.23, 0.78],
      "mle": {
        "lengthscale": 0.45,
        "signal": 1.2,
        "noise": 0.11
      },
      "mleLL": -28.517
    },
    {
      "id": "gp-noise",
      "label": "Mostly noise",
      "note": "A weak, slow signal buried under strong noise. Resist the urge to chase every point — here the noise slider should do most of the work.",
      "x": [0.12, 0.31, 0.66, 1.15, 1.47, 1.66, 2.06, 2.33, 2.66, 3.15, 3.49, 3.75, 4.25, 4.42, 4.8, 5.22, 5.62, 5.78, 6.29, 6.64, 6.84, 7.25, 7.65, 7.98, 8.31, 8.55, 9, 9.31, 9.57, 10],
      "y": [-0.31, -0.92, 0.38, -0.35, 0.66, 1.12, 1.02, 0.68, -0.13, 0.11, 1.22, -1.83, -0.99, 0.27, -0.5, -0.69, 0.07, 0.02, 1.26, -0.36, 0.98, -0.06, 0.07, 0.78, -0.78, -0.7, -0.66, 0.2, -0.31, -0.23],
      "mle": {
        "lengthscale": 0.75,
        "signal": 0.25,
        "noise": 0.69
      },
      "mleLL": -33.062
    },
    {
      "id": "gp-twostories",
      "label": "Two stories",
      "note": "This data supports two rival explanations: a fast wiggle with little noise, or a slow drift with a lot of noise. Both feel locally best — try approaching from both extremes and compare scores. You cannot tune one slider at a time to the top here.",
      "x": [0, 0.31, 0.63, 0.98, 1.46, 1.76, 2, 2.36, 2.69, 3.12, 3.49, 3.86, 4.19, 4.53, 4.82, 5.16, 5.52, 5.88, 6.18, 6.62, 7, 7.14, 7.69, 7.83, 8.29, 8.7, 9.03, 9.28, 9.76, 9.99],
      "y": [0.02, -0.49, -1.76, -1.29, -0.85, -0.86, -0.29, 0, 0.51, -0.29, -0.23, 0.11, 1.05, 1.28, 1.05, -0.1, 0.78, 0.83, 0.37, 0.51, 0.02, -0.82, -0.67, -0.69, -0.49, 1.57, 1.55, -0.22, -0.72, 0.1],
      "mle": {
        "lengthscale": 0.35,
        "signal": 0.8,
        "noise": 0.22
      },
      "mleLL": -29.121
    },
    {
      "id": "gp-step",
      "label": "Step (mismatched)",
      "note": "A sudden jump — not something a smooth Gaussian Process can do. Watch it compromise: a short length-scale wiggles near the step, or a longer one smooths right through it.",
      "x": [0, 0.24, 0.73, 1.07, 1.33, 1.7, 2.17, 2.3, 2.86, 3.13, 3.42, 3.7, 4.1, 4.37, 4.73, 5.13, 5.47, 5.91, 6.31, 6.64, 6.89, 7.35, 7.54, 7.83, 8.18, 8.6, 9, 9.26, 9.68, 10],
      "y": [-1.02, -1.15, -0.97, -1.13, -1.02, -1.13, -1, -0.98, -0.75, -0.78, -1.05, -0.94, -1.12, -0.95, -0.89, 1.08, 1.02, 0.91, 1.1, 0.79, 1.02, 1.31, 0.78, 0.78, 0.87, 0.98, 1.02, 1.12, 1.16, 0.95],
      "mle": {
        "lengthscale": 0.95,
        "signal": 0.85,
        "noise": 0.23
      },
      "mleLL": -16.267
    },
    {
      "id": "gp-challenge-1",
      "label": "Challenge round 1",
      "note": "No answer button from here on. Set the fit, watch the score, and chase the target on the right — it is reachable with these sliders.",
      "x": [0.12, 0.36, 0.78, 0.93, 1.37, 1.66, 2.01, 2.49, 2.72, 3.21, 3.34, 3.89, 4.06, 4.54, 4.78, 5.22, 5.52, 5.85, 6.12, 6.49, 6.98, 7.2, 7.62, 7.99, 8.38, 8.58, 8.85, 9.41, 9.68, 10],
      "y": [1.02, 0.85, 1.15, 1.41, 2.23, 1.97, 2.37, 1.98, 1.52, 0.27, 0.63, -0.82, -1.41, -1.04, -1.9, -1.39, -1.19, -1.2, -1.65, -0.66, -0.37, 0.37, 1.11, 0.24, 0.15, -0.13, -0.87, -1.92, -1.34, -1.41],
      "mle": {
        "lengthscale": 1.15,
        "signal": 1.25,
        "noise": 0.3
      },
      "mleLL": -23.645,
      "challenge": true
    },
    {
      "id": "gp-challenge-2",
      "label": "Challenge round 2",
      "note": "Blind round: nobody tells you where this data came from. Fit it as well as the sliders allow.",
      "x": [0.06, 0.46, 0.66, 1.14, 1.49, 1.72, 2.19, 2.49, 2.87, 3.07, 3.43, 3.83, 4.11, 4.54, 4.71, 5.22, 5.57, 5.75, 6.23, 6.54, 6.94, 7.19, 7.64, 7.99, 8.31, 8.74, 9.08, 9.37, 9.73, 10],
      "y": [0.32, 0.18, -0.16, -0.61, -0.64, -0.1, -0.49, -0.38, -1.51, -1.71, -2.05, -1.07, -0.21, -0.01, 0.33, 1.27, 2.07, 2, 1.65, 1, 0.19, -0.38, 0.05, 0.16, 0.41, 0.48, -0.65, -0.89, 0.03, 0.72],
      "mle": {
        "lengthscale": 0.55,
        "signal": 0.9,
        "noise": 0.18
      },
      "mleLL": -20.848,
      "challenge": true
    },
    {
      "id": "gp-challenge-3",
      "label": "Challenge round 3",
      "note": "Keep an eye on all three parameters — the target will not fall to one slider alone.",
      "x": [0.07, 0.27, 0.71, 1.06, 1.48, 1.69, 2.08, 2.49, 2.79, 3, 3.49, 3.74, 4.24, 4.45, 4.77, 5.26, 5.55, 5.9, 6.1, 6.61, 6.8, 7.22, 7.59, 7.95, 8.25, 8.63, 9.08, 9.39, 9.64, 10],
      "y": [1.4, 1.85, 2.04, 1.56, 0.82, 0.96, 0.4, 0.94, -0.37, 0.23, -1.56, -0.92, -0.03, -1.9, -2.2, -0.36, -1.25, -2.11, -1.51, -1.05, 0.19, -0.99, 0.09, 0.81, -0.8, 0.63, 0.76, 0.23, 1.51, 0.61],
      "mle": {
        "lengthscale": 2.6,
        "signal": 1.25,
        "noise": 0.64
      },
      "mleLL": -35.612,
      "challenge": true
    },
    {
      "id": "gp-challenge-4",
      "label": "Challenge round 4",
      "note": "Real data rarely comes from the model you are fitting. Do the best you can and hit the target.",
      "x": [0, 0.24, 0.81, 1.01, 1.35, 1.62, 2.02, 2.39, 2.7, 3.1, 3.44, 3.8, 4.13, 4.58, 4.75, 5.24, 5.41, 5.83, 6.19, 6.66, 6.97, 7.25, 7.69, 8.03, 8.37, 8.59, 8.98, 9.21, 9.54, 10],
      "y": [-1.81, -1.31, -1.36, -1.07, -0.96, -0.71, -1.25, -0.88, -0.67, -0.49, -0.3, 0.07, -0.83, -0.41, -0.18, 0.52, 0.3, 0.54, 0.31, 0.16, 0.35, 0.62, 0.94, 0.85, 1.05, 0.88, 0.97, 1.18, 1.13, 2.35],
      "mle": {
        "lengthscale": 16.1,
        "signal": 3,
        "noise": 0.3
      },
      "mleLL": -13.204,
      "challenge": true
    },
    {
      "id": "gp-challenge-5",
      "label": "Challenge round 5",
      "note": "Last one. Remember: this score has multiple hills — if you are stuck, jump somewhere far away and climb again.",
      "x": [0, 0.25, 0.67, 1.03, 1.47, 1.69, 2, 2.53, 2.75, 3.04, 3.45, 3.91, 4.06, 4.37, 4.76, 5.15, 5.56, 5.78, 6.22, 6.45, 6.91, 7.28, 7.54, 7.95, 8.2, 8.67, 8.95, 9.38, 9.68, 10],
      "y": [0.9, 0.16, 1.23, -0.41, -1.06, 0.46, 0.95, 0.3, -0.09, -0.33, 0.58, -1, -0.17, 0.44, -0.16, 0.22, -1.18, 0.27, 0.02, -1.5, 0.4, -1.18, 0.55, -0.07, 0.81, -0.02, -0.86, 0.31, -0.39, 0.83],
      "mle": {
        "lengthscale": 0.05,
        "signal": 0.7,
        "noise": 0.01
      },
      "mleLL": -31.663,
      "challenge": true
    }
  ]
};

if (typeof module !== 'undefined') module.exports = MLEDatasets;
