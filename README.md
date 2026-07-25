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
| `alacritty/` | `~/.config/alacritty` | |
| `wezterm/` | `~/.config/wezterm` | |
| `windows_terminal_config/` | — | Windows-only, different machine/path — reference only |
| `tmux/` | `~/.config/tmux` | See `tmux/README.md` — plugins are gitignored, TPM needs a manual `prefix + I` after linking |
| `tmuxinator/` | `~/.config/tmuxinator` | See `tmuxinator/README.md` |
| `aerospace/` | `~/.config/aerospace` (macOS) | Tiling WM for macOS — check current AeroSpace docs for the exact expected path |
| `vial/` | — | Not symlinked — `layout.vil` is loaded manually through the Vial app when flashing the keyboard |
| `streamdeck-ui/linux/` | — | Not a directory symlink — see `streamdeck-ui/README.md`; config/scripts are individually placed at `~/.streamdeck_ui.json` and `~/.local/bin/` |

## Adding a new machine

1. Clone this repo to `~/coding/personal/odgy_dotfiles`.
2. Symlink whichever tool directories that machine needs, per the table above.
3. Follow the tool-specific README for anything beyond the symlink (dependencies, autostart, etc).

## Symlink gotchas

- **`ln -s TARGET LINK_NAME`** — the real thing first, the symlink location second. Easy to get backwards.
- **The destination is usually already a real directory** (an existing `~/.config/<name>` from before this repo existed). `ln -s` will not replace it — it silently creates the link *inside* it instead (e.g. `~/.config/kitty/kitty`) if you don't move it out of the way first:
  ```bash
  mv ~/.config/kitty ~/.config/kitty.bak   # or rm it once you've confirmed the repo copy matches
  ln -s ~/coding/personal/odgy_dotfiles/kitty ~/.config/kitty
  ```
- **Use absolute paths on both sides.** `~/...` is fine since the shell expands it before `ln` sees it, but a relative path resolves relative to where the *link* lives, not your shell's cwd — easy to end up with a dangling link.
- **Verify after linking**: `ls -la ~/.config/kitty` (shows the `-> target` arrow) or `readlink -f ~/.config/kitty` (prints the resolved real path).
- **To undo**: `rm ~/.config/kitty` (no `-r`, no trailing slash) removes just the link — the real files in the repo are untouched. This holds even for `rm -rf`: `rm` never follows a symlink to recurse into what it points to, so it only ever removes the link itself. That protection disappears the moment you `cd` into the symlinked directory and run something destructive from inside — at that point you're operating on the real files, not the link.
