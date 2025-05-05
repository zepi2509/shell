import "root:/services"
import "root:/config"
import QtQuick
import QtQuick.Controls

ScrollBar {
    id: root

    contentItem: StyledRect {
        opacity: root.pressed ? 0.8 : root.policy === ScrollBar.AlwaysOn || (root.active && root.size < 1) ? 0.6 : 0
        radius: Appearance.rounding.full
        color: Colours.palette.m3secondary

        Behavior on opacity {
            NumberAnimation {
                duration: Appearance.anim.durations.normal
                easing.type: Easing.BezierSpline
                easing.bezierCurve: Appearance.anim.curves.standard
            }
        }
    }

    background: StyledRect {
        implicitWidth: 10
        opacity: root.policy === ScrollBar.AlwaysOn || (root.active && root.size < 1) ? 0.4 : 0
        radius: Appearance.rounding.full
        color: Colours.palette.m3surfaceContainerLow

        Behavior on opacity {
            NumberAnimation {
                duration: Appearance.anim.durations.normal
                easing.type: Easing.BezierSpline
                easing.bezierCurve: Appearance.anim.curves.standard
            }
        }
    }

    MouseArea {
        z: -1
        anchors.fill: parent
        onWheel: event => {
            if (event.angleDelta.y > 0)
                root.decrease();
            else if (event.angleDelta.y < 0)
                root.increase();
        }
    }
}
