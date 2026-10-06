/*
 * selftest.js — headless interaction checks for the demo, injected into
 * index.html by tools/run-selftest.sh and executed in headless Chrome.
 * Results are written into document.title as "RESULTS name=PASS/FAIL ...".
 * Not loaded by the real page.
 */

/* eslint-disable */
const R = [];
const q = s => document.querySelector(s);
const inputs = () => document.querySelectorAll('#param-panels input');
const tabs = () => document.querySelectorAll('#dist-tabs button');

// --- initial render
R.push(['tabs6', tabs().length === 6]);
R.push(['gp-6th', tabs()[5].textContent === 'Gaussian Process']);
R.push(['guide-strip', q('#info-strip').textContent.includes('What the sliders do')]);

// --- density flow: attempt on release, reveal
const inp = inputs()[0];
inp.value = 3;
inp.dispatchEvent(new Event('input'));
inp.dispatchEvent(new Event('change'));
R.push(['attempt-counter', q('#attempt-count').textContent.includes('1 attempt')]);
q('#btn-reveal').click();
R.push(['reveal', q('#readout').textContent.includes('MLE (the answer)')]);

// --- uniform: invalid vs impossible states, red X
tabs()[1].click();
let ins = inputs();
ins[0].value = 8; ins[0].dispatchEvent(new Event('input'));
R.push(['invalid-state', q('#readout').textContent.includes('not a valid distribution')]);
ins[0].value = -5; ins[0].dispatchEvent(new Event('input')); ins[0].dispatchEvent(new Event('change'));
ins[1].value = 1; ins[1].dispatchEvent(new Event('input')); ins[1].dispatchEvent(new Event('change'));
R.push(['neg-inf', q('#readout').textContent.includes('probability zero')]);
R.push(['red-x', !!q('#param-panels path[stroke="#d03b3b"]')]);

// --- GP tab
tabs()[5].click();
R.push(['gp-3-panels', document.querySelectorAll('.param-panel').length === 3]);
R.push(['gp-score-label', q('#readout').textContent.includes('log marginal likelihood')]);
R.push(['gp-scatter', document.querySelectorAll('#main-plot circle').length >= 30]);
R.push(['gp-band', !!q('#main-plot path[fill="#2a78d6"]')]);
R.push(['gp-kernel-fig', !!q('#info-strip .kernel-fig svg')]);
const kfBefore = q('#info-strip .kernel-fig').textContent;
let gins = inputs();
gins[1].value = 2.5; gins[1].dispatchEvent(new Event('input'));
R.push(['gp-kernel-live', q('#info-strip .kernel-fig').textContent !== kfBefore]);
gins[1].dispatchEvent(new Event('change'));
R.push(['gp-attempt', q('#attempt-count').textContent.includes('1 attempt')]);
R.push(['gp-orange-dot', !!q('#param-panels circle[fill="#eb6834"]')]);
q('#btn-reveal').click();
R.push(['gp-reveal', q('#readout').textContent.includes('MLE (the answer)')]);

// --- GP challenge: target shown, reveal hidden
q('#dataset-select').value = '5';
q('#dataset-select').dispatchEvent(new Event('change'));
R.push(['gp-challenge-target', q('#readout').textContent.includes('Target score')]);
R.push(['gp-challenge-no-reveal', q('#btn-reveal').style.display === 'none']);

// --- per-distribution state preserved across tab switches
tabs()[0].click();
R.push(['state-kept', q('#attempt-count').textContent.includes('1 attempt')]);

document.title = 'RESULTS ' + R.map(r => r[0] + '=' + (r[1] ? 'PASS' : 'FAIL')).join(' ');
