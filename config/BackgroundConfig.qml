pragma Singleton

import Quickshell
import QtQuick

Singleton {
    id: root

    readonly property Border border: Border {}

    component Border: QtObject {
        readonly property bool enabled: false
        readonly property int thickness: Appearance.padding.normal
        readonly property int rounding: Appearance.rounding.large
    }
}
