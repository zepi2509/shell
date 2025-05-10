import "root:/widgets"
import "root:/services"
import "root:/config"
import Quickshell
import QtQuick

Column {
    id: root

    padding: Appearance.padding.large

    anchors.bottom: parent.bottom
    anchors.right: parent.right

    spacing: Appearance.spacing.normal

    Repeater {
        model: ScriptModel {
            values: [...Notifs.list]
        }

        Notification {}
    }
}
