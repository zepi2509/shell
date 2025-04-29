import "root:/widgets"
import "root:/services"
import "root:/config"
import QtQuick.Layouts

StyledText {
    required property int index
    required property BoxLayout layout
    required property var occupied
    readonly property bool isWorkspace: true

    text: index + 1
    color: BarConfig.workspaces.occupiedBg || occupied[index + 1] ? Appearance.colours.text : Appearance.colours.subtext0
    horizontalAlignment: StyledText.AlignHCenter

    Layout.preferredWidth: layout.homogenous && !layout.vertical ? layout.height : -1
    Layout.preferredHeight: layout.homogenous && layout.vertical ? layout.width : -1
}
