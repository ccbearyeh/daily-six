#!/usr/bin/env bash
# Render marketing HTMLs to PNG using system Chrome headless.
# Outputs land in marketing/screenshots/

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT="$ROOT/marketing/screenshots"
HERO="$ROOT/marketing/hero"
PROMO="$ROOT/marketing/promo"

mkdir -p "$OUT"

shot() {
  local name="$1"; local src="$2"; local w="$3"; local h="$4"
  echo "→ $name ($w×$h)"
  "$CHROME" \
    --headless=new \
    --hide-scrollbars \
    --disable-gpu \
    --no-sandbox \
    --default-background-color=00000000 \
    --window-size="$w,$h" \
    --screenshot="$OUT/$name" \
    --virtual-time-budget=2000 \
    "file://$src" >/dev/null 2>&1
  if [[ -f "$OUT/$name" ]]; then
    echo "  ok: $(stat -f%z "$OUT/$name") bytes"
  else
    echo "  FAILED"
    exit 1
  fi
}

shot "01-planning.png"  "$HERO/01-planning.html"   1280 800
shot "02-focus.png"     "$HERO/02-focus.html"      1280 800
shot "03-all-done.png"  "$HERO/03-all-done.html"   1280 800
shot "04-rollover.png"  "$HERO/04-rollover.html"   1280 800
shot "05-settings.png"  "$HERO/05-settings.html"   1280 800
shot "promo-440x280.png" "$PROMO/tile-440x280.html" 440  280

echo ""
echo "Done. Outputs in $OUT"
ls -la "$OUT"
