import "root:/widgets"
import "root:/config"
import Quickshell.Services.SystemTray
import QtQuick

StyledRect {
    id: root

    property color colour: Appearance.colours.lavender

    animate: true
    clip: true
    visible: width > 0 && height > 0 // To avoid warnings about being visible with no size

    BoxLayout {
        Repeater {
            model: SystemTray.items

            TrayItem {
                colour: root.colour
            }
        }
    }
}
