import "root:/widgets"
import "root:/services"
import "root:/utils"
import "root:/config"
import Quickshell
import QtQuick
import QtQuick.Controls

StyledRect {
    id: root

    property color colour: Appearance.colours.rosewater

    animate: true
    clip: true

    MaterialIcon {
        id: network

        animate: true
        text: Icons.getNetworkIcon(Network.active?.strength ?? 0)
        color: root.colour

        anchors.horizontalCenter: root.vertical ? parent.horizontalCenter : undefined
    }

    AnchorText {
        id: bluetooth

        prevAnchor: network

        animate: true
        text: Bluetooth.powered ? "bluetooth" : "bluetooth_disabled"
        color: root.colour
        font.family: Appearance.font.family.material
        font.pointSize: Appearance.font.size.larger
    }

    Box {
        anchors.left: vertical ? undefined : bluetooth.right
        anchors.leftMargin: vertical ? 0 : Appearance.padding.smaller
        anchors.top: vertical ? bluetooth.bottom : undefined
        anchors.topMargin: vertical ? Appearance.padding.smaller : 0

        anchors.horizontalCenter: vertical ? bluetooth.horizontalCenter : undefined
        anchors.verticalCenter: vertical ? undefined : bluetooth.verticalCenter

        Repeater {
            model: ScriptModel {
                values: Bluetooth.devices.filter(d => d.connected)
            }

            MaterialIcon {
                required property Bluetooth.Device modelData

                animate: true
                text: Icons.getBluetoothIcon(modelData.icon)
                color: root.colour
            }
        }
    }
}
