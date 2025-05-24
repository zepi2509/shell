import "root:/widgets"
import "root:/services"
import "root:/config"
import QtQuick

Item {
    id: root

    readonly property bool vertical: parent?.vertical ?? false
    property color colour: Colours.palette.peach

    implicitWidth: vertical ? Math.max(icon.implicitWidth, text.implicitWidth) : icon.implicitWidth + text.implicitWidth + text.anchors.leftMargin
    implicitHeight: vertical ? icon.implicitHeight + text.implicitHeight + text.anchors.topMargin : Math.max(icon.implicitHeight, text.implicitHeight)

    MaterialIcon {
        id: icon

        text: "calendar_month"
        color: root.colour

        anchors.horizontalCenter: root.vertical ? parent.horizontalCenter : undefined
    }

    AnchorText {
        id: text

        prevAnchor: icon

        horizontalAlignment: StyledText.AlignHCenter
        text: root.vertical ? Time.format("hh\nmm") : Time.format("hh:mm • dddd, dd MMMM")
        font.pointSize: Appearance.font.size.smaller
        font.family: Appearance.font.family.mono
        color: root.colour
    }
}
