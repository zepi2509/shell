import "root:/widgets"
import "root:/services"
import "root:/config"
import QtQuick.Layouts

StyledText {
    required property int index
    required property bool vertical
    required property bool homogenous
    required property var occupied
    required property int groupOffset

    readonly property bool isWorkspace: true // Flag for finding workspace children

    property int ws: groupOffset + index + 1

    animate: true
    text: ws
    color: BarConfig.workspaces.occupiedBg || occupied[ws] ? Appearance.colours.text : Appearance.colours.subtext0
    horizontalAlignment: StyledText.AlignHCenter

    Layout.preferredWidth: homogenous && !vertical ? BarConfig.sizes.innerHeight : -1
    Layout.preferredHeight: homogenous && vertical ? BarConfig.sizes.innerHeight : -1
}
