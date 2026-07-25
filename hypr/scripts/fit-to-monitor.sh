#!/bin/bash
PADDING_X=10
PADDING_Y=2

WIN=$(hyprctl activewindow -j)
WIN_ADDR=$(echo "$WIN" | jq -r '.address')
IS_FLOATING=$(echo "$WIN" | jq -r '.floating')
MON_ID=$(echo "$WIN" | jq -r '.monitor')

MON=$(hyprctl monitors -j | jq --argjson id "$MON_ID" '.[] | select(.id == $id)')

PHYS_W=$(echo "$MON" | jq -r '.width')
PHYS_H=$(echo "$MON" | jq -r '.height')
SCALE=$(echo "$MON" | jq -r '.scale')
MON_X=$(echo "$MON" | jq -r '.x')
MON_Y=$(echo "$MON" | jq -r '.y')
MON_NAME=$(echo "$MON" | jq -r '.name')
RES_BOTTOM=$(echo "$MON" | jq -r '.reserved[1]')
RES_LEFT=$(echo "$MON" | jq -r '.reserved[2]')
RES_RIGHT=$(echo "$MON" | jq -r '.reserved[3]')

LOG_W=$(awk "BEGIN {printf \"%d\", $PHYS_W / $SCALE}")
LOG_H=$(awk "BEGIN {printf \"%d\", $PHYS_H / $SCALE}")

# Find the top bar height from layer shell (y=0, wide surface = bar)
BAR_H=$(hyprctl layers -j | jq --arg mon "$MON_NAME" '
  .[$mon].levels["2"][]? | select(.y == 0 and .w > 200) | .h
' | head -1)
BAR_H=${BAR_H:-0}

TARGET_W=$((LOG_W - RES_LEFT - RES_RIGHT - PADDING_X * 2))
TARGET_H=$((LOG_H - BAR_H - RES_BOTTOM - PADDING_Y * 2 - 10))
TARGET_X=$((MON_X + RES_LEFT + PADDING_X))
TARGET_Y=$((MON_Y + BAR_H + PADDING_Y + 25))

if [ "$IS_FLOATING" != "true" ]; then
    hyprctl dispatch "hl.dsp.window.float({action='set'})"
fi

hyprctl dispatch "hl.dsp.window.resize({x=${TARGET_W},y=${TARGET_H}})"
hyprctl dispatch "hl.dsp.window.move({x=${TARGET_X},y=${TARGET_Y}})"
