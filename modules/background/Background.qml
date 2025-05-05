import "root:/widgets"
import "root:/config"
import Quickshell
import Quickshell.Wayland
import QtQuick
import QtQuick.Effects

Variants {
    model: Quickshell.screens

    Scope {
        id: scope

        required property ShellScreen modelData

        Border {
            screen: scope.modelData
        }

        StyledWindow {
            id: win

            screen: scope.modelData
            name: "background"
            exclusionMode: ExclusionMode.Ignore
            layer: WlrLayer.Background

            anchors.top: true
            anchors.bottom: true
            anchors.left: true
            anchors.right: true
        }
    }
}
