#!/bin/fish

set -l dbus 'quickshell.dbus.properties.warning = false'  # System tray dbus property errors
set -l text_input 'qt.qpa.wayland.textinput.warning = false'  # Text input focus when open window
set -l hypr 'invalid nullptr parameter'  # Error that always pops up on Hyprland
set -l intercept '^qsintercept:.*(:[0-9]+){2}$'  # Empty qsintercept lines
set -l loop 'Binding loop detected'  # Binding loops
set -l process 'QProcess: Destroyed while process'  # Long running processes on reload
set -l async_loader 'items in the process of being created at engine destruction'  # Async loaders on reload

qs -c caelestia --log-rules "$dbus;$text_input" | grep -vE -e $hypr -e $intercept -e $loop -e $process -e $async_loader
