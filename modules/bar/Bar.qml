import "root:/widgets"
import "root:/config"
import Quickshell
import QtQuick

Variants {
    model: Quickshell.screens

    StyledWindow {
        id: win

        required property ShellScreen modelData

        screen: modelData
        name: "bar"

        implicitWidth: content.implicitWidth

        anchors.top: true
        anchors.bottom: true
        anchors.left: true

        Content {
            id: content

            screen: win.modelData
        }
    }
}
