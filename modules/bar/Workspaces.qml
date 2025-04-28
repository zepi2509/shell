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

        padding: [Appearance.padding.smaller / 2, 0]
        anchors.centerIn: parent
        homogenous: true
        spacing: 0

        Repeater {
            model: BarConfig.workspaces.shown

            Label {
                required property int index

                text: index + 1
                color: root.colour
                horizontalAlignment: Label.AlignCenter

                Layout.alignment: Layout.Center
                Layout.preferredWidth: layout.homogenous ? layout.height : -1
            }
        }
    }

    Rectangle {
        id: active

        // property int lastIdx: 0
        property int currentIdx: (Hyprland.activeWorkspace?.id ?? 1) - 1
        readonly property real size: layout.children[currentIdx][root.vertical ? "height" : "width"]
        readonly property real offset: {
            const vertical = root.vertical;
            const child = layout.children[currentIdx];
            const size = child[vertical ? "height" : "width"];
            const implicitSize = child[vertical ? "implicitHeight" : "implicitWidth"];
            return child.x - (size - implicitSize) / 2;
        }

        clip: true
        x: root.vertical ? 0 : offset
        y: root.vertical ? offset : 0
        width: root.vertical ? layout.width : size
        height: root.vertical ? size : layout.height
        color: Appearance.colours.mauve
        radius: Appearance.rounding.full

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

            Behavior on x {
                Anim {}
            }

            Behavior on y {
                Anim {}
            }
        }

        Behavior on x {
            Anim {}
        }

        Behavior on y {
            Anim {}
        }
    }

    component Anim: NumberAnimation {
        duration: Appearance.anim.durations.normal
        easing.type: Easing.BezierSpline
        easing.bezierCurve: Appearance.anim.curves.standard
    }
}
