import "root:/widgets"
import "root:/services"
import "root:/utils"
import "root:/config"
import QtQuick
import QtQuick.Layouts

Box {
    id: root

    readonly property color colour: Appearance.colours.pink

    padding: [Appearance.padding.smaller, 0]
    animated: true
    clip: true

    MaterialIcon {
        id: icon

        text: Icons.getAppCategoryIcon(Hyprland.activeClient?.class) ?? "desktop_windows"
        color: root.colour
    }

    StyledText {
        text: Hyprland.activeClient?.title ?? "Desktop"
        font.pointSize: Appearance.font.size.smaller
        font.family: Appearance.font.family.mono
        color: root.colour
        rotation: root.vertical ? 90 : 0

        anchors.left: icon.right
        anchors.leftMargin: Appearance.padding.smaller
    }
}
