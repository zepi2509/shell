import "root:/widgets"
import "root:/services"
import "root:/config"
import QtQuick

Item {
    id: root

    property alias vertical: layout.vertical
    readonly property color colour: Appearance.colours.mauve
    property int shown: 10
    property bool occupiedBg: false
    property bool showWindows: false

    readonly property list<Workspace> workspaces: layout.children.filter(c => c.isWorkspace)
    readonly property var occupied: Hyprland.workspaces.values.reduce((acc, curr) => {
        acc[curr.id] = curr.lastIpcObject.windows > 0;
        return acc;
    }, {})

    implicitWidth: layout.implicitWidth
    implicitHeight: layout.implicitHeight

    BoxLayout {
        id: layout

        anchors.fill: parent
        homogenous: true
        spacing: 0

        Repeater {
            model: BarConfig.workspaces.shown

            Workspace {
                vertical: root.vertical
                homogenous: true
                occupied: root.occupied
            }
        }
    }

    OccupiedBg {
        opacity: BarConfig.workspaces.occupiedBg ? 1 : 0
        vertical: root.vertical
        workspaces: root.workspaces
        occupied: root.occupied

        Behavior on opacity {
            NumberAnimation {
                duration: Appearance.anim.durations.normal
                easing.type: Easing.BezierSpline
                easing.bezierCurve: Appearance.anim.curves.standard
            }
        }
    }

    ActiveIndicator {
        vertical: root.vertical
        workspaces: root.workspaces
        mask: layout
        maskWidth: root.width
        maskHeight: root.height
    }

    MouseArea {
        anchors.fill: parent

        onPressed: event => Hyprland.dispatch(`workspace ${layout.childAt(event.x, event.y).index + 1}`)
        onWheel: event => {
            if (event.angleDelta.y < 0)
                Hyprland.dispatch(`workspace r+1`);
            else if (event.angleDelta.y > 0 && Hyprland.activeWorkspace.id > 1)
                Hyprland.dispatch(`workspace r-1`);
        }
    }
}
