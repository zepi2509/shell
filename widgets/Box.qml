import "root:/config"
import QtQuick

Grid {
    property bool vertical: parent.vertical ?? false // Propagate from parent

    flow: vertical ? Grid.TopToBottom : Grid.LeftToRight
    spacing: Appearance.spacing.small

    onVerticalChanged: {
        if (vertical) {
            rows = -1;
            columns = 1;
        } else {
            columns = -1;
            rows = 1;
        }
    }

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
