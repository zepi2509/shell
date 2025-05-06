import "root:/services"
import "root:/config"
import QtQuick
import QtQuick.Shapes

Shape {
    id: root

    required property real wrapperWidth
    required property real realWrapperHeight
    readonly property int rounding: BorderConfig.rounding
    readonly property int roundingY: Math.min(rounding, realWrapperHeight / 2)
    readonly property real wrapperHeight: realWrapperHeight - 1 // Pixel issues :sob:

    preferredRendererType: Shape.CurveRenderer
    opacity: Colours.transparency.enabled ? Colours.transparency.base : 1

    ShapePath {
        strokeWidth: -1
        fillColor: BorderConfig.colour

        startY: root.wrapperHeight

        PathArc {
            relativeX: root.rounding
            relativeY: -root.roundingY
            radiusX: root.rounding
            radiusY: root.roundingY
            direction: PathArc.Counterclockwise
        }
        PathLine {
            relativeX: 0
            y: root.roundingY
        }
        PathArc {
            relativeX: root.rounding
            relativeY: -root.roundingY
            radiusX: root.rounding
            radiusY: root.roundingY
        }
        PathLine {
            x: root.wrapperWidth - root.rounding * 2
        }
        PathArc {
            relativeX: root.rounding
            relativeY: root.roundingY
            radiusX: root.rounding
            radiusY: root.roundingY
        }
        PathLine {
            relativeX: 0
            y: root.wrapperHeight - root.roundingY
        }
        PathArc {
            relativeX: root.rounding
            relativeY: root.roundingY
            radiusX: root.rounding
            radiusY: root.roundingY
            direction: PathArc.Counterclockwise
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
