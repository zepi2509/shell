pragma Singleton

import Quickshell
import Quickshell.Io
import QtQuick
import Qt.labs.platform

Singleton {
    id: root

    property bool borders: true
    property bool light: false
    readonly property Transparency transparency: Transparency {}
    readonly property Rounding rounding: Rounding {}
    readonly property Spacing spacing: Spacing {}
    readonly property Padding padding: Padding {}
    readonly property Font font: Font {}
    readonly property Anim anim: Anim {}
    readonly property Colours colours: Colours {}

    function alpha(c: color, layer: bool): color {
        if (!transparency.enabled)
            return c;
        c = Qt.rgba(c.r, c.g, c.b, layer ? transparency.layers : transparency.base);
        if (layer)
            c.hsvValue = Math.max(0, Math.min(1, c.hslLightness + (light ? -0.2 : 0.1)));
        return c;
    }

    FileView {
        path: `${StandardPaths.standardLocations(StandardPaths.GenericStateLocation)[0]}/caelestia/scheme/current-mode.txt`
        watchChanges: true
        onFileChanged: this.reload()
        onLoaded: root.light = this.text() === "light"
    }

    FileView {
        readonly property list<string> colourNames: ["rosewater", "flamingo", "pink", "mauve", "red", "maroon", "peach", "yellow", "green", "teal", "sky", "sapphire", "blue", "lavender"]

        path: `${StandardPaths.standardLocations(StandardPaths.GenericStateLocation)[0]}/caelestia/scheme/current.txt`
        watchChanges: true
        onFileChanged: this.reload()
        onLoaded: {
            const contents = this.text();
            const colours = root.colours;

            for (const line of contents.split("\n")) {
                let [name, colour] = line.split(" ");
                name = name.trim();
                name = colourNames.includes(name) ? name : `m3${name}`;
                if (colours.hasOwnProperty(name))
                    colours[name] = `#${colour.trim()}`;
            }
        }
    }

    component Transparency: QtObject {
        readonly property bool enabled: true
        readonly property real base: 0.78
        readonly property real layers: 0.58
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
        property color m3primary_paletteKeyColor: "#7870AB"
        property color m3secondary_paletteKeyColor: "#78748A"
        property color m3tertiary_paletteKeyColor: "#976A7D"
        property color m3neutral_paletteKeyColor: "#79767D"
        property color m3neutral_variant_paletteKeyColor: "#797680"
        property color m3background: "#141318"
        property color m3onBackground: "#E5E1E9"
        property color m3surface: "#141318"
        property color m3surfaceDim: "#141318"
        property color m3surfaceBright: "#3A383E"
        property color m3surfaceContainerLowest: "#0E0D13"
        property color m3surfaceContainerLow: "#1C1B20"
        property color m3surfaceContainer: "#201F25"
        property color m3surfaceContainerHigh: "#2B292F"
        property color m3surfaceContainerHighest: "#35343A"
        property color m3onSurface: "#E5E1E9"
        property color m3surfaceVariant: "#48454E"
        property color m3onSurfaceVariant: "#C9C5D0"
        property color m3inverseSurface: "#E5E1E9"
        property color m3inverseOnSurface: "#312F36"
        property color m3outline: "#938F99"
        property color m3outlineVariant: "#48454E"
        property color m3shadow: "#000000"
        property color m3scrim: "#000000"
        property color m3surfaceTint: "#C8BFFF"
        property color m3primary: "#C8BFFF"
        property color m3onPrimary: "#30285F"
        property color m3primaryContainer: "#473F77"
        property color m3onPrimaryContainer: "#E5DEFF"
        property color m3inversePrimary: "#5F5791"
        property color m3secondary: "#C9C3DC"
        property color m3onSecondary: "#312E41"
        property color m3secondaryContainer: "#484459"
        property color m3onSecondaryContainer: "#E5DFF9"
        property color m3tertiary: "#ECB8CD"
        property color m3onTertiary: "#482536"
        property color m3tertiaryContainer: "#B38397"
        property color m3onTertiaryContainer: "#000000"
        property color m3error: "#EA8DC1"
        property color m3onError: "#690005"
        property color m3errorContainer: "#93000A"
        property color m3onErrorContainer: "#FFDAD6"
        property color m3primaryFixed: "#E5DEFF"
        property color m3primaryFixedDim: "#C8BFFF"
        property color m3onPrimaryFixed: "#1B1149"
        property color m3onPrimaryFixedVariant: "#473F77"
        property color m3secondaryFixed: "#E5DFF9"
        property color m3secondaryFixedDim: "#C9C3DC"
        property color m3onSecondaryFixed: "#1C192B"
        property color m3onSecondaryFixedVariant: "#484459"
        property color m3tertiaryFixed: "#FFD8E7"
        property color m3tertiaryFixedDim: "#ECB8CD"
        property color m3onTertiaryFixed: "#301121"
        property color m3onTertiaryFixedVariant: "#613B4C"

        property color rosewater: "#B8C4FF"
        property color flamingo: "#DBB9F8"
        property color pink: "#F3B3E3"
        property color mauve: "#D0BDFE"
        property color red: "#F8B3D1"
        property color maroon: "#F6B2DA"
        property color peach: "#E4B7F4"
        property color yellow: "#C3C0FF"
        property color green: "#ADC6FF"
        property color teal: "#D4BBFC"
        property color sky: "#CBBEFF"
        property color sapphire: "#BDC2FF"
        property color blue: "#C7BFFF"
        property color lavender: "#EAB5ED"
    }
}
