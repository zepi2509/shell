pragma Singleton

import Quickshell
import QtQuick

Singleton {
    id: root

    property var visibilities: Quickshell.screens.reduce((acc, s) => {
        acc[s] = visibleComp.createObject(root);
        return acc;
    }, {})

    property var positions: ({})
    property int rightExclusion

    signal posChanged(screen: ShellScreen, x: int, y: int)

    function setPosForScreen(screen: ShellScreen, x: int, y: int): void {
        positions[screen] = Qt.point(x, y);
        posChanged(screen, x, y);
    }

    Component {
        id: visibleComp

        QtObject {
            property bool launcher
            property bool osd
            property bool notifs
            property bool session
        }
    }
}
