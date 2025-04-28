import "root:/widgets"
import "root:/services"
import "root:/utils"
import "root:/config"
import QtQuick
import QtQuick.Layouts

Box {
    padding: [Appearance.padding.smaller, 0]

    Label {
        text: Icons.osIcon
        font.pointSize: Appearance.font.size.smaller
        font.family: Appearance.font.family.mono
        color: Appearance.colours.yellow

        Layout.alignment: Layout.Center
    }
}
