import "root:/widgets"
import "root:/services"
import "root:/config"
import QtQuick
import QtQuick.Layouts

BoxLayout {
    id: root
    readonly property color colour: Appearance.colours.peach

    MaterialIcon {
        Layout.alignment: Qt.AlignCenter
        text: "calendar_month"
        color: root.colour
    }

    Label {
        Layout.alignment: Qt.AlignCenter
        horizontalAlignment: Text.AlignJustify

        text: root.vertical ? Time.format("hh\nmm") : Time.format("dd/MM/yy hh:mm")
        font.pointSize: Appearance.font.size.smaller
        font.family: Appearance.font.family.mono
        color: root.colour
    }
}
