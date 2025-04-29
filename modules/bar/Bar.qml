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

            // Item {
            Pills {
                id: content
            }
            // }
        }

        // Box {
        //     id: contents

        //     padding: [Appearance.padding.normal, Appearance.padding.large, 0, Appearance.padding.large]

        //     BoxLayout {
        //         vertical: win.vertical
        //         spacing: Appearance.spacing.larger
        //         padding: [0, Appearance.padding.large]
        //         color: Appearance.alpha(Appearance.colours.base, false)
        //         radius: Appearance.rounding.full

        //         OsIcon {}

        //         Workspaces {
        //             vertical: win.vertical
        //         }

        //         Clock {
        //             vertical: win.vertical
        //         }

        //         ActiveWindow {
        //             vertical: win.vertical
        //         }
        //     }
        // }
    }
}
