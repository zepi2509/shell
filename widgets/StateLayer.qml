import "root:/widgets"
import "root:/services"
import "root:/config"
import QtQuick

Rectangle {
    id: root

    readonly property alias hovered: mouse.hovered
    readonly property alias pressed: mouse.pressed

    function onClicked(event: MouseEvent): void {
    }

    anchors.fill: parent

    color: Colours.palette.m3onSurface
    opacity: mouse.pressed ? 0.1 : mouse.hovered ? 0.08 : 0

    MouseArea {
        id: mouse

        property bool hovered

        anchors.fill: parent
        cursorShape: Qt.PointingHandCursor
        hoverEnabled: true

        onEntered: hovered = true
        onExited: hovered = false

        onClicked: event => root.onClicked(event)
    }

    Behavior on opacity {
        NumberAnimation {
            duration: Appearance.anim.durations.smaller
            easing.type: Easing.BezierSpline
            easing.bezierCurve: Appearance.anim.curves.standard
        }
    }

    Behavior on color {
        ColorAnimation {
            duration: Appearance.anim.durations.normal
            easing.type: Easing.BezierSpline
            easing.bezierCurve: Appearance.anim.curves.standard
        }
    }
}
