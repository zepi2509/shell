import "root:/services"
import Quickshell
import QtQuick

MouseArea {
    required property ShellScreen screen

    anchors.fill: parent
    hoverEnabled: true
    onPositionChanged: event => Drawers.setPosForScreen(screen, event.x, event.y)
}
