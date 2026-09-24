#!/bin/bash
# Tile every window on the active workspace into halves (2) or quarters (4) of its monitor.
# Windows keep their left-to-right order. More windows than cells wrap round and stack.
CELLS=${1:-2}
GAP=3
TITLE_H=20 # hyprbars bar_height, sits above the window

WS=$(hyprctl activeworkspace -j)
WS_ID=$(echo "$WS" | jq -r '.id')
MON=$(hyprctl monitors -j | jq --arg name "$(echo "$WS" | jq -r '.monitor')" '.[] | select(.name == $name)')
ACTIVE=$(hyprctl activewindow -j | jq -r '.address // empty')

# Usable area in logical pixels. reserved is [left, top, right, bottom].
read -r AX AY AW AH < <(echo "$MON" | jq -r '
  [.x + .reserved[0],
   .y + .reserved[1],
   (.width / .scale | floor) - .reserved[0] - .reserved[2],
   (.height / .scale | floor) - .reserved[1] - .reserved[3]] | @tsv')

mapfile -t WINS < <(hyprctl clients -j | jq -r --argjson ws "$WS_ID" '
  [.[] | select(.workspace.id == $ws and .mapped and (.hidden | not) and (.pinned | not))]
  | sort_by(.at[0], .at[1]) | .[] | "\(.address) \(.floating)"')

HALF_W=$((AW / 2))
HALF_H=$((AH / 2))

i=0
for line in "${WINS[@]}"; do
	read -r ADDR FLOATING <<<"$line"
	CELL=$((i % CELLS))
	i=$((i + 1))

	# Quarters fill column by column so left windows stay on the left
	if [ "$CELLS" = 4 ]; then
		CX=$((AX + (CELL / 2) * HALF_W))
		CY=$((AY + (CELL % 2) * HALF_H))
		CH=$HALF_H
	else
		CX=$((AX + CELL * HALF_W))
		CY=$AY
		CH=$AH
	fi

	hyprctl dispatch "hl.dsp.focus({window = hl.get_window('address:${ADDR}')})" >/dev/null
	if [ "$FLOATING" != "true" ]; then
		hyprctl dispatch "hl.dsp.window.float({action='set'})" >/dev/null
	fi
	hyprctl dispatch "hl.dsp.window.resize({x=$((HALF_W - GAP * 2)),y=$((CH - GAP * 2 - TITLE_H))})" >/dev/null
	hyprctl dispatch "hl.dsp.window.move({x=$((CX + GAP)),y=$((CY + GAP + TITLE_H))})" >/dev/null
done

if [ -n "$ACTIVE" ]; then
	hyprctl dispatch "hl.dsp.focus({window = hl.get_window('address:${ACTIVE}')})" >/dev/null
fi
