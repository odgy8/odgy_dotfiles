-- hyprland.lua
-- Lua port of hyprland.conf (Hyprland >= 0.55)
-- https://wiki.hypr.land/Configuring/Start/
--
-- ~~~~~~~~~~~~~~~~~~~~~
-- ~~~~~ CONSTANTS ~~~~~
-- ~~~~~~~~~~~~~~~~~~~~~

local mainMod = "ALT"
local floatingFirst = true
local terminal = "/home/sam/coding/tooling/wezterm/target/release/wezterm-gui"

-- ~~~~~~~~~~~~~~~~~~~~~
-- ~~~~ ENVIRONMENT ~~~~
-- ~~~~~~~~~~~~~~~~~~~~~

hl.env("XCURSOR_SIZE", "24")
hl.env("HYPRCURSOR_SIZE", "24")
hl.env("GTK_THEME", "Adwaita:dark")
hl.env("QT_QPA_PLATFORMTHEME", "qt5ct")
hl.env("QT_STYLE_OVERRIDE", "Adwaita-Dark")
hl.env("GTK_APPLICATION_PREFER_DARK_THEME", "1")

-- ~~~~~~~~~~~~~~~~~~~~~
-- ~~~~~ MONITORS ~~~~~~
-- ~~~~~~~~~~~~~~~~~~~~~

hl.monitor({ output = "DP-2", mode = "1920x1080", position = "auto-left", scale = 1 })
hl.monitor({ output = "DP-1", mode = "3840x2160", position = "0x0", scale = 1.5 })
hl.monitor({ output = "HDMI-A-1", mode = "1920x1080", position = "auto-right", scale = 1 })

-- ~~~~~~~~~~~~~~~~~~~~~
-- ~~~~~ AUTOSTART ~~~~~
-- ~~~~~~~~~~~~~~~~~~~~~

hl.on("hyprland.start", function()
	hl.exec_cmd("hyprpm reload -n")
	hl.exec_cmd("ags run ~/.config/ags/sambar.tsx")
	hl.exec_cmd("gsettings set org.gnome.desktop.interface color-scheme prefer-dark")
	hl.exec_cmd("/home/sam/.local/bin/streamdeck --no-ui")
	hl.exec_cmd("clipse -listen")
	hl.exec_cmd("sleep 5 && surfshark --auto-connect")
	-- movecursor dropped: no working native or raw-dispatch equivalent found
	-- (exec_raw doesn't actually apply anything despite returning "ok" —
	-- confirmed broken as a mechanism, not just this call)
	hl.exec_cmd(
		'nwg-dock-hyprland -p bottom -i 24 -s dock.css -mb 4 -d -hd 0 -c "/home/sam/.config/rofi/launchers/type-2/launcher.sh" -o HDMI-A-1'
	)
	hl.exec_cmd(
		'nwg-dock-hyprland -p bottom -i 24 -s dock.css -mb 4 -d -hd 0 -c "/home/sam/.config/rofi/launchers/type-2/launcher.sh" -o DP-1 -m'
	)
	hl.exec_cmd(
		'nwg-dock-hyprland -p bottom -i 24 -s dock.css -mb 4 -d -hd 0 -c "/home/sam/.config/rofi/launchers/type-2/launcher.sh" -o DP-2 -m'
	)
	hl.exec_cmd("hyprswitch init &")
	hl.exec_cmd("~/.local/bin/colorshell")
	hl.exec_cmd("swaybg -i /home/sam/Pictures/github_coding_images/jellyfish.png -m fill")
	-- hyprland.conf's startup workspace/monitor race-condition fix (forcing
	-- workspace 10 -> DP-2 and workspace 1 -> DP-1 a few seconds after boot)
	-- relied on moveworkspacetomonitor via raw dispatch, which has no working
	-- Lua equivalent (exec_raw doesn't apply anything, confirmed broken).
	-- Dropped for now — relying on the workspace_rule declarations below
	-- being enough on their own. If workspaces land on the wrong monitor at
	-- boot, this is the piece that's missing.
end)

-- ~~~~~~~~~~~~~~~~~~~~~
-- ~~~~ PERMISSIONS ~~~~
-- ~~~~~~~~~~~~~~~~~~~~~

hl.permission("/usr/(bin|local/bin)/hyprpm", "plugin", "allow")

-- ~~~~~~~~~~~~~~~~~~~~~
-- ~~~ LOOK AND FEEL ~~~
-- ~~~~~~~~~~~~~~~~~~~~~

hl.config({
	general = {
		gaps_in = 2,
		gaps_out = 0,
		border_size = 1,
		col = {
			active_border = { colors = { "rgba(33ccffee)", "rgba(00ff99ee)" }, angle = 45 },
			inactive_border = "rgba(595959aa)",
		},
		resize_on_border = true,
		allow_tearing = false,
		layout = "dwindle",
	},

	decoration = {
		rounding = 10,
		rounding_power = 2,
		active_opacity = 1.0,
		inactive_opacity = 1.0,
		shadow = {
			enabled = true,
			range = 4,
			render_power = 3,
			color = 0xee1a1a1a,
		},
		blur = {
			enabled = true,
			size = 3,
			passes = 1,
			vibrancy = 0.1696,
		},
	},

	animations = {
		enabled = true,
	},

	group = {
		col = {
			border_active = "rgba(33ccffee)",
			border_inactive = "rgba(595959aa)",
		},
		groupbar = {
			enabled = true,
			height = 1,
			font_size = 0,
			gradients = true,
			render_titles = true,
			scrolling = true,
			col = {
				active = "rgba(33ccffaa)",
				inactive = "rgba(00000000)",
			},
			text_color = "rgba(ffffffff)",
		},
	},

	dwindle = {
		preserve_split = true,
	},

	master = {
		new_status = "slave",
		orientation = "center",
		mfact = 0.5,
	},

	misc = {
		force_default_wallpaper = 0,
		disable_hyprland_logo = true,
	},

	cursor = {
		zoom_factor = 1.0,
	},

	input = {
		kb_layout = "gb",
		kb_variant = "",
		kb_model = "",
		kb_options = "",
		kb_rules = "",
		repeat_rate = 50,
		repeat_delay = 200,
		follow_mouse = 1,
		sensitivity = 0,
		accel_profile = "flat",
		touchpad = {
			natural_scroll = false,
		},
	},
})

-- ~~~~~~~~~~~~~~~~~~~~~
-- ~~~~ ANIMATIONS ~~~~~
-- ~~~~~~~~~~~~~~~~~~~~~

hl.curve("easeOutQuint", { type = "bezier", points = { { 0.23, 1 }, { 0.32, 1 } } })
hl.curve("easeInOutCubic", { type = "bezier", points = { { 0.65, 0.05 }, { 0.36, 1 } } })
hl.curve("linear", { type = "bezier", points = { { 0, 0 }, { 1, 1 } } })
hl.curve("almostLinear", { type = "bezier", points = { { 0.5, 0.5 }, { 0.75, 1.0 } } })
hl.curve("quick", { type = "bezier", points = { { 0.15, 0 }, { 0.1, 1 } } })

hl.animation({ leaf = "global", enabled = true, speed = 10, bezier = "default" })
hl.animation({ leaf = "border", enabled = true, speed = 5.39, bezier = "easeOutQuint" })
hl.animation({ leaf = "windows", enabled = true, speed = 4.79, bezier = "easeOutQuint" })
hl.animation({ leaf = "windowsIn", enabled = true, speed = 4.1, bezier = "easeOutQuint", style = "popin 87%" })
hl.animation({ leaf = "windowsOut", enabled = true, speed = 1.49, bezier = "linear", style = "popin 87%" })
hl.animation({ leaf = "fadeIn", enabled = true, speed = 1.73, bezier = "almostLinear" })
hl.animation({ leaf = "fadeOut", enabled = true, speed = 1.46, bezier = "almostLinear" })
hl.animation({ leaf = "fade", enabled = true, speed = 3.03, bezier = "quick" })
hl.animation({ leaf = "layers", enabled = true, speed = 3.81, bezier = "easeOutQuint" })
hl.animation({ leaf = "layersIn", enabled = true, speed = 4, bezier = "easeOutQuint", style = "fade" })
hl.animation({ leaf = "layersOut", enabled = true, speed = 1.5, bezier = "linear", style = "fade" })
hl.animation({ leaf = "fadeLayersIn", enabled = true, speed = 1.79, bezier = "almostLinear" })
hl.animation({ leaf = "fadeLayersOut", enabled = true, speed = 1.39, bezier = "almostLinear" })
hl.animation({ leaf = "workspaces", enabled = true, speed = 1.94, bezier = "almostLinear", style = "fade" })
hl.animation({ leaf = "workspacesIn", enabled = true, speed = 1.21, bezier = "almostLinear", style = "fade" })
hl.animation({ leaf = "workspacesOut", enabled = true, speed = 1.94, bezier = "almostLinear", style = "fade" })

-- ~~~~~~~~~~~~~~~~~~~~~
-- ~~~ INPUT DEVICES ~~~
-- ~~~~~~~~~~~~~~~~~~~~~

hl.device({
	name = "epic-mouse-v1",
	sensitivity = -0.5,
})

-- ~~~~~~~~~~~~~~~~~~~~~
-- ~~~~ KEYBINDINGS ~~~~
-- ~~~~~~~~~~~~~~~~~~~~~

-- hyprswitch window switcher
hl.bind(mainMod .. " + tab", hl.dsp.exec_cmd("hyprswitch gui --mod-key alt --key tab"))

-- Session
hl.bind("CTRL + SHIFT + Escape", hl.dsp.exit())

-- Window management
hl.bind(mainMod .. " + Q", hl.dsp.window.close())
hl.bind(mainMod .. " + G", hl.dsp.window.float({ action = "toggle" }))
hl.bind(mainMod .. " + F", hl.dsp.window.fullscreen({ action = "toggle" }))
hl.bind(mainMod .. " + SHIFT + F", hl.dsp.exec_cmd("~/.config/hypr/scripts/fit-to-monitor.sh"))
hl.bind(mainMod .. " + space", hl.dsp.exec_cmd("~/.config/rofi/launchers/type-2/launcher.sh"))
hl.bind(mainMod .. " + P", hl.dsp.window.pin())
hl.bind(mainMod .. " + J", hl.dsp.layout("togglesplit"))

-- Focus movement
-- (bringactivetotop dropped: no working native or raw-dispatch equivalent)
hl.bind(mainMod .. " + left", hl.dsp.focus({ direction = "left" }))
hl.bind(mainMod .. " + right", hl.dsp.focus({ direction = "right" }))
hl.bind(mainMod .. " + up", hl.dsp.focus({ direction = "up" }))
hl.bind(mainMod .. " + down", hl.dsp.focus({ direction = "down" }))
hl.bind(mainMod .. " + h", hl.dsp.focus({ direction = "left" }))
hl.bind(mainMod .. " + l", hl.dsp.focus({ direction = "right" }))
hl.bind(mainMod .. " + k", hl.dsp.focus({ direction = "up" }))
hl.bind(mainMod .. " + j", hl.dsp.focus({ direction = "down" }))

-- Move floating window or reorder tiled window
hl.bind(
	mainMod .. " + SHIFT + h",
	hl.dsp.exec_cmd(
		[[bash -c '[ "$(hyprctl activewindow -j | jq -r .floating)" = "true" ] && hyprctl dispatch "hl.dsp.window.move({x=-30,y=0,relative=true})" || hyprctl dispatch "hl.dsp.window.move({direction=\"l\"})"']]
	),
	{ repeating = true }
)
hl.bind(
	mainMod .. " + SHIFT + l",
	hl.dsp.exec_cmd(
		[[bash -c '[ "$(hyprctl activewindow -j | jq -r .floating)" = "true" ] && hyprctl dispatch "hl.dsp.window.move({x=30,y=0,relative=true})" || hyprctl dispatch "hl.dsp.window.move({direction=\"r\"})"']]
	),
	{ repeating = true }
)
hl.bind(
	mainMod .. " + SHIFT + k",
	hl.dsp.exec_cmd(
		[[bash -c '[ "$(hyprctl activewindow -j | jq -r .floating)" = "true" ] && hyprctl dispatch "hl.dsp.window.move({x=0,y=-30,relative=true})" || hyprctl dispatch "hl.dsp.window.move({direction=\"u\"})"']]
	),
	{ repeating = true }
)
hl.bind(
	mainMod .. " + SHIFT + j",
	hl.dsp.exec_cmd(
		[[bash -c '[ "$(hyprctl activewindow -j | jq -r .floating)" = "true" ] && hyprctl dispatch "hl.dsp.window.move({x=0,y=30,relative=true})" || hyprctl dispatch "hl.dsp.window.move({direction=\"d\"})"']]
	),
	{ repeating = true }
)

-- Cycle windows in master layout
hl.bind(mainMod .. " + CTRL + j", hl.dsp.layout("cyclenext"))
hl.bind(mainMod .. " + CTRL + k", hl.dsp.layout("cycleprev"))

-- Group tab switching (same keys as focus — no-op when not in a group)
hl.bind(mainMod .. " + k", hl.dsp.group.prev())
hl.bind(mainMod .. " + j", hl.dsp.group.next())

-- Workspaces
for i = 1, 10 do
	local key = i % 10 -- key 0 → workspace 10
	hl.bind(mainMod .. " + " .. key, hl.dsp.focus({ workspace = i }))
	hl.bind(mainMod .. " + SHIFT + " .. key, hl.dsp.window.move({ workspace = i }))
end

-- Screenshots and recording
hl.bind("CTRL + SHIFT + SUPER + 4", hl.dsp.exec_cmd("hyprshot -m region -o ~/Pictures/Screenshots"))
hl.bind(
	"CTRL + SHIFT + SUPER + R",
	hl.dsp.exec_cmd(
		[[bash -c 'notify-send -u low "Recording started" "Full screen — SUPER+CTRL+SHIFT+E to stop" && wf-recorder -o $(hyprctl monitors -j | jq -r ".[] | select(.focused==true) | .name") -f ~/Videos/Recordings/$(date +%Y-%m-%d_%H-%M-%S).mp4']]
	)
)
hl.bind(
	"CTRL + SHIFT + SUPER + 3",
	hl.dsp.exec_cmd(
		[[bash -c 'notify-send -u low "Recording started" "Select a region — SUPER+CTRL+SHIFT+E to stop" && wf-recorder -g "$(slurp)" -f ~/Videos/Recordings/$(date +%Y-%m-%d_%H-%M-%S).mp4']]
	)
)
hl.bind(
	"CTRL + SHIFT + SUPER + E",
	hl.dsp.exec_cmd(
		[[bash -c 'pkill -INT wf-recorder && notify-send "Recording stopped" "Saved to ~/Videos/Recordings"']]
	)
)

-- Clipboard manager (hardcoded to kitty in hyprland.conf, not $terminal)
hl.bind(mainMod .. " + V", hl.dsp.exec_cmd('kitty --class "clipse-clipboard" clipse'))

-- Scratchpad
hl.bind(mainMod .. " + S", hl.dsp.workspace.toggle_special("magic"))
hl.bind(mainMod .. " + SHIFT + S", hl.dsp.window.move({ workspace = "special:magic" }))

-- Minimise / unminimise
hl.bind(mainMod .. " + M", hl.dsp.window.move({ workspace = "special:minimized", silent = true }))
hl.bind(mainMod .. " + SHIFT + M", hl.dsp.workspace.toggle_special("minimized"))
hl.bind(mainMod .. " + SHIFT + U", hl.dsp.window.move({ workspace = "e+0" }))

-- Scroll through workspaces
hl.bind(mainMod .. " + mouse_down", hl.dsp.focus({ workspace = "e+1" }))
hl.bind(mainMod .. " + mouse_up", hl.dsp.focus({ workspace = "e-1" }))

-- Groups
hl.bind(mainMod .. " + SHIFT + G", hl.dsp.group.toggle())
hl.bind(mainMod .. " + CTRL + h", hl.dsp.window.move({ into_group = "l" }))
hl.bind(mainMod .. " + CTRL + j", hl.dsp.window.move({ into_group = "d" }))
hl.bind(mainMod .. " + CTRL + k", hl.dsp.window.move({ into_group = "u" }))
hl.bind(mainMod .. " + CTRL + l", hl.dsp.window.move({ into_group = "r" }))

-- Resize (direct, no submap)
hl.bind(mainMod .. " + CTRL + SHIFT + h", hl.dsp.window.resize({ x = -20, y = 0, relative = true }), { repeating = true })
hl.bind(mainMod .. " + CTRL + SHIFT + l", hl.dsp.window.resize({ x = 20, y = 0, relative = true }), { repeating = true })
hl.bind(mainMod .. " + CTRL + SHIFT + k", hl.dsp.window.resize({ x = 0, y = 20, relative = true }), { repeating = true })
hl.bind(mainMod .. " + CTRL + SHIFT + j", hl.dsp.window.resize({ x = 0, y = -20, relative = true }), { repeating = true })

-- Mouse drag and resize
hl.bind(mainMod .. " + mouse:272", hl.dsp.window.drag(), { mouse = true })
hl.bind(mainMod .. " + mouse:273", hl.dsp.window.resize(), { mouse = true })

-- Volume and brightness (locked + repeating = bindel)
hl.bind(
	"XF86AudioRaiseVolume",
	hl.dsp.exec_cmd("wpctl set-volume -l 1 @DEFAULT_AUDIO_SINK@ 5%+"),
	{ locked = true, repeating = true }
)
hl.bind(
	"XF86AudioLowerVolume",
	hl.dsp.exec_cmd("wpctl set-volume @DEFAULT_AUDIO_SINK@ 5%-"),
	{ locked = true, repeating = true }
)
hl.bind(
	"XF86AudioMute",
	hl.dsp.exec_cmd("wpctl set-mute @DEFAULT_AUDIO_SINK@ toggle"),
	{ locked = true, repeating = true }
)
hl.bind(
	"XF86AudioMicMute",
	hl.dsp.exec_cmd("wpctl set-mute @DEFAULT_AUDIO_SOURCE@ toggle"),
	{ locked = true, repeating = true }
)
hl.bind("XF86MonBrightnessUp", hl.dsp.exec_cmd("brightnessctl -e4 -n2 set 5%+"), { locked = true, repeating = true })
hl.bind("XF86MonBrightnessDown", hl.dsp.exec_cmd("brightnessctl -e4 -n2 set 5%-"), { locked = true, repeating = true })

-- Media playback (locked = bindl)
hl.bind("XF86AudioNext", hl.dsp.exec_cmd("playerctl next"), { locked = true })
hl.bind("XF86AudioPause", hl.dsp.exec_cmd("playerctl play-pause"), { locked = true })
hl.bind("XF86AudioPlay", hl.dsp.exec_cmd("playerctl play-pause"), { locked = true })
hl.bind("XF86AudioPrev", hl.dsp.exec_cmd("playerctl previous"), { locked = true })

-- Apps
hl.bind(mainMod .. " + Return", hl.dsp.exec_cmd(terminal))
hl.bind(mainMod .. " + D", hl.dsp.exec_cmd("wofi --show drun"))

-- ~~~~~~~~~~~~~~~~~~~~~
-- ~~~~~~ SUBMAPS ~~~~~~
-- ~~~~~~~~~~~~~~~~~~~~~

-- Resize submap (Alt+R)
hl.bind(mainMod .. " + R", hl.dsp.submap("resize"))
hl.define_submap("resize", function()
	hl.bind("h", hl.dsp.window.resize({ x = -20, y = 0, relative = true }), { repeating = true })
	hl.bind("l", hl.dsp.window.resize({ x = 20, y = 0, relative = true }), { repeating = true })
	hl.bind("k", hl.dsp.window.resize({ x = 0, y = 20, relative = true }), { repeating = true })
	hl.bind("j", hl.dsp.window.resize({ x = 0, y = -20, relative = true }), { repeating = true })
	hl.bind("left", hl.dsp.window.resize({ x = -20, y = 0, relative = true }), { repeating = true })
	hl.bind("right", hl.dsp.window.resize({ x = 20, y = 0, relative = true }), { repeating = true })
	hl.bind("up", hl.dsp.window.resize({ x = 0, y = 20, relative = true }), { repeating = true })
	hl.bind("down", hl.dsp.window.resize({ x = 0, y = -20, relative = true }), { repeating = true })
	hl.bind("Escape", hl.dsp.submap("default"))
	hl.bind("Return", hl.dsp.submap("default"))
	hl.bind(mainMod .. " + Return", hl.dsp.exec_cmd(terminal))
	hl.bind(mainMod .. " + D", hl.dsp.exec_cmd("wofi --show drun"))
end)

-- Layout submap (Alt+Shift+;)
hl.bind(mainMod .. " + SHIFT + semicolon", hl.dsp.submap("layout"))
hl.define_submap("layout", function()
	hl.bind("g", function() -- toggle floating
		hl.dispatch(hl.dsp.window.float({ action = "toggle" }))
		hl.dispatch(hl.dsp.submap("default"))
	end)
	hl.bind("f", function() -- fullscreen, mode 1 (maximised, keeps bar)
		hl.dispatch(hl.dsp.window.fullscreen({ mode = "maximized" }))
		hl.dispatch(hl.dsp.submap("default"))
	end)
	hl.bind("t", function() -- pseudo-tile
		hl.dispatch(hl.dsp.window.pseudo())
		hl.dispatch(hl.dsp.submap("default"))
	end)
	hl.bind("m", function() -- true fullscreen, mode 0
		hl.dispatch(hl.dsp.window.fullscreen({ mode = "fullscreen" }))
		hl.dispatch(hl.dsp.submap("default"))
	end)
	hl.bind("a", function()
		hl.dispatch(hl.dsp.group.toggle())
		hl.dispatch(hl.dsp.submap("default"))
	end)
	hl.bind("s", function()
		hl.dispatch(hl.dsp.group.toggle())
		hl.dispatch(hl.dsp.submap("default"))
	end)
	hl.bind("d", function()
		hl.dispatch(hl.dsp.group.toggle())
		hl.dispatch(hl.dsp.submap("default"))
	end)
	hl.bind("Escape", hl.dsp.submap("default"))
	hl.bind("Return", hl.dsp.submap("default"))
end)

-- ~~~~~~~~~~~~~~~~~~~~~
-- ~~~ WINDOW RULES ~~~~
-- ~~~~~~~~~~~~~~~~~~~~~

hl.window_rule({
	name = "float by default",
	match = { class = ".*" },
	float = floatingFirst,
})

hl.window_rule({
	name = "Empty-class popups (e.g. Slack link/copy menus)",
	match = { class = "^$", title = "^$", xwayland = true },
	float = true,
})

hl.window_rule({
	name = "Clipboard float rule",
	match = { class = "clipse-clipboard" },
	float = true,
	size = "500 800",
})

hl.window_rule({
	name = "Surfshark",
	match = { class = "Surfshark" },
	float = true,
	size = "800 600",
})

hl.window_rule({
	name = "Forge",
	match = { class = "forge-dev-linux-amd64" },
	float = floatingFirst,
	workspace = "4",
	size = "1500 800",
})

hl.window_rule({
	name = "Kitty",
	match = { class = "kitty" },
	float = floatingFirst,
	size = "1900 1000",
})

hl.window_rule({
	name = "DaVinci Resolve",
	match = { class = "resolve" },
	float = true,
	size = "1900 1000",
})

hl.window_rule({
	name = "Nautilus max height",
	match = { class = "org.gnome.Nautilus" },
	float = true,
	size = "950 800",
})

-- ~~~~~~~~~~~~~~~~~~~~~
-- ~~ WORKSPACE RULES ~~
-- ~~~~~~~~~~~~~~~~~~~~~

hl.workspace_rule({ workspace = "10", monitor = "DP-2", default = true, persistent = true })
hl.workspace_rule({ workspace = "5", monitor = "DP-2" })
hl.workspace_rule({ workspace = "6", monitor = "DP-2" })

hl.workspace_rule({ workspace = "1", monitor = "DP-1", default = true, persistent = true })
hl.workspace_rule({ workspace = "2", monitor = "DP-1" })
hl.workspace_rule({ workspace = "3", monitor = "DP-1" })
hl.workspace_rule({ workspace = "4", monitor = "DP-1" })

hl.workspace_rule({ workspace = "7", monitor = "HDMI-A-1" })
hl.workspace_rule({ workspace = "8", monitor = "HDMI-A-1" })
hl.workspace_rule({ workspace = "9", monitor = "HDMI-A-1", default = true, persistent = true })

-- ~~~~~~~~~~~~~~~~~~~~~
-- ~~~~~~ PLUGINS ~~~~~~
-- ~~~~~~~~~~~~~~~~~~~~~

-- hyprbars (titlebar buttons) intentionally omitted: hl.config() validates
-- plugin keys live at parse time, but hyprbars only registers later via the
-- "hyprpm reload -n" exec command, so this errors as an unknown config key.
-- .conf's declarative plugin{} block doesn't have that restriction. Needs a
-- real fix (likely deferred hyprctl keyword calls after hyprpm reload
-- finishes) before it can come back — not worth guessing at blind.
