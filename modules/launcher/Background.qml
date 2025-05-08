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

        startY: root.wrapperHeight - 1

        PathArc {
            relativeX: root.rounding
            relativeY: -root.roundingY
            radiusX: root.rounding
            radiusY: Math.min(root.rounding, root.wrapperHeight)
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
            radiusY: Math.min(root.rounding, root.wrapperHeight)
        }
        PathLine {
            x: root.wrapperWidth - root.rounding * 2
        }
        PathArc {
            relativeX: root.rounding
            relativeY: root.roundingY
            radiusX: root.rounding
            radiusY: Math.min(root.rounding, root.wrapperHeight)
        }
        PathLine {
            relativeX: 0
            y: (root.flatten ? root.roundingY : root.wrapperHeight - root.rounding) - 1
        }
        PathArc {
            relativeX: root.rounding
            relativeY: root.roundingY
            radiusX: root.rounding
            radiusY: Math.min(root.rounding, root.wrapperHeight)
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
