import "root:/config"
import QtQuick

Text {
    id: root

    renderType: Text.NativeRendering

    Behavior on color {
        ColorAnimation {
            duration: Appearance.anim.durations.normal
            easing.type: Easing.BezierSpline
            easing.bezierCurve: Appearance.anim.curves.standard
        }
    }
}
