import "root:/services"
import "root:/config"
import "dash"
import QtQuick
import QtQuick.Layouts

GridLayout {
    id: root

    rowSpacing: Appearance.spacing.normal
    columnSpacing: Appearance.spacing.normal

    Rect {
        Layout.column: 2
        Layout.columnSpan: 3

        User {}
    }

    Rect {
        // Layout.column: 3
        Layout.row: 0
        Layout.columnSpan: 2
        Layout.preferredWidth: DashboardConfig.sizes.weatherWidth
        Layout.fillHeight: true

        Weather {}
    }

    Rect {
        Layout.row: 1
        Layout.fillHeight: true

        DateTime {}
    }

    Rect {
        Layout.row: 1
        Layout.column: 1
        Layout.columnSpan: 3
        Layout.fillWidth: true

        Calendar {}
    }

    Rect {
        Layout.row: 1
        Layout.column: 4
        Layout.fillHeight: true

        Resources {}
    }

    Rect {
        Layout.row: 0
        Layout.column: 5
        Layout.rowSpan: 2
        Layout.fillHeight: true

        Media {}
    }

    component Rect: Rectangle {
        default property Item child

        children: [child]
        implicitWidth: child.implicitWidth
        implicitHeight: child.implicitHeight

        radius: Appearance.rounding.small
        color: Colours.palette.m3surfaceContainer

        Behavior on color {
            ColorAnimation {
                duration: Appearance.anim.durations.normal
                easing.type: Easing.BezierSpline
                easing.bezierCurve: Appearance.anim.curves.standard
            }
        }
    }
}
