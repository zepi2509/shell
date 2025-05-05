pragma Singleton
pragma ComponentBehavior: Bound

import Quickshell
import QtQuick

Singleton {
    id: root

    property bool vertical: true
    property Preset preset: presets.pills

    readonly property Sizes sizes: preset.sizes
    readonly property Workspaces workspaces: preset.workspaces
    readonly property Tray tray: preset.tray
    readonly property Presets presets: Presets {}

    component Sizes: QtObject {
        property int totalHeight: height
        property int height: 40
        property int innerHeight: 30
        property int floatingGap: 15
        property int maxLabelWidth: 600
        property int maxLabelHeight: 400
    }

    component Workspaces: QtObject {
        property int shown: root.vertical ? 5 : 10
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

    component Preset: QtObject {
        required property string name
        property Sizes sizes: Sizes {}
        property Workspaces workspaces: Workspaces {}
        property Tray tray: Tray {}
    }

    component Presets: QtObject {
        readonly property Preset pills: Preset {
            name: "pills"
            sizes: Sizes {
                totalHeight: height + floatingGap
            }
        }
        readonly property Preset panel: Preset {
            name: "panel"
            sizes: Sizes {
                height: 30
            }
            workspaces: Workspaces {
                rounded: false
                showWindows: false
                label: ""
                occupiedLabel: ""
                activeLabel: ""
            }
            tray: Tray {
                recolourIcons: true
            }
        }
    }
}
