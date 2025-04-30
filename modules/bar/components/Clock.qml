import "root:/widgets"
import "root:/services"
import "root:/config"
import QtQuick

StyledRect {
    id: root

    property color colour: Appearance.colours.peach

    MaterialIcon {
        id: icon

        text: "calendar_month"
        color: root.colour
    }

    AnchorText {
        prevAnchor: icon

        horizontalAlignment: StyledText.AlignHCenter
        text: root.vertical ? Time.format("hh\nmm") : Time.format("hh:mm • dddd, dd MMMM")
        font.pointSize: Appearance.font.size.smaller
        font.family: Appearance.font.family.mono
        color: root.colour
    }
}
