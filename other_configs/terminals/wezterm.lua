local wezterm = require("wezterm")
local config = {}

-- Font configuration
config.font = wezterm.font("VictorMono Nerd Font")
config.font_size = 14

-- Window configuration
-- Moved this to the bottom of the file next to the wallpaper stuff
-- config.window_background_opacity = 0.85
config.macos_window_background_blur = 20 -- macOS blur
config.window_padding = {
	left = 12,
	right = 12,
	top = 12,
	bottom = 12,
}

-- Initial window size
config.initial_cols = 120
config.initial_rows = 40

-- Window decorations (buttonless on macOS)
if wezterm.target_triple == "x86_64-apple-darwin" or wezterm.target_triple == "aarch64-apple-darwin" then
	config.window_decorations = "RESIZE"
else
	config.window_decorations = "NONE"
end

-- Cursor configuration
config.default_cursor_style = "BlinkingBlock"
config.cursor_blink_rate = 500

-- Mouse configuration
config.hide_mouse_cursor_when_typing = false

-- Tab bar configuration
-- config.enable_tab_bar = false  -- Completely hide tab bar
config.hide_tab_bar_if_only_one_tab = true -- Show tabs only when multiple tabs exist

-- Selection
config.selection_word_boundary = " \t\n{}[]()\"'-.,;:"

-- Color scheme (GitHub Dark theme)
config.colors = {
	foreground = "#e1e3e4",
	background = "#0d1117",

	cursor_bg = "#58a6ff",
	cursor_fg = "#0d1117",
	cursor_border = "#58a6ff",

	selection_fg = "#0d1117",
	selection_bg = "#58a6ff",

	ansi = {
		"#484f58", -- black
		"#ff7b72", -- red
		"#3fb950", -- green
		"#d29922", -- yellow
		"#58a6ff", -- blue
		"#bc8cff", -- magenta
		"#39c5cf", -- cyan
		"#b1bac4", -- white
	},

	brights = {
		"#6e7681", -- bright black
		"#ffa198", -- bright red
		"#56d364", -- bright green
		"#e3b341", -- bright yellow
		"#79c0ff", -- bright blue
		"#d2a8ff", -- bright magenta
		"#56d4dd", -- bright cyan
		"#f0f6fc", -- bright white
	},
}

-- Scrolling
config.scrollback_lines = 10000

-- Key bindings
config.keys = {
	-- Copy/Paste
	{
		key = "c",
		mods = "CTRL|SHIFT",
		action = wezterm.action.CopyTo("Clipboard"),
	},
	{
		key = "v",
		mods = "CTRL|SHIFT",
		action = wezterm.action.PasteFrom("Clipboard"),
	},

	-- Font size
	{
		key = "=",
		mods = "CTRL|SHIFT",
		action = wezterm.action.IncreaseFontSize,
	},
	{
		key = "-",
		mods = "CTRL|SHIFT",
		action = wezterm.action.DecreaseFontSize,
	},
	{
		key = "0",
		mods = "CTRL|SHIFT",
		action = wezterm.action.ResetFontSize,
	},

	-- New window/tab
	{
		key = "Enter",
		mods = "CTRL|SHIFT",
		action = wezterm.action.SpawnWindow,
	},
	{
		key = "n",
		mods = "CTRL|SHIFT",
		action = wezterm.action.SpawnWindow,
	},
}

-- Annoying flashing and bell when it can't do something like you press backpace too many times
config.audible_bell = "Disabled"
config.visual_bell = {
	fade_in_duration_ms = 0,
	fade_out_duration_ms = 0,
}

-- URL handling - automatically detects OS
config.hyperlink_rules = wezterm.default_hyperlink_rules()

-- Background image configuration
config.window_background_image = "/home/sam/Pictures/github_coding_images/Owl.png"
config.window_background_image_hsb = {
	brightness = 0.05, -- Adjust to taste (0.0 to 1.0)
	hue = 1.0,
	saturation = 1.0,
}

config.window_background_opacity = 1 -- Adjust to taste (0.0 to 1.0)

return config
