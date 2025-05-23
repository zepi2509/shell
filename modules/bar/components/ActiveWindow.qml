pragma ComponentBehavior: Bound

import "root:/widgets"
import "root:/services"
import "root:/utils"
import "root:/config"
import QtQuick

Item {
    id: root

    readonly property bool vertical: parent?.vertical ?? false
    property color colour: Colours.palette.pink

    implicitWidth: child.implicitWidth
    implicitHeight: child.implicitHeight

    StyledRect {
        id: child

        anchors.centerIn: parent

        clip: true

        MaterialIcon {
            id: icon

            animate: true
            text: Icons.getAppCategoryIcon(Hyprland.activeClient?.wmClass, "desktop_windows")
            color: root.colour

            anchors.horizontalCenter: root.vertical ? parent.horizontalCenter : undefined
        }

        AnchorText {
            id: text

            prevAnchor: icon

            text: metrics.elidedText
            font.pointSize: metrics.font.pointSize
            font.family: metrics.font.family
            color: root.colour

            transform: Rotation {
                angle: vertical ? 90 : 0
                origin.x: text.implicitHeight / 2
                origin.y: text.implicitHeight / 2
            }

            width: vertical ? implicitHeight : implicitWidth
            height: vertical ? implicitWidth : implicitHeight
        }

        TextMetrics {
            id: metrics

            text: Hyprland.activeClient?.title ?? qsTr("Desktop")
            font.pointSize: Appearance.font.size.smaller
            font.family: Appearance.font.family.mono
            elide: Qt.ElideRight
            elideWidth: root.vertical ? root.height - icon.height : root.width - icon.width
        }

        Behavior on implicitWidth {
            NumberAnimation {
                duration: Appearance.anim.durations.normal
                easing.type: Easing.BezierSpline
                easing.bezierCurve: Appearance.anim.curves.emphasized
            }
        }

        Behavior on implicitHeight {
            NumberAnimation {
                duration: Appearance.anim.durations.normal
                easing.type: Easing.BezierSpline
                easing.bezierCurve: Appearance.anim.curves.emphasized
            }
        }
    }
}
