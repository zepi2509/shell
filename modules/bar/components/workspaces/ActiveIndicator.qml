import "root:/widgets"
import "root:/services"
import "root:/config"
import QtQuick
import QtQuick.Effects

Rectangle {
    id: root

    required property bool vertical
    required property list<Workspace> workspaces
    required property Item mask
    required property real maskWidth
    required property real maskHeight
    required property int groupOffset

    readonly property Workspace currentWs: workspaces[Hyprland.activeWsId - 1 - groupOffset]
    property real leading: (vertical ? currentWs?.y : currentWs?.x) ?? 0
    property real trailing: (vertical ? currentWs?.y : currentWs?.x) ?? 0
    property real currentSize: (currentWs?.size) ?? 0
    property real size: Math.abs(leading - trailing) + currentSize
    property real offset: Math.min(leading, trailing)

    clip: true
    x: vertical ? 1 : offset + 1
    y: vertical ? offset + 1 : 1
    implicitWidth: (vertical ? BarConfig.sizes.innerHeight : size) - 2
    implicitHeight: (vertical ? size : BarConfig.sizes.innerHeight) - 2
    radius: BarConfig.workspaces.rounded ? Appearance.rounding.full : 0

    Rectangle {
        id: base

        visible: false
        anchors.fill: parent
        color: Colours.on(root.color)

        Behavior on color {
            ColorAnimation {
                duration: Appearance.anim.durations.normal
                easing.type: Easing.BezierSpline
                easing.bezierCurve: Appearance.anim.curves.standard
            }
        }
    }

    MultiEffect {
        source: base
        maskSource: root.mask
        maskEnabled: true
        maskSpreadAtMin: 1
        maskThresholdMin: 0.5

        x: root.vertical ? 0 : -parent.offset
        y: root.vertical ? -parent.offset : 0
        implicitWidth: root.maskWidth
        implicitHeight: root.maskHeight

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
