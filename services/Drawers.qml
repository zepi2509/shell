pragma Singleton

import Quickshell

Singleton {
    id: root

    property var positions: ({})

    signal posChanged(screen: ShellScreen, x: int, y: int)

    function getPosForScreen(screen: ShellScreen): point {
        return positions[screen] || Qt.point(0, 0);
    }

    function setPosForScreen(screen: ShellScreen, x: int, y: int): void {
        positions[screen] = Qt.point(x, y);
        posChanged(screen, x, y);
    }
}
