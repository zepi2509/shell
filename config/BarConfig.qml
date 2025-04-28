pragma Singleton

import Quickshell
import QtQuick

Singleton {
    property bool vertical: false

    readonly property QtObject workspaces: QtObject {
        property int shown: 10
        property string style: ""
        property bool occupiedBg: false
    }
}
