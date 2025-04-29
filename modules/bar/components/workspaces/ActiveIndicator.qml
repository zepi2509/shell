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
    x: vertical ? 0 : offset
    y: vertical ? offset : 0
    width: vertical ? BarConfig.sizes.innerHeight : size
    height: vertical ? size : BarConfig.sizes.innerHeight
    color: Appearance.colours.mauve
    radius: Appearance.rounding.full

    anchors.horizontalCenter: vertical ? parent.horizontalCenter : undefined
    anchors.verticalCenter: vertical ? undefined : parent.verticalCenter

    Rectangle {
        id: base

        visible: false
        anchors.fill: parent
        color: Appearance.colours.base
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

    Behavior on leading {
        Anim {}
    }

    Behavior on trailing {
        Anim {
            duration: Appearance.anim.durations.normal * 2
        }
    }

    Behavior on currentSize {
        Anim {}
    }

    component Anim: NumberAnimation {
        duration: Appearance.anim.durations.normal
        easing.type: Easing.BezierSpline
        easing.bezierCurve: Appearance.anim.curves.emphasized
    }
}
