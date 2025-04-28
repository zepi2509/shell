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
    readonly property list<Label> workspaces: layout.children.filter(c => c.isWorkspace)

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
                readonly property bool isWorkspace: true

                text: index + 1
                color: Appearance.colours.text
                horizontalAlignment: Label.AlignHCenter

                Layout.preferredWidth: layout.homogenous && !layout.vertical ? layout.height : -1
                Layout.preferredHeight: layout.homogenous && layout.vertical ? layout.width : -1
            }
        }
    }

    BoxLayout {
        id: occupied

        readonly property var occupied: Hyprland.workspaces.values.reduce((acc, curr) => {
            acc[curr.id] = curr.lastIpcObject.windows > 0;
            return acc;
        }, {})

        anchors.centerIn: parent
        spacing: 0
        z: -1

        Repeater {
            model: BarConfig.workspaces.shown

            Rectangle {
                required property int index
                readonly property int roundLeft: index === 0 || !occupied.occupied[index] ? Appearance.rounding.full : 0
                readonly property int roundRight: index === BarConfig.workspaces.shown - 1 || !occupied.occupied[index + 2] ? Appearance.rounding.full : 0

                color: Appearance.alpha(Appearance.colours.surface2, true)
                opacity: occupied.occupied[index + 1] ? 1 : 0
                topLeftRadius: roundLeft
                bottomLeftRadius: roundLeft
                topRightRadius: roundRight
                bottomRightRadius: roundRight

                // Ugh stupid size errors on reload
                Layout.preferredWidth: root.vertical ? layout.width : root.workspaces[index]?.width ?? 1
                Layout.preferredHeight: root.vertical ? root.workspaces[index]?.height ?? 1 : layout.height

                Behavior on opacity {
                    NumberAnimation {
                        duration: Appearance.anim.durations.normal
                        easing.type: Easing.BezierSpline
                        easing.bezierCurve: Appearance.anim.curves.standard
                    }
                }
            }
        }
    }

    MouseArea {
        anchors.fill: parent

        onPressed: event => Hyprland.dispatch(`workspace ${layout.childAt(event.x, event.y).index + 1}`)
        onWheel: event => {
            if (event.angleDelta.y < 0)
                Hyprland.dispatch(`workspace r+1`);
            else if (event.angleDelta.y > 0 && Hyprland.activeWorkspace.id > 1)
                Hyprland.dispatch(`workspace r-1`);
        }
    }

    Rectangle {
        id: active

        property int currentIdx: 0
        property int lastIdx: 0
        property real leading: root.workspaces[currentIdx][root.vertical ? "y" : "x"]
        property real trailing: root.workspaces[lastIdx][root.vertical ? "y" : "x"]
        property real currentSize: root.workspaces[currentIdx][root.vertical ? "height" : "width"]
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
