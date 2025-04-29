import "root:/config"
import QtQuick

StyledText {
    id: root

    required property Item prevAnchor
    property bool vertical: parent.vertical ?? false

    anchors.left: vertical ? undefined : prevAnchor.right
    anchors.leftMargin: vertical ? 0 : Appearance.padding.smaller
    anchors.top: vertical ? prevAnchor.bottom : undefined
    anchors.topMargin: vertical ? Appearance.padding.smaller : 0

    anchors.horizontalCenter: vertical ? prevAnchor.horizontalCenter : undefined
    anchors.verticalCenter: vertical ? undefined : prevAnchor.verticalCenter
}
