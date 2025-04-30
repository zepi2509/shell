#!/bin/fish

set -l dbus 'quickshell.dbus.properties.warning = false'  # System tray dbus property errors
set -l hypr 'invalid nullptr parameter'  # Error that always pops up on Hyprland
set -l intercept '^qsintercept:'  # Line before binding loop
set -l loop 'Binding loop detected'  # Binding loops
set -l icons 'Searching custom icon paths is not yet supported'  # Error for system tray icons

qs -c caelestia --log-rules $dbus | grep -v -e $hypr -e $intercept -e $loop -e $icons
