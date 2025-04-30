import "root:/widgets"
import "root:/services"
import "root:/config"
import QtQuick
import Qt5Compat.GraphicalEffects

Rectangle {
    id: root

    required property bool vertical
    required property list<Workspace> workspaces
    required property Item mask
    required property real maskWidth
    required property real maskHeight
    required property int groupOffset

    property int currentIdx: (Hyprland.activeWorkspace?.id ?? 1) - 1 - groupOffset
    property int lastIdx: currentIdx
    property real leading: workspaces[currentIdx][vertical ? "y" : "x"]
    property real trailing: workspaces[lastIdx][vertical ? "y" : "x"]
    property real currentSize: workspaces[currentIdx][vertical ? "height" : "width"]
    property real size: Math.abs(leading - trailing) + currentSize
    property real offset: Math.min(leading, trailing)

    clip: true
    x: vertical ? 1 : offset + 1
    y: vertical ? offset + 1 : 1
    width: (vertical ? BarConfig.sizes.innerHeight : size) - 2
    height: (vertical ? size : BarConfig.sizes.innerHeight) - 2
    color: Appearance.colours.mauve
    radius: Appearance.rounding.full

    anchors.horizontalCenter: vertical ? parent.horizontalCenter : undefined
    anchors.verticalCenter: vertical ? undefined : parent.verticalCenter

    Rectangle {
        id: base

        visible: false
        anchors.fill: parent
        color: Appearance.colours.base

        Behavior on color {
            ColorAnimation {
                duration: Appearance.anim.durations.normal
                easing.type: Easing.BezierSpline
                easing.bezierCurve: Appearance.anim.curves.standard
            }
        }
    }

    OpacityMask {
        source: base
        maskSource: root.mask

        x: root.vertical ? 0 : -parent.offset
        y: root.vertical ? -parent.offset : 0
        width: root.maskWidth
        height: root.maskHeight

        anchors.horizontalCenter: root.vertical ? parent.horizontalCenter : undefined
        anchors.verticalCenter: root.vertical ? undefined : parent.verticalCenter
    }

    Behavior on color {
        ColorAnimation {
            duration: Appearance.anim.durations.normal
            easing.type: Easing.BezierSpline
            easing.bezierCurve: Appearance.anim.curves.standard
        }
    }

    Behavior on leading {
        enabled: BarConfig.workspaces.activeTrail

        Anim {}
    }

    Behavior on trailing {
        enabled: BarConfig.workspaces.activeTrail

        Anim {
            duration: Appearance.anim.durations.normal * 2
        }
    }

    Behavior on currentSize {
        enabled: BarConfig.workspaces.activeTrail

        Anim {}
    }

    Behavior on offset {
        enabled: !BarConfig.workspaces.activeTrail

        Anim {}
    }

    Behavior on size {
        enabled: !BarConfig.workspaces.activeTrail

        Anim {}
    }

    component Anim: NumberAnimation {
        duration: Appearance.anim.durations.normal
        easing.type: Easing.BezierSpline
        easing.bezierCurve: Appearance.anim.curves.emphasized
    }
}
