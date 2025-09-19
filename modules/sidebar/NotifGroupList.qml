pragma ComponentBehavior: Bound

import qs.components
import qs.services
import qs.config
import Quickshell
import QtQuick
import QtQuick.Layouts

Item {
    id: root

    required property Props props
    required property list<var> notifs
    required property bool expanded

    readonly property int spacing: Math.round(Appearance.spacing.small / 2)
    property bool flag

    signal requestToggleExpand(expand: bool)

    Layout.fillWidth: true
    implicitHeight: {
        const item = repeater.itemAt(repeater.count - 1);
        return item ? item.y + item.implicitHeight : 0;
    }

    Repeater {
        id: repeater

        model: ScriptModel {
            values: root.expanded ? root.notifs : root.notifs.slice(0, Config.notifs.groupPreviewNum)
            onValuesChanged: root.flagChanged()
        }

        MouseArea {
            id: notif

            required property int index
            required property Notifs.Notif modelData

            readonly property alias nonAnimHeight: notifInner.nonAnimHeight
            property int startY

            y: {
                root.flag; // Force update
                let y = 0;
                for (let i = 0; i < index; i++) {
                    const item = repeater.itemAt(i);
                    if (!item.modelData.closed)
                        y += item.nonAnimHeight + root.spacing;
                }
                return y;
            }

            implicitWidth: root.width
            implicitHeight: notifInner.implicitHeight

            hoverEnabled: true
            cursorShape: pressed ? Qt.ClosedHandCursor : undefined
            acceptedButtons: Qt.LeftButton | Qt.RightButton | Qt.MiddleButton
            preventStealing: true

            drag.target: this
            drag.axis: Drag.XAxis

            onPressed: event => {
                startY = event.y;
                if (event.button === Qt.RightButton)
                    root.requestToggleExpand(!root.expanded);
                else if (event.button === Qt.MiddleButton)
                    modelData.close();
            }
            onPositionChanged: event => {
                if (pressed) {
                    const diffY = event.y - startY;
                    if (Math.abs(diffY) > Config.notifs.expandThreshold)
                        root.requestToggleExpand(diffY > 0);
                }
            }
            onReleased: event => {
                if (Math.abs(x) < width * Config.notifs.clearThreshold)
                    x = 0;
                else
                    modelData.close();
            }

            Component.onCompleted: modelData.lock(this)
            Component.onDestruction: modelData.unlock(this)

            ParallelAnimation {
                running: true

                Anim {
                    target: notif
                    property: "opacity"
                    from: 0
                    to: 1
                }
                Anim {
                    target: notif
                    property: "scale"
                    from: 0.7
                    to: 1
                }
            }

            ParallelAnimation {
                running: notif.modelData.closed
                onFinished: notif.modelData.unlock(notif)

                Anim {
                    target: notif
                    property: "opacity"
                    to: 0
                }
                Anim {
                    target: notif
                    property: "x"
                    to: notif.x >= 0 ? notif.width : -notif.width
                }
            }

            Notif {
                id: notifInner

                anchors.fill: parent
                modelData: notif.modelData
                props: root.props
                expanded: root.expanded
            }

            Behavior on x {
                Anim {
                    duration: Appearance.anim.durations.expressiveDefaultSpatial
                    easing.bezierCurve: Appearance.anim.curves.expressiveDefaultSpatial
                }
            }

            Behavior on y {
                Anim {
                    duration: Appearance.anim.durations.expressiveDefaultSpatial
                    easing.bezierCurve: Appearance.anim.curves.expressiveDefaultSpatial
                }
            }
        }
    }
}
