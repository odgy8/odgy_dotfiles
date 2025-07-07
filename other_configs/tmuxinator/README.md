# Tmuxinator Setup

## Install 

**Arch**
```sh 
yay -S tmuxinator
```

**Mac**
```zsh 
brew install tmuxinator
```

**Ubuntu**
```sh 
sudo apt install tmuxinator
```

**Windows**
```powershell
choco install tmuxinator
```

## Setup

Add this to your shell config file:

**For bash** (`.bashrc`):
```bash
if command -v tmuxinator &> /dev/null; then
    source <(tmuxinator completion bash)
fi

# Optional: Create a shorter alias
alias mux="tmuxinator"
```

**For zsh** (`.zshrc`):
```zsh
if command -v tmuxinator &> /dev/null; then
    source <(tmuxinator completion zsh)
fi

# Optional: Create a shorter alias  
alias mux="tmuxinator"
```

## Usage

```sh
# Create a new project config
tmuxinator new work

# Start a session
tmuxinator work
# or 
mux work

# List all projects
tmuxinator list

# Edit a project
tmuxinator edit work
```

## Example Config File

```yaml 
# ~/.config/tmuxinator/work.yml
name: work
root: ~/coding/work

# Optional: Commands to run before starting the session
# pre_window: source ~/.env

# Optional: Commands to run when starting the session
# pre: docker-compose up -d

# Optional: Commands to run when stopping the session  
# post: docker-compose down

windows:
  - frontend:
      root: ~/coding/work/frontend
      panes:
        - nvim
        
  - backend:
      root: ~/coding/work/backend
      panes:
        - nvim
        
  - runners:
      root: ~/coding/work
      # To get your layout string below, enter tmux, set up your layout and then run the "get layout string" command defined below
      layout: "6bb4,274x68,0,0{137x68,0,0[137x22,0,0,0,137x22,0,23,1,137x22,0,46,2],136x68,138,0[136x33,138,0,3,136x34,138,34,4]}"
      panes:
        - runner 1:
            - echo "Runner 1 started"
            - # Add your runner 1 commands here
        - runner 2:
            - echo "Runner 2 started"  
            - # Add your runner 2 commands here
        - runner 3:
            - echo "Runner 3 started"
            - # Add your runner 3 commands here
        - docker runner:
            - echo "Docker runner started"
            - # docker-compose up specific-service
        - other runner:
            - echo "Other runner started"
            - # Add your other runner commands here
```

## Get Layout String Command

```sh 
tmux display-message -p '#{window_layout}'
```

## Creating Custom Layouts

1. Start tmux and manually create your desired layout using splits
2. Run the layout string command above to capture it
3. Paste the output into your tmuxinator config's `layout:` field
4. The panes in your config will fill the layout in order
