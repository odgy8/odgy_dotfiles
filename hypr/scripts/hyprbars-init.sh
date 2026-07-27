#!/bin/sh
# Load hyprbars, then re-parse the config so its settings actually apply.
#
# The button/bar config itself lives in hyprland.lua's PLUGINS section, behind
# a "hl.plugin.hyprbars exists" guard. On a cold boot that guard is false: the
# config is parsed before this script runs, so hyprbars hasn't registered yet
# and the block is skipped. Triggering a reload once the plugin is up re-runs
# the config with hl.plugin.hyprbars present, and the buttons appear.
#
# Reloading is safe here: hyprland.start doesn't re-fire on reload, so the
# autostart block above doesn't relaunch ags, streamdeck, the docks, etc.

hyprpm reload -n

# hyprpm returns before the plugin is guaranteed to be registered, so poll for
# it rather than racing with a fixed sleep. ~5s ceiling, then reload anyway.
i=0
while [ "$i" -lt 50 ]; do
	if hyprctl plugin list | grep -q hyprbars; then
		break
	fi
	sleep 0.1
	i=$((i + 1))
done

hyprctl reload
