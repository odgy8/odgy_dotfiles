# odgy_dotfiles

Personal config for my machines: Neovim, Hyprland desktop (+ status bar, launcher, dock, clipboard manager), terminals, tmux, a Stream Deck, and a Vial keyboard layout.

Nothing here is installed by a script on purpose — each directory is symlinked into place by hand, one at a time, on whichever machine needs it. See each directory's own README for setup/dependencies where one exists.

## Layout

Each top-level directory holds the config for one tool. Most map straight onto `~/.config/<name>`, so deploying one is a single `ln -s`:

```bash
ln -s ~/coding/personal/odgy_dotfiles/<dir> ~/.config/<dir>
```

| Directory | Target | Notes |
|---|---|---|
| `nvim/` | `~/.config/nvim` | See `nvim/README.md` for install steps and dependencies |
| `hypr/` | `~/.config/hypr` | Core Hyprland config — see `hypr/README.md`, which also covers `ags/`, `rofi/`, `nwg-dock-hyprland/`, `clipse/` |
| `ags/` | `~/.config/ags` | "sambar" status bar — see `ags/README.md` |
| `rofi/` | `~/.config/rofi` | App launcher themes |
| `nwg-dock-hyprland/` | `~/.config/nwg-dock-hyprland` | Dock, one instance per monitor |
| `clipse/` | `~/.config/clipse` | Clipboard manager |
| `waybar/` | `~/.config/waybar` | Legacy bar, kept for reference — not currently symlinked |
| `swaync/` | `~/.config/swaync` | Legacy notification centre, kept for reference — not currently symlinked |
| `kitty/` | `~/.config/kitty` | Includes `kitty_brown.conf` alt theme |
| `alacrity/` | `~/.config/alacritty` | |
| `wezterm/` | `~/.config/wezterm` | |
| `windows_terminal_config/` | — | Windows-only, different machine/path — reference only |
| `tmux/` | `~/.config/tmux` | `tmux.conf` looks for TPM at `~/.config/tmux/plugins/tpm`; plugins are gitignored |
| `tmuxinator/` | `~/.config/tmuxinator` | See `tmuxinator/README.md` |
| `aerospace/` | `~/.config/aerospace` (macOS) | Tiling WM for macOS — check current AeroSpace docs for the exact expected path |
| `vial/` | — | Not symlinked — `layout.vil` is loaded manually through the Vial app when flashing the keyboard |
| `streamdeck/linux/` | — | Not a directory symlink — see `streamdeck/linux/README.md`; config/scripts are individually placed at `~/.streamdeck_ui.json` and `~/.local/bin/` |

## Adding a new machine

1. Clone this repo to `~/coding/personal/odgy_dotfiles`.
2. Symlink whichever tool directories that machine needs, per the table above.
3. Follow the tool-specific README for anything beyond the symlink (dependencies, autostart, etc).
