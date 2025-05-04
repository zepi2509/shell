import "root:/config"
import QtQuick
import QtQuick.Shapes

Shape {
    id: root

    required property real realWrapperWidth
    required property real wrapperHeight
    readonly property int rounding: Appearance.rounding.large
    readonly property int roundingX: Math.min(rounding, realWrapperWidth / 2)
    readonly property real wrapperWidth: realWrapperWidth - 1 // Pixel issues :sob:

    preferredRendererType: Shape.CurveRenderer
    opacity: Appearance.transparency.enabled ? Appearance.transparency.base : 1

    ShapePath {
        strokeWidth: -1
        fillColor: Appearance.colours.m3surfaceContainer

        startX: root.wrapperWidth

        PathArc {
            relativeX: -root.roundingX
            relativeY: root.rounding
            radiusX: root.roundingX
            radiusY: root.rounding
        }
        PathLine {
            x: root.roundingX
            relativeY: 0
        }
        PathArc {
            relativeX: -root.roundingX
            relativeY: root.rounding
            radiusX: root.roundingX
            radiusY: root.rounding
            direction: PathArc.Counterclockwise
        }
        PathLine {
            y: root.wrapperHeight - root.rounding * 2
        }
        PathArc {
            relativeX: root.roundingX
            relativeY: root.rounding
            radiusX: root.roundingX
            radiusY: root.rounding
            direction: PathArc.Counterclockwise
        }
        PathLine {
            x: root.wrapperWidth - root.roundingX
            relativeY: 0
        }
        PathArc {
            relativeX: root.roundingX
            relativeY: root.rounding
            radiusX: root.roundingX
            radiusY: root.rounding
        }
    }
}
