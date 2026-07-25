# tmux

Lives at `tmux/` in [odgy_dotfiles](../), symlinked to `~/.config/tmux`.

## Plugins (TPM)

`plugins/` is gitignored on purpose — TPM clones each plugin declared via `set -g @plugin '...'` in `tmux.conf` into `~/.config/tmux/plugins/<name>/` at runtime, so those are third-party repos, not config to track here.

After symlinking `tmux/` on a new machine, open tmux and press `prefix + I` (capital i) once to have TPM install the plugins. Nothing will load from `tmux-resurrect`/`tmux-continuum`/etc until you do this.
