import "root:/widgets"
import "root:/services"
import "root:/config"
import "dash"
import QtQuick.Layouts

GridLayout {
    id: root

    rowSpacing: Appearance.spacing.small
    columnSpacing: Appearance.spacing.small

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
        text: "time"

        Layout.row: 1
        Layout.preferredWidth: 100
        Layout.fillHeight: true
    }

    Rect {
        text: "calendar"

        Layout.row: 1
        Layout.column: 1
        Layout.columnSpan: 3
        Layout.fillWidth: true
        Layout.preferredHeight: 200
    }

    Rect {
        text: "perf"

        Layout.row: 1
        Layout.column: 4
        Layout.preferredWidth: 120
        Layout.fillHeight: true
    }

    Rect {
        text: "media"

        Layout.row: 0
        Layout.column: 5
        Layout.rowSpan: 2
        Layout.preferredWidth: 250
        Layout.fillHeight: true
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
