import "root:/widgets"
import "root:/services"
import "root:/config"
import Quickshell
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

        clip: true
        orientation: Qt.Vertical
        spacing: Appearance.spacing.smaller
        interactive: false

        delegate: Notification {}

        add: Transition {
            Anim {
                property: "x"
                from: NotifsConfig.sizes.width
                to: 0
                duration: Appearance.anim.durations.large
                easing.bezierCurve: Appearance.anim.curves.emphasizedDecel
            }
        }

        remove: Transition {
            id: remove

            Anim {
                property: "x"
                to: remove.ViewTransition.item.x > 0 ? NotifsConfig.sizes.width : -NotifsConfig.sizes.width
                duration: Appearance.anim.durations.large
                easing.bezierCurve: Appearance.anim.curves.emphasizedAccel
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
