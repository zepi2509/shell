pragma ComponentBehavior: Bound

import "root:/widgets"
import "root:/services"
import "root:/utils"
import "root:/config"
import QtQuick

StyledRect {
    id: root

    property color colour: Appearance.colours.pink

    animate: true
    clip: true

    MaterialIcon {
        id: icon

        animate: true
        text: Icons.getAppCategoryIcon(Hyprland.activeClient?.wmClass, "desktop_windows")
        color: root.colour

        anchors.horizontalCenter: root.vertical ? parent.horizontalCenter : undefined
    }

    AnchorText {
        id: text

        prevAnchor: icon

        text: metrics.elidedText
        font.pointSize: metrics.font.pointSize
        font.family: metrics.font.family
        color: root.colour

        transform: Rotation {
            angle: vertical ? 90 : 0
            origin.x: text.implicitHeight / 2
            origin.y: text.implicitHeight / 2
        }

        width: vertical ? implicitHeight : implicitWidth
        height: vertical ? implicitWidth : implicitHeight
    }

    TextMetrics {
        id: metrics

        text: Hyprland.activeClient?.title ?? qsTr("Desktop")
        font.pointSize: Appearance.font.size.smaller
        font.family: Appearance.font.family.mono
        elide: Qt.ElideRight
        elideWidth: root.vertical ? BarConfig.sizes.maxLabelHeight : BarConfig.sizes.maxLabelWidth
    }
}
