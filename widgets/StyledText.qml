pragma ComponentBehavior: Bound

import "root:/config"
import QtQuick

Text {
    id: root

    property bool animate: false
    property string animateProp: "opacity"

    renderType: Text.NativeRendering
    color: Appearance.colours.text
    font.family: Appearance.font.family.sans

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
        duration: Appearance.anim.durations.small
        easing.type: Easing.BezierSpline
    }
}
