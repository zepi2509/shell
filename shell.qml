import "modules/bar"
import "config"
import Quickshell
import QtQuick.Controls.Material

ShellRoot {
    Material.accent: Appearance.colours.primary
    Material.primary: Appearance.colours.secondary
    Material.foreground: Appearance.colours.text
    Material.background: Appearance.colours.base

    Bar {}
}
