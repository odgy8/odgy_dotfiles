# Neovim Config

This is the Neovim configuration from my [odgy_dotfiles](https://github.com/odgy8/odgy_dotfiles) repo. It lives at `nvim/` there and is symlinked into `~/.config/nvim`.

## Prerequisites

Before installing this custom configuration, make sure you have:

1. Neovim (v0.8.0 or later recommended)
2. Git
3. A terminal with a Nerd Font installed (for icons)
4. Required dependencies:
   - fzf (fuzzy finder)
   - ripgrep (faster grep)
   - xclip or wl-clipboard (clipboard support)
   - python3
   - golang (see golang installation section below)
   - npm (Node.js package manager)

## Installation Steps

### 1. Install Dependencies

#### Linux
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install neovim fzf ripgrep python3 npm gcc clang
# For clipboard support
sudo apt install xclip # X11
# OR
sudo apt install wl-clipboard # Wayland

# Arch Linux
sudo pacman -S neovim fzf ripgrep python npm
# For clipboard support
sudo pacman -S xclip # X11
# OR
sudo pacman -S wl-clipboard # Wayland

# Fedora
sudo dnf install neovim fzf ripgrep python3 npm
# For clipboard support
sudo dnf install xclip # X11
# OR
sudo dnf install wl-clipboard # Wayland
```

#### macOS
```zsh
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install dependencies
brew install neovim fzf ripgrep python node gcc
# macOS has clipboard support built-in

# Install a Nerd Font (optional but recommended for icons)
brew tap homebrew/cask-fonts
brew install --cask font-hack-nerd-font

# Add fzf to your shell (for zsh)
$(brew --prefix)/opt/fzf/install
```

#### Windows
```powershell
# Using Chocolatey
choco install neovim fzf ripgrep python nodejs

# Using Scoop
scoop install neovim fzf ripgrep python nodejs
# Windows has clipboard support built-in
```

### 1.1 Install Golang

For Golang installation, it's recommended to follow the official installation instructions from the [Go website](https://golang.org/doc/install) as package managers may not provide the latest version.

### 2. Backup Existing Configuration (if any)

```bash
# Linux/macOS
mv ~/.config/nvim ~/.config/nvim.bak

# Windows
ren %LOCALAPPDATA%\nvim nvim.bak
```

### 3. Clone the dotfiles repo and symlink `nvim/`

```bash
# Linux/macOS
git clone git@github.com:odgy8/odgy_dotfiles.git ~/coding/personal/odgy_dotfiles
ln -s ~/coding/personal/odgy_dotfiles/nvim ~/.config/nvim

# Windows
git clone git@github.com:odgy8/odgy_dotfiles.git %USERPROFILE%\coding\personal\odgy_dotfiles
mklink /D %LOCALAPPDATA%\nvim %USERPROFILE%\coding\personal\odgy_dotfiles\nvim
```

### 4. Install Plugin Manager (if not included)

The first time you open Neovim, it should automatically install any required plugin managers and plugins.

### 5. Launch Neovim

```bash
nvim
```

The first launch may take a moment as plugins are installed automatically.

### 6. Complete Telescope FZF Native Setup

After the initial plugin installation completes, exit Neovim and run:

```bash
# Linux/macOS/Windows
cd ~/.local/share/nvim/lazy/telescope-fzf-native.nvim/ 
make
```

## Troubleshooting

- If you encounter any issues, check the repository's README or issues page for common problems and solutions.
- Make sure all dependencies are properly installed.
- For plugin-related issues, try running `:checkhealth` in Neovim.

## Updating

To update the configuration, pull the latest changes in the dotfiles repo itself (not through the `~/.config/nvim` symlink):

```bash
cd ~/coding/personal/odgy_dotfiles
git pull
```

Then restart Neovim to apply any updates.

