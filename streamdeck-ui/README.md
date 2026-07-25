# Stream Deck

Config, scripts, and device profile for streamdeck-ui, one subfolder per OS.

- `linux/` — see `linux/README.md` for install/deps
- `mac/` — not set up yet
- `windows/` — not set up yet

## Symlinks (Linux)

One thing worth knowing before you run `ln -s streamdeck-ui/linux ~/.config/streamdeck-ui`: **that won't work.** streamdeck-ui doesn't keep its actual button/profile config inside `~/.config/` — it lives directly at `~/.streamdeck_ui.json` in your home directory. `~/.config/streamdeck-ui/` only holds `streamdeck-ui.conf`, which is just Qt window-geometry state (not tracked here — it's regenerated automatically and isn't meaningful to version).

So this one needs per-file symlinks instead of a single directory symlink:

```bash
ln -s ~/coding/personal/odgy_dotfiles/streamdeck-ui/linux/configs/.streamdeck_ui.json ~/.streamdeck_ui.json
ln -s ~/coding/personal/odgy_dotfiles/streamdeck-ui/linux/scripts/app-mute-toggle ~/.local/bin/app-mute-toggle
ln -s ~/coding/personal/odgy_dotfiles/streamdeck-ui/linux/scripts/app-volume ~/.local/bin/app-volume
```

Same footgun as everywhere else applies: `~/.streamdeck_ui.json` and the two scripts under `~/.local/bin/` currently exist as real files, so move each aside before linking.
