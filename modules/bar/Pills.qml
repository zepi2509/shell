pragma ComponentBehavior: Bound

import "root:/widgets"
import "root:/config"
import "components"
import "components/workspaces"
import Quickshell.Wayland
import QtQuick

Item {
    Item {
        id: root

        function get(horiz, vert) {
            return BarConfig.vertical ? vert : horiz;
        }

        anchors.fill: parent
        anchors.leftMargin: get(BarConfig.sizes.floatingGapLarge, BarConfig.sizes.floatingGap)
        anchors.topMargin: get(BarConfig.sizes.floatingGap, BarConfig.sizes.floatingGapLarge)
        anchors.rightMargin: get(BarConfig.sizes.floatingGapLarge, 0)
        anchors.bottomMargin: get(0, BarConfig.sizes.floatingGapLarge)

        Pill {
            anchors.left: parent.left

            OsIcon {
                id: osIcon

                anchors.horizontalCenter: root.get(undefined, parent.horizontalCenter)
                anchors.verticalCenter: root.get(parent.verticalCenter, undefined)
            }

            Workspaces {
                vertical: BarConfig.vertical

                anchors.left: root.get(osIcon.right, undefined)
                anchors.leftMargin: root.get(Appearance.padding.large, 0)
                anchors.top: root.get(undefined, osIcon.bottom)
                anchors.topMargin: root.get(0, Appearance.padding.large)

                anchors.horizontalCenter: root.get(undefined, parent.horizontalCenter)
                anchors.verticalCenter: root.get(parent.verticalCenter, undefined)
            }
        }

        Pill {
            anchors.horizontalCenter: root.get(parent.horizontalCenter, undefined)
            anchors.verticalCenter: root.get(undefined, parent.verticalCenter)

            ActiveWindow {
                vertical: BarConfig.vertical

                anchors.horizontalCenter: root.get(undefined, parent.horizontalCenter)
                anchors.verticalCenter: root.get(parent.verticalCenter, undefined)
            }
        }

        Pill {
            anchors.right: rightPill.left
            anchors.rightMargin: Appearance.padding.normal

            Tray {
                vertical: BarConfig.vertical

                anchors.horizontalCenter: root.get(undefined, parent.horizontalCenter)
                anchors.verticalCenter: root.get(parent.verticalCenter, undefined)
            }
        }

        Pill {
            id: rightPill

            anchors.right: parent.right

            Clock {
                id: clock

                vertical: BarConfig.vertical

                anchors.horizontalCenter: root.get(undefined, parent.horizontalCenter)
                anchors.verticalCenter: root.get(parent.verticalCenter, undefined)
            }

            StatusIcons {
                anchors.left: root.get(clock.right, undefined)
                anchors.leftMargin: root.get(Appearance.padding.large, 0)
                anchors.top: root.get(undefined, clock.bottom)
                anchors.topMargin: root.get(0, Appearance.padding.large)

                anchors.horizontalCenter: root.get(undefined, parent.horizontalCenter)
                anchors.verticalCenter: root.get(parent.verticalCenter, undefined)
            }
        }
    }

    component Pill: PaddedRect {
        id: pill

        color: Appearance.alpha(Appearance.colours.base, false)
        radius: Appearance.rounding.full
        padding: BarConfig.vertical ? [Appearance.padding.large, 0] : [0, Appearance.padding.large]

        width: BarConfig.vertical ? BarConfig.sizes.height : implicitWidth
        height: BarConfig.vertical ? implicitHeight : BarConfig.sizes.height
    }
}
