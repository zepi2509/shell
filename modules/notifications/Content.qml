import "root:/widgets"
import "root:/services"
import "root:/config"
import Quickshell
import QtQuick

Column {
    id: root

    // padding: Appearance.padding.large

    anchors.bottom: parent.bottom
    anchors.right: parent.right

    spacing: Appearance.spacing.normal

    StyledRect {
        width: 300
        height: 100
        // color: Qt.rgba(255, 0, 0, 0.4)
    }
}
