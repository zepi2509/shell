import "root:/config"
import Quickshell
import Quickshell.Widgets
import Quickshell.Services.SystemTray
import QtQuick
import Qt5Compat.GraphicalEffects

MouseArea {
    id: root

    required property SystemTrayItem modelData
    required property color colour

    acceptedButtons: Qt.LeftButton | Qt.RightButton
    width: Appearance.font.size.smaller * 2
    height: Appearance.font.size.smaller * 2

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
                icon = `file://${path}/${name.slice(name.lastIndexOf("/") + 1)}.png`;
            }
            return icon;
        }
        asynchronous: true
        anchors.fill: parent
    }

    ColorOverlay {
        visible: BarConfig.tray.recolourIcons
        anchors.fill: icon
        source: icon
        color: root.colour

        Behavior on color {
            ColorAnimation {
                duration: Appearance.anim.durations.normal
                easing.type: Easing.BezierSpline
                easing.bezierCurve: Appearance.anim.curves.standard
            }
        }
    }
}
