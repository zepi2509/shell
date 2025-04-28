pragma Singleton

import Quickshell
import Quickshell.Io
import QtQuick
import Qt.labs.platform

Singleton {
    id: root

    property bool borders: true
    readonly property Transparency transparency: Transparency {}
    readonly property Rounding rounding: Rounding {}
    readonly property Spacing spacing: Spacing {}
    readonly property Padding padding: Padding {}
    readonly property Font font: Font {}
    readonly property Anim anim: Anim {}
    readonly property Colours colours: Colours {}

    function alpha(c: color, layer: bool): color {
        return Qt.rgba(c.r, c.g, c.b, layer ? transparency.layers : transparency.base);
    }

    FileView {
        path: `${StandardPaths.standardLocations(StandardPaths.GenericStateLocation)[0]}/caelestia/scheme/current.txt`
        watchChanges: true
        onFileChanged: this.reload()
        onLoaded: {
            const contents = this.text();

            for (const line of contents.split("\n")) {
                const [name, colour] = line.split(" ");
                root.colours[name.trim()] = `#${colour.trim()}`;
            }
        }
    }

    component Transparency: QtObject {
        readonly property real base: 0.78
        readonly property real layers: 0.5
    }

    component Rounding: QtObject {
        readonly property int small: 12
        readonly property int normal: 17
        readonly property int large: 25
        readonly property int full: 1000
    }

    component Spacing: QtObject {
        readonly property int small: 7
        readonly property int smaller: 10
        readonly property int normal: 12
        readonly property int larger: 15
        readonly property int large: 20
    }

    component Padding: QtObject {
        readonly property int small: 5
        readonly property int smaller: 7
        readonly property int normal: 10
        readonly property int larger: 12
        readonly property int large: 15
    }

    component FontFamily: QtObject {
        readonly property string sans: "IBM Plex Sans"
        readonly property string mono: "JetBrains Mono NF"
        readonly property string material: "Material Symbols Rounded"
    }

    component FontSize: QtObject {
        readonly property int small: 11
        readonly property int smaller: 12
        readonly property int normal: 13
        readonly property int larger: 15
        readonly property int large: 18
    }

    component Font: QtObject {
        readonly property FontFamily family: FontFamily {}
        readonly property FontSize size: FontSize {}
    }

    component AnimCurves: QtObject {
        readonly property list<real> emphasized: [0.05, 0, 2 / 15, 0.06, 1 / 6, 0.4, 5 / 24, 0.82, 0.25, 1, 1, 1]
        readonly property list<real> emphasizedAccel: [0.3, 0, 0.8, 0.15, 1, 1]
        readonly property list<real> emphasizedDecel: [0.05, 0.7, 0.1, 1, 1, 1]
        readonly property list<real> standard: [0.2, 0, 0, 1, 1, 1]
        readonly property list<real> standardAccel: [0.3, 0, 1, 1, 1, 1]
        readonly property list<real> standardDecel: [0, 0, 0, 1, 1, 1]
    }

    component AnimDurations: QtObject {
        readonly property int small: 200
        readonly property int normal: 400
        readonly property int large: 600
        readonly property int extraLarge: 1000
    }

    component Anim: QtObject {
        readonly property AnimCurves curves: AnimCurves {}
        readonly property AnimDurations durations: AnimDurations {}
    }

    component Colours: QtObject {
        property color primary: "#85D2E7"
        property color secondary: "#B2CBD3"
        property color tertiary: "#BFC4EB"
        property color text: "#DEE3E6"
        property color subtext1: "#BFC8CB"
        property color subtext0: "#899295"
        property color overlay2: "#788083"
        property color overlay1: "#666D70"
        property color overlay0: "#555C5E"
        property color surface2: "#434A4D"
        property color surface1: "#32393B"
        property color surface0: "#202628"
        property color base: "#0F1416"
        property color mantle: "#090C0D"
        property color crust: "#050607"
        property color success: "#93E5B6"
        property color error: "#EA8DC1"
        property color rosewater: "#9BD4A1"
        property color flamingo: "#84D5C3"
        property color pink: "#8CD0F1"
        property color mauve: "#91CEF5"
        property color red: "#80D4DC"
        property color maroon: "#85D2E7"
        property color peach: "#80D5D0"
        property color yellow: "#93D5A9"
        property color green: "#8DD5B3"
        property color teal: "#81D3E0"
        property color sky: "#83D2E4"
        property color sapphire: "#8AD1EE"
        property color blue: "#9CCBFA"
        property color lavender: "#86D1EB"
    }
}
