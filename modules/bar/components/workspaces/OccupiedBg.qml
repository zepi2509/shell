pragma ComponentBehavior: Bound

import "root:/widgets"
import "root:/config"
import Quickshell
import QtQuick

Item {
    id: root

    required property bool vertical
    required property list<Workspace> workspaces
    required property var occupied
    required property int groupOffset

    property list<var> pills: []

    onOccupiedChanged: {
        let count = 0;
        for (const [ws, occ] of Object.entries(occupied)) {
            if (ws > 0 && occ) {
                if (!occupied[ws - 1]) {
                    if (pills[count])
                        pills[count].start = ws;
                    else
                        pills.push(pillComp.createObject(root, {
                            start: ws
                        }));
                    count++;
                }
                if (!occupied[ws + 1])
                    pills[count - 1].end = ws;
            }
        }
        if (pills.length > count)
            pills.splice(count, pills.length - count);
    }

    anchors.fill: parent
    opacity: BarConfig.workspaces.occupiedBg ? 1 : 0
    z: -1

    Repeater {
        model: ScriptModel {
            values: root.pills.filter(p => p)
        }

        Rectangle {
            id: rect

            required property var modelData

            property Workspace start: root.workspaces[modelData.start - 1] ?? null
            property Workspace end: root.workspaces[modelData.end - 1] ?? null

            color: Appearance.alpha(Appearance.colours.m3surfaceContainerHigh, true)
            radius: Appearance.rounding.full

            x: start?.x ?? 0
            y: start?.y ?? 0
            width: root.vertical ? BarConfig.sizes.innerHeight : end?.x + end?.width - start?.x
            height: root.vertical ? end?.y + end?.height - start?.y : BarConfig.sizes.innerHeight

            anchors.horizontalCenter: root.vertical ? parent.horizontalCenter : undefined
            anchors.verticalCenter: root.vertical ? undefined : parent.verticalCenter

            scale: 0
            Component.onCompleted: scale = 1

            Behavior on color {
                ColorAnimation {
                    duration: Appearance.anim.durations.normal
                    easing.type: Easing.BezierSpline
                    easing.bezierCurve: Appearance.anim.curves.standard
                }
            }

            Behavior on scale {
                Anim {
                    easing.bezierCurve: Appearance.anim.curves.standardDecel
                }
            }

            Behavior on x {
                Anim {}
            }

            Behavior on y {
                Anim {}
            }
        }
    }

    Behavior on opacity {
        Anim {}
    }

    component Anim: NumberAnimation {
        duration: Appearance.anim.durations.normal
        easing.type: Easing.BezierSpline
        easing.bezierCurve: Appearance.anim.curves.standard
    }

    component Pill: QtObject {
        property int start
        property int end
    }

    Component {
        id: pillComp

        Pill {}
    }
}
