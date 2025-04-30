import "root:/widgets"
import "root:/services"
import "root:/config"
import QtQuick.Layouts

StyledText {
    required property int index
    required property bool vertical
    required property var occupied
    required property int groupOffset

    readonly property bool isWorkspace: true // Flag for finding workspace children

    readonly property int ws: groupOffset + index + 1
    readonly property string label: BarConfig.workspaces.label || ws
    readonly property string activeLabel: BarConfig.workspaces.activeLabel || label

    animate: true
    animateProp: "scale"
    text: (Hyprland.activeWorkspace?.id ?? 1) === ws ? activeLabel : label
    color: BarConfig.workspaces.occupiedBg || occupied[ws] ? Appearance.colours.text : Appearance.colours.subtext0
    horizontalAlignment: StyledText.AlignHCenter

    Layout.minimumWidth: vertical ? -1 : BarConfig.sizes.innerHeight
    Layout.minimumHeight: vertical ? BarConfig.sizes.innerHeight : -1
}
