import "root:/widgets"
import "root:/services"
import "root:/config"
import QtQuick

Item {
    id: root

    property alias vertical: layout.vertical
    property color colour: Appearance.colours.mauve

    readonly property list<Workspace> workspaces: layout.children.filter(c => c.isWorkspace).sort((w1, w2) => w1.ws - w2.ws)
    readonly property var occupied: Hyprland.workspaces.values.reduce((acc, curr) => {
        acc[curr.id] = curr.lastIpcObject.windows > 0;
        return acc;
    }, {})
    readonly property int groupOffset: Math.floor((Hyprland.activeWsId - 1) / BarConfig.workspaces.shown) * BarConfig.workspaces.shown

    implicitWidth: layout.implicitWidth
    implicitHeight: layout.implicitHeight

    BoxLayout {
        id: layout

        spacing: 0

        Repeater {
            model: BarConfig.workspaces.shown

            Workspace {
                vertical: root.vertical
                occupied: root.occupied
                groupOffset: root.groupOffset
            }
        }
    }

    Loader {
        active: BarConfig.workspaces.occupiedBg
        asynchronous: true

        z: -1
        anchors.fill: parent

        sourceComponent: OccupiedBg {
            vertical: root.vertical
            workspaces: root.workspaces
            occupied: root.occupied
            groupOffset: root.groupOffset
        }
    }

    ActiveIndicator {
        color: root.colour
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
            const activeWs = Hyprland.activeClient?.workspace?.name;
            if (activeWs?.startsWith("special:"))
                Hyprland.dispatch(`togglespecialworkspace ${activeWs.slice(8)}`);
            else if (event.angleDelta.y < 0 || Hyprland.activeWsId > 1)
                Hyprland.dispatch(`workspace r${event.angleDelta.y > 0 ? "-" : "+"}1`);
        }
    }
}
