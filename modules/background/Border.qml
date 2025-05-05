import "root:/widgets"
import "root:/config"
import Quickshell
import QtQuick
import QtQuick.Effects

StyledWindow {
    id: win

    name: "border"
    exclusionMode: ExclusionMode.Ignore

    mask: Region {
        x: BackgroundConfig.border.thickness
        y: BackgroundConfig.border.thickness
        width: win.screen.width - BackgroundConfig.border.thickness * 2
        height: win.screen.height - BackgroundConfig.border.thickness * 2
        intersection: Intersection.Xor
    }

    anchors.top: true
    anchors.bottom: true
    anchors.left: true
    anchors.right: true

    StyledRect {
        id: rect

        anchors.fill: parent
        color: Appearance.alpha(Appearance.colours.m3surface, false)
        visible: false
    }

    Item {
        id: mask

        anchors.fill: parent
        layer.enabled: true
        visible: false

        Rectangle {
            anchors.fill: parent
            anchors.margins: BackgroundConfig.border.thickness
            radius: BackgroundConfig.border.rounding
        }
    }

    MultiEffect {
        anchors.fill: parent
        maskEnabled: true
        maskInverted: true
        maskSource: mask
        source: rect
        maskThresholdMin: 0.5
        maskSpreadAtMin: 1
    }
}
