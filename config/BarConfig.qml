pragma Singleton

import Quickshell
import QtQuick

Singleton {
    property bool vertical: false

    readonly property Sizes sizes: Sizes {}
    readonly property Workspaces workspaces: Workspaces {}

    component Sizes: QtObject {
        readonly property int height: 50
        readonly property int innerHeight: 30
        readonly property int floatingGap: 10
        readonly property int floatingGapLarge: 15
    }

    component Workspaces: QtObject {
        readonly property int shown: 10
        readonly property string style: ""
        readonly property bool occupiedBg: true
    }
}
