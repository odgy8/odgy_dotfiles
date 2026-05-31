# sambar

A Hyprland status bar built with [AGS](https://github.com/Aylur/ags) (Astal/GJS).

## Features

- Workspace indicators (circular, active highlighted)
- Clock → opens Google Calendar popup (session persisted across reboots)
- Volume popup — sliders, per-app mixer, media player controls
- System tray popup — SNI tray icons (Slack, Discord, SurfShark, etc.)

## Dependencies

Install AGS first:

```bash
yay -S ags
```

Then the Astal libraries used by this config:

```bash
yay -S \
  libastal-git \
  libastal-4-git \
  libastal-hyprland-git \
  libastal-mpris-git \
  libastal-tray-git \
  libastal-wl-git
```

> **Note:** `libastal-tray-git` has a build dependency (`appmenu-glib-translator-git`) that
> fails if your `python3` is managed by **pyenv** instead of the system Python. Work around it with:
> ```bash
> PYENV_VERSION=system yay -S libastal-tray-git
> ```

Audio (volume/mixer) requires PipeWire + WirePlumber, which Hyprland users almost certainly already have:

```bash
sudo pacman -S pipewire pipewire-pulse wireplumber
```

The Google Calendar popup uses WebKit:

```bash
sudo pacman -S webkitgtk-6.0
```

## Running

```bash
ags run ~/.config/ags/sambar.tsx &
```

To kill it:

```bash
pkill -f "ags run"
# or
ags quit
```

## Autostart (Hyprland)

Add to `~/.config/hypr/hyprland.conf`:

```
exec-once = ags run ~/.config/ags/sambar.tsx
```

## Tray apps (Slack, Discord, etc.)

Tray icons only register when an app starts **after** the bar is already running. If you launch
tray apps via `exec-once` in your Hyprland config, make sure the bar's `exec-once` line comes first.

## Monitors

`sambar.tsx` creates bar/popup instances for monitors 0, 1, and 2. If you have fewer monitors the
extras are silently ignored. If you have more, duplicate the relevant blocks in `sambar.tsx`.

## Google Calendar

On first launch, click the clock to open the calendar popup and sign in. Your session is saved to
`~/.local/share/ags-calendar/` and will persist across reboots — you should only need to log in once.
