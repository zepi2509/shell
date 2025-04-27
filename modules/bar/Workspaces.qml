pragma ComponentBehavior: Bound

import "root:/widgets"
import "root:/services"
import "root:/config"
import Quickshell
import QtQuick
import QtQuick.Layouts

Item {
    property alias vertical: root.vertical

    implicitWidth: root.implicitWidth
    implicitHeight: root.implicitHeight

    Box {
        id: root

        readonly property color colour: Appearance.colours.mauve

        // homogenous: true

        Repeater {
            model: BarConfig.workspaces.shown

            Label {
                required property int index

                text: (index + 1).toString()
                color: root.colour
            }
        }

        // Text {
        //     Layout.alignment: Qt.AlignCenter
        //     horizontalAlignment: Text.AlignJustify

        //     text: root.vertical ? Time.format("hh\nmm") : Time.format("dd/MM/yy hh:mm")
        //     font.pointSize: Appearance.font.size.smaller
        //     font.family: Appearance.font.family.mono
        //     color: root.colour
        // }
    }

    Rectangle {
        x: (root.childrenRect.width / BarConfig.workspaces.shown) * ((Hyprland.activeWorkspace?.id ?? 1) - 1)
        y: 0
        width: root.childrenRect.width / BarConfig.workspaces.shown
        height: root.childrenRect.height
        color: "red"
        radius: 1000

        // layer.enabled: true
        // layer.effect: ShaderEffect {
        //     readonly property Item source: root
        //     fragmentShader: `
        //         varying highp vec2 qt_TexCoord0;
        //         uniform highp vec4 color;
        //         uniform sampler2D source;
        //         void main() {
        //             gl_FragColor = color * (1.0 - texture2D(source, qt_TexCoord0).w);
        //         }
        //     `
        // }
    }
}
