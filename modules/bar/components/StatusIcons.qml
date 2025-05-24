import "root:/widgets"
import "root:/services"
import "root:/utils"
import "root:/config"
import Quickshell
import QtQuick

Item {
    id: root

    readonly property bool vertical: parent?.vertical ?? false
    property color colour: Colours.palette.m3secondary

    clip: true
    implicitWidth: vertical ? Math.max(network.implicitWidth, bluetooth.implicitWidth, devices.implicitWidth) : network.implicitWidth + bluetooth.implicitWidth + bluetooth.anchors.leftMargin + (repeater.count > 0 ? devices.implicitWidth + devices.anchors.leftMargin : 0)
    implicitHeight: vertical ? network.implicitHeight + bluetooth.implicitHeight + bluetooth.anchors.topMargin + (repeater.count > 0 ? devices.implicitHeight + devices.anchors.topMargin : 0) : Math.max(network.implicitHeight, bluetooth.implicitHeight, devices.implicitHeight)

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
        id: devices

        anchors.left: vertical ? undefined : bluetooth.right
        anchors.leftMargin: vertical ? 0 : Appearance.padding.smaller
        anchors.top: vertical ? bluetooth.bottom : undefined
        anchors.topMargin: vertical ? Appearance.padding.smaller : 0

        anchors.horizontalCenter: vertical ? bluetooth.horizontalCenter : undefined
        anchors.verticalCenter: vertical ? undefined : bluetooth.verticalCenter

        Repeater {
            id: repeater

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

    Behavior on implicitWidth {
        NumberAnimation {
            duration: Appearance.anim.durations.normal
            easing.type: Easing.BezierSpline
            easing.bezierCurve: Appearance.anim.curves.emphasized
        }
    }

    Behavior on implicitHeight {
        NumberAnimation {
            duration: Appearance.anim.durations.normal
            easing.type: Easing.BezierSpline
            easing.bezierCurve: Appearance.anim.curves.emphasized
        }
    }
}
