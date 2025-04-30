import "root:/widgets"
import Quickshell.Services.SystemTray
import QtQuick

StyledRect {
    animate: true
    clip: true
    visible: width > 0 && height > 0 // To avoid warnings about being visible with no size

    BoxLayout {
        Repeater {
            model: SystemTray.items

            TrayItem {}
        }
    }
}
