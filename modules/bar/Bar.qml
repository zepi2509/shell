import "root:/widgets"
import "root:/config"
import Quickshell
import Quickshell.Wayland
import QtQuick

Variants {
    model: Quickshell.screens

    WlrLayershell {
        id: win

        required property ShellScreen modelData
        readonly property bool vertical: BarConfig.vertical

        screen: modelData
        namespace: "caelestia-bar"
        // color: Appearance.alpha(Appearance.colours.base, false)
        color: "transparent"

        anchors {
            top: true
            left: true
            right: !vertical
            bottom: vertical
        }

        width: contents.implicitWidth
        height: contents.implicitHeight

        Box {
            id: contents

            padding: [Appearance.padding.normal, Appearance.padding.large, 0, Appearance.padding.large]

            BoxLayout {
                vertical: win.vertical
                spacing: Appearance.spacing.larger
                padding: [Appearance.padding.smaller, Appearance.padding.large]
                color: Appearance.alpha(Appearance.colours.base, false)
                radius: Appearance.rounding.small

                OsIcon {}

                Clock {
                    vertical: win.vertical
                }

                ActiveWindow {
                    vertical: win.vertical
                }

                // Workspaces {
                //     vertical: win.vertical
                // }
            }
        }
    }
}
