#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/dist"

python3 -m http.server 8000 &
server_pid=$!
trap 'kill "$server_pid" 2>/dev/null || true' EXIT

url="http://localhost:8000"
if command -v open >/dev/null 2>&1; then
  open "$url"
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$url"
else
  echo "Open $url in your browser."
fi

wait "$server_pid"
