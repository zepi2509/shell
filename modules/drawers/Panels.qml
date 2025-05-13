import "root:/config"
import "root:/modules/osd" as Osd
import Quickshell
import QtQuick

Item {
    id: root

    required property ShellScreen screen
    required property PersistentProperties visibilities

    readonly property Osd.Wrapper osd: osd

    anchors.fill: parent
    anchors.margins: BorderConfig.thickness

    Osd.Wrapper {
        id: osd

        screen: root.screen
        visibility: visibilities.osd

        anchors.verticalCenter: parent.verticalCenter
        anchors.right: parent.right
    }
}
