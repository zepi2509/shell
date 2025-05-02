import "root:/widgets"
import "root:/config"
import Quickshell
import QtQuick

Item {
    implicitWidth: LauncherConfig.sizes.width
    implicitHeight: search.height + list.height + Appearance.padding.large * 5 // Don't question it
    anchors.horizontalCenter: parent.horizontalCenter

    StyledRect {
        color: Appearance.alpha(Appearance.colours.m3surfaceContainerHigh, true)
        radius: Appearance.rounding.large
        implicitHeight: list.height + Appearance.padding.large * 2

        anchors.left: parent.left
        anchors.right: parent.right
        anchors.bottom: search.top
        anchors.bottomMargin: Appearance.spacing.normal
        anchors.margins: Appearance.padding.large

        ListView {
            id: list

            model: DesktopEntries.applications.values.filter(x => x.name.toLowerCase().includes(search.text.toLowerCase()))

            orientation: Qt.Vertical
            verticalLayoutDirection: Qt.BottomToTop
            height: 100
            width: 100

            anchors.left: parent.left
            anchors.right: parent.right
            anchors.bottom: parent.bottom
            anchors.margins: Appearance.padding.large

            delegate: PaddedRect {
                id: entry

                required property DesktopEntry modelData

                width: LauncherConfig.sizes.width

                StyledText {
                    text: modelData.name
                    font.family: Appearance.font.family.sans
                    font.pointSize: Appearance.font.size.smaller
                }
            }
        }
    }

    StyledTextField {
        id: search

        anchors.left: parent.left
        anchors.right: parent.right
        anchors.bottom: parent.bottom
        anchors.margins: Appearance.padding.large

        placeholderText: "Type \">\" for commands"

        background: StyledRect {
            color: Appearance.alpha(Appearance.colours.m3surfaceContainerHigh, true)
            radius: Appearance.rounding.large
        }
    }
}
