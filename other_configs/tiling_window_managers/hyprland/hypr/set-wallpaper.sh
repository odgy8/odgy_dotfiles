#!/bin/bash
# Wallpaper setup script - workaround for hyprpaper config loading bug

# Wait for hyprpaper to initialize
sleep 2

# Set wallpapers for all monitors
hyprctl hyprpaper wallpaper "HDMI-A-2,/home/sam/Pictures/github_coding_images/Owl.png"
hyprctl hyprpaper wallpaper "DP-1,/home/sam/Pictures/github_coding_images/Owl.png"
hyprctl hyprpaper wallpaper "DP-2,/home/sam/Pictures/github_coding_images/Owl.png"
