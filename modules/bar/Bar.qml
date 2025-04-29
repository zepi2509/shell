import "root:/widgets"
import "root:/config"
import "components"
import "components/workspaces"
import Quickshell
import Quickshell.Wayland
import QtQuick
import QtQuick.Controls

Variants {
    model: Quickshell.screens

    WlrLayershell {
        id: win

        required property ShellScreen modelData

        screen: modelData
        namespace: "caelestia-bar"
        color: "transparent"

        width: BarConfig.vertical ? BarConfig.preset.totalHeight : -1
        height: BarConfig.vertical ? -1 : BarConfig.preset.totalHeight

        anchors.top: true
        anchors.left: true
        anchors.right: true

        // Connections {
        //     target: BarConfig

        //     function onVerticalChanged(): void {
        //         win.visible = false;
        //         if (BarConfig.vertical) {
        //             win.anchors.right = false;
        //             win.anchors.bottom = true;
        //         } else {
        //             win.anchors.bottom = false;
        //             win.anchors.right = true;
        //         }
        //         win.visible = true;
        //     }
        // }

        SwipeView {
            anchors.fill: parent
            currentIndex: 1

            Pills {}
        }
    }
}
