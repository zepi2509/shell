import "root:/widgets"
import "root:/config"
import Quickshell
import QtQuick

PaddedRect {
    id: root

    required property Actions.Action modelData
    required property var list

    implicitWidth: ListView.view.width
    implicitHeight: LauncherConfig.sizes.itemHeight
    padding: [Appearance.padding.smaller, Appearance.padding.larger]

    StateLayer {
        radius: Appearance.rounding.normal

        function onClicked(): void {
            root.modelData.onClicked(root.list);
        }
    }

    MaterialIcon {
        id: icon

        text: root.modelData.icon
        font.pointSize: Appearance.font.size.extraLarge

        anchors.verticalCenter: parent.verticalCenter
    }

    Item {
        anchors.left: icon.right
        anchors.leftMargin: Appearance.spacing.larger
        anchors.verticalCenter: icon.verticalCenter

        implicitWidth: parent.width - icon.width
        implicitHeight: childrenRect.height

        StyledText {
            id: name

            text: root.modelData.name
            font.pointSize: Appearance.font.size.normal
        }

        StyledText {
            text: root.modelData.desc
            font.pointSize: Appearance.font.size.small
            color: Appearance.alpha(Appearance.colours.m3outline, true)

            elide: Text.ElideRight
            width: root.width - icon.width - Appearance.rounding.normal * 2

            anchors.top: name.bottom
        }
    }
}
