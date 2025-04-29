import "root:/widgets"
import "root:/services"
import "root:/utils"
import "root:/config"
import QtQuick

StyledRect {
    id: root

    readonly property color colour: Appearance.colours.rosewater

    MaterialIcon {
        id: icon

        text: Icons.getNetworkIcon(Network.active.strength)
        color: root.colour
    }
}
