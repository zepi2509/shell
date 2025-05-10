import "root:/services"
import "root:/config"
import QtQuick
import QtQuick.Shapes

Shape {
    id: root

    required property real wrapperWidth
    required property real wrapperHeight
    readonly property real rounding: BorderConfig.rounding
    readonly property bool flatten: wrapperHeight < rounding * 2
    readonly property real roundingY: flatten ? wrapperHeight / 2 : rounding

    preferredRendererType: Shape.CurveRenderer
    opacity: Colours.transparency.enabled ? Colours.transparency.base : 1

    ShapePath {
        strokeWidth: -1
        fillColor: BorderConfig.colour

        startX: root.wrapperWidth

        PathLine {}
        PathArc {
            relativeX: root.rounding
            relativeY: root.roundingY
            radiusX: root.rounding
            radiusY: Math.min(root.rounding, root.wrapperHeight)
        }
        PathLine {
            relativeX: 0
            y: root.flatten ? root.roundingY : root.wrapperHeight - root.rounding
        }
        PathArc {
            relativeX: root.rounding
            relativeY: root.roundingY
            radiusX: root.rounding
            radiusY: Math.min(root.rounding, root.wrapperHeight)
            direction: PathArc.Counterclockwise
        }
        PathLine {
            x: root.wrapperWidth - root.rounding - 1
            relativeY: 0
        }
        PathArc {
            relativeX: root.rounding
            relativeY: root.rounding
            radiusX: root.rounding
            radiusY: root.rounding
        }
        PathLine {
            relativeX: 1
            relativeY: 0
        }

        Behavior on fillColor {
            ColorAnimation {
                duration: Appearance.anim.durations.normal
                easing.type: Easing.BezierSpline
                easing.bezierCurve: Appearance.anim.curves.standard
            }
        }
    }
}
