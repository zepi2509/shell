pragma ComponentBehavior: Bound

import "root:/widgets"
import "root:/services"
import "root:/config"
import QtQuick
import QtQuick.Layouts
import Qt5Compat.GraphicalEffects

Item {
    id: root

    property alias vertical: layout.vertical
    readonly property color colour: Appearance.colours.mauve

    implicitWidth: layout.implicitWidth
    implicitHeight: layout.implicitHeight

    BoxLayout {
        id: layout

        padding: vertical ? [0, Appearance.padding.smaller / 2] : [Appearance.padding.smaller / 2, 0]
        anchors.centerIn: parent
        homogenous: true
        spacing: 0

        Repeater {
            model: BarConfig.workspaces.shown

            Label {
                required property int index

                text: index + 1
                color: root.colour
                horizontalAlignment: Label.AlignHCenter

                Layout.alignment: Layout.Center
                Layout.preferredWidth: layout.homogenous && !layout.vertical ? layout.height : -1
                Layout.preferredHeight: layout.homogenous && layout.vertical ? layout.width : -1
            }
        }
    }

    Rectangle {
        id: active

        property int currentIdx: 0
        property int lastIdx: 0
        property real leading: layout.children[currentIdx][root.vertical ? "y" : "x"]
        property real trailing: layout.children[lastIdx][root.vertical ? "y" : "x"]
        property real currentSize: layout.children[currentIdx][root.vertical ? "height" : "width"]
        property real size: Math.abs(leading - trailing) + currentSize
        property real offset: Math.min(leading, trailing)

        clip: true
        x: root.vertical ? 0 : offset
        y: root.vertical ? offset : 0
        width: root.vertical ? layout.width : size
        height: root.vertical ? size : layout.height
        color: Appearance.colours.mauve
        radius: Appearance.rounding.full

        Connections {
            target: Hyprland

            function onActiveWorkspaceChanged() {
                active.currentIdx = (Hyprland.activeWorkspace?.id ?? 1) - 1;
                active.lastIdx = active.currentIdx;
            }
        }

        Rectangle {
            id: base

            visible: false
            anchors.fill: parent
            color: Appearance.colours.base
        }

        OpacityMask {
            source: base
            maskSource: layout

            x: root.vertical ? 0 : -parent.offset
            y: root.vertical ? -parent.offset : 0
            width: root.width
            height: root.height
        }

        Behavior on leading {
            NumberAnimation {
                duration: Appearance.anim.durations.normal
                easing.type: Easing.BezierSpline
                easing.bezierCurve: Appearance.anim.curves.emphasized
            }
        }

        Behavior on trailing {
            NumberAnimation {
                duration: Appearance.anim.durations.normal * 2
                easing.type: Easing.BezierSpline
                easing.bezierCurve: Appearance.anim.curves.emphasized
            }
        }

        Behavior on currentSize {
            NumberAnimation {
                duration: Appearance.anim.durations.normal
                easing.type: Easing.BezierSpline
                easing.bezierCurve: Appearance.anim.curves.emphasized
            }
        }
    }
}
