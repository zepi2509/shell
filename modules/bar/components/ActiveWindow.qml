import "root:/widgets"
import "root:/services"
import "root:/utils"
import "root:/config"
import QtQuick

StyledRect {
    id: root

    readonly property color colour: Appearance.colours.pink

    animate: true
    clip: true

    MaterialIcon {
        id: icon

        text: Icons.getAppCategoryIcon(Hyprland.activeClient?.class) ?? "desktop_windows"
        color: root.colour
    }

    AnchorText {
        prevAnchor: icon
        vertical: root.vertical

        text: Hyprland.activeClient?.title ?? "Desktop"
        font.pointSize: Appearance.font.size.smaller
        font.family: Appearance.font.family.mono
        color: root.colour
        rotation: root.vertical ? 90 : 0
    }
}
