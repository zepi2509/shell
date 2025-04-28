import "root:/widgets"
import "root:/services"
import "root:/utils"
import "root:/config"
import QtQuick
import QtQuick.Layouts

Box {
    Label {
        text: Icons.osIcon
        font.pointSize: Appearance.font.size.smaller
        font.family: Appearance.font.family.mono
        color: Appearance.colours.yellow

        Layout.alignment: Qt.AlignCenter
    }
}
