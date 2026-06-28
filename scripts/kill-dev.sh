#!/usr/bin/env bash
# kill-dev.sh — stop all dev processes and free dev ports before a clean start

set -euo pipefail

PORTS=(3000 3001 4040)

echo "  Stopping dev processes..."

# Kill by process name
pkill -f "vite" 2>/dev/null && echo "  ✓ vite" || true
pkill -f "tsx watch" 2>/dev/null && echo "  ✓ tsx watch" || true

# Belt-and-suspenders: kill by port in case process name didn't match
for port in "${PORTS[@]}"; do
  pid=$(lsof -ti tcp:"$port" 2>/dev/null || true)
  if [ -n "$pid" ]; then
    kill "$pid" 2>/dev/null && echo "  ✓ port $port (PID $pid)" || true
  fi
done

# Give the OS a moment to release the ports
sleep 0.5

echo "  Ports ${PORTS[*]} cleared."
