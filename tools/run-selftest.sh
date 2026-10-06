#!/usr/bin/env bash
# Headless interaction self-test for The Likelihood Lab.
#
#   bash tools/run-selftest.sh
#
# Builds a copy of index.html with tools/selftest.js injected, opens it in
# headless Chrome (or Brave), and prints one PASS/FAIL per check. Exits
# non-zero if anything fails. Run this before publishing any change.

set -euo pipefail

PROJ="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$(mktemp -d)/selftest.html"

python3 - "$PROJ" "$OUT" <<'PY'
import sys
proj, out = sys.argv[1], sys.argv[2]
html = open(f'{proj}/index.html').read()
# absolute file:// paths so the copy can live in a temp dir
html = html.replace('src="js/', f'src="file://{proj}/js/')
html = html.replace('href="css/', f'href="file://{proj}/css/')
test = open(f'{proj}/tools/selftest.js').read()
html = html.replace('</body>', f'<script>{test}</script></body>')
open(out, 'w').write(html)
PY

# Find a Chrome-family browser: $CHROME if set, else the macOS apps, else the
# Linux commands (GitHub's Ubuntu runners ship google-chrome on the PATH).
if [ -z "${CHROME:-}" ]; then
  for c in "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
           "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" \
           google-chrome google-chrome-stable chromium chromium-browser; do
    if command -v "$c" >/dev/null; then CHROME="$(command -v "$c")"; break; fi
  done
fi
if [ -z "${CHROME:-}" ]; then
  echo "SELFTEST FAILED: no Chrome/Brave/Chromium found (set CHROME=/path/to/browser)" >&2
  exit 1
fi
echo "Using browser: $CHROME"

RES="$("$CHROME" --headless --disable-gpu --virtual-time-budget=4000 \
  --dump-dom "file://$OUT" 2>/dev/null | grep -o '<title>RESULTS[^<]*</title>' || true)"

if [ -z "$RES" ]; then
  echo "SELFTEST FAILED: no results (page error before tests ran?)" >&2
  exit 1
fi

echo "$RES" | sed -e 's/<[^>]*>//g' -e 's/ /\n/g' | tail -n +2
if echo "$RES" | grep -q FAIL; then
  echo "SELFTEST FAILED" >&2
  exit 1
fi
echo "SELFTEST PASSED"
