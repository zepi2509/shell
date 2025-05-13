pragma ComponentBehavior: Bound

import "root:/widgets"
import "root:/services"
import "root:/config"
import Quickshell
import QtQuick

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

                regions: panels.children.map(c => regionComp.createObject(this, {
                    x: c.x,
                    y: c.y,
                    width: c.width,
                    height: c.height
                }))
            }

            anchors.top: true
            anchors.bottom: true
            anchors.left: true
            anchors.right: true

            Component {
                id: regionComp

                Region {
                    intersection: Intersection.Subtract
                }
            }

            Item {
                id: background

                anchors.fill: parent
                visible: false

                Border {}

                Backgrounds {
                    panels: panels
                }
            }

            LayerShadow {
                source: background
            }

            PersistentProperties {
                id: visibilities

                property bool launcher
                property bool osd
                property bool notifications: Notifs.popups.length > 0
                property bool session
            }

            Interactions {
                screen: scope.modelData
                visibilities: visibilities

                Panels {
                    id: panels

                    screen: scope.modelData
                    visibilities: visibilities
                }
            }
        }
    }
}
