import "root:/widgets"
import "root:/services"
import "root:/utils"
import "root:/config"
import QtQuick
import QtQuick.Layouts

Box {
    id: root
    property color colour: Appearance.colours.pink

    MaterialIcon {
        Layout.alignment: Qt.AlignCenter
        text: Icons.getAppCategoryIcon(Hyprland.activeClient?.wmClass) ?? "desktop_windows"
        color: root.colour
    }

    Text {
        Layout.alignment: Qt.AlignCenter

        text: Hyprland.activeClient?.title ?? "Desktop"
        font.pointSize: Appearance.font.size.smaller
        font.family: Appearance.font.family.mono
        color: root.colour

        rotation: root.vertical ? 90 : 0
        Layout.maximumWidth: root.vertical ? this.implicitHeight : this.implicitWidth
    }
}
