import "modules/bar"
import "modules/launcher"
import "config"
import Quickshell
import QtQuick.Controls.Material

ShellRoot {
    Material.accent: Appearance.colours.m3primary
    Material.primary: Appearance.colours.m3secondary
    Material.foreground: Appearance.colours.m3onBackground
    Material.background: Appearance.colours.m3background

    Bar {}
    Launcher {}
}
