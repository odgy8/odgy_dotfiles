# tmux

Lives at `tmux/` in [odgy_dotfiles](../), symlinked to `~/.config/tmux`.

## Plugins (TPM)

`plugins/` is gitignored on purpose — TPM clones each plugin declared via `set -g @plugin '...'` in `tmux.conf` into `~/.config/tmux/plugins/<name>/` at runtime, so those are third-party repos, not config to track here.

On a new machine, after symlinking `tmux/`, TPM itself isn't there yet either (it's inside the gitignored `plugins/` dir), so `prefix + I` won't do anything until TPM exists on disk:

```
git clone https://github.com/tmux-plugins/tpm ~/.config/tmux/plugins/tpm
```

Then start tmux (or `prefix + r` to reload if already running) so `tmux.conf`'s `run '~/.config/tmux/plugins/tpm/tpm'` line actually finds TPM and registers its bindings. Only then does `prefix + I` (capital i) exist to have TPM clone the rest of the plugins (`tmux-sensible`, `tmux-resurrect`, `tmux-continuum`).

Nothing will load from `tmux-resurrect`/`tmux-continuum`/etc until you've done both steps.
