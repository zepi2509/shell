import "root:/widgets"
import "root:/services"
import "root:/config"
import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

ColumnLayout {
    id: root

    anchors.left: parent.left
    anchors.right: parent.right
    anchors.margins: Appearance.padding.large
    spacing: Appearance.spacing.small

    DayOfWeekRow {
        id: days

        Layout.topMargin: Appearance.padding.large
        Layout.fillWidth: true

        delegate: StyledText {
            required property var model

            horizontalAlignment: Text.AlignHCenter
            text: model.shortName
            font.family: Appearance.font.family.sans
            font.weight: 500
        }
    }

    MonthGrid {
        id: grid

        Layout.bottomMargin: Appearance.padding.large
        Layout.fillWidth: true

        spacing: 3

        delegate: Item {
            id: day

            required property var model

            implicitWidth: implicitHeight
            implicitHeight: text.implicitHeight + Appearance.padding.small * 2

            StyledRect {
                anchors.centerIn: parent

                implicitWidth: parent.implicitHeight
                implicitHeight: parent.implicitHeight

                radius: Appearance.rounding.full
                color: model.today ? Colours.palette.m3primary : "transparent"

                StyledText {
                    id: text

                    anchors.centerIn: parent

                    horizontalAlignment: Text.AlignHCenter
                    text: grid.locale.toString(day.model.date, "d")
                    color: day.model.today ? Colours.palette.m3onPrimary : day.model.month === grid.month ? Colours.palette.m3onSurfaceVariant : Colours.palette.m3outline
                }
            }
        }
    }
}
