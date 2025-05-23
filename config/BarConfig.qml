pragma Singleton

import Quickshell
import QtQuick

Singleton {
    id: root

    readonly property Sizes sizes: Sizes {}
    readonly property Workspaces workspaces: Workspaces {}
    readonly property Tray tray: Tray {}

    component Sizes: QtObject {
        property int innerHeight: 30
    }

    component Workspaces: QtObject {
        property int shown: 5
        property bool rounded: true
        property bool activeIndicator: true
        property bool occupiedBg: false
        property bool showWindows: true
        property bool activeTrail: !showWindows // Doesn't work well with variable sized workspaces
        property string label: "  "
        property string occupiedLabel: "󰮯 "
        property string activeLabel: "󰮯 "
    }

    component Tray: QtObject {
        property bool recolourIcons: false
    }
}
