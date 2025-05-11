import "root:/services"
import "root:/config"
import QtQuick
import QtQuick.Shapes

Shape {
    id: root

    required property real wrapperWidth
    required property real wrapperHeight
    readonly property real rounding: BorderConfig.rounding
    readonly property bool flatten: wrapperWidth < rounding * 2
    readonly property real roundingX: flatten ? wrapperWidth / 2 : rounding

    preferredRendererType: Shape.CurveRenderer
    opacity: Colours.transparency.enabled ? Colours.transparency.base : 1

    ShapePath {
        strokeWidth: -1
        fillColor: BorderConfig.colour

        startX: root.wrapperWidth - 1

        PathArc {
            relativeX: -root.roundingX
            relativeY: root.rounding
            radiusX: Math.min(root.rounding, root.wrapperWidth)
            radiusY: root.rounding
        }
        PathLine {
            x: root.roundingX
            relativeY: 0
        }
        PathArc {
            relativeX: -root.roundingX
            relativeY: root.rounding
            radiusX: Math.min(root.rounding, root.wrapperWidth)
            radiusY: root.rounding
            direction: PathArc.Counterclockwise
        }
        PathLine {
            y: root.wrapperHeight - root.rounding * 2
        }
        PathArc {
            relativeX: root.roundingX
            relativeY: root.rounding
            radiusX: Math.min(root.rounding, root.wrapperWidth)
            radiusY: root.rounding
            direction: PathArc.Counterclockwise
        }
        PathLine {
            x: (root.flatten ? root.roundingX : root.wrapperWidth - root.rounding) - 1
            relativeY: 0
        }
        PathArc {
            relativeX: root.roundingX
            relativeY: root.rounding
            radiusX: Math.min(root.rounding, root.wrapperWidth)
            radiusY: root.rounding
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
