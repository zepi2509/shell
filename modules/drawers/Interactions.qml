import "root:/services"
import "root:/config"
import Quickshell
import QtQuick

MouseArea {
    required property PersistentProperties visibilities

    property point dragStart

    anchors.fill: parent
    hoverEnabled: true

    onPressed: event => dragStart = Qt.point(event.x, event.y)
    onExited: visibilities.osd = false

    onPositionChanged: ({x, y}) => {
        // Show osd on hover
        const osd = panels.osd;
        visibilities.osd = (x > width - BorderConfig.thickness - osd.width && y >= osd.y && y <= osd.y + osd.height);
    }
}
