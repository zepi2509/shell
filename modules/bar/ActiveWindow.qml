import "root:/widgets"
import "root:/services"
import "root:/utils"
import "root:/config"
import QtQuick
import QtQuick.Layouts

ClippingBoxLayout {
    id: root
    readonly property color colour: Appearance.colours.pink

    animated: true

    MaterialIcon {
        Layout.alignment: Qt.AlignCenter
        text: Icons.getAppCategoryIcon(Hyprland.activeClient?.class) ?? "desktop_windows"
        color: root.colour
    }

    Label {
        Layout.alignment: Qt.AlignCenter

        text: Hyprland.activeClient?.title ?? "Desktop"
        font.pointSize: Appearance.font.size.smaller
        font.family: Appearance.font.family.mono
        color: root.colour

        rotation: root.vertical ? 90 : 0
        Layout.maximumWidth: root.vertical ? this.implicitHeight : this.implicitWidth
    }
}
