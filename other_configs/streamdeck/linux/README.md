# Stream Deck Linux Setup

Configuration and scripts for streamdeck-linux-gui on Arch Linux.

## Installation

### Prerequisites
- Python 3.11 (installed via pyenv)
- pipx
- hidapi, qt6-base

### Install streamdeck-linux-gui

The package requires Python < 3.13, so we need to force pipx to use Python 3.11:
[github package link](https://github.com/streamdeck-linux-gui/streamdeck-linux-gui/blob/main/docs/installation/arch.md)

```bash
# Set pyenv to use Python 3.11
pyenv global 3.11

# Install with pipx, forcing it to use pyenv's Python 3.11
pipx install streamdeck-linux-gui --python ~/.pyenv/shims/python
```

### Udev Rules (Required for device access)

```bash
sudo wget https://raw.githubusercontent.com/streamdeck-linux-gui/streamdeck-linux-gui/main/udev/60-streamdeck.rules -O /etc/udev/rules.d/60-streamdeck.rules
sudo udevadm control --reload-rules
sudo udevadm trigger
```

## Autostart

Add to `~/.config/hypr/hyprland.conf`:

```
exec-once = streamdeck --no-ui
```

This runs the daemon in the background without opening the GUI. To configure buttons, run `streamdeck` manually.

## Icons

### Font Awesome Icons

Icons are stored in `~/Pictures/icons/fontawesome/`:

```bash
git clone https://github.com/FortAwesome/Font-Awesome.git ~/Pictures/icons/fontawesome
```

Stream Deck uses 72x72 pixel icons by default. Font Awesome SVGs can be used directly or converted to PNG.

### System Icons

- `/usr/share/pixmaps/` - Application icons
- `/usr/share/icons/breeze/` - Breeze theme icons
- `/usr/share/icons/Papirus/` - Papirus icon theme (install: `sudo pacman -S papirus-icon-theme`)

## Custom Scripts

Scripts are located in `~/.local/bin/` and copied to `./scripts/` for backup.

### app-volume

Control volume for specific applications by name.

```bash
app-volume <app-name> <+5%|-5%>
```

Examples:
- `app-volume Brave +5%` - Increase Brave browser volume
- `app-volume steam_app_12345 -5%` - Decrease game volume

### app-mute-toggle

Toggle mute for specific applications. Preserves volume level when unmuting.

```bash
app-mute-toggle <app-name>
```

Examples:
- `app-mute-toggle Brave` - Toggle Brave mute/unmute

## Audio Controls

### Default Sink (Speakers/Headphones)

- Volume Up: `pactl set-sink-volume @DEFAULT_SINK@ +5%`
- Volume Down: `pactl set-sink-volume @DEFAULT_SINK@ -5%`
- Mute Toggle: `pactl set-sink-mute @DEFAULT_SINK@ toggle`

### Specific Output Devices

Get device list:
```bash
pactl list sinks short
```

Switch default output:
```bash
pactl set-default-sink <device-name>
```

### Microphone Controls

- Mute Toggle: `pactl set-source-mute @DEFAULT_SOURCE@ toggle`
- Volume Up: `pactl set-source-volume @DEFAULT_SOURCE@ +5%`
- Volume Down: `pactl set-source-volume @DEFAULT_SOURCE@ -5%`

### Media Controls (playerctl)

- Play/Pause: `playerctl play-pause`
- Next: `playerctl next`
- Previous: `playerctl previous`
- Stop: `playerctl stop`

Target specific player:
```bash
playerctl -p spotify play-pause
playerctl -p firefox play-pause
```

## Finding Application Names

To find the correct application name for app-volume/app-mute-toggle:

```bash
# List all current audio streams
pactl list sink-inputs | grep "application.name"
```

Start the application with audio playing, then run the above command to see its name.

## Configuration Files

- Main config: `~/.streamdeck_ui.json`
- Backup location: `./configs/.streamdeck_ui.json`

## Troubleshooting

### Stream Deck not detected
- Check udev rules are installed
- Verify device permissions: `ls -l /dev/hidraw*`
- Restart udev: `sudo udevadm control --reload-rules && sudo udevadm trigger`

### Buttons not working
- Ensure streamdeck daemon is running: `ps aux | grep streamdeck`
- Check logs for errors
- Verify script permissions: `chmod +x ~/.local/bin/app-*`

### Audio commands not working
- Verify PipeWire is running: `systemctl --user status pipewire`
- Check sink/source names: `pactl list sinks short` or `pactl list sources short`

## Resources

- [streamdeck-linux-gui GitHub](https://github.com/streamdeck-linux-gui/streamdeck-linux-gui)
- [Arch Linux Installation Guide](https://github.com/streamdeck-linux-gui/streamdeck-linux-gui/blob/main/docs/installation/arch.md)
- [Font Awesome Icons](https://fontawesome.com/icons)
