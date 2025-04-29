import "root:/widgets"
import "root:/services"
import "root:/config"
import QtQuick

Item {
    id: root

    property alias vertical: layout.vertical
    readonly property color colour: Appearance.colours.mauve

    readonly property list<Workspace> workspaces: layout.children.filter(c => c.isWorkspace)
    readonly property var occupied: Hyprland.workspaces.values.reduce((acc, curr) => {
        acc[curr.id] = curr.lastIpcObject.windows > 0;
        return acc;
    }, {})
    readonly property int groupOffset: Math.floor(((Hyprland.activeWorkspace?.id ?? 1) - 1) / BarConfig.workspaces.shown) * BarConfig.workspaces.shown

    implicitWidth: layout.implicitWidth
    implicitHeight: layout.implicitHeight

    BoxLayout {
        id: layout

        homogenous: true
        spacing: 0

        Repeater {
            model: BarConfig.workspaces.shown

            Workspace {
                vertical: root.vertical
                homogenous: layout.homogenous
                occupied: root.occupied
                groupOffset: root.groupOffset
            }
        }
    }

    OccupiedBg {
        vertical: root.vertical
        workspaces: root.workspaces
        occupied: root.occupied
        groupOffset: root.groupOffset
    }

    ActiveIndicator {
        vertical: root.vertical
        workspaces: root.workspaces
        mask: layout
        maskWidth: root.width
        maskHeight: root.height
        groupOffset: root.groupOffset
    }

    MouseArea {
        anchors.fill: parent

        onPressed: event => Hyprland.dispatch(`workspace ${layout.childAt(event.x, event.y).index + root.groupOffset + 1}`)
        onWheel: event => {
            if (event.angleDelta.y < 0)
                Hyprland.dispatch(`workspace r+1`);
            else if (event.angleDelta.y > 0 && Hyprland.activeWorkspace.id > 1)
                Hyprland.dispatch(`workspace r-1`);
        }
    }
}
