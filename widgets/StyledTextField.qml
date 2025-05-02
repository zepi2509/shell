pragma ComponentBehavior: Bound

import "root:/config"
import QtQuick
import QtQuick.Controls

TextField {
    id: root

    renderType: TextField.NativeRendering
    color: Appearance.colours.m3onSurface
    placeholderTextColor: Appearance.colours.m3outline
    font.family: Appearance.font.family.sans
    font.pointSize: Appearance.font.size.smaller

    Behavior on color {
        ColorAnimation {
            duration: Appearance.anim.durations.normal
            easing.type: Easing.BezierSpline
            easing.bezierCurve: Appearance.anim.curves.standard
        }
    }

    Behavior on placeholderTextColor {
        ColorAnimation {
            duration: Appearance.anim.durations.normal
            easing.type: Easing.BezierSpline
            easing.bezierCurve: Appearance.anim.curves.standard
        }
    }
}
