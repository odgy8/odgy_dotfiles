#!/usr/bin/env bash
# Compact window indices in one session, leaving pinned high-numbered windows alone.
#
# Wired to the window-unlinked hook in tmux.conf. Windows numbered at or above
# @pin-threshold keep their index forever; everything below it is pulled down to
# close whatever gap the window that just went away left behind.
#
# Usage: renumber-windows.sh <session-name> [socket-path]
#        (tmux passes #{hook_session_name} and #{socket_path})

set -u

# Targets below are all "=$session:N" -- the = forces an exact name match, so a
# session named as a prefix of another one can't be renumbered by mistake.
session="${1:-}"
socket="${2:-}"
[ -n "$session" ] || exit 0

# Talk to the server we were invoked from, not whichever one $TMUX happens to
# point at -- a hook's run-shell has no pane to inherit that from, and guessing
# wrong would renumber windows on an unrelated tmux server.
tm() {
    if [ -n "$socket" ]; then
        tmux -S "$socket" "$@"
    else
        tmux "$@"
    fi
}

# move-window unlinks and relinks, so each move below re-fires window-unlinked
# and re-runs this script. Those re-entrant runs bail out here. The guard holds a
# PID rather than a flag so a killed run can't wedge renumbering permanently --
# a guard whose process is gone is stale and gets ignored.
guard=$(tm show-option -gqv @renumbering)
if [ -n "$guard" ] && kill -0 "$guard" 2>/dev/null; then
    exit 0
fi

# The session is already gone if the window that closed was its last one.
tm has-session -t "=$session" 2>/dev/null || exit 0

threshold=$(tm show-option -gqv @pin-threshold)
[ -n "$threshold" ] || threshold=90
base=$(tm show-option -gqv base-index)
[ -n "$base" ] || base=0

# Two windows closing at once would otherwise interleave their moves.
exec 9>"${TMPDIR:-/tmp}/tmux-renumber-$(id -u).lock"
flock 9

tm set-option -g @renumbering "$$"
trap 'tm set-option -gu @renumbering' EXIT

# list-windows comes back in index order, so the first pinned window means every
# window after it is pinned too. Targets are always free: next never runs ahead
# of idx, so each window only ever moves down into a gap.
next=$base
while read -r idx; do
    [ "$idx" -lt "$threshold" ] || break
    [ "$idx" -eq "$next" ] || tm move-window -d -s "=$session:$idx" -t "=$session:$next"
    next=$((next + 1))
done < <(tm list-windows -t "=$session" -F '#{window_index}')
