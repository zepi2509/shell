#!/bin/fish

set -l dbus 'quickshell.dbus.properties.warning = false'  # System tray dbus property errors
set -l hypr 'invalid nullptr parameter'  # Error that always pops up on Hyprland
set -l intercept '^qsintercept:.*(:[0-9]+){2}$'  # Empty qsintercept lines
set -l loop 'Binding loop detected'  # Binding loops
set -l process 'QProcess: Destroyed while process'  # Long running processes on reload
set -l asyncLoader 'items in the process of being created at engine destruction'  # Async loaders on reload

qs -c caelestia --log-rules $dbus | grep -vE -e $hypr -e $intercept -e $loop -e $process -e $asyncLoader
