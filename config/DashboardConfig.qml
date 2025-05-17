pragma Singleton

import Quickshell
import QtQuick

Singleton {
    readonly property Sizes sizes: Sizes {}

    component Sizes: QtObject {
        readonly property int tabIndicatorHeight: 3
        readonly property int tabIndicatorSpacing: 5
        readonly property int infoWidth: 200
        readonly property int infoIconSize: 25
    }
}
