import "root:/widgets"
import "root:/services"
import "root:/utils"
import "root:/config"
import QtQuick
import QtQuick.Layouts

BoxLayout {
    id: root

    readonly property color colour: Appearance.colours.pink

    padding: [Appearance.padding.smaller, 0]
    animated: true
    clip: true

    MaterialIcon {
        text: Icons.getAppCategoryIcon(Hyprland.activeClient?.class) ?? "desktop_windows"
        color: root.colour

        Layout.alignment: Layout.Center
    }

    Label {
        text: Hyprland.activeClient?.title ?? "Desktop"
        font.pointSize: Appearance.font.size.smaller
        font.family: Appearance.font.family.mono
        color: root.colour
        rotation: root.vertical ? 90 : 0

        Layout.alignment: Layout.Center
        Layout.maximumWidth: root.vertical ? this.implicitHeight : this.implicitWidth
    }
}
