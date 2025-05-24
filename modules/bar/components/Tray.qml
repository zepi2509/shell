import "root:/widgets"
import "root:/services"
import "root:/config"
import Quickshell.Services.SystemTray
import QtQuick

Item {
    id: root

    readonly property bool vertical: parent?.vertical ?? false
    property color colour: Colours.palette.lavender

    clip: true
    visible: width > 0 && height > 0 // To avoid warnings about being visible with no size

    implicitWidth: layout.implicitWidth
    implicitHeight: layout.implicitHeight

    BoxLayout {
        id: layout

        Repeater {
            model: SystemTray.items

            TrayItem {
                colour: root.colour
            }
        }
    }

    Behavior on implicitWidth {
        NumberAnimation {
            duration: Appearance.anim.durations.normal
            easing.type: Easing.BezierSpline
            easing.bezierCurve: Appearance.anim.curves.emphasized
        }
    }

    Behavior on implicitHeight {
        NumberAnimation {
            duration: Appearance.anim.durations.normal
            easing.type: Easing.BezierSpline
            easing.bezierCurve: Appearance.anim.curves.emphasized
        }
    }
}
