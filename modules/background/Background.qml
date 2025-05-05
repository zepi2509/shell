import "root:/widgets"
import Quickshell
import Quickshell.Wayland

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
