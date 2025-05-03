pragma Singleton

import Quickshell
import QtQuick

Singleton {
    readonly property int maxShown: 8
    readonly property string actionPrefix: ">"
    readonly property Sizes sizes: Sizes {}

    component Sizes: QtObject {
        readonly property int width: 600
        readonly property int itemHeight: 57
    }
}
