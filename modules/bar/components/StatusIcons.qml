import "root:/widgets"
import "root:/services"
import "root:/utils"
import "root:/config"
import Quickshell
import Quickshell.Services.UPower
import QtQuick

Item {
    id: root

    readonly property bool vertical: parent?.vertical ?? false
    property color colour: Colours.palette.m3secondary

    clip: true
    implicitWidth: vertical ? Math.max(network.implicitWidth, bluetooth.implicitWidth, devices.implicitWidth, battery.implicitWidth) : network.implicitWidth + bluetooth.implicitWidth + bluetooth.anchors.leftMargin + (repeater.count > 0 ? devices.implicitWidth + devices.anchors.leftMargin : 0) + (battery.active ? battery.implicitWidth + battery.anchors.leftMargin : 0)
    implicitHeight: vertical ? network.implicitHeight + bluetooth.implicitHeight + bluetooth.anchors.topMargin + (repeater.count > 0 ? devices.implicitHeight + devices.anchors.topMargin : 0) + (battery.active ? battery.implicitHeight + battery.anchors.topMargin : 0) : Math.max(network.implicitHeight, bluetooth.implicitHeight, devices.implicitHeight, battery.implicitHeight)

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

    Loader {
        id: battery

        anchors.left: root.vertical ? undefined : repeater.count > 0 ? devices.right : bluetooth.right
        anchors.leftMargin: root.vertical ? 0 : Appearance.padding.smaller
        anchors.top: root.vertical ? repeater.count > 0 ? devices.bottom : bluetooth.bottom : undefined
        anchors.topMargin: root.vertical ? Appearance.padding.smaller : 0

        anchors.horizontalCenter: root.vertical ? devices.horizontalCenter : undefined
        anchors.verticalCenter: root.vertical ? undefined : devices.verticalCenter

        active: UPower.displayDevice.isLaptopBattery
        asynchronous: true

        sourceComponent: MaterialIcon {
            text: {
                const device = UPower.displayDevice;
                const perc = device.percentage;
                const charging = device.changeRate >= 0;
                if (perc === 1)
                    return charging ? "battery_charging_full" : "battery_full";
                let level = Math.floor(perc * 7);
                if (charging && (level === 4 || level === 1))
                    level--;
                return charging ? `battery_charging_${(level + 3) * 10}` : `battery_${level}_bar`;
            }
            color: UPower.displayDevice.percentage > 0.2 ? root.colour : Colours.palette.m3error
            fill: 1
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
