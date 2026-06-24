#!/usr/bin/env bash
# Spawn a tmux session: server on top, client panes along the bottom.
#
# Usage:
#   ./scripts/dev.sh           # alice + bob
#   ./scripts/dev.sh eve mallory

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SESSION="${GRPC_CHAT_TMUX_SESSION:-grpchat}"

if ! command -v tmux >/dev/null 2>&1; then
  echo "error: tmux is required" >&2
  exit 1
fi

if [ "$#" -eq 0 ]; then
  CLIENTS=(alice bob)
else
  CLIENTS=("$@")
fi

tmux has-session -t "$SESSION" 2>/dev/null && tmux kill-session -t "$SESSION"

# Use session-level targets so tmux tracks the active pane after each split.
tmux new-session -d -s "$SESSION" -c "$ROOT"
tmux send-keys -t "$SESSION" "bun run server" C-m
tmux split-window -v -t "$SESSION" -p 70 -c "$ROOT"
tmux send-keys -t "$SESSION" "bun run client ${CLIENTS[0]}" C-m

for ((i = 1; i < ${#CLIENTS[@]}; i++)); do
  tmux split-window -h -t "$SESSION" -c "$ROOT"
  tmux send-keys -t "$SESSION" "bun run client ${CLIENTS[$i]}" C-m
done

tmux select-pane -t "$SESSION:.1"
tmux attach -t "$SESSION"
