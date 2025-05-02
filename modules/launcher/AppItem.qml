import "root:/widgets"
import "root:/config"
import Quickshell
import Quickshell.Widgets
import QtQuick

PaddedRect {
    id: root

    required property DesktopEntry modelData

    implicitWidth: ListView.view.width
    padding: [Appearance.padding.smaller, Appearance.padding.normal]
    radius: Appearance.rounding.normal
    // color: ListView.isCurrentItem ? Appearance.alpha(Appearance.colours.m3surfaceContainerHighest, true) : "transparent"

    IconImage {
        id: icon

        source: Quickshell.iconPath(root.modelData.icon)
        implicitSize: parent.height * 0.8

        anchors.verticalCenter: parent.verticalCenter
    }

    Item {
        anchors.left: icon.right
        anchors.leftMargin: Appearance.spacing.normal
        anchors.verticalCenter: icon.verticalCenter

        implicitWidth: parent.width - icon.width
        implicitHeight: childrenRect.height

        StyledText {
            id: name

            text: root.modelData.name
            font.pointSize: Appearance.font.size.normal
        }

        StyledText {
            text: qsTr(root.modelData.comment || root.modelData.genericName || root.modelData.name)
            font.pointSize: Appearance.font.size.small
            color: Appearance.alpha(Appearance.colours.m3outline, true)

            elide: Text.ElideRight
            width: root.width - icon.width - Appearance.rounding.normal * 2

            anchors.top: name.bottom
        }
    }
}
