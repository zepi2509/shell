import "root:/widgets"
import "root:/services"
import "root:/utils"
import "root:/config"
import Quickshell
import QtQuick
import QtQuick.Layouts

Item {
    id: root

    required property int index
    required property bool vertical
    required property var occupied
    required property int groupOffset

    readonly property bool isWorkspace: true // Flag for finding workspace children

    readonly property int ws: groupOffset + index + 1
    readonly property bool isOccupied: occupied[ws] ?? false

    Layout.preferredWidth: childrenRect.width + (isOccupied && !vertical ? Appearance.padding.normal : 0)
    Layout.preferredHeight: childrenRect.height + (isOccupied && vertical ? Appearance.padding.normal : 0)

    StyledText {
        id: indicator

        readonly property string label: BarConfig.workspaces.label || root.ws
        readonly property string occupiedLabel: BarConfig.workspaces.occupiedLabel || label
        readonly property string activeLabel: BarConfig.workspaces.activeLabel || (root.isOccupied ? occupiedLabel : label)

        animate: true
        animateProp: "scale"
        text: Hyprland.activeWsId === root.ws ? activeLabel : root.isOccupied ? occupiedLabel : label
        color: BarConfig.workspaces.occupiedBg || root.isOccupied ? Appearance.colours.text : Appearance.colours.subtext0
        horizontalAlignment: StyledText.AlignHCenter
        verticalAlignment: StyledText.AlignVCenter

        width: BarConfig.sizes.innerHeight
        height: BarConfig.sizes.innerHeight
    }

    Grid {
        flow: root.vertical ? GridLayout.TopToBottom : GridLayout.LeftToRight
        rows: root.vertical ? -1 : 1
        columns: root.vertical ? 1 : -1
        spacing: Appearance.padding.small

        anchors.left: vertical ? undefined : indicator.right
        anchors.top: vertical ? indicator.bottom : undefined
        anchors.verticalCenter: vertical ? undefined : indicator.verticalCenter
        anchors.horizontalCenter: vertical ? indicator.horizontalCenter : undefined

        add: Transition {
            Anim {
                properties: "scale"
                from: 0
                to: 1
                duration: Appearance.anim.durations.small
            }
        }

        Repeater {
            model: ScriptModel {
                values: Hyprland.clients.filter(c => c.workspace.id === root.ws)
            }

            MaterialIcon {
                required property Hyprland.Client modelData

                text: Icons.getAppCategoryIcon(modelData.wmClass, "terminal")
            }
        }
    }

    Behavior on Layout.preferredWidth {
        Anim {}
    }

    Behavior on Layout.preferredHeight {
        Anim {}
    }

    component Anim: NumberAnimation {
        duration: Appearance.anim.durations.normal
        easing.type: Easing.BezierSpline
        easing.bezierCurve: Appearance.anim.curves.standard
    }
}
