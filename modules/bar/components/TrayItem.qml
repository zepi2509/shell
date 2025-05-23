pragma ComponentBehavior: Bound

import "root:/widgets"
import "root:/config"
import Quickshell
import Quickshell.Widgets
import Quickshell.Services.SystemTray
import QtQuick
import QtQuick.Effects

MouseArea {
    id: root

    required property SystemTrayItem modelData
    required property color colour

    acceptedButtons: Qt.LeftButton | Qt.RightButton
    implicitWidth: Appearance.font.size.small * 2
    implicitHeight: Appearance.font.size.small * 2

    onClicked: event => {
        if (event.button === Qt.LeftButton)
            modelData.activate();
        else if (modelData.hasMenu)
            menu.open();
    }

    // TODO custom menu
    QsMenuAnchor {
        id: menu

        menu: root.modelData.menu
        anchor.window: this.QsWindow.window
    }

    IconImage {
        id: icon

        visible: !BarConfig.tray.recolourIcons
        source: {
            let icon = root.modelData.icon;
            if (icon.includes("?path=")) {
                const [name, path] = icon.split("?path=");
                icon = `file://${path}/${name.slice(name.lastIndexOf("/") + 1)}`;
            }
            return icon;
        }
        asynchronous: true
        anchors.fill: parent
    }

    Loader {
        anchors.fill: icon
        active: BarConfig.tray.recolourIcons
        asynchronous: true

        sourceComponent: Colouriser {
            source: icon
            colorizationColor: root.colour
        }
    }
}
