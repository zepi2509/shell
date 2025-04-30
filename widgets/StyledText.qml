pragma ComponentBehavior: Bound

import "root:/config"
import QtQuick

Text {
    id: root

    property bool animate: false
    property string animateProp: "scale"
    property int animateDuration: Appearance.anim.durations.normal

    renderType: Text.NativeRendering
    color: Appearance.colours.m3onSurface
    font.family: Appearance.font.family.sans
    font.pointSize: Appearance.font.size.smaller

    Behavior on color {
        ColorAnimation {
            duration: Appearance.anim.durations.normal
            easing.type: Easing.BezierSpline
            easing.bezierCurve: Appearance.anim.curves.standard
        }
    }

    Behavior on text {
        enabled: root.animate

        SequentialAnimation {
            Anim {
                to: 0
                easing.bezierCurve: Appearance.anim.curves.standardAccel
            }
            PropertyAction {}
            Anim {
                to: 1
                easing.bezierCurve: Appearance.anim.curves.standardDecel
            }
        }
    }

    component Anim: NumberAnimation {
        target: root
        property: root.animateProp
        duration: root.animateDuration / 2
        easing.type: Easing.BezierSpline
    }
}
