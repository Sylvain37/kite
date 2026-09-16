#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
URL="http://127.0.0.1:8000/"
echo "Kite: $URL"
if command -v python3 >/dev/null 2>&1; then
  exec python3 -m http.server 8000 --bind 127.0.0.1
elif command -v python >/dev/null 2>&1; then
  exec python -m http.server 8000 --bind 127.0.0.1
else
  echo "Python 3 is required only by this local-server helper script." >&2
  exit 1
fi
