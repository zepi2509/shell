import "root:/widgets"
import "root:/services"
import "root:/config"
import "dash"
import QtQuick.Layouts

GridLayout {
    id: root

    rowSpacing: Appearance.spacing.normal
    columnSpacing: Appearance.spacing.normal

    Rect {
        Layout.columnSpan: 3

        User {}
    }

    Rect {
        text: "toggles"

        Layout.column: 3
        Layout.columnSpan: 2
        Layout.preferredWidth: 250
        Layout.fillHeight: true
    }

    Rect {
        Layout.row: 1

        DateTime {}
    }

    Rect {
        text: "calendar"

        Layout.row: 1
        Layout.column: 1
        Layout.columnSpan: 3
        Layout.fillWidth: true
        Layout.fillHeight: true
    }

    Rect {
        text: "perf"

        Layout.row: 1
        Layout.column: 4
        Layout.preferredWidth: 120
        Layout.fillHeight: true
    }

    Rect {
        Layout.row: 0
        Layout.column: 5
        Layout.rowSpan: 2
        Layout.fillHeight: true

        Media {}
    }

    component Rect: StyledRect {
        property string text

        radius: Appearance.rounding.small
        color: Colours.palette.m3surfaceContainer

        StyledText {
            anchors.centerIn: parent
            text: parent.text
        }
    }
}
