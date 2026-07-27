#!/bin/sh
# Toggle the active window in and out of the special:minimized workspace.
#
# Note the dispatch syntax: with the Lua config, "hyprctl dispatch movetoworkspace
# ..." is reinterpreted as Lua, fails to resolve, and is silently ignored — the
# same trap documented in ags Taskbar.tsx and Workspaces.tsx. Dispatchers have
# to be written as Lua calls instead.

if [ "$(hyprctl activewindow -j | jq -r '.workspace.name')" = "special:minimized" ]; then
	hyprctl dispatch "hl.dsp.window.move({workspace = 'e+0'})"
else
	hyprctl dispatch "hl.dsp.window.move({workspace = 'special:minimized', silent = true})"

	# silent=true keeps the *active workspace* from changing, but moving a
	# window into a special workspace still pops that workspace open as an
	# overlay — which is the "all minimised windows" view. Toggle it straight
	# back shut so the window just disappears and you stay where you were.
	#
	# toggle_special takes a positional string, unlike every other dispatcher
	# here which takes a table; a table arg is silently ignored and toggles
	# the unnamed special:special workspace instead.
	hyprctl dispatch "hl.dsp.workspace.toggle_special('minimized')"
fi
