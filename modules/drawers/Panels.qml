import "root:/config"
import "root:/modules/osd" as Osd
import "root:/modules/notifications" as Notifications
import Quickshell
import QtQuick

Item {
    id: root

    required property ShellScreen screen
    required property PersistentProperties visibilities

    readonly property Osd.Wrapper osd: osd
    readonly property Notifications.Wrapper notifications: notifications

    anchors.fill: parent
    anchors.margins: BorderConfig.thickness

    Osd.Wrapper {
        id: osd

        screen: root.screen
        visibility: visibilities.osd

        anchors.verticalCenter: parent.verticalCenter
        anchors.right: parent.right
    }

    Notifications.Wrapper {
        id: notifications

        screen: root.screen
        visibility: visibilities.notifications

        anchors.top: parent.top
        anchors.right: parent.right
    }
}
