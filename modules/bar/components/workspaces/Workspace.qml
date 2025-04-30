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
    // Unanimated prop for others to use as reference
    readonly property real size: childrenRect[vertical ? "height" : "width"] + (shouldPad ? Appearance.padding.normal : 0)

    readonly property int ws: groupOffset + index + 1
    readonly property bool isOccupied: occupied[ws] ?? false
    readonly property bool shouldPad: isOccupied && BarConfig.workspaces.showWindows

    Layout.preferredWidth: childrenRect.width + (shouldPad && !vertical ? Appearance.padding.normal : 0)
    Layout.preferredHeight: childrenRect.height + (shouldPad && vertical ? Appearance.padding.normal : 0)

    StyledText {
        id: indicator

        readonly property string label: BarConfig.workspaces.label || root.ws
        readonly property string occupiedLabel: BarConfig.workspaces.occupiedLabel || label
        readonly property string activeLabel: BarConfig.workspaces.activeLabel || (root.isOccupied ? occupiedLabel : label)

        animate: true
        text: Hyprland.activeWsId === root.ws ? activeLabel : root.isOccupied ? occupiedLabel : label
        color: BarConfig.workspaces.occupiedBg || root.isOccupied ? Appearance.colours.m3onSurface : Appearance.colours.m3outlineVariant
        horizontalAlignment: StyledText.AlignHCenter
        verticalAlignment: StyledText.AlignVCenter

        width: BarConfig.sizes.innerHeight
        height: BarConfig.sizes.innerHeight
    }

    Box {
        anchors.left: vertical ? undefined : indicator.right
        anchors.top: vertical ? indicator.bottom : undefined
        anchors.verticalCenter: vertical ? undefined : indicator.verticalCenter
        anchors.horizontalCenter: vertical ? indicator.horizontalCenter : undefined

        Repeater {
            model: ScriptModel {
                values: BarConfig.workspaces.showWindows ? Hyprland.clients.filter(c => c.workspace?.id === root.ws) : []
            }

            MaterialIcon {
                required property Hyprland.Client modelData

                text: Icons.getAppCategoryIcon(modelData.wmClass, "terminal")
                color: Appearance.colours.m3onSurfaceVariant
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
