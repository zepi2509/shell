import "root:/config"
import QtQuick

Grid {
    property bool vertical: parent.vertical ?? false // Propagate from parent

    flow: vertical ? Grid.TopToBottom : Grid.LeftToRight
    rows: vertical ? -1 : 1
    columns: vertical ? 1 : -1
    spacing: Appearance.spacing.small

    add: Transition {
        NumberAnimation {
            properties: "scale"
            from: 0
            to: 1
            duration: Appearance.anim.durations.normal
            easing.type: Easing.BezierSpline
            easing.bezierCurve: Appearance.anim.curves.standardDecel
        }
    }
}
