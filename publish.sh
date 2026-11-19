#!/usr/bin/env bash
# Publishes Genially Scrolly with YOUR credentials. Nothing here stores or prints a token.
#   ./publish.sh npm      → builds, packs and publishes @genially/scrolly and genially-scrolly to npm
#   ./publish.sh github   → pushes this repo to github.com/RafaelFernandezGenially/genially-scrolly
# Before npm: `npm login` (and own the @genially scope on npm, or rename the runtime package).
set -euo pipefail
cd "$(dirname "$0")"
case "${1:-}" in
  npm)
    npm whoami >/dev/null || { echo "Run: npm login"; exit 1; }
    npm install --no-audit --no-fund
    npm run build
    node scripts/pack.mjs
    (cd packages/runtime && npm publish --access public)
    (cd packages/cli && npm publish --access public)
    echo "Published. Try: npx genially-scrolly@latest --help" ;;
  github)
    git remote get-url origin >/dev/null 2>&1 || git remote add origin https://github.com/RafaelFernandezGenially/genially-scrolly.git
    git push -u origin main ;;
  *) echo "usage: ./publish.sh npm | github"; exit 1 ;;
esac
