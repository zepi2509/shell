import "root:/widgets"
import "root:/services"
import "root:/config"
import QtQuick
import QtQuick.Layouts

BoxLayout {
    id: root

    readonly property color colour: Appearance.colours.peach

    MaterialIcon {
        text: "calendar_month"
        color: root.colour

        Layout.alignment: Qt.AlignCenter
    }

    Label {
        horizontalAlignment: Text.AlignJustify
        text: root.vertical ? Time.format("hh\nmm") : Time.format("dd/MM/yy hh:mm")
        font.pointSize: Appearance.font.size.smaller
        font.family: Appearance.font.family.mono
        color: root.colour

        Layout.alignment: Qt.AlignCenter
    }
}
