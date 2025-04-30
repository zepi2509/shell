#!/bin/fish

set -l dbus 'quickshell.dbus.properties.warning = false'  # System tray dbus property errors
set -l hypr 'invalid nullptr parameter'  # Error that always pops up on Hyprland
set -l intercept '^qsintercept:.*(:[0-9]+){2}$'  # Empty qsintercept lines
set -l loop 'Binding loop detected'  # Binding loops
set -l icons 'Searching custom icon paths is not yet supported'  # Error for system tray icons
set -l process 'QProcess: Destroyed while process'

qs -c caelestia --log-rules $dbus | grep -vE -e $hypr -e $intercept -e $loop -e $icons -e $process
