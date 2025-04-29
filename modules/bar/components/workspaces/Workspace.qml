import "root:/widgets"
import "root:/services"
import "root:/config"
import QtQuick.Layouts

StyledText {
    required property int index
    required property bool vertical
    required property bool homogenous
    required property var occupied

    readonly property bool isWorkspace: true // Flag for finding workspace children

    text: index + 1
    color: BarConfig.workspaces.occupiedBg || occupied[index + 1] ? Appearance.colours.text : Appearance.colours.subtext0
    horizontalAlignment: StyledText.AlignHCenter

    Layout.preferredWidth: homogenous && !vertical ? BarConfig.sizes.innerHeight : -1
    Layout.preferredHeight: homogenous && vertical ? BarConfig.sizes.innerHeight : -1
}
