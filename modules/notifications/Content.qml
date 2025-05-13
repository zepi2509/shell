import "root:/widgets"
import "root:/services"
import "root:/config"
import Quickshell
import Quickshell.Widgets
import QtQuick

Item {
    id: root

    readonly property int padding: Appearance.padding.large

    anchors.bottom: parent.bottom
    anchors.right: parent.right

    implicitWidth: NotifsConfig.sizes.width + root.padding * 2
    implicitHeight: list.height + root.padding * 2

    ListView {
        id: list

        model: ScriptModel {
            values: [...Notifs.popups].reverse()
        }

        anchors.top: parent.top
        anchors.left: parent.left
        anchors.right: parent.right
        anchors.margins: root.padding

        implicitHeight: {
            let height = (count - 1) * spacing;
            for (let i = 0; i < count; i++)
                height += itemAtIndex(i).nonAnimHeight;
            return Math.max(61, height);
        }

        orientation: Qt.Vertical
        spacing: Appearance.spacing.smaller
        interactive: false

        delegate: ClippingRectangle {
            id: wrapper

            required property Notifs.Notif modelData
            readonly property alias nonAnimHeight: notif.nonAnimHeight

            color: "transparent"
            radius: notif.radius
            implicitWidth: notif.width
            implicitHeight: notif.height

            Notification {
                id: notif

                modelData: wrapper.modelData
            }
        }

        move: Transition {
            Anim {
                property: "y"
            }
        }

        displaced: Transition {
            Anim {
                property: "y"
            }
        }

        Behavior on implicitHeight {
            Anim {}
        }
    }

    component Anim: NumberAnimation {
        duration: Appearance.anim.durations.normal
        easing.type: Easing.BezierSpline
        easing.bezierCurve: Appearance.anim.curves.standard
    }
}
