pragma Singleton

import Quickshell

Singleton {
    id: root

    property var positions: ({})
    property int rightExclusion

    signal posChanged(screen: ShellScreen, x: int, y: int)

    function setPosForScreen(screen: ShellScreen, x: int, y: int): void {
        positions[screen] = Qt.point(x, y);
        posChanged(screen, x, y);
    }
}
