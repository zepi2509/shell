import "root:/config"
import QtQuick

Rectangle {
    id: root

    property bool vertical: parent?.vertical ?? false // Convenience property for propagation to children

    color: "transparent"

    Behavior on color {
        ColorAnimation {
            duration: Appearance.anim.durations.normal
            easing.type: Easing.BezierSpline
            easing.bezierCurve: Appearance.anim.curves.standard
        }
    }
}
