import "root:/widgets"
import "root:/services"
import "root:/config"
import Quickshell
import Quickshell.Widgets
import QtQuick

PaddedRect {
    id: root

    required property DesktopEntry modelData
    required property PersistentProperties visibilities

    implicitHeight: LauncherConfig.sizes.itemHeight
    padding: [Appearance.padding.smaller, Appearance.padding.normal]

    anchors.left: parent.left
    anchors.right: parent.right

    StateLayer {
        radius: Appearance.rounding.full

        function onClicked(): void {
            Apps.launch(root.modelData);
            root.visibilities.launcher = false;
        }
    }

    IconImage {
        id: icon

        source: Quickshell.iconPath(root.modelData.icon, "image-missing")
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
            text: root.modelData.comment || root.modelData.genericName || root.modelData.name
            font.pointSize: Appearance.font.size.small
            color: Colours.alpha(Colours.palette.m3outline, true)

            elide: Text.ElideRight
            width: root.width - icon.width - Appearance.rounding.normal * 2

            anchors.top: name.bottom
        }
    }
}
