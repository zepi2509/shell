pragma Singleton
pragma ComponentBehavior: Bound

import Quickshell
import QtQuick

Singleton {
    id: root

    property bool vertical: false
    property Preset preset: presets.pills

    readonly property Sizes sizes: Sizes {}
    readonly property Workspaces workspaces: Workspaces {}
    readonly property Tray tray: Tray {}
    readonly property Presets presets: Presets {}

    component Sizes: QtObject {
        readonly property int height: 40
        readonly property int innerHeight: 30
        readonly property int floatingGap: 10
        readonly property int floatingGapLarge: 15
    }

    component Workspaces: QtObject {
        readonly property int shown: 10
        readonly property string style: ""
        readonly property bool occupiedBg: true
        readonly property string label: " "
        readonly property string activeLabel: "󰮯 "
    }

    component Tray: QtObject {
        readonly property bool recolourIcons: false
    }

    component Preset: QtObject {
        required property string name
        required property int totalHeight
    }

    component Presets: QtObject {
        readonly property Preset pills: Preset {
            name: "pills"
            totalHeight: root.sizes.height + root.sizes.floatingGap
        }
    }
}
