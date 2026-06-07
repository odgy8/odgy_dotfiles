# Hyprland Setup

A three-monitor Hyprland desktop with a custom AGS status bar, rofi launcher, nwg-dock, and clipse clipboard manager.

## Directory structure

```
hypr/           Core Hyprland config (hyprland.conf, hyprlock, hyprpaper, scripts)
ags/            Custom status bar "sambar" — see ags/README.md for its own deps
rofi/           App launcher themes (type-2 is the one in active use)
nwg-dock-hyprland/  Dock CSS (one instance per monitor)
clipse/         Clipboard manager config and theme
waybar/         Legacy bar config — replaced by sambar, kept for reference
swaync/         Legacy notification centre config — replaced by sambar's built-in
                notification daemon (AstalNotifd), kept for reference
```

## Dependencies

### From the AUR

```bash
yay -S \
  hyprland \
  hyprlock \
  hyprpaper \
  hyprpm \
  hyprswitch \
  nwg-dock-hyprland \
  clipse \
  rofi-wayland
```

### From pacman

```bash
sudo pacman -S \
  swaybg \
  kitty \
  jq \
  playerctl \
  wf-recorder \
  slurp \
  hyprshot \
  wofi \
  qt5ct \
  adwaita-qt5
```

### Hyprland plugins (via hyprpm)

```bash
hyprpm add https://github.com/hyprwm/hyprland-plugins
hyprpm enable hyprbars
```

`hyprpm reload -n` is called in exec-once so this only needs to be done once after install.

### AGS / sambar

See **ags/README.md** for the full list. Short version:

```bash
yay -S ags libastal-git libastal-4-git libastal-hyprland-git \
        libastal-mpris-git libastal-tray-git libastal-wl-git \
        libastal-notifd-git
sudo pacman -S pipewire pipewire-pulse wireplumber webkitgtk-6.0
```

### Optional / personal

| Tool | Purpose |
|---|---|
| `streamdeck` | Stream Deck control (`~/.local/bin/streamdeck`) |
| `surfshark` | VPN, auto-connects after 5 s |
| `colorshell` | Custom shell colouring (`~/.local/bin/colorshell`) |

---

## Monitor layout

| Port | Position | Resolution | Scale | Workspaces |
|---|---|---|---|---|
| DP-1 | Centre (primary) | 3840×2160 | 1.5 | 1, 2, 3 |
| DP-2 | Left | 1920×1080 | 1 | 4, 5, 6 |
| HDMI-A-1 | Right | 1920×1080 | 1 | 7, 8, 9, 0 |

Notification toasts appear on the centre monitor only (monitor 0 in AGS terms).

The nwg-dock runs a separate instance on each monitor. DP-1 gets `-m` (mirror mode, no pinned apps), the others get the full launcher.

---

## Keybindings

`$mainMod` = **Alt**

### Windows

| Binding | Action |
|---|---|
| `Alt + Q` | Close active window |
| `Alt + G` | Toggle floating |
| `Alt + F` | Fullscreen |
| `Alt + Shift + F` | Fit floating window to monitor (with bar/padding margins) |
| `Alt + P` | Pin window (stays on all workspaces) |
| `Alt + J` | Toggle dwindle split |
| `Alt + M` | Minimise (send to `special:minimized`) |
| `Alt + Shift + M` | Show/hide minimised windows |
| `Alt + Shift + U` | Unminimise to current workspace |

### Focus & movement

| Binding | Action |
|---|---|
| `Alt + h/j/k/l` or arrows | Move focus |
| `Alt + Shift + h/j/k/l` | Move window (or nudge floating by 30 px) |
| `Alt + Ctrl + j/k` | Cycle windows in master layout |

### Groups (tabs)

| Binding | Action |
|---|---|
| `Alt + Shift + G` | Toggle group |
| `Alt + Ctrl + h/j/k/l` | Move window into adjacent group |
| `Alt + k / j` | Switch tab within group |

### Resize

| Binding | Action |
|---|---|
| `Alt + R` | Enter resize submap |
| `h/j/k/l` or arrows *(in submap)* | Resize ±20 px |
| `Alt + Ctrl + Shift + h/j/k/l` | Resize directly (no submap) |
| `Escape / Enter` | Exit submap |

### Layout submap (`Alt + Shift + ;`)

| Key | Action |
|---|---|
| `g` | Toggle floating |
| `f` | Fullscreen (maximised, keeps bar) |
| `t` | Toggle pseudo-tile |
| `m` | True fullscreen |
| `Escape / Enter` | Exit |

### Workspaces

| Binding | Action |
|---|---|
| `Alt + 1–0` | Switch to workspace |
| `Alt + Shift + 1–0` | Move window to workspace |
| `Alt + mouse scroll` | Previous / next workspace |
| `Alt + S` | Toggle scratchpad (`special:magic`) |
| `Alt + Shift + S` | Move window to scratchpad |

### Apps & system

| Binding | Action |
|---|---|
| `Alt + Return` | kitty terminal |
| `Alt + Space` | rofi launcher |
| `Alt + D` | wofi drun launcher |
| `Alt + V` | clipse clipboard (kitty popup) |
| `Alt + Tab` | hyprswitch window switcher |
| `Ctrl + Shift + Escape` | Exit Hyprland |

### Screenshots & recording

| Binding | Action |
|---|---|
| `Super + Ctrl + Shift + 4` | Screenshot region (hyprshot → `~/Pictures/Screenshots`) |
| `Super + Ctrl + Shift + R` | Record focused monitor (wf-recorder → `~/Videos/Recordings`) |
| `Super + Ctrl + Shift + 3` | Record selected region |
| `Super + Ctrl + Shift + E` | Stop recording |

### Media keys

Volume, brightness, and media controls are mapped to the standard XF86 keys. Media playback uses `playerctl`.

---

## Deployment

Copy all subdirectories to `~/.config/`:

```bash
cp -r hypr    ~/.config/hypr
cp -r ags     ~/.config/ags
cp -r rofi    ~/.config/rofi
cp -r clipse  ~/.config/clipse
cp -r nwg-dock-hyprland ~/.config/nwg-dock-hyprland
```

Then log into a Hyprland session. On first boot the workspace-to-monitor mapping may land on the wrong monitors — this corrects itself automatically after the 3-second `hyprctl reload` in exec-once.

### Screen lock

`hyprlock` is configured with a gradient input field matching the Hyprland border colours. It is not wired to a keybinding by default — add one or use `swayidle` / `hypridle` if you want auto-lock.

### Wallpaper

`swaybg` is used (not hyprpaper, despite `hyprpaper.conf` being present). The wallpaper path is hardcoded in `hyprland.conf`:

```
exec-once = swaybg -i ~/Pictures/github_coding_images/hyprland_wallpaper_2.png -m fill
```

Change the path there to swap wallpapers globally. `hyprpaper.conf` and `set-wallpaper.sh` are kept for reference.

---

## Notes

- **Floating-first** — all windows open floating by default (`$floatingFirst = true`). Specific apps (kitty, Forge, etc.) have size rules in `hyprland.conf`.
- **Notifications** are handled by sambar's embedded AstalNotifd daemon. The `swaync/` config is kept for reference but swaync should not be in `exec-once`.
- **Keyboard layout** is set to `gb` in the input block.
- **Mouse acceleration** is disabled (`accel_profile = flat`).
- The **hyprbars** plugin adds macOS-style titlebars with close / minimise / maximise buttons.
