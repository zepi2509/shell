pragma ComponentBehavior: Bound

import "root:/widgets"
import "root:/config"
import "components"
import "components/workspaces"
import Quickshell
import Quickshell.Wayland
import QtQuick
import QtQuick.Controls

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

    width: get(-1, BarConfig.sizes.height + BarConfig.sizes.floatingGap)
    height: get(BarConfig.sizes.height + BarConfig.sizes.floatingGap, -1)

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
            anchors.leftMargin: root.get(Appearance.padding.smaller, 0)
            anchors.top: root.get(undefined, osIcon.bottom)
            anchors.topMargin: root.get(0, Appearance.padding.smaller)

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
        anchors.right: parent.right

        Clock {
            vertical: BarConfig.vertical

            anchors.horizontalCenter: root.get(undefined, parent.horizontalCenter)
            anchors.verticalCenter: root.get(parent.verticalCenter, undefined)
        }
    }

    component Pill: PaddedRect {
        id: pill

        color: Appearance.alpha(Appearance.colours.base, false)
        radius: Appearance.rounding.full
        padding: BarConfig.vertical ? [Appearance.padding.large, 0] : [0, Appearance.padding.large]

        anchors.top: parent.top
        anchors.bottom: parent.bottom

        state: BarConfig.vertical ? "vertical" : ""
        states: State {
            name: "vertical"

            AnchorChanges {
                target: pill
                anchors.top: undefined
                anchors.bottom: undefined
                anchors.left: parent.left
                anchors.right: parent.right
            }
        }

        transitions: Transition {
            AnchorAnimation {
                duration: Appearance.anim.durations.normal
                easing.type: Easing.BezierSpline
                easing.bezierCurve: Appearance.anim.curves.emphasized
            }
        }
    }
}
