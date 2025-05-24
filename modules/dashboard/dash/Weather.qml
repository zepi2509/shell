import "root:/widgets"
import "root:/services"
import "root:/config"
import "root:/utils"
import Quickshell.Io
import QtQuick

Item {
    id: root

    property string icon
    property string description
    property real temperature

    anchors.centerIn: parent

    implicitWidth: icon.implicitWidth + info.implicitWidth + info.anchors.leftMargin

    onVisibleChanged: wttrProc.running = true

    Process {
        id: wttrProc

        running: true
        command: ["fish", "-c", `curl "https://wttr.in/$(curl ipinfo.io | jq -r '.city' | string replace ' ' '%20')?format=j1" | jq -c '.current_condition[0] | {code: .weatherCode, desc: .weatherDesc[0].value, temp: .temp_C}'`]
        stdout: SplitParser {
            onRead: data => {
                const json = JSON.parse(data);
                root.icon = Icons.getWeatherIcon(json.code);
                root.description = json.desc;
                root.temperature = parseFloat(json.temp);
            }
        }
    }

    MaterialIcon {
        id: icon

        anchors.verticalCenter: parent.verticalCenter
        anchors.left: parent.left

        animate: true
        text: root.icon || "cloud_alert"
        color: Colours.palette.m3secondary
        font.pointSize: Appearance.font.size.extraLarge * 2
        font.variableAxes: ({
                opsz: Appearance.font.size.extraLarge * 1.2
            })
    }

    Column {
        id: info

        anchors.verticalCenter: parent.verticalCenter
        anchors.left: icon.right
        anchors.leftMargin: Appearance.spacing.large

        spacing: Appearance.spacing.small

        StyledText {
            anchors.horizontalCenter: parent.horizontalCenter

            animate: true
            text: `${root.temperature}°C`
            color: Colours.palette.m3primary
            font.pointSize: Appearance.font.size.extraLarge
            font.weight: 500
        }

        StyledText {
            anchors.horizontalCenter: parent.horizontalCenter

            animate: true
            text: root.description || qsTr("No weather")

            elide: Text.ElideRight
            width: Math.min(implicitWidth, root.parent.width - icon.implicitWidth - info.anchors.leftMargin - Appearance.padding.large * 2)
        }
    }
}
