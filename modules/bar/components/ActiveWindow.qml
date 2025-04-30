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

        animate: true
        text: Icons.getAppCategoryIcon(Hyprland.activeClient?.wmClass, "desktop_windows")
        color: root.colour
    }

    AnchorText {
        prevAnchor: icon

        text: metrics.elidedText
        font.pointSize: metrics.font.pointSize
        font.family: metrics.font.family
        color: root.colour
        rotation: vertical ? 90 : 0
    }

    TextMetrics {
        id: metrics

        text: Hyprland.activeClient?.title ?? "Desktop"
        font.pointSize: Appearance.font.size.smaller
        font.family: Appearance.font.family.mono
        elide: Qt.ElideRight
        elideWidth: root.vertical ? BarConfig.sizes.maxLabelHeight : BarConfig.sizes.maxLabelWidth
    }
}
