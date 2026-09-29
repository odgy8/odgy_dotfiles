#!/bin/bash
# Arrange every window on the active workspace: 2 = halves side by side, 2v = halves stacked,
# 4 = quarters, 1 = overlapping 95% windows in the corners. Extra windows wrap round and stack.
MODE=${1:-2}
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
BIG_W=$((AW * 95 / 100))
BIG_H=$((AH * 95 / 100))
SLOTS=$([ "$MODE" = 2 ] || [ "$MODE" = 2v ] && echo 2 || echo 4)

i=0
for line in "${WINS[@]}"; do
	read -r ADDR FLOATING <<<"$line"
	CELL=$((i % SLOTS))
	i=$((i + 1))

	case "$MODE" in
	1)
		# Overlapping 95% windows pinned to corners: TL, BR, TR, BL
		CW=$BIG_W
		CH=$BIG_H
		CX=$AX
		CY=$AY
		if [ "$CELL" = 1 ] || [ "$CELL" = 2 ]; then CX=$((AX + AW - CW)); fi
		if [ "$CELL" = 1 ] || [ "$CELL" = 3 ]; then CY=$((AY + AH - CH)); fi
		;;
	2v)
		CW=$AW
		CH=$HALF_H
		CX=$AX
		CY=$((AY + CELL * HALF_H))
		;;
	4)
		# Column by column so left windows stay on the left
		CW=$HALF_W
		CH=$HALF_H
		CX=$((AX + (CELL / 2) * HALF_W))
		CY=$((AY + (CELL % 2) * HALF_H))
		;;
	*)
		CW=$HALF_W
		CH=$AH
		CX=$((AX + CELL * HALF_W))
		CY=$AY
		;;
	esac

	hyprctl dispatch "hl.dsp.focus({window = hl.get_window('address:${ADDR}')})" >/dev/null
	if [ "$FLOATING" != "true" ]; then
		hyprctl dispatch "hl.dsp.window.float({action='set'})" >/dev/null
	fi
	hyprctl dispatch "hl.dsp.window.resize({x=$((CW - GAP * 2)),y=$((CH - GAP * 2 - TITLE_H))})" >/dev/null
	hyprctl dispatch "hl.dsp.window.move({x=$((CX + GAP)),y=$((CY + GAP + TITLE_H))})" >/dev/null
done

if [ -n "$ACTIVE" ]; then
	hyprctl dispatch "hl.dsp.focus({window = hl.get_window('address:${ACTIVE}')})" >/dev/null
fi
