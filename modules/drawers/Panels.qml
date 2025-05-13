import "root:/widgets"
import "root:/services"
import "root:/config"
import "root:/modules/osd" as Osd
import Quickshell
import QtQuick

Item {
    id: root

    required property ShellScreen screen
    readonly property Osd.Wrapper osd: osd

    anchors.fill: parent
    anchors.margins: BorderConfig.thickness

    Osd.Wrapper {
        id: osd

        screen: root.screen

        anchors.verticalCenter: parent.verticalCenter
        anchors.right: parent.right
    }
}
