import "root:/services"
import "root:/config"
import "root:/modules/osd" as Osd
import Quickshell
import QtQuick

MouseArea {
    id: root

    required property ShellScreen screen
    required property PersistentProperties visibilities

    property bool osdHovered
    property point dragStart

    function inOsd(x: real, y: real): bool {
        const osd = panels.osd;
        return x > width - BorderConfig.thickness - osd.width && y >= osd.y && y <= osd.y + osd.height;
    }

    anchors.fill: parent
    hoverEnabled: true

    onPressed: event => dragStart = Qt.point(event.x, event.y)

    Connections {
        target: Hyprland

        function onCursorPosChanged(): void {
            const {x, y} = Hyprland.cursorPos;

            // Show osd on hover
            const showOsd = root.inOsd(x, y);
            root.visibilities.osd = showOsd;
            root.osdHovered = showOsd;
        }
    }

    Osd.Interactions {
        screen: root.screen
        visibilities: root.visibilities
        hovered: root.osdHovered
    }
}
