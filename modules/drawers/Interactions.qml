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

    function withinPanelHeight(panel: Item, x: real, y: real): bool {
        return y >= panel.y && y <= panel.y + panel.height;
    }

    function inRightPanel(panel: Item, x: real, y: real): bool {
        return x > panel.x && withinPanelHeight(panel, x, y);
    }

    anchors.fill: parent
    hoverEnabled: true

    onPressed: event => dragStart = Qt.point(event.x, event.y)

    Connections {
        target: Hyprland

        function onCursorPosChanged(): void {
            const {x, y} = Hyprland.cursorPos;

            // Show osd on hover
            const showOsd = root.inRightPanel(panels.osd, x, y);
            root.visibilities.osd = showOsd;
            root.osdHovered = showOsd;

            // Show/hide session on drag
            if (root.pressed && root.withinPanelHeight(panels.session, x, y)) {
                const dragX = x - root.dragStart.x;
                if (dragX < -SessionConfig.dragThreshold)
                    root.visibilities.session = true;
                else if (dragX > SessionConfig.dragThreshold)
                    root.visibilities.session = false;
            }
        }
    }

    Osd.Interactions {
        screen: root.screen
        visibilities: root.visibilities
        hovered: root.osdHovered
    }
}
