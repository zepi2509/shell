pragma ComponentBehavior: Bound

import "root:/widgets"
import "root:/services"
import "root:/config"
import Quickshell
import QtQuick
import QtQuick.Effects

Scope {
    id: root

    required property ShellScreen screen

    StyledWindow {
        id: win

        screen: root.screen
        name: "border"
        exclusionMode: ExclusionMode.Ignore

        mask: Region {
            x: BorderConfig.thickness
            y: BorderConfig.thickness
            width: win.screen.width - BorderConfig.thickness * 2
            height: win.screen.height - BorderConfig.thickness * 2
            intersection: Intersection.Xor
        }

        anchors.top: true
        anchors.bottom: true
        anchors.left: true
        anchors.right: true

        StyledRect {
            id: rect

            anchors.fill: parent
            color: Colours.alpha(BorderConfig.colour, false)
            visible: false
        }

        Item {
            id: mask

            anchors.fill: parent
            layer.enabled: true
            visible: false

            Rectangle {
                anchors.fill: parent
                anchors.margins: BorderConfig.thickness
                radius: BorderConfig.rounding
            }
        }

        MultiEffect {
            id: effect

            visible: false
            anchors.fill: parent
            maskEnabled: true
            maskInverted: true
            maskSource: mask
            source: rect
            maskThresholdMin: 0.5
            maskSpreadAtMin: 1
        }

        LayerShadow {
            source: effect
        }

        MouseArea {
            anchors.fill: parent
            hoverEnabled: true
            onPositionChanged: event => Drawers.setPosForScreen(root.screen, event.x, event.y)
        }
    }

    ExclusionZone {
        anchors.left: false
    }

    ExclusionZone {
        anchors.top: false
    }

    ExclusionZone {
        anchors.right: false
    }

    ExclusionZone {
        anchors.bottom: false
    }

    component ExclusionZone: StyledWindow {
        screen: root.screen
        name: "border-exclusion"
        width: BorderConfig.thickness
        height: BorderConfig.thickness

        anchors.top: true
        anchors.left: true
        anchors.bottom: true
        anchors.right: true
    }
}
