import "root:/widgets"
import "root:/config"
import Quickshell

Variants {
    model: Quickshell.screens

    Scope {
        id: scope

        required property ShellScreen modelData

        Exclusions {
            screen: scope.modelData
        }

        StyledWindow {
            id: win

            screen: scope.modelData
            name: "drawers"
            exclusionMode: ExclusionMode.Ignore

            mask: Region {
                x: BorderConfig.thickness
                y: BorderConfig.thickness
                width: scope.modelData.width - BorderConfig.thickness * 2
                height: scope.modelData.height - BorderConfig.thickness * 2
                intersection: Intersection.Xor
            }

            anchors.top: true
            anchors.bottom: true
            anchors.left: true
            anchors.right: true

            Border {
                id: border

                visible: false
            }

            LayerShadow {
                source: border
            }

            Interactions {
                screen: scope.modelData
            }
        }
    }
}
